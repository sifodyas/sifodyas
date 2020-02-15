import { ResourceFile } from '../core/Core';
import { ILoader } from './ILoader';

/**
 * ILoaderResolver selects a loader for a given resource.
 */
export interface ILoaderResolver {
    /**
     * Returns a loader able to load the resource.
     *
     * @param resourceFile A resource.
     * @param type The resource type or null if unknown.
     * @returns The loader or null if none is able to load the resource.
     */
    resolve(resourceFile: ResourceFile, type?: string): ILoader;
}
