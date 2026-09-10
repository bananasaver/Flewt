import { createContext, useContext, useState, useCallback } from 'react';
import { apiPost, apiGet } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('flewt_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('flewt_user');
    return raw ? JSON.parse(raw) : null;
  });

  const persist = (t, u) => {
    localStorage.setItem('flewt_token', t);
    localStorage.setItem('flewt_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const signup = useCallback(async (email, password) => {
    const data = await apiPost('/auth/signup', { email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiPost('/auth/login', { email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('flewt_token')) return;
    const data = await apiGet('/auth/me');
    localStorage.setItem('flewt_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  // Testing-only: flips the current account's plan without Stripe. Requires the
  // ADMIN_TEST_SECRET set in backend/.env — see Dashboard's "Testing" panel.
  const setPlanForTesting = useCallback(async (plan, secret) => {
    const res = await fetch(`/api/auth/dev-set-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('flewt_token')}`,
        'x-admin-secret': secret,
      },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not switch plan.');
    persist(data.token, data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('flewt_token');
    localStorage.removeItem('flewt_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, signup, login, logout, refreshUser, setPlanForTesting }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
