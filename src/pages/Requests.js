import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
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
            const requestsList = [];
            for (const docSnapshot of querySnapshot.docs) {
              const requestData = docSnapshot.data();
              const requesterDoc = await getDoc(doc(db, 'users', requestData.requesterId));
              if (requesterDoc.exists()) {
                requestData.requesterName = requesterDoc.data().name;
              }
              requestsList.push({ id: docSnapshot.id, ...requestData });
            }
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
      console.log(`Updating request ${requestId} with status ${status}`);
      const requestRef = doc(db, 'requests', requestId);
      await updateDoc(requestRef, { status });
      console.log(`Request ${requestId} status updated to ${status}`);

      // Delete the request document after updating the status
      await deleteDoc(requestRef);
      console.log(`Request ${requestId} deleted`);

      // Remove the request from the state
      setRequests(requests.filter(request => request.id !== requestId));
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
    <div className="requests-page">
      <div className="requests-main">
        <div className="requests-header">
          <h1>Incoming Requests</h1>
        </div>
        <ul>
          {requests.map(request => (
            <li key={request.id} className="request-item">
              <div className="request-info">
                <p>Requester Name: {request.requesterName}</p>
              </div>
              {request.status === 'pending' && (
                <div className="request-buttons">
                  <button className="accept-button" onClick={() => handleRequest(request.id, 'accepted')}>Accept</button>
                  <button className="reject-button" onClick={() => handleRequest(request.id, 'rejected')}>Reject</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Requests;