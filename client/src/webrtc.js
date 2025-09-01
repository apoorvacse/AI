// client/src/webrtc.js
// Lightweight helper to create a WebRTC connection to OpenAI Realtime using an ephemeral token
export async function startRealtimeConnection({ serverUrl, onEvent }) {
const pc = new RTCPeerConnection();


// Data channel for receiving events (transcripts, assistant messages)
let dc = pc.createDataChannel('oai-events');
dc.onmessage = (e) => {
try { onEvent(JSON.parse(e.data)); } catch(e) { onEvent(e.data); }
};


// Handle remote audio/video tracks
const remoteStream = new MediaStream();
pc.ontrack = (e) => {
e.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
};


// Acquire local media (video preview + microphone)
const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });


// Add audio track(s) to PeerConnection
localStream.getAudioTracks().forEach(track => pc.addTrack(track, localStream));


// Optional: user still sees local video via returned stream
// Create offer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);


// Request ephemeral token from your server
const tokenResp = await fetch(`${serverUrl}/session`, { method: 'POST' });
if (!tokenResp.ok) throw new Error('Failed to get ephemeral token from server');
const tokenJson = await tokenResp.json();


// Extract ephemeral token field (attempt common variants)
const EPHEMERAL = tokenJson?.client_secret?.value || tokenJson?.ephemeral_key || tokenJson?.ephemeral_token || tokenJson?.client_secret;
if (!EPHEMERAL) throw new Error('Ephemeral token not found in server response');


// Send the SDP offer to OpenAI Realtime endpoint using ephemeral token
const model = tokenJson?.model || 'gpt-4o-realtime-preview';
const realtimeUrl = `https://api.openai.com/v1/realtime?model=${model}`;


const sdpResp = await fetch(realtimeUrl, {
method: 'POST',
headers: {
Authorization: `Bearer ${EPHEMERAL}`,
'Content-Type': 'application/sdp'
},
body: offer.sdp
});


if (!sdpResp.ok) {
const txt = await sdpResp.text();
throw new Error('Realtime SDP failed: ' + txt);
}


const answerSdp = await sdpResp.text();
await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });


return { pc, localStream, remoteStream, dataChannel: dc };
}