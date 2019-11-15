import { Use } from '@bios21/tstrait';
import { JsonBasedLoaderTrait, Loader, ResourceFile } from '@sifodyas/sifodyas';
import YAML from 'yamljs';

/**
 * YamlLoader loads YAML files service definitions.
 *
 * The YAML format does not support anonymous services.
 */
@Use(JsonBasedLoaderTrait)
export class YamlLoader extends Loader {
    public async load(
        this: YamlLoader & JsonBasedLoaderTrait,
        resourceFile: ResourceFile,
        _?: string,
        external = false,
    ) {
        const content = YAML.parse(resourceFile.content),
            resourcePath = resourceFile.path;

        if (!external) {
            await this.parseImport(content, resourcePath);
        }

        await this.loadJson(content, this.container);

        this.loadFromExtensions(content);
    }

    public supports(resourceFile: ResourceFile, type?: string) {
        try {
            return ['yml', 'yaml'].includes(
                String.prototype.toLowerCase.call(type || resourceFile.path.split('.').pop()),
            );
        } catch (e) {
            return false;
        }
    }
}
