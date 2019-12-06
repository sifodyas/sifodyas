import { Container, ICompilerPass, RuntimeException } from '@sifodyas/sifodyas';

let globContainer: Container = null;
export const useServices = (...serviceIds: string[]) =>
    serviceIds.map(id => {
        if (globContainer) {
            return globContainer.get(id);
        }

        throw new RuntimeException(
            'Seems like the FunctionalDepencencyInjectorPass was not processed. Make sure that it is registered in container.',
        );
    });

export const useParameters = (...paramIds: string[]) =>
    paramIds.map(id => {
        if (globContainer) {
            return globContainer.getParameter(id);
        }

        throw new RuntimeException(
            'Seems like the FunctionalDepencencyInjectorPass was not processed. Make sure that it is registered in container.',
        );
    });

export const useDependencies = (serviceIds: string[], paramIds: string[]): [unknown[], any[]] => [
    useServices(...serviceIds),
    useParameters(...paramIds),
];

export const injectServices = <T extends (...args: any[]) => any>(f: T, ...serviceIds: string[]) =>
    f.bind(f, ...useServices(...serviceIds));
export const injectParameters = <T extends (...args: any[]) => any>(f: T, ...paramIds: string[]) =>
    f.bind(f, ...useParameters(...paramIds));
export const injectDependencies = <T extends (...args: any[]) => any>(f: T, serviceIds: string[], paramIds: string[]) =>
    f.bind(f, ...useDependencies(serviceIds, paramIds));

export interface WithServices {
    services: unknown[];
}

export interface WithParameters {
    parameters: any[];
}

export interface WithDependencies extends WithServices, WithParameters {}

export const withServices = <T extends any, P extends WithServices, C extends (props: P) => T>(
    ...servicesIds: string[]
) => (component: C) => (props: Omit<P, keyof WithServices>) =>
    component({ ...props, services: useServices(...servicesIds) } as P);

export const withParameters = <T extends any, P extends WithParameters, C extends (props: P) => T>(
    ...paramIds: string[]
) => (component: C) => (props: Omit<P, keyof WithParameters>) =>
    component({ ...props, parameters: useParameters(...paramIds) } as P);

export const withDependencies = <T extends any, P extends WithDependencies, C extends (props: P) => T>(
    servicesIds: string[],
    paramIds: string[],
) => (component: C) => (props: Omit<P, keyof WithDependencies>) =>
    component({ ...props, services: useServices(...servicesIds), parameters: useParameters(...paramIds) } as P);

export class FunctionalDepencencyInjectorPass implements ICompilerPass {
    public async process(container: Container) {
        if (globContainer) {
            if (container.getParameter('kernel.environment') !== ('test' as any)) {
                throw new RuntimeException(
                    'Seems like the FunctionalDepencencyInjectorPass was already processed. Make sure that only one is loaded in container.',
                );
            }
        }

        globContainer = container;
    }
}
