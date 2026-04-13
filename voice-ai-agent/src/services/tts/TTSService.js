import { ElevenLabsClient } from 'elevenlabs';
import config from '../../config/env.js';

/**
 * Text-to-Speech Service using ElevenLabs
 */
export class TTSService {
  constructor() {
    this.client = new ElevenLabsClient({ apiKey: config.elevenlabs.apiKey });
    this.voiceId = config.elevenlabs.voiceId;
  }

  /**
   * Convert text to speech
   * @param {string} text - Text to convert
   * @param {Object} options - TTS options
   * @returns {Promise<Buffer>} Audio buffer
   */
  async textToSpeech(text, options = {}) {
    const ttsOptions = {
      voice: this.voiceId,
      model_id: 'eleven_multilingual_v2',
      output_format: 'mp3_44100_128',
      ...options,
    };

    try {
      const response = await this.client.textToSpeech.convert(
        this.voiceId,
        {
          text,
          model_id: ttsOptions.model_id,
          output_format: ttsOptions.output_format,
        }
      );

      // Convert stream to buffer
      const chunks = [];
      for await (const chunk of response) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('[TTSService] Error:', error);
      throw error;
    }
  }

  /**
   * Stream text to speech
   * @param {string} text - Text to convert
   * @param {Object} options - TTS options
   * @returns {AsyncGenerator} Audio chunks
   */
  async *streamTextToSpeech(text, options = {}) {
    const ttsOptions = {
      voice: this.voiceId,
      model_id: 'eleven_multilingual_v2',
      output_format: 'mp3_44100_128',
      ...options,
    };

    try {
      const response = await this.client.textToSpeech.convert(
        this.voiceId,
        {
          text,
          model_id: ttsOptions.model_id,
          output_format: ttsOptions.output_format,
        }
      );

      for await (const chunk of response) {
        yield chunk;
      }
    } catch (error) {
      console.error('[TTSService] Streaming error:', error);
      throw error;
    }
  }

  /**
   * Get available voices
   */
  async getVoices() {
    try {
      const response = await this.client.voices.getAll();
      return response.voices;
    } catch (error) {
      console.error('[TTSService] Error getting voices:', error);
      throw error;
    }
  }

  /**
   * Set voice ID
   */
  setVoiceId(voiceId) {
    this.voiceId = voiceId;
  }

  /**
   * Get current voice ID
   */
  getVoiceId() {
    return this.voiceId;
  }
}
