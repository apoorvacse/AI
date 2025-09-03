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

// import { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";

// const socket = io("https://ai-ii3n.onrender.com", {
//   transports: ["websocket"],
// }); // signaling server

// export default function App() {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const pcRef = useRef(null);
//   const recorderRef = useRef(null);

//   const [room, setRoom] = useState("");
//   const [joined, setJoined] = useState(false);
//   const [waiting, setWaiting] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);
//   const [recording, setRecording] = useState(false);

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
//     setWaiting(true);

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
//     setWaiting(true);
//   };

//   const endCall = () => {
//     if (pcRef.current) {
//       pcRef.current.close();
//       pcRef.current = null;
//     }
//     localVideoRef.current.srcObject?.getTracks().forEach((t) => t.stop());
//     remoteVideoRef.current.srcObject = null;
//     setJoined(false);
//     setWaiting(false);
//   };

//   const toggleMute = () => {
//     const stream = localVideoRef.current.srcObject;
//     if (!stream) return;
//     stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
//     setIsMuted((prev) => !prev);
//   };

//   const toggleVideo = () => {
//     const stream = localVideoRef.current.srcObject;
//     if (!stream) return;
//     stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
//     setVideoOff((prev) => !prev);
//   };

//   const shareScreen = async () => {
//     const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
//     const videoTrack = screenStream.getVideoTracks()[0];

//     const sender = pcRef.current
//       .getSenders()
//       .find((s) => s.track.kind === "video");

//     sender.replaceTrack(videoTrack);

//     videoTrack.onended = () => {
//       // revert back to camera if screen share stops
//       const camTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
//       sender.replaceTrack(camTrack);
//     };
//   };

//   const startRecording = () => {
//     const localStream = localVideoRef.current.srcObject;
//     const remoteStream = remoteVideoRef.current.srcObject;

//     if (!localStream || !remoteStream) return;

//     const combinedStream = new MediaStream([
//       ...localStream.getTracks(),
//       ...remoteStream.getTracks(),
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

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://ai-ii3n.onrender.com", {
  transports: ["websocket"],
}); // your Render signaling server

export default function App() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const recorderRef = useRef(null);

  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    socket.on("offer", async (offer) => {
      if (!pcRef.current) createPeerConnection();
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      socket.emit("answer", { room, answer });
      setWaiting(false);
    });

    socket.on("answer", async (answer) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setWaiting(false);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        await pcRef.current.addIceCandidate(candidate);
      } catch (e) {
        console.error("Error adding ice candidate", e);
      }
    });
  }, [room]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { room, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    pcRef.current = pc;
    return pc;
  };

  const joinRoom = async () => {
    setJoined(true);
    setWaiting(true);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;

    const pc = createPeerConnection();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    socket.emit("join", room);

    // Initiate call
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { room, offer });
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    localVideoRef.current.srcObject?.getTracks().forEach((t) => t.stop());
    remoteVideoRef.current.srcObject = null;
    setJoined(false);
    setWaiting(false);
  };

  const toggleMute = () => {
    const stream = localVideoRef.current.srcObject;
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current.srcObject;
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    setVideoOff((prev) => !prev);
  };

  const shareScreen = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const videoTrack = screenStream.getVideoTracks()[0];

    const sender = pcRef.current.getSenders().find((s) => s.track.kind === "video");
    sender.replaceTrack(videoTrack);

    videoTrack.onended = () => {
      const camTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
      sender.replaceTrack(camTrack);
    };
  };

  const startRecording = () => {
    const localStream = localVideoRef.current.srcObject;
    const remoteStream = remoteVideoRef.current.srcObject;

    if (!localStream || !remoteStream) return;

    const combinedStream = new MediaStream([...localStream.getTracks(), ...remoteStream.getTracks()]);

    const recorder = new MediaRecorder(combinedStream);
    recorderRef.current = recorder;

    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.webm";
      a.click();
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div style={{ background: "#121212", height: "100vh", color: "white", padding: "20px" }}>
      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Enter room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={{ padding: "8px", marginRight: "10px" }}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: "10px" }}>
            <button onClick={endCall}>End Call</button>
            <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>
            <button onClick={toggleVideo}>{videoOff ? "Turn Video On" : "Turn Video Off"}</button>
            <button onClick={shareScreen}>Share Screen</button>
            {!recording ? (
              <button onClick={startRecording}>Start Recording</button>
            ) : (
              <button onClick={stopRecording}>Stop Recording</button>
            )}
          </div>

          {waiting && <p>⏳ Waiting for peer to join...</p>}

          <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
            <video ref={localVideoRef} autoPlay muted playsInline width="300" />
            <video ref={remoteVideoRef} autoPlay playsInline width="300" />
          </div>
        </div>
      )}
    </div>
  );
}
