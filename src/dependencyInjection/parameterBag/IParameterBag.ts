/**
 * ParameterBag Interface
 */
export interface IParameterBag<T = unknown> {
    /**
     * Clear all parameters.
     *
     * @throws LogicException if the IParameterBag can not be cleared.
     */
    clear(): void;
    /**
     * Adds parameters to the service container parameters.
     *
     * @param parameters An array of parameters.
     * @throws LogicException if the parameter can not be added.
     */
    add(parameters: Map<string, T>): void;
    /**
     * Gets the service container parameters.
     *
     * @returns An array of parameters.
     */
    all(): Map<string, T>;
    /**
     * Gets a service container parameter.
     *
     * @param name The parameter name.
     * @returns The parameter value.
     * @throws ParameterNotFoundException if the parameter is not defined.
     * @async
     */
    get(name: string): Promise<T>;
    /**
     * Removes a parameter.
     *
     * @param name The parameter name.
     */
    remove(name: string): void;
    /**
     * Sets a service container parameter.
     *
     * @param name The parameter name.
     * @param value The parameter value.
     * @throws LogicException if the parameter can not be set.
     */
    set(name: string, value: T): void;
    /**
     * Returns true if a parameter name is defined.
     *
     * @param name The parameter name.
     * @returns True if the parameter name is defined, false otherwise.
     */
    has(name: string): boolean;
    /**
     * Replaces parameter placeholders (%name%) by their values for all parameters.
     * @async
     */
    resolve(): Promise<void>;
    /**
     * Replaces parameter placeholders (%name%) by their values.
     *
     * @param value A value.
     * @returns The resolved value.
     * @throws ParameterNotFoundException if a placeholder references a parameter that does not exist.
     * @async
     */
    resolveValue(value: T): Promise<T>;
    /**
     * Escape parameter placeholders %.
     *
     * @param value
     * @returns The escaped value.
     */
    escapeValue(value: T): T;
    /**
     * Unescape parameter placeholders %.
     *
     * @param value
     * @returns The unescaped value.
     */
    unescapeValue(value: T): T;
}
