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
        const content = (resourceFile.content as unknown) as object;
        await this.loadJson(content, this.container);
        this.loadFromExtensions(content);
    }

    public supports(resourceFile: ResourceFile) {
        return Core.isObject(resourceFile.content);
    }
}
