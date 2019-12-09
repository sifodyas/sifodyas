import { AbstractEnvPrefixParserPass, IPrefixParser, RuntimeException } from '@sifodyas/sifodyas';
import YAML from 'yamljs';

/**
 * Parser as pass to load YAML string from env var with "yml:" prefix.
 */
export class YamlPrefixParserPass extends AbstractEnvPrefixParserPass {
    public prefixParsers = new (class implements IPrefixParser {
        public getPrefix() {
            return 'yml';
        }

        public parse(env: string) {
            try {
                return YAML.parse(env);
            } catch (e) {
                throw new RuntimeException(`Invalid YAML env var "${name}": ${e.message}`);
            }
        }
    })();
}
