import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import '../styles/ProfileSetup.css'; // Ensure you have this CSS file

const db = getFirestore();

const ProfileSetup = () => {
  const [skills, setSkills] = useState([]);
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [name, setName] = useState('');
  const [experience, setExperience] = useState('');
  const [certifications, setCertifications] = useState('');
  const [projects, setProjects] = useState('');
  const navigate = useNavigate();

  const handleAddSkill = () => {
    if (newSkill.trim() !== '') {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const handleCompleteProfile = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, {
          name,
          skills,
          branch,
          year,
          experience,
          certifications,
          projects,
          profileComplete: true
        });
        navigate('/dashboard'); // Redirect to Dashboard on completion
      } catch (error) {
        console.error('Error updating profile: ', error);
        alert('Failed to update profile. Please try again.');
      }
    } else {
      console.error('No user is signed in');
      alert('No user is signed in. Please sign in again.');
    }
  };

  return (
    <div className="profile-setup-page">
      <nav className="navbar">
        <div className="navbar-brand">
          <a href="/">EduSwap</a>
        </div>
        <ul className="navbar-links">
          <li><a className="navbar-link" href="/">Home</a></li>
          <li><a className="navbar-link" href="/about">About</a></li>
          <li><a className="navbar-link" href="/contact">Contact</a></li>
        </ul>
      </nav>
      <div className="profile-setup">
        <h2>Complete Your Profile</h2>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Branch:
          <select value={branch} onChange={(e) => setBranch(e.target.value)} required>
            <option value="">Select Branch</option>
            <option value="AI&DS">AI&DS</option>
            <option value="AI&ML">AI&ML</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
            <option value="EEE">EEE</option>
            <option value="CSBS">CSBS</option>
          </select>
        </label>
        <label>
          Year:
          <select value={year} onChange={(e) => setYear(e.target.value)} required>
            <option value="">Select Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </label>
        <label>
          Skills:
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
          />
          <button type="button" onClick={handleAddSkill}>Add</button>
        </label>
        <ul>
          {skills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
        <label>
          Experience:
          <input
            type="text"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </label>
        <label>
          Certifications:
          <input
            type="text"
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
          />
        </label>
        <label>
          Projects:
          <input
            type="text"
            value={projects}
            onChange={(e) => setProjects(e.target.value)}
          />
        </label>
        <button type="button" onClick={handleCompleteProfile}>Complete</button>
      </div>
    </div>
  );
};

export default ProfileSetup;