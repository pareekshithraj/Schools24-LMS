/**
 * useWebRTC.js
 * 
 * Real WebRTC hook using native browser RTCPeerConnection
 * and Socket.io for signaling. Handles:
 *  - Room join/leave
 *  - SDP offer/answer exchange
 *  - ICE candidate relay
 *  - Track mute/unmute
 *  - Peer stream tracking
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

export const useWebRTC = ({ roomId, userName, isHost }) => {
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // socketId -> RTCPeerConnection
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // socketId -> { stream, userName, isHost, audioEnabled, videoEnabled, handRaised }
  const [isConnected, setIsConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const [socketMessages, setSocketMessages] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const [audioEnabled, setAudioEnabledState] = useState(true);
  const [videoEnabled, setVideoEnabledState] = useState(true);

  // ── Create peer connection for a given remote socket ──
  const createPeerConnection = useCallback((remoteSocketId, remoteUserName, remoteIsHost) => {
    if (peerConnectionsRef.current[remoteSocketId]) {
      return peerConnectionsRef.current[remoteSocketId];
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current[remoteSocketId] = pc;

    // Add local tracks to the new peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // On receiving a remote track
    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [remoteSocketId]: {
          ...prev[remoteSocketId],
          stream: event.streams[0],
          userName: remoteUserName,
          isHost: remoteIsHost,
          audioEnabled: true,
          videoEnabled: true,
          handRaised: false,
        }
      }));
    };

    // On ICE candidate — relay through server
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          targetId: remoteSocketId,
          candidate: event.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] ${remoteSocketId} state: ${pc.connectionState}`);
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[remoteSocketId];
          return next;
        });
        delete peerConnectionsRef.current[remoteSocketId];
      }
    };

    return pc;
  }, []);

  // ── Initialize media + socket ──
  const startSession = useCallback(async () => {
    try {
      // Get local camera/mic
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (e) {
        // No camera — create a silent audio-only or empty stream so WebRTC still works
        console.warn('[WebRTC] Camera not available, joining without video');
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (e2) {
          stream = new MediaStream();
        }
      }
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Connect to signaling server
      const socket = io(SOCKET_URL, { transports: ['websocket'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log(`[Socket.io] Connected: ${socket.id}`);

        // Join the room
        socket.emit('join-room', { roomId, userName, isHost });
      });

      socket.on('connect_error', (err) => {
        setConnectionError(`Connection failed: ${err.message}`);
        setIsConnected(false);
      });

      // Receive list of existing peers — create offer to each
      socket.on('existing-peers', async ({ peers, hostId }) => {
        for (const peerId of peers) {
          const pc = createPeerConnection(peerId, 'Peer', peerId === hostId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { targetId: peerId, offer, userName });
        }
      });

      // A new peer joined — wait for their offer
      socket.on('user-joined', ({ socketId, userName: remoteUser, isHost: remoteHost }) => {
        setRemoteStreams(prev => ({
          ...prev,
          [socketId]: { stream: null, userName: remoteUser, isHost: remoteHost, audioEnabled: true, videoEnabled: true, handRaised: false }
        }));
        setSocketMessages(prev => [...prev, { type: 'join', text: `${remoteUser} joined` }]);
      });

      // Receive offer → set remote desc → create answer
      socket.on('offer', async ({ fromId, offer, userName: remoteUser }) => {
        const pc = createPeerConnection(fromId, remoteUser, false);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { targetId: fromId, answer });
      });

      // Receive answer
      socket.on('answer', async ({ fromId, answer }) => {
        const pc = peerConnectionsRef.current[fromId];
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      // Receive ICE candidates
      socket.on('ice-candidate', async ({ fromId, candidate }) => {
        const pc = peerConnectionsRef.current[fromId];
        if (pc && candidate) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
        }
      });

      // Peer media state changes
      socket.on('peer-media-state', ({ socketId, audioEnabled, videoEnabled }) => {
        setRemoteStreams(prev => prev[socketId]
          ? { ...prev, [socketId]: { ...prev[socketId], audioEnabled, videoEnabled } }
          : prev
        );
      });

      // Peer raise hand
      socket.on('peer-raise-hand', ({ socketId, userName: n, raised }) => {
        setRemoteStreams(prev => prev[socketId]
          ? { ...prev, [socketId]: { ...prev[socketId], handRaised: raised } }
          : prev
        );
        if (raised) setSocketMessages(prev => [...prev, { type: 'hand', text: `${n} raised hand ✋` }]);
      });

      // Chat messages from peers
      socket.on('chat-message', ({ socketId, message, userName: n, time }) => {
        setSocketMessages(prev => [...prev, { type: 'chat', text: message, userName: n, time }]);
      });

      // Peer left
      socket.on('user-left', ({ socketId, userName: remoteUser }) => {
        // Close and clean up peer connection
        const pc = peerConnectionsRef.current[socketId];
        if (pc) { pc.close(); delete peerConnectionsRef.current[socketId]; }
        setRemoteStreams(prev => { const next = { ...prev }; delete next[socketId]; return next; });
        setSocketMessages(prev => [...prev, { type: 'leave', text: `${remoteUser} left` }]);
      });

      // Room info
      socket.on('room-info', ({ peerCount }) => setPeerCount(peerCount));

    } catch (err) {
      console.error('[WebRTC] Fatal error:', err);
      setConnectionError(err.message);
    }
  }, [roomId, userName, isHost, createPeerConnection]);

  // ── Toggle audio ──
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    const enabled = localStreamRef.current.getAudioTracks()[0]?.enabled ?? false;
    setAudioEnabledState(enabled);
    socketRef.current?.emit('media-state', { roomId, audioEnabled: enabled, videoEnabled: videoEnabled });
  }, [roomId, videoEnabled]);

  // ── Toggle video ──
  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    const enabled = localStreamRef.current.getVideoTracks()[0]?.enabled ?? false;
    setVideoEnabledState(enabled);
    socketRef.current?.emit('media-state', { roomId, audioEnabled, videoEnabled: enabled });
  }, [roomId, audioEnabled]);

  // ── Raise hand ──
  const raiseHand = useCallback((raised) => {
    socketRef.current?.emit('raise-hand', { roomId, raised });
  }, [roomId]);

  // ── Send chat ──
  const sendSocketChat = useCallback((message) => {
    socketRef.current?.emit('chat-message', { roomId, message, userName });
  }, [roomId, userName]);

  // ── Leave / cleanup ──
  const endSession = useCallback(() => {
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    socketRef.current?.disconnect();
    socketRef.current = null;
    setLocalStream(null);
    setRemoteStreams({});
    setIsConnected(false);
  }, []);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => { endSession(); };
  }, [endSession]);

  return {
    localStream,
    remoteStreams,
    isConnected,
    peerCount,
    socketMessages,
    connectionError,
    audioEnabled,
    videoEnabled,
    startSession,
    endSession,
    toggleAudio,
    toggleVideo,
    raiseHand,
    sendSocketChat,
  };
};
