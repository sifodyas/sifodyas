import { Container } from './Container';
import { ContainerError } from './IContainer';

/**
 * Reference represents a service reference.
 */
export class Reference {
    private id: string;
    private invalidBehavior: ContainerError;
    private strict: boolean; // tslint:disable-line:no-unused-variable

    /**
     * @param id The service identifier.
     * @param invalidBehavior The behavior when the service does not exist.
     * @param strict Strict ref or not
     *
     * @see Container
     */
    public constructor(id: string, invalidBehavior = ContainerError.EXCEPTION_ON_INVALID_REFERENCE, strict = true) {
        this.id = id.toLowerCase();
        this.invalidBehavior = invalidBehavior;
        this.strict = strict;
    }

    /**
     * @returns The service identifier.
     */
    public toString(): string {
        return this.id;
    }

    /**
     * Returns the behavior to be used when the service does not exist.
     */
    public getInvalidBehavior(): number {
        return this.invalidBehavior;
    }
}
