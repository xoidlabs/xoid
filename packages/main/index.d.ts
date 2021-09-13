import * as C from '@xoid/core';
import * as M from '@xoid/model';

export * from '@xoid/core';
export * from '@xoid/model';
declare const x: typeof M.model & typeof C & typeof M;
export default x;
