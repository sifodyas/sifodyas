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
    boot(): Promise<any>;

    /**
     * Shutdowns the Kernel.
     * @async
     */
    shutdown(): Promise<any>;

    /**
     * Unregister an array of bundles.
     *
     * @param bundleNames The list of bundles to unregister.
     */
    unregisterBundles(bundleNames: string[]): void;

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
     * Return a Bundle and optionally its descendants by its name.
     *
     * @param name Bundle name.
     * @param first Whether to return the first bundle only or together with its descendants.
     * @returns A Bundle instance.
     * @throws InvalidArgumentException when the bundle is not enabled.
     */
    getBundle(name: string, first: boolean): BundleExtended | BundleExtended[];

    /**
     * Gets the name of the kernel.
     *
     * @returns The kernel name.
     */
    getName(): string;
}
