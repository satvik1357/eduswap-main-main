import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import '../styles/Requests.css';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      const auth = getAuth();
      const db = getFirestore();

      onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const q = query(collection(db, 'requests'), where('receiverId', '==', currentUser.uid));
            const querySnapshot = await getDocs(q);
            const requestsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRequests(requestsList);
            setLoading(false);
          } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to fetch requests.');
            setLoading(false);
          }
        } else {
          setError('No user is signed in.');
          setLoading(false);
        }
      });
    };

    fetchRequests();
  }, []);

  const handleRequest = async (requestId, status) => {
    const db = getFirestore();

    try {
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, { status });
      setRequests(requests.map(request => request.id === requestId ? { ...request, status } : request));
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
    <div className="requests">
      <h1>Incoming Requests</h1>
      <ul>
        {requests.map(request => (
          <li key={request.id}>
            <p>Requester ID: {request.requesterId}</p>
            <p>Status: {request.status}</p>
            {request.status === 'pending' && (
              <div>
                <button onClick={() => handleRequest(request.id, 'accepted')}>Accept</button>
                <button onClick={() => handleRequest(request.id, 'rejected')}>Reject</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Requests;
