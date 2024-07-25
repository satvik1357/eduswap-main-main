import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css'; // Ensure the path is correct

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
const provider = new GoogleAuthProvider();
const firestore = getFirestore(app);

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;
      const domain = email.split('@')[1];

      if (domain !== 'vishnu.edu.in') {
        await signOut(auth);
        alert('Only vishnu.edu.in email addresses are allowed.');
      } else {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          if (userDoc.data().profileComplete) {
            console.log('User signed in: ', user);
            navigate('/dashboard'); // Redirect to dashboard if profile is complete
          } else {
            navigate('/profilesetup'); // Redirect to profile setup if profile is not complete
          }
        } else {
          // If the document does not exist, create it with default values
          await setDoc(userDocRef, { email: user.email, profileComplete: false });
          navigate('/profilesetup'); // Redirect to profile setup
        }
      }
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.error('Popup closed by user: ', error);
        alert('Sign-in popup was closed before completing the sign-in process.');
      } else if (error.code === 'firestore/unavailable' || error.message.includes('offline')) {
        console.error('Firestore connection error: ', error);
        alert('Failed to connect to the Firestore database. Please check your network connection.');
      } else if (error.code === 'auth/network-request-failed') {
        console.error('Network error: ', error);
        alert('Network error. Please check your connection.');
      } else {
        console.error('Error signing in: ', error);
        alert('Error signing in. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <h1>Welcome to the Skill Swapping Platform</h1>
      <p>Connect with your peers to exchange skills and knowledge!</p>
      <div className="home-buttons">
        <button className="home-link" onClick={handleGoogleSignIn} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}

export default HomePage;
