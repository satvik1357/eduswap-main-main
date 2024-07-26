import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, where, getDocs } from 'firebase/firestore';
import '../styles/Chat.css';

const Chat = () => {
  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchConnections = async () => {
      const auth = getAuth();
      const db = getFirestore();

      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User Data:', userData);
            const connectionIds = userData.connections || [];

            if (connectionIds.length > 0) {
              const usersQuery = query(
                collection(db, 'users'),
                where('__name__', 'in', connectionIds)
              );
              const usersSnapshot = await getDocs(usersQuery);
              const users = usersSnapshot.docs.map(doc => ({
                id: doc.id, // Add the document ID
                ...doc.data()
              }));
              setConnections(users);
            }
          } else {
            console.log('No such document!');
          }
        } else {
          console.log('User is not authenticated');
          setCurrentUser(null);
        }
      });

      return () => unsubscribeAuth();
    };

    fetchConnections();
  }, []);

  useEffect(() => {
    if (selectedUser && currentUser) {
      const db = getFirestore();
      const chatId = getChatId(currentUser.uid, selectedUser.id);
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => doc.data());
        console.log('Messages:', msgs);
        setMessages(msgs);
      });

      return () => unsubscribe();
    }
  }, [selectedUser, currentUser]);

  const getChatId = (user1, user2) => {
    return user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
  };

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
    if (!selectedUser?.id || !currentUser?.uid) {
      console.error('Selected user or current user is not set');
      console.log('Selected User:', selectedUser);
      console.log('Current User:', currentUser);
      return;
    }

    const db = getFirestore();
    const chatId = getChatId(currentUser.uid, selectedUser.id);
    const messageRef = collection(db, 'chats', chatId, 'messages');

    console.log('Sending message to chat ID:', chatId);
    console.log('Current User ID:', currentUser.uid);
    console.log('Selected User ID:', selectedUser.id);

    try {
      await addDoc(messageRef, {
        senderId: currentUser.uid,
        receiverId: selectedUser.id,
        message: newMessage,
        timestamp: new Date() // Firestore will convert this to a Timestamp.
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectUser = (user) => {
    console.log('Selected User:', user);
    if (user.id) {
      setSelectedUser(user);
    } else {
      console.error('User selected does not have an id:', user);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-page">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">EduSwap</Link>
        </div>
        <ul className="navbar-nav">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/explore">Explore</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/chat">Chat</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </nav>

      <div className="connections-list">
        <h2>Connections</h2>
        {connections.length > 0 ? (
          connections.map((connection, index) => (
            <div
              key={index}
              onClick={() => handleSelectUser(connection)}
              className={`connection-item ${selectedUser?.id === connection.id ? 'active' : ''}`}
            >
              {connection.name || 'Unnamed User'}
            </div>
          ))
        ) : (
          <p>No connections found.</p>
        )}
      </div>
      <div className="chat-window">
        {selectedUser ? (
          <>
            <h2>Chat with {selectedUser.name}</h2>
            <div className="messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`}
                >
                  <p>{msg.message}</p>
                  <span>{new Date(msg.timestamp.toDate()).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message"
              />
              <button
                onClick={sendMessage}
                disabled={!selectedUser || !currentUser}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
