import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, X, RefreshCw, Wifi, WifiOff, Users, Bell, CheckCheck, Check, Clock, AlertCircle, ChevronDown, ChevronRight, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../Pages/AuthPage';

const ChatApp = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [chattedUsers, setChattedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [userPhotos, setUserPhotos] = useState({});
  const [messageImages, setMessageImages] = useState({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  
  const [expandedSections, setExpandedSections] = useState({
    chatted: true,
    online: true,
    doctor: true,
    nurse: true,
    laboratory: true
  });

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageIdsRef = useRef(new Set());
  const hubConnectionRef = useRef(null);
  const pendingMessagesRef = useRef({});
  const selectedUserRef = useRef(null);
  const imageFetchQueueRef = useRef([]);
  const isFetchingImagesRef = useRef(false);
  const imageCacheRef = useRef(new Map());
  const abortControllersRef = useRef(new Map());
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttempts = 5;

  const addDebugLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-50), { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  }, []);

  const addLiveEvent = useCallback((event, type = 'message') => {
    const id = `event-${Date.now()}-${Math.random()}`;
    setLiveEvents(prev => [...prev.slice(-5), { id, event, type, timestamp: new Date() }]);
    setTimeout(() => {
      setLiveEvents(prev => prev.filter(e => e.id !== id));
    }, 4000);
  }, []);

  const apiFetch = useCallback(async (url, options = {}, retryCount = 0) => {
    const maxRetries = 2;
    addDebugLog(`API Request: ${options.method || 'GET'} ${url}`, 'info');

    const accessToken = localStorage.getItem('accessToken') || user?.accessToken;

    const config = {
      ...options,
      headers: {
        'Content-Type': options.body instanceof FormData ? undefined : 'application/json',
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
      mode: 'cors',
      credentials: 'omit',
    };

    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      addDebugLog(`Response Status: ${response.status}`, response.ok ? 'success' : 'error');

      if (response.status === 429) {
        if (retryCount < maxRetries) {
          const waitTime = Math.min(2000 * Math.pow(2, retryCount), 10000);
          addDebugLog(`Rate limited. Retrying in ${waitTime / 1000}s`, 'warning');
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return apiFetch(url, options, retryCount + 1);
        }
        throw new Error('Rate limit exceeded');
      }

      if (response.ok) {
        setConnectionError(null);
        return response;
      }

      if (response.status === 401 && retryCount === 0) {
        addDebugLog('Token expired, logging out...', 'error');
        logout();
        throw new Error('Authentication expired');
      }

      const errorText = await response.text().catch(() => '');
      throw new Error(`API Error ${response.status}: ${errorText}`);
    } catch (error) {
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        addDebugLog(`Network error: ${error.message}`, 'error');
        setConnectionError('Network error. Check connection.');
        throw new Error('Network error');
      }
      throw error;
    }
  }, [user?.accessToken, logout, addDebugLog]);

  const fetchImageWithRetry = useCallback(async (url, options, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        abortControllersRef.current.set(url, controller);
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        abortControllersRef.current.delete(url);
        
        if (response.ok) {
          return response;
        }
        
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        addDebugLog(`Image fetch attempt ${attempt} failed, retrying in ${delay}ms: ${error.message}`, 'warning');
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [addDebugLog]);

  const fetchMessageImage = useCallback(async (fileName, messageId) => {
    const accessToken = localStorage.getItem('accessToken') || user?.accessToken;
    if (!fileName || !accessToken) return null;

    // Check cache first
    const cacheKey = `${fileName}-${messageId}`;
    if (imageCacheRef.current.has(cacheKey)) {
      const cachedUrl = imageCacheRef.current.get(cacheKey);
      setMessageImages(prev => ({ ...prev, [messageId]: cachedUrl }));
      return cachedUrl;
    }

    // Add to queue
    const task = async () => {
      try {
        const url = `https://physiocareapp.runasp.net/api/v1/Upload/image?filename=${encodeURIComponent(fileName)}&path=Chat`;
        const options = {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        };

        const res = await fetchImageWithRetry(url, options);
        
        if (res.ok) {
          const blob = await res.blob();
          const imgUrl = URL.createObjectURL(blob);
          
          // Cache the result
          imageCacheRef.current.set(cacheKey, imgUrl);
          setMessageImages(prev => ({ ...prev, [messageId]: imgUrl }));
          addDebugLog(`✅ Image loaded: ${fileName}`, 'success');
          return imgUrl;
        } else {
          // Try alternative paths
          const paths = ['Chats', 'chat', 'chats', 'Messages', 'message'];
          for (const path of paths) {
            try {
              const altUrl = `https://physiocareapp.runasp.net/api/v1/Upload/image?filename=${encodeURIComponent(fileName)}&path=${path}`;
              const altRes = await fetchImageWithRetry(altUrl, options);
              
              if (altRes.ok) {
                const blob = await altRes.blob();
                const imgUrl = URL.createObjectURL(blob);
                
                // Cache the result
                imageCacheRef.current.set(cacheKey, imgUrl);
                setMessageImages(prev => ({ ...prev, [messageId]: imgUrl }));
                addDebugLog(`✅ Image loaded from ${path}: ${fileName}`, 'success');
                return imgUrl;
              }
            } catch (err) {
              continue;
            }
          }
          throw new Error('All paths failed');
        }
      } catch (err) {
        addDebugLog(`❌ Failed to fetch image ${fileName}: ${err.message}`, 'error');
        return null;
      }
    };

    // Add to queue and process
    imageFetchQueueRef.current.push({ task, messageId, fileName });
    processImageQueue();

    return null;
  }, [user?.accessToken, addDebugLog, fetchImageWithRetry]);

  const processImageQueue = useCallback(async () => {
    if (isFetchingImagesRef.current || imageFetchQueueRef.current.length === 0) {
      return;
    }

    isFetchingImagesRef.current = true;
    
    // Process max 2 images at a time
    const concurrentLimit = 2;
    const tasksToProcess = imageFetchQueueRef.current.splice(0, concurrentLimit);
    
    addDebugLog(`Processing ${tasksToProcess.length} images from queue (${imageFetchQueueRef.current.length} remaining)`, 'info');
    
    await Promise.allSettled(
      tasksToProcess.map(async ({ task, messageId, fileName }) => {
        try {
          await task();
        } catch (error) {
          addDebugLog(`❌ Queue task failed for ${fileName}: ${error.message}`, 'error');
        }
      })
    );
    
    // Add delay between batches to avoid overwhelming server
    await new Promise(resolve => setTimeout(resolve, 500));
    
    isFetchingImagesRef.current = false;
    
    // Process next batch if any
    if (imageFetchQueueRef.current.length > 0) {
      setTimeout(processImageQueue, 100);
    }
  }, [addDebugLog]);

  const setupSignalRConnection = useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken') || user?.accessToken;
    if (!accessToken) {
      addDebugLog('No access token available for SignalR', 'error');
      return;
    }
    
    // Clear any existing connection
    if (hubConnectionRef.current) {
      try {
        await hubConnectionRef.current.stop();
        hubConnectionRef.current = null;
      } catch (err) {
        addDebugLog(`Error stopping previous connection: ${err.message}`, 'error');
      }
    }
    
    connectionAttemptsRef.current += 1;
    
    if (connectionAttemptsRef.current > maxConnectionAttempts) {
      addDebugLog(`Max connection attempts (${maxConnectionAttempts}) reached. Will retry later.`, 'error');
      setConnectionError('Connection failed after multiple attempts. Please refresh the page.');
      return;
    }
    
    addDebugLog(`Setting up SignalR connection (attempt ${connectionAttemptsRef.current}/${maxConnectionAttempts})...`, 'info');

    try {
      // Test connection first
      const testUrl = 'https://physiocareapp.runasp.net/chathub/negotiate';
      try {
        const testResponse = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!testResponse.ok) {
          throw new Error(`Negotiation failed: ${testResponse.status}`);
        }
        
        const negotiateData = await testResponse.json();
        addDebugLog(`✅ Negotiation successful: ${JSON.stringify(negotiateData)}`, 'success');
      } catch (negotiateError) {
        addDebugLog(`❌ Negotiation failed: ${negotiateError.message}`, 'error');
      }

      // Create connection with improved configuration
      const connection = new signalR.HubConnectionBuilder()
        .withUrl('https://physiocareapp.runasp.net/chathub', {
          accessTokenFactory: () => accessToken,
          transport: signalR.HttpTransportType.WebSockets | 
                    signalR.HttpTransportType.ServerSentEvents | 
                    signalR.HttpTransportType.LongPolling,
          skipNegotiation: false,
          withCredentials: false,
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.elapsedMilliseconds < 30000) {
              return 2000; // 2 seconds for first 30 seconds
            } else if (retryContext.elapsedMilliseconds < 60000) {
              return 5000; // 5 seconds for next 30 seconds
            } else {
              return 10000; // 10 seconds thereafter
            }
          }
        })
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // Connection timeout
      const connectionTimeout = setTimeout(() => {
        if (connection.state !== signalR.HubConnectionState.Connected) {
          addDebugLog('Connection timeout - stopping connection attempt', 'warning');
          connection.stop();
        }
      }, 30000);

      const safeHandler = (handlerName, handler) => {
        return (...args) => {
          try {
            handler(...args);
          } catch (error) {
            addDebugLog(`❌ Error in ${handlerName}: ${error.message}`, 'error');
            console.error(`SignalR ${handlerName} error:`, error);
          }
        };
      };

      connection.on('ReceiveMessage', safeHandler('ReceiveMessage', (param1, param2, param3, param4, param5) => {
        let senderId, recipientId, messageText, date, fileName, senderName;
        
        if (typeof param1 === 'string' && typeof param2 === 'string' && param3 && !param4) {
          senderName = param1;
          messageText = param2;
          senderId = param3;
          recipientId = user.id;
          date = new Date().toISOString();
          fileName = null;
          addDebugLog(`📨 Received OLD format: senderName=${senderName}, text="${messageText}", senderId=${senderId}`, 'info');
        }
        else if (param1 && param2 && typeof param3 === 'string') {
          senderId = param1;
          recipientId = param2;
          messageText = param3;
          date = param4 || new Date().toISOString();
          fileName = param5 || null;
          senderName = users.find(u => String(u.id) === String(senderId))?.name || 'Unknown';
          addDebugLog(`📨 Received NEW format: senderId=${senderId}, recipientId=${recipientId}, text="${messageText}"`, 'info');
        }
        else {
          addDebugLog(`⚠️ Unknown message format received: ${JSON.stringify([param1, param2, param3, param4, param5])}`, 'warning');
          return;
        }
        
        const recipientName = users.find(u => String(u.id) === String(recipientId))?.name || 'Unknown';
        
        addLiveEvent(`📨 ${senderName} → ${recipientName}: ${messageText?.substring(0, 30) || 'File'}`, 'message');
        addDebugLog(`📨 Processed message from ${senderName} (${senderId}) to ${recipientName} (${recipientId})`, 'success');

        const newMessage = {
          id: `signalr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          senderId: String(senderId),
          recipientId: String(recipientId),
          text: messageText || '',
          date: date || new Date().toISOString(),
          file: fileName || null,
          isOptimistic: false,
          isDelivered: true,
          isUnread: true
        };

        // Queue image fetch instead of fetching immediately
        if (newMessage.file && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(newMessage.file)) {
          setTimeout(() => {
            fetchMessageImage(newMessage.file, newMessage.id);
          }, 100); // Small delay to avoid immediate fetch
        }

        const isFromMe = String(senderId) === String(user.id);
        const isForMe = String(recipientId) === String(user.id);
        const otherUserId = isFromMe ? String(recipientId) : String(senderId);
        
        const currentSelectedUser = selectedUserRef.current;
        const isCurrentConversation = currentSelectedUser && (
          String(currentSelectedUser.id) === otherUserId || 
          String(currentSelectedUser.id) === String(senderId) || 
          String(currentSelectedUser.id) === String(recipientId)
        );

        addDebugLog(`Message routing: isFromMe=${isFromMe}, isForMe=${isForMe}, otherUserId=${otherUserId}, selectedUserId=${currentSelectedUser?.id}, isCurrentConversation=${isCurrentConversation}`, 'info');

        if (isCurrentConversation) {
          addDebugLog(`💬 Delivering message to current conversation UI`, 'success');
          setMessages(prev => {
            const withoutOptimistic = prev.filter(m => {
              if (!m.isOptimistic) return true;
              const isSameMessage = String(m.senderId) === String(newMessage.senderId) &&
                String(m.recipientId) === String(newMessage.recipientId) &&
                (m.text || '').trim() === (newMessage.text || '').trim() &&
                (m.file || null) === (newMessage.file || null);
              if (isSameMessage) {
                addDebugLog(`🔄 Replacing optimistic message with real SignalR message`, 'success');
              }
              return !isSameMessage;
            });
            
            const messageExists = withoutOptimistic.some(m => 
              String(m.senderId) === String(newMessage.senderId) &&
              String(m.recipientId) === String(newMessage.recipientId) &&
              (m.text || '').trim() === (newMessage.text || '').trim() &&
              Math.abs(new Date(m.date) - new Date(newMessage.date)) < 10000
            );

            if (messageExists) {
              addDebugLog(`⚠️ Duplicate message detected, skipping`, 'warning');
              return withoutOptimistic;
            }

            const updated = [...withoutOptimistic, { ...newMessage, isUnread: false }].sort((a, b) =>
              new Date(a.date) - new Date(b.date)
            );
            
            addDebugLog(`✅ Message added to UI. Total messages: ${updated.length}`, 'success');
            return updated;
          });

          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
            }
          }, 0);

          addDebugLog(`✅ Message instantly delivered to UI`, 'success');
        }
        else if (isFromMe) {
          const recipientIdStr = String(recipientId);
          addDebugLog(`📤 Storing my message for recipient ${recipientIdStr}`, 'info');
          
          pendingMessagesRef.current = {
            ...pendingMessagesRef.current,
            [recipientIdStr]: [
              ...(pendingMessagesRef.current[recipientIdStr] || []),
              newMessage
            ]
          };
        }
        else if (isForMe && !isFromMe) {
          const senderIdStr = String(senderId);
          addDebugLog(`📬 Storing incoming message from user ${senderIdStr}`, 'info');
          
          setUnreadCounts(prev => ({
            ...prev,
            [senderIdStr]: (prev[senderIdStr] || 0) + 1
          }));

          pendingMessagesRef.current = {
            ...pendingMessagesRef.current,
            [senderIdStr]: [
              ...(pendingMessagesRef.current[senderIdStr] || []),
              newMessage
            ]
          };

          const sender = users.find(u => String(u.id) === senderIdStr);
          if (sender) {
            setNotifications(prev => [...prev, {
              id: newMessage.id,
              senderName: sender.name,
              message: messageText || (fileName ? 'Sent an image' : 'Sent a message'),
              timestamp: new Date().toISOString()
            }]);
          }

          addDebugLog(`📬 Message stored for user ${senderIdStr}`, 'info');
        }
      }));

      connection.on('UpdateUserList', safeHandler('UpdateUserList', (userList) => {
        addDebugLog(`📋 UpdateUserList received: ${JSON.stringify(userList)}`, 'info');
        
        if (!userList || !Array.isArray(userList)) {
          addDebugLog(`⚠️ Invalid UpdateUserList format`, 'warning');
          return;
        }
        
        const onlineUserIds = new Set(
          userList.map(conn => {
            const id = conn.userId || conn.UserId || conn.userid;
            const normalizedId = String(id).toLowerCase().trim();
            addDebugLog(`📍 Online user detected: ${id} (normalized: ${normalizedId})`, 'info');
            return normalizedId;
          })
        );
        
        addDebugLog(`👥 Online users: ${Array.from(onlineUserIds).join(', ')}`, 'success');
        addLiveEvent(`📋 ${onlineUserIds.size} users online`, 'status');
        
        setUsers(prev =>
          prev.map(u => {
            const userId = String(u.id).toLowerCase().trim();
            const isOnline = onlineUserIds.has(userId);
            const newStatus = isOnline ? 'online' : 'offline';
            
            if (u.lastActive !== newStatus) {
              addDebugLog(`🔄 ${u.name} (${u.id}): ${u.lastActive || 'unknown'} → ${newStatus}`, isOnline ? 'success' : 'info');
            }
            
            return { ...u, lastActive: newStatus };
          })
        );
        
        if (selectedUserRef.current) {
          const selectedUserId = String(selectedUserRef.current.id).toLowerCase().trim();
          const isSelectedOnline = onlineUserIds.has(selectedUserId);
          setSelectedUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, lastActive: isSelectedOnline ? 'online' : 'offline' };
            selectedUserRef.current = updated;
            addDebugLog(`📍 Selected user ${prev.name}: ${isSelectedOnline ? 'ONLINE ✅' : 'OFFLINE'}`, isSelectedOnline ? 'success' : 'info');
            return updated;
          });
        }
      }));

      connection.on('UserStatusChanged', safeHandler('UserStatusChanged', (userId, isOnline) => {
        const userIdStr = String(userId).toLowerCase().trim();
        const userName = users.find(u => String(u.id).toLowerCase().trim() === userIdStr)?.name || `User ${userIdStr.substring(0, 8)}`;
        
        addLiveEvent(`👤 ${userName} is now ${isOnline ? '🟢 ONLINE' : '⚫ OFFLINE'}`, 'status');
        addDebugLog(`👤 UserStatusChanged: ${userName} (${userId}) → ${isOnline ? 'ONLINE ✅' : 'OFFLINE ⚫'}`, isOnline ? 'success' : 'info');
        
        const newStatus = isOnline ? 'online' : 'offline';
        
        setUsers(prev =>
          prev.map(u => {
            const uIdNormalized = String(u.id).toLowerCase().trim();
            if (uIdNormalized === userIdStr) {
              addDebugLog(`✅ Updated ${u.name} status to ${newStatus}`, 'success');
              return { ...u, lastActive: newStatus };
            }
            return u;
          })
        );
        
        if (selectedUserRef.current && String(selectedUserRef.current.id).toLowerCase().trim() === userIdStr) {
          setSelectedUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, lastActive: newStatus };
            selectedUserRef.current = updated;
            addDebugLog(`📍 Updated selected user status: ${newStatus.toUpperCase()}`, 'success');
            return updated;
          });
        }
      }));

      connection.on('UserStatusList', safeHandler('UserStatusList', (statusList) => {
        if (!statusList || !Array.isArray(statusList)) {
          addDebugLog(`⚠️ Invalid UserStatusList received: ${typeof statusList}`, 'warning');
          return;
        }
        
        addLiveEvent(`📋 Status update for ${statusList.length} users`, 'status');
        addDebugLog(`📋 UserStatusList received: ${JSON.stringify(statusList.slice(0, 3))}...`, 'info');
        
        setUsers(prev =>
          prev.map(u => {
            const status = statusList.find(s => String(s.userId) === String(u.id));
            if (status) {
              const newStatus = status.isOnline ? 'online' : 'offline';
              if (u.lastActive !== newStatus) {
                addDebugLog(`📊 ${u.name}: ${u.lastActive} → ${newStatus}`, 'info');
              }
              return { ...u, lastActive: newStatus };
            }
            return u;
          })
        );
        
        if (selectedUserRef.current) {
          const selectedStatus = statusList.find(s => String(s.userId) === String(selectedUserRef.current.id));
          if (selectedStatus) {
            setSelectedUser(prev => {
              if (!prev) return null;
              const updated = { ...prev, lastActive: selectedStatus.isOnline ? 'online' : 'offline' };
              selectedUserRef.current = updated;
              return updated;
            });
          }
        }
      }));

      connection.onreconnecting(() => {
        addLiveEvent('⚠️ Connection lost, reconnecting...', 'error');
        addDebugLog('SignalR reconnecting...', 'warning');
        setConnectionState('Reconnecting');
      });

      connection.onreconnected(async (connectionId) => {
        connectionAttemptsRef.current = 0; // Reset attempts on successful reconnect
        addLiveEvent('✅ Reconnected successfully', 'success');
        addDebugLog(`✅ SignalR reconnected with connection ID: ${connectionId}`, 'success');
        setConnectionState('Connected');
        
        // Try to send any pending messages
        if (selectedUserRef.current) {
          const userIdStr = String(selectedUserRef.current.id);
          if (pendingMessagesRef.current[userIdStr]?.length > 0) {
            addDebugLog(`🔄 Re-sending ${pendingMessagesRef.current[userIdStr].length} pending messages`, 'info');
          }
        }
      });

      connection.onclose((error) => {
        addLiveEvent('❌ Connection closed', 'error');
        addDebugLog(`SignalR connection closed: ${error?.message || 'No error'}`, 'error');
        setConnectionState('Disconnected');
        
        // Attempt to reconnect after delay
        if (connectionAttemptsRef.current < maxConnectionAttempts) {
          const delay = Math.min(5000 * connectionAttemptsRef.current, 30000); // Max 30 seconds
          addDebugLog(`Will attempt to reconnect in ${delay/1000} seconds`, 'info');
          setTimeout(() => {
            if (!hubConnectionRef.current || hubConnectionRef.current.state !== signalR.HubConnectionState.Connected) {
              setupSignalRConnection();
            }
          }, delay);
        }
      });

      // Start the connection
      addDebugLog('Starting SignalR connection...', 'info');
      await connection.start();
      
      clearTimeout(connectionTimeout);
      hubConnectionRef.current = connection;
      connectionAttemptsRef.current = 0; // Reset on successful connection
      setConnectionState('Connected');
      addLiveEvent('✅ Connected to chat server', 'success');
      addDebugLog('✅ SignalR connected successfully', 'success');

    } catch (err) {
      addLiveEvent(`❌ Connection failed: ${err.message}`, 'error');
      addDebugLog(`❌ SignalR connection failed: ${err.message}`, 'error');
      
      let errorMessage = 'Real-time connection failed. Messages will be delayed.';
      if (err.message.includes('404')) {
        errorMessage = 'Chat server not found. Please contact support.';
      } else if (err.message.includes('401')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error. Check your internet connection.';
      }
      
      setConnectionError(errorMessage);
      setConnectionState('Disconnected');
      
      // Schedule retry
      if (connectionAttemptsRef.current < maxConnectionAttempts) {
        const retryDelay = Math.min(5000 * connectionAttemptsRef.current, 30000);
        addDebugLog(`Scheduling retry in ${retryDelay/1000} seconds...`, 'info');
        setTimeout(() => {
          setupSignalRConnection();
        }, retryDelay);
      }
    }
  }, [user?.accessToken, user?.id, addDebugLog, users, addLiveEvent, fetchMessageImage]);

  const capitalizeRole = (role) => role?.charAt(0).toUpperCase() + role?.slice(1).toLowerCase() || 'User';

  const generateInitialAvatar = (name, role) => {
    const initials = name?.split(' ').map(word => word.charAt(0).toUpperCase()).join('').substring(0, 2) || 'U';
    const colors = {
      doctor: { bg: '#28a745', text: '#FFFFFF' },
      nurse: { bg: '#007bff', text: '#FFFFFF' },
      laboratory: { bg: '#fd7e14', text: '#FFFFFF' },
      patient: { bg: '#6f42c1', text: '#FFFFFF' },
      default: { bg: '#6c757d', text: '#FFFFFF' }
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

  const scrollToBottom = useCallback((behavior = 'auto') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  const fetchUserPhoto = async (fileName, role, userId) => {
    const userInfo = users.find(u => String(u.id) === String(userId)) || { name: 'User', role: role || 'user' };
    const initialAvatar = generateInitialAvatar(userInfo.name, userInfo.role);
    setUserPhotos(prev => ({ ...prev, [String(userId)]: initialAvatar }));

    const accessToken = localStorage.getItem('accessToken') || user?.accessToken;
    if (!fileName || !accessToken) return;

    const rolePath = capitalizeRole(role);
    
    const pathsToTry = [
      `Actors%2F${rolePath}`,
      'Actors%2FPatient',
      'Actors%2Fpatient',
      'Patient',
      'patient'
    ];
    
    for (const path of pathsToTry) {
      try {
        const url = `https://physiocareapp.runasp.net/api/v1/Upload/image?filename=${encodeURIComponent(fileName)}&path=${path}`;
        const res = await fetchImageWithRetry(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (res.ok) {
          const blob = await res.blob();
          const imgUrl = URL.createObjectURL(blob);
          setUserPhotos(prev => ({ ...prev, [String(userId)]: imgUrl }));
          addDebugLog(`✅ Loaded photo for user ${userId} from path: ${path}`, 'success');
          return;
        }
      } catch (err) {
        continue;
      }
    }
    
    addDebugLog(`Using initial avatar for user ${userId} - no photo found`, 'info');
  };

  const fetchChatUsers = async () => {
    const accessToken = localStorage.getItem('accessToken') || user?.accessToken;
    if (!accessToken || !user?.id) return;

    const role = (user.role || user.Role || 'patient').toLowerCase();
    const rolesToFetch = role === 'patient' ? ['doctor', 'nurse', 'laboratory'] : ['patient'];

    try {
      addDebugLog(`Fetching users for roles: ${rolesToFetch.join(', ')}`, 'info');

      const rolePromises = rolesToFetch.map(async r => {
        const res = await apiFetch(
          `https://physiocareapp.runasp.net/api/v1/Admins/get-all-basic-info-users-by-role?role=${r}`
        );
        if (!res.ok) return [];
        const data = await res.json().catch(() => []);
        return Array.isArray(data) ? data.map(u => ({ ...u, role: r })) : [];
      });

      const allUsers = (await Promise.all(rolePromises)).flat();

      const filteredUsers = allUsers.filter(u => {
        const userId = String(u.userId || u.id).trim();
        return userId && userId !== String(user.id).trim();
      });

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

      addDebugLog(`✅ Loaded ${uniqueUsers.length} users`, 'success');
      setUsers(uniqueUsers);

      // Fetch user photos with delay between each
      uniqueUsers.forEach((u, index) => {
        if (u.fileName) {
          setTimeout(() => {
            fetchUserPhoto(u.fileName, u.role, u.id);
          }, index * 300); // 300ms delay between each photo fetch
        } else {
          const avatar = generateInitialAvatar(u.name, u.role);
          setUserPhotos(prev => ({ ...prev, [String(u.id)]: avatar }));
        }
      });

      fetchChattedUsers();
    } catch (err) {
      addDebugLog(`Failed to fetch users: ${err.message}`, 'error');
    }
  };

  const fetchChattedUsers = async () => {
    const accessToken = localStorage.getItem('accessToken') || user?.accessToken;
    if (!accessToken || !user?.id) return;

    try {
      addDebugLog(`Fetching chatted users for current user ${user.id}`, 'info');
      
      const response = await apiFetch(
        `https://physiocareapp.runasp.net/api/v1/Message/get-all-users-chatting-with-current-users?CurrentUserId=${encodeURIComponent(user.id)}`
      );

      if (!response.ok) {
        addDebugLog(`Failed to fetch chatted users: ${response.status}`, 'warning');
        return;
      }

      const data = await response.json();
      const chattedUserIds = Array.isArray(data) ? data.map(u => String(u.userId || u.id || u)) : [];
      
      addDebugLog(`✅ Found ${chattedUserIds.length} chatted users`, 'success');

      setChattedUsers(prev => {
        const chatted = users.filter(u => 
          chattedUserIds.some(id => String(id).toLowerCase().trim() === String(u.id).toLowerCase().trim())
        );
        addDebugLog(`📨 Chatted users: ${chatted.map(u => u.name).join(', ')}`, 'info');
        return chatted;
      });
    } catch (err) {
      addDebugLog(`Failed to fetch chatted users: ${err.message}`, 'error');
    }
  };

  const fetchMessages = async (userId) => {
    const accessToken = localStorage.getItem('accessToken') || user?.accessToken;
    if (!userId || !accessToken) return;

    setIsLoadingMessages(true);

    try {
      const response = await apiFetch(
        `https://physiocareapp.runasp.net/api/v1/Message/get-all-messages-by-sender-id-and-recipient-id?senderId=${encodeURIComponent(user.id)}&recipientId=${encodeURIComponent(userId)}`
      );

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      const messagesArray = Array.isArray(data) ? data : [];

      messageIdsRef.current.clear();

      const mapped = messagesArray.map(msg => ({
        id: msg.id,
        text: msg.messageText || msg.text || '',
        senderId: String(msg.senderId || ''),
        recipientId: String(msg.recipientId || ''),
        date: msg.date || new Date().toISOString(),
        file: msg.fileName || msg.file || null,
        isOptimistic: false,
        isDelivered: true,
        isUnread: false
      }));

      const sorted = mapped.sort((a, b) => new Date(a.date) - new Date(b.date));

      const userIdStr = String(userId);
      const pendingMessages = pendingMessagesRef.current[userIdStr] || [];

      if (pendingMessages.length > 0) {
        addDebugLog(`Found ${pendingMessages.length} pending messages for user ${userIdStr}`, 'info');

        const allMessages = [...sorted, ...pendingMessages].sort((a, b) =>
          new Date(a.date) - new Date(b.date)
        );

        setMessages(allMessages);

        const newPending = { ...pendingMessagesRef.current };
        delete newPending[userIdStr];
        pendingMessagesRef.current = newPending;

        setUnreadCounts(prev => {
          const newCounts = { ...prev };
          delete newCounts[userIdStr];
          return newCounts;
        });
      } else {
        setMessages(sorted);
      }

      addDebugLog(`✅ Loaded ${sorted.length} messages`, 'success');
      setTimeout(() => scrollToBottom('auto'), 100);
      
      // Fetch images with delay to avoid overwhelming server
      sorted.forEach((msg, index) => {
        if (msg.file && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(msg.file)) {
          setTimeout(() => {
            fetchMessageImage(msg.file, msg.id);
          }, index * 500); // 500ms delay between each image fetch
        }
      });
    } catch (err) {
      addDebugLog(`Failed to fetch messages: ${err.message}`, 'error');
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    // Allow sending either text OR file (image) OR both
    if ((!message.trim() && !file) || !selectedUser) return;

    const messageToSend = message.trim();
    const fileToSend = file;
    const currentSelectedUser = selectedUser;

    setMessage('');
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create preview URL for immediate display
    let optimisticImageUrl = null;
    if (fileToSend && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileToSend.name)) {
      optimisticImageUrl = URL.createObjectURL(fileToSend);
      setMessageImages(prev => ({ ...prev, [optimisticId]: optimisticImageUrl }));
    }
    
    const optimisticMessage = {
      id: optimisticId,
      senderId: String(user.id),
      recipientId: String(currentSelectedUser.id),
      text: messageToSend,
      date: new Date().toISOString(),
      file: fileToSend ? fileToSend.name : null,
      isOptimistic: true,
      isDelivered: false,
      isUnread: false,
      // Store image blob URL for immediate display
      localImageUrl: optimisticImageUrl
    };

    // Immediately add to UI
    setMessages(prev => [...prev, optimisticMessage]);
    requestAnimationFrame(() => scrollToBottom('auto'));
    addDebugLog(`📤 Optimistic message shown (ID: ${optimisticId})`, 'info');

    // Send to server
    (async () => {
      try {
        const formData = new FormData();
        
        formData.append('SenderId', String(user.id));
        formData.append('RecipientId', String(currentSelectedUser.id));
        
        // CRITICAL FIX: Server requires MessageText to have a value, not null or empty
        // Send a space character if there's no text
        const messageText = messageToSend || ' ';
        formData.append('MessageText', messageText);
        
        const userName = user.name || user.userName || user.fullName || user.email?.split('@')[0] || 'User';
        formData.append('UserName', userName);

        if (fileToSend) {
          addDebugLog(`📎 Uploading file: ${fileToSend.name} (${(fileToSend.size / 1024).toFixed(2)} KB)`, 'info');
          formData.append('ImageFile', fileToSend, fileToSend.name);
        }

        addDebugLog(`📤 FormData: SenderId=${user.id}, RecipientId=${currentSelectedUser.id}, MessageText="${messageText}", UserName="${userName}", HasFile=${!!fileToSend}`, 'info');

        const accessToken = localStorage.getItem('accessToken') || user?.accessToken;
        
        if (!accessToken) {
          throw new Error('No access token available');
        }

        const response = await fetch('https://physiocareapp.runasp.net/api/v1/Chat/sendmessage', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData
        });

        addDebugLog(`📡 Response Status: ${response.status}`, response.ok ? 'success' : 'error');

        if (!response.ok) {
          let errorDetails = `HTTP ${response.status}`;
          try {
            const errorText = await response.text();
            addDebugLog(`❌ Error response body: ${errorText}`, 'error');
            
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.title) errorDetails = errorJson.title;
              if (errorJson.errors) {
                const validationErrors = Object.entries(errorJson.errors)
                  .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                  .join('; ');
                errorDetails = `Validation error: ${validationErrors}`;
              }
            } catch {
              errorDetails = errorText.substring(0, 200);
            }
          } catch {
            errorDetails = `HTTP ${response.status} - Could not read error details`;
          }
          
          throw new Error(errorDetails);
        }

        const responseData = await response.json().catch(() => ({ success: true }));
        addDebugLog(`✅ Server response: ${JSON.stringify(responseData)}`, 'success');
        addLiveEvent(`✅ Message sent to ${currentSelectedUser.name}`, 'success');

        // Update optimistic message to delivered state
        setTimeout(() => {
          setMessages(prev =>
            prev.map(m =>
              m.id === optimisticId ? { 
                ...m, 
                isOptimistic: false, 
                isDelivered: true,
                id: `delivered-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              } : m
            )
          );
          addDebugLog('✅ Optimistic message converted to delivered', 'success');
        }, 1000);

        // Try to send via SignalR if connected
        if (hubConnectionRef.current && hubConnectionRef.current.state === 'Connected') {
          try {
            // Send via SignalR for immediate delivery
            await hubConnectionRef.current.invoke('SendMessage', 
              String(user.id), 
              String(currentSelectedUser.id), 
              messageText,
              new Date().toISOString(),
              fileToSend ? fileToSend.name : null
            ).catch(err => {
              addDebugLog(`⚠️ SignalR send failed (but API succeeded): ${err.message}`, 'warning');
            });
          } catch (signalrErr) {
            addDebugLog(`⚠️ SignalR invoke error: ${signalrErr.message}`, 'warning');
          }
        } else {
          addDebugLog('⚠️ SignalR not connected, message saved via API only', 'warning');
        }

      } catch (err) {
        addLiveEvent(`❌ Failed: ${err.message}`, 'error');
        addDebugLog(`❌ Send failed: ${err.message}`, 'error');

        setMessages(prev =>
          prev.map(m =>
            m.id === optimisticId ? { 
              ...m, 
              isFailed: true, 
              isOptimistic: false, 
              errorMessage: err.message 
            } : m
          )
        );
      }
    })();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        alert('Invalid file type. Only images (JPG, PNG, GIF), PDFs, and Word documents are allowed.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      addDebugLog(`✅ File selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB, ${selectedFile.type})`, 'success');
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return 'Yesterday ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
        messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleUserClick = (clickedUser) => {
    if (selectedUser?.id === clickedUser.id) return;

    addDebugLog(`👤 Switching to conversation with ${clickedUser.name} (${clickedUser.id})`, 'info');
    
    setSelectedUser(clickedUser);
    selectedUserRef.current = clickedUser;
    
    setMessages([]);
    messageIdsRef.current.clear();

    const userIdStr = String(clickedUser.id);
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[userIdStr];
      return newCounts;
    });

    fetchMessages(clickedUser.id);
  };

  const handleNotificationClick = (notification) => {
    const sender = users.find(u => u.name === notification.senderName);
    if (sender) {
      handleUserClick(sender);
    }
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getCategorizedUsers = () => {
    const isPatient = (user.role || user.Role || 'patient').toLowerCase() === 'patient';
    
    if (!isPatient) {
      return { 
        chattedUsers: chattedUsers.filter(u => u.role.toLowerCase() === 'patient'),
        all: users 
      };
    }

    // Get online users from ALL roles
    const onlineUsers = users.filter(u => u.lastActive === 'online');
    const doctors = users.filter(u => u.role.toLowerCase() === 'doctor');
    const nurses = users.filter(u => u.role.toLowerCase() === 'nurse');
    const laboratories = users.filter(u => u.role.toLowerCase() === 'laboratory');

    return { chattedUsers, onlineUsers, doctors, nurses, laboratories };
  };

  const renderUserItem = (u) => {
    const unreadCount = unreadCounts[String(u.id)] || 0;
    return (
      <div
        key={u.id}
        onClick={() => handleUserClick(u)}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          backgroundColor: selectedUser?.id === u.id ? '#f0f2f5' : '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedUser?.id === u.id ? '#f0f2f5' : '#ffffff'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={userPhotos[String(u.id)] || generateInitialAvatar(u.name, u.role)}
              alt={u.name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: u.lastActive === 'online' ? '#25D366' : '#95a5a6',
                border: '2px solid #ffffff'
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: '600', fontSize: '15px', color: '#000000' }}>{u.name}</span>
              {unreadCount > 0 && (
                <div style={{
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {unreadCount}
                </div>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#667781' }}>
              {capitalizeRole(u.role)} • {u.lastActive === 'online' ? '🟢 Online' : '⚫ Offline'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategorizedUserList = () => {
    const isPatient = (user.role || user.Role || 'patient').toLowerCase() === 'patient';
    const categorized = getCategorizedUsers();

    if (!isPatient) {
      return (
        <>
          {categorized.chattedUsers.length > 0 && (
            <div>
              <div
                onClick={() => toggleSection('chatted')}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#e3f2fd',
                  borderBottom: '1px solid #bbdefb',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  color: '#1565c0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💬 Recent Chats ({categorized.chattedUsers.length})</span>
                </div>
                {expandedSections.chatted ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </div>
              {expandedSections.chatted && categorized.chattedUsers.map(u => renderUserItem(u))}
            </div>
          )}

          <div>
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#f5f5f5',
                borderBottom: '1px solid #e0e0e0',
                fontWeight: 'bold',
                color: '#666'
              }}
            >
              All Patients ({categorized.all.length})
            </div>
            {categorized.all.map(u => renderUserItem(u))}
          </div>
        </>
      );
    }

    return (
      <>
        {categorized.chattedUsers.length > 0 && (
          <div>
            <div
              onClick={() => toggleSection('chatted')}
              style={{
                padding: '12px 16px',
                backgroundColor: '#e3f2fd',
                borderBottom: '1px solid #bbdefb',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                color: '#1565c0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💬 Recent Chats ({categorized.chattedUsers.length})</span>
              </div>
              {expandedSections.chatted ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
            {expandedSections.chatted && categorized.chattedUsers.map(u => renderUserItem(u))}
          </div>
        )}

        {categorized.onlineUsers.length > 0 && (
          <div>
            <div
              onClick={() => toggleSection('online')}
              style={{
                padding: '12px 16px',
                backgroundColor: '#e8f5e9',
                borderBottom: '1px solid #c8e6c9',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                color: '#2e7d32'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#25D366' }}></div>
                <span>🟢 Online Now ({categorized.onlineUsers.length})</span>
              </div>
              {expandedSections.online ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
            {expandedSections.online && categorized.onlineUsers.map(u => renderUserItem(u))}
          </div>
        )}

        {categorized.doctors.length > 0 && (
          <div>
            <div
              onClick={() => toggleSection('doctor')}
              style={{
                padding: '12px 16px',
                backgroundColor: '#e8f5e9',
                borderBottom: '1px solid #c8e6c9',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                color: '#28a745'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👨‍⚕️ Doctors ({categorized.doctors.length})</span>
              </div>
              {expandedSections.doctor ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
            {expandedSections.doctor && categorized.doctors.map(u => renderUserItem(u))}
          </div>
        )}

        {categorized.nurses.length > 0 && (
          <div>
            <div
              onClick={() => toggleSection('nurse')}
              style={{
                padding: '12px 16px',
                backgroundColor: '#e3f2fd',
                borderBottom: '1px solid #bbdefb',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                color: '#1976d2'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👩‍⚕️ Nurses ({categorized.nurses.length})</span>
              </div>
              {expandedSections.nurse ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
            {expandedSections.nurse && categorized.nurses.map(u => renderUserItem(u))}
          </div>
        )}

        {categorized.laboratories.length > 0 && (
          <div>
            <div
              onClick={() => toggleSection('laboratory')}
              style={{
                padding: '12px 16px',
                backgroundColor: '#fff3e0',
                borderBottom: '1px solid #ffe0b2',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold',
                color: '#e65100'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔬 Laboratories ({categorized.laboratories.length})</span>
              </div>
              {expandedSections.laboratory ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
            {expandedSections.laboratory && categorized.laboratories.map(u => renderUserItem(u))}
          </div>
        )}
      </>
    );
  };

  useEffect(() => {
    if (user?.id && (localStorage.getItem('accessToken') || user?.accessToken)) {
      fetchChatUsers();
      
      // Delay SignalR connection to ensure auth is settled
      setTimeout(() => {
        setupSignalRConnection();
      }, 1000);

      const handleBeforeUnload = async () => {
        addDebugLog('Browser closing - SignalR will disconnect automatically', 'info');
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          addDebugLog('Tab hidden - connection maintained', 'info');
        } else {
          addDebugLog('Tab visible - connection active', 'info');
          // Try to reconnect if disconnected when tab becomes visible
          if (!hubConnectionRef.current || hubConnectionRef.current.state !== signalR.HubConnectionState.Connected) {
            addDebugLog('Tab became visible but SignalR is not connected, attempting reconnect', 'info');
            setupSignalRConnection();
          }
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        if (hubConnectionRef.current && hubConnectionRef.current.state === 'Connected') {
          addDebugLog('Component unmounting - closing SignalR connection', 'info');
          
          hubConnectionRef.current.stop().then(() => {
            hubConnectionRef.current = null;
          }).catch(err => {
            console.error('Error stopping connection:', err);
          });
        }
        
        // Clean up image cache
        imageCacheRef.current.forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        imageCacheRef.current.clear();
        
        // Clear message images
        Object.values(messageImages).forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        
        // Abort pending image fetches
        abortControllersRef.current.forEach(controller => {
          controller.abort();
        });
        abortControllersRef.current.clear();
      };
    }
  }, [user?.id, user?.accessToken]);

  useEffect(() => {
    if (users.length > 0 && user?.id) {
      fetchChattedUsers();
    }
  }, [users.length]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (notifications.length > 0) {
        setNotifications(prev => prev.slice(1));
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [notifications]);

  // Add manual reconnect button functionality
  const handleManualReconnect = () => {
    connectionAttemptsRef.current = 0;
    setConnectionError(null);
    addDebugLog('Manual reconnect requested', 'info');
    setupSignalRConnection();
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems:'center', justifyContent: 'center', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="animate-spin" size={48} style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '32px', backgroundColor: '#f8f9fa', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <AlertCircle size={48} style={{ color: '#dc3545', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Authentication Required</h2>
          <p style={{ color: '#666' }}>Please log in to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5' }}>
      <div style={{ width: '320px', backgroundColor: '#ffffff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#128C7E' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>Messages</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {connectionState === 'Connected' ? (
                <Wifi size={20} style={{ color: '#25D366' }} />
              ) : connectionState === 'Reconnecting' ? (
                <RefreshCw size={20} className="animate-spin" style={{ color: '#FFA500' }} />
              ) : (
                <WifiOff size={20} style={{ color: '#dc3545' }} />
              )}
              <button
                onClick={() => setDebugMode(!debugMode)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px',
                  fontSize: '12px'
                }}
              >
                {debugMode ? '🐛' : '⚙️'}
              </button>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#ffffff', opacity: 0.9 }}>
            {connectionState} • {users.length} contacts
          </div>
        </div>

        {connectionError && (
          <div style={{ padding: '12px', backgroundColor: '#fff3cd', borderBottom: '1px solid #ffc107', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ color: '#856404' }} />
              <span style={{ fontSize: '12px', color: '#856404' }}>{connectionError}</span>
            </div>
            <button
              onClick={handleManualReconnect}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ffc107',
                border: 'none',
                borderRadius: '4px',
                color: '#856404',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                alignSelf: 'flex-start'
              }}
            >
              <RefreshCw size={12} />
              Reconnect
            </button>
          </div>
        )}

        {liveEvents.length > 0 && (
          <div style={{ padding: '8px', backgroundColor: '#e7f3ff', borderBottom: '1px solid #bee5eb', maxHeight: '120px', overflowY: 'auto' }}>
            {liveEvents.map(event => (
              <div key={event.id} style={{ fontSize: '11px', color: '#004085', padding: '4px 8px', marginBottom: '4px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '4px' }}>
                {event.event}
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <div style={{ padding: '8px', backgroundColor: '#d4edda', borderBottom: '1px solid #c3e6cb' }}>
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                style={{
                  padding: '8px',
                  marginBottom: '4px',
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Bell size={14} style={{ color: '#155724' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#155724' }}>{notif.senderName}</div>
                  <div style={{ color: '#666' }}>{notif.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {renderCategorizedUserList()}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#efeae2' }}>
        {selectedUser ? (
          <>
            <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={userPhotos[String(selectedUser.id)] || generateInitialAvatar(selectedUser.name, selectedUser.role)}
                alt={selectedUser.name}
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px', color: '#000000' }}>{selectedUser.name}</div>
                <div style={{ fontSize: '13px', color: '#667781' }}>
                  {selectedUser.lastActive === 'online' ? '🟢 Online' : '⚫ Offline'} • {capitalizeRole(selectedUser.role)}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN49+7dfwYiAOOoQvoqBABG6xx8R3yLcAAAAABJRU5ErkJggg==)', backgroundRepeat: 'repeat' }}>
              {isLoadingMessages ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                  <RefreshCw className="animate-spin" size={32} style={{ color: '#667781' }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#667781' }}>
                  <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isFromMe = String(msg.senderId) === String(user.id);
                  const showAvatar = index === 0 || String(messages[index - 1].senderId) !== String(msg.senderId);

                  // Check if message has image
                  const hasImage = msg.file && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(msg.file);
                  const imageUrl = messageImages[msg.id] || msg.localImageUrl;
                  
                  // Check if this is an image-only message (no text or text is just a space)
                  const isImageOnly = hasImage && (!msg.text?.trim() || msg.text === ' ');

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: isFromMe ? 'flex-end' : 'flex-start',
                        marginBottom: '8px',
                        alignItems: 'flex-end',
                        gap: '8px'
                      }}
                    >
                      {!isFromMe && (
                        <img
                          src={userPhotos[String(selectedUser.id)] || generateInitialAvatar(selectedUser.name, selectedUser.role)}
                          alt={selectedUser.name}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            visibility: showAvatar ? 'visible' : 'hidden'
                          }}
                        />
                      )}
                      <div
                        style={{
                          maxWidth: '65%',
                          padding: isImageOnly ? '4px' : '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: isFromMe ? '#d9fdd3' : '#ffffff',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          position: 'relative',
                          opacity: msg.isOptimistic ? 0.7 : 1
                        }}
                      >
                        {msg.text?.trim() && msg.text !== ' ' && <div style={{ marginBottom: hasImage ? '8px' : '4px', wordWrap: 'break-word', color: '#000000' }}>{msg.text}</div>}
                        {hasImage && (
                          <div style={{ marginTop: (msg.text?.trim() && msg.text !== ' ') ? '8px' : '0' }}>
                            {imageUrl ? (
                              <div>
                                <img
                                  src={imageUrl}
                                  alt="Image"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '400px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'block',
                                    objectFit: 'cover'
                                  }}
                                  onClick={() => window.open(imageUrl, '_blank')}
                                />
                              </div>
                            ) : (
                              <div style={{ 
                                width: '200px', 
                                height: '200px', 
                                backgroundColor: 'rgba(0,0,0,0.05)', 
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#667781'
                              }}>
                                <RefreshCw className="animate-spin" size={24} />
                              </div>
                            )}
                          </div>
                        )}
                        {msg.file && !hasImage && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px', cursor: 'pointer' }}
                            onClick={() => {
                              const accessToken = localStorage.getItem('accessToken') || user?.accessToken;
                              const url = `https://physiocareapp.runasp.net/api/v1/Upload/image?filename=${encodeURIComponent(msg.file)}&path=Chat`;
                              fetch(url, {
                                headers: { 'Authorization': `Bearer ${accessToken}` }
                              }).then(res => res.blob()).then(blob => {
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = msg.file;
                                a.click();
                              });
                            }}
                          >
                            <Paperclip size={16} />
                            <span style={{ fontSize: '13px', color: '#667781', textDecoration: 'underline' }}>
                              {msg.file}
                            </span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#667781' }}>{formatMessageTime(msg.date)}</span>
                          {isFromMe && (
                            msg.isFailed ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={msg.errorMessage || 'Failed to send'}>
                                <AlertCircle size={14} style={{ color: '#dc3545' }} />
                                <span style={{ fontSize: '10px', color: '#dc3545' }}>Failed</span>
                              </div>
                            ) : msg.isOptimistic ? (
                              <Clock size={14} style={{ color: '#95a5a6' }} title="Sending..." />
                            ) : msg.isDelivered ? (
                              <CheckCheck size={14} style={{ color: '#34b7f1' }} title="Delivered" />
                            ) : (
                              <Check size={14} style={{ color: '#95a5a6' }} title="Sent" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderTop: '1px solid #e0e0e0' }}>
              {(file || filePreview) && (
                <div style={{ marginBottom: '8px', padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {file?.type?.startsWith('image/') ? (
                      <ImageIcon size={16} style={{ color: '#128C7E' }} />
                    ) : (
                      <Paperclip size={16} style={{ color: '#128C7E' }} />
                    )}
                    <span style={{ fontSize: '14px', color: '#000000' }}>{file?.name}</span>
                    {filePreview && (
                      <div style={{ marginLeft: '8px', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={filePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                  <button onClick={handleRemoveFile} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                    <X size={18} style={{ color: '#dc3545' }} />
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d7db',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Paperclip size={20} style={{ color: '#667781' }} />
                </button>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message or attach a file"
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '24px',
                    border: '1px solid #d1d7db',
                    resize: 'none',
                    fontSize: '15px',
                    fontFamily: 'Arial, sans-serif',
                    maxHeight: '100px',
                    minHeight: '40px'
                  }}
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() && !file}
                  title={file ? `Send ${file.name}` : 'Send message'}
                  style={{
                    padding: '10px',
                    backgroundColor: message.trim() || file ? '#128C7E' : '#d1d7db',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: message.trim() || file ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <Send size={20} style={{ color: '#ffffff' }} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#667781' }}>
            <Users size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Welcome to Chat</h3>
            <p style={{ fontSize: '15px' }}>Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {debugMode && (
        <div style={{ width: '320px', backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: '16px', overflowY: 'auto', fontSize: '11px', fontFamily: 'Consolas, monospace', borderLeft: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#4ec9b0' }}>Debug Console</h3>
            <button onClick={() => setDebugLogs([])} style={{ background: '#333', border: 'none', color: '#d4d4d4', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>Clear</button>
          </div>
          <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#2d2d2d', borderRadius: '4px' }}>
            <div><strong>Connection:</strong> {connectionState}</div>
            <div><strong>User ID:</strong> {user?.id}</div>
            <div><strong>Role:</strong> {user?.role || user?.Role}</div>
            <div><strong>Users:</strong> {users.length}</div>
            <div><strong>Messages:</strong> {messages.length}</div>
            <div><strong>Online:</strong> {users.filter(u => u.lastActive === 'online').length}</div>
            <div><strong>Doctors Online:</strong> {users.filter(u => u.role.toLowerCase() === 'doctor' && u.lastActive === 'online').length}</div>
            <div><strong>Nurses Online:</strong> {users.filter(u => u.role.toLowerCase() === 'nurse' && u.lastActive === 'online').length}</div>
            <div><strong>Labs Online:</strong> {users.filter(u => u.role.toLowerCase() === 'laboratory' && u.lastActive === 'online').length}</div>
            <div><strong>Image Queue:</strong> {imageFetchQueueRef.current.length}</div>
            <div><strong>Image Cache:</strong> {imageCacheRef.current.size}</div>
            <div><strong>Connection Attempts:</strong> {connectionAttemptsRef.current}/{maxConnectionAttempts}</div>
            <button
              onClick={handleManualReconnect}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                backgroundColor: '#4ec9b0',
                border: 'none',
                borderRadius: '4px',
                color: '#1e1e1e',
                fontSize: '10px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Force Reconnect
            </button>
          </div>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {debugLogs.map((log, i) => (
              <div key={i} style={{ marginBottom: '6px', padding: '6px', backgroundColor: log.type === 'error' ? '#571818' : log.type === 'warning' ? '#5e5217' : log.type === 'success' ? '#1a4d2e' : '#2d2d2d', borderRadius: '4px', borderLeft: `3px solid ${log.type === 'error' ? '#f14c4c' : log.type === 'warning' ? '#cca700' : log.type === 'success' ? '#4ec9b0' : '#007acc'}` }}>
                <div style={{ color: '#808080', fontSize: '9px', marginBottom: '2px' }}>{log.timestamp}</div>
                <div>{log.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;