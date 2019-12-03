import { Container, ICompilerPass, RuntimeException } from '@sifodyas/sifodyas';

let globContainer: Container = null;
export const useServices = async (...serviceIds: string[]) =>
    Promise.all(
        serviceIds.map(id => {
            if (globContainer) {
                return Promise.resolve(globContainer.get(id));
            }

            throw new RuntimeException(
                'Seems like the FunctionalDepencencyInjectorPass was not processed. Make sure that it is registered in container.',
            );
        }),
    );

export const useParameters = async (...paramIds: string[]) =>
    Promise.all(
        paramIds.map(id => {
            if (globContainer) {
                return globContainer.getParameter(id);
            }

            throw new RuntimeException(
                'Seems like the FunctionalDepencencyInjectorPass was not processed. Make sure that it is registered in container.',
            );
        }),
    );

export const useDependencies = async (serviceIds: string[], paramIds: string[]): Promise<[unknown[], any[]]> => [
    await useServices(...serviceIds),
    await useParameters(...paramIds),
];

export const injectServices = async <T extends (...args: any[]) => any>(f: T, ...serviceIds: string[]) =>
    f.bind(f, ...(await useServices(...serviceIds)));
export const injectParameters = async <T extends (...args: any[]) => any>(f: T, ...paramIds: string[]) =>
    f.bind(f, ...(await useParameters(...paramIds)));
export const injectDependencies = async <T extends (...args: any[]) => any>(
    f: T,
    serviceIds: string[],
    paramIds: string[],
) => f.bind(f, ...(await useDependencies(serviceIds, paramIds)));

export interface WithServices {
    services: unknown[];
}

export interface WithParameters {
    parameters: any[];
}

export interface WithDependencies extends WithServices, WithParameters {}

export const withServices = async <T extends any, P extends WithServices, C extends (props: P) => T>(
    ...servicesIds: string[]
) => {
    const services = await useServices(...servicesIds);
    return (component: C) => (props: Omit<P, keyof WithServices>) => component({ ...props, services } as P);
};

export const withParameters = async <T extends any, P extends WithParameters, C extends (props: P) => T>(
    ...paramIds: string[]
) => {
    const parameters = await useParameters(...paramIds);
    return (component: C) => (props: Omit<P, keyof WithParameters>) => component({ ...props, parameters } as P);
};

export const withDependencies = async <T extends any, P extends WithDependencies, C extends (props: P) => T>(
    servicesIds: string[],
    paramIds: string[],
) => {
    const services = await useServices(...servicesIds);
    const parameters = await useParameters(...paramIds);
    return (component: C) => (props: Omit<P, keyof WithDependencies>) =>
        component({ ...props, services, parameters } as P);
};

export class FunctionalDepencencyInjectorPass implements ICompilerPass {
    public async process(container: Container) {
        if (globContainer) {
            if ((await container.getParameter('kernel.environment')) !== ('test' as any)) {
                throw new RuntimeException(
                    'Seems like the FunctionalDepencencyInjectorPass was already processed. Make sure that only one is loaded in container.',
                );
            }
        }

        globContainer = container;
    }
}
