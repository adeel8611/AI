import { v4 as uuidv4 } from 'uuid';

/**
 * Conversation Model - Manages call session state
 */
export class Conversation {
  constructor(callSid, callerNumber) {
    this.id = uuidv4();
    this.callSid = callSid;
    this.callerNumber = callerNumber;
    this.messages = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.status = 'active';
    this.metadata = {};
  }

  addMessage(role, content, timestamp = new Date()) {
    this.messages.push({
      role,
      content,
      timestamp,
      id: uuidv4(),
    });
    this.updatedAt = timestamp;
  }

  getMessages(role = null) {
    if (role) {
      return this.messages.filter(m => m.role === role);
    }
    return this.messages;
  }

  getLastMessage() {
    return this.messages[this.messages.length - 1];
  }

  getConversationHistory(limit = 10) {
    return this.messages.slice(-limit);
  }

  updateStatus(status) {
    this.status = status;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      callSid: this.callSid,
      callerNumber: this.callerNumber,
      messages: this.messages,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata,
    };
  }
}
