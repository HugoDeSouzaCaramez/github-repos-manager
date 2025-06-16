import { OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
})
export class NotifyGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  
  private isInitialized = false;

  onModuleInit() {
    this.isInitialized = true;
    console.log('WebSocket Gateway inicializado');
  }

  notifyJobCompletion(jobId: number) {
    if (!this.isInitialized || !this.server) {
      console.warn('WebSocket não inicializado. Notificação ignorada.');
      return;
    }
    this.server.emit('jobCompleted', { jobId });
  }
}
