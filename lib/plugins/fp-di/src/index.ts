// tslint:disable:unified-signatures

import {
    Container,
    ICompilerPass,
    KernelParametersKeyType,
    RuntimeException,
    ServicesKeyType,
} from '@sifodyas/sifodyas';

let globContainer: Container = null;
type ParamKeys = keyof KernelParametersKeyType;
type ParamType<T extends ParamKeys> = KernelParametersKeyType[T];
type ServKeys = keyof ServicesKeyType;
type ServType<T extends ServKeys> = ServicesKeyType[T];

/**
 * Get one service by its name from the internal globalized Container.
 */
export function getService<KEY extends ServKeys>(serviceId: KEY): ServicesKeyType[KEY];
/**
 * Get one service by its name from the internal globalized Container.
 *
 * The return type will not be infered.
 */
export function getService(serviceId: string): unknown;
export function getService(serviceId: string) {
    if (globContainer) {
        return globContainer.get(serviceId);
    }

    throw new RuntimeException(
        'Seems like the FunctionalDepencencyInjectorPass was not processed. Make sure that it is registered in container.',
    );
}

//#region getServices overloads
/**
 * Get one service as a tuple by its name from the internal globalized Container.
 */
export function getServices<K1 extends ServKeys>(p1: K1): [ServType<K1>];
/**
 * Get two services as a tuple by their names from the internal globalized Container.
 */
export function getServices<K1 extends ServKeys, K2 extends ServKeys>(p1: K1, p2: K2): [ServType<K1>, ServType<K2>];
/**
 * Get three services as a tuple by their names from the internal globalized Container.
 */
export function getServices<K1 extends ServKeys, K2 extends ServKeys, K3 extends ServKeys>(
    p1: K1,
    p2: K2,
    p3: K3,
): [ServType<K1>, ServType<K2>, ServType<K3>];
/**
 * Get four services as a tuple by their names from the internal globalized Container.
 */
export function getServices<K1 extends ServKeys, K2 extends ServKeys, K3 extends ServKeys, K4 extends ServKeys>(
    p1: K1,
    p2: K2,
    p3: K3,
    p4: K4,
): [ServType<K1>, ServType<K2>, ServType<K3>, ServType<K4>];
/**
 * Get five services as a tuple by their names from the internal globalized Container.
 */
export function getServices<
    K1 extends ServKeys,
    K2 extends ServKeys,
    K3 extends ServKeys,
    K4 extends ServKeys,
    K5 extends ServKeys
>(p1: K1, p2: K2, p3: K3, p4: K4, p5: K5): [ServType<K1>, ServType<K2>, ServType<K3>, ServType<K4>, ServType<K5>];
/**
 * Get six services as a tuple by their names from the internal globalized Container.
 */
export function getServices<
    K1 extends ServKeys,
    K2 extends ServKeys,
    K3 extends ServKeys,
    K4 extends ServKeys,
    K5 extends ServKeys,
    K6 extends ServKeys
>(
    p1: K1,
    p2: K2,
    p3: K3,
    p4: K4,
    p5: K5,
    p6: K6,
): [ServType<K1>, ServType<K2>, ServType<K3>, ServType<K4>, ServType<K5>, ServType<K6>];
/**
 * Get seven services as a tuple by their names from the internal globalized Container.
 */
export function getServices<
    K1 extends ServKeys,
    K2 extends ServKeys,
    K3 extends ServKeys,
    K4 extends ServKeys,
    K5 extends ServKeys,
    K6 extends ServKeys,
    K7 extends ServKeys
>(
    p1: K1,
    p2: K2,
    p3: K3,
    p4: K4,
    p5: K5,
    p6: K6,
    p7: K7,
): [ServType<K1>, ServType<K2>, ServType<K3>, ServType<K4>, ServType<K5>, ServType<K6>, ServType<K7>];
/**
 * Get eight services as a tuple by their names from the internal globalized Container.
 */
export function getServices<
    K1 extends ServKeys,
    K2 extends ServKeys,
    K3 extends ServKeys,
    K4 extends ServKeys,
    K5 extends ServKeys,
    K6 extends ServKeys,
    K7 extends ServKeys,
    K8 extends ServKeys
>(
    p1: K1,
    p2: K2,
    p3: K3,
    p4: K4,
    p5: K5,
    p6: K6,
    p7: K7,
    p8: K8,
): [ServType<K1>, ServType<K2>, ServType<K3>, ServType<K4>, ServType<K5>, ServType<K6>, ServType<K7>, ServType<K8>];
/**
 * Get nine services as a tuple by their names from the internal globalized Container.
 */
export function getServices<
    K1 extends ServKeys,
    K2 extends ServKeys,
    K3 extends ServKeys,
    K4 extends ServKeys,
    K5 extends ServKeys,
    K6 extends ServKeys,
    K7 extends ServKeys,
    K8 extends ServKeys,
    K9 extends ServKeys
>(
    p1: K1,
    p2: K2,
    p3: K3,
    p4: K4,
    p5: K5,
    p6: K6,
    p7: K7,
    p8: K8,
    p9: K9,
): [
    ServType<K1>,
    ServType<K2>,
    ServType<K3>,
    ServType<K4>,
    ServType<K5>,
    ServType<K6>,
    ServType<K7>,
    ServType<K8>,
    ServType<K9>,
];
/**
 * Get ten services as a tuple by their names from the internal globalized Container.
 */
export function getServices<
    K1 extends ServKeys,
    K2 extends ServKeys,
    K3 extends ServKeys,
    K4 extends ServKeys,
    K5 extends ServKeys,
    K6 extends ServKeys,
    K7 extends ServKeys,
    K8 extends ServKeys,
    K9 extends ServKeys,
    K10 extends ServKeys
>(
    p1: K1,
    p2: K2,
    p3: K3,
    p4: K4,
    p5: K5,
    p6: K6,
    p7: K7,
    p8: K8,
    p9: K9,
    p10: K10,
): [
    ServType<K1>,
    ServType<K2>,
    ServType<K3>,
    ServType<K4>,
    ServType<K5>,
    ServType<K6>,
    ServType<K7>,
    ServType<K8>,
    ServType<K9>,
    ServType<K10>,
];
/**
 * Get several services as a tuple by their names from the internal globalized Container.
 *
 * The return types will not be infered.
 */
export function getServices(...serviceIds: string[]): unknown[];
//#endregion
export function getServices(...serviceIds: string[]) {
    return serviceIds.map(getService);
}

/**
 * Get one parameter by its name from the internal globalized Container.
 */
export function getParameter<KEY extends ParamKeys>(paramId: KEY): KernelParametersKeyType[KEY];
/**
 * Get one parameter by its name from the internal globalized Container.
 *
 * The return type will not be infered.
 */
export function getParameter(paramId: string): unknown;
export function getParameter(paramId: string): unknown {
    if (globContainer) {
        return globContainer.getParameter(paramId);
    }

    throw new RuntimeException(
        'Seems like the FunctionalDepencencyInjectorPass was not processed. Make sure that it is registered in container.',
    );
}

//#region getParameters overloads
/**
 * Get one parameter as a tuple by its name from the internal globalized Container.
 */
export function getParameters<K1 extends ParamKeys>(p1: K1): [ParamType<K1>];
/**
 * Get two parameters as a tuple by their names from the internal globalized Container.
 */
export function getParameters<K1 extends ParamKeys, K2 extends ParamKeys>(
    p1: K1,
    p2: K2,
): [ParamType<K1>, ParamType<K2>];
/**
 * Get three parameters as a tuple by their names from the internal globalized Container.
 */
export function getParameters<K1 extends ParamKeys, K2 extends ParamKeys, K3 extends ParamKeys>(
    p1: K1,
    p2: K2,
    p3: K3,
): [ParamType<K1>, ParamType<K2>, ParamType<K3>];
/**
 * Get four parameters as a tuple by their names from the internal globalized Container.
 */
export function getParameters<K1 extends ParamKeys, K2 extends ParamKeys, K3 extends ParamKeys, K4 extends ParamKeys>(
    p1: K1,
    p2: K2,
    p3: K3,
    p4: K4,
): [ParamType<K1>, ParamType<K2>, ParamType<K3>, ParamType<K4>];
/**
 * Get five parameters as a tuple by their names from the internal globalized Container.
 */
export function getParameters<
    K1 extends ParamKeys,
    K2 extends ParamKeys,
    K3 extends ParamKeys,
    K4 extends ParamKeys,
    K5 extends ParamKeys
>(p1: K1, p2: K2, p3: K3, p4: K4, p5: K5): [ParamType<K1>, ParamType<K2>, ParamType<K3>, ParamType<K4>, ParamType<K5>];
/**
 * Get six parameters as a tuple by their names from the internal globalized Container.
 */
export function getParameters<
    K1 extends ParamKeys,
    K2 extends ParamKeys,
    K3 extends ParamKeys,
    K4 extends ParamKeys,
    K5 extends ParamKeys,
    K6 extends ParamKeys
>(
    p1: K1,
    p2: K2,
    p3: K3,
    p4: K4,
    p5: K5,
    p6: K6,
): [ParamType<K1>, ParamType<K2>, ParamType<K3>, ParamType<K4>, ParamType<K5>, ParamType<K6>];
/**
 * Get seven parameters as a tuple by their names from the internal globalized Container.
 */
export function getParameters<
    K1 extends ParamKeys,
    K2 extends ParamKeys,
    K3 extends ParamKeys,
    K4 extends ParamKeys,
    K5 extends ParamKeys,
    K6 extends ParamKeys,
    K7 extends ParamKeys
>(
    p1: K1,
    p2: K2,
    p3: K3,
    p4: K4,
    p5: K5,
    p6: K6,
    p7: K7,
): [ParamType<K1>, ParamType<K2>, ParamType<K3>, ParamType<K4>, ParamType<K5>, ParamType<K6>, ParamType<K7>];
/**
 * Get eight parameters as a tuple by their names from the internal globalized Container.
 */
export function getParameters<
    K1 extends ParamKeys,
    K2 extends ParamKeys,
    K3 extends ParamKeys,
    K4 extends ParamKeys,
    K5 extends ParamKeys,
    K6 extends ParamKeys,
    K7 extends ParamKeys,
    K8 extends ParamKeys
>(
    p1: K1,
    p2: K2,
    p3: K3,
    p4: K4,
    p5: K5,
    p6: K6,
    p7: K7,
    p8: K8,
): [
    ParamType<K1>,
    ParamType<K2>,
    ParamType<K3>,
    ParamType<K4>,
    ParamType<K5>,
    ParamType<K6>,
    ParamType<K7>,
    ParamType<K8>,
];
/**
 * Get nine parameters as a tuple by their names from the internal globalized Container.
 */
export function getParameters<
    K1 extends ParamKeys,
    K2 extends ParamKeys,
    K3 extends ParamKeys,
    K4 extends ParamKeys,
    K5 extends ParamKeys,
    K6 extends ParamKeys,
    K7 extends ParamKeys,
    K8 extends ParamKeys,
    K9 extends ParamKeys
>(
    p1: K1,
    p2: K2,
    p3: K3,
    p4: K4,
    p5: K5,
    p6: K6,
    p7: K7,
    p8: K8,
    p9: K9,
): [
    ParamType<K1>,
    ParamType<K2>,
    ParamType<K3>,
    ParamType<K4>,
    ParamType<K5>,
    ParamType<K6>,
    ParamType<K7>,
    ParamType<K8>,
    ParamType<K9>,
];
/**
 * Get ten parameters as a tuple by their names from the internal globalized Container.
 */
export function getParameters<
    K1 extends ParamKeys,
    K2 extends ParamKeys,
    K3 extends ParamKeys,
    K4 extends ParamKeys,
    K5 extends ParamKeys,
    K6 extends ParamKeys,
    K7 extends ParamKeys,
    K8 extends ParamKeys,
    K9 extends ParamKeys,
    K10 extends ParamKeys
>(
    p1: K1,
    p2: K2,
    p3: K3,
    p4: K4,
    p5: K5,
    p6: K6,
    p7: K7,
    p8: K8,
    p9: K9,
    p10: K10,
): [
    ParamType<K1>,
    ParamType<K2>,
    ParamType<K3>,
    ParamType<K4>,
    ParamType<K5>,
    ParamType<K6>,
    ParamType<K7>,
    ParamType<K8>,
    ParamType<K9>,
    ParamType<K10>,
];
/**
 * Get several parameters as a tuple by their names from the internal globalized Container.
 *
 * The return types will not be infered.
 */
export function getParameters(...paramIds: string[]): unknown[];
//#endregion
export function getParameters(...paramIds: string[]) {
    return paramIds.map(getParameter);
}

export function getDependencies(serviceIds: string[], paramIds: string[]) {
    return [getServices(...serviceIds), getParameters(...paramIds)];
}

/**
 * Inject one service as first argument to a bound function.
 *
 * Even if autocomplete, injected values cannot be type infered.
 */
export function injectService<T extends (...args: any[]) => any>(f: T, serviceId: ServKeys): any;
/**
 * Inject one service as first argument to a bound function.
 *
 * Injected values cannot be type infered.
 */
export function injectService<T extends (...args: any[]) => any>(f: T, serviceId: string): any;
export function injectService<T extends (...args: any[]) => any>(f: T, serviceId: string) {
    return f.bind(f, getService(serviceId));
}
/**
 * Inject several services as first arguments to a bound function.
 *
 * Even if autocomplete, injected values cannot be type infered.
 */
export function injectServices<T extends (...args: any[]) => any>(f: T, ...serviceIds: ServKeys[]): any;
/**
 * Inject several services as first arguments to a bound function.
 *
 * Injected values cannot be type infered.
 */
export function injectServices<T extends (...args: any[]) => any>(f: T, ...serviceIds: string[]): any;
export function injectServices<T extends (...args: any[]) => any>(f: T, ...serviceIds: string[]) {
    return f.bind(f, ...getServices(...serviceIds));
}
/**
 * Inject one parameter as first argument to a bound function.
 *
 * Even if autocomplete, injected values cannot be type infered.
 */
export function injectParameter<T extends (...args: any[]) => any>(f: T, paramId: ParamKeys): any;
/**
 * Inject one parameter as first argument to a bound function.
 *
 * Injected values cannot be type infered.
 */
export function injectParameter<T extends (...args: any[]) => any>(f: T, paramId: string): any;
export function injectParameter<T extends (...args: any[]) => any>(f: T, paramId: string) {
    return f.bind(f, getParameter(paramId));
}
/**
 * Inject several parameters as first arguments to a bound function.
 *
 * Even if autocomplete, injected values cannot be type infered.
 */
export function injectParameters<T extends (...args: any[]) => any>(f: T, ...paramIds: ParamKeys[]): any;
/**
 * Inject several parameters as first arguments to a bound function.
 *
 * Injected values cannot be type infered.
 */
export function injectParameters<T extends (...args: any[]) => any>(f: T, ...paramIds: string[]): any;
export function injectParameters<T extends (...args: any[]) => any>(f: T, ...paramIds: string[]) {
    return f.bind(f, ...getParameters(...paramIds));
}
/**
 * Inject several dependencies (services, then parameters) as first two arguments to a bound function.
 *
 * Injected values cannot be type infered.
 */
export function injectDependencies<T extends (...args: any[]) => any>(f: T, serviceIds: string[], paramIds: string[]) {
    return f.bind(f, ...getDependencies(serviceIds, paramIds));
}

export interface WithServices {
    services: unknown[];
}

export interface WithService {
    service: unknown;
}

export interface WithParameters {
    parameters: any[];
}
export interface WithParameter {
    parameter: any;
}

export interface WithDependencies extends WithServices, WithParameters {}

/**
 * Inject one service inside the first argument object of a function, then return a high order function of it.
 */
export const withService = <T extends any, P extends WithService, C extends (props: P) => T>(servicesId: string) => (
    component: C,
) => (props: Omit<P, keyof WithService>) => component({ ...props, service: getService(servicesId) } as P);
/**
 * Inject several services inside the first argument object of a function, then return a high order function of it.
 */
export const withServices = <T extends any, P extends WithServices, C extends (props: P) => T>(
    ...servicesIds: string[]
) => (component: C) => (props: Omit<P, keyof WithServices>) =>
    component({ ...props, services: getServices(...servicesIds) } as P);
/**
 * Inject one parameter inside the first argument object of a function, then return a high order function of it.
 */
export const withParameter = <T extends any, P extends WithParameter, C extends (props: P) => T>(paramId: string) => (
    component: C,
) => (props: Omit<P, keyof WithParameter>) => component({ ...props, parameter: getParameter(paramId) } as P);
/**
 * Inject several parameters inside the first argument object of a function, then return a high order function of it.
 */
export const withParameters = <T extends any, P extends WithParameters, C extends (props: P) => T>(
    ...paramIds: string[]
) => (component: C) => (props: Omit<P, keyof WithParameters>) =>
    component({ ...props, parameters: getParameters(...paramIds) } as P);
/**
 * Inject several dependencies inside the first argument object of a function, then return a high order function of it.
 */
export const withDependencies = <T extends any, P extends WithDependencies, C extends (props: P) => T>(
    servicesIds: string[],
    paramIds: string[],
) => (component: C) => (props: Omit<P, keyof WithDependencies>) =>
    component({ ...props, services: getServices(...servicesIds), parameters: getParameters(...paramIds) } as P);

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
