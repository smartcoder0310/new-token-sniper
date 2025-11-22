import axios from 'axios';

const channelId = process.env.channel;
const TG_URL = process.env.url;

export async function postToTelegram(text) {
  try {
    await axios.post(TG_URL, {
      chat_id: channelId,
      text,
      disable_web_page_preview: true,
    });
    console.log('✅ Posted to Telegram');
  } catch (err) {
    console.log(err);
    console.error('❌ Telegram post failed:', err.message);
  }
}
