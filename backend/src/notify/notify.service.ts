import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
export class NotifyService {
  @WebSocketServer()
  server: Server;

  notifyJobCompletion(jobId: number) {
    if (this.server) {
      this.server.emit('jobCompleted', { jobId });
    }
  }
}
