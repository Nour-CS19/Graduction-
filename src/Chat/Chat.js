import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../Pages/AuthPage';
import * as signalR from '@microsoft/signalr';
import { Send, Paperclip, X, RefreshCw, Wifi, WifiOff, Users } from 'lucide-react';
import Navbar from '../components/Nav';
import Footer from '../components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

const ChatApp = () => {
  const { user, logout, refreshAuthToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectStatus, setReconnectStatus] = useState('');
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [userPhotos, setUserPhotos] = useState({});
  const [loadingImages, setLoadingImages] = useState(new Set());
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const connectionRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;
  const messageIdsRef = useRef(new Set());
  const pendingMessagesRef = useRef(new Map());
  const selectedUserRef = useRef(null);

  // Custom API fetch with auth and refresh handling
  const apiFetch = useCallback(async (url, options = {}) => {
    const config = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${user?.accessToken}`,
      },
    };
    try {
      const response = await fetch(url, config);
      if (response.ok) return response;
      if (response.status === 401) {
        try {
          await refreshAuthToken();
          config.headers.Authorization = `Bearer ${user?.accessToken}`;
          return await fetch(url, config);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          throw new Error('Authentication expired. Please log in again.');
        }
      }
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    } catch (error) {
      console.error(`API call failed for ${url}:`, error);
      throw error;
    }
  }, [user?.accessToken, refreshAuthToken, logout]);

  const capitalizeRole = (role) => role?.charAt(0).toUpperCase() + role?.slice(1).toLowerCase() || 'User';

  // Generate avatar with initials
  const generateInitialAvatar = (name, role) => {
    const initials = name
      ?.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2) || 'U';
    const colors = {
      doctor: { bg: '#4CAF50', text: '#FFFFFF' },
      nurse: { bg: '#2196F3', text: '#FFFFFF' },
      laboratory: { bg: '#FF9800', text: '#FFFFFF' },
      patient: { bg: '#9C27B0', text: '#FFFFFF' },
      default: { bg: '#757575', text: '#FFFFFF' }
    };
    const colorScheme = colors[role?.toLowerCase()] || colors.default;
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = colorScheme.bg;
    ctx.beginPath();
    ctx.arc(40, 40, 40, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = colorScheme.text;
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 40, 40);
    return canvas.toDataURL();
  };

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end', inline: 'nearest' });
    }
  }, []);

  // Create unique message identifier
  const createMessageIdentifier = (senderId, recipientId, text, fileName, timestamp) => {
    const normalizedText = (text || '').trim();
    const normalizedFile = fileName || '';
    const timeWindow = Math.floor(new Date(timestamp).getTime() / 5000);
    return `${senderId}-${recipientId}-${normalizedText}-${normalizedFile}-${timeWindow}`;
  };

  // Add message with deduplication
  const addMessage = useCallback((newMessage) => {
    const messageId = createMessageIdentifier(
      newMessage.senderId,
      newMessage.recipientId,
      newMessage.text,
      newMessage.file,
      newMessage.date
    );

    if (messageIdsRef.current.has(messageId)) {
      console.log('🔄 Duplicate message detected, skipping:', messageId);
      return false;
    }

    messageIdsRef.current.add(messageId);

    if (messageIdsRef.current.size > 100) {
      const idsArray = Array.from(messageIdsRef.current);
      messageIdsRef.current = new Set(idsArray.slice(-100));
    }

    setMessages(prev => {
      const withoutOptimistic = prev.filter(m => {
        if (!m.isOptimistic) return true;
        
        const isSameMessage = 
          String(m.senderId) === String(newMessage.senderId) &&
          String(m.recipientId) === String(newMessage.recipientId) &&
          m.text === newMessage.text &&
          m.file === newMessage.file;
        
        return !isSameMessage;
      });

      const updated = [...withoutOptimistic, newMessage].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      console.log('✅ Message added. Total messages:', updated.length);
      return updated;
    });

    if (newMessage.file) {
      fetchChatImage(newMessage.file, newMessage.id);
    }

    setTimeout(() => scrollToBottom('smooth'), 100);
    
    return true;
  }, [scrollToBottom]);

  // Enhanced SignalR connection
  const initializeSignalR = async () => {
    if (!user?.accessToken || !user?.id) {
      console.warn('Missing authentication credentials');
      return;
    }
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping existing connection:', err);
      }
      connectionRef.current = null;
    }
    
    const hubUrl = 'https://physiocareapp.runasp.net/chatHub';
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => user.accessToken,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
        withCredentials: false,
        timeout: 30000
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.previousRetryCount > 5) return null;
          const delay = Math.min(30000, Math.pow(2, retryContext.previousRetryCount) * 1000 + Math.random() * 1000);
          return delay;
        }
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();
    connectionRef.current = connection;
    
    connection.onreconnecting(() => {
      setConnectionState('Reconnecting');
      setReconnectStatus('Reconnecting to chat server...');
    });
    
    connection.onreconnected(() => {
      setConnectionState('Connected');
      setConnectionError(null);
      setReconnectStatus('');
      retryCountRef.current = 0;
    });
    
    connection.onclose(async (error) => {
      setConnectionState('Disconnected');
      if (error) {
        setConnectionError(`Connection lost: ${error.message || 'Unknown error'}`);
        if (retryCountRef.current < maxRetries) {
          setReconnectStatus(`Reconnecting (${retryCountRef.current + 1}/${maxRetries})...`);
          await attemptManualReconnection();
        } else {
          setReconnectStatus('Max reconnection attempts reached. Please refresh.');
        }
      }
    });
    
    connection.on('ReceiveMessage', (param1, param2, param3, param4, param5) => {
      console.log('📨 ReceiveMessage event - RAW PARAMS:', { 
        param1, 
        param2, 
        param3, 
        param4, 
        param5,
        'param1 type': typeof param1,
        'param1 keys': typeof param1 === 'object' ? Object.keys(param1 || {}) : 'N/A'
      });
      
      let senderId, recipientId, messageText, date, fileName;
      
      // Handle if data comes as an object
      if (typeof param1 === 'object' && param1 !== null && !Array.isArray(param1)) {
        console.log('📦 Received as OBJECT - trying all possible property names');
        
        // Try all possible variations of sender ID
        senderId = param1.senderId || param1.SenderId || param1.senderid || param1.sender_id || 
                   param1.senderID || param1.SENDERID || param1['Sender ID'] || param1.sender;
        
        // Try all possible variations of recipient ID  
        recipientId = param1.recipientId || param1.RecipientId || param1.recipientid || param1.recipient_id ||
                      param1.recipientID || param1.RECIPIENTID || param1['Recipient ID'] || param1.recipient;
        
        // Try all possible variations of message text
        messageText = param1.messageText || param1.MessageText || param1.messagetext || param1.message_text ||
                      param1.text || param1.Text || param1.TEXT || param1.message || param1.Message || 
                      param1.content || param1.Content;
        
        // Try all possible variations of date
        date = param1.date || param1.Date || param1.DATE || param1.timestamp || param1.Timestamp || 
               param1.createdAt || param1.CreatedAt || param1.created_at;
        
        // Try all possible variations of file name
        fileName = param1.fileName || param1.FileName || param1.filename || param1.file_name ||
                   param1.file || param1.File || param1.attachment || param1.Attachment;
        
        console.log('📦 Extracted from object:', { senderId, recipientId, messageText, date, fileName });
      } 
      // Handle if data comes as separate parameters
      else {
        console.log('📋 Received as PARAMETERS');
        senderId = param1;
        recipientId = param2;
        messageText = param3;
        date = param4;
        fileName = param5;
      }
      
      // Convert to strings and validate - be very careful with the conversion
      const rawSenderId = senderId;
      const rawRecipientId = recipientId;
      
      senderId = senderId != null ? String(senderId).trim() : '';
      recipientId = recipientId != null ? String(recipientId).trim() : '';
      messageText = messageText != null ? String(messageText).trim() : '';
      
      console.log('📨 Parsed and cleaned message:', { 
        'Raw Sender': rawSenderId,
        'Raw Recipient': rawRecipientId,
        'Cleaned Sender': senderId || 'MISSING', 
        'Cleaned Recipient': recipientId || 'MISSING', 
        'Message Text': messageText || 'EMPTY', 
        'Date': date, 
        'File': fileName 
      });
      
      // Validate we have minimum required data
      if (!senderId || !recipientId) {
        console.error('❌ Missing sender or recipient ID - cannot route message');
        console.error('   This usually means the server is sending data in an unexpected format');
        console.error('   Check the raw params above to see what format is being used');
        return;
      }
      
      if (!messageText && !fileName) {
        console.warn('⚠️ No message text or file - skipping empty message');
        return;
      }
      
      const currentSelectedUser = selectedUserRef.current;
      const stringSelectedId = currentSelectedUser?.id != null ? String(currentSelectedUser.id).trim() : '';
      const stringUserId = user?.id != null ? String(user.id).trim() : '';
      
      console.log('🔍 Checking message routing with IDs:', {
        'Message Sender ID': `"${senderId}"`,
        'Message Recipient ID': `"${recipientId}"`,
        'Selected User ID': `"${stringSelectedId}"`,
        'Current User ID': `"${stringUserId}"`,
        'Has Selected User': !!currentSelectedUser,
        'Selected User Name': currentSelectedUser?.name || 'None'
      });
      
      // Check if message is for current chat - log each comparison
      const isIncomingMessage = (senderId === stringSelectedId) && (recipientId === stringUserId);
      const isOutgoingMessage = (senderId === stringUserId) && (recipientId === stringSelectedId);
      const isForCurrentChat = isIncomingMessage || isOutgoingMessage;
      
      console.log('🔍 Message type analysis:', {
        'Is Incoming?': isIncomingMessage,
        '  → Sender matches selected user?': senderId === stringSelectedId,
        '  → Recipient matches current user?': recipientId === stringUserId,
        'Is Outgoing?': isOutgoingMessage,
        '  → Sender matches current user?': senderId === stringUserId,
        '  → Recipient matches selected user?': recipientId === stringSelectedId,
        'Final: For Current Chat?': isForCurrentChat
      });
      
      if (isForCurrentChat && currentSelectedUser) {
        const newMessage = {
          id: `signalr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: messageText,
          senderId: senderId,
          recipientId: recipientId,
          date: date || new Date().toISOString(),
          file: fileName || null,
          isOptimistic: false,
          isDelivered: true
        };
        
        console.log('✅ SUCCESS - Adding real-time message to chat:', newMessage);
        addMessage(newMessage);
      } else {
        console.log('❌ REJECTED - Message not for current chat');
        console.log('   Reason:', !currentSelectedUser ? 'No user selected' : 'Message for different conversation');
        console.log('   Current Chat:', currentSelectedUser ? `${stringUserId} ↔ ${stringSelectedId}` : 'none');
        console.log('   Message Chat:', `${senderId} ↔ ${recipientId}`);
        console.log('   To see this message, select the correct user from the contacts list');
      }
    });
    
    connection.on('UserStatusChanged', (userId, status) => {
      setUsers(prev =>
        prev.map(u => (String(u.id) === String(userId) ? { ...u, lastActive: status } : u))
      );
    });
    
    connection.on('updateuserlist', (userList) => {
      console.log('👥 updateuserlist event received:', userList);
      
      if (Array.isArray(userList)) {
        const mappedUsers = userList.map(u => ({
          id: u.userId || u.id || u.UserId || u.Id,
          name: u.fullName || u.userName || u.FullName || u.UserName || `${capitalizeRole(u.role || u.Role)} User`,
          role: u.role || u.Role || 'user',
          fileName: u.fileName || u.FileName || null,
          lastActive: u.lastActive || u.LastActive || 'offline',
        }));
        
        const currentUserId = String(user?.id || '').trim();
        console.log('🔍 Current User ID for filtering:', currentUserId);
        console.log('📋 All mapped users before filtering:', mappedUsers.map(u => ({ id: String(u.id), name: u.name })));
        
        // Filter out current user - be very explicit
        const filteredUsers = mappedUsers.filter(u => {
          const userIdString = String(u.id || '').trim();
          const isCurrentUser = userIdString === currentUserId;
          console.log(`  → User ${u.name} (${userIdString}): ${isCurrentUser ? '❌ FILTERED OUT (current user)' : '✅ Keep'}`);
          return !isCurrentUser;
        });
        
        console.log('✅ Users after filtering out current user:', filteredUsers.map(u => ({ id: String(u.id), name: u.name })));
        
        const uniqueUsers = filteredUsers.reduce((acc, user) => {
          if (!acc.find(u => String(u.id) === String(user.id))) {
            acc.push(user);
          }
          return acc;
        }, []);
        
        console.log('👥 Final unique users:', uniqueUsers.length);
        
        setUsers(prev => {
          const existingIds = new Set(prev.map(u => String(u.id)));
          const newUsers = uniqueUsers.filter(u => !existingIds.has(String(u.id)));
          const updatedUsers = prev.map(u => {
            const updated = uniqueUsers.find(nu => String(nu.id) === String(u.id));
            return updated || u;
          });
          return [...updatedUsers, ...newUsers];
        });
        
        uniqueUsers.forEach(u => {
          if (u.fileName) fetchUserPhoto(u.fileName, u.role, u.id);
        });
      }
    });
    
    try {
      setConnectionState('Connecting');
      setReconnectStatus('Connecting to chat server...');
      await connection.start();
      setConnectionState('Connected');
      setConnectionError(null);
      setReconnectStatus('');
      retryCountRef.current = 0;
      console.log('✅ SignalR connected successfully');
    } catch (err) {
      console.error('SignalR connection error:', err);
      setConnectionState('Disconnected');
      
      let errorMessage = 'Chat connection issue. ';
      
      if (err.message?.includes('AbortError') || err.message?.includes('negotiation')) {
        errorMessage += 'Server negotiation failed. Using fallback mode.';
        console.log('⚠️ SignalR unavailable - app will work in API-only mode');
      } else if (err.message?.includes('401') || err.message?.includes('403')) {
        errorMessage += 'Authentication issue detected.';
        try {
          await refreshAuthToken();
          console.log('🔄 Token refreshed, retrying connection...');
          setTimeout(() => initializeSignalR(), 2000);
          return;
        } catch (refreshErr) {
          errorMessage += ' Please log in again.';
        }
      } else if (err.message?.includes('404')) {
        errorMessage += 'Chat service unavailable. Using fallback mode.';
        console.log('⚠️ Hub not found - continuing with API-only');
      } else if (err.message?.includes('timeout') || err.message?.includes('Timeout')) {
        errorMessage += 'Connection timeout. Retrying...';
      } else {
        errorMessage += 'Using fallback mode.';
      }
      
      setConnectionError(errorMessage);
      
      if (err.message?.includes('404') || err.message?.includes('AbortError')) {
        console.log('⚠️ Permanent SignalR error - app will work in API-only mode');
        setReconnectStatus('');
        setTimeout(() => setConnectionError(null), 5000);
        return;
      }
      
      if (retryCountRef.current < maxRetries) {
        setReconnectStatus(`Reconnecting (${retryCountRef.current + 1}/${maxRetries})...`);
        await attemptManualReconnection();
      } else {
        setReconnectStatus('');
        setTimeout(() => setConnectionError(null), 5000);
      }
    }
  };

  const attemptManualReconnection = async () => {
    retryCountRef.current += 1;
    if (retryCountRef.current > maxRetries) {
      setReconnectStatus('Max reconnection attempts reached. Please refresh.');
      return;
    }
    const delay = Math.min(30000, Math.pow(2, retryCountRef.current) * 1000);
    await new Promise(resolve => setTimeout(resolve, delay));
    if (connectionRef.current?.state === signalR.HubConnectionState.Disconnected) {
      try {
        setConnectionState('Connecting');
        await connectionRef.current.start();
        setConnectionState('Connected');
        setConnectionError(null);
        setReconnectStatus('');
        retryCountRef.current = 0;
      } catch (err) {
        setConnectionState('Disconnected');
        if (retryCountRef.current < maxRetries) {
          setReconnectStatus(`Reconnection failed. Retrying (${retryCountRef.current + 1}/${maxRetries})...`);
          await attemptManualReconnection();
        } else {
          setConnectionError('Unable to establish connection. Please refresh.');
          setReconnectStatus('');
        }
      }
    }
  };

  const handleManualReconnect = async () => {
    retryCountRef.current = 0;
    setConnectionError(null);
    setReconnectStatus('');
    await initializeSignalR();
  };

  // Fetch user profile photo
  const fetchUserPhoto = async (fileName, role, userId) => {
    if (!fileName || !user?.accessToken) {
      const userInfo = users.find(u => String(u.id) === String(userId)) || { name: 'User', role: role || 'user' };
      const initialAvatar = generateInitialAvatar(userInfo.name, userInfo.role);
      setUserPhotos(prev => ({ ...prev, [String(userId)]: initialAvatar }));
      return;
    }
    const userInfo = users.find(u => String(u.id) === String(userId)) || { name: 'User', role: role || 'user' };
    const initialAvatar = generateInitialAvatar(userInfo.name, userInfo.role);
    setUserPhotos(prev => ({ ...prev, [String(userId)]: initialAvatar }));
    setLoadingImages(prev => new Set(prev).add(String(userId)));
    const rolePath = capitalizeRole(role);
    
    const urlsToTry = [
      `https://physiocareapp.runasp.net/api/v1/Upload/get-photo-by-user-id?userId=${encodeURIComponent(userId)}&path=Actors%2F${rolePath}`,
      `https://physiocareapp.runasp.net/api/v1/Upload/image?filename=${encodeURIComponent(fileName)}&path=Actors%2F${rolePath}`,
      `https://physiocareapp.runasp.net/api/v1/Upload/get-photo-by-user-id?userId=${encodeURIComponent(userId)}&path=${rolePath}`,
    ];
    
    let success = false;
    for (const url of urlsToTry) {
      try {
        const res = await apiFetch(url);
        if (res.ok) {
          const blob = await res.blob();
          const imgUrl = URL.createObjectURL(blob);
          setUserPhotos(prev => ({ ...prev, [String(userId)]: imgUrl }));
          success = true;
          break;
        }
      } catch (err) {
        continue;
      }
    }
    
    if (!success) {
      console.warn(`Photo not found for user ${userId}, using initials`);
    }
    
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(String(userId));
      return newSet;
    });
  };

  // Fetch chat image
  const fetchChatImage = async (fileName, messageId) => {
    if (!fileName || !user?.accessToken) return;
    setLoadingImages(prev => new Set(prev).add(String(messageId)));
    
    const urlsToTry = [
      `https://physiocareapp.runasp.net/api/v1/Upload/image?filename=${encodeURIComponent(fileName)}&path=Chat`,
      `https://physiocareapp.runasp.net/api/v1/Upload/get-image?filename=${encodeURIComponent(fileName)}&path=Chat`,
      `https://physiocareapp.runasp.net/api/v1/Chat/get-image?filename=${encodeURIComponent(fileName)}`,
    ];
    
    let success = false;
    for (const url of urlsToTry) {
      try {
        const res = await apiFetch(url);
        if (res.ok) {
          const blob = await res.blob();
          const imgUrl = URL.createObjectURL(blob);
          setUserPhotos(prev => ({ ...prev, [String(messageId)]: imgUrl }));
          success = true;
          break;
        }
      } catch (err) {
        continue;
      }
    }
    
    if (!success) {
      console.warn(`Chat image not found: ${fileName}`);
    }
    
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(String(messageId));
      return newSet;
    });
  };

  const fetchChatUsers = async () => {
    if (!user?.accessToken || !user?.id) return;
    
    const currentUserId = String(user.id).trim();
    console.log('🔍 fetchChatUsers - Current User ID:', currentUserId);
    
    const role = user.role?.toLowerCase() || 'patient';
    let rolesToFetch = [];
    if (role === 'patient') {
      rolesToFetch = ['doctor', 'nurse', 'laboratory'];
    } else {
      rolesToFetch = ['patient'];
    }
    
    try {
      const chatRes = await apiFetch(
        `https://physiocareapp.runasp.net/api/v1/Message/get-all-users-chatting-with-current-users?CurrentUserId=${user.id}`
      );
      let chatData = [];
      if (chatRes.ok) {
        chatData = await chatRes.json().catch(() => []);
        console.log('📋 Chatted users:', chatData);
      } else {
        console.warn('⚠️ Failed to fetch chatted users:', chatRes.status);
      }
      const chattedUserIds = new Set(Array.isArray(chatData) ? chatData.map(u => String(u.userId || u.id)) : []);
      const rolePromises = rolesToFetch.map(async r => {
        const res = await apiFetch(
         `https://physiocareapp.runasp.net/api/v1/Admins/get-all-basic-info-users-by-role?role=${r}`
        );
        if (!res.ok) return [];
        const data = await res.json().catch(() => []);
        return Array.isArray(data)
          ? data
              .filter(u => u.lastActive === 'online' || chattedUserIds.has(String(u.userId || u.id)))
              .map(u => ({ ...u, role: r }))
          : [];
      });
      const allUsers = (await Promise.all(rolePromises)).flat();
      
      console.log('📋 All users before filtering:', allUsers.map(u => ({ 
        id: String(u.userId || u.id), 
        name: u.fullName || u.userName 
      })));
      
      // Filter out current user - be very explicit with logging
      const filteredUsers = allUsers.filter(u => {
        const userId = String(u.userId || u.id).trim();
        const isCurrentUser = userId === currentUserId;
        console.log(`  → User ${u.fullName || u.userName} (${userId}): ${isCurrentUser ? '❌ FILTERED (current user)' : '✅ Keep'}`);
        return !isCurrentUser;
      });
      
      console.log('✅ Filtered users (excluding current user):', filteredUsers.map(u => ({ 
        id: String(u.userId || u.id), 
        name: u.fullName || u.userName 
      })));
      
      const mapped = filteredUsers.map(u => ({
        id: u.userId || u.id,
        name: u.fullName || u.userName || `${capitalizeRole(u.role)} User`,
        role: u.role,
        fileName: u.fileName || null,
        lastActive: u.lastActive || 'offline',
      }));
      
      const uniqueUsers = mapped.reduce((acc, user) => {
        if (!acc.find(u => String(u.id) === String(user.id))) {
          acc.push(user);
        }
        return acc;
      }, []);
      
      console.log('👥 Total unique users (excluding current user):', uniqueUsers.length);
      setUsers(uniqueUsers);
      
      uniqueUsers.forEach(u => {
        if (u.fileName) {
          fetchUserPhoto(u.fileName, u.role, u.id);
        } else {
          const initialAvatar = generateInitialAvatar(u.name, u.role);
          setUserPhotos(prev => ({ ...prev, [String(u.id)]: initialAvatar }));
        }
      });
    } catch (err) {
      console.error('Failed to fetch chat users:', err);
      setConnectionError('Failed to load users. Please refresh.');
      setUsers([]);
    }
  };

  const fetchMessages = async (recipientId) => {
    if (!user?.accessToken || !user?.id || !recipientId) return;
    setIsLoadingMessages(true);
    
    messageIdsRef.current.clear();
    
    try {
      let allMessages = [];
      let chatRes = await apiFetch(
        `https://physiocareapp.runasp.net/api/v1/Chat/get-all-messages?senderId=${user.id}&recipientId=${recipientId}`
      );
      if (chatRes.ok) {
        const chatData = await chatRes.json().catch(() => []);
        allMessages = Array.isArray(chatData) ? chatData : [];
        console.log('✅ Loaded messages from Chat endpoint');
      } else {
        console.log('Chat endpoint failed, falling back to Message endpoints');
        let res1 = await apiFetch(
          `https://physiocareapp.runasp.net/api/v1/Message/get-all-messages-by-sender-id-and-recipient-id?senderId=${user.id}&recipientId=${recipientId}`
        );
        if (res1.ok) {
          const data1 = await res1.json().catch(() => []);
          allMessages = [...allMessages, ...(Array.isArray(data1) ? data1 : [])];
        }
        let res2 = await apiFetch(
          `https://physiocareapp.runasp.net/api/v1/Message/get-all-messages-by-sender-id-and-recipient-id?senderId=${recipientId}&recipientId=${user.id}`
        );
        if (res2.ok) {
          const data2 = await res2.json().catch(() => []);
          allMessages = [...allMessages, ...(Array.isArray(data2) ? data2 : [])];
        }
      }
      const formatted = (Array.isArray(allMessages) ? allMessages : []).map(m => {
        const messageId = m.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const msg = {
          id: messageId,
          text: m.messageText || '',
          senderId: String(m.senderId),
          recipientId: String(m.recipientId),
          date: m.date || new Date().toISOString(),
          file: m.fileName || null,
          isOptimistic: false
        };
        
        const msgId = createMessageIdentifier(msg.senderId, msg.recipientId, msg.text, msg.file, msg.date);
        messageIdsRef.current.add(msgId);
        
        if (m.fileName) fetchChatImage(m.fileName, messageId);
        return msg;
      });
      setMessages(formatted.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setTimeout(() => scrollToBottom('auto'), 200);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setMessages([]);
      setConnectionError('Failed to load messages. Please try again.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user?.accessToken || !selectedUser || (!message.trim() && !file)) {
      return;
    }
    
    const messageToSend = message.trim() || ' ';
    const displayText = message.trim();
    const fileToSend = file;
    
    setMessage('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage = {
      id: optimisticId,
      text: displayText,
      senderId: String(user.id),
      recipientId: String(selectedUser.id),
      date: new Date().toISOString(),
      file: fileToSend ? fileToSend.name : null,
      isOptimistic: true,
      isSending: true
    };

    setMessages(prev => {
      const newMessages = [...prev, optimisticMessage].sort((a, b) => new Date(a.date) - new Date(b.date));
      return newMessages;
    });

    setTimeout(() => scrollToBottom('smooth'), 50);
    setConnectionError(null);
    setIsSendingMessage(true);

    pendingMessagesRef.current.set(optimisticId, {
      text: displayText,
      file: fileToSend?.name,
      timestamp: Date.now()
    });

    let signalRSuccess = false;
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      try {
        const methodsToTry = [
          { name: 'sendmessage', args: [String(user.id), String(selectedUser.id), messageToSend, fileToSend ? fileToSend.name : null] },
          { name: 'sendmessage', args: [{ 
            senderId: String(user.id), 
            recipientId: String(selectedUser.id), 
            messageText: messageToSend, 
            fileName: fileToSend ? fileToSend.name : null 
          }] },
          { name: 'SendMessage', args: [String(user.id), String(selectedUser.id), messageToSend, fileToSend ? fileToSend.name : null] },
          { name: 'sendmessage', args: [String(user.id), String(selectedUser.id), messageToSend] },
        ];

        for (const method of methodsToTry) {
          try {
            await connectionRef.current.invoke(method.name, ...method.args);
            console.log(`✅ Message sent via SignalR using method: ${method.name}`);
            signalRSuccess = true;
            break;
          } catch (err) {
            continue;
          }
        }

        if (!signalRSuccess) {
          throw new Error('All SignalR method attempts failed');
        }
      } catch (signalRError) {
        console.error('❌ SignalR send failed:', signalRError);
        console.log('⚠️ Continuing with API-only send...');
      }
    } else {
      console.log('⚠️ SignalR not connected, using API only');
    }

    const formData = new FormData();
    formData.append('SenderId', user.id);
    formData.append('RecipientId', selectedUser.id);
    formData.append('Date', new Date().toISOString());
    formData.append('MessageText', messageToSend);
    formData.append('UserName', user.name || user.userName || 'User');
    if (fileToSend) {
      formData.append('ImageFile', fileToSend);
    }

    try {
      const res = await apiFetch('https://physiocareapp.runasp.net/api/v1/Chat/sendmessage', {
        method: 'POST',
        body: formData,
      });
      
      await res.text().catch(() => 'Success');
      console.log('✅ Message sent via API');

      setTimeout(() => {
        pendingMessagesRef.current.delete(optimisticId);
        setMessages(prev => prev.map(m => 
          m.id === optimisticId ? { 
            ...m, 
            isOptimistic: false, 
            isSending: false,
            isDelivered: true,
            id: `confirmed-${Date.now()}` 
          } : m
        ));
        setIsSendingMessage(false);
      }, 500);

      setConnectionError(null);

    } catch (err) {
      console.error('❌ Failed to send message:', err);
      
      pendingMessagesRef.current.delete(optimisticId);
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      setMessage(displayText);
      setFile(fileToSend);
      setIsSendingMessage(false);
      
      let errorMsg = 'Failed to send message. ';
      if (err.message.includes('401') || err.message.includes('403') || err.message.includes('Authentication')) {
        errorMsg += 'Authentication failed. Please log in again.';
      } else if (err.message.includes('404')) {
        errorMsg += 'Chat service not found.';
      } else if (err.message.includes('400')) {
        errorMsg += 'Invalid message format. Please try again.';
      } else if (err.message.includes('Network')) {
        errorMsg += 'Network error. Check your connection.';
      } else {
        errorMsg += 'Please try again.';
      }
      
      setConnectionError(errorMsg);
      
      setTimeout(() => {
        setConnectionError(null);
      }, 10000);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => scrollToBottom('smooth'));
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    fetchChatUsers();
    initializeSignalR();
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(err =>
          console.error('SignalR disconnect error:', err)
        );
      }
    };
  }, [user?.id, user?.accessToken]);

  useEffect(() => {
    if (selectedUser) {
      selectedUserRef.current = selectedUser;
      setMessages([]);
      messageIdsRef.current.clear();
      pendingMessagesRef.current.clear();
      fetchMessages(selectedUser.id);
    } else {
      selectedUserRef.current = null;
    }
  }, [selectedUser]);

  return (
    <>
      <Navbar />
      <div className="d-flex flex-column" style={{ 
        minHeight: '100vh',
        paddingTop: '70px',
        paddingBottom: '60px',
        backgroundColor: '#f8f9fa'
      }}>
        <div className="container-fluid flex-grow-1 py-3" style={{ maxWidth: '1600px' }}>
          <div className="card shadow-lg h-100" style={{ 
            maxHeight: 'calc(100vh - 140px)',
            minHeight: '600px'
          }}>
            <div className="card-body p-0 d-flex flex-column" style={{ height: '100%' }}>
              <div className="row g-0 flex-grow-1" style={{ minHeight: 0 }}>
                {/* Users Sidebar */}
                <div className="col-md-4 col-lg-3 border-end d-flex flex-column" style={{ 
                  height: '100%',
                  minHeight: 0
                }}>
                  <div className="p-3 border-bottom bg-light flex-shrink-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <Users size={20} className="text-primary" />
                        <h5 className="mb-0 fw-bold">Contacts</h5>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {connectionState === 'Connected' ? (
                          <Wifi size={16} className="text-success" title="Connected" />
                        ) : (
                          <WifiOff size={16} className="text-danger" title="Disconnected" />
                        )}
                        {connectionState === 'Disconnected' && (
                          <button
                            onClick={handleManualReconnect}
                            className="btn btn-sm btn-outline-primary p-1"
                            title="Reconnect"
                          >
                            <RefreshCw size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow-1 overflow-auto" style={{ 
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    minHeight: 0
                  }}>
                    {users.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <Users size={48} className="mb-3" style={{ opacity: 0.3 }} />
                        <p>No contacts available</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {users.map(u => (
                          <div
                            key={String(u.id)}
                            className={`list-group-item list-group-item-action ${String(selectedUser?.id) === String(u.id) ? 'active' : ''}`}
                            onClick={() => setSelectedUser(u)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex align-items-center">
                              <div className="position-relative">
                                <img
                                  src={userPhotos[String(u.id)] || generateInitialAvatar(u.name, u.role)}
                                  alt={u.name}
                                  className="rounded-circle border"
                                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                                {u.lastActive === 'online' && (
                                  <span
                                    className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
                                    style={{ width: '12px', height: '12px' }}
                                  ></span>
                                )}
                              </div>
                              <div className="ms-3 flex-grow-1">
                                <h6 className="mb-0">{u.name}</h6>
                                <small className={String(selectedUser?.id) === String(u.id) ? 'text-white-50' : 'text-muted'}>
                                  {capitalizeRole(u.role)}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Chat Area */}
                <div className="col-md-8 col-lg-9 d-flex flex-column" style={{ 
                  height: '100%',
                  minHeight: 0
                }}>
                  {selectedUser ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-3 border-bottom bg-light flex-shrink-0">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={userPhotos[String(selectedUser.id)] || generateInitialAvatar(selectedUser.name, selectedUser.role)}
                            alt={selectedUser.name}
                            className="rounded-circle border"
                            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                          />
                          <div className="flex-grow-1">
                            <h6 className="mb-0 fw-bold">{selectedUser.name}</h6>
                            <small className="text-muted">{capitalizeRole(selectedUser.role)}</small>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            {connectionState === 'Connected' ? (
                              <span className="badge bg-success">
                                <Wifi size={12} className="me-1" />
                                Connected
                              </span>
                            ) : (
                              <span className="badge bg-danger">
                                <WifiOff size={12} className="me-1" />
                                Disconnected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Messages Container */}
                      <div
                        ref={messagesContainerRef}
                        className="flex-grow-1 p-3"
                        style={{ 
                          backgroundColor: '#f8f9fa',
                          overflowY: 'auto',
                          overflowX: 'hidden',
                          minHeight: 0,
                          maxHeight: '100%'
                        }}
                      >
                        {isLoadingMessages ? (
                          <div className="d-flex align-items-center justify-content-center h-100">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading messages...</span>
                            </div>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                            <div className="text-center">
                              <Send size={48} className="mb-3" style={{ opacity: 0.3 }} />
                              <p>No messages yet. Start the conversation!</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {messages.map(msg => (
                              <div
                                key={String(msg.id)}
                                className={`mb-3 d-flex ${String(msg.senderId) === String(user.id) ? 'justify-content-end' : 'justify-content-start'}`}
                              >
                                <div
                                  className={`p-3 rounded-3 shadow-sm ${
                                    String(msg.senderId) === String(user.id)
                                      ? 'bg-primary text-white'
                                      : 'bg-white border'
                                  }`}
                                  style={{
                                    maxWidth: '70%',
                                    opacity: msg.isOptimistic ? 0.7 : 1,
                                    wordWrap: 'break-word',
                                    transition: 'opacity 0.3s ease'
                                  }}
                                >
                                  {msg.file && (
                                    <div className="mb-2">
                                      {userPhotos[String(msg.id)] ? (
                                        <img
                                          src={userPhotos[String(msg.id)]}
                                          alt="Attached"
                                          className="rounded img-fluid"
                                          style={{ maxHeight: '200px', maxWidth: '100%' }}
                                        />
                                      ) : loadingImages.has(String(msg.id)) ? (
                                        <div className="d-flex align-items-center gap-2 small">
                                          <div className="spinner-border spinner-border-sm" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                          </div>
                                          <span>Loading image...</span>
                                        </div>
                                      ) : (
                                        <div className="d-flex align-items-center gap-2 small">
                                          <Paperclip size={16} />
                                          <span>{msg.file}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {msg.text && <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>}
                                  <small className={String(msg.senderId) === String(user.id) ? 'text-white-50' : 'text-muted'}>
                                    {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {msg.isSending && (
                                      <span className="ms-2">
                                        <div className="spinner-border spinner-border-sm" role="status" style={{ width: '10px', height: '10px', borderWidth: '1px' }}>
                                          <span className="visually-hidden">Sending...</span>
                                        </div>
                                      </span>
                                    )}
                                    {msg.isDelivered && !msg.isSending && String(msg.senderId) === String(user.id) && (
                                      <span className="ms-1">✓✓</span>
                                    )}
                                    {msg.isOptimistic && !msg.isSending && ' ⏳'}
                                  </small>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} style={{ height: '1px' }} />
                          </>
                        )}
                      </div>
                      {/* Status Messages */}
                      {(connectionError || reconnectStatus) && (
                        <div className={`mx-3 mb-2 alert ${connectionError ? 'alert-danger' : 'alert-info'} py-2 mb-0 flex-shrink-0`}>
                          <small>{connectionError || reconnectStatus}</small>
                        </div>
                      )}
                      {/* File Preview */}
                      {file && (
                        <div className="mx-3 mb-2 alert alert-secondary py-2 d-flex justify-content-between align-items-center flex-shrink-0">
                          <div className="d-flex align-items-center gap-2">
                            <Paperclip size={16} />
                            <span className="small">{file.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              setFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="btn btn-sm btn-link text-danger p-0"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                      {/* Input Area */}
                      <div className="p-3 border-top bg-white flex-shrink-0">
                        <div className="input-group">
                          <input
                            type="text"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyPress={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            placeholder="Type your message..."
                            className="form-control"
                            disabled={connectionState !== 'Connected'}
                          />
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                            style={{ display: 'none' }}
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-outline-secondary"
                            disabled={connectionState !== 'Connected'}
                            title="Attach image"
                          >
                            <Paperclip size={18} />
                          </button>
                          <button
                            onClick={handleSendMessage}
                            disabled={(!message.trim() && !file) || connectionState !== 'Connected' || isSendingMessage}
                            className="btn btn-primary"
                          >
                            {isSendingMessage ? (
                              <>
                                <div className="spinner-border spinner-border-sm me-1" role="status" style={{ width: '14px', height: '14px', borderWidth: '2px' }}>
                                  <span className="visually-hidden">Sending...</span>
                                </div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send size={18} className="me-1" />
                                Send
                              </>
                            )}
                          </button>
                        </div>
                        {connectionState !== 'Connected' && (
                          <small className="text-muted d-block mt-2">
                            <WifiOff size={12} className="me-1" />
                            Waiting for connection...
                          </small>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                      <div className="text-center">
                        <Users size={64} className="mb-3" style={{ opacity: 0.3 }} />
                        <h5>Select a contact to start chatting</h5>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatApp;