/**
 * Configuration interface.
 */
export interface IConfiguration<T> {
    /**
     * Validate, format configuration, and return it to the Extension.
     */
    validateConfig(config: T): T;
}
