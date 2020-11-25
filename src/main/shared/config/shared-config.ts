import { CommonSharedConfig } from './common-shared-config';

export class SharedConfig extends CommonSharedConfig {
   static readonly RANDOM_START_POSITION: boolean = false;
   static readonly MOON_PERCENTAGE_TO_FINISH: number = 0.99;
}
