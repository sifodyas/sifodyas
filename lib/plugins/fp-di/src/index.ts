import {
    Container,
    ICompilerPass,
    ParameterKeys,
    ParametersKeyType as ParamMapping,
    ParametersMappedType,
    RuntimeException,
    ServiceKeys,
    ServicesKeyType as ServMapping,
    ServicesMappedType,
    UnknownMapping,
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

//
// GET WAY
//
/**
 * Get one service by its name from the internal globalized Container.
 */
export function getService<
    U extends ServiceKeys | UnknownMapping,
    R extends U extends ServiceKeys ? ServMapping[U] : unknown
>(serviceId: U | ServiceKeys) {
    if (globContainer) {
        return globContainer.get(serviceId) as R;
    }

    throw new RuntimeException(
        'Seems like the FunctionalDepencencyInjectorPass was not processed. Make sure that it is registered in container.',
    );
}

/**
 * Get several services as a tuple by their names from the internal globalized Container.
 */
export function getServices<K extends ServiceKeys[], U extends K | UnknownMapping[]>(...serviceIds: U | K) {
    return ((serviceIds as K).map(getService) as unknown) as ServicesMappedType<U>;
}

/**
 * Get one parameter by its name from the internal globalized Container.
 */
export function getParameter<
    U extends ParameterKeys | UnknownMapping,
    R extends U extends ParameterKeys ? ParamMapping[U] : unknown
>(paramId: U | ParameterKeys) {
    if (globContainer) {
        return globContainer.getParameter(paramId) as R;
    }

    throw new RuntimeException(
        'Seems like the FunctionalDepencencyInjectorPass was not processed. Make sure that it is registered in container.',
    );
}

/**
 * Get several parameters as a tuple by their names from the internal globalized Container.
 */
export function getParameters<K extends ParameterKeys[], U extends K | UnknownMapping[]>(...paramIds: U | K) {
    return ((paramIds as K).map(getParameter) as unknown) as ParametersMappedType<U>;
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
    U extends ServiceKeys | UnknownMapping,
    F extends (...args: [U extends ServiceKeys ? ServMapping[U] : unknown, ...any[]]) => unknown
>(f: F, serviceId: U | ServiceKeys) {
    return f.bind(f, getService(serviceId)) as OmitFirstArg<F>;
}

/**
 * Inject several services as first arguments to a bound function.
 */
export function injectServices<
    K extends ServiceKeys[],
    U extends K | UnknownMapping[],
    F extends (...args: [ServicesMappedType<U>, ...any[]]) => unknown
>(f: F, ...serviceIds: U | K) {
    return f.bind(f, getServices(...serviceIds) as ServicesMappedType<U>) as OmitFirstArg<F>;
}

/**
 * Inject one parameter as first argument to a bound function.
 */
export function injectParameter<
    U extends ParameterKeys | UnknownMapping,
    F extends (...args: [U extends ParameterKeys ? ParamMapping[U] : unknown, ...any[]]) => unknown
>(f: F, paramId: U | ParameterKeys) {
    return f.bind(f, getParameter(paramId)) as OmitFirstArg<F>;
}

/**
 * Inject several parameters as first arguments to a bound function.
 */
export function injectParameters<
    K extends ParameterKeys[],
    U extends K | UnknownMapping[],
    F extends (...args: [ParametersMappedType<U>, ...any[]]) => unknown
>(f: F, ...paramIds: U | K) {
    return f.bind(f, getParameters(...paramIds) as ParametersMappedType<U>) as OmitFirstArg<F>;
}

//
// WITH WAY
//
export interface WithService<K extends ServiceKeys | UnknownMapping = UnknownMapping> {
    service: K extends ServiceKeys ? ServMapping[K] : unknown;
}
/**
 * Inject one service inside the first argument object of a function, then return a high order function of it.
 */
export const withService = <U extends ServiceKeys | UnknownMapping>(servicesId: U | ServiceKeys) => <
    P extends WithService<U>
>(
    component: (props: P) => unknown,
) => (props: Omit<P, 'service'>) => component({ ...props, service: getService(servicesId) } as P);

export interface WithServices<K extends ServiceKeys[] | UnknownMapping[] = UnknownMapping[]> {
    services: ServicesMappedType<K>;
}

/**
 * Inject several services inside the first argument object of a function, then return a high order function of it.
 */
export const withServices = <K extends ServiceKeys[], U extends K | UnknownMapping[]>(...servicesIds: U | K) => <
    P extends WithServices<U>
>(
    component: (props: P) => unknown,
) => (props: Omit<P, 'services'>) => component({ ...props, services: getServices(...servicesIds) } as P);

export interface WithParameter<K extends ParameterKeys | UnknownMapping = UnknownMapping> {
    parameter: K extends ParameterKeys ? ParamMapping[K] : unknown;
}

/**
 * Inject one parameter inside the first argument object of a function, then return a high order function of it.
 */
export const withParameter = <U extends ParameterKeys | UnknownMapping>(paramId: U | ParameterKeys) => <
    P extends WithParameter<U>
>(
    component: (props: P) => unknown,
) => (props: Omit<P, 'parameter'>) => component({ ...props, parameter: getParameter(paramId) } as P);

export interface WithParameters<K extends ParameterKeys[] | UnknownMapping[] = UnknownMapping[]> {
    parameters: ParametersMappedType<K>;
}

/**
 * Inject several parameters inside the first argument object of a function, then return a high order function of it.
 */
export const withParameters = <K extends ParameterKeys[], U extends K | UnknownMapping[]>(...paramIds: U | K) => <
    P extends WithParameters<U>
>(
    component: (props: P) => unknown,
) => (props: Omit<P, 'parameters'>) => component({ ...props, parameters: getParameters(...paramIds) } as P);
