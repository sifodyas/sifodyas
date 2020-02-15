import { Container } from '../../Container';
import { IPrefixParser, PrefixParserRegister } from '../../env';
import { ICompilerPass } from './ICompilerPass';

/**
 * Abstract class that can be used to create env parser as compiler pass.
 *
 * During process phase, one ore many parsers will be registered to be used
 * in configuration resolving phase.
 */
export abstract class AbstractEnvPrefixParserPass implements ICompilerPass {
    public abstract prefixParsers: IPrefixParser | IPrefixParser[];
    public async process(_container: Container) {
        (Array.isArray(this.prefixParsers) ? this.prefixParsers : [this.prefixParsers]).forEach(p =>
            PrefixParserRegister.register(p),
        );
    }
}
