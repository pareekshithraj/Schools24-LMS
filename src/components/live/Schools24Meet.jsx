import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { LiveWhiteboard } from './LiveWhiteboard';
import { useWebRTC } from '../../hooks/useWebRTC';
import { BroadcastSender, BroadcastViewer } from './BroadcastRoom';
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, ScreenShare,
  Hand, PhoneOff, MessageSquare, Users, LayoutGrid, Edit3,
  Code2, Play, Radio, Maximize2, Volume2, BarChart2, Send,
  Database, Wifi, WifiOff, CheckCircle2, AlertCircle, UserCircle2,
  Tv2, Signal, Zap, ArrowRight, Globe, Lock
} from 'lucide-react';

/* ─────────────────────────────────────────────
   VideoTile — renders a real WebRTC stream
───────────────────────────────────────────── */
const VideoTile = ({ stream, label, isHost, isLarge, audioEnabled = true, videoEnabled = true, handRaised = false, isLocal = false }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className={`relative rounded-xl bg-zinc-900 overflow-hidden border flex items-center justify-center
      ${isLarge ? 'md:col-span-2 min-h-[260px]' : 'min-h-[160px]'}
      ${isHost ? 'border-violet-500/40' : 'border-zinc-800'}`}>
      {stream && videoEnabled ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-zinc-600">
          <UserCircle2 className="h-12 w-12" />
          <span className="text-xs">{videoEnabled ? 'No Video' : 'Camera Off'}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
        {isHost && <span className="flex items-center gap-1 bg-violet-600/80 text-white text-[10px] px-2 py-0.5 rounded font-bold"><Radio className="h-2.5 w-2.5 animate-pulse" /> HOST</span>}
        {handRaised && <span className="ml-auto bg-amber-500/80 text-white text-[10px] px-1.5 py-0.5 rounded font-bold animate-bounce">✋</span>}
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="bg-black/70 text-white text-[11px] px-2 py-0.5 rounded font-medium truncate max-w-[120px]">{label}{isLocal ? ' (You)' : ''}</span>
        <div className="flex items-center gap-1">
          {!audioEnabled && <MicOff className="h-3 w-3 text-red-400 bg-black/70 p-0.5 rounded" />}
          {!videoEnabled && <VideoOff className="h-3 w-3 text-red-400 bg-black/70 p-0.5 rounded" />}
          {audioEnabled && <Volume2 className="h-3 w-3 text-emerald-400 bg-black/70 p-0.5 rounded animate-pulse" />}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MODE SELECTION LOBBY
───────────────────────────────────────────── */
const ModeLobby = ({ currentClass, currentRole, onSelect, isConnecting }) => {
  const isHost = currentRole === 'teacher' || currentRole === 'admin' || currentRole === 'principal';
  const localVideoRef = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then(s => { setPreview(s); if (localVideoRef.current) localVideoRef.current.srcObject = s; })
      .catch(() => {});
    return () => { preview?.getTracks().forEach(t => t.stop()); };
  }, []);

  const MODES = isHost
    ? [
        {
          id: 'stream',
          Icon: Tv2,
          label: 'Broadcast Stream',
          badge: '14,000+ students',
          badgeColor: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
          iconBg: 'bg-violet-500/10',
          iconColor: 'text-violet-400',
          desc: 'One-to-many broadcast via MediaRecorder + HTTP. Teacher streams once, unlimited students watch. ~2–4s latency. Best for large classes.',
          features: ['Scales to 14,000+ students', 'No P2P – pure HTTP delivery', 'Works behind CDN/nginx', '~2-4s latency'],
          cta: '🔴 Go Live — Broadcast'
        },
        {
          id: 'meet',
          Icon: Users,
          label: 'Interactive Meet',
          badge: '≤ 15 students',
          badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
          iconBg: 'bg-blue-500/10',
          iconColor: 'text-blue-400',
          desc: 'Full WebRTC P2P mesh. Every participant has camera + mic. Real-time, zero latency. Best for small group sessions or 1:1 tutoring.',
          features: ['Real-time P2P (WebRTC)', 'Everyone has camera/mic', 'Hand raise, polls, chat', 'Zero latency'],
          cta: '📹 Start Meet Room'
        }
      ]
    : [
        {
          id: 'stream',
          Icon: Tv2,
          label: 'Watch Live Stream',
          badge: 'No camera needed',
          badgeColor: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
          iconBg: 'bg-violet-500/10',
          iconColor: 'text-violet-400',
          desc: 'Watch the teacher\'s broadcast. Pure HTTP streaming — no P2P required. Best for large classes where you want to watch and listen.',
          features: ['No camera/mic required', 'Works on any device', 'Up to 14,000 students', '~2-4s latency'],
          cta: '📺 Watch Stream'
        },
        {
          id: 'meet',
          Icon: Users,
          label: 'Join Interactive Meet',
          badge: 'Full participation',
          badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
          iconBg: 'bg-blue-500/10',
          iconColor: 'text-blue-400',
          desc: 'Join with your camera and mic. Interact directly with the teacher and classmates. For small group sessions.',
          features: ['Camera + mic required', 'Raise hand, chat', 'Direct P2P connection', 'Full interactivity'],
          cta: '📹 Join Meet'
        }
      ];

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 overflow-y-auto">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Schools24 · Live Classroom</span>
          </div>
          <h2 className="text-lg font-bold text-[#fafafa]">{currentClass?.title}</h2>
          <p className="text-xs text-zinc-500">{currentClass?.teacher} · {currentClass?.grade} · Code: <span className="font-mono text-violet-400">{currentClass?.meetCode}</span></p>
        </div>

        {/* Camera preview */}
        <div className="relative w-32 h-20 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          {preview ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full"><UserCircle2 className="h-8 w-8 text-zinc-700" /></div>
          )}
          <div className="absolute bottom-1 left-0 right-0 text-center">
            <span className="text-[9px] text-zinc-500 bg-black/50 px-1 rounded">Preview</span>
          </div>
        </div>
      </div>

      {/* Mode cards */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">

        <div className="text-center mb-2">
          <h3 className="text-base font-bold text-[#fafafa]">Choose your session mode</h3>
          <p className="text-xs text-zinc-500 mt-1">Pick based on class size and interaction needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
          {MODES.map(mode => (
            <button key={mode.id} onClick={() => onSelect(mode.id)} disabled={isConnecting}
              className="group flex flex-col gap-4 p-6 rounded-2xl border border-white/5 hover:border-white/10 bg-[#111] hover:bg-[#151515] hover:-translate-y-1 hover:shadow-xl text-left transition-all duration-300 disabled:opacity-50 h-full">

              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${mode.iconBg}`}>
                  <mode.Icon className={`h-6 w-6 ${mode.iconColor}`} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${mode.badgeColor}`}>
                  {mode.badge}
                </span>
              </div>

              <div>
                <div className="text-sm font-bold text-[#fafafa] mb-1">{mode.label}</div>
                <p className="text-xs text-zinc-500 leading-relaxed">{mode.desc}</p>
              </div>

              <ul className="space-y-1">
                {mode.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all
                ${mode.id === 'stream'
                  ? 'bg-violet-600 text-white group-hover:bg-violet-500'
                  : 'bg-zinc-800 text-[#fafafa] group-hover:bg-zinc-700'}`}>
                {isConnecting ? 'Connecting…' : mode.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-[10px] text-zinc-700 text-center">
          WebRTC + Socket.io + MSE · No external API cost · Hosted on Schools24 infrastructure
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MEET MODE — Full interactive WebRTC session
───────────────────────────────────────────── */
const MeetRoom = ({ currentClass, currentRole, teacher, student, onLeave, meetChatMessages, sendChatMessage }) => {
  const roomId = currentClass?.meetCode || currentClass?.id || 'default-room';
  const isHost = currentRole === 'teacher' || currentRole === 'admin';
  const userName = isHost ? (teacher?.name || 'Teacher') : (student?.name || 'Student');

  const [activeViewMode, setActiveViewMode] = useState('grid');
  const [activeSidePanel, setActiveSidePanel] = useState('chat');
  const [inputChat, setInputChat] = useState('');
  const [allMessages, setAllMessages] = useState(meetChatMessages || []);
  const [handRaised, setHandRaised] = useState(false);
  const [liveSharedCode, setLiveSharedCode] = useState(`# Python 3 - Schools24 Live Stream\nclass Stack:\n    def __init__(self):\n        self.items = []\n    def push(self, item):\n        self.items.append(item)\n        print(f"Pushed: {item} -> Stack: {self.items}")\n    def pop(self):\n        if self.items:\n            removed = self.items.pop()\n            print(f"Popped: {removed} <- Stack: {self.items}")\n\ns = Stack()\ns.push("VidyaSetu LMS")\ns.push("Schools24 Meet")\ns.push("Python Lab")\ns.pop()`);
  const [codeOutput, setCodeOutput] = useState([]);
  const [running, setRunning] = useState(false);

  const { localStream, remoteStreams, isConnected, peerCount, socketMessages, audioEnabled, videoEnabled,
    startSession, endSession, toggleAudio, toggleVideo, raiseHand, sendSocketChat } = useWebRTC({ roomId, userName, isHost });

  useEffect(() => { startSession(); }, []);

  useEffect(() => {
    const chatMsgs = socketMessages.filter(m => m.type === 'chat');
    if (chatMsgs.length > 0) {
      const last = chatMsgs[chatMsgs.length - 1];
      setAllMessages(prev => [...prev, {
        id: Date.now(), sender: last.userName, role: 'Participant',
        text: last.text, time: new Date(last.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isHost: false
      }]);
    }
  }, [socketMessages]);

  const handleSendChat = () => {
    if (!inputChat.trim()) return;
    setAllMessages(prev => [...prev, { id: Date.now(), sender: userName + ' (You)', role: isHost ? 'Host' : 'Student', text: inputChat, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isHost }]);
    sendChatMessage(inputChat);
    sendSocketChat(inputChat);
    setInputChat('');
  };

  const handleToggleHand = () => { const n = !handRaised; setHandRaised(n); raiseHand(n); };

  const handleRunCode = () => {
    setRunning(true); setCodeOutput([]);
    setTimeout(() => {
      setRunning(false);
      setCodeOutput([
        'Running Python 3.12 (Schools24 Stream Runner)…',
        "Pushed: VidyaSetu LMS -> Stack: ['VidyaSetu LMS']",
        "Pushed: Schools24 Meet -> Stack: ['VidyaSetu LMS', 'Schools24 Meet']",
        "Pushed: Python Lab -> Stack: ['VidyaSetu LMS', 'Schools24 Meet', 'Python Lab']",
        "Popped: Python Lab <- Stack: ['VidyaSetu LMS', 'Schools24 Meet']",
        '>>> Exit 0 · 0.031s · Synced to all labs',
      ]);
    }, 500);
  };

  const remoteEntries = Object.entries(remoteStreams);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#1a1a1a] border-b border-[#222]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[11px] font-semibold">
            <Users className="h-3 w-3" /> MEET · P2P WebRTC
          </div>
          <div className="text-[11px]">
            {isConnected
              ? <span className="text-emerald-400">● Connected · {peerCount} participant{peerCount !== 1 ? 's' : ''}</span>
              : <span className="text-amber-400">● Connecting…</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-900 p-0.5 rounded-md">
          {[{ mode: 'grid', Icon: LayoutGrid, label: 'Grid' }, { mode: 'whiteboard', Icon: Edit3, label: 'Whiteboard' }, { mode: 'code', Icon: Code2, label: 'Code' }].map(({ mode, Icon, label }) => (
            <button key={mode} onClick={() => setActiveViewMode(mode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors
                ${activeViewMode === mode ? 'bg-[#111] text-black dark:text-white font-semibold' : 'text-zinc-500 hover:text-[#fafafa]'}`}>
              <Icon className="h-3 w-3" /><span>{label}</span>
            </button>
          ))}
        </div>
        <img src="/SCHOOLS24.png" alt="Schools24" className="h-3.5 object-contain opacity-60" />
      </div>

      {/* Stage */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-3 overflow-y-auto bg-[#1a1a1a]">
          {activeViewMode === 'grid' && (
            <div className={`grid gap-3 h-full ${remoteEntries.length === 0 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              <VideoTile stream={localStream} label={userName} isHost={isHost} isLarge={remoteEntries.length === 0} audioEnabled={audioEnabled} videoEnabled={videoEnabled} handRaised={handRaised} isLocal />
              {remoteEntries.map(([socketId, peer], i) => (
                <VideoTile key={socketId} stream={peer.stream} label={peer.userName || `Participant ${i + 1}`} isHost={peer.isHost} isLarge={i === 0 && isHost} audioEnabled={peer.audioEnabled} videoEnabled={peer.videoEnabled} handRaised={peer.handRaised} />
              ))}
              {remoteEntries.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center gap-3 text-zinc-600 mt-4">
                  <Users className="h-10 w-10" />
                  <div className="text-center">
                    <div className="text-sm font-semibold text-zinc-400">Waiting for participants…</div>
                    <div className="text-xs mt-1">Room: <span className="font-mono text-violet-400">{roomId}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeViewMode === 'whiteboard' && <LiveWhiteboard />}
          {activeViewMode === 'code' && (
            <div className="flex flex-col gap-3 h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Shared Python · live to all participants</span>
                <button onClick={handleRunCode} disabled={running}
                  className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50">
                  <Play className="h-3 w-3" />{running ? 'Running…' : 'Run'}
                </button>
              </div>
              <textarea value={liveSharedCode} onChange={e => setLiveSharedCode(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-emerald-400 resize-none focus:outline-none focus:border-violet-500" spellCheck={false} />
              {codeOutput.length > 0 && (
                <div className="bg-black border border-zinc-800 rounded-xl p-4 font-mono text-xs text-emerald-400 max-h-40 overflow-y-auto">
                  {codeOutput.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="w-72 border-l border-zinc-800 flex flex-col bg-zinc-950">
          <div className="flex border-b border-zinc-800">
            {[{ key: 'chat', Icon: MessageSquare, label: 'Chat' }, { key: 'people', Icon: Users, label: `People (${peerCount})` }].map(({ key, Icon, label }) => (
              <button key={key} onClick={() => setActiveSidePanel(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors
                  ${activeSidePanel === key ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                <Icon className="h-3.5 w-3.5" /><span>{label}</span>
              </button>
            ))}
          </div>

          {activeSidePanel === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {allMessages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex gap-2 ${msg.isHost ? 'flex-row-reverse' : ''}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${msg.isHost ? 'bg-violet-600' : 'bg-zinc-700'}`}>
                      {msg.sender?.[0]?.toUpperCase()}
                    </div>
                    <div className={`max-w-[170px] flex flex-col gap-0.5 ${msg.isHost ? 'items-end' : 'items-start'}`}>
                      <div className="text-[9px] text-zinc-500">{msg.sender} · {msg.time}</div>
                      <div className={`text-xs px-2.5 py-1.5 rounded-xl ${msg.isHost ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-200'}`}>{msg.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-zinc-800 flex gap-2">
                <input value={inputChat} onChange={e => setInputChat(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} placeholder="Message everyone…"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600" />
                <button onClick={handleSendChat} className="bg-white text-black p-1.5 rounded-lg hover:opacity-80">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}

          {activeSidePanel === 'people' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${isHost ? 'bg-violet-600' : 'bg-zinc-700'}`}>{userName[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-zinc-100 truncate">{userName} (You)</div>
                  <div className="text-[10px] text-zinc-500">{isHost ? 'Host' : 'Participant'}</div>
                </div>
                <div className="flex gap-1">
                  {audioEnabled ? <Mic className="h-3 w-3 text-emerald-400" /> : <MicOff className="h-3 w-3 text-red-400" />}
                </div>
              </div>
              {remoteEntries.map(([socketId, peer]) => (
                <div key={socketId} className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-900 transition-colors">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${peer.isHost ? 'bg-violet-600' : 'bg-zinc-700'}`}>{peer.userName?.[0] || '?'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-100 truncate">{peer.userName || 'Participant'}</div>
                    <div className="text-[10px] text-zinc-500">{peer.isHost ? 'Host' : 'Participant'}</div>
                  </div>
                  <div className="flex gap-1">
                    {peer.handRaised && <span>✋</span>}
                    {peer.audioEnabled ? <Mic className="h-3 w-3 text-emerald-400" /> : <MicOff className="h-3 w-3 text-red-400" />}
                  </div>
                </div>
              ))}
              {remoteEntries.length === 0 && <div className="text-center text-zinc-600 text-xs py-8">No other participants yet</div>}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-zinc-800 bg-zinc-950">
        {[
          { onClick: toggleAudio, active: !audioEnabled, IconOff: MicOff, IconOn: Mic, label: audioEnabled ? 'Mute' : 'Unmute' },
          { onClick: toggleVideo, active: !videoEnabled, IconOff: VideoOff, IconOn: VideoIcon, label: videoEnabled ? 'Cam Off' : 'Cam On' },
        ].map(({ onClick, active, IconOff, IconOn, label }, i) => (
          <button key={i} onClick={onClick}
            className={`flex flex-col items-center gap-0.5 p-2.5 rounded-xl w-14 transition-all
              ${active ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'hover:bg-zinc-900 text-zinc-500'}`}>
            {active ? <IconOff className="h-5 w-5" /> : <IconOn className="h-5 w-5" />}
            <span className="text-[8px]">{label}</span>
          </button>
        ))}
        <button onClick={handleToggleHand}
          className={`flex flex-col items-center gap-0.5 p-2.5 rounded-xl w-14 transition-all
            ${handRaised ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse' : 'hover:bg-zinc-900 text-zinc-500'}`}>
          <Hand className="h-5 w-5" />
          <span className="text-[8px]">{handRaised ? 'Lower' : 'Raise'}</span>
        </button>
        <button onClick={() => setActiveViewMode(v => v === 'whiteboard' ? 'grid' : 'whiteboard')}
          className={`flex flex-col items-center gap-0.5 p-2.5 rounded-xl w-14 transition-all
            ${activeViewMode === 'whiteboard' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30' : 'hover:bg-zinc-900 text-zinc-500'}`}>
          <Edit3 className="h-5 w-5" /><span className="text-[8px]">Board</span>
        </button>
        <div className="h-8 w-px bg-zinc-800" />
        <button onClick={() => { endSession(); onLeave(); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
          <PhoneOff className="h-4 w-4" /> Leave
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ROOT COMPONENT: Schools24Meet
   Routes between: Lobby → Stream | Meet
───────────────────────────────────────────── */
export const Schools24Meet = () => {
  const {
    currentRole, liveClasses, leaveLiveMeeting,
    teacher, student, meetChatMessages, sendChatMessage,
  } = useApp();

  const currentClass = liveClasses.find(c => c.id === 'LIVE-01') || liveClasses[0];
  const roomId = currentClass?.meetCode || currentClass?.id || 'default-room';
  const isHost = currentRole === 'teacher' || currentRole === 'admin';

  // session state: 'lobby' | 'stream' | 'meet'
  const [session, setSession] = useState('lobby');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSelect = async (mode) => {
    setIsConnecting(true);
    await new Promise(r => setTimeout(r, 300)); // brief transition
    setSession(mode);
    setIsConnecting(false);
  };

  const handleLeave = () => {
    setSession('lobby');
    leaveLiveMeeting();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] w-full bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">

      {/* Universal header strip */}
      <div className="flex items-center gap-3 px-5 py-2 bg-black border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-white flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-xs">S</span>
          </div>
          <span className="text-xs font-bold text-zinc-300">Schools24</span>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-500">Live Classroom</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {session !== 'lobby' && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
              ${session === 'stream'
                ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
              {session === 'stream' ? '📺 STREAM MODE' : '📹 MEET MODE'}
            </span>
          )}
          <span className="text-[10px] text-zinc-700 font-mono">{roomId}</span>
        </div>
      </div>

      {/* Content area */}
      {session === 'lobby' && (
        <ModeLobby
          currentClass={currentClass}
          currentRole={currentRole}
          onSelect={handleSelect}
          isConnecting={isConnecting}
        />
      )}

      {session === 'stream' && isHost && (
        <BroadcastSender roomId={roomId} hostName={teacher?.name || 'Teacher'} onLeave={handleLeave} />
      )}

      {session === 'stream' && !isHost && (
        <BroadcastViewer roomId={roomId} onLeave={handleLeave} />
      )}

      {session === 'meet' && (
        <MeetRoom
          currentClass={currentClass}
          currentRole={currentRole}
          teacher={teacher}
          student={student}
          onLeave={handleLeave}
          meetChatMessages={meetChatMessages}
          sendChatMessage={sendChatMessage}
        />
      )}
    </div>
  );
};
