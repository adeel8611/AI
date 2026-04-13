/**
 * LLM Controller - Handles LLM operations
 */
export class LLMController {
  constructor(llmService) {
    this.llmService = llmService;
  }

  /**
   * Handle chat request
   */
  async chat(req, res) {
    try {
      const { message, history, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await this.llmService.generateResponse(
        message,
        history || [],
        context
      );

      res.json({
        success: true,
        data: { response },
      });
    } catch (error) {
      console.error('[LLMController] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Set system prompt
   */
  async setSystemPrompt(req, res) {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      this.llmService.setSystemPrompt(prompt);

      res.json({
        success: true,
        message: 'System prompt updated',
      });
    } catch (error) {
      console.error('[LLMController] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
