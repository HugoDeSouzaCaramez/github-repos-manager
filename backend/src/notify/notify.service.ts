import { Injectable } from '@nestjs/common';
import { NotifyGateway } from './notify.gateway';

@Injectable()
export class NotifyService {
  constructor(private readonly notifyGateway: NotifyGateway) {}

  notifyJobCompletion(jobId: number) {
    this.notifyGateway.notifyJobCompletion(jobId);
  }
}
