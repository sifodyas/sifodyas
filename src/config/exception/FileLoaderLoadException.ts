import { BaseException } from '../../core/BaseException';

/**
 * Exception class for when a resource cannot be loaded or imported.
 */
export class FileLoaderLoadException extends BaseException {
    constructor(message?: string) {
        super(message);
    }
}
