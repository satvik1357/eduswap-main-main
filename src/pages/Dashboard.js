import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import '../styles/Dashboard.css'; // Ensure you have this CSS file

const images = [
  '/images/EduSwap.png', // Replace with your image URLs
  '/images/image1.png',
  '/images/image.png',
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
    console.log(`Current index: ${currentIndex}`);
    console.log(`Current image: ${images[currentIndex]}`);
  }, [currentIndex]);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : { skills: [], notifications: [] };

          setUser({
            displayName: currentUser.displayName || 'User',
            skills: userData.skills || [],
            notifications: userData.notifications || []
          });
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to fetch user data.');
        }
      } else {
        setUser(null);
        setError('No user is signed in.');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </nav>
      <header className="dashboard-header">
        <h1>Welcome, {user.displayName}!</h1>
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
      </header>
      <main className="dashboard-main">
        <section className="dashboard-overview">
          <h2>Your Skills</h2>
          <ul>
            {user.skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </section>
        <section className="dashboard-notifications">
          <h2>Notifications</h2>
          <ul>
            {user.notifications.map((notification, index) => (
              <li key={index}>{notification}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
