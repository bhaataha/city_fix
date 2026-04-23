import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this for production
  },
})
export class IssuesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(IssuesGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Clients can join a room for a specific tenant or issue
  @SubscribeMessage('joinTenant')
  handleJoinTenant(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tenant: string },
  ) {
    if (data.tenant) {
      client.join(`tenant_${data.tenant}`);
      this.logger.log(`Client ${client.id} joined tenant_${data.tenant}`);
    }
  }

  @SubscribeMessage('joinIssue')
  handleJoinIssue(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { issueId: string },
  ) {
    if (data.issueId) {
      client.join(`issue_${data.issueId}`);
      this.logger.log(`Client ${client.id} joined issue_${data.issueId}`);
    }
  }

  // Emit status change to tenant and specific issue rooms
  notifyIssueStatusChange(tenant: string, issueId: string, status: string, issue: any) {
    this.server.to(`tenant_${tenant}`).emit('issueStatusChanged', { issueId, status, issue });
    this.server.to(`issue_${issueId}`).emit('statusUpdate', { status, issue });
  }

  // Emit new issue created to tenant room (e.g. for dashboard)
  notifyIssueCreated(tenant: string, issue: any) {
    this.server.to(`tenant_${tenant}`).emit('issueCreated', { issue });
  }
}
