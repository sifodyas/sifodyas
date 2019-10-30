import { Trait } from '../Trait';

type Class = typeof Object;

/**
 * Implements the "use" keyword from PHP.
 *
 * @param trait The Trait implementation to use.
 * @returns The class "traited"
 */
export function Use<T extends typeof Trait>(trait: T): any {
    return (clazz: Class): Class => {
        copyProperties(clazz, trait);
        copyProperties(clazz.prototype, trait.prototype);
        return clazz;
    };
}

/**
 * Copy param from a source class instance to the target class instance.
 */
function copyProperties(target = {}, source = {}) {
    const ownPropertyNames = Object.getOwnPropertyNames(source);

    ownPropertyNames
        .filter(key => !/(prototype|name|constructor)/.test(key))
        .forEach(key => {
            const desc = Object.getOwnPropertyDescriptor(source, key);

            Object.defineProperty(target, key, desc!);
        });
}
