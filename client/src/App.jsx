

// day 11 working on u1+ working

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaRecordVinyl,
  FaStopCircle,
  FaPhoneSlash,
} from "react-icons/fa";

// 👉 Replace with your deployed Render server URL
const socket = io("https://ai-ii3n.onrender.com", {
  transports: ["websocket"],
});

export default function App() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const recorderRef = useRef(null);
  const localStreamRef = useRef(null);

  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [recording, setRecording] = useState(false);

  // --- peer connection setup ---
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { room, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pcRef.current = pc;
    return pc;
  };

  // --- socket handlers ---
  useEffect(() => {
    socket.on("offer", async ({ sdp }) => {
      if (!pcRef.current) createPeerConnection();
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      socket.emit("answer", { room, sdp: pcRef.current.localDescription });
      setWaiting(false);
    });


    socket.on("answer", async ({ sdp }) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        setWaiting(false);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await pcRef.current.addIceCandidate(candidate);
      } catch (e) {
        console.error("Error adding ICE candidate", e);
      }
    });
    socket.on("user-joined", ({ id }) => {
    console.log("👤 Another user joined:", id);
    if (pcRef.current) {
      callUser(); // 🚀 start call automatically
    }
  });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
       socket.off("user-joined");
    };
  }, [room]);

  // --- join room ---
  const joinRoom = async () => {
    if (!room) {
      alert("Enter a room name first!");
      return;
    }

    setJoined(true);
    setWaiting(true);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    localVideoRef.current.srcObject = stream;

    const pc = createPeerConnection();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    socket.emit("join", room);
  };

  // --- start call (send offer) ---
  const callUser = async () => {
    if (!pcRef.current) return;
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    socket.emit("offer", { room, sdp: pcRef.current.localDescription });
    setWaiting(true);
  };

  // --- end call ---
  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setJoined(false);
    setWaiting(false);
    setIsMuted(false);
    setVideoOff(false);
    setRecording(false);

    socket.emit("leave", room);
  };

  // --- mute/unmute ---
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsMuted((prev) => !prev);
  };

  // --- video on/off ---
  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setVideoOff((prev) => !prev);
  };

  // --- share screen ---
  const shareScreen = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const videoTrack = screenStream.getVideoTracks()[0];

    const sender = pcRef.current
      .getSenders()
      .find((s) => s.track.kind === "video");
    if (sender) sender.replaceTrack(videoTrack);

    videoTrack.onended = () => {
      if (localStreamRef.current) {
        const camTrack = localStreamRef.current.getVideoTracks()[0];
        sender.replaceTrack(camTrack);
      }
    };
  };

  // --- recording ---
  const startRecording = () => {
    if (!localStreamRef.current || !remoteVideoRef.current.srcObject) return;

    const combinedStream = new MediaStream([
      ...localStreamRef.current.getTracks(),
      ...remoteVideoRef.current.srcObject.getTracks(),
    ]);

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

  // --- UI ---

return (
  <div className="app-container">
    {!joined ? (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <input
          type="text"
          placeholder="Enter room name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          style={{ padding: "10px", fontSize: "16px", marginRight: "10px" }}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    ) : (
      <>
        {waiting && <p style={{ textAlign: "center" }}>⏳ Waiting for peer to join...</p>}
        <div className="video-container">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <video ref={remoteVideoRef} autoPlay playsInline />
        </div>

        <div className="controls">
          <div className="control-btn" onClick={toggleMute}>
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </div>
          <div className="control-btn" onClick={toggleVideo}>
            {videoOff ? <FaVideoSlash /> : <FaVideo />}
          </div>
          <div className="control-btn" onClick={shareScreen}>
            <FaDesktop />
          </div>
          {!recording ? (
            <div className="control-btn" onClick={startRecording}>
              <FaRecordVinyl />
            </div>
          ) : (
            <div className="control-btn" onClick={stopRecording}>
              <FaStopCircle />
            </div>
          )}
          <div className="control-btn end" onClick={endCall}>
            <FaPhoneSlash />
          </div>
        </div>
      </>
    )}
  </div>
);
}



