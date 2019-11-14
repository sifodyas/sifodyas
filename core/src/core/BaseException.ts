/**
 * Base Exception
 */
export abstract class BaseException extends Error {
    public baseClass = 'BaseException';

    constructor(message?: string) {
        super(message);
        this.baseClass = new.target.name;
    }
}
