// src/api/spot.ts
import { supabase } from '../lib/supabase';

export interface SpotPrice {
  metal: string;
  spot_usd: number;
  recorded_at: string;
  source: string | null;
}

export interface SpotPrices {
  gold: number | null;
  silver: number | null;
  platinum: number | null;
  palladium: number | null;
}

export async function getLatestSpotPrices(): Promise<SpotPrices> {
  const { data, error } = await supabase
    .from('price_ticks')
    .select('metal, spot_usd, recorded_at')
    .order('recorded_at', { ascending: false });

  if (error) throw error;

  // Get latest price for each metal
  const latest: Record<string, number> = {};
  data?.forEach((tick) => {
    if (!latest[tick.metal]) {
      latest[tick.metal] = tick.spot_usd;
    }
  });

  return {
    gold: latest.gold || null,
    silver: latest.silver || null,
    platinum: latest.platinum || null,
    palladium: latest.palladium || null,
  };
}
