// src/utils/WebSocketClient.js

class WebSocketClient {
    constructor(url) {
      this.client = new WebSocket(url);
  
      this.client.onopen = () => {
        console.log('WebSocket connection opened');
      };
  
      this.client.onmessage = (event) => {
        console.log('Message received:', event.data);
      };
  
      this.client.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
  
      this.client.onclose = () => {
        console.log('WebSocket connection closed');
      };
    }
  
    sendMessage(message) {
      if (this.client.readyState === WebSocket.OPEN) {
        this.client.send(message);
      } else {
        console.error('WebSocket is not open. Cannot send message.');
      }
    }
  }
  
  export default WebSocketClient;
  