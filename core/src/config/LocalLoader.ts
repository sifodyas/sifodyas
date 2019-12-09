import { Use } from '@bios21/tstrait';
import { Core, ResourceFile } from '../core';
import { JsonBasedLoaderTrait } from './JsonBasedLoaderTrait';
import { Loader } from './Loader';

/**
 * This loader can be used to load direct JSON object.
 *
 * ```typescript
 * loader.load({
 *      path: '',
 *      content: {
 *          parameters: {
 *              // and so on
 *          }
 *      }
 *  });
 * ```
 */
@Use(JsonBasedLoaderTrait)
export class LocalLoader extends Loader {
    public async load(this: this & JsonBasedLoaderTrait, resourceFile: ResourceFile) {
        await this.loadJson(resourceFile.content as any, this.container);
        this.loadFromExtensions(resourceFile.content as any);
    }

    public supports(resourceFile: ResourceFile) {
        return Core.isObject(resourceFile.content);
    }
}
