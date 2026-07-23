import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

/**
 * Authentication Context
 * 
 * Provides actual backend auth state management connected to Spring Boot.
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const sessionUser = sessionStorage.getItem('researchsphere_user');
      if (sessionUser) return JSON.parse(sessionUser);
      const localUser = localStorage.getItem('researchsphere_user');
      if (localUser) return JSON.parse(localUser);
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  /**
   * Login function calling Spring Boot backend POST /api/auth/login
   */
  const login = useCallback(async (email, password, rememberMe = true) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success) {
        const loggedUser = {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
          university: response.university,
          researchCategory: response.researchCategory,
        };
        setUser(loggedUser);
        if (rememberMe) {
          localStorage.setItem('researchsphere_user', JSON.stringify(loggedUser));
          sessionStorage.removeItem('researchsphere_user');
        } else {
          sessionStorage.setItem('researchsphere_user', JSON.stringify(loggedUser));
          localStorage.removeItem('researchsphere_user');
        }
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register function calling Spring Boot backend POST /api/auth/register
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('researchsphere_user');
    sessionStorage.removeItem('researchsphere_user');
  }, []);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
