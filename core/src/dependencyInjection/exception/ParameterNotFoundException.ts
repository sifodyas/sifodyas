import { InvalidArgumentException } from './InvalidArgumentException';

/**
 * This exception is thrown when a non-existent parameter is used.
 */
export class ParameterNotFoundException extends InvalidArgumentException {
    public baseClass = 'ParameterNotFoundException';
}
