import { IContainer as IPsrContainer } from '../psr/container';

export enum ContainerError {
    RUNTIME_EXCEPTION_ON_INVALID_REFERENCE,
    EXCEPTION_ON_INVALID_REFERENCE,
    NULL_ON_INVALID_REFERENCE,
    IGNORE_ON_INVALID_REFERENCE,
    IGNORE_ON_UNINITIALIZED_REFERENCE,
}

/**
 * IContainer is the interface implemented by service container classes.
 */
export interface IContainer extends IPsrContainer {
    /**
     * Sets a service.
     *
     * @param id      The service identifier
     * @param service The service instance
     */
    set(id: string, service: unknown): void;

    /**
     * Gets a service.
     *
     * @param id              The service identifier
     * @param invalidBehavior The behavior when the service does not exist (should by default be ContainerError.EXCEPTION_ON_INVALID_REFERENCE)
     *
     * @return object The associated service
     *
     * @throws {ServiceCircularReferenceException} When a circular reference is detected
     * @throws {ServiceNotFoundException}          When the service is not defined
     *
     * @see Reference
     */
    get(id: string, invalidBehavior?: ContainerError): unknown;

    /**
     * Check for whether or not a service has been initialized.
     */
    initialized(id: string): boolean;

    /**
     * Gets a parameter.
     *
     * @throws {InvalidArgumentException} if the parameter is not defined
     * @async
     */
    getParameter(name: string): Promise<unknown>;

    /**
     * Checks if a parameter exists.
     */
    hasParameter(name: string): boolean;

    /**
     * Sets a parameter.
     */
    setParameter(name: string, value: unknown);
}
