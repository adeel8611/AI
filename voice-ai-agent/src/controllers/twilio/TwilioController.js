import twilio from 'twilio';
import config from '../../config/env.js';

/**
 * Twilio Controller - Handles incoming calls and returns TwiML
 */
export class TwilioController {
  constructor() {
    // Only initialize client if credentials are properly set
    if (config.twilio.accountSid && !config.twilio.accountSid.includes('your_')) {
      this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    } else {
      this.client = null;
      console.warn('[TwilioController] Twilio not configured - running in demo mode');
    }
  }

  /**
   * Handle incoming call - return TwiML to connect to WebSocket
   */
  handleIncomingCall(req, res) {
    const { CallSid, Caller, From } = req.body || {};

    console.log(`[Twilio] Incoming call: ${CallSid} from ${From || Caller}`);

    // Create TwiML response to connect call to WebSocket
    const twiml = new twilio.twiml.VoiceResponse();

    // Connect to WebSocket
    const connect = twiml.connect();
    connect.stream({
      url: `wss://${req.headers.host}/ws?callSid=${CallSid}&callerNumber=${From || Caller}`,
    });

    res.type('text/xml');
    res.send(twiml.toString());

    console.log(`[Twilio] Connected ${CallSid} to WebSocket`);
  }

  /**
   * Handle call status updates
   */
  handleCallStatus(req, res) {
    const { CallSid, CallStatus, From } = req.body || {};

    console.log(`[Twilio] Call ${CallSid} status: ${CallStatus}`);

    res.status(200).send('OK');
  }

  /**
   * Make an outbound call
   */
  async makeOutboundCall(toNumber, options = {}) {
    try {
      const call = await this.client.calls.create({
        to: toNumber,
        from: config.twilio.phoneNumber,
        url: `${options.webhookUrl || 'https://your-domain.com'}/twilio/incoming`,
        twiml: options.twiml,
        ...options,
      });

      console.log(`[Twilio] Outbound call initiated: ${call.sid} to ${toNumber}`);
      return call;
    } catch (error) {
      console.error('[Twilio] Outbound call error:', error);
      throw error;
    }
  }

  /**
   * Get call information
   */
  async getCallInfo(callSid) {
    try {
      const call = await this.client.calls(callSid).fetch();
      return call;
    } catch (error) {
      console.error('[Twilio] Error fetching call info:', error);
      throw error;
    }
  }

  /**
   * Hang up a call
   */
  async hangupCall(callSid) {
    try {
      await this.client.calls(callSid).update({ status: 'completed' });
      console.log(`[Twilio] Call ${callSid} terminated`);
    } catch (error) {
      console.error('[Twilio] Error hanging up call:', error);
      throw error;
    }
  }
}
