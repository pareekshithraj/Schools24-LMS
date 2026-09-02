import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  Eraser, 
  Square, 
  Circle, 
  Minus, 
  Trash2, 
  Download, 
  Undo, 
  Sparkles,
  Type,
  ArrowRight
} from 'lucide-react';

export const LiveWhiteboard = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // 'pen' | 'rect' | 'circle' | 'arrow' | 'eraser' | 'text'
  const [color, setColor] = useState('#F5A623'); // Brand gold/amber
  const [lineWidth, setLineWidth] = useState(3);
  const [history, setHistory] = useState([]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set actual canvas resolution based on container
    canvas.width = canvas.parentElement.clientWidth || 800;
    canvas.height = canvas.parentElement.clientHeight || 500;
    
    // Initial blackboard style dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw initial CS diagram (Stack / Queue visual explanation)
    drawInitialCsDiagram(ctx);
    saveState();
  }, []);

  const drawInitialCsDiagram = (ctx) => {
    ctx.strokeStyle = '#6C47FF';
    ctx.lineWidth = 2;
    ctx.font = '14px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#94A3B8';
    
    // Title
    ctx.fillStyle = '#F5A623';
    ctx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
    ctx.fillText('LIVE CS BOARD: LIFO Stack Memory Layout', 40, 40);

    // Draw Stack container
    ctx.strokeStyle = '#6C47FF';
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 80, 180, 240);

    // Draw Stack Elements
    const elements = ['[3] Element C (Top)', '[2] Element B', '[1] Element A (Bottom)'];
    const colors = ['#38BDF8', '#818CF8', '#C084FC'];

    elements.forEach((item, idx) => {
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(110, 240 - idx * 60, 160, 45);
      ctx.strokeStyle = colors[idx];
      ctx.strokeRect(110, 240 - idx * 60, 160, 45);
      ctx.fillStyle = colors[idx];
      ctx.font = 'bold 12px Fira Code, monospace';
      ctx.fillText(item, 125, 268 - idx * 60);
    });

    // PUSH / POP Arrows
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 13px Plus Jakarta Sans, sans-serif';
    ctx.fillText('PUSH -> O(1)', 310, 120);

    ctx.fillStyle = '#EF4444';
    ctx.fillText('<- POP O(1)', 310, 160);

    ctx.fillStyle = '#94A3B8';
    ctx.font = 'italic 12px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Shared live across all 42 trust school labs', 40, 360);
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory(prev => [...prev.slice(-10), dataUrl]);
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Save snapshot for shapes preview
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (snapshot) {
      // Restore snapshot to prevent smear while dragging shape
      ctx.putImageData(snapshot, 0, 0);

      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `VidyaSetu-LiveWhiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
      
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/80 border-b border-slate-800 text-xs text-white">
        
        {/* Drawing Tools */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-colors ${tool === 'pen' ? 'bg-brand-purple text-white' : 'text-slate-400 hover:text-white'}`}
            title="Pen Tool"
          >
            <PenTool className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded-lg transition-colors ${tool === 'rect' ? 'bg-brand-purple text-white' : 'text-slate-400 hover:text-white'}`}
            title="Rectangle (Process Block)"
          >
            <Square className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded-lg transition-colors ${tool === 'circle' ? 'bg-brand-purple text-white' : 'text-slate-400 hover:text-white'}`}
            title="Circle (Node/Decision)"
          >
            <Circle className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool('arrow')}
            className={`p-2 rounded-lg transition-colors ${tool === 'arrow' ? 'bg-brand-purple text-white' : 'text-slate-400 hover:text-white'}`}
            title="Flowchart Arrow"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-brand-purple text-white' : 'text-slate-400 hover:text-white'}`}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1.5">
          {['#F5A623', '#6C47FF', '#38BDF8', '#10B981', '#EF4444', '#FFFFFF'].map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                if (tool === 'eraser') setTool('pen');
              }}
              style={{ backgroundColor: c }}
              className={`h-5 w-5 rounded-full transition-transform ${color === c && tool !== 'eraser' ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'}`}
            />
          ))}
        </div>

        {/* Line Thickness */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-300">
          <span className="text-[11px] font-medium text-slate-400">Size:</span>
          {[2, 4, 8].map(size => (
            <button
              key={size}
              onClick={() => setLineWidth(size)}
              className={`h-6 w-6 rounded-md flex items-center justify-center font-bold ${lineWidth === size ? 'bg-brand-purple text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {size}px
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl font-semibold transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
          <button
            onClick={downloadCanvas}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl font-semibold transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Save PNG
          </button>
        </div>

      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 w-full h-full cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full block"
        />

        {/* Live sync badge */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-400 flex items-center gap-2 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Synced with 42 School CS Smartboards</span>
        </div>
      </div>

    </div>
  );
};
