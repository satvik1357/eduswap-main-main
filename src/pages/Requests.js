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

  const handleRequest = async (request, status) => {
    const db = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError('No user is signed in.');
      return;
    }

    try {
      console.log(`Updating request ${request.id} with status ${status}`);
      const requestRef = doc(db, 'requests', request.id);

      if (status === 'accepted') {
        // Add the requester ID to the receiver's connections
        const receiverRef = doc(db, 'users', currentUser.uid);
        const senderRef = doc(db, 'users', request.requesterId);
        
        const senderDoc = await getDoc(senderRef);
        const receiverDoc = await getDoc(receiverRef);
        
        console.log('Sender Doc:', senderDoc.data());
        console.log('Receiver Doc:', receiverDoc.data());
        
        if (senderDoc.exists() && receiverDoc.exists()) {
          const senderData = senderDoc.data();
          const receiverData = receiverDoc.data();
          
          const senderConnections = senderData.connections || [];
          const receiverConnections = receiverData.connections || [];

          console.log('Sender Connections:', senderConnections);
          console.log('Receiver Connections:', receiverConnections);

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

      // Update the request status
      await updateDoc(requestRef, { status });
      console.log(`Request ${request.id} status updated to ${status}`);

      // Delete the request document after updating the status
      await deleteDoc(requestRef);
      console.log(`Request ${request.id} deleted`);

      // Remove the request from the state
      setRequests(requests.filter(r => r.id !== request.id));
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
                  <button className="accept-button" onClick={() => handleRequest(request, 'accepted')}>Accept</button>
                  <button className="reject-button" onClick={() => handleRequest(request, 'rejected')}>Reject</button>
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
