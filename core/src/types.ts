/**
 * Like `Partial` but recursively deeper.
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
        ? Array<DeepPartial<U>>
        : T[P] extends ReadonlyArray<infer V>
        ? ReadonlyArray<DeepPartial<V>>
        : DeepPartial<T[P]>;
};

export type DelegatedGuard<T> = (p: any) => p is T;
export type DelegatedAsserts = (p: any) => asserts p;
export type DelegatedAssertsIs<T> = (p: any) => asserts p is T;

/**
 * Hacky type to remove readonly on each property
 */
export type UnReadOnly<T> = {
    -readonly [K in keyof T]: T[K];
};
