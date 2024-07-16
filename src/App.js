// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import Auth from './components/Auth';
// import VoiceChat from './components/VoiceChat';
// import AdminPanel from './components/AdminPanel';
// import axios from 'axios';
// import './App.css';

// function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState(localStorage.getItem('token') || '');
//   const [isAdmin, setIsAdmin] = useState(false);

//   useEffect(() => {
//     const storedToken = localStorage.getItem('token');
//     if (storedToken) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
//       fetchUserProfile();
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const fetchUserProfile = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/users/profile');
//       setUser(response.data);
//       setIsAdmin(response.data.isAdmin);
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//       localStorage.removeItem('token');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = (newToken, userData) => {
//     setToken(newToken);
//     axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
//     setUser(userData);
//     setIsAdmin(userData.isAdmin);
//     localStorage.setItem('token', newToken);
//     console.log(token)
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     delete axios.defaults.headers.common['Authorization'];
//     setUser(null);
//     setIsAdmin(false);
//     setToken('');
//   };

//   if (loading) {
//     return <div className="loading">Loading...</div>;
//   }

//   return (
//     <div className="app">
//       <Router>
//         <Routes>
//           <Route path="/" element={user ? <Navigate to="/chat" /> : <Auth onLogin={handleLogin} />} />
//           <Route path="/chat" element={user ? <VoiceChat user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
//           <Route path="/admin" element={isAdmin ? <AdminPanel onLogout={handleLogout} /> : <Navigate to="/" />} />
//         </Routes>
//       </Router>
//     </div>
//   );
// }

// export default App;

// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import VoiceChat from './components/VoiceChat';
import AdminPanel from './components/AdminPanel';
import axios from 'axios';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/profile');
      setUser(response.data);
      setIsAdmin(response.data.isAdmin);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (newToken, userData) => {
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setUser(userData);
    setIsAdmin(userData.isAdmin);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAdmin(false);
    setToken('');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/meeting" /> : <Auth onLogin={handleLogin} />} />
        <Route path="/meeting" element={user ? <VoiceChat user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/admin" element={isAdmin ? <AdminPanel onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
