// src/services/geoip.ts

import axios from 'axios';

interface GeoData {
  country: string;
  city: string;
  lat: number;
  lon: number;
  isp: string; // <--- Добавили поле
  status: string;
}

const memoryCache = new Map<string, GeoData>();

export async function getGeoInfo(ipWithPort: string): Promise<GeoData | null> {
  const ip = ipWithPort.split(':')[0];

  if (memoryCache.has(ip)) {
    return memoryCache.get(ip)!;
  }

  try {
    const response = await axios.get<GeoData>(`http://ip-api.com/json/${ip}`);
    
    if (response.data.status === 'success') {
      memoryCache.set(ip, response.data);
      return response.data;
    }
    return null;
  } catch (error) {
    return null;
  }
}