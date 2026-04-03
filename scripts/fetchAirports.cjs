const https = require('https');
const fs = require('fs');
const path = require('path');

const URL = 'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json';
const OUTPUT_PATH = path.join(__dirname, '../src/data/airports.json');

// Create data dir if it doesn't exist
const dir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

console.log('Downloading global airports JSON...');

https.get(URL, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      console.log('Download complete. Parsing...');
      const allAirports = JSON.parse(body);
      
      const filtered = {};
      let count = 0;
      
      // Filter logic: Keep if country is India (IN) OR has an IATA code (commercial globally)
      for (const key in allAirports) {
        const port = allAirports[key];
        
        if (!port.icao) continue;

        if (port.country === 'IN' || (port.iata && port.iata !== '')) {
          filtered[port.icao] = {
            icao: port.icao,
            iata: port.iata || undefined,
            name: port.name,
            city: port.city,
            country: port.country,
            lat: port.lat,
            lon: port.lon
          };
          count++;
        }
      }
      
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(filtered));
      console.log(`Successfully parsed and saved ${count} airports to src/data/airports.json`);
    } catch (e) {
      console.error('Error parsing JSON', e);
      process.exit(1);
    }
  });
}).on('error', (e) => {
  console.error('Network Error', e);
  process.exit(1);
});
