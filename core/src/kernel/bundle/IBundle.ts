import { Container } from '../../dependencyInjection/Container';
import { IExtension } from '../../dependencyInjection/extension/IExtension';

/**
 * IBundle.
 */
export interface IBundle {
    /**
     * Boot the Bundle.
     *
     * @async
     */
    boot(): Promise<any>;

    /**
     * Shutdown the Bundle.
     *
     * @async
     */
    shutdown(): Promise<any>;

    /**
     * Build the Bundle.
     */
    build(container: Container): void;

    /**
     * Returns the bundle name.
     */
    getName(): string;

    /**
     * Returns the bundle namespace.
     *
     * @returns The bundle namespace.
     */
    getNamespace(): string;

    /**
     * Returns the container extension.
     */
    getContainerExtension(): IExtension;

    /**
     * Define is this bundle is part of the core of an application.
     * This imply that it will be built and booted synchronously.
     *
     * In consequences, the loading performance of the app using this bundle will be reduced.
     *
     * If a Core bundle has dependencies, those will became Core as well.
     */
    isCore(): boolean;
}
