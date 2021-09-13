import * as C from '@xoid/core';
import * as M from '@xoid/model';

export * from '@xoid/core';
export * from '@xoid/model';
var x = Object.assign(M.model.bind({}), C, M);
export default x;
