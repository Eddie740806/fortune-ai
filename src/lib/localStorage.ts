'use client';

export interface SavedReading {
  id: string;
  name: string;
  birthInfo: {
    year: number;
    month: number;
    day: number;
    hour: string;
    gender: string;
  };
  interpretation: string;
  readingType: string;
  createdAt: string;
}

const STORAGE_KEY = 'fortune_readings';

export function getReadings(): SavedReading[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveReading(reading: Omit<SavedReading, 'id' | 'createdAt'>): SavedReading {
  const newReading: SavedReading = {
    ...reading,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  const readings = getReadings();
  readings.unshift(newReading); // 最新的放前面
  
  // 最多保存 50 筆
  if (readings.length > 50) {
    readings.pop();
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  return newReading;
}

export function getReading(id: string): SavedReading | null {
  const readings = getReadings();
  return readings.find(r => r.id === id) || null;
}

export function deleteReading(id: string): void {
  const readings = getReadings();
  const filtered = readings.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
