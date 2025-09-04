// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


// import React, { useRef } from "react";

// function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerConnection = useRef(null);

//   const startCall = async () => {
//     peerConnection.current = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });
//     localVideoRef.current.srcObject = stream;

//     stream.getTracks().forEach((track) => {
//       peerConnection.current.addTrack(track, stream);
//     });

//     peerConnection.current.ontrack = (event) => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };

//     const offer = await peerConnection.current.createOffer();
//     await peerConnection.current.setLocalDescription(offer);
//     await peerConnection.current.setRemoteDescription(offer);

//     const answer = await peerConnection.current.createAnswer();
//     await peerConnection.current.setLocalDescription(answer);
//     await peerConnection.current.setRemoteDescription(answer);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
//       <h1 className="text-3xl font-bold mb-4">Video Call (Loopback Test)</h1>

//       <div className="flex gap-6">
//         {/* Remote video (left side) */}
//         <video
//           ref={remoteVideoRef}
//           autoPlay
//           playsInline
//           className="w-64 h-48 bg-black rounded-lg shadow-lg"
//         />

//         {/* Local video (right side, muted) */}
//         <video
//           ref={localVideoRef}
//           autoPlay
//           playsInline
//           muted
//           className="w-64 h-48 bg-black rounded-lg shadow-lg"
//         />
//       </div>

//       <button
//         onClick={startCall}
//         className="mt-6 px-4 py-2 bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700"
//       >
//         Start Call
//       </button>
//     </div>
//   );
// }

// export default App;

// import React, { useRef } from "react";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:3001");

// function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerConnection = useRef(null);

//   const startCall = async () => {
//     peerConnection.current = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     // get camera + mic
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     localVideoRef.current.srcObject = stream;

//     // add tracks
//     stream.getTracks().forEach((track) => {
//       peerConnection.current.addTrack(track, stream);
//     });

//     // remote stream
//     peerConnection.current.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     // send ICE candidates
//     peerConnection.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", event.candidate);
//       }
//     };

//     // create & send offer
//     const offer = await peerConnection.current.createOffer();
//     await peerConnection.current.setLocalDescription(offer);
//     socket.emit("offer", offer);
//   };

//   // listen for offer
//   socket.on("offer", async (offer) => {
//     if (!peerConnection.current) {
//       peerConnection.current = new RTCPeerConnection({
//         iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//       });

//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       localVideoRef.current.srcObject = stream;
//       stream.getTracks().forEach((track) => {
//         peerConnection.current.addTrack(track, stream);
//       });

//       peerConnection.current.ontrack = (event) => {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       };

//       peerConnection.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("ice-candidate", event.candidate);
//         }
//       };
//     }

//     await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//     const answer = await peerConnection.current.createAnswer();
//     await peerConnection.current.setLocalDescription(answer);
//     socket.emit("answer", answer);
//   });

//   // listen for answer
//   socket.on("answer", async (answer) => {
//     await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//   });

//   // listen for ICE
//   socket.on("ice-candidate", async (candidate) => {
//     try {
//       await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//     } catch (e) {
//       console.error("Error adding ICE candidate:", e);
//     }
//   });

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
//       <h1 className="text-2xl font-bold mb-4">WebRTC Video Call</h1>
//       <div className="flex gap-6">
//         <video ref={remoteVideoRef} autoPlay playsInline className="w-64 h-48 bg-black" />
//         <video ref={localVideoRef} autoPlay playsInline muted className="w-64 h-48 bg-black" />
//       </div>
//       <button
//         onClick={startCall}
//         className="mt-6 px-4 py-2 bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700"
//       >
//         Start Call
//       </button>
//     </div>
//   );
// }

// export default App;
// import React, { useRef, useState } from "react";
// import io from "socket.io-client";

// const socket = io("http://localhost:5000");

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const [started, setStarted] = useState(false);

//   const startCall = async () => {
//     pcRef.current = new RTCPeerConnection();

//     // Local stream
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     localStreamRef.current = stream;
//     stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));
//     localVideoRef.current.srcObject = stream;

//     // Remote stream
//     pcRef.current.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     // ICE candidates
//     pcRef.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("candidate", event.candidate);
//       }
//     };

//     // Handle signaling
//     socket.on("offer", async (offer) => {
//       if (!pcRef.current) return;
//       await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await pcRef.current.createAnswer();
//       await pcRef.current.setLocalDescription(answer);
//       socket.emit("answer", answer);
//     });

//     socket.on("answer", async (answer) => {
//       if (!pcRef.current) return;
//       await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//     });

//     socket.on("candidate", async (candidate) => {
//       if (!pcRef.current) return;
//       try {
//         await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//       } catch (err) {
//         console.error("Error adding candidate:", err);
//       }
//     });

//     // Create and send offer
//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);
//     socket.emit("offer", offer);

//     setStarted(true);
//   };

//   const endCall = () => {
//     if (pcRef.current) {
//       pcRef.current.close();
//       pcRef.current = null;
//     }

//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach(track => track.stop());
//       localStreamRef.current = null;
//     }

//     if (localVideoRef.current) localVideoRef.current.srcObject = null;
//     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//     setStarted(false);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
//       <h1 className="text-3xl font-bold mb-4">WebRTC Video Call</h1>
//       <div className="flex gap-4">
//         <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 rounded-xl bg-black" />
//         <video ref={localVideoRef} autoPlay playsInline muted className="w-1/2 rounded-xl bg-black" />
//       </div>
//       <div className="mt-4 flex gap-4">
//         {!started && (
//           <button
//             onClick={startCall}
//             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
//           >
//             Start Call
//           </button>
//         )}
//         {started && (
//           <button
//             onClick={endCall}
//             className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
//           >
//             End Call
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// import React, { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";

// const socket = io("http://localhost:3001"); // connect to signaling server

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const [room, setRoom] = useState("interview-room");
//   const [joined, setJoined] = useState(false);

//   useEffect(() => {
//     socket.on("offer", async ({ sdp, from }) => {
//       if (!pcRef.current) createPeerConnection();
//       await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//       const answer = await pcRef.current.createAnswer();
//       await pcRef.current.setLocalDescription(answer);
//       socket.emit("answer", { room, sdp: answer });
//     });

//     socket.on("answer", async ({ sdp }) => {
//       await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       if (candidate) {
//         try {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (err) {
//           console.error("Error adding ICE candidate:", err);
//         }
//       }
//     });

//     return () => {
//       socket.off("offer");
//       socket.off("answer");
//       socket.off("ice-candidate");
//     };
//   }, [room]);

//   const createPeerConnection = () => {
//     const pc = new RTCPeerConnection();

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", { room, candidate: event.candidate });
//       }
//     };

//     pc.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     pcRef.current = pc;
//   };

//   const joinRoom = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     localVideoRef.current.srcObject = stream;

//     createPeerConnection();
//     stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));

//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);
//     socket.emit("join", room);
//     socket.emit("offer", { room, sdp: offer });

//     setJoined(true);
//   };

//   return (
//     <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
//       {!joined ? (
//         <button
//           onClick={joinRoom}
//           className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-500"
//         >
//           Start Call
//         </button>
//       ) : (
//         <div className="flex gap-4">
//           <video ref={localVideoRef} autoPlay playsInline muted className="w-1/2 rounded-lg" />
//           <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 rounded-lg" />
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";

// const socket = io("https://ai-ii3n.onrender.com"); // signaling server

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const [room, setRoom] = useState("");
//   const [joined, setJoined] = useState(false);

//   useEffect(() => {
//     socket.on("offer", async (offer) => {
//       if (!pcRef.current) createPeerConnection();
//       await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));

//       const answer = await pcRef.current.createAnswer();
//       await pcRef.current.setLocalDescription(answer);

//       socket.emit("answer", { room, answer });
//     });

//     socket.on("answer", async (answer) => {
//       if (pcRef.current) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//       }
//     });

//     socket.on("ice-candidate", async (candidate) => {
//       try {
//         await pcRef.current.addIceCandidate(candidate);
//       } catch (e) {
//         console.error("Error adding ice candidate", e);
//       }
//     });
//   }, [room]);

//   const createPeerConnection = () => {
//     const pc = new RTCPeerConnection();

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", { room, candidate: event.candidate });
//       }
//     };

//     pc.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     pcRef.current = pc;
//     return pc;
//   };

//   const joinRoom = async () => {
//     setJoined(true);
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     localVideoRef.current.srcObject = stream;

//     const pc = createPeerConnection();
//     stream.getTracks().forEach((track) => pc.addTrack(track, stream));

//     socket.emit("join", room);
//   };

//   const callUser = async () => {
//     if (!pcRef.current) return;
//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);

//     socket.emit("offer", { room, offer });
//   };

//   return (
//     <div className="p-4">
//       {!joined ? (
//         <div>
//           <input
//             type="text"
//             placeholder="Enter room name"
//             value={room}
//             onChange={(e) => setRoom(e.target.value)}
//           />
//           <button onClick={joinRoom}>Join Room</button>
//         </div>
//       ) : (
//         <div>
//           <button onClick={callUser}>Start Call</button>
//           <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
//             <video ref={localVideoRef} autoPlay muted playsInline width="300" />
//             <video ref={remoteVideoRef} autoPlay playsInline width="300" />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";

// const socket = io("https://ai-ii3n.onrender.com", {
//   transports: ["websocket"]
// }); // signaling server

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const [room, setRoom] = useState("");
//   const [joined, setJoined] = useState(false);

//   useEffect(() => {
//     socket.on("offer", async (offer) => {
//       if (!pcRef.current) createPeerConnection();
//       await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));

//       const answer = await pcRef.current.createAnswer();
//       await pcRef.current.setLocalDescription(answer);

//       socket.emit("answer", { room, answer });
//     });

//     socket.on("answer", async (answer) => {
//       if (pcRef.current) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//       }
//     });

//     socket.on("ice-candidate", async (candidate) => {
//       try {
//         await pcRef.current.addIceCandidate(candidate);
//       } catch (e) {
//         console.error("Error adding ice candidate", e);
//       }
//     });
//   }, [room]);

//   const createPeerConnection = () => {
//     const pc = new RTCPeerConnection();

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", { room, candidate: event.candidate });
//       }
//     };

//     pc.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     pcRef.current = pc;
//     return pc;
//   };

//   const joinRoom = async () => {
//     setJoined(true);
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     localStreamRef.current = stream; // keep reference
//     localVideoRef.current.srcObject = stream;

//     const pc = createPeerConnection();
//     stream.getTracks().forEach((track) => pc.addTrack(track, stream));

//     socket.emit("join", room);
//   };

//   const callUser = async () => {
//     if (!pcRef.current) return;
//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);

//     socket.emit("offer", { room, offer });
//   };

//   const endCall = () => {
//     // stop all local tracks
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => track.stop());
//       localStreamRef.current = null;
//     }

//     // close peer connection
//     if (pcRef.current) {
//       pcRef.current.close();
//       pcRef.current = null;
//     }

//     // clear video elements
//     if (localVideoRef.current) localVideoRef.current.srcObject = null;
//     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//     setJoined(false);
//     setRoom(""); // optional reset
//     socket.emit("leave", room); // notify server (you can handle this in server)
//   };

//   return (
//     <div className="p-4">
//       {!joined ? (
//         <div>
//           <input
//             type="text"
//             placeholder="Enter room name"
//             value={room}
//             onChange={(e) => setRoom(e.target.value)}
//           />
//           <button onClick={joinRoom}>Join Room</button>
//         </div>
//       ) : (
//         <div>
//           <button onClick={callUser}>Start Call</button>
//           <button onClick={endCall} style={{ marginLeft: "10px", color: "red" }}>
//             End Call
//           </button>
//           <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
//             <video ref={localVideoRef} autoPlay muted playsInline width="300" />
//             <video ref={remoteVideoRef} autoPlay playsInline width="300" />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";

// // Connect to your Render signaling server
// const socket = io("https://ai-ii3n.onrender.com", {
//   transports: ["websocket"],
// });

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const [room, setRoom] = useState("");
//   const [joined, setJoined] = useState(false);

//   useEffect(() => {
//     socket.on("offer", async ({ sdp }) => {
//       if (!pcRef.current) createPeerConnection();
//       await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

//       const answer = await pcRef.current.createAnswer();
//       await pcRef.current.setLocalDescription(answer);

//       socket.emit("answer", { room, sdp: answer });
//     });

//     socket.on("answer", async ({ sdp }) => {
//       if (pcRef.current) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//       }
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       try {
//         await pcRef.current.addIceCandidate(candidate);
//       } catch (e) {
//         console.error("Error adding ICE candidate", e);
//       }
//     });

//     return () => {
//       socket.off("offer");
//       socket.off("answer");
//       socket.off("ice-candidate");
//     };
//   }, [room]);

//   const createPeerConnection = () => {
//     const pc = new RTCPeerConnection();

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", { room, candidate: event.candidate });
//       }
//     };

//     pc.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     pcRef.current = pc;
//     return pc;
//   };

//   const joinRoom = async () => {
//     if (!room) {
//       alert("Enter a room name first!");
//       return;
//     }

//     setJoined(true);
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });
//     localVideoRef.current.srcObject = stream;

//     const pc = createPeerConnection();
//     stream.getTracks().forEach((track) => pc.addTrack(track, stream));

//     socket.emit("join", room);
//   };

//   const callUser = async () => {
//     if (!pcRef.current) return;
//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);

//     socket.emit("offer", { room, sdp: offer });
//   };

//   const endCall = () => {
//     if (pcRef.current) {
//       pcRef.current.close();
//       pcRef.current = null;
//     }
//     if (localVideoRef.current?.srcObject) {
//       localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//       localVideoRef.current.srcObject = null;
//     }
//     if (remoteVideoRef.current?.srcObject) {
//       remoteVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//       remoteVideoRef.current.srcObject = null;
//     }
//     setJoined(false);
//     socket.emit("leave", room);
//   };

//   return (
//     <div className="p-4">
//       {!joined ? (
//         <div>
//           <input
//             type="text"
//             placeholder="Enter room name"
//             value={room}
//             onChange={(e) => setRoom(e.target.value)}
//           />
//           <button onClick={joinRoom}>Join Room</button>
//         </div>
//       ) : (
//         <div>
//           <button onClick={callUser}>Start Call</button>
//           <button onClick={endCall} style={{ marginLeft: "10px" }}>
//             End Call
//           </button>
//           <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
//             <video ref={localVideoRef} autoPlay muted playsInline width="300" />
//             <video ref={remoteVideoRef} autoPlay playsInline width="300" />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// screen sharing not possible
// import { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";

// // 👉 Replace with your deployed Render server URL
// const socket = io("https://ai-ii3n.onrender.com", {
//   transports: ["websocket"],
// });

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const recorderRef = useRef(null);
//   const localStreamRef = useRef(null);

//   const [room, setRoom] = useState("");
//   const [joined, setJoined] = useState(false);
//   const [waiting, setWaiting] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);
//   const [recording, setRecording] = useState(false);

//   // --- socket handlers ---
//   useEffect(() => {
//     socket.on("offer", async (offer) => {
//       if (!pcRef.current) createPeerConnection();
//       await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));

//       const answer = await pcRef.current.createAnswer();
//       await pcRef.current.setLocalDescription(answer);

//       socket.emit("answer", { room, answer });
//       setWaiting(false);
//     });

//     socket.on("answer", async (answer) => {
//       if (pcRef.current) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//         setWaiting(false);
//       }
//     });

//     socket.on("ice-candidate", async (candidate) => {
//       try {
//         await pcRef.current.addIceCandidate(candidate);
//       } catch (e) {
//         console.error("Error adding ICE candidate", e);
//       }
//     });

//     return () => {
//       socket.off("offer");
//       socket.off("answer");
//       socket.off("ice-candidate");
//     };
//   }, [room]);

//   // --- peer connection setup ---
 
//   const createPeerConnection = () => {
//   const pc = new RTCPeerConnection({
//     iceServers: [
//       { urls: "stun:stun.l.google.com:19302" }  // 👈 Add STUN server
//     ]
//   });

//   pc.onicecandidate = (event) => {
//     if (event.candidate) {
//       socket.emit("ice-candidate", { room, candidate: event.candidate });
//     }
//   };

//   pc.ontrack = (event) => {
//     if (remoteVideoRef.current) {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     }
//   };

//   pcRef.current = pc;
//   return pc;
// };


//   // --- join room ---
//   const joinRoom = async () => {
//     if (!room) {
//       alert("Enter a room name first!");
//       return;
//     }

//     setJoined(true);
//     setWaiting(true);

//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });
//     localStreamRef.current = stream;
//     localVideoRef.current.srcObject = stream;

//     const pc = createPeerConnection();
//     stream.getTracks().forEach((track) => pc.addTrack(track, stream));

//     socket.emit("join", room);
//   };

//   // --- start call (send offer) ---
//   const callUser = async () => {
//     if (!pcRef.current) return;
//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);

//     socket.emit("offer", { room, offer });
//     setWaiting(true);
//   };

//   // --- end call ---
//   const endCall = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => track.stop());
//       localStreamRef.current = null;
//     }
//     if (pcRef.current) {
//       pcRef.current.close();
//       pcRef.current = null;
//     }
//     if (localVideoRef.current) localVideoRef.current.srcObject = null;
//     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//     setJoined(false);
//     setWaiting(false);
//     setIsMuted(false);
//     setVideoOff(false);
//     setRecording(false);

//     socket.emit("leave", room);
//   };

//   // --- mute/unmute ---
//   const toggleMute = () => {
//     if (!localStreamRef.current) return;
//     localStreamRef.current.getAudioTracks().forEach(
//       (track) => (track.enabled = !track.enabled)
//     );
//     setIsMuted((prev) => !prev);
//   };

//   // --- video on/off ---
//   const toggleVideo = () => {
//     if (!localStreamRef.current) return;
//     localStreamRef.current.getVideoTracks().forEach(
//       (track) => (track.enabled = !track.enabled)
//     );
//     setVideoOff((prev) => !prev);
//   };

//   // --- share screen ---
//   const shareScreen = async () => {
//     const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
//     const videoTrack = screenStream.getVideoTracks()[0];

//     const sender = pcRef.current.getSenders().find((s) => s.track.kind === "video");
//     if (sender) sender.replaceTrack(videoTrack);

//     videoTrack.onended = () => {
//       if (localStreamRef.current) {
//         const camTrack = localStreamRef.current.getVideoTracks()[0];
//         sender.replaceTrack(camTrack);
//       }
//     };
//   };

//   // --- start recording ---
//   const startRecording = () => {
//     if (!localStreamRef.current || !remoteVideoRef.current.srcObject) return;

//     const combinedStream = new MediaStream([
//       ...localStreamRef.current.getTracks(),
//       ...remoteVideoRef.current.srcObject.getTracks(),
//     ]);

//     const recorder = new MediaRecorder(combinedStream);
//     recorderRef.current = recorder;

//     const chunks = [];
//     recorder.ondataavailable = (e) => chunks.push(e.data);
//     recorder.onstop = () => {
//       const blob = new Blob(chunks, { type: "video/webm" });
//       const url = URL.createObjectURL(blob);

//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "recording.webm";
//       a.click();
//     };

//     recorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     recorderRef.current?.stop();
//     setRecording(false);
//   };

//   // --- UI ---
//   return (
//     <div style={{ background: "#1e1e1e", height: "100vh", color: "white", padding: "20px" }}>
//       {!joined ? (
//         <div>
//           <input
//             type="text"
//             placeholder="Enter room name"
//             value={room}
//             onChange={(e) => setRoom(e.target.value)}
//             style={{ padding: "8px", marginRight: "10px" }}
//           />
//           <button onClick={joinRoom}>Join Room</button>
//         </div>
//       ) : (
//         <div>
//           <div style={{ marginBottom: "10px" }}>
//             <button onClick={callUser}>Start Call</button>
//             <button onClick={endCall}>End Call</button>
//             <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>
//             <button onClick={toggleVideo}>{videoOff ? "Turn Video On" : "Turn Video Off"}</button>
//             <button onClick={shareScreen}>Share Screen</button>
//             {!recording ? (
//               <button onClick={startRecording}>Start Recording</button>
//             ) : (
//               <button onClick={stopRecording}>Stop Recording</button>
//             )}
//           </div>

//           {waiting && <p>⏳ Waiting for peer to join...</p>}

//           <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
//             <video ref={localVideoRef} autoPlay muted playsInline width="300" />
//             <video ref={remoteVideoRef} autoPlay playsInline width="300" />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// 
// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SIGNALING_SERVER = "https://ai-ii3n.onrender.com";
// const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const screenTrackRef = useRef(null);
//   const currentFacingMode = useRef("user");

//   const recorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const canvasRef = useRef(null);
//   const rafRef = useRef(null);

//   const [joined, setJoined] = useState(false);
//   const [inCall, setInCall] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);
//   const [screenSharing, setScreenSharing] = useState(false);
//   const [recording, setRecording] = useState(false);
//   const [pipMode, setPipMode] = useState(false);
//   const pipDragOffset = useRef({ x: 0, y: 0 });

//   // ----------------- SOCKET -----------------
//   useEffect(() => {
//     socket.on("offer", async (offer) => {
//       if (!pcRef.current) createPeerConnection();
//       try {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
//         const answer = await pcRef.current.createAnswer();
//         await pcRef.current.setLocalDescription(answer);
//         socket.emit("answer", { room: "global-room", answer });
//         setInCall(true);
//       } catch (e) {
//         console.error("Error handling offer:", e);
//       }
//     });

//     socket.on("answer", async (answer) => {
//       try {
//         if (pcRef.current && answer) {
//           await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//           setInCall(true);
//         }
//       } catch (e) {
//         console.error("Error applying answer:", e);
//       }
//     });

//     socket.on("ice-candidate", async (candidate) => {
//       try {
//         if (pcRef.current && candidate) {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (e) {
//         console.error("Error adding ICE candidate:", e);
//       }
//     });

//     socket.on("user-joined", () => {
//       if (pcRef.current && localStreamRef.current && !inCall) {
//         startCall();
//       }
//     });

//     socket.on("user-left", () => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = null;
//       }
//       setInCall(false);
//     });

//     // auto-join once
//     joinRoom("global-room");

//     return () => {
//       socket.off("offer");
//       socket.off("answer");
//       socket.off("ice-candidate");
//       socket.off("user-joined");
//       socket.off("user-left");
//     };
//   }, []);

//   // ----------------- PEER CONNECTION -----------------
//   const createPeerConnection = () => {
//     if (pcRef.current) return pcRef.current;

//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", { room: "global-room", candidate: event.candidate });
//       }
//     };

//     pc.ontrack = (event) => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };

//     pc.onconnectionstatechange = () => {
//       if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
//         setInCall(false);
//       }
//     };

//     pcRef.current = pc;
//     return pc;
//   };

//   // ----------------- JOIN -----------------
//   const joinRoom = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: currentFacingMode.current },
//         audio: true,
//       });

//       localStreamRef.current = stream;
//       localVideoRef.current.srcObject = stream;
//       localVideoRef.current.muted = true;

//       const pc = createPeerConnection();
//       stream.getTracks().forEach((t) => pc.addTrack(t, stream));

//       socket.emit("join", "global-room");
//       setJoined(true);
//     } catch (e) {
//       console.error("getUserMedia error:", e);
//     }
//   };

//   // ----------------- CALL -----------------
//   const startCall = async () => {
//     try {
//       if (!pcRef.current) createPeerConnection();
//       const offer = await pcRef.current.createOffer();
//       await pcRef.current.setLocalDescription(offer);
//       socket.emit("offer", { room: "global-room", offer });
//     } catch (e) {
//       console.error("startCall error:", e);
//     }
//   };

//   const endCall = () => {
//     if (recording) stopRecording();
//     if (screenSharing) stopScreenShare();

//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//       localStreamRef.current = null;
//     }

//     if (pcRef.current) {
//       try {
//         pcRef.current.close();
//       } catch {}
//       pcRef.current = null;
//     }

//     if (localVideoRef.current) localVideoRef.current.srcObject = null;
//     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//     setJoined(false);
//     setInCall(false);

//     socket.emit("leave", "global-room");
//   };

//   // ----------------- TOGGLES -----------------
//   const toggleMute = () => {
//     if (!localStreamRef.current) return;
//     localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
//     setMuted((m) => !m);
//   };

//   const toggleVideo = () => {
//     if (!localStreamRef.current) return;
//     localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
//     setVideoOff((v) => !v);
//   };

//   const switchCamera = async () => {
//     try {
//       currentFacingMode.current = currentFacingMode.current === "user" ? "environment" : "user";
//       const newStream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: currentFacingMode.current },
//         audio: true,
//       });

//       const newVideoTrack = newStream.getVideoTracks()[0];
//       const pc = createPeerConnection();
//       const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
//       if (sender) await sender.replaceTrack(newVideoTrack);

//       if (localStreamRef.current) {
//         localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
//       }
//       localStreamRef.current = newStream;
//       localVideoRef.current.srcObject = newStream;
//       localVideoRef.current.muted = true;
//     } catch (e) {
//       console.error("switchCamera error:", e);
//     }
//   };

//   // screen share toggle
//   const startScreenShare = async () => {
//     try {
//       const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
//       const screenTrack = screenStream.getVideoTracks()[0];
//       screenTrackRef.current = screenTrack;

//       const pc = createPeerConnection();
//       const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
//       if (sender) {
//         await sender.replaceTrack(screenTrack);
//       }

//       localVideoRef.current.srcObject = screenStream;
//       setScreenSharing(true);

//       screenTrack.onended = () => stopScreenShare();
//     } catch (e) {
//       console.error("startScreenShare error:", e);
//     }
//   };

//   const stopScreenShare = async () => {
//     try {
//       const pc = createPeerConnection();
//       const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
//       if (localStreamRef.current) {
//         const camTrack = localStreamRef.current.getVideoTracks()[0];
//         if (sender && camTrack) {
//           await sender.replaceTrack(camTrack);
//           localVideoRef.current.srcObject = localStreamRef.current;
//         }
//       }
//       if (screenTrackRef.current) {
//         try {
//           screenTrackRef.current.stop();
//         } catch {}
//         screenTrackRef.current = null;
//       }
//       setScreenSharing(false);
//     } catch (e) {
//       console.error("stopScreenShare error:", e);
//     }
//   };

//   const toggleScreenShare = () => {
//     if (!screenSharing) startScreenShare();
//     else stopScreenShare();
//   };

//   // ----------------- RECORDING -----------------
//   const startRecording = () => {
//     if (!localStreamRef.current || !remoteVideoRef.current?.srcObject) return;

//     const remote = remoteVideoRef.current;
//     const w = remote.videoWidth || 1280;
//     const h = remote.videoHeight || 720;

//     const canvas = document.createElement("canvas");
//     canvas.width = w;
//     canvas.height = h;
//     canvasRef.current = canvas;
//     const ctx = canvas.getContext("2d");

//     const draw = () => {
//       ctx.fillStyle = "#000";
//       ctx.fillRect(0, 0, w, h);
//       if (remote && remote.srcObject) ctx.drawImage(remote, 0, 0, w, h);

//       const local = localVideoRef.current;
//       const pipW = Math.floor(w / 4);
//       const pipH = Math.floor((pipW * (local.videoHeight || 240)) / (local.videoWidth || 320));
//       const pipX = w - pipW - 12;
//       const pipY = h - pipH - 12;
//       if (local && local.srcObject) ctx.drawImage(local, pipX, pipY, pipW, pipH);

//       rafRef.current = requestAnimationFrame(draw);
//     };
//     draw();

//     const canvasStream = canvas.captureStream(30);
//     const audioContext = new AudioContext();
//     const dest = audioContext.createMediaStreamDestination();

//     if (localStreamRef.current) {
//       const localSource = audioContext.createMediaStreamSource(localStreamRef.current);
//       localSource.connect(dest);
//     }
//     const remoteStream = remoteVideoRef.current.srcObject;
//     if (remoteStream) {
//       try {
//         const remoteSource = audioContext.createMediaStreamSource(remoteStream);
//         remoteSource.connect(dest);
//       } catch (e) {}
//     }

//     const mixedStream = new MediaStream();
//     canvasStream.getVideoTracks().forEach((t) => mixedStream.addTrack(t));
//     dest.stream.getAudioTracks().forEach((t) => mixedStream.addTrack(t));

//     const recorder = new MediaRecorder(mixedStream, { mimeType: "video/webm; codecs=vp9" });
//     recordedChunksRef.current = [];
//     recorder.ondataavailable = (e) => {
//       if (e.data.size > 0) recordedChunksRef.current.push(e.data);
//     };
//     recorder.onstop = () => {
//       cancelAnimationFrame(rafRef.current);
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `recording_${Date.now()}.webm`;
//       a.click();
//       try {
//         audioContext.close();
//       } catch {}
//       canvasRef.current = null;
//     };

//     recorderRef.current = recorder;
//     recorder.start(1000);
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     if (recorderRef.current && recorderRef.current.state !== "inactive") {
//       recorderRef.current.stop();
//     }
//     setRecording(false);
//   };

//   // ----------------- UI -----------------
//   return (
//     <div style={{ background: "#0b1020", height: "100vh", display: "flex", flexDirection: "column" }}>
//       <style>{`
//         .video-area { flex:1; display:flex; align-items:center; justify-content:center; position:relative; }
//         .video-box { position:relative; width:70%; max-width:1100px; min-height:420px; background:black; border-radius:12px; overflow:hidden; display:flex; align-items:center; justify-content:center; }
//         video { width:100%; height:100%; object-fit:cover; background:black; }
//         #local-pip { position:absolute; width:180px; height:120px; right:16px; bottom:16px; border-radius:8px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.6); }
//         #local-pip video { width:100%; height:100%; object-fit:cover; }
//         .controls { position:fixed; left:50%; transform:translateX(-50%); bottom:18px; display:flex; gap:12px; }
//         .control-btn { width:58px; height:58px; border-radius:50%; background:#111827; display:flex; align-items:center; justify-content:center; color:white; font-size:22px; cursor:pointer; box-shadow:0 6px 18px rgba(0,0,0,0.5); }
//         .control-btn.red { background:#ef4444; }
//         .control-btn.warn { background:#f59e0b; }
//       `}</style>

//       <div className="video-area">
//         <div className="video-box">
//           <video ref={remoteVideoRef} autoPlay playsInline />
//           {joined && (
//             <div id="local-pip">
//               <video ref={localVideoRef} autoPlay muted playsInline />
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="controls">
//         <div title="Mute" className={`control-btn ${muted ? "red" : ""}`} onClick={toggleMute}>
//           {muted ? "🔈" : "🎤"}
//         </div>
//         <div title="Video" className={`control-btn ${videoOff ? "red" : ""}`} onClick={toggleVideo}>
//           {videoOff ? "📵" : "📷"}
//         </div>
//         <div title="Switch Camera" className="control-btn" onClick={switchCamera}>🔁</div>
//         <div title={screenSharing ? "Stop Share" : "Share Screen"} className={`control-btn ${screenSharing ? "warn" : ""}`} onClick={toggleScreenShare}>🖥️</div>
//         <div title={recording ? "Stop Rec" : "Record"} className={`control-btn ${recording ? "red" : ""}`} onClick={() => recording ? stopRecording() : startRecording()}>⏺</div>
//         <div title="Hang up" className="control-btn red" onClick={endCall}>📞</div>
//       </div>
//     </div>
//   );
// }

                 // ADDING FEATURES TO ZOOM IN
// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SIGNALING_SERVER = "https://ai-ii3n.onrender.com";
// const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const screenTrackRef = useRef(null);
//   const currentFacingMode = useRef("user");

//   const recorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const canvasRef = useRef(null);
//   const rafRef = useRef(null);

//   const [joined, setJoined] = useState(false);
//   const [inCall, setInCall] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);
//   const [screenSharing, setScreenSharing] = useState(false);
//   const [recording, setRecording] = useState(false);

//   // NEW state for layout modes
//   const [layoutMode, setLayoutMode] = useState("solo"); // solo | split | pip
//   const [fullscreenSelf, setFullscreenSelf] = useState(false);

//   // ----------------- SOCKET -----------------
//   useEffect(() => {
//     socket.on("offer", async (offer) => {
//       if (!pcRef.current) createPeerConnection();
//       try {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
//         const answer = await pcRef.current.createAnswer();
//         await pcRef.current.setLocalDescription(answer);
//         socket.emit("answer", { room: "global-room", answer });
//         setInCall(true);
//       } catch (e) {
//         console.error("Error handling offer:", e);
//       }
//     });

//     socket.on("answer", async (answer) => {
//       try {
//         if (pcRef.current && answer) {
//           await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//           setInCall(true);
//         }
//       } catch (e) {
//         console.error("Error applying answer:", e);
//       }
//     });

//     socket.on("ice-candidate", async (candidate) => {
//       try {
//         if (pcRef.current && candidate) {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (e) {
//         console.error("Error adding ICE candidate:", e);
//       }
//     });

//     socket.on("user-joined", () => {
//       if (pcRef.current && localStreamRef.current && !inCall) {
//         startCall();
//       }
//       setLayoutMode("split"); // when peer joins → split view
//     });

//     socket.on("user-left", () => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = null;
//       }
//       setInCall(false);
//       setLayoutMode("solo"); // back to solo if peer leaves
//     });

//     // auto-join once
//     joinRoom("global-room");

//     return () => {
//       socket.off("offer");
//       socket.off("answer");
//       socket.off("ice-candidate");
//       socket.off("user-joined");
//       socket.off("user-left");
//     };
//   }, []);

//   // ----------------- PEER CONNECTION -----------------
//   const createPeerConnection = () => {
//     if (pcRef.current) return pcRef.current;

//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", { room: "global-room", candidate: event.candidate });
//       }
//     };

//     pc.ontrack = (event) => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };

//     pcRef.current = pc;
//     return pc;
//   };

//   // ----------------- JOIN -----------------
//   const joinRoom = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: currentFacingMode.current },
//         audio: true,
//       });

//       localStreamRef.current = stream;
//       localVideoRef.current.srcObject = stream;
//       localVideoRef.current.muted = true;

//       const pc = createPeerConnection();
//       stream.getTracks().forEach((t) => pc.addTrack(t, stream));

//       socket.emit("join", "global-room");
//       setJoined(true);
//       setLayoutMode("solo"); // start in solo mode
//     } catch (e) {
//       console.error("getUserMedia error:", e);
//     }
//   };

//   // ----------------- CALL -----------------
//   const startCall = async () => {
//     try {
//       if (!pcRef.current) createPeerConnection();
//       const offer = await pcRef.current.createOffer();
//       await pcRef.current.setLocalDescription(offer);
//       socket.emit("offer", { room: "global-room", offer });
//     } catch (e) {
//       console.error("startCall error:", e);
//     }
//   };

//   const endCall = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//       localStreamRef.current = null;
//     }

//     if (pcRef.current) {
//       try {
//         pcRef.current.close();
//       } catch {}
//       pcRef.current = null;
//     }

//     if (localVideoRef.current) localVideoRef.current.srcObject = null;
//     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//     setJoined(false);
//     setInCall(false);
//     setLayoutMode("solo");

//     socket.emit("leave", "global-room");
//   };

//   // ----------------- TOGGLES -----------------
//   const toggleMute = () => {
//     if (!localStreamRef.current) return;
//     localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
//     setMuted((m) => !m);
//   };

//   const toggleVideo = () => {
//     if (!localStreamRef.current) return;
//     localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
//     setVideoOff((v) => !v);
//   };

//   const switchCamera = async () => {
//     try {
//       currentFacingMode.current = currentFacingMode.current === "user" ? "environment" : "user";
//       const newStream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: currentFacingMode.current },
//         audio: true,
//       });

//       const newVideoTrack = newStream.getVideoTracks()[0];
//       const pc = createPeerConnection();
//       const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
//       if (sender) await sender.replaceTrack(newVideoTrack);

//       if (localStreamRef.current) {
//         localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
//       }
//       localStreamRef.current = newStream;
//       localVideoRef.current.srcObject = newStream;
//       localVideoRef.current.muted = true;
//     } catch (e) {
//       console.error("switchCamera error:", e);
//     }
//   };

//   // ----------------- UI -----------------
//   return (
//     <div style={{ background: "#0b1020", height: "100vh", display: "flex", flexDirection: "column" }}>
//       <style>{`
//         .video-area { flex:1; display:flex; align-items:center; justify-content:center; position:relative; }
//         .video-box { position:relative; width:100%; height:100%; background:black; overflow:hidden; }
//         video { width:100%; height:100%; object-fit:cover; background:black; }
//         .split-container { display:flex; width:100%; height:100%; }
//         .split-container video { flex:1; object-fit:cover; cursor:pointer; }
//         .full-video { width:100%; height:100%; object-fit:cover; cursor:pointer; }
//         #local-pip { position:absolute; width:180px; height:120px; right:16px; bottom:16px; border-radius:8px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.6); }
//         #local-pip video { width:100%; height:100%; object-fit:cover; }
//         .controls { position:fixed; left:50%; transform:translateX(-50%); bottom:18px; display:flex; gap:12px; }
//         .control-btn { width:58px; height:58px; border-radius:50%; background:#111827; display:flex; align-items:center; justify-content:center; color:white; font-size:22px; cursor:pointer; box-shadow:0 6px 18px rgba(0,0,0,0.5); }
//         .control-btn.red { background:#ef4444; }
//         .control-btn.warn { background:#f59e0b; }
//       `}</style>

//       <div className="video-area">
//         {/* SOLO MODE */}
//         {layoutMode === "solo" && (
//           <video ref={localVideoRef} autoPlay muted playsInline className="full-video" />
//         )}

//         {/* SPLIT MODE */}
//         {layoutMode === "split" && (
//           <div className="split-container">
//             <video
//               ref={localVideoRef}
//               autoPlay
//               muted
//               playsInline
//               onClick={() => { setLayoutMode("pip"); setFullscreenSelf(false); }}
//             />
//             <video
//               ref={remoteVideoRef}
//               autoPlay
//               playsInline
//               onClick={() => { setLayoutMode("pip"); setFullscreenSelf(true); }}
//             />
//           </div>
//         )}

//         {/* PIP MODE */}
//         {layoutMode === "pip" && (
//           <div className="video-box">
//             <video
//               ref={fullscreenSelf ? localVideoRef : remoteVideoRef}
//               autoPlay
//               playsInline
//               muted={fullscreenSelf}
//               className="full-video"
//               onClick={() => setLayoutMode("split")}
//             />
//             <div id="local-pip">
//               <video
//                 ref={fullscreenSelf ? remoteVideoRef : localVideoRef}
//                 autoPlay
//                 playsInline
//                 muted={!fullscreenSelf}
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="controls">
//         <div title="Mute" className={`control-btn ${muted ? "red" : ""}`} onClick={toggleMute}>
//           {muted ? "🔈" : "🎤"}
//         </div>
//         <div title="Video" className={`control-btn ${videoOff ? "red" : ""}`} onClick={toggleVideo}>
//           {videoOff ? "📵" : "📷"}
//         </div>
//         <div title="Switch Camera" className="control-btn" onClick={switchCamera}>🔁</div>
//         <div title="Hang up" className="control-btn red" onClick={endCall}>📞</div>
//       </div>
//     </div>
//   );
// }

// client/src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

/** CHANGE THIS to your deployed signaling server (render/ngrok) */
const SIGNALING_SERVER = "https://ai-ii3n.onrender.com"; // <- replace if needed

const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

export default function App() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);

  const [joined, setJoined] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [focus, setFocus] = useState(null); // "local" | "remote" | null
  const [peerCount, setPeerCount] = useState(1); // show participants count (1 = you)

  // recording helpers
  const recorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // ICE servers example - keep Google STUN (works well)
  const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    socket.on("offer", async ({ sdp, from }) => {
      console.log("⤴️ Received offer from", from);
      if (!pcRef.current) createPeerConnection();
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit("answer", { room: "global-room", sdp: pcRef.current.localDescription });
        setInCall(true);
      } catch (e) {
        console.error("Error handling offer:", e);
      }
    });

    socket.on("answer", async ({ sdp, from }) => {
      console.log("⤵️ Received answer from", from);
      try {
        if (pcRef.current && sdp) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
          setInCall(true);
        }
      } catch (e) {
        console.error("Error applying answer:", e);
      }
    });

    socket.on("ice-candidate", async ({ candidate, from }) => {
      try {
        if (pcRef.current && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    });

    socket.on("user-joined", (payload) => {
      console.log("user-joined", payload);
      // increment peer count
      setPeerCount((p) => Math.min(2, p + 1));
      // if we already have local tracks and a pc, start the call (we become offerer)
      if (localStreamRef.current && !inCall) {
        startCall();
      }
    });

    socket.on("user-left", (payload) => {
      console.log("user-left", payload);
      setPeerCount((p) => Math.max(1, p - 1));
      // cleanup remote video
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      setInCall(false);
      setFocus(null);
    });

    // auto-join global-room so friends using same public link will end up in same room
    // Don't auto-join on mobile cross-origin restrictions? We call joinRoom on user click
    // But to make it simpler we auto-join once so UI works quickly:
    // (if you prefer not to auto-join, comment out next line and call joinRoom() via a button)
    // joinRoom();

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [inCall]);

  function createPeerConnection() {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection(rtcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { room: "global-room", candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      // attach remote stream
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setInCall(false);
      }
    };

    pcRef.current = pc;
    return pc;
  }

  async function joinRoom() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      const pc = createPeerConnection();
      // add senders
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      socket.emit("join", "global-room");
      setJoined(true);
      setPeerCount(1);
      setFocus("local"); // you see yourself full by default
      // If someone else was already in the room, server will have emitted user-joined and we'll get called
    } catch (e) {
      console.error("getUserMedia failed:", e);
      alert("Please allow camera and microphone.");
    }
  }

  async function startCall() {
    try {
      if (!pcRef.current) createPeerConnection();
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socket.emit("offer", { room: "global-room", sdp: pcRef.current.localDescription });
      setInCall(true);
    } catch (e) {
      console.error("startCall error:", e);
    }
  }

  function endCall() {
    // stop recording if active
    if (recording) stopRecording();
    // stop screen share if active
    if (screenSharing) stopScreenShare();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setJoined(false);
    setInCall(false);
    setFocus(null);
    setPeerCount(1);
    socket.emit("leave", "global-room");
  }

  function toggleMute() {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted((m) => !m);
  }

  function toggleVideo() {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setVideoOff((v) => !v);
  }

  async function switchCamera() {
    try {
      // find current facingMode from local video track settings if available
      const currentTrack = localStreamRef.current?.getVideoTracks()[0];
      const currentConstraints = currentTrack?.getSettings?.() || {};
      const currentFacingMode = currentConstraints.facingMode === "environment" ? "environment" : "user";
      const newFacing = currentFacingMode === "user" ? "environment" : "user";

      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newFacing }, audio: true });
      const newVideoTrack = newStream.getVideoTracks()[0];

      const pc = createPeerConnection();
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
      if (sender) await sender.replaceTrack(newVideoTrack);

      // stop old cam track, keep audio
      localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
      // add new stream tracks but keep old audio track so we don't break microphone
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      const updated = new MediaStream([newVideoTrack, audioTrack]);
      localStreamRef.current = updated;
      if (localVideoRef.current) localVideoRef.current.srcObject = updated;
      localVideoRef.current.muted = true;
    } catch (e) {
      console.error("switchCamera error", e);
    }
  }

  // screen share
  async function startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      screenTrackRef.current = screenTrack;

      const pc = createPeerConnection();
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
      if (sender) await sender.replaceTrack(screenTrack);

      // show screen locally
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      setScreenSharing(true);

      screenTrack.onended = () => stopScreenShare();
    } catch (e) {
      console.error("startScreenShare error", e);
    }
  }

  async function stopScreenShare() {
    try {
      const pc = createPeerConnection();
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
      if (localStreamRef.current) {
        const camTrack = localStreamRef.current.getVideoTracks()[0];
        if (sender && camTrack) await sender.replaceTrack(camTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      }
      if (screenTrackRef.current) {
        try { screenTrackRef.current.stop(); } catch {}
        screenTrackRef.current = null;
      }
      setScreenSharing(false);
    } catch (e) {
      console.error("stopScreenShare error", e);
    }
  }

  function toggleScreenShare() {
    if (!screenSharing) startScreenShare();
    else stopScreenShare();
  }

  // Recording: mix remote + local into canvas + audio context
  function startRecording() {
    if (!localStreamRef.current || !remoteVideoRef.current?.srcObject) {
      alert("Both local and remote must be present to record.");
      return;
    }

    const remote = remoteVideoRef.current;
    const w = remote.videoWidth || 1280;
    const h = remote.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      try { ctx.drawImage(remote, 0, 0, w, h); } catch {}
      const local = localVideoRef.current;
      const pipW = Math.floor(w / 4);
      const pipH = Math.floor((pipW * (local.videoHeight || 240)) / (local.videoWidth || 320));
      const pipX = w - pipW - 12;
      const pipY = h - pipH - 12;
      try { ctx.drawImage(local, pipX, pipY, pipW, pipH); } catch {}
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    const canvasStream = canvas.captureStream(30);
    const audioContext = new AudioContext();
    const dest = audioContext.createMediaStreamDestination();

    if (localStreamRef.current) {
      try {
        const srcLocal = audioContext.createMediaStreamSource(localStreamRef.current);
        srcLocal.connect(dest);
      } catch (e) { console.warn(e); }
    }

    const remoteStream = remoteVideoRef.current.srcObject;
    if (remoteStream) {
      try {
        const srcRemote = audioContext.createMediaStreamSource(remoteStream);
        srcRemote.connect(dest);
      } catch (e) { console.warn(e); }
    }

    const mixed = new MediaStream();
    canvasStream.getVideoTracks().forEach((t) => mixed.addTrack(t));
    dest.stream.getAudioTracks().forEach((t) => mixed.addTrack(t));

    const rec = new MediaRecorder(mixed, { mimeType: "video/webm;codecs=vp9" });
    recordedChunksRef.current = [];
    rec.ondataavailable = (ev) => { if (ev.data.size) recordedChunksRef.current.push(ev.data); };
    rec.onstop = () => {
      cancelAnimationFrame(rafRef.current);
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `recording_${Date.now()}.webm`; a.click();
      try { audioContext.close(); } catch (e) {}
      canvasRef.current = null;
    };
    recorderRef.current = rec;
    rec.start(1000);
    setRecording(true);
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    setRecording(false);
  }

  // UI - click to focus remote/local
  function handleVideoClick(which) {
    // if both connected -> toggle focus
    // which = "local" or "remote"
    if (!inCall && which === "remote") return; // remote not yet present
    setFocus((prev) => (prev === which ? null : which));
  }

  // styles - responsive behaviors
  const containerStyle = {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg,#0b1020 0%, #1b1f2a 100%)",
    color: "white",
    overflow: "hidden",
  };

  // determine layout classes
  const showEqualSplit = inCall && peerCount >= 2 && !focus;
  const remoteIsFullscreen = focus === "remote" || (!focus && inCall && peerCount >= 2 && false);

  return (
    <div style={containerStyle}>
      <div style={{ padding: 12, display: "flex", gap: 12, alignItems: "center" }}>
        {!joined ? (
          <button className="btn" onClick={joinRoom} style={btnStyle}>Join (camera)</button>
        ) : (
          <>
            <button className="btn" onClick={startCall} style={btnStyle}>Start Call</button>
            <button className="btn" onClick={endCall} style={{ ...btnStyle, background: "#b91c1c" }}>End Call</button>
            <div style={{ marginLeft: "auto", opacity: 0.85, paddingRight: 12 }}>
              Peers: {peerCount}
            </div>
          </>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        {/* when only you are present => local video full */}
        {!inCall || peerCount === 1 ? (
          <div style={singleBoxStyle}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              onClick={() => handleVideoClick("local")}
              style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover", cursor: "pointer" }}
            />
            <div style={labelStyle}>You</div>
          </div>
        ) : (
          // split screen or focus modes
          <div style={{ display: "flex", width: "90%", height: "80%", gap: 12 }}>
            <div style={focus === "local" ? bigBoxStyle : equalBoxStyle}>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                onClick={() => handleVideoClick("local")}
                style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover", cursor: "pointer" }}
              />
              <div style={labelStyle}>You</div>
            </div>

            <div style={focus === "remote" ? bigBoxStyle : equalBoxStyle}>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                onClick={() => handleVideoClick("remote")}
                style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover", cursor: "pointer", background: "#000" }}
              />
              <div style={labelStyle}>Peer</div>
            </div>
          </div>
        )}
      </div>

      {/* floating controls */}
      <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 12 }}>
        <ActionButton title={muted ? "Unmute" : "Mute"} onClick={toggleMute} active={muted}>{muted ? "🔈" : "🎤"}</ActionButton>
        <ActionButton title={videoOff ? "Turn video on" : "Turn video off"} onClick={toggleVideo} active={videoOff}>{videoOff ? "📵" : "📷"}</ActionButton>
        <ActionButton title="Switch camera" onClick={switchCamera}>🔁</ActionButton>
        <ActionButton title={screenSharing ? "Stop share" : "Share screen"} onClick={toggleScreenShare} active={screenSharing}>🖥️</ActionButton>
        <ActionButton title={recording ? "Stop recording" : "Start recording"} onClick={() => (recording ? stopRecording() : startRecording())} active={recording}>⏺</ActionButton>
        <ActionButton title="Hang up" onClick={endCall} active={false} danger>📞</ActionButton>
      </div>
    </div>
  );
}

// small helper components / styles
const btnStyle = {
  padding: "8px 12px",
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

const singleBoxStyle = {
  width: "80%",
  height: "80%",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
  position: "relative",
  background: "#000"
};

const equalBoxStyle = {
  flex: 1,
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
  position: "relative",
  background: "#000"
};

const bigBoxStyle = {
  flex: 2,
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
  position: "relative",
  background: "#000"
};

const labelStyle = {
  position: "absolute",
  left: 12,
  bottom: 12,
  background: "rgba(0,0,0,0.5)",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 13,
  color: "#fff"
};

function ActionButton({ children, onClick, title, active, danger }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 58,
        height: 58,
        borderRadius: "50%",
        background: danger ? "#ef4444" : active ? "#0ea5a4" : "#0f1724",
        border: "none",
        color: "white",
        fontSize: 22,
        cursor: "pointer",
        boxShadow: "0 8px 20px rgba(2,6,23,0.6)"
      }}
    >
      {children}
    </button>
  );
}

