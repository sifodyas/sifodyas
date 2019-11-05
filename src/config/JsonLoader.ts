import { Use } from '@bios21/tstrait';
import { ResourceFile } from '../core/Core';
import { JsonBasedLoaderTrait } from './JsonBasedLoaderTrait';
import { Loader } from './Loader';

/**
 * JsonLoader loads Json files service definitions.
 */
@Use(JsonBasedLoaderTrait)
export class JsonLoader extends Loader {
    /** @inheritDoc */
    public async load(
        this: JsonLoader & JsonBasedLoaderTrait,
        resourceFile: ResourceFile,
        _type?: string,
        external: boolean = false,
    ) {
        const content = JSON.parse(resourceFile.content),
            resourcePath = resourceFile.path;

        if (!external) {
            await this.parseImport(content, resourcePath);
        }

        await this.loadJson(content, this.container);

        this.loadFromExtensions(content);
    }

    /** @inheritDoc */
    public supports(resourceFile: ResourceFile, type?: string) {
        return (
            ['js', 'json'].includes(String.prototype.toLowerCase.call(type || resourceFile.path.split('.').pop())) ||
            (resourceFile.content.startsWith('{') || resourceFile.content.startsWith('['))
        );
    }
}
