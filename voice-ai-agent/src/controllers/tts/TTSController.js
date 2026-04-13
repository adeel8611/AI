/**
 * TTS Controller - Handles Text-to-Speech operations
 */
export class TTSController {
  constructor(ttsService) {
    this.ttsService = ttsService;
  }

  /**
   * Handle text-to-speech request
   */
  async synthesize(req, res) {
    try {
      const { text, options } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const audioBuffer = await this.ttsService.textToSpeech(text, options);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.length);
      res.send(audioBuffer);
    } catch (error) {
      console.error('[TTSController] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get available voices
   */
  async getVoices(req, res) {
    try {
      const voices = await this.ttsService.getVoices();

      res.json({
        success: true,
        data: voices,
        count: voices.length,
      });
    } catch (error) {
      console.error('[TTSController] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
