import { ResourceFile } from '../core/Core';
import { ILoaderResolver } from './ILoaderResolver';
/**
 * ILoader is the interface implemented by all loader classes.
 */
export interface ILoader {
    resolver: ILoaderResolver;

    /**
     * Loads a resource.
     *
     * @param resourceFile The resource.
     * @param type The resource type or null if unknown.
     * @param external Is the resource imported an external one.
     * @async
     */
    load(resourceFile: ResourceFile, type?: string, external?: boolean): Promise<void>;
    /**
     * Return whether this class supports the given resource.
     *
     * @param resourceFile A resource
     * @param type The resource type or null if unknown.
     * @returns True if this class supports the given resource, false otherwise.
     */
    supports(resourceFile: ResourceFile, type?: string): boolean;
}
