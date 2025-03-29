import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Telegram WebApp
  useEffect(() => {
    const tg = window.Telegram.WebApp;
    if (tg) {
      tg.ready();
      // If user is authenticated in Telegram
      if (tg.initDataUnsafe?.user) {
        setUser({
          id: tg.initDataUnsafe.user.id,
          username: tg.initDataUnsafe.user.username,
          firstName: tg.initDataUnsafe.user.first_name,
          lastName: tg.initDataUnsafe.user.last_name,
          photoUrl: tg.initDataUnsafe.user.photo_url,
        });
      }
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    setUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 