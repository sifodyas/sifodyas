/**
 * Describes the interface of a container that exposes methods to read its entries.
 */
export interface IContainer {
    /**
     * Finds an entry of the container by its identifier and returns it.
     *
     * @param id Identifier of the entry to look for.
     *
     * @throws {INotFoundException} No entry was found for **this** identifier.
     * @throws {IContainerException} Error while retrieving the entry.
     *
     * @returns Entry.
     */
    get(id: string): unknown;

    /**
     * Returns true if the container can return an entry for the given identifier.
     * Returns false otherwise.
     *
     * `has(id)` returning true does not mean that `get(id)` will not throw an exception.
     * It does however mean that `get(id)` will not throw a `INotFoundException`.
     *
     * @param id Identifier of the entry to look for.
     */
    has(id: string): boolean;
}
