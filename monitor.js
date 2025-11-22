import Api from 'axios';
import { getTokenDetail } from './news.js';

const API_URL = 'https://api.gateio.ws/api/v4/futures/usdt/contracts';

// Stores names already processed
let knownTokens = new Set();

export const initTokenMonitor = async () => {
  console.log('🔍 Token monitor started (every 30 seconds)...');

  // First initial run
  await checkForNewTokens();

  // Run every 30 seconds
  setInterval(checkForNewTokens, 30 * 1000);
};

const checkForNewTokens = async () => {
  try {
    const { data } = await Api.get(API_URL);
    const now = Date.now();

    for (const token of data) {
      const { name, create_time } = token;

      // Only handle new ones
      if (!knownTokens.has(name)) {

        const ageMinutes = (now / 1000 - create_time) / 60;

        // NEW TOKEN DETECTED
        if (ageMinutes <= 1) { //mins
          const symbol = name.split("_")[0];
          console.log(`🆕 NEW TOKEN LISTED: ${name} (${symbol}) (${ageMinutes.toFixed(1)} min old)`);
          await getTokenDetail(symbol, name);
        }

        // Mark as seen AFTER
        knownTokens.add(name);
      }
    }

    console.log(`✅ ${getTime()} - Checked ${data.length} tokens. Known: ${knownTokens.size}`);

  } catch (err) {
    console.error('❌ Token monitor error:', err.message);
  }
};

const getTime = () => {
  const d = new Date();
  return d.toLocaleTimeString('en-GB', { hour12: false });
};
