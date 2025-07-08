/*


import chatBg from '../assets/images/mockuuups-iphone-15-pro-mockup-on-a-white-modern-table.jpeg';
import React, { useState, useRef } from 'react';

const DoctorChat = () => {
  // ------------------------------
  // Sample Data
  // ------------------------------
  const initialContacts = [
    {
      id: 1,
      name: 'Cristiano Murphy',
      avatarUrl: 'https://i.pravatar.cc/40?img=51',
      lastMessage: 'Sure, check the link for details',
      lastActive: 'Online',
      chatHistory: [
        {
          id: 'm1',
          sender: 'Cristiano Murphy',
          text: 'Hi, how are you doing?',
          type: 'incoming',
          time: '26 May, 10:02 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'Hello Cristiano',
          type: 'outgoing',
          time: '26 May, 10:03 AM',
        },
        {
          id: 'm3',
          sender: 'You',
          text: 'How can I help you?',
          type: 'outgoing',
          time: '26 May, 10:04 AM',
        },
        {
          id: 'm4',
          sender: 'Cristiano Murphy',
          text: 'Nice to meet you. Hope you are doing fine?',
          type: 'incoming',
          time: '26 May, 10:05 AM',
        },
        {
          id: 'm5',
          sender: 'You',
          text: "I'm good thanks for asking",
          type: 'outgoing',
          time: '26 May, 10:06 AM',
        },
      ],
    },
    {
      id: 2,
      name: 'Jane Smith',
      avatarUrl: 'https://i.pravatar.cc/40?img=52',
      lastMessage: 'Ok, see you tomorrow!',
      lastActive: 'Offline',
      chatHistory: [
        {
          id: 'm1',
          sender: 'Jane Smith',
          text: 'Hey, do you have an appointment slot tomorrow?',
          type: 'incoming',
          time: '26 May, 09:15 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'Yes, we have an opening at 2 PM.',
          type: 'outgoing',
          time: '26 May, 09:16 AM',
        },
        {
          id: 'm3',
          sender: 'Jane Smith',
          text: 'Ok, see you tomorrow!',
          type: 'incoming',
          time: '26 May, 09:17 AM',
        },
      ],
    },
    // Additional contacts (3 to 11)
    {
      id: 3,
      name: 'Alice Johnson',
      avatarUrl: 'https://i.pravatar.cc/40?img=53',
      lastMessage: 'Can we reschedule?',
      lastActive: 'Online',
      chatHistory: [
        {
          id: 'm1',
          sender: 'Alice Johnson',
          text: 'Hello, can we reschedule our appointment?',
          type: 'incoming',
          time: '26 May, 08:00 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'Sure, let me check available slots.',
          type: 'outgoing',
          time: '26 May, 08:02 AM',
        },
      ],
    },
    {
      id: 4,
      name: 'Bob Williams',
      avatarUrl: 'https://i.pravatar.cc/40?img=54',
      lastMessage: 'Thank you!',
      lastActive: 'Offline',
      chatHistory: [
        {
          id: 'm1',
          sender: 'Bob Williams',
          text: 'I need some advice on my medication.',
          type: 'incoming',
          time: '26 May, 07:45 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'You’re welcome, happy to help!',
          type: 'outgoing',
          time: '26 May, 07:47 AM',
        },
      ],
    },
    {
      id: 5,
      name: 'Charlie Brown',
      avatarUrl: 'https://i.pravatar.cc/40?img=55',
      lastMessage: 'See you soon.',
      lastActive: 'Online',
      chatHistory: [
        {
          id: 'm1',
          sender: 'Charlie Brown',
          text: 'Looking forward to our session.',
          type: 'incoming',
          time: '26 May, 07:30 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'Me too, see you soon!',
          type: 'outgoing',
          time: '26 May, 07:32 AM',
        },
      ],
    },
    {
      id: 6,
      name: 'David Wilson',
      avatarUrl: 'https://i.pravatar.cc/40?img=56',
      lastMessage: 'I have a question.',
      lastActive: 'Offline',
      chatHistory: [
        {
          id: 'm1',
          sender: 'David Wilson',
          text: 'I have a question regarding my treatment.',
          type: 'incoming',
          time: '26 May, 07:15 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'Sure, go ahead!',
          type: 'outgoing',
          time: '26 May, 07:17 AM',
        },
      ],
    },
    {
      id: 7,
      name: 'Eva Davis',
      avatarUrl: 'https://i.pravatar.cc/40?img=57',
      lastMessage: 'Good morning!',
      lastActive: 'Online',
      chatHistory: [
        {
          id: 'm1',
          sender: 'Eva Davis',
          text: 'Good morning, I need a consultation.',
          type: 'incoming',
          time: '26 May, 07:00 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'Good morning, how can I assist?',
          type: 'outgoing',
          time: '26 May, 07:02 AM',
        },
      ],
    },
    {
      id: 8,
      name: 'Frank Miller',
      avatarUrl: 'https://i.pravatar.cc/40?img=58',
      lastMessage: 'I am not feeling well.',
      lastActive: 'Offline',
      chatHistory: [
        {
          id: 'm1',
          sender: 'Frank Miller',
          text: 'I am not feeling well today.',
          type: 'incoming',
          time: '26 May, 06:45 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'I’m sorry to hear that, please rest well.',
          type: 'outgoing',
          time: '26 May, 06:47 AM',
        },
      ],
    },
    {
      id: 9,
      name: 'Grace Lee',
      avatarUrl: 'https://i.pravatar.cc/40?img=59',
      lastMessage: 'Let me know.',
      lastActive: 'Online',
      chatHistory: [
        {
          id: 'm1',
          sender: 'Grace Lee',
          text: 'Could you please send me my test results?',
          type: 'incoming',
          time: '26 May, 06:30 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'Sure, I will email them shortly.',
          type: 'outgoing',
          time: '26 May, 06:32 AM',
        },
      ],
    },
    {
      id: 10,
      name: 'Henry Thomas',
      avatarUrl: 'https://i.pravatar.cc/40?img=60',
      lastMessage: 'Call me back.',
      lastActive: 'Offline',
      chatHistory: [
        {
          id: 'm1',
          sender: 'Henry Thomas',
          text: 'Can you call me back when you are free?',
          type: 'incoming',
          time: '26 May, 06:15 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'I will, please wait a moment.',
          type: 'outgoing',
          time: '26 May, 06:17 AM',
        },
      ],
    },
    {
      id: 11,
      name: 'Isabella Moore',
      avatarUrl: 'https://i.pravatar.cc/40?img=61',
      lastMessage: 'Thank you for your help.',
      lastActive: 'Online',
      chatHistory: [
        {
          id: 'm1',
          sender: 'Isabella Moore',
          text: 'Thank you for your help today.',
          type: 'incoming',
          time: '26 May, 06:00 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'You’re welcome!',
          type: 'outgoing',
          time: '26 May, 06:02 AM',
        },
      ],
    },
  ];

  // ------------------------------
  // State
  // ------------------------------
  const [contacts, setContacts] = useState(initialContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactId, setSelectedContactId] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // File input reference for attachments
  const fileInputRef = useRef(null);

  // User avatar for outgoing messages
  const userAvatar = 'https://i.pravatar.cc/40?img=1';

  // ------------------------------
  // Derived Data
  // ------------------------------
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  // ------------------------------
  // Overlay Style
  // ------------------------------
  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  };

  // ------------------------------
  // Handlers
  // ------------------------------
  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleSelectContact = (id) => {
    setSelectedContactId(id);
    setShowEmojiPicker(false);
  };

  const handleToggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev);

  const handleSelectEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleAttachFile = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        addFileMessage(file.name, dataUrl, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFileMessage = (fileName, fileUrl, fileType) => {
    const now = new Date();
    const time = now.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const msg = {
      id: `m${Date.now()}`,
      sender: 'You',
      text: `File attached: ${fileName}`,
      fileUrl,
      fileType,
      isFile: true,
      type: 'outgoing',
      time,
    };
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContactId
          ? { ...c, chatHistory: [...c.chatHistory, msg], lastMessage: msg.text }
          : c
      )
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const now = new Date();
    const time = now.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const msg = {
      id: `m${Date.now()}`,
      sender: 'You',
      text: newMessage.trim(),
      type: 'outgoing',
      time,
    };
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContactId
          ? { ...c, chatHistory: [...c.chatHistory, msg], lastMessage: msg.text }
          : c
      )
    );
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="flex h-screen bg-gray-100">
      {}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search..."
            className="w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleSelectContact(contact.id)}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
                contact.id === selectedContactId ? 'bg-blue-50' : ''
              }`}
            >
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-700">{contact.name}</h4>
                <p className="text-xs text-gray-500 truncate">{contact.lastMessage}</p>
              </div>
              <div className="text-xs text-gray-400">{contact.lastActive}</div>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="flex-1 flex flex-col">
        {}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedContact && (
              <>
                <img
                  src={selectedContact.avatarUrl}
                  alt={selectedContact.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-gray-800">{selectedContact.name}</h3>
                  <span
                    className={`text-xs ${
                      selectedContact.lastActive === 'Online' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {selectedContact.lastActive}
                  </span>
                </div>
              </>
            )}
          </div>
          {}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-800">
              {}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21 11.72 11.72 0 003.64.58 1 1 0 011 1v3.49a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.58 3.64 1 1 0 01-.21 1.11z" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              {}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V6c0-1.1-.9-2-2-2H5C3.9 4 3 4.9 3 6v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4.5l4 4v-11l-4 4z" />
              </svg>
            </button>
          </div>
        </div>

        {}
        <div className="flex-1 relative min-h-0">
          {}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${chatBg})`,
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
            }}
          ></div>
          {}
          <div className="absolute inset-0" style={overlayStyle}></div>
          {}
          <div className="relative z-10 overflow-y-auto h-full p-4 space-y-4">
            {selectedContact &&
              selectedContact.chatHistory.map((msg) => {
                const isOutgoing = msg.type === 'outgoing';
                const bubbleClasses = isOutgoing
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                  >
                    {}
                    {!isOutgoing && (
                      <img
                        src={selectedContact.avatarUrl}
                        alt={msg.sender}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    <div className={`max-w-sm rounded-lg px-3 py-2 text-sm shadow-sm ${bubbleClasses}`}>
                      {msg.isFile && msg.fileUrl ? (
                        msg.fileType && msg.fileType.startsWith('image/') ? (
                          <div>
                            <img
                              src={msg.fileUrl}
                              alt={msg.text}
                              className="mb-2 rounded max-w-full h-auto"
                            />
                            <div>{msg.text}</div>
                          </div>
                        ) : (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {msg.text}
                          </a>
                        )
                      ) : (
                        <p>{msg.text}</p>
                      )}
                      <div className={`mt-1 text-xs ${isOutgoing ? 'text-white/70' : 'text-gray-500'}`}>
                        {msg.time} {isOutgoing ? 'You' : msg.sender}
                      </div>
                    </div>
                    {isOutgoing && (
                      <img src={userAvatar} alt="You" className="w-8 h-8 rounded-full ml-2" />
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {}
        <div className="bg-white border-t border-gray-200 p-3">
          <div className="flex items-center space-x-3">
            {}
            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M15.172 7l-6.414 6.414a2 2 0 102.828 2.828L18 10.828M10 14H5.236c-.463 0-.836-.373-.836-.836V8.236c0-.463.373-.836.836-.836H10" />
              </svg>
            </button>

            {}
            <button onClick={handleAttachFile} className="text-gray-500 hover:text-gray-700">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21.44 11.05a5.5 5.5 0 00-9.88-3.17l-7.1 7.1a4 4 0 105.66 5.66l6.36-6.36a2 2 0 10-2.83-2.83l-6.36 6.36" />
              </svg>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Enter Message..."
              className="flex-1 border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />

            {}
            <button onClick={handleSendMessage} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Send
            </button>
          </div>

          {}
          {showEmojiPicker && (
            <div className="mt-2 bg-white border border-gray-200 rounded shadow-md p-2 inline-block">
              {['😊', '😂', '❤️', '👍', '🎉', '🙏', '😷', '🤒'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setNewMessage((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-xl p-1 hover:bg-gray-100"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorChat;


*/

import React, { useState, useRef, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { Button } from 'react-bootstrap';

// Updated SVG content with a softer, more translucent heart shape
const svgContent =  `<svg viewBox="0 0 97 76" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:47px;height:76px;">
<path d="M1.91304 12L3.1087 12.2689L4.30435 13.6134L5.26087 16.5714L6.21739 25.4454L6.45652 28.4034L4.30435 30.5546L4.54348 32.7059L6.69565 35.9328L9.80435 40.7731L11.9565 43.4622L12.913 44L11.2391 41.8487L5.26087 32.437L5.02174 30.8235L6.93478 29.7479L8.36957 30.0168L11.4783 31.8992L13.6304 33.7815L15.7826 36.2017L18.413 39.9664L20.087 41.8487L21.7609 42.9244L27.5 43.7311L31.5652 45.0756L33.9565 46.4202L36.587 48.5714L39.4565 51.7983L41.6087 55.563L43.2826 59.5966L44 62.5546V66.8571L43.7609 68.7395L43.5217 75.7311L43.2826 76H28.2174L27.9783 75.7311L27.7391 68.4706L26.5435 65.7815V65.2437H26.0652V64.7059L25.1087 64.1681L18.8913 59.8655L13.3913 56.1008L10.0435 53.4118L7.8913 51.2605L5.02174 45.0756L1.91304 37.2773L0.23913 31.6303L0 30.0168V25.9832L0.717391 17.1092L1.43478 12.5378L1.91304 12Z" fill="#00959C"/>
<path d="M94.788 12L95.7935 12.2689L96.3967 16.3025L97 25.9832V31.0924L95.5924 36.7395L94.1848 41.042L91.1685 49.1092L89.962 51.7983L88.3533 53.6807L84.1304 57.4454L79.7065 60.9412L76.288 63.8992L74.6793 65.7815L73.875 67.6639L73.6739 75.7311L73.4728 76H60.6033L60.4022 75.7311L60.2011 67.395L60 65.5126V63.3613L61.0054 58.2521L62.6141 54.2185L64.2228 51.5294L65.8315 49.1092L68.6467 46.1513L70.8587 44.8067L75.0815 43.4622L78.7011 42.9244L80.1087 41.8487L81.7174 39.9664L84.3315 35.395L86.3424 32.7059L89.5598 30.2857L90.163 30.0168H91.7717L92.9783 31.0924L92.1739 33.2437L89.5598 38.084L87.5489 41.8487L86.5435 43.4622L87.75 42.6555L89.1576 40.2353L91.7717 35.395L92.9783 33.2437L93.3804 31.8992L93.1793 30.2857L92.5761 29.479L91.5707 28.6723L91.7717 25.1765L92.5761 16.8403L93.3804 13.6134L94.3859 12.2689L94.788 12Z" fill="#00959C"/>
<path d="M38.6 0L41.313 0.235577L44.2522 1.17788L47.8696 3.29808L48.3217 3.76923L49.6783 3.53365L52.6174 1.64904L55.7826 0.471154L57.8174 0H60.3043L64.8261 1.17788L68.4435 2.82692L70.7043 4.47596L72.7391 6.83173L74.3217 10.3654L75 14.3702V16.9615L74.3217 20.9663L73.1913 23.7933L71.1565 27.5625L68.6696 30.8606L66.6348 33.2163L65.0522 35.101L59.8522 40.5192L58.0435 42.1683L53.7478 46.6442L51.2609 48.5288L49.9043 49H47.8696L45.1565 47.5865L39.9565 42.1683L38.1478 40.5192L30.913 32.9808L29.3304 31.0962L27.0696 28.0337L25.0348 24.7356L23.6783 21.2019L23 18.1394V12.7212L24.1304 8.95192L25.713 6.125L27.9739 3.76923L30.2348 2.35577L33.8522 0.942308L38.6 0Z" fill="#00959C"/>
</svg>` ;

const svgBackground = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;

const DoctorChat = () => {
  // ------------------------------
  // Sample Data (existing chats remain)
  // ------------------------------
  const initialContacts = [
    {
      id: 1,
      name: 'Cristiano Murphy',
      avatarUrl: 'https://i.pravatar.cc/40?img=51',
      lastMessage: 'Sure, check the link for details',
      lastActive: 'Online',
      chatHistory: [
        {
          id: 'm1',
          sender: 'Cristiano Murphy',
          text: 'Hi, how are you doing?',
          type: 'incoming',
          time: '26 May, 10:02 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'Hello Cristiano',
          type: 'outgoing',
          time: '26 May, 10:03 AM',
        },
        {
          id: 'm3',
          sender: 'You',
          text: 'How can I help you?',
          type: 'outgoing',
          time: '26 May, 10:04 AM',
        },
        {
          id: 'm4',
          sender: 'Cristiano Murphy',
          text: 'Nice to meet you. Hope you are doing fine?',
          type: 'incoming',
          time: '26 May, 10:05 AM',
        },
        {
          id: 'm5',
          sender: 'You',
          text: "I'm good thanks for asking",
          type: 'outgoing',
          time: '26 May, 10:06 AM',
        },
      ],
    },
    {
      id: 2,
      name: 'Jane Smith',
      avatarUrl: 'https://i.pravatar.cc/40?img=52',
      lastMessage: 'Ok, see you tomorrow!',
      lastActive: 'Offline',
      chatHistory: [
        {
          id: 'm1',
          sender: 'Jane Smith',
          text: 'Hey, do you have an appointment slot tomorrow?',
          type: 'incoming',
          time: '26 May, 09:15 AM',
        },
        {
          id: 'm2',
          sender: 'You',
          text: 'Yes, we have an opening at 2 PM.',
          type: 'outgoing',
          time: '26 May, 09:16 AM',
        },
        {
          id: 'm3',
          sender: 'Jane Smith',
          text: 'Ok, see you tomorrow!',
          type: 'incoming',
          time: '26 May, 09:17 AM',
        },
      ],
    },
  ];

  // ------------------------------
  // State
  // ------------------------------
  const [contacts, setContacts] = useState(initialContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactId, setSelectedContactId] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // SignalR Connection
  const [connection, setConnection] = useState(null);

  // File input reference for attachments
  const fileInputRef = useRef(null);

  // Outgoing messages user avatar
  const userAvatar = 'https://i.pravatar.cc/40?img=1';

  // Additional IDs for Real-Time Chat
  const doctorId = "doctor1";
  const patientId = "patient1";

  // Derived data
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  // Setup SignalR
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://yourbackendurl/chatHub") // replace with actual URL
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log("Connected to SignalR Hub");
          connection.on("ReceiveMessage", (message) => {
            setContacts((prevContacts) =>
              prevContacts.map((contact) =>
                contact.id === message.contactId
                  ? { ...contact, chatHistory: [...contact.chatHistory, message], lastMessage: message.text }
                  : contact
              )
            );
          });
        })
        .catch(e => console.error('Connection failed: ', e));
    }
  }, [connection]);

  // Handlers
  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleSelectContact = (id) => {
    setSelectedContactId(id);
    setShowEmojiPicker(false);
  };

  const handleAttachFile = () => fileInputRef.current && fileInputRef.current.click();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        addFileMessage(file.name, dataUrl, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFileMessage = (fileName, fileUrl, fileType) => {
    const now = new Date();
    const time = now.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const msg = {
      id: `m${Date.now()}`,
      sender: 'You',
      text: `File attached: ${fileName}`,
      fileUrl,
      fileType,
      isFile: true,
      type: 'outgoing',
      time,
      doctorId,
      patientId,
      contactId: selectedContactId,
    };

    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContactId
          ? { ...c, chatHistory: [...c.chatHistory, msg], lastMessage: msg.text }
          : c
      )
    );

    if (connection) {
      connection.invoke("SendMessage", msg).catch(e => console.error(e));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const now = new Date();
    const time = now.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const msg = {
      id: `m${Date.now()}`,
      sender: 'You',
      text: newMessage.trim(),
      type: 'outgoing',
      time,
      doctorId,
      patientId,
      contactId: selectedContactId,
    };

    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContactId
          ? { ...c, chatHistory: [...c.chatHistory, msg], lastMessage: msg.text }
          : c
      )
    );

    setNewMessage('');
    setShowEmojiPicker(false);

    if (connection) {
      try {
        await connection.invoke("SendMessage", msg);
      } catch (e) {
        console.error("SendMessage failed: ", e);
      }
    }
  };

  // Render
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Left Panel (Contacts) */}
      <div style={{ width: '300px', backgroundColor: '#ffffff', borderRight: '1px solid #dee2e6' }}>
        <div className="p-3">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="بحث..."
            className="form-control form-control-sm"
          />
        </div>
        <div style={{ overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleSelectContact(contact.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                cursor: 'pointer',
                backgroundColor: contact.id === selectedContactId ? '#e7f1ff' : 'transparent'
              }}
            >
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '0.75rem' }}
              />
              <div style={{ flex: 1 }}>
                <h6 style={{ margin: 0, fontSize: '0.9rem', color: '#495057' }}>{contact.name}</h6>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6c757d' }} className="text-truncate">
                  {contact.lastMessage}
                </p>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#adb5bd' }}>
                {contact.lastActive}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel (Chat) */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        {/* Background SVG Layer */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '300px',
          backgroundImage: `url("${svgBackground}")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center  center',
          backgroundSize: 'contain',
          zIndex: 1,
          opacity: 0.1
        }} />

        {/* Header */}
        <div 
          className="bg-white border-bottom d-flex align-items-center justify-content-between p-3" 
          style={{ position: 'relative', zIndex: 10 }}
        >
          <div className="d-flex align-items-center">
            {selectedContact && (
              <>
                <img
                  src={selectedContact.avatarUrl}
                  alt={selectedContact.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
                <div style={{ marginLeft: '1rem' }}>
                  <h6 style={{ margin: 0 }}>{selectedContact.name}</h6>
                  <small style={{ color: selectedContact.lastActive === 'Online' ? 'green' : 'red' }}>
                    {selectedContact.lastActive}
                  </small>
                </div>
              </>
            )}
          </div>
          <div className="d-flex align-items-center">
            <Button variant="link">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21 11.72 11.72 0 003.64.58 1 1 0 011 1v3.49a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.58 3.64 1 1 0 01-.21 1.11z" />
              </svg>
            </Button>
            <Button variant="link">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V6c0-1.1-.9-2-2-2H5C3.9 4 3 4.9 3 6v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4.5l4 4v-11l-4 4z" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          style={{ 
            position: 'relative', 
            flex: 1, 
            zIndex: 10, 
            overflow: 'hidden' 
          }}
        >
          <div
            style={{
              padding: '1rem',
              overflowY: 'auto',
              height: '100%',
            }}
          >
            {selectedContact &&
              selectedContact.chatHistory.map((msg) => {
                const isOutgoing = msg.type === 'outgoing';
                const bubbleStyle = isOutgoing
                  ? { backgroundColor: '#007bff', color: 'white' }
                  : { backgroundColor: '#e9ecef', color: '#212529' };

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
                      marginBottom: '0.75rem'
                    }}
                  >
                    {/* If the message is incoming, show the contact's avatar on the left */}
                    {!isOutgoing && (
                      <img
                        src={selectedContact.avatarUrl}
                        alt={msg.sender}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          marginRight: '0.5rem'
                        }}
                      />
                    )}
                    <div
                      style={{
                        maxWidth: '300px',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        ...bubbleStyle
                      }}
                    >
                      {msg.isFile && msg.fileUrl ? (
                        msg.fileType && msg.fileType.startsWith('image/') ? (
                          <div>
                            <img
                              src={msg.fileUrl}
                              alt={msg.text}
                              style={{
                                marginBottom: '0.5rem',
                                borderRadius: '0.5rem',
                                maxWidth: '100%'
                              }}
                            />
                            <div>{msg.text}</div>
                          </div>
                        ) : (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#6610f2', textDecoration: 'underline' }}
                          >
                            {msg.text}
                          </a>
                        )
                      ) : (
                        <p style={{ margin: 0 }}>{msg.text}</p>
                      )}
                      <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', opacity: isOutgoing ? 0.8 : 0.7 }}>
                        {msg.time} {isOutgoing ? 'You' : msg.sender}
                      </div>
                    </div>
                    {/* If the message is outgoing, show the user's avatar on the right */}
                    {isOutgoing && (
                      <img
                        src={userAvatar}
                        alt="You"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          marginLeft: '0.5rem'
                        }}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Chat Input */}
        <div 
          className="bg-white border-top p-3" 
          style={{ position: 'relative', zIndex: 10 }}
        >
          <div className="d-flex align-items-center">
            <Button variant="link" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M15.172 7l-6.414 6.414a2 2 0 102.828 2.828L18 10.828M10 14H5.236c-.463 0-.836-.373-.836-.836V8.236c0-.463.373-.836.836-.836H10" />
              </svg>
            </Button>
            <Button variant="link" onClick={handleAttachFile}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21.44 11.05a5.5 5.5 0 00-9.88-3.17l-7.1 7.1a4 4 0 105.66 5.66l6.36-6.36" />
              </svg>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              placeholder="أدخل الرسالة..."
              className="form-control"
              style={{ marginRight: '0.5rem' }}
            />
            <Button variant="primary" onClick={handleSendMessage}>
              إرسال
            </Button>
          </div>
          {showEmojiPicker && (
            <div className="mt-2 p-2 border rounded bg-white" style={{ display: 'inline-block' }}>
              {['😊', '😂', '❤️', '👍', '🎉', '🙏', '😷', '🤒'].map((emoji) => (
                <Button
                  key={emoji}
                  variant="link"
                  onClick={() => {
                    setNewMessage((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  style={{ fontSize: '1.25rem', padding: '0.25rem' }}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorChat;