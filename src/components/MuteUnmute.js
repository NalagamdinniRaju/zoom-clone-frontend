import React from 'react';

function MuteUnmute({ isMuted, toggleMute }) {
  return (
    <button onClick={toggleMute}>
      {isMuted ? 'Unmute' : 'Mute'}
    </button>
  );
}

export default MuteUnmute;