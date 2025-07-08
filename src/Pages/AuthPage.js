
/*
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isLoading, setIsLoading] = useState(true);
    const isAuthenticated = !!user;

    const setCookie = (name, value, days = 7) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
    };

    const deleteCookie = (name) => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
    };

    const extractUserFromToken = useCallback((accessToken) => {
        try {
            const payload = jwtDecode(accessToken);
            console.log('🔍 Full JWT Payload:', payload); // Debug log
            
            // Try multiple possible claim names for user ID
            const possibleIdClaims = [
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
                'sub',
                'id',
                'userId',
                'nameid',
                'nameidentifier'
            ];
            
            let id = null;
            for (const claim of possibleIdClaims) {
                if (payload[claim]) {
                    id = payload[claim];
                    console.log(`✅ Found user ID in claim '${claim}':`, id);
                    break;
                }
            }
            
            // Try multiple possible claim names for role
            const possibleRoleClaims = [
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
                'role',
                'roles'
            ];
            
            let role = null;
            for (const claim of possibleRoleClaims) {
                if (payload[claim]) {
                    role = payload[claim];
                    console.log(`✅ Found role in claim '${claim}':`, role);
                    break;
                }
            }
            
            // Try multiple possible claim names for email
            const possibleEmailClaims = [
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
                'email',
                'emailaddress'
            ];
            
            let email = null;
            for (const claim of possibleEmailClaims) {
                if (payload[claim]) {
                    email = payload[claim];
                    console.log(`✅ Found email in claim '${claim}':`, email);
                    break;
                }
            }

            const extractedData = {
                role: role?.trim() || 'Patient',
                email: email?.trim() || 'unknown@example.com',
                id: id?.trim() || null,
            };
            
            console.log('🎯 Extracted user data:', extractedData);
            
            if (!extractedData.id) {
                console.warn('⚠️ No user ID found in token. Available claims:', Object.keys(payload));
            }
            
            return extractedData;
        } catch (error) {
            console.error('❌ Error decoding accessToken:', error);
            return {
                role: 'Patient',
                email: 'unknown@example.com',
                id: null,
            };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                await fetch('https://physiocareapp.runasp.net/api/v1/Account/logout', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            }
        } catch (error) {
            console.warn('Server-side logout failed (may be due to expired token):', error);
        }

        setUser(null);
        setIsLoading(false);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        ['accessToken', 'refreshToken', 'userRole', 'userId', 'userEmail'].forEach(deleteCookie);
        console.log('🔓 User logged out successfully');
    }, []);

    // Initial check for authentication status on mount
    useEffect(() => {
        const checkAuthStatus = () => {
            const storedUser = localStorage.getItem('user');
            const storedAccessToken = localStorage.getItem('accessToken');

            console.log('🔍 Checking auth status...');
            console.log('Stored user:', storedUser);
            console.log('Stored token exists:', !!storedAccessToken);

            if (storedUser && storedAccessToken) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    const { role, email, id } = extractUserFromToken(storedAccessToken);

                    console.log('📋 Parsed stored user:', parsedUser);
                    console.log('🎯 Token extracted data:', { role, email, id });

                    // Basic validation: Check if token is expired or payload doesn't match stored user
                    if (Date.now() > parsedUser.exp) {
                        console.warn("⚠️ Stored token expired. Logging out.");
                        logout();
                    } else {
                        // Update user with fresh token data if needed
                        const updatedUser = {
                            ...parsedUser,
                            id: id || parsedUser.id,
                            role: role || parsedUser.role,
                            email: email || parsedUser.email
                        };
                        
                        console.log('✅ Setting authenticated user:', updatedUser);
                        setUser(updatedUser);
                    }
                } catch (error) {
                    console.error("❌ Failed to parse stored user or validate token, logging out:", error);
                    logout();
                }
            } else {
                console.log('ℹ️ No stored auth data found');
                setUser(null);
            }
            setIsLoading(false);
        };

        checkAuthStatus();
    }, [extractUserFromToken, logout]);

    const login = useCallback(
        (accessToken, refreshToken, userData = {}) => {
            try {
                console.log('🔐 Starting login process...');
                console.log('Received userData:', userData);
                
                const { role, email, id } = extractUserFromToken(accessToken);

                const fiveHoursLater = Date.now() + 5 * 60 * 60 * 1000;

                const enhancedUser = {
                    ...userData,
                    email: email || userData.email || 'unknown@example.com',
                    id: id || userData.id || userData.Id || null,
                    role: role || userData.role || 'Patient',
                    Role: role || userData.role || 'Patient',
                    exp: fiveHoursLater,
                    accessToken: accessToken, // Store token in user object for easy access
                };

                console.log('✅ Enhanced user object:', enhancedUser);

                if (!enhancedUser.id) {
                    console.warn('⚠️ No user ID available after login. This may cause issues with API calls.');
                }

                localStorage.setItem('user', JSON.stringify(enhancedUser));
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('token', accessToken);
                if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

                setCookie('accessToken', accessToken, 7);
                if (refreshToken) setCookie('refreshToken', refreshToken, 7);
                setCookie('userRole', enhancedUser.role, 7);
                setCookie('userId', enhancedUser.id || '', 7);
                setCookie('userEmail', enhancedUser.email || '', 7);

                setUser(enhancedUser);
                setIsLoading(false);
                console.log('✅ User logged in successfully:', {
                    email: enhancedUser.email,
                    role: enhancedUser.role,
                    id: enhancedUser.id,
                    exp: new Date(fiveHoursLater).toLocaleString(),
                });

                return { success: true, role: enhancedUser.role };
            } catch (error) {
                console.error('❌ Login error:', error);
                setUser(null);
                setIsLoading(false);
                throw new Error(`Failed to authenticate: ${error.message}`);
            }
        },
        [extractUserFromToken]
    );

    const register = useCallback(
        async (userData) => {
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
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Registration failed');
                }

                const data = await response.json();
                const accessToken = data.accessToken;
                const refreshToken = data.refreshToken;

                const loginResult = await login(accessToken, refreshToken, {
                    email: userData.email,
                    id: data.userId,
                    role: userData.role || 'Patient',
                });

                return { success: true, message: 'Registration successful', role: loginResult.role };
            } catch (error) {
                console.error('Registration error:', error);
                throw new Error(`Registration failed: ${error.message}`);
            }
        },
        [login]
    );

    const updateProfile = useCallback(async (data) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('No access token found. Please log in again.');
            }

            const formData = new FormData();
            Object.keys(data).forEach((key) => {
                if (Array.isArray(data[key])) {
                    data[key].forEach((item, index) => {
                        formData.append(`${key}[${index}]`, item);
                    });
                } else {
                    formData.append(key, data[key]);
                }
            });

            console.log('Sending FormData for updateProfile:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const response = await fetch('https://physiocareapp.runasp.net/api/v1/Account/UpdateAdminProfile', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText || 'Failed to update profile' };
                }
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const updatedUserData = await response.json();
            const updatedUser = {
                ...user,
                ...updatedUserData,
                email: updatedUserData.Email || user.email,
                role: updatedUserData.Role || user.role,
                Role: updatedUserData.Role || user.Role,
                name: updatedUserData.FullName || user.name,
                phoneNumber: updatedUserData.PhoneNumber || user.phoneNumber,
                address: updatedUserData.Address || user.address,
                roles: updatedUserData.roles || user.roles,
            };

            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setCookie('userEmail', updatedUser.email || '', 7);
            setCookie('userRole', updatedUser.role || '', 7);

            console.log('✅ Profile updated successfully:', updatedUser);

            return { message: 'Profile updated successfully!' };
        } catch (error) {
            console.error('Update profile error:', error);
            throw new Error(error.message || 'Failed to update profile');
        }
    }, [user, setCookie]);

    useEffect(() => {
        if (!user?.exp) {
            return;
        }

        const remainingTime = user.exp - Date.now();

        if (remainingTime <= 0) {
            console.warn('Token expired or logout scheduled for a past time. Logging out now.');
            logout();
            return;
        }

        const logoutTimeout = setTimeout(() => {
            console.warn('🔒 Auto-logout initiated.');
            logout();
        }, remainingTime);

        const minutes = Math.floor(remainingTime / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        console.log(`🔐 Auto-logout scheduled in ${hours}h ${mins}m`);

        return () => {
            clearTimeout(logoutTimeout);
            console.log('Auto-logout timeout cleared.');
        };
    }, [user, logout]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

*/

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isLoading, setIsLoading] = useState(true);
    const isAuthenticated = !!user;

    const setCookie = (name, value, days = 7) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
    };

    const deleteCookie = (name) => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
    };

    const extractUserFromToken = useCallback((accessToken) => {
        try {
            const payload = jwtDecode(accessToken);

            const idClaims = ['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier', 'sub', 'id', 'userId'];
            const roleClaims = ['http://schemas.microsoft.com/ws/2008/06/identity/claims/role', 'role', 'roles'];
            const emailClaims = ['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress', 'email'];
            const nameClaims = ['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name', 'name', 'FullName', 'fullName'];

            let id = null, role = null, email = null, name = null;

            idClaims.forEach(claim => { if (payload[claim]) id = payload[claim]; });
            roleClaims.forEach(claim => { if (payload[claim]) role = payload[claim]; });
            emailClaims.forEach(claim => { if (payload[claim]) email = payload[claim]; });
            nameClaims.forEach(claim => { if (payload[claim]) name = payload[claim]; });

            return {
                id: id?.trim() || null,
                role: role?.trim() || 'Patient',
                email: email?.trim() || 'unknown@example.com',
                name: name?.trim() || 'User',
                exp: payload.exp ? payload.exp * 1000 : Date.now() + 5 * 60 * 60 * 1000 // fallback to 5h
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
                });
            }
        } catch (error) {
            console.warn('Logout failed:', error);
        }

        setUser(null);
        setIsLoading(false);
        localStorage.clear();
        ['accessToken', 'refreshToken', 'userRole', 'userId', 'userEmail'].forEach(deleteCookie);
    }, []);

    const login = useCallback((accessToken, refreshToken, userData = {}) => {
        try {
            const { role, email, id, name, exp } = extractUserFromToken(accessToken);

            const enhancedUser = {
                ...userData,
                email: email || userData.email || 'unknown@example.com',
                id: id || userData.id || null,
                role: role || userData.role || 'Patient',
                Role: role || userData.role || 'Patient',
                name: name || userData.name || 'User',
                exp: exp,
                accessToken: accessToken,
            };

            localStorage.setItem('user', JSON.stringify(enhancedUser));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('token', accessToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

            setCookie('accessToken', accessToken, 7);
            if (refreshToken) setCookie('refreshToken', refreshToken, 7);
            setCookie('userRole', enhancedUser.role, 7);
            setCookie('userId', enhancedUser.id || '', 7);
            setCookie('userEmail', enhancedUser.email || '', 7);

            setUser(enhancedUser);
            setIsLoading(false);

            return { success: true, role: enhancedUser.role };
        } catch (error) {
            console.error('Login failed:', error);
            setUser(null);
            setIsLoading(false);
            throw new Error('Login failed');
        }
    }, [extractUserFromToken]);

    const refreshAuthToken = useCallback(async () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!accessToken || !refreshToken) {
            console.warn('No tokens available for refresh');
            return logout();
        }

        try {
            // Extract expiration dates from tokens
            let expireAccessToken, expireRefreshToken;
            
            try {
                const accessTokenPayload = jwtDecode(accessToken);
                const refreshTokenPayload = jwtDecode(refreshToken);
                
                // Convert Unix timestamps to ISO strings
                expireAccessToken = accessTokenPayload.exp 
                    ? new Date(accessTokenPayload.exp * 1000).toISOString()
                    : new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(); // 5h fallback
                    
                expireRefreshToken = refreshTokenPayload.exp
                    ? new Date(refreshTokenPayload.exp * 1000).toISOString()
                    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days fallback
            } catch (decodeError) {
                console.warn('Could not decode token expiration, using fallback dates');
                expireAccessToken = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
                expireRefreshToken = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            }

            const response = await fetch('https://physiocareapp.runasp.net/api/token/refresh-token', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    accessToken,
                    refreshToken,
                    expireAccessToken,
                    expireRefreshToken
                })
            });

            if (!response.ok) {
                // If refresh fails, the refresh token might be expired or invalid
                if (response.status === 401 || response.status === 403) {
                    console.warn('Refresh token expired or invalid');
                    return logout();
                }
                
                // Log the error response for debugging
                const errorData = await response.json().catch(() => null);
                console.error('Refresh token error:', errorData);
                throw new Error(`Failed to refresh token: ${response.status}`);
            }

            const data = await response.json();
            
            // Check if the response contains the new tokens
            if (!data.accessToken || !data.refreshToken) {
                console.error('Invalid refresh response - missing tokens');
                return logout();
            }

            const newAccessToken = data.accessToken;
            const newRefreshToken = data.refreshToken;

            // Update tokens and user data
            login(newAccessToken, newRefreshToken);
            
            console.log('Token refreshed successfully');
        } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails, logout the user
            logout();
        }
    }, [login, logout]);

    useEffect(() => {
        const checkAuthStatus = () => {
            const storedUser = localStorage.getItem('user');
            const storedAccessToken = localStorage.getItem('accessToken');

            if (storedUser && storedAccessToken) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    const { role, email, id, name, exp } = extractUserFromToken(storedAccessToken);

                    // Check if access token is expired
                    if (Date.now() > exp) {
                        console.log('Access token expired, attempting refresh...');
                        refreshAuthToken();
                    } else {
                        const updatedUser = {
                            ...parsedUser,
                            id: id || parsedUser.id,
                            role: role || parsedUser.role,
                            email: email || parsedUser.email,
                            name: name || parsedUser.name,
                            exp
                        };
                        setUser(updatedUser);
                    }
                } catch (error) {
                    console.error('Error parsing stored user data:', error);
                    logout();
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        };

        checkAuthStatus();
    }, [extractUserFromToken, logout, refreshAuthToken]);

    const register = useCallback(async (userData) => {
        if (!userData.email || !userData.password) {
            throw new Error('Email and password are required');
        }

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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        const accessToken = data.accessToken;
        const refreshToken = data.refreshToken;

        const loginResult = await login(accessToken, refreshToken, {
            email: userData.email,
            id: data.userId,
            role: userData.role || 'Patient',
        });

        return { success: true, message: 'Registration successful', role: loginResult.role };
    }, [login]);

    // Auto-refresh token before it expires
    useEffect(() => {
        if (!user?.exp) return;

        // Refresh token 5 minutes before expiration
        const timeUntilRefresh = user.exp - Date.now() - 5 * 60 * 1000;

        if (timeUntilRefresh <= 0) {
            // Token is already expired or about to expire
            refreshAuthToken();
            return;
        }

        const refreshTimeout = setTimeout(() => {
            refreshAuthToken();
        }, timeUntilRefresh);

        return () => clearTimeout(refreshTimeout);
    }, [user, refreshAuthToken]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};