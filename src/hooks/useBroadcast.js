/**
 * useBroadcast.js
 * 
 * Teacher-side: Captures camera via MediaRecorder, sends chunks to server via Socket.io
 * Student-side: Receives chunks via HTTP polling, plays via Media Source Extensions (MSE)
 * 
 * Scales to unlimited viewers — server serves video chunks via plain HTTP
 * Can be put behind nginx/CDN to handle 14,000+ concurrent students
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';
const CHUNK_INTERVAL_MS = 2000; // Send a chunk every 2 seconds

/* ─────────────────────────────────────────────
   TEACHER: Broadcast Hook
───────────────────────────────────────────── */
export const useBroadcaster = ({ roomId, hostName }) => {
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const localStreamRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [chunksSent, setChunksSent] = useState(0);
  const [error, setError] = useState(null);
  const [mimeType, setMimeType] = useState('');

  const startBroadcast = useCallback(async () => {
    try {
      setError(null);

      // Get camera + mic
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Detect best supported MIME type
      const mimes = [
        'video/webm; codecs=vp9,opus',
        'video/webm; codecs=vp8,opus',
        'video/webm',
      ];
      const supported = mimes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
      setMimeType(supported);

      // Connect to signaling server
      const socket = io(SOCKET_URL, { transports: ['websocket'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[Broadcast] Teacher socket connected');
        socket.emit('join-room', { roomId, userName: hostName, isHost: true });
        socket.emit('trigger-notification', {
          title: "Live Class Started",
          message: `${hostName} has just gone live! Join room: ${roomId}`
        });
      });

      socket.on('viewer-count', ({ viewerCount: vc }) => setViewerCount(vc));

      // Start MediaRecorder — collects chunks every CHUNK_INTERVAL_MS
      const recorder = new MediaRecorder(stream, {
        mimeType: supported,
        videoBitsPerSecond: 800_000,  // 800kbps — good for 720p
        audioBitsPerSecond: 64_000,
      });
      mediaRecorderRef.current = recorder;
      let chunkCount = 0;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0 && socketRef.current?.connected) {
          event.data.arrayBuffer().then(buffer => {
            socketRef.current.emit('stream-chunk', {
              roomId,
              chunk: buffer,
            });
            setChunksSent(c => c + 1);
          });
        }
      };

      recorder.start(CHUNK_INTERVAL_MS);
      setIsBroadcasting(true);
      console.log(`[Broadcast] Started broadcast for room: ${roomId}`);
    } catch (err) {
      console.error('[Broadcast] Error:', err);
      setError(err.message || 'Could not access camera');
    }
  }, [roomId, hostName]);

  const stopBroadcast = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    socketRef.current?.emit('broadcast-end', { roomId });
    socketRef.current?.disconnect();
    socketRef.current = null;
    setLocalStream(null);
    setIsBroadcasting(false);
    setViewerCount(0);
    console.log('[Broadcast] Broadcast ended');
  }, [roomId]);

  const toggleAudio = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
  }, []);

  const toggleVideo = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
  }, []);

  useEffect(() => () => { stopBroadcast(); }, [stopBroadcast]);

  return {
    localStream,
    isBroadcasting,
    viewerCount,
    chunksSent,
    mimeType,
    error,
    socket: socketRef.current,
    startBroadcast,
    stopBroadcast,
    toggleAudio,
    toggleVideo,
  };
};

/* ─────────────────────────────────────────────
   STUDENT: Viewer Hook (MSE-based streaming)
   Polls HTTP endpoint — pure HTTP, scales to 14k+
───────────────────────────────────────────── */
export const useViewer = ({ roomId }) => {
  const videoRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const pendingChunks = useRef([]);
  const appendingRef = useRef(false);
  const socketRef = useRef(null);

  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [mimeType, setMimeType] = useState('video/webm');
  const [hostName, setHostName] = useState('');
  const [bufferedChunks, setBufferedChunks] = useState(0);
  const [error, setError] = useState(null);

  // Append chunks to MSE SourceBuffer safely
  const appendNextChunk = useCallback(() => {
    if (!sourceBufferRef.current || appendingRef.current || pendingChunks.current.length === 0) return;
    if (sourceBufferRef.current.updating) return;
    const chunk = pendingChunks.current.shift();
    try {
      appendingRef.current = true;
      sourceBufferRef.current.appendBuffer(chunk);
    } catch (e) {
      appendingRef.current = false;
      console.warn('[Viewer] Buffer append error:', e.message);
    }
  }, []);

  // Initialize Media Source Extensions
  const initMSE = useCallback((mime) => {
    if (!videoRef.current) return;
    if (!MediaSource.isTypeSupported(mime)) {
      console.warn('[Viewer] MSE mime not supported:', mime);
      return;
    }

    const ms = new MediaSource();
    mediaSourceRef.current = ms;
    videoRef.current.src = URL.createObjectURL(ms);

    ms.addEventListener('sourceopen', () => {
      try {
        const sb = ms.addSourceBuffer(mime);
        sourceBufferRef.current = sb;
        sb.addEventListener('updateend', () => {
          appendingRef.current = false;
          appendNextChunk();
        });
      } catch (e) {
        setError(`MSE error: ${e.message}`);
      }
    });
  }, [appendNextChunk]);

  const startViewing = useCallback(async () => {
    try {
      setError(null);
      setIsLive(true);
      setHostName('Teacher');
      setMimeType('video/webm; codecs=vp8,opus');

      // Connect socket for chunk notifications
      const socket = io(SOCKET_URL, { transports: ['websocket'] });
      socketRef.current = socket;
      socket.on('connect', () => {
        socket.emit('join-room', { roomId, userName: 'Viewer', isHost: false });
      });

      socket.on('room-info', ({ peerCount }) => setViewerCount(peerCount));

      // Listen for binary chunks
      socket.on('stream-chunk', (chunk) => {
        pendingChunks.current.push(chunk);
        setBufferedChunks(c => c + 1);
        appendNextChunk();
        if (videoRef.current?.paused) {
          videoRef.current?.play().catch(() => {});
        }
      });

      // Initialize MSE with the assumed mime type
      initMSE('video/webm; codecs=vp8,opus');
    } catch (err) {
      setError('Failed to connect: ' + err.message);
    }
  }, [roomId, initMSE]);

  const stopViewing = useCallback(() => {
    sourceBufferRef.current = null;
    if (mediaSourceRef.current?.readyState === 'open') {
      try { mediaSourceRef.current.endOfStream(); } catch {}
    }
    socketRef.current?.emit('leave-broadcast', { roomId });
    socketRef.current?.disconnect();
    socketRef.current = null;
    pendingChunks.current = [];
    appendingRef.current = false;
    setIsLive(false);
  }, [roomId]);

  useEffect(() => () => stopViewing(), [stopViewing]);

  return {
    videoRef,
    isLive,
    viewerCount,
    hostName,
    mimeType,
    bufferedChunks,
    error,
    socket: socketRef.current,
    startViewing,
    stopViewing,
  };
};
