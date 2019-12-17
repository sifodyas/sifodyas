import { KernelParametersKeyType } from '..';
import { Loader } from '../config';
import { DelegatingLoader } from '../config/DelegatingLoader';
import { ILoader } from '../config/ILoader';
import { JsonLoader } from '../config/JsonLoader';
import { LoaderResolver } from '../config/LoaderResolver';
import { Core } from '../core/Core';
import { Compiler, CompilerPassType, MergeExtensionConfigurationPass } from '../dependencyInjection/compiler';
import { Container } from '../dependencyInjection/Container';
import { InvalidArgumentException } from '../dependencyInjection/exception/InvalidArgumentException';
import { LogicException } from '../dependencyInjection/exception/LogicException';
import { BundleExtended } from './bundle/Bundle';
import { IKernel } from './IKernel';

declare const VERSION: string;
declare const VERSION_ID: number;
declare const MAJOR_VERSION: number;
declare const MINOR_VERSION: number;
declare const RELEASE_VERSION: number;
declare const EXTRA_VERSION: string;

/**
 * The Kernel is the heart of the Sifodyas system.
 *
 * It manages an environment made of bundles.
 */
export abstract class Kernel implements IKernel {
    public static VERSION = VERSION;
    public static VERSION_ID = VERSION_ID;
    public static MAJOR_VERSION = MAJOR_VERSION;
    public static MINOR_VERSION = MINOR_VERSION;
    public static RELEASE_VERSION = RELEASE_VERSION;
    public static EXTRA_VERSION = EXTRA_VERSION;

    private syncBundles: string[] = [];
    private asyncBundles: string[] = [];

    protected bundles: Map<string, BundleExtended> = new Map();

    protected name: string;
    protected booted = false;
    protected container: Container;

    protected loaders: Array<typeof Loader> = [JsonLoader];

    constructor(protected environment: string, protected debug: boolean) {}

    /**
     * Returns the path based from the script url where the Kernel is running.
     *
     * @returns The path
     */
    public static getBasePath() {
        return `/${Core.getBasePath()}`;
    }

    /**
     * Initializes the service container.
     * @async
     */
    protected async initializeContainer() {
        this.container = await this.buildContainer();
        await this.container.compile();
        this.container.set('kernel', this);
    }

    /**
     * Initializes the data structures related to the bundle management.
     *
     * The bundles property maps a bundle name to the bundle instance.
     *
     * @throws LogicException if two bundles share a common name.
     */
    protected initializeBundles() {
        this.bundles = new Map();
        this.syncBundles = [];
        this.asyncBundles = [];

        for (const bundle of this.registerBundles()) {
            const name = bundle.getName();
            if (this.bundles.has(name)) {
                throw new LogicException(`Trying to register two Bundles with the same name "${name}".`);
            }
            this.bundles.set(name, bundle);

            if (bundle.isCore()) {
                this.syncBundles.push(name);
            } else {
                this.asyncBundles.push(name);
            }
        }
    }

    /**
     * Returns the kernel parameters.
     *
     * @returns A map of kernel parameters.
     */
    protected getKernelParameters(): Map<keyof KernelParametersKeyType, unknown> {
        // TODO: infered ObjectMap for union type
        const bundles: string[] = [];
        const coreBundles: string[] = [];
        this.bundles.forEach(bundle => {
            bundles.push(bundle.getName());
            if (bundle.isCore()) {
                coreBundles.push(bundle.getName());
            }
        });

        const parameters: Map<keyof KernelParametersKeyType, unknown> = new Map();

        parameters.set('kernel.boot.sync', false);
        parameters.set('kernel.unregister.parallel', true);
        parameters.set('kernel.environment', this.environment);
        parameters.set('kernel.debug', this.debug);
        parameters.set('kernel.name', this.getName());
        parameters.set('kernel.bundles', bundles);
        parameters.set('kernel.coreBundles', coreBundles);
        parameters.set('kernel.version', Kernel.VERSION);
        parameters.set('kernel.path', (this.constructor as typeof Kernel).getBasePath());

        return parameters;
    }

    /**
     * Return the overridden parameters.
     *
     * @returns A map of overridden parameters
     */
    protected async getOverriddenParameters(
        _container: Container,
    ): Promise<Map<keyof KernelParametersKeyType, unknown>> {
        return new Map();
    }

    /**
     * Builds the service container.
     *
     * @returns The compiled service container.
     * @async
     */
    protected async buildContainer() {
        const container = new Container();
        if (Compiler.isPass(this)) {
            container.addCompilerPass(this, CompilerPassType.TYPE_BEFORE_OPTIMIZATION, -10000);
        }

        container.parameterBag.add(this.getKernelParameters());
        this.prepareContainer(container);

        await this.registerContainerConfiguration(this.getContainerLoader(container));

        (await this.getOverriddenParameters(container)).forEach((value, key) => {
            container.setParameter(key.toLowerCase(), value);
        });

        return container;
    }

    /**
     * The extension point similar to the Bundle.build() static method.
     *
     * Use this method to register compiler passes and manipulate the container during the building process.
     *
     * @param container A Container instance.
     */
    protected build(_container: Container) {}

    /**
     * Prepares the Container before it is compiled.
     *
     * @param container A Container instance.
     */
    protected prepareContainer(container: Container) {
        const orderedBundleNames = this.syncBundles.concat(this.asyncBundles);
        const extensions: string[] = [];
        for (const name of orderedBundleNames) {
            const bundle = this.bundles.get(name);
            const extension = bundle.getContainerExtension();
            if (extension) {
                container.registerExtension(extension);
                extensions.push(extension.getAlias());
            }
        }
        orderedBundleNames.forEach(name => this.bundles.get(name).build(container));

        this.build(container);

        container.getCompiler().mergePass = new MergeExtensionConfigurationPass(extensions);
    }

    /**
     * Returns a loader for the container.
     *
     * @param container The service container.
     *
     * @returns The loader.
     */
    protected getContainerLoader(container: Container): ILoader {
        const resolver = new LoaderResolver(this.loaders.map(l => new (l as any)(container)));

        return new DelegatingLoader(resolver);
    }

    public async boot() {
        if (this.booted) {
            return;
        }

        this.initializeBundles();
        await this.initializeContainer();

        const p = [],
            SYNC_MODE = this.container.getParameter('kernel.boot.sync') === true;
        if (SYNC_MODE) {
            console.warn('\u26a0\ufe0f\ufe0f Kernel is booting synchronously ! \u26a0\ufe0f\ufe0f'); // tslint:disable-line:no-console
        }
        for (const name of this.syncBundles) {
            const bundle = this.bundles.get(name);
            bundle.setContainer(this.container);
            p.push(await bundle.boot());
        }

        for (const name of this.asyncBundles) {
            const bundle = this.bundles.get(name);
            bundle.setContainer(this.container);
            if (SYNC_MODE) {
                p.push(await bundle.boot());
            } else {
                p.push(bundle.boot());
            }
        }

        Promise.all(p).then(() => (this.booted = true));
    }

    public async shutdown() {
        if (!this.booted) {
            return;
        }

        this.booted = false;

        const p = [],
            SYNC_MODE = this.container.getParameter('kernel.boot.sync') === true;
        for (const name of this.syncBundles) {
            const bundle = this.bundles.get(name);
            p.push(await bundle.shutdown());
            bundle.setContainer(null);
        }

        for (const name of this.asyncBundles) {
            const bundle = this.bundles.get(name);
            if (SYNC_MODE) {
                p.push(await bundle.shutdown());
                bundle.setContainer(null);
            } else {
                p.push(
                    (async () => {
                        const ret = await bundle.shutdown();
                        bundle.setContainer(null);
                        return Promise.resolve(ret);
                    })(),
                );
                setTimeout(() => p.push(bundle.shutdown()), 1);
            }
        }

        Promise.all(p);
    }

    public async unregisterBundles(bundleNames: string[]): Promise<void> {
        if (!this.booted) {
            return;
        }

        const doTimeout = this.container.getParameter('kernel.unregister.parallel') === true,
            SYNC_MODE = this.container.getParameter('kernel.boot.sync') === true,
            doer = async () => {
                const p = [];
                for (const bundleToDelete of bundleNames) {
                    if (this.bundles.has(bundleToDelete)) {
                        if (SYNC_MODE) {
                            p.push(await this.bundles.get(bundleToDelete).shutdown());
                            this.bundles.delete(bundleToDelete);
                        } else {
                            p.push(
                                this.bundles
                                    .get(bundleToDelete)
                                    .shutdown()
                                    .then(() => this.bundles.delete(bundleToDelete)),
                            );
                        }
                    }
                }

                return Promise.all(p);
            };
        if (doTimeout) {
            setTimeout(doer, 1);
        } else {
            console.warn('\u26a0\ufe0f\ufe0f Kernel is unregistering synchronously ! \u26a0\ufe0f\ufe0f'); // tslint:disable-line:no-console
            await doer();
        }
    }

    public abstract registerBundles(): BundleExtended[];

    public abstract async registerContainerConfiguration(loader: ILoader): Promise<void>;

    public getBundle(name: string) {
        if (!this.bundles.has(name)) {
            const message1 = `Bundle "${name}" does not exist or it is not enabled.`,
                message2 = `Maybe you forgot to add it in the registerBundles() method of your ${this.constructor.name}?`;
            throw new InvalidArgumentException(`${message1} ${message2}`);
        }

        return this.bundles.get(name);
    }

    public getName() {
        return (this.name = this.name || this.constructor.name);
    }
}
