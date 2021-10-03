import * as C from '@xoid/core';
import * as M from '@xoid/model';
import * as R from '@xoid/ready';

export * from '@xoid/core';
export * from '@xoid/model';
export * from '@xoid/ready';
var x = Object.assign(M.model.bind({}), C, M, R);
export default x;
