import { v4 as uuidv4 } from 'uuid';

/**
 * Transcript Model - Stores transcribed audio segments
 */
export class Transcript {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.conversationId = data.conversationId;
    this.text = data.text;
    this.isFinal = data.isFinal || false;
    this.confidence = data.confidence || 0;
    this.startTime = data.startTime || 0;
    this.endTime = data.endTime || 0;
    this.speaker = data.speaker || 'caller';
    this.timestamp = data.timestamp || new Date();
  }

  finalize() {
    this.isFinal = true;
  }

  toJSON() {
    return {
      id: this.id,
      conversationId: this.conversationId,
      text: this.text,
      isFinal: this.isFinal,
      confidence: this.confidence,
      startTime: this.startTime,
      endTime: this.endTime,
      speaker: this.speaker,
      timestamp: this.timestamp,
    };
  }
}
