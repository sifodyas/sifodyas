import {
    Container,
    ICompilerPass,
    KernelParametersKeyType as ParamMapping,
    RuntimeException,
    ServicesKeyType as ServMapping,
} from '@sifodyas/sifodyas';

let globContainer: Container = null;

/**
 * Compiler Pass that handle the init of the global container.
 */
export class FunctionalDepencencyInjectorPass implements ICompilerPass {
    public async process(container: Container) {
        if (globContainer) {
            if (container.getParameter('kernel.environment') !== 'test') {
                throw new RuntimeException(
                    'Seems like the FunctionalDepencencyInjectorPass was already processed. Make sure that only one is loaded in container.',
                );
            }
        }

        globContainer = container;
    }
}

/**
 * Hack for union string litteral with string to keep autocomplete
 */
type UnknownMapping = string & { _?: never };

// Services types
interface ExtendedServMapping extends ServMapping {
    [P: string]: unknown;
}
type ServKeys = keyof ServMapping;
type ServMappedType<T> = {
    [I in keyof T]: ExtendedServMapping[Extract<T[I], ServKeys>];
};

// Parameters types
interface ExtendedParamMapping extends ParamMapping {
    [P: string]: unknown;
}
type ParamKeys = keyof ParamMapping;
type ParamMappedType<T> = {
    [I in keyof T]: ExtendedParamMapping[Extract<T[I], ParamKeys>];
};

//
// GET WAY
//
/**
 * Get one service by its name from the internal globalized Container.
 */
export function getService<U extends ServKeys | UnknownMapping>(serviceId: U | ServKeys) {
    if (globContainer) {
        return globContainer.get(serviceId) as U extends ServKeys ? ServMapping[U] : unknown;
    }

    throw new RuntimeException(
        'Seems like the FunctionalDepencencyInjectorPass was not processed. Make sure that it is registered in container.',
    );
}

/**
 * Get several services as a tuple by their names from the internal globalized Container.
 */
export function getServices<K extends ServKeys[], U extends K | UnknownMapping[]>(...serviceIds: U | K) {
    return ((serviceIds as K).map(getService) as unknown) as ServMappedType<U>;
}

/**
 * Get one parameter by its name from the internal globalized Container.
 */
export function getParameter<U extends ParamKeys | UnknownMapping>(paramId: U | ParamKeys) {
    if (globContainer) {
        return globContainer.getParameter(paramId) as U extends ParamKeys ? ParamMapping[U] : unknown;
    }

    throw new RuntimeException(
        'Seems like the FunctionalDepencencyInjectorPass was not processed. Make sure that it is registered in container.',
    );
}

/**
 * Get several parameters as a tuple by their names from the internal globalized Container.
 */
export function getParameters<K extends ParamKeys[], U extends K | UnknownMapping[]>(...paramIds: U | K) {
    return ((paramIds as K).map(getParameter) as unknown) as ParamMappedType<U>;
}

//
// INJECT WAY
//
/**
 * Remove first argument from a function
 *
 * Credit: https://stackoverflow.com/a/58765199/5252629
 */
type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

/**
 * Inject one service as first argument to a bound function.
 */
export function injectService<
    U extends ServKeys | UnknownMapping,
    F extends (...args: [U extends ServKeys ? ServMapping[U] : unknown, ...any[]]) => unknown
>(f: F, serviceId: U | ServKeys) {
    return f.bind(f, getService(serviceId)) as OmitFirstArg<F>;
}

/**
 * Inject several services as first arguments to a bound function.
 */
export function injectServices<
    K extends ServKeys[],
    U extends K | UnknownMapping[],
    F extends (...args: [ServMappedType<U>, ...any[]]) => unknown
>(f: F, ...serviceIds: U | K) {
    return f.bind(f, getServices(...serviceIds) as ServMappedType<U>) as OmitFirstArg<F>;
}

/**
 * Inject one parameter as first argument to a bound function.
 */
export function injectParameter<
    U extends ParamKeys | UnknownMapping,
    F extends (...args: [U extends ParamKeys ? ParamMapping[U] : unknown, ...any[]]) => unknown
>(f: F, paramId: U | ParamKeys) {
    return f.bind(f, getParameter(paramId)) as OmitFirstArg<F>;
}

/**
 * Inject several parameters as first arguments to a bound function.
 */
export function injectParameters<
    K extends ParamKeys[],
    U extends K | UnknownMapping[],
    F extends (...args: [ParamMappedType<U>, ...any[]]) => unknown
>(f: F, ...paramIds: U | K) {
    return f.bind(f, getParameters(...paramIds) as ParamMappedType<U>) as OmitFirstArg<F>;
}

//
// WITH WAY
//
export interface WithService<K extends ServKeys | UnknownMapping = UnknownMapping> {
    service: K extends ServKeys ? ServMapping[K] : unknown;
}
/**
 * Inject one service inside the first argument object of a function, then return a high order function of it.
 */
export const withService = <U extends ServKeys | UnknownMapping>(servicesId: U | ServKeys) => <
    P extends WithService<U>
>(
    component: (props: P) => unknown,
) => (props: Omit<P, 'service'>) => component({ ...props, service: getService(servicesId) } as P);

export interface WithServices<K extends ServKeys[] | UnknownMapping[] = UnknownMapping[]> {
    services: ServMappedType<K>;
}

/**
 * Inject several services inside the first argument object of a function, then return a high order function of it.
 */
export const withServices = <K extends ServKeys[], U extends K | UnknownMapping[]>(...servicesIds: U | K) => <
    P extends WithServices<U>
>(
    component: (props: P) => unknown,
) => (props: Omit<P, 'services'>) => component({ ...props, services: getServices(...servicesIds) } as P);

export interface WithParameter<K extends ParamKeys | UnknownMapping = UnknownMapping> {
    parameter: K extends ParamKeys ? ParamMapping[K] : unknown;
}

/**
 * Inject one parameter inside the first argument object of a function, then return a high order function of it.
 */
export const withParameter = <U extends ParamKeys | UnknownMapping>(paramId: U | ParamKeys) => <
    P extends WithParameter<U>
>(
    component: (props: P) => unknown,
) => (props: Omit<P, 'parameter'>) => component({ ...props, parameter: getParameter(paramId) } as P);

export interface WithParameters<K extends ParamKeys[] | UnknownMapping[] = UnknownMapping[]> {
    parameters: ParamMappedType<K>;
}

/**
 * Inject several parameters inside the first argument object of a function, then return a high order function of it.
 */
export const withParameters = <K extends ParamKeys[], U extends K | UnknownMapping[]>(...paramIds: U | K) => <
    P extends WithParameters<U>
>(
    component: (props: P) => unknown,
) => (props: Omit<P, 'parameters'>) => component({ ...props, parameters: getParameters(...paramIds) } as P);
