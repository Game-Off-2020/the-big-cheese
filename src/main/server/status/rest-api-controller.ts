import { Singleton } from 'typescript-ioc';
import { ServerConfig } from '../config/server-config';
import { Subject } from 'rxjs';
import express from 'express';
import { ServerStatus } from './server-status-model';

@Singleton
export class RestApiController {
   private readonly app;

   private readonly statusGetSubject = new Subject<(response: ServerStatus) => void>();
   readonly statusGet$ = this.statusGetSubject.asObservable();

   constructor() {
      this.app = express();
      this.app.listen(ServerConfig.SERVER_API_PORT, () => {
         console.log(`REST API is listening on port ${ServerConfig.SERVER_API_PORT}`);
      });
      this.initGetStatus();
   }

   private initGetStatus(): void {
      this.app.get('/status', (req, res) => {
         this.statusGetSubject.next((response) => res.json(response));
      });
   }
}
