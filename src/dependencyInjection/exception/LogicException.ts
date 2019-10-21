import { BaseException } from '../../core/BaseException';

export class LogicException extends BaseException {
    constructor(message?: string) {
        super(message);
    }
}
