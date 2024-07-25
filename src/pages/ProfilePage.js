import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import '../styles/ProfilePage.css';
import logo from '../images/logo.jpg'; // Update the path to your logo

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth();
      const db = getFirestore();

      onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const userDoc = doc(db, 'users', currentUser.uid);
            const userSnapshot = await getDoc(userDoc);
            if (userSnapshot.exists()) {
              setProfile(userSnapshot.data());
            } else {
              setError('Profile not found');
            }
          } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to fetch profile.');
          } finally {
            setLoading(false);
          }
        } else {
          setError('No user is signed in.');
          setLoading(false);
        }
      });
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="profile-page">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">EduSwap</Link>
        </div>
        <ul className="navbar-nav">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/explore">Explore</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </nav>
      <div className="profile-content">
        <header className="profile-header">
          <div className="profile-image-container">
            <img src={logo} alt="Profile" className="profile-image" />
          </div>
          <div className="profile-info">
            <h1>{profile.name}</h1>
            <h2>{profile.branch} - {profile.year}</h2>
          </div>
        </header>
        <main className="profile-main">
          <section className="profile-section">
            <h3>Skills</h3>
            <ul>
              {Array.isArray(profile.skills) ? (
                profile.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))
              ) : (
                <li>{profile.skills}</li>
              )}
            </ul>
          </section>
          <section className="profile-section">
            <h3>Experience</h3>
            <p>{profile.experience}</p>
          </section>
          <section className="profile-section">
            <h3>Certifications</h3>
            <p>{profile.certifications}</p>
          </section>
          <section className="profile-section">
            <h3>Projects</h3>
            <p>{profile.projects}</p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;