
// Assuming AuthProvider is in a separate file, here's the minimal version needed for context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = window.authToken || null;
    const storedUser = window.userData || null;
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const saveAuthData = (tokenData, userData) => {
    window.authToken = tokenData;
    window.userData = userData;
    setToken(tokenData);
    setUser(userData);
  };

  const register = async (formData) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('FullName', formData.fullName);
      formDataToSend.append('Email', formData.email);
      formDataToSend.append('Password', formData.password);
      formDataToSend.append('ConfirmPassword', formData.confirmPassword);
      formDataToSend.append('PhoneNumber', formData.phoneNumber);
      formDataToSend.append('Address', formData.address);

      const response = await fetch('https://physiocareapp.runasp.net/api/v1/Patients', {
        method: 'POST',
        headers: {
          'accept': '*/*'
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(errorText || 'Registration failed');
      }

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (data.token) {
        window.tempConfirmationToken = data.token;
        window.tempUserEmail = formData.email;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const confirmEmail = async (token, email) => {
    try {
      const response = await fetch(
        `https://physiocareapp.runasp.net/api/v1/Account/emailconfirmation?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Email confirmation failed');
      }

      const data = await response.json();
      delete window.tempConfirmationToken;
      delete window.tempUserEmail;
      return { success: true, data };
    } catch (error) {
      console.error('Email confirmation error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    delete window.authToken;
    delete window.userData;
    delete window.tempConfirmationToken;
    delete window.tempUserEmail;
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    token,
    isLoading,
    register,
    confirmEmail,
    logout,
    saveAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PatientRegistration />
    </AuthProvider>
  );
}