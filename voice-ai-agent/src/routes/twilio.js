import express from 'express';

const router = express.Router();

/**
 * Setup Twilio webhook routes
 * @param {TwilioController} twilioController
 */
export function setupTwilioRoutes(twilioController) {
  // Handle incoming calls
  router.post('/incoming', (req, res) => twilioController.handleIncomingCall(req, res));

  // Handle call status updates
  router.post('/status', (req, res) => twilioController.handleCallStatus(req, res));

  return router;
}
