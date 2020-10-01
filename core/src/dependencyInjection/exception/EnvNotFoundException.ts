import { InvalidArgumentException } from './InvalidArgumentException';

/**
 * This exception is thrown when an environment variable is not found.
 */
export class EnvNotFoundException extends InvalidArgumentException {
    public baseClass = 'EnvNotFoundException';

    constructor(name: string) {
        super(`Environment variable not found: "${name}".`);
    }
}
