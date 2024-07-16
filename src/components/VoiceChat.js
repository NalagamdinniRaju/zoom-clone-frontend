// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import Peer from 'simple-peer';
// import socket from '../socket';
// import './VoiceChat.css';

// function VoiceChat({ user, onLogout }) {
//   const [roomId, setRoomId] = useState('');
//   const [peers, setPeers] = useState([]);
//   const [stream, setStream] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState('');
//   const [users, setUsers] = useState([]);
//   const [isMuted, setIsMuted] = useState(true);
//   const [isHandRaised, setIsHandRaised] = useState(false);
  
//   const userVideo = useRef();
//   const peersRef = useRef([]);

//   const handleUserJoined = useCallback(({ users, signals }) => {
//     setUsers(users);
//     signals.forEach(signal => {
//       const peer = addPeer(signal.signal, signal.callerID, stream);
//       peersRef.current.push({
//         peerID: signal.callerID,
//         peer,
//       });
//     });
//     setPeers(peersRef.current);
//   }, [stream]);

//   const handleUserLeft = useCallback((userId) => {
//     setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
//     const peerToRemove = peersRef.current.find(p => p.peerID === userId);
//     if (peerToRemove) {
//       peerToRemove.peer.destroy();
//     }
//     const peers = peersRef.current.filter(p => p.peerID !== userId);
//     peersRef.current = peers;
//     setPeers(peers);
//   }, []);

//   const handleReceivingReturnedSignal = useCallback((payload) => {
//     const item = peersRef.current.find(p => p.peerID === payload.id);
//     item.peer.signal(payload.signal);
//   }, []);

//   const handleNewMessage = useCallback((message) => {
//     setMessages(prevMessages => [...prevMessages, message]);
//   }, []);

//   const handleUserMuted = useCallback(({ id, muted }) => {
//     setUsers(prevUsers => prevUsers.map(u => u.id === id ? { ...u, muted } : u));
//   }, []);

//   const handleUserHandRaised = useCallback(({ id, handRaised }) => {
//     setUsers(prevUsers => prevUsers.map(u => u.id === id ? { ...u, handRaised } : u));
//   }, []);

//   const handleAdminUnmute = useCallback((userId) => {
//     if (userId === socket.id) {
//       setIsMuted(false);
//       stream.getAudioTracks()[0].enabled = true;
//     }
//   }, [stream]);

//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: false, audio: true })
//       .then(stream => {
//         setStream(stream);
//         userVideo.current.srcObject = stream;
//         userVideo.current.muted = true;
//       });

//     socket.on('user-joined', handleUserJoined);
//     socket.on('user-left', handleUserLeft);
//     socket.on('receiving returned signal', handleReceivingReturnedSignal);
//     socket.on('new-message', handleNewMessage);
//     socket.on('user-muted', handleUserMuted);
//     socket.on('user-hand-raised', handleUserHandRaised);
//     socket.on('admin-unmute', handleAdminUnmute);

//     return () => {
//       socket.off('user-joined');
//       socket.off('user-left');
//       socket.off('receiving returned signal');
//       socket.off('new-message');
//       socket.off('user-muted');
//       socket.off('user-hand-raised');
//       socket.off('admin-unmute');
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [handleUserJoined, handleUserLeft, handleReceivingReturnedSignal, handleNewMessage, handleUserMuted, handleUserHandRaised, handleAdminUnmute, stream]);

//   const createPeer = (userToSignal, callerID, stream) => {
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream,
//     });

//     peer.on('signal', signal => {
//       socket.emit('sending signal', { userToSignal, callerID, signal });
//     });

//     return peer;
//   };

//   const addPeer = (incomingSignal, callerID, stream) => {
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream,
//     });

//     peer.on('signal', signal => {
//       socket.emit('returning signal', { signal, callerID });
//     });

//     peer.signal(incomingSignal);

//     return peer;
//   };

//   const joinRoom = () => {
//     if (roomId && stream) {
//       socket.emit('join-room', { roomId, username: user.username });
//     }
//   };

//   const toggleMute = () => {
//     setIsMuted(!isMuted);
//     stream.getAudioTracks()[0].enabled = isMuted;
//     socket.emit('toggle-mute', { roomId, muted: !isMuted });
//   };

//   const toggleHandRaise = () => {
//     setIsHandRaised(!isHandRaised);
//     socket.emit('toggle-hand', { roomId, handRaised: !isHandRaised });
//   };

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (messageInput.trim()) {
//       socket.emit('send-message', { roomId, message: messageInput, username: user.username });
//       setMessageInput('');
//     }
//   };

//   const leaveRoom = () => {
//     socket.emit('leave-room', { roomId });
//     setPeers([]);
//     setUsers([]);
//     setMessages([]);
//     setRoomId('');
//   };

//   return (
//     <div className="voice-chat-container">
//       <h1>Voice Chat Room</h1>
//       <div className="controls">
//         <input
//           type="text"
//           value={roomId}
//           onChange={(e) => setRoomId(e.target.value)}
//           placeholder="Enter Room ID"
//         />
//         <button onClick={joinRoom}>Join Room</button>
//         <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
//         <button onClick={toggleHandRaise} className={isHandRaised ? 'hand-raised' : ''}>
//           {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
//         </button>
//         <button onClick={leaveRoom}>Leave Room</button>
//         <button onClick={onLogout}>Logout</button>
//       </div>
//       <div className="video-container">
//         <video ref={userVideo} autoPlay playsInline muted />
//       </div>
//       <div className="users-list">
//         <h2>Users in Room</h2>
//         <ul>
//           {users.map((user, index) => (
//             <li key={index}>
//               {user.username}
//               {user.muted && <span className="muted-icon">🔇</span>}
//               {user.handRaised && <span className="hand-raised-icon">✋</span>}
//             </li>
//           ))}
//         </ul>
//       </div>
//       <div className="chat-container">
//         <div className="messages">
//           {messages.map((message, index) => (
//             <div key={index} className="message">
//               <strong>{message.username}:</strong> {message.message}
//             </div>
//           ))}
//         </div>
//         <form onSubmit={sendMessage}>
//           <input
//             type="text"
//             value={messageInput}
//             onChange={(e) => setMessageInput(e.target.value)}
//             placeholder="Type a message"
//           />
//           <button type="submit">Send</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default VoiceChat;
// .................................................................correct code.................................................//
// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import Peer from 'simple-peer';
// import socket from '../socket';
// import './VoiceChat.css';

// function VoiceChat({ user, onLogout }) {
//   const [roomId, setRoomId] = useState('');
//   const [peers, setPeers] = useState([]);
//   const [stream, setStream] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState('');
//   const [users, setUsers] = useState([]);
//   const [isMuted, setIsMuted] = useState(true);
//   const [isHandRaised, setIsHandRaised] = useState(false);
  
//   const userVideo = useRef();
//   const peersRef = useRef([]);

//   const handleUserJoined = useCallback(({ users, signals }) => {
//     if (users && signals) {
//       setUsers(users);
//       signals.forEach(signal => {
//         if (stream) {
//           const peer = addPeer(signal.signal, signal.callerID, stream);
//           peersRef.current.push({
//             peerID: signal.callerID,
//             peer,
//           });
//         }
//       });
//       setPeers(peersRef.current);
//     }
//   }, [stream]);

//   const handleUserLeft = useCallback((userId) => {
//     setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
//     const peerToRemove = peersRef.current.find(p => p.peerID === userId);
//     if (peerToRemove) {
//       peerToRemove.peer.destroy();
//     }
//     const peers = peersRef.current.filter(p => p.peerID !== userId);
//     peersRef.current = peers;
//     setPeers(peers);
//   }, []);

//   const handleReceivingReturnedSignal = useCallback((payload) => {
//     const item = peersRef.current.find(p => p.peerID === payload.id);
//     if (item) {
//       item.peer.signal(payload.signal);
//     }
//   }, []);

//   const handleNewMessage = useCallback((message) => {
//     setMessages(prevMessages => [...prevMessages, message]);
//   }, []);

//   const handleUserMuted = useCallback(({ id, muted }) => {
//     setUsers(prevUsers => prevUsers.map(u => u.id === id ? { ...u, muted } : u));
//   }, []);

//   const handleUserHandRaised = useCallback(({ id, handRaised }) => {
//     setUsers(prevUsers => prevUsers.map(u => u.id === id ? { ...u, handRaised } : u));
//   }, []);

//   const handleAdminUnmute = useCallback((userId) => {
//     if (userId === socket.id && stream) {
//       setIsMuted(false);
//       stream.getAudioTracks()[0].enabled = true;
//     }
//   }, [stream]);

//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: false, audio: true })
//       .then(stream => {
//         setStream(stream);
//         if (userVideo.current) {
//           userVideo.current.srcObject = stream;
//         }
//       })
//       .catch(error => console.error('Error accessing media devices:', error));

//     socket.on('user-joined', handleUserJoined);
//     socket.on('user-left', handleUserLeft);
//     socket.on('receiving returned signal', handleReceivingReturnedSignal);
//     socket.on('new-message', handleNewMessage);
//     socket.on('user-muted', handleUserMuted);
//     socket.on('user-hand-raised', handleUserHandRaised);
//     socket.on('admin-unmute', handleAdminUnmute);

//     return () => {
//       socket.off('user-joined');
//       socket.off('user-left');
//       socket.off('receiving returned signal');
//       socket.off('new-message');
//       socket.off('user-muted');
//       socket.off('user-hand-raised');
//       socket.off('admin-unmute');
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [handleUserJoined, handleUserLeft, handleReceivingReturnedSignal, handleNewMessage, handleUserMuted, handleUserHandRaised, handleAdminUnmute]);

//   const createPeer = (userToSignal, callerID, stream) => {
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream,
//     });

//     peer.on('signal', signal => {
//       socket.emit('sending signal', { userToSignal, callerID, signal });
//     });

//     return peer;
//   };

//   const addPeer = (incomingSignal, callerID, stream) => {
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream,
//     });

//     peer.on('signal', signal => {
//       socket.emit('returning signal', { signal, callerID });
//     });

//     peer.signal(incomingSignal);

//     return peer;
//   };

//   const joinRoom = () => {
//     if (roomId && stream) {
//       socket.emit('join-room', { roomId, username: user.username });
//     }
//   };

//   const toggleMute = () => {
//     if (stream) {
//       setIsMuted(!isMuted);
//       stream.getAudioTracks()[0].enabled = isMuted;
//       socket.emit('toggle-mute', { roomId, muted: !isMuted });
//     }
//   };

//   const toggleHandRaise = () => {
//     setIsHandRaised(!isHandRaised);
//     socket.emit('toggle-hand', { roomId, handRaised: !isHandRaised });
//   };

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (messageInput.trim()) {
//       socket.emit('send-message', { roomId, message: messageInput, username: user.username });
//       setMessageInput('');
//     }
//   };

//   const leaveRoom = () => {
//     socket.emit('leave-room', { roomId });
//     setPeers([]);
//     setUsers([]);
//     setMessages([]);
//     setRoomId('');
//   };

//   return (
//     <div className="voice-chat-container">
//       <h1>Voice Chat Room</h1>
//       <div className="controls">
//         <input
//           type="text"
//           value={roomId}
//           onChange={(e) => setRoomId(e.target.value)}
//           placeholder="Enter Room ID"
//         />
//         <button onClick={joinRoom}>Join Room</button>
//         <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
//         <button onClick={toggleHandRaise} className={isHandRaised ? 'hand-raised' : ''}>
//           {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
//         </button>
//         <button onClick={leaveRoom}>Leave Room</button>
//         <button onClick={onLogout}>Logout</button>
//       </div>
//       <div className="video-container">
//         <video ref={userVideo} autoPlay playsInline muted />
//       </div>
//       <div className="users-list">
//         <h2>Users in Room</h2>
//         <ul>
//           {users.map((user, index) => (
//             <li key={index}>
//               {user.username}
//               {user.muted && <span className="muted-icon">🔇</span>}
//               {user.handRaised && <span className="hand-raised-icon">✋</span>}
//             </li>
//           ))}
//         </ul>
//       </div>
//       <div className="chat-container">
//         <div className="messages">
//           {messages.map((message, index) => (
//             <div key={index} className="message">
//               <strong>{message.username}:</strong> {message.message}
//             </div>
//           ))}
//         </div>
//         <form onSubmit={sendMessage}>
//           <input
//             type="text"
//             value={messageInput}
//             onChange={(e) => setMessageInput(e.target.value)}
//             placeholder="Type a message"
//           />
//           <button type="submit">Send</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default VoiceChat;
//////////////////////////////ABOVE IS THE CORRECT CODE///////////////////

// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import Peer from 'simple-peer';
// import socket from '../socket';
// import './VoiceChat.css';

// function VoiceChat({ user, onLogout }) {
//   const [roomId, setRoomId] = useState('');
//   const [peers, setPeers] = useState([]);
//   const [stream, setStream] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState('');
//   const [users, setUsers] = useState([]);
//   const [isMuted, setIsMuted] = useState(true);
//   const [isHandRaised, setIsHandRaised] = useState(false);
  
//   const userVideo = useRef();
//   const peersRef = useRef([]);

//   const handleUserJoined = useCallback(({ users, signals }) => {
//     if (users && signals) {
//       setUsers(users);
//       signals.forEach(signal => {
//         if (stream) {
//           const peer = addPeer(signal.signal, signal.callerID, stream);
//           peersRef.current.push({
//             peerID: signal.callerID,
//             peer,
//           });
//         }
//       });
//       setPeers(peersRef.current);
//     }
//   }, [stream]);

//   const handleUserLeft = useCallback((userId) => {
//     setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
//     const peerToRemove = peersRef.current.find(p => p.peerID === userId);
//     if (peerToRemove) {
//       peerToRemove.peer.destroy();
//     }
//     const peers = peersRef.current.filter(p => p.peerID !== userId);
//     peersRef.current = peers;
//     setPeers(peers);
//   }, []);

//   const handleReceivingReturnedSignal = useCallback((payload) => {
//     const item = peersRef.current.find(p => p.peerID === payload.id);
//     if (item) {
//       item.peer.signal(payload.signal);
//     }
//   }, []);

//   const handleNewMessage = useCallback((message) => {
//     setMessages(prevMessages => [...prevMessages, message]);
//   }, []);

//   const handleUserMuted = useCallback(({ id, muted }) => {
//     setUsers(prevUsers => prevUsers.map(u => u.id === id ? { ...u, muted } : u));
//   }, []);

//   const handleUserHandRaised = useCallback(({ id, handRaised }) => {
//     setUsers(prevUsers => prevUsers.map(u => u.id === id ? { ...u, handRaised } : u));
//   }, []);

//   const handleAdminUnmute = useCallback((userId) => {
//     if (userId === socket.id && stream) {
//       setIsMuted(false);
//       stream.getAudioTracks()[0].enabled = true;
//     }
//   }, [stream]);

//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: false, audio: true })
//       .then(stream => {
//         setStream(stream);
//         if (userVideo.current) {
//           userVideo.current.srcObject = stream;
//         }
//       })
//       .catch(error => console.error('Error accessing media devices:', error));

//     socket.on('user-joined', handleUserJoined);
//     socket.on('user-left', handleUserLeft);
//     socket.on('receiving returned signal', handleReceivingReturnedSignal);
//     socket.on('new-message', handleNewMessage);
//     socket.on('user-muted', handleUserMuted);
//     socket.on('user-hand-raised', handleUserHandRaised);
//     socket.on('admin-unmute', handleAdminUnmute);

//     return () => {
//       socket.off('user-joined');
//       socket.off('user-left');
//       socket.off('receiving returned signal');
//       socket.off('new-message');
//       socket.off('user-muted');
//       socket.off('user-hand-raised');
//       socket.off('admin-unmute');
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [handleUserJoined, handleUserLeft, handleReceivingReturnedSignal, handleNewMessage, handleUserMuted, handleUserHandRaised, handleAdminUnmute]);

//   const createPeer = (userToSignal, callerID, stream) => {
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream,
//     });

//     peer.on('signal', signal => {
//       socket.emit('sending signal', { userToSignal, callerID, signal });
//     });

//     return peer;
//   };

//   const addPeer = (incomingSignal, callerID, stream) => {
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream,
//     });

//     peer.on('signal', signal => {
//       socket.emit('returning signal', { signal, callerID });
//     });

//     peer.signal(incomingSignal);

//     return peer;
//   };

//   const joinRoom = () => {
//     if (roomId && stream) {
//       socket.emit('join-room', { roomId, username: user.username });
//     }
//   };

//   const toggleMute = () => {
//     if (stream) {
//       setIsMuted(!isMuted);
//       stream.getAudioTracks()[0].enabled = isMuted;
//       socket.emit('toggle-mute', { roomId, muted: !isMuted });
//     }
//   };

//   const toggleHandRaise = () => {
//     setIsHandRaised(!isHandRaised);
//     socket.emit('toggle-hand', { roomId, handRaised: !isHandRaised });
//   };

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (messageInput.trim()) {
//       socket.emit('send-message', { roomId, message: messageInput, username: user.username });
//       setMessageInput('');
//     }
//   };

//   const leaveRoom = () => {
//     socket.emit('leave-room', { roomId });
//     setPeers([]);
//     setUsers([]);
//     setMessages([]);
//     setRoomId('');
//   };

//   return (
//     <div className="voice-chat-container">
//       <h1>Voice Chat Room</h1>
//       <div className="controls">
//         <input
//           type="text"
//           value={roomId}
//           onChange={(e) => setRoomId(e.target.value)}
//           placeholder="Enter Room ID"
//         />
//         <button onClick={joinRoom}>Join Room</button>
//         <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
//         <button onClick={toggleHandRaise} className={isHandRaised ? 'hand-raised' : ''}>
//           {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
//         </button>
//         <button onClick={leaveRoom}>Leave Room</button>
//         <button onClick={onLogout}>Logout</button>
//       </div>
//       <div className="video-container">
//         <video ref={userVideo} autoPlay playsInline muted />
//       </div>
//       <div className="users-list">
//         <h2>Users in Room</h2>
//         <ul>
//           {users.map((user, index) => (
//             <li key={index}>
//               {user.username}
//               {user.muted && <span className="muted-icon">🔇</span>}
//               {user.handRaised && <span className="hand-raised-icon">✋</span>}
//             </li>
//           ))}
//         </ul>
//       </div>
//       <div className="chat-container">
//         <div className="messages">
//           {messages.map((message, index) => (
//             <div key={index} className="message">
//               <strong>{message.username}:</strong> {message.message}
//             </div>
//           ))}
//         </div>
//         <form onSubmit={sendMessage}>
//           <input
//             type="text"
//             value={messageInput}
//             onChange={(e) => setMessageInput(e.target.value)}
//             placeholder="Type a message"
//           />
//           <button type="submit">Send</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default VoiceChat;

// src/components/VoiceChat.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import './VoiceChat.css';

const socket = io('http://localhost:5000');

function VoiceChat({ user, onLogout }) {
  const [roomId, setRoomId] = useState('');
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [users, setUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  const userVideo = useRef();
  const peersRef = useRef([]);

  const handleUserJoined = useCallback((users) => {
    setUsers(users);
    users.forEach(({ id, username, isAdmin }) => {
      if (id !== socket.id && stream) {
        const peer = createPeer(id, socket.id, stream);
        peersRef.current.push({
          peerID: id,
          peer,
          username,
          isAdmin,
        });
        setPeers((prevPeers) => [...prevPeers, peer]);
      }
    });
  }, [stream]);

  const handleUserLeft = useCallback((userId) => {
    const remainingUsers = users.filter(user => user.id !== userId);
    setUsers(remainingUsers);

    const peerToRemove = peersRef.current.find(p => p.peerID === userId);
    if (peerToRemove) {
      peerToRemove.peer.destroy();
    }
    const peers = peersRef.current.filter(p => p.peerID !== userId);
    peersRef.current = peers;
    setPeers(peers);
  }, [users]);

  useEffect(() => {
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('new-message', handleIncomingMessage);
    socket.on('user-muted', handleUserMuted);
    socket.on('user-video-toggle', handleUserVideoToggle);
    socket.on('user-hand-raised', handleUserHandRaised);
    socket.on('all-users-muted', handleAllUsersMuted);
    socket.on('all-users-unmuted', handleAllUsersUnmuted);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('new-message', handleIncomingMessage);
      socket.off('user-muted', handleUserMuted);
      socket.off('user-video-toggle', handleUserVideoToggle);
      socket.off('user-hand-raised', handleUserHandRaised);
      socket.off('all-users-muted', handleAllUsersMuted);
      socket.off('all-users-unmuted', handleAllUsersUnmuted);
    };
  }, [handleUserJoined, handleUserLeft]);

  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socket.emit('sending-signal', { userToSignal, callerID, signal });
    });

    return peer;
  };


  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socket.emit('returning-signal', { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  };

  const joinRoom = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      userVideo.current.srcObject = stream;
      socket.emit('join-room', { roomId, username: user.name, isAdmin: user.isAdmin });
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    stream.getAudioTracks()[0].enabled = !isMuted;
    socket.emit('toggle-mute', { roomId, muted: !isMuted });
  };

  const toggleHand = () => {
    setIsHandRaised(!isHandRaised);
    socket.emit('toggle-hand', { roomId, handRaised: !isHandRaised });
  };

  const sendMessage = () => {
    socket.emit('send-message', { roomId, message: messageInput, username: user.name });
    setMessageInput('');
  };

  const handleIncomingMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  const handleUserMuted = ({ id, muted }) => {
    const updatedUsers = users.map(user => user.id === id ? { ...user, muted } : user);
    setUsers(updatedUsers);
  };

  const handleUserVideoToggle = ({ id, videoOn }) => {
    const updatedUsers = users.map(user => user.id === id ? { ...user, videoOn } : user);
    setUsers(updatedUsers);
  };

  const handleUserHandRaised = ({ id, handRaised }) => {
    const updatedUsers = users.map(user => user.id === id ? { ...user, handRaised } : user);
    setUsers(updatedUsers);
  };

  const handleAllUsersMuted = () => {
    const updatedUsers = users.map(user => ({ ...user, muted: true }));
    setUsers(updatedUsers);
  };

  const handleAllUsersUnmuted = () => {
    const updatedUsers = users.map(user => ({ ...user, muted: false }));
    setUsers(updatedUsers);
  };

  return (
    <div className="voice-chat">
      <div className="video-container">
        <video muted ref={userVideo} autoPlay playsInline />
        {peers.map((peer, index) => (
          <Video key={index} peer={peer} />
        ))}
      </div>
      <div className="controls">
        <input
          type="text"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
        />
        <button onClick={joinRoom}>Join Room</button>
        <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
        <button onClick={toggleHand}>{isHandRaised ? 'Lower Hand' : 'Raise Hand'}</button>
        <button onClick={onLogout}>Logout</button>
      </div>
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              {
                console.log(msg)
              }
              <strong>{msg.id}: </strong>{msg.message}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

function Video({ peer }) {
  const ref = useRef();

  useEffect(() => {
    peer.on('stream', stream => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return <video ref={ref} autoPlay playsInline />;
}

export default VoiceChat;
