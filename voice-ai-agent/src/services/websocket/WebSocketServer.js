import { WebSocketServer as WSServer } from 'ws';
import url from 'url';

/**
 * WebSocket Server - Handles real-time audio streaming
 */
export class WebSocketServer {
  constructor(webSocketController) {
    this.controller = webSocketController;
    this.wss = null;
  }

  /**
   * Initialize the WebSocket server
   */
  initialize(server) {
    this.wss = new WSServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      const { query } = url.parse(req.url, true);
      req.query = query;
      this.controller.handleConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      console.error('[WebSocketServer] Error:', error);
    });

    console.log(`[WebSocketServer] Initialized on path /ws`);

    return this.wss;
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message) {
    if (!this.wss) return;

    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // OPEN
        client.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Get connected client count
   */
  getClientCount() {
    return this.wss?.clients?.size || 0;
  }
}
