export interface IPrefixParser {
    /**
     * The prefix used in env vars. `prefix:` without ":"
     */
    getPrefix(): string;
    /**
     * Handle the parsin of `prefix:` in env vars
     */
    parse(env: string): unknown;
}
