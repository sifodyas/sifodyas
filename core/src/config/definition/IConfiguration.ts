/**
 * Configuration interface.
 */
export interface IConfiguration {
    /**
     * Validate, format configuration, and return it to the Extension.
     */
    validateConfig<T>(config: T): T;
}
