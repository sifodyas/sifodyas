import { ILoader } from '../config/ILoader';
import { BundleExtended } from './bundle/Bundle';

/**
 * The Kernel is the heart of the Sifodyas system.
 *
 * It manages an environment made of bundles.
 */
export interface IKernel {
    /**
     * Boot the current Kernel.
     * @async
     */
    boot(): Promise<void>;

    /**
     * Shutdowns the Kernel.
     * @async
     */
    shutdown(): Promise<void>;

    /**
     * Loads the container configuration.
     *
     * @param loader A ILoader instance.
     */
    registerContainerConfiguration(loader: ILoader): void;

    /**
     * Return an array of bundles to register.
     *
     * @returns An array of bundle instances.
     */
    registerBundles(): BundleExtended[];

    /**
     * Unregister an array of bundles.
     *
     * @param bundleNames The list of bundles to unregister.
     */
    unregisterBundles(bundleNames: string[]): void;

    /**
     * Return a Bundle by its name.
     *
     * @param name Bundle name.
     * @returns A Bundle instance.
     * @throws InvalidArgumentException when the bundle is not enabled.
     */
    getBundle(name: string): BundleExtended;

    /**
     * Gets the name of the kernel.
     *
     * @returns The kernel name.
     */
    getName(): string;
}
