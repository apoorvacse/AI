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
// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SIGNALING_SERVER = "https://ai-ii3n.onrender.com";
// const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const currentFacingMode = useRef("user");

//   const [joined, setJoined] = useState(false);
//   const [inCall, setInCall] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);

//   // ----------------- SOCKET -----------------
//   useEffect(() => {
//     // Try joining immediately
//     joinRoom();

//     socket.on("offer", async ({ sdp }) => {
//       if (!pcRef.current) createPeerConnection();
//       try {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         const answer = await pcRef.current.createAnswer();
//         await pcRef.current.setLocalDescription(answer);
//         socket.emit("answer", { room: "global-room", sdp: pcRef.current.localDescription });
//         setInCall(true);
//       } catch (e) {
//         console.error("Error handling offer:", e);
//       }
//     });

//     socket.on("answer", async ({ sdp }) => {
//       if (pcRef.current && sdp) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         setInCall(true);
//       }
//     });

//     socket.on("ice-candidate", async (candidate) => {
//       try {
//         if (pcRef.current && candidate) {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (e) {
//         console.error("Error adding candidate:", e);
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

//     socket.on("connect_error", (err) => {
//       console.error("❌ Socket error:", err.message);
//     });

//     return () => {
//       socket.off();
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
//     } catch (e) {
//       console.error("getUserMedia error:", e);
//       alert("⚠️ Please allow camera & microphone access.");
//     }
//   };

//   // ----------------- CALL -----------------
//   const startCall = async () => {
//     if (!pcRef.current) createPeerConnection();
//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);
//     socket.emit("offer", { room: "global-room", sdp: offer });
//   };

//   const endCall = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//     }
//     if (pcRef.current) pcRef.current.close();
//     localVideoRef.current.srcObject = null;
//     remoteVideoRef.current.srcObject = null;

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
//     currentFacingMode.current = currentFacingMode.current === "user" ? "environment" : "user";
//     joinRoom(); // re-join with new camera
//   };

//   // ----------------- UI -----------------
//   return (
//     <div style={{ background: "#0b1020", height: "100vh", display: "flex", flexDirection: "column" }}>
//       <style>{`
//         .video-area { flex:1; display:flex; align-items:center; justify-content:center; gap:10px; }
//         .video-box { flex:1; background:black; border-radius:12px; overflow:hidden; display:flex; }
//         video { width:100%; height:100%; object-fit:cover; }
//         .controls { position:fixed; left:50%; transform:translateX(-50%); bottom:22px;
//           display:flex; gap:18px; justify-content:center; align-items:center; }
//         .control-btn { width:64px; height:64px; border-radius:50%; background:#1f2937;
//           display:flex; align-items:center; justify-content:center; color:white; font-size:26px; cursor:pointer;
//           box-shadow:0 6px 18px rgba(0,0,0,0.5); transition:transform 0.2s ease; }
//         .control-btn:hover { transform:scale(1.1); }
//         .control-btn.end { background:#f87171; } /* soft red */
//       `}</style>

//       .video-container {
//   display: flex;
//   width: 100%;
//   height: 100vh; /* Full viewport */
// }

// .video-container video {
//   flex: 1; /* Equal share */
//   object-fit: cover; /* Prevent stretching */
// }


//       <div className="video-area">
//         <div className="video-box">
//           <video ref={localVideoRef} autoPlay playsInline muted />
//         </div>
//         {inCall && (
//           <div className="video-box">
//             <video ref={remoteVideoRef} autoPlay playsInline />
//           </div>
//         )}
//       </div>

//       <div className="controls">
//         <div title="Mute" className={`control-btn ${muted ? "end" : ""}`} onClick={toggleMute}>
//           {muted ? "🔈" : "🎤"}
//         </div>
//         <div title="Video" className={`control-btn ${videoOff ? "end" : ""}`} onClick={toggleVideo}>
//           {videoOff ? "📵" : "📷"}
//         </div>
//         <div title="Switch Camera" className="control-btn" onClick={switchCamera}>🔁</div>
//         <div title="End Call" className="control-btn end" onClick={endCall}>📞</div>
//       </div>
//     </div>
//   );
// }

       // this code give proper layout 
// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SIGNALING_SERVER = "https://ai-ii3n.onrender.com";
// const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const currentFacingMode = useRef("user");

//   const [joined, setJoined] = useState(false);
//   const [inCall, setInCall] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);

//   // ----------------- SOCKET -----------------
//   useEffect(() => {
//     joinRoom();

//     socket.on("offer", async ({ sdp }) => {
//       if (!pcRef.current) createPeerConnection();
//       try {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         const answer = await pcRef.current.createAnswer();
//         await pcRef.current.setLocalDescription(answer);
//         socket.emit("answer", { room: "global-room", sdp: pcRef.current.localDescription });
//         setInCall(true);
//       } catch (e) {
//         console.error("❌ Error handling offer:", e);
//       }
//     });

//     socket.on("answer", async ({ sdp }) => {
//       if (pcRef.current && sdp) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         setInCall(true);
//       }
//     });

//     socket.on("ice-candidate", async (candidate) => {
//       try {
//         if (pcRef.current && candidate) {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (e) {
//         console.error("❌ Error adding candidate:", e);
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

//     socket.on("connect_error", (err) => {
//       console.error("❌ Socket error:", err.message);
//     });

//     return () => {
//       socket.off();
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
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//         localVideoRef.current.muted = true;
//       }

//       const pc = createPeerConnection();
//       stream.getTracks().forEach((t) => pc.addTrack(t, stream));

//       socket.emit("join", "global-room");
//       setJoined(true);
//     } catch (e) {
//       console.error("❌ getUserMedia error:", e.name, e.message);
//       alert("⚠️ Please allow camera & microphone access.");
//     }
//   };

//   // ----------------- CALL -----------------
//   const startCall = async () => {
//     if (!pcRef.current) createPeerConnection();
//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);
//     socket.emit("offer", { room: "global-room", sdp: offer });
//   };

//   const endCall = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//     }
//     if (pcRef.current) pcRef.current.close();
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
//     currentFacingMode.current = currentFacingMode.current === "user" ? "environment" : "user";

//     // stop old tracks before switching
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//     }

//     await joinRoom();
//   };

//   // ----------------- UI -----------------
//   return (
//     <div style={{ background: "#0b1020", height: "100vh", display: "flex", flexDirection: "column" }}>
//       <style>{`
//         .video-area { 
//           flex: 1; 
//           display: flex; 
//           width: 100%; 
//           height: 100%; 
//         }
//         .video-box { 
//           flex: 1; 
//           background: black; 
//           border-radius: 0; 
//           overflow: hidden; 
//           display: flex; 
//         }
//         video { 
//           width: 100%; 
//           height: 100%; 
//           object-fit: cover; 
//         }
//         @media (max-width: 768px) {
//           .video-area { flex-direction: column; }
//         }
//         .controls { 
//           position: fixed; 
//           left: 50%; 
//           transform: translateX(-50%); 
//           bottom: 22px;
//           display: flex; 
//           gap: 18px; 
//           justify-content: center; 
//           align-items: center; 
//         }
//         .control-btn { 
//           width: 64px; 
//           height: 64px; 
//           border-radius: 50%; 
//           background: #1f2937;
//           display: flex; 
//           align-items: center; 
//           justify-content: center; 
//           color: white; 
//           font-size: 26px; 
//           cursor: pointer;
//           box-shadow: 0 6px 18px rgba(0,0,0,0.5); 
//           transition: transform 0.2s ease; 
//         }
//         .control-btn:hover { transform: scale(1.1); }
//         .control-btn.end { background: #f87171; } 
//       `}</style>

//       <div className="video-area">
//         <div className="video-box">
//           <video ref={localVideoRef} autoPlay playsInline muted />
//         </div>
//         {inCall && (
//           <div className="video-box">
//             <video ref={remoteVideoRef} autoPlay playsInline />
//           </div>
//         )}
//       </div>

//       <div className="controls">
//         <div title="Mute" className={`control-btn ${muted ? "end" : ""}`} onClick={toggleMute}>
//           {muted ? "🔈" : "🎤"}
//         </div>
//         <div title="Video" className={`control-btn ${videoOff ? "end" : ""}`} onClick={toggleVideo}>
//           {videoOff ? "📵" : "📷"}
//         </div>
//         <div title="Switch Camera" className="control-btn" onClick={switchCamera}>🔁</div>
//         <div title="End Call" className="control-btn end" onClick={endCall}>📞</div>
//       </div>
//     </div>
//   );
// }

// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SIGNALING_SERVER = "https://ai-ii3n.onrender.com";
// const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const currentFacingMode = useRef("user");

//   const [joined, setJoined] = useState(false);
//   const [inCall, setInCall] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);

//   // ----------------- SOCKET -----------------
//   useEffect(() => {
//     joinRoom();

//     socket.on("offer", async ({ sdp }) => {
//       if (!pcRef.current) createPeerConnection();
//       try {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         const answer = await pcRef.current.createAnswer();
//         await pcRef.current.setLocalDescription(answer);
//         socket.emit("answer", { room: "global-room", sdp: pcRef.current.localDescription });
//         setInCall(true);
//       } catch (e) {
//         console.error("Error handling offer:", e);
//       }
//     });

//     socket.on("answer", async ({ sdp }) => {
//       if (pcRef.current && sdp) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         setInCall(true);
//       }
//     });

//     socket.on("ice-candidate", async (candidate) => {
//       try {
//         if (pcRef.current && candidate) {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (e) {
//         console.error("Error adding candidate:", e);
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

//     socket.on("connect_error", (err) => {
//       console.error("❌ Socket error:", err.message);
//     });

//     return () => {
//       socket.off();
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
//     } catch (e) {
//       console.error("getUserMedia error:", e);
//       alert("⚠️ Please allow camera & microphone access.");
//     }
//   };

//   // ----------------- CALL -----------------
//   const startCall = async () => {
//     if (!pcRef.current) createPeerConnection();
//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);
//     socket.emit("offer", { room: "global-room", sdp: offer });
//     setInCall(true);
//   };

//   const endCall = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//     }
//     if (pcRef.current) pcRef.current.close();
//     localVideoRef.current.srcObject = null;
//     remoteVideoRef.current.srcObject = null;

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
//     currentFacingMode.current = currentFacingMode.current === "user" ? "environment" : "user";
//     joinRoom();
//   };

//   // ----------------- UI -----------------
//   return (
//     <div style={{ background: "#0b1020", height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
//       <style>{`
//         .video-area {
//           flex: 1;
//           display: flex;
//           width: 100%;
//           height: 100%;
//         }
//         .video-box {
//           flex: 1;
//           background: black;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }
//         .video-box.full {
//           flex: 1 1 100%;
//         }
//         video {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }
//         .controls {
//           position: fixed;
//           left: 50%;
//           transform: translateX(-50%);
//           bottom: 22px;
//           display: flex;
//           gap: 18px;
//           justify-content: center;
//           align-items: center;
//         }
//         .control-btn {
//           width: 64px;
//           height: 64px;
//           border-radius: 50%;
//           background: #1f2937;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 26px;
//           cursor: pointer;
//           box-shadow: 0 6px 18px rgba(0,0,0,0.5);
//           transition: transform 0.2s ease;
//         }
//         .control-btn:hover { transform: scale(1.1); }
//         .control-btn.end { background: #f87171; }
//       `}</style>

//       <div className="video-area">
//         {!inCall ? (
//           <div className="video-box full">
//             <video ref={localVideoRef} autoPlay playsInline muted />
//           </div>
//         ) : (
//           <>
//             <div className="video-box">
//               <video ref={localVideoRef} autoPlay playsInline muted />
//             </div>
//             <div className="video-box">
//               <video ref={remoteVideoRef} autoPlay playsInline />
//             </div>
//           </>
//         )}
//       </div>

//       <div className="controls">
//         <div title="Mute" className={`control-btn ${muted ? "end" : ""}`} onClick={toggleMute}>
//           {muted ? "🔈" : "🎤"}
//         </div>
//         <div title="Video" className={`control-btn ${videoOff ? "end" : ""}`} onClick={toggleVideo}>
//           {videoOff ? "📵" : "📷"}
//         </div>
//         <div title="Switch Camera" className="control-btn" onClick={switchCamera}>🔁</div>
//         <div title="End Call" className="control-btn end" onClick={endCall}>📞</div>
//       </div>
//     </div>
//   );
// }

// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SIGNALING_SERVER = "https://ai-ii3n.onrender.com";
// const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const currentFacingMode = useRef("user");

//   const [inCall, setInCall] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);
//   const [remoteActive, setRemoteActive] = useState(false);

//   // ----------------- SOCKET -----------------
//   useEffect(() => {
//     joinRoom();

//     socket.on("users-in-room", (users) => {
//       if (users.length > 0) {
//         createPeerConnection();
//       }
//     });

//     socket.on("user-joined", () => {
//       if (pcRef.current && localStreamRef.current && !inCall) {
//         startCall();
//       }
//     });

//     socket.on("offer", async ({ sdp }) => {
//       if (!pcRef.current) createPeerConnection();
//       try {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         const answer = await pcRef.current.createAnswer();
//         await pcRef.current.setLocalDescription(answer);
//         socket.emit("answer", { room: "global-room", sdp: pcRef.current.localDescription });
//         setInCall(true);
//       } catch (e) {
//         console.error("❌ Error handling offer:", e);
//       }
//     });

//     socket.on("answer", async ({ sdp }) => {
//       if (pcRef.current && sdp) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         setInCall(true);
//       }
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       try {
//         if (pcRef.current && candidate) {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (e) {
//         console.error("❌ Error adding candidate:", e);
//       }
//     });

//     socket.on("user-left", () => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = null;
//         setRemoteActive(false);
//       }
//       setInCall(false);
//     });

//     return () => {
//       socket.off();
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
//         setRemoteActive(true);
//       }
//     };

//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => {
//         pc.addTrack(track, localStreamRef.current);
//       });
//     }

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

//       createPeerConnection();

//       socket.emit("join", "global-room");
//     } catch (e) {
//       alert("⚠️ Please allow camera & microphone access.");
//     }
//   };

//   // ----------------- CALL -----------------
//   const startCall = async () => {
//     if (!pcRef.current) createPeerConnection();
//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);
//     socket.emit("offer", { room: "global-room", sdp: offer });
//     setInCall(true);
//   };

//   const endCall = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//     }
//     if (pcRef.current) pcRef.current.close();
//     localVideoRef.current.srcObject = null;
//     remoteVideoRef.current.srcObject = null;

//     setInCall(false);
//     setRemoteActive(false);
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
//     currentFacingMode.current = currentFacingMode.current === "user" ? "environment" : "user";
//     joinRoom();
//   };

//   // ----------------- UI -----------------
//   return (
//     <div style={{ background: "#0b1020", height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
//       <style>{`
//         .video-area {
//           flex: 1;
//           display: flex;
//           width: 100%;
//           height: 100%;
//           position: relative;
//         }
//         video {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         /* 💻 Desktop (side by side) */
//         @media (min-width: 769px) {
//           .desktop-view {
//             display: flex;
//             flex: 1;
//           }
//           .desktop-view video {
//             width: 50%;
//             height: 100%;
//           }
//         }

//         /* 📱 Mobile (WhatsApp style) */
//         @media (max-width: 768px) {
//           .remote-full {
//             width: 100%;
//             height: 100%;
//           }
//           .local-small {
//             position: absolute;
//             bottom: 12px;
//             right: 12px;
//             width: 120px;
//             height: 160px;
//             border-radius: 12px;
//             border: 2px solid white;
//             object-fit: cover;
//             background: black;
//           }
//         }

//         .controls {
//           position: fixed;
//           left: 50%;
//           transform: translateX(-50%);
//           bottom: 22px;
//           display: flex;
//           gap: 18px;
//           justify-content: center;
//           align-items: center;
//         }
//         .control-btn {
//           width: 64px;
//           height: 64px;
//           border-radius: 50%;
//           background: #1f2937;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 26px;
//           cursor: pointer;
//           box-shadow: 0 6px 18px rgba(0,0,0,0.5);
//           transition: transform 0.2s ease;
//         }
//         .control-btn:hover { transform: scale(1.1); }
//         .control-btn.end { background: #f87171; }
//       `}</style>

//       <div className="video-area">
//         {/* 💻 Desktop: side by side */}
//         <div className="desktop-view">
//           {remoteActive && <video ref={remoteVideoRef} autoPlay playsInline />}
//           <video ref={localVideoRef} autoPlay playsInline muted />
//         </div>

//         {/* 📱 Mobile: WhatsApp style */}
//         {remoteActive ? (
//           <>
//             <video ref={remoteVideoRef} className="remote-full" autoPlay playsInline />
//             <video ref={localVideoRef} className="local-small" autoPlay playsInline muted />
//           </>
//         ) : (
//           <video ref={localVideoRef} className="remote-full" autoPlay playsInline muted />
//         )}
//       </div>

//       {/* Controls */}
//       <div className="controls">
//         <div title="Mute" className={`control-btn ${muted ? "end" : ""}`} onClick={toggleMute}>
//           {muted ? "🔈" : "🎤"}
//         </div>
//         <div title="Video" className={`control-btn ${videoOff ? "end" : ""}`} onClick={toggleVideo}>
//           {videoOff ? "📵" : "📷"}
//         </div>
//         <div title="Switch Camera" className="control-btn" onClick={switchCamera}>🔁</div>
//         <div title="End Call" className="control-btn end" onClick={endCall}>📞</div>
//       </div>
//     </div>
//   );
// }



// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SIGNALING_SERVER = "https://ai-ii3n.onrender.com";
// const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const currentFacingMode = useRef("user");

//   const [inCall, setInCall] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);
//   const [remoteActive, setRemoteActive] = useState(false);

//   // ----------------- SOCKET -----------------
//   useEffect(() => {
//     joinRoom();

//     socket.on("users-in-room", (users) => {
//       console.log("👥 Users already in room:", users);
//       if (users.length > 0) {
//         createPeerConnection();
//       }
//     });

//     socket.on("user-joined", () => {
//       console.log("📢 Someone joined → I start call");
//       if (pcRef.current && localStreamRef.current && !inCall) {
//         startCall();
//       }
//     });

//     socket.on("offer", async ({ sdp }) => {
//       console.log("📩 Got offer");
//       if (!pcRef.current) createPeerConnection();
//       try {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         const answer = await pcRef.current.createAnswer();
//         await pcRef.current.setLocalDescription(answer);
//         socket.emit("answer", { room: "global-room", sdp: pcRef.current.localDescription });
//         setInCall(true);
//       } catch (e) {
//         console.error("❌ Error handling offer:", e);
//       }
//     });

//     socket.on("answer", async ({ sdp }) => {
//       console.log("📩 Got answer");
//       if (pcRef.current && sdp) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         setInCall(true);
//       }
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       console.log("📩 Got ICE candidate");
//       try {
//         if (pcRef.current && candidate) {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (e) {
//         console.error("❌ Error adding candidate:", e);
//       }
//     });

//     socket.on("user-left", () => {
//       console.log("👋 User left");
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = null;
//       }
//       setRemoteActive(false);
//       setInCall(false);
//     });

//     return () => {
//       socket.off();
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
//       console.log("🎥 Remote track received");
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//         setRemoteActive(true);
//       }
//     };

//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => {
//         pc.addTrack(track, localStreamRef.current);
//       });
//     }

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

//       createPeerConnection();
//       socket.emit("join", "global-room");
//     } catch (e) {
//       console.error("❌ getUserMedia error:", e);
//       alert("⚠️ Please allow camera & microphone access.");
//     }
//   };

//   // ----------------- CALL -----------------
//   const startCall = async () => {
//     if (!pcRef.current) createPeerConnection();
//     console.log("📤 Sending offer");
//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);
//     socket.emit("offer", { room: "global-room", sdp: offer });
//     setInCall(true);
//   };

//   const endCall = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//     }
//     if (pcRef.current) pcRef.current.close();
//     localVideoRef.current.srcObject = null;
//     remoteVideoRef.current.srcObject = null;

//     setInCall(false);
//     setRemoteActive(false);
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
//     currentFacingMode.current = currentFacingMode.current === "user" ? "environment" : "user";
//     joinRoom();
//   };

//   // ----------------- UI -----------------
//   return (
//     <div style={{ background: "#0b1020", height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
//       <style>{`
//         .video-area { flex: 1; width: 100%; height: 100%; }

//         video { object-fit: cover; background: black; }

//         /* Desktop (side by side) */
//         @media (min-width: 769px) {
//           .desktop-view { display: flex; flex: 1; }
//           .desktop-view video { width: 50%; height: 100%; }
//           .mobile-view { display: none; }
//         }

//         /* Mobile (WhatsApp style) */
//         @media (max-width: 768px) {
//           .desktop-view { display: none; }
//           .mobile-view { flex: 1; position: relative; }
//           .remote-full { width: 100%; height: 100%; }
//           .local-small {
//             position: absolute;
//             bottom: 12px;
//             right: 12px;
//             width: 120px;
//             height: 160px;
//             border-radius: 12px;
//             border: 2px solid white;
//             object-fit: cover;
//             background: black;
//           }
//         }

//         .controls {
//           position: fixed;
//           left: 50%;
//           transform: translateX(-50%);
//           bottom: 22px;
//           display: flex;
//           gap: 18px;
//           justify-content: center;
//           align-items: center;
//         }
//         .control-btn {
//           width: 64px;
//           height: 64px;
//           border-radius: 50%;
//           background: #1f2937;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 26px;
//           cursor: pointer;
//           box-shadow: 0 6px 18px rgba(0,0,0,0.5);
//           transition: transform 0.2s ease;
//         }
//         .control-btn:hover { transform: scale(1.1); }
//         .control-btn.end { background: #f87171; }
//       `}</style>

//       <div className="video-area">
//         {/* Desktop layout */}
//         <div className="desktop-view">
//           {remoteActive ? (
//             <>
//               <video ref={remoteVideoRef} autoPlay playsInline />
//               <video ref={localVideoRef} autoPlay playsInline muted />
//             </>
//           ) : (
//             <video ref={localVideoRef} autoPlay playsInline muted />
//           )}
//         </div>

//         {/* Mobile layout */}
//         <div className="mobile-view">
//           {remoteActive ? (
//             <>
//               <video ref={remoteVideoRef} className="remote-full" autoPlay playsInline />
//               <video ref={localVideoRef} className="local-small" autoPlay playsInline muted />
//             </>
//           ) : (
//             <video ref={localVideoRef} className="remote-full" autoPlay playsInline muted />
//           )}
//         </div>
//       </div>

//       <div className="controls">
//         <div title="Mute" className={`control-btn ${muted ? "end" : ""}`} onClick={toggleMute}>
//           {muted ? "🔈" : "🎤"}
//         </div>
//         <div title="Video" className={`control-btn ${videoOff ? "end" : ""}`} onClick={toggleVideo}>
//           {videoOff ? "📵" : "📷"}
//         </div>
//         <div title="Switch Camera" className="control-btn" onClick={switchCamera}>🔁</div>
//         <div title="End Call" className="control-btn end" onClick={endCall}>📞</div>
//       </div>
//     </div>
//   );
// }

// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SIGNALING_SERVER = "https://ai-ii3n.onrender.com";
// const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const currentFacingMode = useRef("user");

//   const [inCall, setInCall] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);

//   // ----------------- SOCKET -----------------
//   useEffect(() => {
//     joinRoom();

//     socket.on("users-in-room", (users) => {
//       console.log("👥 Users already in room:", users);
//       // I’m joining second → just create PC and wait for offer
//       if (users.length > 0) {
//         createPeerConnection();
//       }
//     });

//     socket.on("user-joined", () => {
//       console.log("📢 Someone joined → I start call");
//       if (pcRef.current && localStreamRef.current && !inCall) {
//         startCall();
//       }
//     });

//     socket.on("offer", async ({ sdp }) => {
//       console.log("📩 Got offer");
//       if (!pcRef.current) createPeerConnection();
//       try {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         const answer = await pcRef.current.createAnswer();
//         await pcRef.current.setLocalDescription(answer);
//         socket.emit("answer", { room: "global-room", sdp: pcRef.current.localDescription });
//         setInCall(true);
//       } catch (e) {
//         console.error("❌ Error handling offer:", e);
//       }
//     });

//     socket.on("answer", async ({ sdp }) => {
//       console.log("📩 Got answer");
//       if (pcRef.current && sdp) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         setInCall(true);
//       }
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       console.log("📩 Got ICE candidate");
//       try {
//         if (pcRef.current && candidate) {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (e) {
//         console.error("❌ Error adding candidate:", e);
//       }
//     });

//     socket.on("user-left", () => {
//       console.log("👋 User left");
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = null;
//       }
//       setInCall(false);
//     });

//     return () => {
//       socket.off();
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
//       console.log("🎥 Remote track received");
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };

//     // 🔥 Always add local tracks to new PC
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => {
//         pc.addTrack(track, localStreamRef.current);
//       });
//     }

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

//       createPeerConnection();

//       socket.emit("join", "global-room");
//     } catch (e) {
//       console.error("❌ getUserMedia error:", e);
//       alert("⚠️ Please allow camera & microphone access.");
//     }
//   };

//   // ----------------- CALL -----------------
//   const startCall = async () => {
//     if (!pcRef.current) createPeerConnection();
//     console.log("📤 Sending offer");
//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);
//     socket.emit("offer", { room: "global-room", sdp: offer });
//     setInCall(true);
//   };

//   const endCall = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//     }
//     if (pcRef.current) pcRef.current.close();
//     localVideoRef.current.srcObject = null;
//     remoteVideoRef.current.srcObject = null;

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
//     currentFacingMode.current = currentFacingMode.current === "user" ? "environment" : "user";
//     joinRoom();
//   };

//   // ----------------- UI -----------------
//   return (
//     <div style={{ background: "#0b1020", height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
//       <style>{`
//         .video-area {
//           flex: 1;
//           display: flex;
//           width: 100%;
//           height: 100%;
//         }
//         .video-box {
//           flex: 1;
//           background: black;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }
//         .video-box.full {
//           flex: 1 1 100%;
//         }
//         video {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }
//         .controls {
//           position: fixed;
//           left: 50%;
//           transform: translateX(-50%);
//           bottom: 22px;
//           display: flex;
//           gap: 18px;
//           justify-content: center;
//           align-items: center;
//         }
//         .control-btn {
//           width: 64px;
//           height: 64px;
//           border-radius: 50%;
//           background: #1f2937;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 26px;
//           cursor: pointer;
//           box-shadow: 0 6px 18px rgba(0,0,0,0.5);
//           transition: transform 0.2s ease;
//         }
//         .control-btn:hover { transform: scale(1.1); }
//         .control-btn.end { background: #f87171; }
//       `}</style>

//       <div className="video-area">
//         {!inCall ? (
//           <div className="video-box full">
//             <video ref={localVideoRef} autoPlay playsInline muted />
//           </div>
//         ) : (
//           <>
//             <div className="video-box">
//               <video ref={localVideoRef} autoPlay playsInline muted />
//             </div>
//             <div className="video-box">
//               <video ref={remoteVideoRef} autoPlay playsInline />
//             </div>
//           </>
//         )}
//       </div>

//       <div className="controls">
//         <div title="Mute" className={`control-btn ${muted ? "end" : ""}`} onClick={toggleMute}>
//           {muted ? "🔈" : "🎤"}
//         </div>
//         <div title="Video" className={`control-btn ${videoOff ? "end" : ""}`} onClick={toggleVideo}>
//           {videoOff ? "📵" : "📷"}
//         </div>
//         <div title="Switch Camera" className="control-btn" onClick={switchCamera}>🔁</div>
//         <div title="End Call" className="control-btn end" onClick={endCall}>📞</div>
//       </div>
//     </div>
//   );
// }

        // sushant2

//         import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SIGNALING_SERVER = "https://ai-ii3n.onrender.com";
// const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const currentFacingMode = useRef("user");

//   const [inCall, setInCall] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);

//   // ----------------- SOCKET -----------------
//   useEffect(() => {
//     joinRoom();

//     socket.on("users-in-room", (users) => {
//       console.log("👥 Users already in room:", users);
//       if (users.length > 0) {
//         createPeerConnection();
//       }
//     });

//     socket.on("user-joined", () => {
//       console.log("📢 Someone joined → I start call");
//       if (pcRef.current && localStreamRef.current && !inCall) {
//         startCall();
//       }
//     });

//     socket.on("offer", async ({ sdp }) => {
//       console.log("📩 Got offer");
//       if (!pcRef.current) createPeerConnection();
//       try {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         const answer = await pcRef.current.createAnswer();
//         await pcRef.current.setLocalDescription(answer);
//         socket.emit("answer", { room: "global-room", sdp: pcRef.current.localDescription });
//         setInCall(true);
//       } catch (e) {
//         console.error("❌ Error handling offer:", e);
//       }
//     });

//     socket.on("answer", async ({ sdp }) => {
//       console.log("📩 Got answer");
//       if (pcRef.current && sdp) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         setInCall(true);
//       }
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       console.log("📩 Got ICE candidate");
//       try {
//         if (pcRef.current && candidate) {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (e) {
//         console.error("❌ Error adding candidate:", e);
//       }
//     });

//     socket.on("user-left", () => {
//       console.log("👋 User left");
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = null;
//       }
//       setInCall(false);
//     });

//     return () => {
//       socket.off();
//     };
//   }, []);

//   // ----------------- PEER CONNECTION -----------------
//   const createPeerConnection = () => {
//     if (pcRef.current) {
//       pcRef.current.close();
//     }

//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", { room: "global-room", candidate: event.candidate });
//       }
//     };

//     pc.ontrack = (event) => {
//       console.log("🎥 Remote track received");
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };

//     // ✅ Always add local tracks
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => {
//         pc.addTrack(track, localStreamRef.current);
//       });
//     }

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

//       // ✅ Reset connection each time
//       createPeerConnection();

//       socket.emit("join", "global-room");
//     } catch (e) {
//       console.error("❌ getUserMedia error:", e);
//       alert("⚠️ Please allow camera & microphone access.");
//     }
//   };

//   // ----------------- CALL -----------------
//   const startCall = async () => {
//     if (!pcRef.current) createPeerConnection();
//     console.log("📤 Sending offer");
//     const offer = await pcRef.current.createOffer();
//     await pcRef.current.setLocalDescription(offer);
//     socket.emit("offer", { room: "global-room", sdp: offer });
//     setInCall(true);
//   };

//   const endCall = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//     }
//     if (pcRef.current) pcRef.current.close();
//     localVideoRef.current.srcObject = null;
//     remoteVideoRef.current.srcObject = null;

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
//     currentFacingMode.current = currentFacingMode.current === "user" ? "environment" : "user";
//     joinRoom();
//   };

//   // ----------------- UI -----------------
//   return (
//     <div style={{ background: "#0b1020", height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
//       <style>{`
//         .video-area {
//           flex: 1;
//           display: flex;
//           width: 100%;
//           height: 100%;
//         }
//         .video-box {
//           flex: 1;
//           background: black;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }
//         .video-box.full {
//           flex: 1 1 100%;
//         }
//         video {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }
//         .controls {
//           position: fixed;
//           left: 50%;
//           transform: translateX(-50%);
//           bottom: 22px;
//           display: flex;
//           gap: 18px;
//           justify-content: center;
//           align-items: center;
//         }
//         .control-btn {
//           width: 64px;
//           height: 64px;
//           border-radius: 50%;
//           background: #1f2937;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 26px;
//           cursor: pointer;
//           box-shadow: 0 6px 18px rgba(0,0,0,0.5);
//           transition: transform 0.2s ease;
//         }
//         .control-btn:hover { transform: scale(1.1); }
//         .control-btn.end { background: #f87171; }
//       `}</style>

//       <div className="video-area">
//         {!inCall ? (
//           <div className="video-box full">
//             <video ref={localVideoRef} autoPlay playsInline muted />
//           </div>
//         ) : (
//           <>
//             <div className="video-box">
//               <video ref={localVideoRef} autoPlay playsInline muted />
//             </div>
//             <div className="video-box">
//               <video ref={remoteVideoRef} autoPlay playsInline />
//             </div>
//           </>
//         )}
//       </div>

//       <div className="controls">
//         <div title="Mute" className={`control-btn ${muted ? "end" : ""}`} onClick={toggleMute}>
//           {muted ? "🔈" : "🎤"}
//         </div>
//         <div title="Video" className={`control-btn ${videoOff ? "end" : ""}`} onClick={toggleVideo}>
//           {videoOff ? "📵" : "📷"}
//         </div>
//         <div title="Switch Camera" className="control-btn" onClick={switchCamera}>🔁</div>
//         <div title="End Call" className="control-btn end" onClick={endCall}>📞</div>
//       </div>
//     </div>
//   );
// }

           // sushant 3

// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SIGNALING_SERVER = "https://ai-ii3n.onrender.com";
// const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const currentFacingMode = useRef("user");

//   const [inCall, setInCall] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);

//   // ----------------- SOCKET -----------------
//   useEffect(() => {
//     joinRoom();

//     socket.on("users-in-room", (users) => {
//       console.log("👥 Users already in room:", users);
//       if (users.length > 0) {
//         ensurePeerConnection();
//       }
//     });

//     socket.on("user-joined", () => {
//       console.log("📢 Someone joined → I start call");
//       if (pcRef.current && localStreamRef.current && !inCall) {
//         startCall();
//       }
//     });

//     socket.on("offer", async ({ sdp }) => {
//       console.log("📩 Got offer");
//       ensurePeerConnection();
//       try {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         const answer = await pcRef.current.createAnswer();
//         await pcRef.current.setLocalDescription(answer);
//         socket.emit("answer", { room: "global-room", sdp: pcRef.current.localDescription });
//         setInCall(true);
//       } catch (e) {
//         console.error("❌ Error handling offer:", e);
//       }
//     });

//     socket.on("answer", async ({ sdp }) => {
//       console.log("📩 Got answer");
//       if (pcRef.current && sdp) {
//         await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//         setInCall(true);
//       }
//     });

//     socket.on("ice-candidate", async ({ candidate }) => {
//       console.log("📩 Got ICE candidate");
//       try {
//         if (pcRef.current && candidate) {
//           await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       } catch (e) {
//         console.error("❌ Error adding candidate:", e);
//       }
//     });

//     socket.on("user-left", () => {
//       console.log("👋 User left");
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = null;
//       }
//       setInCall(false);
//     });

//     return () => {
//       socket.off();
//     };
//   }, []);

//   // ----------------- PEER CONNECTION -----------------
//   const ensurePeerConnection = () => {
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
//       console.log("🎥 Remote track received");
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = null; // clear stale
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };

//     // 🔥 Always add local tracks
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => {
//         pc.addTrack(track, localStreamRef.current);
//       });
//     }

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
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//         localVideoRef.current.muted = true;
//       }

//       ensurePeerConnection();

//       socket.emit("join", "global-room");
//     } catch (e) {
//       console.error("❌ getUserMedia error:", e);
//       alert("⚠️ Please allow camera & microphone access.");
//     }
//   };

//   // ----------------- CALL -----------------
//   const startCall = async () => {
//     const pc = ensurePeerConnection();
//     console.log("📤 Sending offer");
//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);
//     socket.emit("offer", { room: "global-room", sdp: pc.localDescription });
//     setInCall(true);
//   };

//   const endCall = () => {
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((t) => t.stop());
//     }
//     if (pcRef.current) pcRef.current.close();

//     localVideoRef.current.srcObject = null;
//     remoteVideoRef.current.srcObject = null;
//     pcRef.current = null;

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
//     currentFacingMode.current = currentFacingMode.current === "user" ? "environment" : "user";
//     joinRoom();
//   };

//   // ----------------- UI -----------------
//   return (
//     <div style={{ background: "#0b1020", height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
//       <style>{`
//         .video-area {
//           flex: 1;
//           display: flex;
//           width: 100%;
//           height: 100%;
//         }
//         .video-box {
//           flex: 1;
//           background: black;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }
//         .video-box.full {
//           flex: 1 1 100%;
//         }
//         video {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//           background: black;
//         }
//         .controls {
//           position: fixed;
//           left: 50%;
//           transform: translateX(-50%);
//           bottom: 22px;
//           display: flex;
//           gap: 18px;
//           justify-content: center;
//           align-items: center;
//         }
//         .control-btn {
//           width: 64px;
//           height: 64px;
//           border-radius: 50%;
//           background: #1f2937;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 26px;
//           cursor: pointer;
//           box-shadow: 0 6px 18px rgba(0,0,0,0.5);
//           transition: transform 0.2s ease;
//         }
//         .control-btn:hover { transform: scale(1.1); }
//         .control-btn.end { background: #f87171; }
//       `}</style>

//       <div className="video-area">
//         {!inCall ? (
//           <div className="video-box full">
//             <video ref={localVideoRef} autoPlay playsInline muted />
//           </div>
//         ) : (
//           <>
//             <div className="video-box">
//               <video ref={localVideoRef} autoPlay playsInline muted />
//             </div>
//             <div className="video-box">
//               <video ref={remoteVideoRef} autoPlay playsInline />
//             </div>
//           </>
//         )}
//       </div>

//       <div className="controls">
//         <div title="Mute" className={`control-btn ${muted ? "end" : ""}`} onClick={toggleMute}>
//           {muted ? "🔈" : "🎤"}
//         </div>
//         <div title="Video" className={`control-btn ${videoOff ? "end" : ""}`} onClick={toggleVideo}>
//           {videoOff ? "📵" : "📷"}
//         </div>
//         <div title="Switch Camera" className="control-btn" onClick={switchCamera}>🔁</div>
//         <div title="End Call" className="control-btn end" onClick={endCall}>📞</div>
//       </div>
//     </div>
//   );
// }

// ap1


import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SIGNALING_SERVER = "https://ai-ii3n.onrender.com"; // your server URL
const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

export default function App() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const currentFacingMode = useRef("user");

  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  // ----------------- SOCKET -----------------
  useEffect(() => {
    if (!joined) return;

    socket.on("users-in-room", (users) => {
      console.log("👥 Users in room:", users);
      if (users.length > 0) {
        ensurePeerConnection();
        startCall();
      }
    });

    socket.on("user-joined", () => {
      console.log("📢 Someone joined → I start call");
      if (pcRef.current && localStreamRef.current) {
        startCall();
      }
    });

    socket.on("offer", async ({ sdp }) => {
      console.log("📩 Got offer");
      ensurePeerConnection();
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit("answer", { room, sdp: pcRef.current.localDescription });
        setInCall(true);
      } catch (e) {
        console.error("❌ Error handling offer:", e);
      }
    });

    socket.on("answer", async ({ sdp }) => {
      console.log("📩 Got answer");
      if (pcRef.current && sdp) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        setInCall(true);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      console.log("📩 Got ICE candidate");
      try {
        if (pcRef.current && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.error("❌ Error adding candidate:", e);
      }
    });

    socket.on("user-left", () => {
      console.log("👋 User left");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      setInCall(false);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    return () => {
      socket.off();
    };
  }, [joined, room]);

  // ----------------- PEER CONNECTION -----------------
  const ensurePeerConnection = () => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { room, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log("🎥 Remote track received");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pcRef.current = pc;
    return pc;
  };

  // ----------------- JOIN -----------------
  const joinRoom = async (roomId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacingMode.current },
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      ensurePeerConnection();
      socket.emit("join", roomId);
    } catch (e) {
      console.error("❌ getUserMedia error:", e);
      alert("⚠️ Please allow camera & microphone access.");
    }
  };

  // ----------------- CALL -----------------
  const startCall = async () => {
    const pc = ensurePeerConnection();
    console.log("📤 Sending offer");
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { room, sdp: pc.localDescription });
    setInCall(true);
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (pcRef.current) pcRef.current.close();

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    pcRef.current = null;

    setInCall(false);
    socket.emit("leave", room);
    setJoined(false); // back to room input
  };

  // ----------------- TOGGLES -----------------
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted((m) => !m);
  };

  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setVideoOff((v) => !v);
  };

  const switchCamera = async () => {
    currentFacingMode.current = currentFacingMode.current === "user" ? "environment" : "user";
    joinRoom(room);
  };

  // ----------------- UI -----------------
  if (!joined) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0b1020", color: "white" }}>
        <h2>Enter Room Number</h2>
        <input
          style={{ padding: "10px", borderRadius: "8px", marginBottom: "12px", textAlign: "center" }}
          placeholder="Room ID"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button
          style={{ padding: "10px 20px", borderRadius: "8px", background: "#3b82f6", color: "white", cursor: "pointer" }}
          onClick={() => {
            if (room.trim()) {
              joinRoom(room.trim());
              setJoined(true);
            }
          }}
        >
          Join Room
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#0b1020", height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
      <style>{`
        .video-area {
          flex: 1;
          display: flex;
          width: 100%;
          height: 100%;
        }
        .video-box {
          flex: 1;
          background: black;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .video-box.full {
          flex: 1 1 100%;
        }
        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: black;
        }
        .controls {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 22px;
          display: flex;
          gap: 18px;
          justify-content: center;
          align-items: center;
        }
        .control-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #1f2937;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 26px;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(0,0,0,0.5);
          transition: transform 0.2s ease;
        }
        .control-btn:hover { transform: scale(1.1); }
        .control-btn.end { background: #f87171; }
      `}</style>

      <div className="video-area">
        {!inCall ? (
          <div className="video-box full">
            <video ref={localVideoRef} autoPlay playsInline muted />
          </div>
        ) : (
          <>
            <div className="video-box">
              <video ref={localVideoRef} autoPlay playsInline muted />
            </div>
            <div className="video-box">
              <video ref={remoteVideoRef} autoPlay playsInline />
            </div>
          </>
        )}
      </div>

      <div className="controls">
        <div title="Mute" className={`control-btn ${muted ? "end" : ""}`} onClick={toggleMute}>
          {muted ? "🔈" : "🎤"}
        </div>
        <div title="Video" className={`control-btn ${videoOff ? "end" : ""}`} onClick={toggleVideo}>
          {videoOff ? "📵" : "📷"}
        </div>
        <div title="Switch Camera" className="control-btn" onClick={switchCamera}>🔁</div>
        <div title="End Call" className="control-btn end" onClick={endCall}>📞</div>
      </div>
    </div>
  );
}
