import { Core, ResourceFile } from '../core/Core';
import { Container } from '../dependencyInjection/Container';
import { FileLoaderImportCircularReferenceException } from './exception/FileLoaderImportCircularReferenceException';
import { FileLoaderLoadException } from './exception/FileLoaderLoadException';
import { ILoader } from './ILoader';
import { ILoaderResolver } from './ILoaderResolver';

/**
 * Loader is the abstract class used by all built-in loaders.
 */
export abstract class Loader implements ILoader {
    protected static loading: Map<string, boolean> = new Map();

    protected container: Container;
    protected _resolver!: ILoaderResolver;

    public constructor(container: Container) {
        this.container = container;
    }

    /**
     * Loads from Extensions.
     */
    protected loadFromExtensions(content: any): void {
        for (const nameSpace in content) {
            if (!content.hasOwnProperty(nameSpace) || ['imports', 'parameters', 'services'].includes(nameSpace)) {
                continue;
            }

            this.container.loadFromExtension(
                nameSpace,
                Core.isPureObject(content[nameSpace]) ? content[nameSpace] : {},
            );
        }
    }

    /** @inheritDoc */
    public abstract async load(resourceFile: ResourceFile, type?: string): Promise<void>;

    /** @inheritDoc */
    public abstract supports(resourceFile: ResourceFile, type?: string): boolean;

    /**
     * Gets the loader resolver.
     *
     * @returns A ILoaderResolver instance.
     */
    public get resolver(): ILoaderResolver {
        return this._resolver;
    }

    /**
     * Sets the loader resolver.
     *
     * @param resolver A ILoaderResolver instance.
     */
    public set resolver(resolver: ILoaderResolver) {
        this._resolver = resolver;
    }

    /**
     * Imports a resource.
     *
     * @param resourceFile   A Resource
     * @param type           The resource type or null if unknown
     * @param ignoreErrors   Whether to ignore import errors or not
     * @param external       Is the resource imported an external one
     *
     * @throws FileLoaderLoadException
     * @throws FileLoaderImportCircularReferenceException
     * @async
     */
    public async import(
        resourceFile: ResourceFile,
        type?: string,
        ignoreErrors: boolean = false,
        external: boolean = false,
    ): Promise<any> {
        try {
            const loader = this.resolve(resourceFile, type);

            if (Loader.loading.has(resourceFile.path)) {
                throw new FileLoaderImportCircularReferenceException(
                    `Circular reference on imports (${Loader.loading}). Check you syntax.`,
                );
            }

            Loader.loading.set(resourceFile.path, true);

            let ret: void | null = null;
            try {
                ret = await loader.load(resourceFile, type, external);
            } finally {
                Loader.loading.delete(resourceFile.path);
            }

            return ret;
        } catch (e) {
            if (e.baseClass === 'FileLoaderImportCircularReferenceException') {
                throw e;
            } else if (!ignoreErrors) {
                if (e.baseClass === 'FileLoaderLoadException') {
                    throw e;
                }

                throw new FileLoaderLoadException(
                    `Something went wrong during imports loading (${resourceFile.path}). ${e.message}`,
                );
            }
        }
    }

    /**
     * Finds a loader able to load an imported resource.
     *
     * @param resourceFile  A resourceFile with path and content
     * @param type          The resource type or null if unknown
     *
     * @throws FileLoaderLoadException If no loader is found.
     */
    public resolve(resourceFile: ResourceFile, type?: string) {
        if (this.supports(resourceFile, type)) {
            return this;
        }

        if (!this.resolver) {
            throw new FileLoaderLoadException(`No loader available for imported file "${resourceFile.path}".`);
        }

        return this.resolver.resolve(resourceFile, type);
    }
}
