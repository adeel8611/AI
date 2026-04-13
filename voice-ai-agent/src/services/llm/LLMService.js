import OpenAI from 'openai';
import config from '../../config/env.js';

/**
 * LLM Service using OpenAI
 */
export class LLMService {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.model = config.openai.model;
    this.systemPrompt = this.getDefaultSystemPrompt();
  }

  /**
   * Get default system prompt
   */
  getDefaultSystemPrompt() {
    return `You are a helpful and friendly AI voice assistant for a customer service line.

Your role:
- Be concise and conversational (keep responses under 50 words when possible)
- Speak naturally as if having a phone conversation
- Use simple language appropriate for voice communication
- Be polite and empathetic
- If you don't know an answer, be honest and offer to connect to a human agent
- Avoid using markdown, special characters, or emojis in your responses

Response style:
- Use contractions (e.g., "I'm" instead of "I am")
- Keep sentences short and clear
- Use natural transitions between topics
- Ask follow-up questions when appropriate`;
  }

  /**
   * Set custom system prompt
   */
  setSystemPrompt(prompt) {
    this.systemPrompt = prompt;
  }

  /**
   * Generate a response
   * @param {string} userMessage - User's message
   * @param {Array} conversationHistory - Previous messages
   * @param {string} context - RAG context
   * @returns {Promise<string>} Generated response
   */
  async generateResponse(userMessage, conversationHistory = [], context = null) {
    try {
      const messages = [
        { role: 'system', content: this.systemPrompt },
      ];

      // Add context if available
      if (context) {
        messages[0].content += `\n\nHere is some relevant information to help answer:\n${context}`;
      }

      // Add conversation history
      messages.push(...conversationHistory.slice(-10)); // Keep last 10 messages

      // Add current message
      messages.push({ role: 'user', content: userMessage });

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 200,
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
      });

      return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('[LLMService] Error:', error);
      throw error;
    }
  }

  /**
   * Generate response with streaming
   * @param {string} userMessage - User's message
   * @param {Array} conversationHistory - Previous messages
   * @param {string} context - RAG context
   * @param {Function} onChunk - Callback for each chunk
   */
  async *generateResponseStream(userMessage, conversationHistory = [], context = null) {
    try {
      const messages = [
        { role: 'system', content: this.systemPrompt },
      ];

      if (context) {
        messages[0].content += `\n\nHere is some relevant information to help answer:\n${context}`;
      }

      messages.push(...conversationHistory.slice(-10));
      messages.push({ role: 'user', content: userMessage });

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 200,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('[LLMService] Streaming error:', error);
      throw error;
    }
  }

  /**
   * Format message for conversation history
   */
  static createMessage(role, content) {
    return { role, content };
  }
}
