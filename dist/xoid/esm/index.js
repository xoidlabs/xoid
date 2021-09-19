import * as C from '@xoid/core';
export * from '@xoid/core';
import * as M from '@xoid/model';
import { model } from '@xoid/model';
export * from '@xoid/model';
import * as R from '@xoid/ready';
export * from '@xoid/ready';

var x = Object.assign(model.bind({}), C, M, R);

export default x;
