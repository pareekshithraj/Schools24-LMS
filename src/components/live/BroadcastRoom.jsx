/**
 * BroadcastRoom.jsx
 * 
 * TEACHER VIEW: Broadcast mode — streams via MediaRecorder to server
 * STUDENT VIEW: Viewer mode — watches via MSE HTTP polling
 * 
 * Scales to 14,000+ concurrent students via pure HTTP
 */
import React, { useRef, useEffect, useState } from 'react';
import { useBroadcaster } from '../../hooks/useBroadcast';
import { useViewer } from '../../hooks/useBroadcast';
import {
  Radio, Users, Mic, MicOff, Video as VideoIcon, VideoOff,
  PhoneOff, Eye, Signal, AlertCircle, Clock, Activity, Send, MessageSquare, PieChart
} from 'lucide-react';

/* ─── Shared Components ─── */
const BroadcastChat = ({ socket, roomId, userName, isHost }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const handleChat = (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    socket.on('chat-message', handleChat);
    return () => socket.off('chat-message', handleChat);
  }, [socket]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('chat-message', { roomId, message: input, userName });
    setInput('');
  };

  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-bold text-white">Live Chat</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.userName === userName ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-zinc-500 mb-0.5">{m.userName}</span>
            <div className={`px-3 py-2 rounded-xl text-xs ${m.userName === userName ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}>
              {m.message}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={send} className="p-3 border-t border-zinc-800 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-violet-500" />
        <button type="submit" disabled={!input.trim()} className="bg-violet-600 text-white p-2 rounded-lg hover:bg-violet-500 disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
};

const LivePollManager = ({ socket, roomId }) => {
  const createPoll = () => {
    if (!socket) return;
    const pollData = {
      id: Date.now(),
      question: "How well did you understand the Stack implementation?",
      options: [
        { id: 1, text: "Perfectly clear" },
        { id: 2, text: "Mostly clear, need some practice" },
        { id: 3, text: "Completely lost" }
      ]
    };
    socket.emit('live-poll', { roomId, pollData });
  };
  return (
    <button onClick={createPoll} className="w-full flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-bold px-4 py-3 rounded-xl text-xs transition-colors mt-2">
      <PieChart className="h-4 w-4" /> Launch Live Poll
    </button>
  );
};

const LivePollViewer = ({ socket, roomId }) => {
  const [poll, setPoll] = useState(null);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const handlePoll = (data) => { setPoll(data); setVoted(false); };
    socket.on('live-poll', handlePoll);
    return () => socket.off('live-poll', handlePoll);
  }, [socket]);

  if (!poll) return null;

  return (
    <div className="absolute top-4 right-4 w-72 bg-zinc-900 border border-blue-500/50 shadow-2xl rounded-xl p-4 z-50 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-2 mb-3">
        <PieChart className="h-4 w-4 text-blue-400" />
        <span className="text-xs font-bold text-white tracking-wider uppercase">Live Poll</span>
      </div>
      <p className="text-sm text-zinc-300 font-semibold mb-3">{poll.question}</p>
      <div className="space-y-2">
        {poll.options.map(opt => (
          <button key={opt.id} disabled={voted}
            onClick={() => {
              setVoted(true);
              socket.emit('live-poll-vote', { roomId, optionId: opt.id });
              setTimeout(() => setPoll(null), 2000);
            }}
            className="w-full text-left px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors disabled:opacity-50">
            {opt.text}
          </button>
        ))}
      </div>
      {voted && <div className="mt-3 text-[10px] text-center text-emerald-400 font-bold">Vote recorded!</div>}
    </div>
  );
};

/* ─── Broadcaster (Teacher) ─── */
export const BroadcastSender = ({ roomId, hostName, onLeave }) => {
  const localVideoRef = useRef(null);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  const {
    localStream,
    isBroadcasting,
    viewerCount,
    chunksSent,
    mimeType,
    error,
    startBroadcast,
    stopBroadcast,
    toggleAudio,
    toggleVideo,
    socket,
  } = useBroadcaster({ roomId, hostName });

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleToggleAudio = () => { toggleAudio(); setAudioOn(p => !p); };
  const handleToggleVideo = () => { toggleVideo(); setVideoOn(p => !p); };

  const handleLeave = () => {
    stopBroadcast();
    onLeave?.();
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          {isBroadcasting ? (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              BROADCASTING LIVE
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-zinc-800 text-zinc-500 text-xs font-semibold px-3 py-1.5 rounded-lg">
              <Radio className="h-3.5 w-3.5" /> Ready to Broadcast
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Users className="h-3.5 w-3.5" />
            <span><span className="text-[#fafafa] font-bold">{viewerCount.toLocaleString()}</span> students watching</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span>Chunks: <span className="font-mono text-zinc-400">{chunksSent}</span></span>
          <span>Room: <span className="font-mono text-violet-400">{roomId}</span></span>
        </div>
      </div>

      {/* Main area + Chat */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 gap-4 p-5 overflow-hidden">

        {/* Local video preview */}
        <div className="flex-1 relative rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
          <video ref={localVideoRef} autoPlay playsInline muted
            className="w-full h-full object-cover" />
          {!localStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-600">
              <VideoIcon className="h-12 w-12" />
              <span className="text-sm">Camera will appear here</span>
            </div>
          )}

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-lg font-medium backdrop-blur">
              {hostName} · Host
            </span>
            {isBroadcasting && (
              <span className="bg-red-600/80 text-white text-xs px-3 py-1 rounded-lg font-bold backdrop-blur flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {mimeType.includes('vp9') ? 'VP9' : 'VP8'} · 720p
              </span>
            )}
          </div>
        </div>

        {/* Stats panel */}
        <div className="w-60 flex flex-col gap-3">
          {/* Broadcast stats */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">Broadcast Stats</h3>
            {[
              { label: 'Viewers', value: viewerCount.toLocaleString(), icon: '👥', color: 'text-blue-400' },
              { label: 'Chunks Sent', value: chunksSent, icon: '📦', color: 'text-emerald-400' },
              { label: 'Latency', value: '~2-4s', icon: '⚡', color: 'text-amber-400' },
              { label: 'Max Capacity', value: '14,000+', icon: '🚀', color: 'text-violet-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-[#52525b]">{icon} {label}</span>
                <span className={`font-bold font-mono ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Architecture note */}
          <div className="card p-4 space-y-2">
            <h3 className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">Architecture</h3>
            <div className="text-[10px] text-zinc-600 space-y-1 leading-relaxed">
              <div>📹 <span className="text-zinc-500">MediaRecorder → WebM</span></div>
              <div>🔌 <span className="text-zinc-500">Socket.io → Server buffer</span></div>
              <div>🌐 <span className="text-zinc-500">HTTP chunks → Students</span></div>
              <div>🔒 <span className="text-zinc-500">MSE playback (browser native)</span></div>
              <div className="pt-1 text-zinc-700">Zero external APIs · Nginx-scalable</div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <LivePollManager socket={socket} roomId={roomId} />
        </div>
      </div>

      <BroadcastChat socket={socket} roomId={roomId} userName={hostName} isHost={true} />
    </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 px-5 py-4 border-t border-zinc-800">
        <button onClick={handleToggleAudio}
          className={`flex flex-col items-center gap-1 p-3 rounded-xl w-14 transition-all
            ${!audioOn ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'hover:bg-zinc-900 text-zinc-500'}`}>
          {audioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          <span className="text-[8px]">{audioOn ? 'Mute' : 'Unmute'}</span>
        </button>

        <button onClick={handleToggleVideo}
          className={`flex flex-col items-center gap-1 p-3 rounded-xl w-14 transition-all
            ${!videoOn ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'hover:bg-zinc-900 text-zinc-500'}`}>
          {videoOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          <span className="text-[8px]">{videoOn ? 'Cam Off' : 'Cam On'}</span>
        </button>

        <div className="h-8 w-px bg-zinc-800" />

        {!isBroadcasting ? (
          <button onClick={startBroadcast}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
            <Radio className="h-4 w-4" /> Go Live
          </button>
        ) : (
          <button onClick={stopBroadcast}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-5 py-3 rounded-xl text-sm transition-colors">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Stop Broadcast
          </button>
        )}

        <div className="h-8 w-px bg-zinc-800" />

        <button onClick={handleLeave}
          className="flex items-center gap-2 border border-[#27272a] hover:border-red-500/50 text-[#52525b] hover:text-red-400 font-semibold px-4 py-3 rounded-xl text-sm transition-colors">
          <PhoneOff className="h-4 w-4" /> Leave
        </button>
      </div>
    </div>
  );
};

/* ─── Viewer (Student) ─── */
export const BroadcastViewer = ({ roomId, onLeave }) => {
  const {
    videoRef,
    isLive,
    viewerCount,
    hostName,
    bufferedChunks,
    error,
    socket,
    startViewing,
    stopViewing,
  } = useViewer({ roomId });

  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    await startViewing();
    setJoined(true);
  };

  const handleLeave = () => {
    stopViewing();
    onLeave?.();
  };

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-950 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Eye className="h-5 w-5 text-violet-400" />
            <span className="text-sm font-semibold text-[#a1a1aa]">Broadcast Viewer Mode</span>
          </div>
          <h2 className="text-xl font-bold text-[#fafafa] mb-1">Join Live Class Stream</h2>
          <p className="text-xs text-[#52525b]">Room: <span className="font-mono text-violet-400">{roomId}</span></p>
          <p className="text-xs text-zinc-700 mt-2">Powered by MSE + HTTP · Up to 14,000 concurrent viewers</p>
        </div>
        <button onClick={handleJoin}
          className="flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-xl text-sm hover:bg-zinc-200 transition-colors">
          <Eye className="h-4 w-4" /> Watch Live Stream
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          {isLive ? (
            <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-xs px-3 py-1.5 rounded-lg">
              <Clock className="h-3 w-3" /> Waiting for stream…
            </span>
          )}
          {hostName && <span className="text-xs text-zinc-500">Hosted by <span className="text-zinc-300 font-semibold">{hostName}</span></span>}
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-600">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="text-zinc-400 font-semibold">{viewerCount.toLocaleString()}</span> watching
          </span>
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {bufferedChunks} chunks
          </span>
        </div>
      </div>

      {/* Main area + Chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video player */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline
            controls
            className="w-full h-full object-contain"
          />
          <LivePollViewer socket={socket} roomId={roomId} />
          {!isLive && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-600 bg-black/80">
              <Signal className="h-10 w-10 animate-pulse" />
              <div className="text-sm text-zinc-400">Waiting for teacher to go live…</div>
              <div className="text-xs text-zinc-600">Room: <span className="font-mono text-violet-400">{roomId}</span></div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <div className="text-sm text-red-300 text-center max-w-xs">{error}</div>
              <button onClick={handleJoin}
                className="text-xs border border-zinc-700 text-zinc-400 hover:text-white px-4 py-2 rounded-lg transition-colors">
                Retry
              </button>
            </div>
          )}
        </div>
        
        <BroadcastChat socket={socket} roomId={roomId} userName="Viewer" isHost={false} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800">
        <div className="text-xs text-zinc-600">
          Stream via MSE · HTTP polling · No P2P required
        </div>
        <button onClick={handleLeave}
          className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 font-semibold px-4 py-2 rounded-xl text-xs transition-colors">
          <PhoneOff className="h-3.5 w-3.5" /> Leave
        </button>
      </div>
    </div>
  );
};
