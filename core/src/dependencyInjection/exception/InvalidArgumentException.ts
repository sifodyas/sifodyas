import { BaseException } from '../../core/BaseException';

export class InvalidArgumentException extends BaseException {
    constructor(message?: string) {
        super(message);
    }
}
