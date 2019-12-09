import { IPrefixParser } from '../env';
import { LogicException } from '../exception';

/**
 * Utility class to register env parsers with prefix.
 *
 * @internal
 */
export abstract class PrefixParserRegister {
    private static parsers = new Map<string, IPrefixParser>();

    private constructor() {}

    /**
     * Register a parser.
     */
    public static register(parser: IPrefixParser) {
        const prefix = parser.getPrefix();
        if (this.parsers.has(prefix)) {
            throw new LogicException(`Env prefix "${prefix}" was already registered.`);
        }

        this.parsers.set(prefix, parser);
    }

    /**
     * List and get all registered parsers.
     */
    public static getAll() {
        return [...this.parsers.values()];
    }
}
