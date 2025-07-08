import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Pages/AuthPage';
import * as signalR from '@microsoft/signalr';

const ChatApp = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectStatus, setReconnectStatus] = useState('');
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [userPhotos, setUserPhotos] = useState({});
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const connectionRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  const capitalizeRole = role => role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  // Generate avatar with initials
  const generateInitialAvatar = (name, role) => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
    
    const colors = {
      doctor: { bg: '#4CAF50', text: '#FFFFFF' },
      nurse: { bg: '#2196F3', text: '#FFFFFF' },
      laboratory: { bg: '#FF9800', text: '#FFFFFF' },
      patient: { bg: '#9C27B0', text: '#FFFFFF' },
      default: { bg: '#757575', text: '#FFFFFF' }
    };
    
    const colorScheme = colors[role?.toLowerCase()] || colors.default;
    
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = colorScheme.bg;
    ctx.beginPath();
    ctx.arc(20, 20, 20, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = colorScheme.text;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 20, 20);
    
    return canvas.toDataURL();
  };

  // Enhanced SignalR connection with multiple transport fallbacks
  const initializeSignalR = async () => {
    if (!user?.accessToken || !user?.id) {
      console.warn('Missing access token or user ID, skipping SignalR initialization at', new Date().toISOString());
      return;
    }

    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping existing connection:', err);
      }
    }

    const hubUrl = 'https://physiocareapp.runasp.net/chatHub';
    
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => user.accessToken,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
        withCredentials: false,
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          const delay = Math.min(30000, Math.pow(2, retryContext.previousRetryCount) * 1000 + Math.random() * 1000);
          console.log(`Next retry in ${delay}ms (attempt ${retryContext.previousRetryCount + 1})`);
          return delay;
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      setConnectionState('Reconnecting');
      setReconnectStatus('Reconnecting...');
    });

    connection.onreconnected(() => {
      console.log('SignalR reconnected successfully');
      setConnectionState('Connected');
      setConnectionError(null);
      setReconnectStatus('');
      retryCountRef.current = 0;
    });

    connection.onclose(async (error) => {
      console.error('Connection closed at', new Date().toISOString(), ':', error);
      setConnectionState('Disconnected');
      
      if (error) {
        setConnectionError(`Connection lost: ${error.message || 'Unknown error'}`);
        
        if (retryCountRef.current < maxRetries) {
          setReconnectStatus(`Attempting to reconnect (${retryCountRef.current + 1}/${maxRetries})...`);
          await attemptManualReconnection();
        } else {
          setReconnectStatus('Max reconnection attempts reached. Please refresh the page.');
        }
      }
    });

    connection.on('ReceiveMessage', (senderId, recipientId, messageText, date, fileName, lastView, onlineNow) => {
      console.log('Received message at', new Date().toISOString(), ':', { senderId, recipientId, messageText, date, fileName, lastView, onlineNow });
      if (
        (senderId === selectedUser?.id && recipientId === user.id) ||
        (senderId === user.id && recipientId === selectedUser?.id)
      ) {
        const newMessage = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: messageText || 'No text',
          senderId,
          recipientId,
          date: date || new Date().toISOString(),
          file: fileName || null,
          lastView: lastView || null,
          onlineNow: onlineNow || false,
        };
        setMessages(prev => [...prev, newMessage].sort((a, b) => new Date(a.date) - new Date(b.date)));
        if (fileName) fetchUserPhoto(fileName, '', newMessage.id + '-chat', true);
      }
    });

    connection.on('UserStatusChanged', (userId, status) => {
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, lastActive: status } : u))
      );
    });

    connection.on('updateuserlist', (userList) => {
      console.log('Received updateuserlist at', new Date().toISOString(), ':', userList);
      if (Array.isArray(userList)) {
        const mappedUsers = userList.map(u => ({
          id: u.userId || u.id || u.UserId || u.Id,
          name: u.fullName || u.userName || u.FullName || u.UserName || `${capitalizeRole(u.role || u.Role || 'user')} User`,
          role: u.role || u.Role || 'user',
          fileName: u.fileName || u.FileName || null,
          lastActive: u.lastActive || u.LastActive || 'offline',
        }));
        
        const uniqueUsers = mappedUsers.reduce((acc, user) => {
          if (!acc.find(u => u.id === user.id)) {
            acc.push(user);
          }
          return acc;
        }, []);
        
        setUsers(prev => {
          const existingIds = new Set(prev.map(u => u.id));
          const newUsers = uniqueUsers.filter(u => !existingIds.has(u.id));
          const updatedUsers = prev.map(u => {
            const updated = uniqueUsers.find(nu => nu.id === u.id);
            return updated || u;
          });
          return [...updatedUsers, ...newUsers];
        });
        uniqueUsers.forEach(u => fetchUserPhoto(u.fileName, u.role, u.id));
      } else {
        console.warn('updateuserlist payload is not an array at', new Date().toISOString(), ':', userList);
      }
    });

    try {
      setConnectionState('Connecting');
      setReconnectStatus('Connecting...');
      
      await connection.start();
      
      console.log('SignalR connected at', new Date().toISOString());
      console.log('Transport:', connection.transport?.name || 'Unknown');
      setConnectionState('Connected');
      setConnectionError(null);
      setReconnectStatus('');
      retryCountRef.current = 0;
      
    } catch (err) {
      console.error('SignalR connection error at', new Date().toISOString(), ':', err);
      setConnectionState('Disconnected');
      
      let errorMessage = 'Failed to connect to real-time chat.';
      
      if (err.message.includes('WebSocket')) {
        errorMessage += ' WebSocket connection failed.';
      } else if (err.message.includes('NetworkError')) {
        errorMessage += ' Network error detected.';
      } else if (err.message.includes('404')) {
        errorMessage += ' Chat service endpoint not found.';
      } else if (err.message.includes('401') || err.message.includes('403')) {
        errorMessage += ' Authentication failed.';
      }
      
      setConnectionError(errorMessage);
      
      if (retryCountRef.current < maxRetries) {
        setReconnectStatus(`Attempting to reconnect (${retryCountRef.current + 1}/${maxRetries})...`);
        await attemptManualReconnection();
      }
    }
  };

  const attemptManualReconnection = async () => {
    retryCountRef.current += 1;
    
    if (retryCountRef.current > maxRetries) {
      setReconnectStatus('Max reconnection attempts reached. Please refresh the page.');
      return;
    }

    const delay = Math.min(30000, Math.pow(2, retryCountRef.current) * 1000);
    console.log(`Manual reconnection attempt ${retryCountRef.current} in ${delay}ms`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (connectionRef.current?.state === signalR.HubConnectionState.Disconnected) {
      try {
        setConnectionState('Connecting');
        await connectionRef.current.start();
        
        console.log('Manual reconnection successful');
        setConnectionState('Connected');
        setConnectionError(null);
        setReconnectStatus('');
        retryCountRef.current = 0;
        
      } catch (err) {
        console.error('Manual reconnection failed:', err);
        setConnectionState('Disconnected');
        
        if (retryCountRef.current < maxRetries) {
          setReconnectStatus(`Reconnection failed. Retrying (${retryCountRef.current + 1}/${maxRetries})...`);
          await attemptManualReconnection();
        } else {
          setConnectionError('Unable to establish connection. Please check your network and refresh the page.');
          setReconnectStatus('Max attempts reached.');
        }
      }
    }
  };

  const checkConnectionHealth = () => {
    if (connectionRef.current) {
      const state = connectionRef.current.state;
      setConnectionState(
        state === signalR.HubConnectionState.Connected ? 'Connected' :
        state === signalR.HubConnectionState.Connecting ? 'Connecting' :
        state === signalR.HubConnectionState.Reconnecting ? 'Reconnecting' :
        'Disconnected'
      );
    }
  };

  const handleManualReconnect = async () => {
    retryCountRef.current = 0;
    setConnectionError(null);
    setReconnectStatus('');
    await initializeSignalR();
  };

  const fetchUserPhoto = async (fileName, role, userId, isChat = false) => {
    const userInfo = users.find(u => u.id === userId) || { name: 'User', role: role || 'user' };
    const initialAvatar = generateInitialAvatar(userInfo.name, userInfo.role);
    
    setUserPhotos(prev => ({ ...prev, [userId]: initialAvatar }));
    
    if (!fileName || !user?.accessToken) {
      console.warn(`No fileName for user ${userId} at ${new Date().toISOString()}, using initial avatar`);
      return;
    }
    
    const path = isChat ? 'Chat' : `Actors/${capitalizeRole(role)}`;
    const url = `https://physiocareapp.runasp.net/api/v1/Upload/image?filename=${encodeURIComponent(fileName)}&path=${encodeURIComponent(path)}`;
    
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const imgUrl = URL.createObjectURL(blob);
        setUserPhotos(prev => ({ ...prev, [userId]: imgUrl }));
      } else {
        console.warn(`Photo fetch failed for ${userId} at ${new Date().toISOString()}: ${res.status} ${res.statusText}, falling back to avatar`);
      }
    } catch (err) {
      console.error(`Image fetch error for ${userId} at ${new Date().toISOString()}:`, err);
    }
  };

  const fetchChatUsers = async () => {
    if (!user?.accessToken || !user?.id) return;
    const role = user.role?.toLowerCase() || 'patient';
    let rolesToFetch = [];

    if (role === 'patient') {
      rolesToFetch = ['doctor', 'nurse', 'laboratory'];
    } else {
      rolesToFetch = ['patient'];
    }

    try {
      const chatRes = await fetch(
        `https://physiocareapp.runasp.net/api/v1/Message/get-all-users-chatting-with-current-users?CurrentUserId=${user.id}`,
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        }
      );
      if (!chatRes.ok) throw new Error(`HTTP error! status: ${chatRes.status}`);
      let chatData = await chatRes.json().catch(err => {
        console.error('Invalid JSON from chat users endpoint at', new Date().toISOString(), ':', err);
        return [];
      });
      const chattedUserIds = new Set(chatData.map(u => u.userId || u.id));

      const rolePromises = rolesToFetch.map(async r => {
        const res = await fetch(
          `https://physiocareapp.runasp.net/api/v1/Admins/get-all-basic-info-users-by-role?role=${r}`,
          {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        let data = await res.json().catch(err => {
          console.error(`Invalid JSON from role ${r} endpoint at`, new Date().toISOString(), ':', err);
          return [];
        });
        return Array.isArray(data)
          ? data
              .filter(u => u.lastActive === 'online' || chattedUserIds.has(u.userId || u.id))
              .map(u => ({ ...u, role: r }))
          : [];
      });

      const allUsers = (await Promise.all(rolePromises)).flat();
      const mapped = allUsers.map(u => ({
        id: u.userId || u.id,
        name: u.fullName || u.userName || `${capitalizeRole(u.role)} User`,
        role: u.role,
        fileName: u.fileName || null,
        lastActive: u.lastActive || 'offline',
      }));

      const uniqueUsers = mapped.reduce((acc, user) => {
        if (!acc.find(u => u.id === user.id)) {
          acc.push(user);
        }
        return acc;
      }, []);

      setUsers(uniqueUsers);
      uniqueUsers.forEach(u => fetchUserPhoto(u.fileName, u.role, u.id));
    } catch (err) {
      console.error('fetchChatUsers error at', new Date().toISOString(), ':', err);
      if (err.message.includes('NetworkError')) {
        setConnectionError('Network issue detected while loading chat users.');
      } else {
        setConnectionError('Failed to load chat users. Check server response.');
      }
      setUsers([]);
    }
  };

  const fetchMessages = async recipientId => {
    if (!user?.accessToken || !user?.id || !recipientId) return;

    try {
      const res = await fetch(
        `https://physiocareapp.runasp.net/api/v1/Chat/get-all-messages?senderId=${user.id}&recipientId=${recipientId}`,
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        }
      );
      
      if (!res.ok) {
        console.warn('Chat endpoint failed, trying Message endpoint');
        return await fetchMessagesFromMessageEndpoint(recipientId);
      }

      let data = await res.json().catch(err => {
        console.error('Invalid JSON from chat messages endpoint at', new Date().toISOString(), ':', err);
        return [];
      });

      console.log('Fetched messages at', new Date().toISOString(), ':', data.map(m => ({ senderId: m.senderId, text: m.messageText, date: m.date, fileName: m.fileName })));
      const formatted = await Promise.all(
        (Array.isArray(data) ? data : []).map(async m => {
          const messageId = m.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          if (m.fileName) await fetchUserPhoto(m.fileName, '', messageId + '-chat', true);
          return {
            id: messageId,
            text: m.messageText || 'No text',
            senderId: m.senderId,
            recipientId: m.recipientId,
            date: m.date || new Date().toISOString(),
            file: m.fileName || null,
            lastView: m.lastView || null,
            onlineNow: m.onlineNow || false,
          };
        })
      );
      setMessages(formatted.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (err) {
      console.error('fetchMessages error at', new Date().toISOString(), ':', err);
      await fetchMessagesFromMessageEndpoint(recipientId);
    }
  };

  const fetchMessagesFromMessageEndpoint = async recipientId => {
    try {
      let res = await fetch(
        `https://physiocareapp.runasp.net/api/v1/Message/get-all-messages-by-sender-id-and-recipient-id?senderId=${user.id}&recipientId=${recipientId}`,
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        }
      );
      let data = await res.json().catch(err => {
        console.error('Invalid JSON from messages endpoint (sender) at', new Date().toISOString(), ':', err);
        return [];
      });

      if (!data.length || data.every(m => m.senderId === user.id)) {
        console.warn('No messages or only sender messages, fetching with reversed IDs at', new Date().toISOString());
        res = await fetch(
          `https://physiocareapp.runasp.net/api/v1/Message/get-all-messages-by-sender-id-and-recipient-id?senderId=${recipientId}&recipientId=${user.id}`,
          {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }
        );
        if (!res.ok) throw new Error(`HTTP error for reversed fetch! status: ${res.status}`);
        data = await res.json().catch(err => {
          console.error('Invalid JSON from messages endpoint (recipient) at', new Date().toISOString(), ':', err);
          return [];
        });
      }

      console.log('Fetched messages (fallback) at', new Date().toISOString(), ':', data.map(m => ({ senderId: m.senderId, text: m.messageText, date: m.date, fileName: m.fileName })));
      const formatted = await Promise.all(
        data.map(async m => {
          const messageId = m.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          if (m.fileName) await fetchUserPhoto(m.fileName, '', messageId + '-chat', true);
          return {
            id: messageId,
            text: m.messageText || 'No text',
            senderId: m.senderId,
            recipientId: m.recipientId,
            date: m.date || new Date().toISOString(),
            file: m.fileName,
          };
        })
      );
      setMessages(formatted.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (err) {
      console.error('fetchMessagesFromMessageEndpoint error at', new Date().toISOString(), ':', err);
      if (err.message.includes('NetworkError')) {
        setConnectionError('Network issue detected while loading messages.');
      } else {
        setConnectionError('Failed to load messages.');
      }
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!user?.accessToken || !selectedUser || (!message.trim() && !file)) return;

    const optimisticMessage = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: message || '',
      senderId: user.id,
      recipientId: selectedUser.id,
      date: new Date().toISOString(),
      file: file ? file.name : null,
      isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMessage].sort((a, b) => new Date(a.date) - new Date(b.date)));

    const messageToSend = message;
    const fileToSend = file;
    setMessage('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      try {
        await connectionRef.current.invoke('SendMessage', user.id, selectedUser.id, messageToSend, new Date().toISOString(), fileToSend ? fileToSend.name : null);
      } catch (signalRError) {
        console.error('SignalR invoke error at', new Date().toISOString(), ':', signalRError);
      }
    }

    const formData = new FormData();
    formData.append('SenderId', user.id);
    formData.append('RecipientId', selectedUser.id);
    formData.append('Date', new Date().toISOString());
    formData.append('MessageText', messageToSend);
    formData.append('UserName', user.name || user.userName);
    if (fileToSend) formData.append('ImageFile', fileToSend);

    try {
      const res = await fetch('https://physiocareapp.runasp.net/api/v1/Chat/sendmessage', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.accessToken}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const responseText = await res.text();
      console.log('Message sent at', new Date().toISOString(), ':', responseText);

      setMessages(prev => {
        const withoutOptimistic = prev.filter(m => m.id !== optimisticMessage.id);
        const confirmedMessage = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: messageToSend,
          senderId: user.id,
          recipientId: selectedUser.id,
          date: new Date().toISOString(),
          file: fileToSend ? fileToSend.name : null,
        };
        return [...withoutOptimistic, confirmedMessage].sort((a, b) => new Date(a.date) - new Date(b.date));
      });

    } catch (err) {
      console.error('Send error at', new Date().toISOString(), ':', err);
      
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setMessage(messageToSend);
      setFile(fileToSend);
      
      if (err.message.includes('NetworkError')) {
        setConnectionError('Network issue detected while sending message.');
      } else {
        setConnectionError('Failed to send message. Check connection or server.');
      }
    }
  };

  useEffect(() => {
    fetchChatUsers();
    initializeSignalR();
    console.log('Component mounted, user:', user?.id, 'at', new Date().toISOString());

    const healthCheckInterval = setInterval(checkConnectionHealth, 5000);

    return () => {
      clearInterval(healthCheckInterval);
      if (connectionRef.current) {
        connectionRef.current.stop().catch(err =>
          console.error('SignalR disconnect error at', new Date().toISOString(), ':', err)
        );
        console.log('SignalR disconnected at', new Date().toISOString());
      }
    };
  }, [user?.id, user?.accessToken]);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.id);
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      style={{
        display: 'flex',
        padding: '20px',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: '33%',
          borderRight: '1px solid #ddd',
          paddingRight: '20px',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 40px)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>Chat Users</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 
                  connectionState === 'Connected' ? '#28a745' :
                  connectionState === 'Connecting' || connectionState === 'Reconnecting' ? '#ffc107' :
                  '#dc3545'
              }}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {connectionState}
            </span>
            {connectionState === 'Disconnected' && (
              <button
                onClick={handleManualReconnect}
                style={{
                  padding: '4px 8px',
                  fontSize: '10px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Reconnect
              </button>
            )}
          </div>
        </div>
        
        {users.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>No users available.</p>
        ) : (
          users.map(u => (
            <div
              key={`user-${u.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                cursor: 'pointer',
                backgroundColor: selectedUser?.id === u.id ? '#e0e0e0' : 'transparent',
                borderRadius: '5px',
                marginBottom: '5px',
                transition: 'background-color 0.2s',
              }}
              onClick={() => setSelectedUser(u)}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#d3d3d3')}
              onMouseOut={e =>
                (e.currentTarget.style.backgroundColor = selectedUser?.id === u.id ? '#e0e0e0' : 'transparent')
              }
            >
              <img
                src={userPhotos[u.id] || generateInitialAvatar(u.name, u.role)}
                alt={`${u.name}'s avatar`}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  marginRight: '10px',
                  objectFit: 'cover',
                  border: '1px solid #ccc',
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '500', margin: '0' }}>
                  {u.name}
                </p>
                <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0 0' }}>
                  {capitalizeRole(u.role)}
                  {u.lastActive === 'online' && (
                    <span style={{ color: 'green', marginLeft: '8px' }}>● Online</span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ flex: '1', paddingLeft: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Messages</h3>
        {selectedUser ? (
          <>
            <div
              style={{
                height: '400px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '5px',
                padding: '10px',
                backgroundColor: '#fff',
                marginBottom: '15px',
              }}
            >
              {messages.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: '50px' }}>
                  No messages yet. Start a conversation!
                </p>
              ) : (
                messages.map(msg => (
                  <div
                    key={`message-${msg.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                      marginBottom: '10px',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        backgroundColor: msg.senderId === user.id ? '#007bff' : '#e9ecef',
                        color: msg.senderId === user.id ? '#fff' : '#333',
                        position: 'relative',
                        opacity: msg.isOptimistic ? 0.7 : 1,
                      }}
                    >
                      {msg.file && (
                        <div style={{ marginBottom: '5px' }}>
                          {userPhotos[msg.id + '-chat'] ? (
                            <img
                              src={userPhotos[msg.id + '-chat']}
                              alt="Attached file"
                              style={{
                                maxWidth: '200px',
                                maxHeight: '150px',
                                borderRadius: '5px',
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                console.error(`Failed to load image for message ${msg.id} at ${new Date().toISOString()}`);
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '12px', fontStyle: 'italic' }}>
                              📎 {msg.file} (Loading...)
                            </span>
                          )}
                        </div>
                      )}
                      <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>
                        {msg.text}
                      </p>
                      <span
                        style={{
                          fontSize: '10px',
                          color: msg.senderId === user.id ? '#cce7ff' : '#888',
                          display: 'block',
                          marginTop: '4px',
                          textAlign: 'right',
                        }}
                      >
                        {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.isOptimistic && ' ⏳'}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {(connectionError || reconnectStatus) && (
              <div
                style={{
                  padding: '8px 12px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  backgroundColor: connectionError ? '#f8d7da' : '#d1ecf1',
                  color: connectionError ? '#721c24' : '#0c5460',
                  border: `1px solid ${connectionError ? '#f5c6cb' : '#bee5eb'}`,
                  fontSize: '12px',
                }}
              >
                {connectionError || reconnectStatus}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                style={{
                  flex: '1',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px',
                  outline: 'none',
                }}
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
                style={{
                  padding: '10px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  minWidth: '40px',
                }}
                disabled={connectionState !== 'Connected'}
                title="Attach image"
              >
                📎
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={(!message.trim() && !file) || connectionState !== 'Connected'}
                style={{
                  padding: '10px 15px',
                  backgroundColor: (!message.trim() && !file) || connectionState !== 'Connected' ? '#ccc' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: (!message.trim() && !file) || connectionState !== 'Connected' ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                Send
              </button>
            </div>

            {file && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '5px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>📎 {file.name}</span>
                <button
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc3545',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              color: '#888',
              fontSize: '16px',
              fontStyle: 'italic',
            }}
          >
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;