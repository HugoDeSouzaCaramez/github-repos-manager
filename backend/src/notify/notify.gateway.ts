import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class NotifyGateway {
  @WebSocketServer()
  server: Server;

  notifyJobCompletion(jobId: number) {
    this.server.emit('jobCompleted', { jobId });
  }
}
