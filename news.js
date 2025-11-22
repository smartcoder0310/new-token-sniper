import axios from 'axios';
import { postToTelegram } from './telegram.js';

export async function fetchCoingeckoInfo(symbol) {
  try {
    const { data: all } = await axios.get(
      'https://api.coingecko.com/api/v3/coins/list'
    );

    const token = all.find(
      t => t.symbol.toLowerCase() === symbol.toLowerCase()
    );

    if (!token) {
      console.log(`⚠️ Token ${symbol} not found on Coingecko list`);
      return null;
    }

    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${token.id}`
    );

    console.log(data);

    return {
      id: token.id,
      name: data.name,
      contract: data.contract_address || 'N/A',
      symbol: data.symbol.toUpperCase(),
      description:
        data.description?.en || 'No description available.',
      homepage: data.links?.homepage?.[0] || null,
      blockchainLink: data.links?.blockchain_site?.[0] || null,
      twitter: data.links?.twitter_screen_name
        ? `https://twitter.com/${data.links.twitter_screen_name}`
        : null,
      coingecko_url: `https://www.coingecko.com/en/coins/${token.id}`,
      launch_date: data.genesis_date || null,

      price_usd: data.market_data?.current_price?.usd ?? null,
      market_cap: data.market_data?.market_cap?.usd ?? null,
      volume_24h: data.market_data?.total_volume?.usd ?? null,
      total_supply: data.market_data?.total_supply ?? null,
      circulating_supply: data.market_data?.circulating_supply ?? null,

      voteUp: data.sentiment_votes_up_percentage ?? null,
      voteDown: data.sentiment_votes_down_percentage ?? null,
    };
  } catch (err) {
    console.error('❌ Coingecko fetch failed:', err.message);
    return null;
  }
}
 
export function formatTokenAnnouncement(token, id) {
  const formatNum = n =>
    !n
      ? 'N/A'
      : n >= 1
      ? Number(n).toLocaleString()
      : Number(n).toExponential(2);

  return `
🚀 *NEW TOKEN DETECTED!*
🪙 *Name:* ${token.name} (${token.symbol})
📘 *Description:* ${token.description}

🧾 *Contract Address:* ${token.contract}
💵 *Price:* $${formatNum(token.price_usd)}
📊 *24h Volume:* $${formatNum(token.volume_24h)}
📈 *Market Cap:* $${formatNum(token.market_cap)}

✨ *Sentiment:* 👍 ${token.voteUp ?? 'N/A'}% | 👎 ${token.voteDown ?? 'N/A'}%

🌐 *Website:* ${token.homepage || 'N/A'}
🐦 *Twitter:* ${token.twitter || 'N/A'}

🧾 *Supply:* ${formatNum(token.circulating_supply)} / ${formatNum(
    token.total_supply
  )}

🌐 *Gate.io Link:*
https://www.gate.com/futures/USDT/${id}

📊 *Coingecko:* ${token.coingecko_url}

#Crypto #NewListing #${token.symbol}
  `;
}

export async function getTokenDetail(tokenSymbol, id) {
  console.log(tokenSymbol, id);
  const cg = await fetchCoingeckoInfo(tokenSymbol);

  if (!cg) {
    console.log(`⚠️ No token data found for ${tokenSymbol}`);
    return;
  }

  const message = formatTokenAnnouncement(cg, id);
  await postToTelegram(message);
}