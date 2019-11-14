import { BaseException } from '../../core/BaseException';

export class RuntimeException extends BaseException {
    constructor(message?: string) {
        super(message);
    }
}
