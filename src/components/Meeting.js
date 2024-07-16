
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const Meeting = () => {
  const { roomId } = useParams();
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const videoRef = useRef();

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    const username = localStorage.getItem('username');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);

    newSocket.emit('join-room', { roomId, username, isAdmin: adminStatus });

    newSocket.on('user-joined', (users) => {
      setParticipants(users);
    });

    newSocket.on('user-left', (userId) => {
      setParticipants(prev => prev.filter(p => p.id !== userId));
    });

    newSocket.on('user-muted', ({ id, muted }) => {
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, muted } : p));
    });

    newSocket.on('user-video-toggle', ({ id, videoOn }) => {
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, videoOn } : p));
    });

    newSocket.on('user-hand-raised', ({ id, handRaised }) => {
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, handRaised } : p));
    });

    newSocket.on('all-users-muted', () => {
      setMuted(true);
      setParticipants(prev => prev.map(p => ({ ...p, muted: true })));
    });

    newSocket.on('all-users-unmuted', () => {
      setMuted(false);
      setParticipants(prev => prev.map(p => ({ ...p, muted: false })));
    });

    return () => {
      newSocket.emit('leave-room', { roomId });
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          videoRef.current.srcObject = stream;
        })
        .catch(err => console.error('Error accessing media devices:', err));
    }
  }, []);

  const toggleMute = () => {
    setMuted(!muted);
    socket.emit('toggle-mute', { roomId, muted: !muted });
  };

  const toggleVideo = () => {
    setVideoOn(!videoOn);
    socket.emit('toggle-video', { roomId, videoOn: !videoOn });
  };

  const toggleHand = () => {
    setHandRaised(!handRaised);
    socket.emit('toggle-hand', { roomId, handRaised: !handRaised });
  };

  const muteAll = () => {
    socket.emit('admin-mute-all', { roomId });
  };

  const unmuteAll = () => {
    socket.emit('admin-unmute-all', { roomId });
  };

  return (
    <div className="meeting">
      <h2>Meeting Room: {roomId}</h2>
      <div className="video-grid">
        <video ref={videoRef} autoPlay muted={muted} style={{ display: videoOn ? 'block' : 'none' }} />
        {participants.map(participant => (
          <div key={participant.id} className="participant">
            <video autoPlay muted={participant.muted} style={{ display: participant.videoOn ? 'block' : 'none' }} />
            <p>{participant.username} {participant.handRaised && '✋'}</p>
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
        <button onClick={toggleVideo}>{videoOn ? 'Turn Off Video' : 'Turn On Video'}</button>
        <button onClick={toggleHand}>{handRaised ? 'Lower Hand' : 'Raise Hand'}</button>
        {isAdmin && (
          <>
            <button onClick={muteAll}>Mute All</button>
            <button onClick={unmuteAll}>Unmute All</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Meeting;