import { RealtimeChannel } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

type Handler = (payload: any) => void;

interface RealtimeContextValue {
  subscribe: (channel: string, handler: Handler) => void;
  unsubscribe: (channel: string, handler: Handler) => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const channelsRef = useRef<Map<string, { channel: RealtimeChannel; handlers: Set<Handler> }>>(
    new Map()
  );

  const subscribe = (channelName: string, handler: Handler) => {
    let channelData = channelsRef.current.get(channelName);

    if (!channelData) {
      // Create new channel
      const channel = supabase.channel(channelName);
      
      channel.on('broadcast', { event: 'update' }, (payload) => {
        const handlers = channelsRef.current.get(channelName)?.handlers;
        if (handlers) {
          handlers.forEach((h) => h(payload.payload));
        }
      });

      channel.subscribe();

      channelData = {
        channel,
        handlers: new Set([handler]),
      };
      channelsRef.current.set(channelName, channelData);
    } else {
      // Add handler to existing channel
      channelData.handlers.add(handler);
    }
  };

  const unsubscribe = (channelName: string, handler: Handler) => {
    const channelData = channelsRef.current.get(channelName);
    if (!channelData) return;

    channelData.handlers.delete(handler);

    // If no more handlers, remove channel
    if (channelData.handlers.size === 0) {
      channelData.channel.unsubscribe();
      channelsRef.current.delete(channelName);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup all channels on unmount
      channelsRef.current.forEach((channelData) => {
        channelData.channel.unsubscribe();
      });
      channelsRef.current.clear();
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ subscribe, unsubscribe }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}

