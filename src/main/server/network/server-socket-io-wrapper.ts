import { fromEvent, Subject } from 'rxjs';
import { SharedConfig } from '../../shared/config/shared-config';
import Http from 'http';
import { Server, Socket } from 'socket.io';
import { SharedSocketIoWrapper } from '../../shared/network/shared-socket-io-wrapper';

export class ServerSocketIoWrapper extends SharedSocketIoWrapper {
   private readonly connectedSubject = new Subject<Socket>();
   readonly connected$ = this.connectedSubject.pipe();

   private readonly httpServer: Http.Server;
   private readonly socketServer: Server;

   constructor() {
      super();
      this.httpServer = Http.createServer();
      this.socketServer = new Server(this.httpServer, {
         cors: true,
      });
      fromEvent(this.socketServer, ServerSocketIoWrapper.EVENT_CONNECTED).subscribe((socket: Socket) => {
         this.connectedSubject.next(socket);
      });
      this.httpServer.listen(SharedConfig.SERVER_PORT);
   }
}
