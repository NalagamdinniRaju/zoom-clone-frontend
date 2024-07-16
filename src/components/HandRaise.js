// import React from 'react';
// import React, { useState } from 'react';
// import socket from '../socket';

// const HandRaise = ({ userId }) => {
//     const [isHandRaised, setIsHandRaised] = useState(false);

//     const toggleHand = () => {
//         if (isHandRaised) {
//             socket.emit('hand-lowered', userId);
//         } else {
//             socket.emit('hand-raised', userId);
//         }
//         setIsHandRaised(!isHandRaised);
//     };

//     return (
//         <button onClick={toggleHand}>
//             {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
//         </button>
//     );
// };

// export default HandRaise;
import React from 'react';

function HandRaise({ isHandRaised, toggleHandRaise }) {
  return (
    <button onClick={toggleHandRaise}>
      {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
    </button>
  );
}

export default HandRaise;