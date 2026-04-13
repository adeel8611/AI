import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
    wsPort: parseInt(process.env.WS_PORT) || 3001,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY,
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
  },
};

// Validate required config
const required = [
  'deepgram.apiKey',
  'elevenlabs.apiKey',
  'openai.apiKey',
];

for (const key of required) {
  const value = key.split('.').reduce((obj, k) => obj?.[k], config);
  if (!value || value.includes('your_')) {
    console.warn(`Warning: ${key} is not configured properly`);
  }
}

export default config;
