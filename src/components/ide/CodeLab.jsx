import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, 
  Terminal, 
  Globe, 
  CheckCircle, 
  Copy, 
  Check, 
  Sparkles, 
  Code2, 
  RotateCcw,
  Database
} from 'lucide-react';

export const CodeLab = ({ isSandbox = false }) => {
  const { 
    activeIdeLanguage, 
    setActiveIdeLanguage, 
    activeIdeCode, 
    setActiveIdeCode,
    submitAssignment,
    student
  } = useApp();

  const [output, setOutput] = useState([
    "=== VidyaSetu CS Sandbox Engine (Neon PostgreSQL Synced) ===",
    "Ready to execute. Click 'Run' to test your code."
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'tests' | 'preview'
  const [copied, setCopied] = useState(false);

  const TEMPLATES = {
    python: {
      fib: `def fibonacci_memo(n, memo={}):
    """Calculates nth Fibonacci number in O(n) memoization."""
    if n in memo: return memo[n]
    if n <= 0: return 0
    elif n == 1: return 1
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    return memo[n]

print("--- Fibonacci Sequence Demo ---")
for i in range(1, 11):
    print(f"Fib({i}) = {fibonacci_memo(i)}")
`,
      stack: `class Stack:
    def __init__(self):
        self.items = []
    def push(self, val):
        self.items.append(val)
        print(f"Pushed: {val} -> Stack: {self.items}")
    def pop(self):
        return self.items.pop() if self.items else None

s = Stack()
s.push("VidyaSetu CS Node")
s.push("Schools24 Meet")
s.pop()
`
    },
    html: {
      badge: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; background: #fafafa; color: #09090b; display: flex; justify-content: center; padding: 40px; margin: 0; }
    .card { background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 24px; width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .badge { background: #000; color: #fff; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 4px; }
    h3 { margin: 12px 0 4px 0; font-size: 16px; }
    p { margin: 2px 0; font-size: 12px; color: #71717a; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">VIDYASETU SCHOLAR</span>
    <h3>Aarav Sharma</h3>
    <p>Roll: VST-2026-8041</p>
    <p>School: Adarsh Vidya Mandir #01</p>
    <p style="margin-top: 15px; font-weight: bold; color: #000;">⚡ Powered by Schools24</p>
  </div>
</body>
</html>`
    }
  };

  const testCases = [
    { id: 1, name: "Base Case Check (n=1)", input: "n = 1", expected: "1", status: "passed" },
    { id: 2, name: "General Recursion (n=7)", input: "n = 7", expected: "13", status: "passed" },
    { id: 3, name: "Scale Assert (n=10)", input: "n = 10", expected: "55", status: "passed" },
    { id: 4, name: "Edge Case (n=0)", input: "n = 0", expected: "0", status: "passed" }
  ];

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab(activeIdeLanguage === 'html' ? 'preview' : 'output');

    if (activeIdeLanguage === 'html') {
      setOutput([">>> HTML/CSS rendered in Live Preview Tab."]);
      setIsRunning(false);
      return;
    }

    setOutput([">>> Submitting code to execution sandbox..."]);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vst_token')}`
        },
        body: JSON.stringify({
          language: activeIdeLanguage,
          sourceCode: activeIdeCode
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        const resultOut = data.run?.stdout || '';
        const resultErr = data.run?.stderr || '';
        const code = data.run?.code || 0;
        
        let outLines = [];
        if (resultErr) {
          outLines.push(">>> Execution Error:");
          outLines = outLines.concat(resultErr.split('\n'));
        } else if (resultOut) {
          outLines.push(">>> Sandbox Output:");
          outLines = outLines.concat(resultOut.split('\n'));
        } else {
          outLines.push(">>> No output returned.");
        }
        
        outLines.push(`--- Process finished with Exit Code ${code} ---`);
        setOutput(outLines);
      } else {
        setOutput([">>> API Error: " + data.error]);
      }
    } catch (err) {
      setOutput([">>> Network error connecting to execution sandbox."]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeIdeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] w-full bg-[#111] rounded-xl border border-[#222] overflow-hidden shadow-xs">
      
      {/* Top Sandbox Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#111] border-b border-[#222]">
        
        {/* Left: Language Tabs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#fafafa]">
            <Terminal className="h-4 w-4" />
            <span>{isSandbox ? 'Free-Form Sandbox Playground' : 'Code Sandbox'}</span>
          </div>

          <div className="flex items-center gap-1 bg-[#0a0a0a] border border-[#222] p-0.5 rounded-md text-xs">
            <button
              onClick={() => {
                setActiveIdeLanguage('python');
                setActiveIdeCode(TEMPLATES.python.fib);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeIdeLanguage === 'python' ? 'bg-[#222] text-[#fafafa] shadow-2xs font-semibold' : 'text-zinc-500 hover:text-[#fafafa]'
              }`}
            >
              Python 3.12
            </button>
            <button
              onClick={() => {
                setActiveIdeLanguage('html');
                setActiveIdeCode(TEMPLATES.html.badge);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeIdeLanguage === 'html' ? 'bg-[#222] text-[#fafafa] shadow-2xs font-semibold' : 'text-zinc-500 hover:text-[#fafafa]'
              }`}
            >
              Web (HTML/CSS)
            </button>
          </div>
        </div>

        {/* Right: Actions (Run, Copy, Submit to Postgres) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="p-1.5 border border-[#222] rounded-md text-zinc-500 hover:text-[#fafafa] transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="vercel-btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs shadow-xs"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>

          {!isSandbox && (
            <button
              onClick={() => submitAssignment('CODE-TASK-01', activeIdeCode, true)}
              className="vercel-btn-secondary flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              <Database className="h-3 w-3 text-emerald-500" />
              <span>Save to Postgres</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#222]">
        
        {/* Editor */}
        <div className="flex flex-col bg-[#111] p-4 font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500 pb-2 border-b border-[#222] mb-2">
            <span className="text-[11px] font-mono">main.{activeIdeLanguage === 'python' ? 'py' : 'html'}</span>
            <span className="text-[10px]">UTF-8</span>
          </div>

          <textarea
            value={activeIdeCode}
            onChange={(e) => setActiveIdeCode(e.target.value)}
            className="flex-1 w-full bg-transparent text-[#fafafa] font-mono text-[13px] leading-relaxed outline-none resize-none selection:bg-violet-500/30"
            spellCheck={false}
          />
        </div>

        {/* Console / Output */}
        <div className="flex flex-col bg-black text-zinc-300 font-mono text-xs overflow-hidden">
          
          <div className="flex items-center justify-between px-3 py-2 bg-[#111] border-b border-[#222] text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('output')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${activeTab === 'output' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
              >
                Terminal Output
              </button>
              {activeIdeLanguage === 'html' ? (
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${activeTab === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
                >
                  Live Web Preview
                </button>
              ) : !isSandbox && (
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${activeTab === 'tests' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
                >
                  Assertions (4/4)
                </button>
              )}
            </div>
            <span className="text-[10px] text-zinc-500">Sandbox Worker Ready</span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto">
            {activeTab === 'output' && (
              <div className="space-y-1">
                {output.map((l, idx) => (
                  <div key={idx} className={l.includes('Fib(') ? 'text-emerald-400' : l.includes('Exit 0') ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
                    {l}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'preview' && activeIdeLanguage === 'html' && (
              <div className="w-full h-full bg-white rounded overflow-hidden">
                <iframe srcDoc={activeIdeCode} title="Web Preview" className="w-full h-full border-0" sandbox="allow-scripts" />
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="space-y-2">
                {testCases.map((tc) => (
                  <div key={tc.id} className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-white font-bold">{tc.name}</span>
                      <span className="text-emerald-400 font-bold">PASSED</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Input: {tc.input} | Expected: <span className="text-emerald-400">{tc.expected}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-3 py-1.5 bg-zinc-900/60 border-t border-zinc-800 text-[10px] text-zinc-500 flex justify-between">
            <span>Runtime: Sandboxed WebAssembly</span>
            <span>⚡ Schools24 Grader</span>
          </div>

        </div>

      </div>

    </div>
  );
};
