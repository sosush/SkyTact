// ============================================
// AeroRoute — Terminal Aerodrome Parser (METAR)
// ============================================

export interface MetarData {
  raw: string;
  station: string;          // e.g. KJFK
  observationTime: string;  // e.g. 251220Z
  wind: {
    direction: number | 'VRB' | null;
    speedKnots: number | null;
    gustKnots: number | null;
  };
  visibility: {
    meters: number | null;
    statuteMiles: number | null;
    raw: string | null;
  };
  clouds: Array<{
    type: 'FEW' | 'SCT' | 'BKN' | 'OVC' | 'VV' | 'CLR' | 'SKC' | 'CAVOK';
    altitudeFeet: number | null;
    modifier?: 'CB' | 'TCU';
  }>;
  temperatureCelsius: number | null;
  dewPointCelsius: number | null;
  altimeter: {
    inhg: number | null;
    hpa: number | null;
  };
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR' | 'UNKNOWN';
}

/**
 * Parses a raw METAR string into structured aviation data using Regex.
 * This is a simplified but highly effective parser demonstrating string manipulation logic.
 */
export const parseMetar = (raw: string): MetarData => {
  const parts = raw.trim().split(/\s+/);
  
  const data: MetarData = {
    raw,
    station: parts[0] || 'UNKN',
    observationTime: '',
    wind: { direction: null, speedKnots: null, gustKnots: null },
    visibility: { meters: null, statuteMiles: null, raw: null },
    clouds: [],
    temperatureCelsius: null,
    dewPointCelsius: null,
    altimeter: { inhg: null, hpa: null },
    flightCategory: 'UNKNOWN',
  };

  // 1. Time (e.g. 151250Z = 15th day, 12:50 Zulu)
  const timeRegex = /^\d{6}Z$/;
  data.observationTime = parts.find(p => timeRegex.test(p)) || '';

  // 2. Wind (e.g. 27015G25KT or VRB05KT)
  const windRegex = /^(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?(KT|MPS|KMH)$/;
  const windPart = parts.find(p => windRegex.test(p));
  if (windPart) {
    const match = windPart.match(windRegex);
    if (match) {
      data.wind.direction = match[1] === 'VRB' ? 'VRB' : parseInt(match[1], 10);
      data.wind.speedKnots = match[4] === 'MPS' ? parseInt(match[2], 10) * 1.94384 : parseInt(match[2], 10);
      if (match[3]) {
        data.wind.gustKnots = match[4] === 'MPS' ? parseInt(match[3], 10) * 1.94384 : parseInt(match[3], 10);
      }
    }
  }

  // 3. Visibility (e.g. 10SM, 9999, 1/2SM)
  const visSmRegex = /^(\d{1,2}(?:\/\d)?|\d\s\d\/\d)SM$/;
  const visMetersRegex = /^\d{4}$/;
  
  const visPartSm = parts.find(p => visSmRegex.test(p));
  const visPartM = parts.find(p => visMetersRegex.test(p));
  
  if (visPartSm) {
    data.visibility.raw = visPartSm;
    // VERY simplified SM parsing logic for demonstration
    if (visPartSm.includes('/')) {
        data.visibility.statuteMiles = 0.5; // Stub for fractions like 1/2SM
    } else {
        data.visibility.statuteMiles = parseInt(visPartSm, 10);
    }
    data.visibility.meters = (data.visibility.statuteMiles || 0) * 1609.34;
  } else if (visPartM) {
    data.visibility.raw = visPartM;
    const m = parseInt(visPartM, 10);
    data.visibility.meters = m === 9999 ? 10000 : m; // 9999 means 10km or more
    data.visibility.statuteMiles = data.visibility.meters / 1609.34;
  }

  if (parts.includes('CAVOK')) {
      data.visibility.meters = 10000;
      data.visibility.statuteMiles = 6.2;
      data.visibility.raw = 'CAVOK';
      data.clouds.push({ type: 'CAVOK', altitudeFeet: null });
  }

  // 4. Clouds (e.g. BKN020, SCT040CB, OVC100)
  const cloudRegex = /^(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?$/;
  const clearRegex = /^(CLR|SKC)$/;
  
  for (const part of parts) {
      if (clearRegex.test(part)) {
          data.clouds.push({ type: part as any, altitudeFeet: null });
      } else {
          const match = part.match(cloudRegex);
          if (match) {
              data.clouds.push({
                  type: match[1] as any,
                  altitudeFeet: parseInt(match[2], 10) * 100,
                  modifier: match[3] as any,
              });
          }
      }
  }

  // 5. Temperature / Dewpoint (e.g. 15/10, M02/M05)
  const tempRegex = /^(M)?(\d{2})\/(M)?(\d{2})$/;
  const tempPart = parts.find(p => tempRegex.test(p));
  if (tempPart) {
      const match = tempPart.match(tempRegex);
      if (match) {
          const tIsMinus = match[1] === 'M';
          const dIsMinus = match[3] === 'M';
          data.temperatureCelsius = parseInt(match[2], 10) * (tIsMinus ? -1 : 1);
          data.dewPointCelsius = parseInt(match[4], 10) * (dIsMinus ? -1 : 1);
      }
  }

  // 6. Altimeter / Pressure (e.g. A2992 or Q1013)
  const altRegexA = /^A(\d{4})$/;
  const altRegexQ = /^Q(\d{4})$/;
  
  const altPartA = parts.find(p => altRegexA.test(p));
  const altPartQ = parts.find(p => altRegexQ.test(p));
  
  if (altPartA) {
      const inhg = parseInt(altPartA.match(altRegexA)![1], 10) / 100;
      data.altimeter = { inhg, hpa: inhg * 33.8639 };
  } else if (altPartQ) {
      const hpa = parseInt(altPartQ.match(altRegexQ)![1], 10);
      data.altimeter = { hpa, inhg: hpa / 33.8639 };
  }

  // Determine Flight Rules Category (VFR, MVFR, IFR, LIFR)
  // Logic standard: 
  // VFR: Ceiling > 3000ft AND Vis > 5SM
  // MVFR: Ceiling 1000-3000ft OR Vis 3-5SM
  // IFR: Ceiling 500-1000ft OR Vis 1-3SM
  // LIFR: Ceiling < 500ft OR Vis < 1SM
  let ceiling = 100000;
  const ceilingLayers = data.clouds.filter(c => c.type === 'BKN' || c.type === 'OVC' || c.type === 'VV');
  if (ceilingLayers.length > 0) {
      ceiling = Math.min(...ceilingLayers.map(c => c.altitudeFeet || 0));
  }

  const vis = data.visibility.statuteMiles ?? 10;

  if (ceiling < 500 || vis < 1) data.flightCategory = 'LIFR';
  else if (ceiling < 1000 || vis < 3) data.flightCategory = 'IFR';
  else if (ceiling <= 3000 || vis <= 5) data.flightCategory = 'MVFR';
  else data.flightCategory = 'VFR';

  return data;
};
