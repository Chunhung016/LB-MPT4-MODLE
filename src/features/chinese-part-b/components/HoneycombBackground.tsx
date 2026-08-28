import React from 'react';

export const HoneycombBackground: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="h-screen max-h-screen w-full bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 font-sans flex flex-col overflow-hidden relative text-amber-950 selection:bg-amber-400 selection:text-amber-950">
      {/* Decorative Honeycomb Pattern Grid */}
      <div
        className="absolute inset-0 opacity-[0.045] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23D97706' fill-opacity='1' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 49l12.98-7.5v-15L0 19v30zm1 1.7l11-6.35v-12.7L1 38v12.7zm26 0l-11-6.35v-12.7L27 38v12.7zM14 0L1.01 7.5v15L14 30l12.99-7.5v-15L14 0zm0 2.29l11 6.35v12.7L14 27.7 3 21.34v-12.7l11-6.35z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Honeycomb Glow Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col w-full h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

