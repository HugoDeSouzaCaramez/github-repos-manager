import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

export class NotifyGateway {
  @WebSocketServer()
  server: Server;

  notifyJobCompletion(jobId: number) {
    this.server.emit('jobCompleted', { jobId });
  }
}
