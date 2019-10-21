import { ResourceFile } from '../core';
import { ILoader } from './ILoader';
import { ILoaderResolver } from './ILoaderResolver';

/**
 * LoaderResolver selects a loader for a given resource.
 *
 * A resource can be any string.
 * Each loader determines whether it can load a resource and how.
 */
export class LoaderResolver implements ILoaderResolver {
    private loaders: ILoader[] = [];

    /**
     * Constructor.
     *
     * @param loaders An array of ILoader object.
     */
    constructor(loaders: ILoader[]) {
        for (const loader of loaders) {
            this.addLoader(loader);
        }
    }

    /** @inheritDoc */
    public resolve(resourceFile: ResourceFile, type: string = null) {
        for (const loader of this.loaders) {
            if (loader.supports(resourceFile, type)) {
                return loader;
            }
        }
        return null;
    }

    /**
     * Add a loader.
     *
     * @param loader A ILoader instance.
     */
    public addLoader(loader: ILoader) {
        this.loaders.push(loader);
        loader.resolver = this;
    }

    /**
     * Returns the registered loaders.
     *
     * @returns An array of ILoader instance.
     */
    public getLoaders() {
        return this.loaders;
    }
}
