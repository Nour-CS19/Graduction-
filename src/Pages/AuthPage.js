import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// Generate a persistent session-based encoded ID
const generateSessionEncodedId = (userId) => {
    if (!userId) return null;
    
    // Get or create a session key
    let sessionKey = sessionStorage.getItem('session_key');
    if (!sessionKey) {
        sessionKey = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        sessionStorage.setItem('session_key', sessionKey);
    }
    
    // Create a secure encoded ID that combines userId with session key
    const combined = `${userId}:${sessionKey}:${Date.now()}`;
    return btoa(combined).replace(/[+=\/]/g, (char) => {
        // URL-safe encoding
        if (char === '+') return '-';
        if (char === '/') return '_';
        return '';
    });
};

// Validate and decode the encoded ID
const validateEncodedId = (encodedId, expectedUserId) => {
    if (!encodedId || !expectedUserId) return false;
    
    try {
        // Restore URL-safe characters
        const base64 = encodedId.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        const [userId, sessionKey, timestamp] = decoded.split(':');
        
        const storedSessionKey = sessionStorage.getItem('session_key');
        
        // Validate all components
        if (userId !== expectedUserId.toString()) return false;
        if (sessionKey !== storedSessionKey) return false;
        
        // Optional: Check if timestamp is within session validity (24 hours)
        const age = Date.now() - parseInt(timestamp);
        if (age > 24 * 60 * 60 * 1000) return false;
        
        return true;
    } catch (error) {
        console.error('Encoded ID validation error:', error);
        return false;
    }
};

// Generate a decoy ID for security (looks real but isn't)
const generateDecoyId = () => {
    const randomData = `decoy:${Math.random().toString(36).substring(2, 15)}:${Date.now()}`;
    return btoa(randomData).replace(/[+=\/]/g, (char) => {
        if (char === '+') return '-';
        if (char === '/') return '_';
        return '';
    });
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error('Error parsing saved user from localStorage:', error);
            localStorage.removeItem('user');
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [sessionEncodedId, setSessionEncodedId] = useState(null);
    const isAuthenticated = !!user;

    const setCookie = (name, value, days = 7) => {
        try {
            const expires = new Date();
            expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
        } catch (error) {
            console.error('Error setting cookie:', error);
        }
    };

    const deleteCookie = (name) => {
        try {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
        } catch (error) {
            console.error('Error deleting cookie:', error);
        }
    };

    const extractUserFromToken = useCallback((accessToken) => {
        if (!accessToken) {
            console.warn('No access token provided for extraction');
            return {
                id: null,
                role: 'Patient',
                email: 'unknown@example.com',
                name: 'User',
                exp: Date.now() + 5 * 60 * 60 * 1000
            };
        }
        try {
            const payload = jwtDecode(accessToken);
            if (!payload) {
                throw new Error('Invalid JWT payload');
            }
            const idClaims = [
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
                'sub',
                'id',
                'userId'
            ];
            const roleClaims = [
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
                'role',
                'roles'
            ];
            const emailClaims = [
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
                'email'
            ];
            const nameClaims = [
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
                'name',
                'FullName',
                'fullName'
            ];
            let id = null, role = null, email = null, name = null;
            idClaims.forEach(claim => { if (payload[claim]) id = payload[claim]; });
            roleClaims.forEach(claim => { if (payload[claim]) role = payload[claim]; });
            emailClaims.forEach(claim => { if (payload[claim]) email = payload[claim]; });
            nameClaims.forEach(claim => { if (payload[claim]) name = payload[claim]; });
            const exp = payload.exp ? payload.exp * 1000 : Date.now() + 5 * 60 * 60 * 1000;
            return {
                id: id?.trim() || null,
                role: role?.trim() || 'Patient',
                email: email?.trim() || 'unknown@example.com',
                name: name?.trim() || 'User',
                exp
            };
        } catch (error) {
            console.error('Token decode error:', error);
            return {
                id: null,
                role: 'Patient',
                email: 'unknown@example.com',
                name: 'User',
                exp: Date.now() + 5 * 60 * 60 * 1000
            };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                await fetch('https://physiocareapp.runasp.net/api/v1/Account/logout', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${accessToken}` },
                }).catch((error) => console.warn('Logout request failed:', error));
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setSessionEncodedId(null);
            setIsLoading(false);
            localStorage.clear();
            sessionStorage.clear();
            ['accessToken', 'refreshToken', 'userRole', 'userId', 'userEmail'].forEach(deleteCookie);
            console.log('User logged out successfully');
        }
    }, []);

    const login = useCallback((accessToken, refreshToken, userData = {}) => {
        try {
            if (!accessToken) {
                throw new Error('Access token is required');
            }
            const { role, email, id, name, exp } = extractUserFromToken(accessToken);
            if (!exp || Date.now() > exp) {
                throw new Error('Access token is expired');
            }
            
            // Generate persistent session-based encoded ID
            const encodedUserId = generateSessionEncodedId(id);
            setSessionEncodedId(encodedUserId);
            
            const enhancedUser = {
                ...userData,
                email: email || userData.email || 'unknown@example.com',
                id: id || userData.id || null,
                encodedId: encodedUserId,
                role: role || userData.role || 'Patient',
                Role: role || userData.role || 'Patient',
                name: name || userData.name || 'User',
                exp: exp,
                accessToken: accessToken,
            };
            
            if (!enhancedUser.id) {
                console.warn('No user ID available after login');
            }
            
            localStorage.setItem('user', JSON.stringify(enhancedUser));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('token', accessToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            
            setCookie('accessToken', accessToken, 7);
            if (refreshToken) setCookie('refreshToken', refreshToken, 7);
            setCookie('userRole', enhancedUser.role, 7);
            
            setUser(enhancedUser);
            setIsLoading(false);
            
            return { success: true, role: enhancedUser.role, userId: enhancedUser.id, encodedId: encodedUserId };
        } catch (error) {
            console.error('Login failed:', error);
            logout();
            throw new Error(`Login failed: ${error.message}`);
        }
    }, [extractUserFromToken, logout]);

   const refreshAuthToken = useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
        console.warn('Missing tokens for refresh');
        return logout();
    }

    let expireAccessToken, expireRefreshToken;

    try {
        const accessPayload = jwtDecode(accessToken);
        expireAccessToken = accessPayload.exp
            ? new Date(accessPayload.exp * 1000).toISOString()
            : new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();

        const refreshPayload = jwtDecode(refreshToken);
        expireRefreshToken = refreshPayload.exp
            ? new Date(refreshPayload.exp * 1000).toISOString()
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } catch (error) {
        console.warn('Token decode failed, using fallback expiration');
        expireAccessToken = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
        expireRefreshToken = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    try {
        const response = await fetch('https://physiocareapp.runasp.net/api/token/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json-patch+json',
            },
            body: JSON.stringify({
                accessToken,
                refreshToken,
                expireAccessToken,
                expireRefreshToken
            })
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.warn('Refresh token expired or invalid');
                return logout();
            }
            throw new Error(`Refresh failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.accessToken || !data.refreshToken) {
            console.error('Missing tokens in refresh response');
            return logout();
        }

        login(data.accessToken, data.refreshToken);
        console.log('Token refreshed successfully');
    } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
    }
}, [login, logout]);


    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedAccessToken = localStorage.getItem('accessToken');
                if (storedUser && storedAccessToken) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        const { role, email, id, name, exp } = extractUserFromToken(storedAccessToken);
                        if (Date.now() > exp) {
                            console.log('Access token expired, attempting refresh...');
                            await refreshAuthToken();
                        } else {
                            // Use existing encoded ID if valid, otherwise generate new one
                            let encodedUserId = parsedUser.encodedId;
                            if (!encodedUserId || !validateEncodedId(encodedUserId, id)) {
                                encodedUserId = generateSessionEncodedId(id);
                            }
                            setSessionEncodedId(encodedUserId);
                            
                            const updatedUser = {
                                ...parsedUser,
                                id: id || parsedUser.id,
                                encodedId: encodedUserId,
                                role: role || parsedUser.role,
                                email: email || parsedUser.email,
                                name: name || parsedUser.name,
                                exp
                            };
                            setUser(updatedUser);
                        }
                    } catch (parseError) {
                        console.error('Error parsing or validating stored auth data:', parseError);
                        logout();
                    }
                } else {
                    console.log('No stored auth data found - setting unauthenticated state');
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth status check failed:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuthStatus();
    }, [extractUserFromToken, logout, refreshAuthToken]);

    const register = useCallback(async (userData) => {
        if (!userData.email || !userData.password) {
            throw new Error('Email and password are required for registration');
        }
        try {
            const response = await fetch('https://physiocareapp.runasp.net/api/v1/Account/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
                    role: userData.role || 'Patient',
                }),
            });
            if (!response.ok) {
                let errorMessage = 'Registration failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {}
                throw new Error(errorMessage);
            }
            const data = await response.json();
            if (!data.accessToken || !data.refreshToken) {
                throw new Error('Registration response missing tokens');
            }
            return login(data.accessToken, data.refreshToken, {
                email: userData.email,
                id: data.userId || null,
                role: userData.role || 'Patient',
            });
        } catch (error) {
            console.error('Registration error:', error);
            throw new Error(`Registration failed: ${error.message}`);
        }
    }, [login]);

    useEffect(() => {
        if (!user?.exp) return;
        const timeUntilRefresh = user.exp - Date.now() - 5 * 60 * 1000;
        if (timeUntilRefresh <= 0) {
            refreshAuthToken();
            return;
        }
        const refreshTimeout = setTimeout(() => {
            refreshAuthToken();
        }, timeUntilRefresh);
        return () => clearTimeout(refreshTimeout);
    }, [user?.exp, refreshAuthToken]);

    const getEncodedUserId = useCallback(() => {
        return sessionEncodedId || user?.encodedId || null;
    }, [sessionEncodedId, user]);

    const validateUserId = useCallback((urlUserId) => {
        if (!user?.id) return false;
        return validateEncodedId(urlUserId, user.id);
    }, [user]);

    const getDecoyId = useCallback(() => {
        return generateDecoyId();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated, 
            isLoading, 
            login, 
            register, 
            logout, 
            getEncodedUserId,
            validateUserId,
            getDecoyId
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};