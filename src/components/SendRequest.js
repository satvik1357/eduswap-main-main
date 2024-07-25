// import React, { useState } from 'react';
// import { getFirestore, addDoc, collection, Timestamp } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

// const SendRequest = ({ receiverId }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleSendRequest = async () => {
//     setLoading(true);
//     setError(null);
//     const db = getFirestore();
//     const auth = getAuth();
//     const currentUser = auth.currentUser;

//     if (!currentUser) {
//       setError('No user is signed in.');
//       setLoading(false);
//       return;
//     }

//     try {
//       await addDoc(collection(db, 'requests'), {
//         requesterId: currentUser.uid, // Use actual current user ID
//         receiverId,
//         status: 'pending',
//         timestamp: Timestamp.now()
//       });
//       console.log('Request sent successfully.');
//     } catch (error) {
//       console.error('Error sending request: ', error);
//       setError('Failed to send request.');
//     }
//     setLoading(false);
//   };

//   return (
//     <div>
//       <button onClick={handleSendRequest} disabled={loading}>
//         {loading ? 'Sending...' : 'Send Request'}
//       </button>
//       {error && <p>{error}</p>}
//     </div>
//   );
// };

// export default SendRequest;
