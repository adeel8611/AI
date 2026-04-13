/**
 * STT Controller - Handles Speech-to-Text operations
 */
export class STTController {
  constructor(sttService) {
    this.sttService = sttService;
  }

  /**
   * Handle transcription request
   */
  async transcribe(req, res) {
    try {
      if (!req.body || !req.body.audio) {
        return res.status(400).json({ error: 'Audio data is required' });
      }

      const { audio, options } = req.body;
      const transcript = await this.sttService.transcribeAudio(
        Buffer.from(audio, 'base64'),
        options
      );

      res.json({
        success: true,
        data: { transcript },
      });
    } catch (error) {
      console.error('[STTController] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
