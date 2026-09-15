'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface PlayerState {
  videoId: string | null;
  title: string;
  artist: string;
}

interface PlayerContextValue {
  current: PlayerState | null;
  play: (videoId: string, title: string, artist: string) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return ctx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<PlayerState | null>(null);

  const play = useCallback((videoId: string, title: string, artist: string) => {
    setCurrent({ videoId, title, artist });
  }, []);

  const close = useCallback(() => {
    setCurrent(null);
  }, []);

  return (
    <PlayerContext.Provider value={{ current, play, close }}>
      {children}
    </PlayerContext.Provider>
  );
}
