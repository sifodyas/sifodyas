import { Container } from '../Container';

/**
 * IExtension is the interface implemented by container extension classes.
 */
export interface IExtension {
    /**
     * Loads a specific configuration.
     *
     * @param configs A map of configuration values.
     * @param container The Container instance
     */
    load(configs: object, container: Container): Promise<void>;

    /**
     * Returns the recommended alias that is the mandatory prefix to use when using YAML.
     *
     * @returns The alias.
     */
    getAlias(): string;
}
