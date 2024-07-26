import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import '../styles/Dashboard.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFUli-CDl2U0qpOn43uh_tPJvG7pSSr-I",
  authDomain: "eduswap-42359.firebaseapp.com",
  databaseURL: "https://eduswap-42359-default-rtdb.firebaseio.com",
  projectId: "eduswap-42359",
  storageBucket: "eduswap-42359.appspot.com",
  messagingSenderId: "745544145688",
  appId: "1:745544145688:web:31c5c229da14fefad31c6d",
  measurementId: "G-E5WRBEYCXQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

const images = [
  '/images/image1.png',
  '/images/image2.png',
  '/images/image3.png',
];

function Dashboard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState({ displayName: '', skills: [], notifications: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRequests = async (uid) => {
      try {
        const q = query(collection(firestore, 'requests'), where('receiverId', '==', uid));
        const querySnapshot = await getDocs(q);
        const requestsList = [];

        for (const docSnapshot of querySnapshot.docs) {
          const requestData = docSnapshot.data();
          // Fetch the requester’s details
          const requesterDoc = await getDoc(doc(firestore, 'users', requestData.requesterId));
          if (requesterDoc.exists()) {
            const requesterData = requesterDoc.data();
            console.log(`Fetched requester data: ${JSON.stringify(requesterData)}`); // Debug log
            requestData.requesterName = requesterData.name || 'Unknown'; // Use the correct field name
          } else {
            console.warn(`Requester document not found for ID: ${requestData.requesterId}`); // Debug log
            requestData.requesterName = 'Unknown';
          }

          requestsList.push({ id: docSnapshot.id, ...requestData });
        }
        return requestsList;
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to fetch requests.');
        return [];
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const requests = await fetchRequests(currentUser.uid);
            setUser({
              displayName: currentUser.displayName || 'User',
              skills: userData.skills || [],
              notifications: requests
            });
          } else {
            setUser({
              displayName: currentUser.displayName || 'User',
              skills: [],
              notifications: []
            });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to fetch user data.');
        }
      } else {
        setUser({ displayName: '', skills: [], notifications: [] });
        setError('No user is signed in.');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRequest = async (request, status) => {
    try {
      const requestRef = doc(firestore, 'requests', request.id);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError('No user is signed in.');
        return;
      }

      if (status === 'accepted') {
        const receiverRef = doc(firestore, 'users', currentUser.uid);
        const senderRef = doc(firestore, 'users', request.requesterId);

        const senderDoc = await getDoc(senderRef);
        const receiverDoc = await getDoc(receiverRef);

        if (senderDoc.exists() && receiverDoc.exists()) {
          const senderConnections = senderDoc.data().connections || [];
          const receiverConnections = receiverDoc.data().connections || [];

          if (!senderConnections.includes(currentUser.uid)) {
            senderConnections.push(currentUser.uid);
            await updateDoc(senderRef, { connections: senderConnections });
          }

          if (!receiverConnections.includes(request.requesterId)) {
            receiverConnections.push(request.requesterId);
            await updateDoc(receiverRef, { connections: receiverConnections });
          }
        }
      }

      await updateDoc(requestRef, { status });
      await deleteDoc(requestRef);

      // Update notifications
      setUser((prevUser) => ({
        ...prevUser,
        notifications: prevUser.notifications.filter(r => r.id !== request.id)
      }));
    } catch (err) {
      console.error('Error updating request:', err);
      setError('Failed to update request.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/dashboard">EduSwap</Link>
        </div>
        <ul className="navbar-nav">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/explore">Explore</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/chat">chat</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </nav>
      <header className="dashboard-header">
        <h1>Welcome, {user.displayName}!</h1>
      </header>
      <main className="dashboard-main">
        <div className="dashboard-sections">
          <section className="dashboard-skills">
            <h2>Your Skills</h2>
            <ul>
              {user.skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </section>
          <section className="dashboard-image-slider">
            <div className="image-slider">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className={index === currentIndex ? 'visible' : 'hidden'}
                />
              ))}
            </div>
          </section>
          <section className="dashboard-notifications">
            <h2>Notifications</h2>
            <ul>
              {user.notifications.length === 0 ? (
                <li>No notifications</li>
              ) : (
                user.notifications.map((notification) => (
                  <li key={notification.id}>
                    <div className="request-info">
                      <p>{notification.requesterName || 'Unknown'}</p>
                      <p>{notification.message ? notification.message : 'wants to connect with you'}</p>
                    </div>
                    <div className="request-buttons">
                      <button className="accept-button" onClick={() => handleRequest(notification, 'accepted')}>Accept</button>
                      <button className="reject-button" onClick={() => handleRequest(notification, 'rejected')}>Reject</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </main>
      <footer className="dashboard-footer">
        <p>&copy; 2024 EduSwap. All rights reserved.</p>
        <div className="about-us">
          <h2>About Us</h2>
          <p>We connect students through skill swaps. Learn and teach new skills with us!</p>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
