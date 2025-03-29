import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useTonConnectUI } from '@tonconnect/ui-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import CreateGift from './pages/CreateGift';
import Balance from './pages/Balance';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

function App() {
  const { connected } = useTonConnectUI();

  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route 
              path="/create-gift" 
              element={
                <ProtectedRoute>
                  <CreateGift />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/balance" 
              element={
                <ProtectedRoute>
                  <Balance />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

// Protected route component
function ProtectedRoute({ children }) {
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  return user ? children : null;
}

export default App; 