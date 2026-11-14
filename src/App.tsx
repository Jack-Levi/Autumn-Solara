import React from 'react';

export function App() {
  return (
    <div className="relative min-h-screen bg-[#05060b] text-slate-100 font-sans overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-300">
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-100">
          AUTUMN SOLARA
        </h1>
        <p className="mt-2 text-sm text-slate-400">Deep Space Planetary Exploration & Telemetry Platform</p>
      </main>
    </div>
  );
}

export default App;
