import { ContainerError } from './IContainer';

/**
 * Reference represents a service reference.
 */
export class Reference {
    private id: string;
    private invalidBehavior: ContainerError;

    /**
     * @param id The service identifier.
     * @param invalidBehavior The behavior when the service does not exist.
     * @param strict Strict ref or not
     *
     * @see Container
     */
    constructor(id: string, invalidBehavior = ContainerError.EXCEPTION_ON_INVALID_REFERENCE) {
        this.id = id.toLowerCase();
        this.invalidBehavior = invalidBehavior;
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
