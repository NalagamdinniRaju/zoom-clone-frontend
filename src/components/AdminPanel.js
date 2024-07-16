
// src/components/AdminPanel.js
import React, { useState } from 'react';
import io from 'socket.io-client';
import './AdminPanel.css';

const socket = io('http://localhost:5000');

function AdminPanel({ onLogout }) {
  const [roomId, setRoomId] = useState('');

  const muteAll = () => {
    socket.emit('admin-mute-all', { roomId });
  };

  const unmuteAll = () => {
    socket.emit('admin-unmute-all', { roomId });
  };

  return (
    <div className="admin-panel">
      <input
        type="text"
        value={roomId}
        onChange={e => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
      />
      <button onClick={muteAll}>Mute All</button>
      <button onClick={unmuteAll}>Unmute All</button>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default AdminPanel;
