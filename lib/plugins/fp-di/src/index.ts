import { Container, ICompilerPass, RuntimeException } from '@sifodyas/sifodyas';

let globContainer: Container = null;
export const useDependencies = (...serviceIds: string[]) =>
    serviceIds.map(id => {
        if (globContainer) {
            return globContainer.get(id);
        }

        throw new RuntimeException(
            'Seems like the FunctionalDepencencyInjectorPass was not processed. Make sure that it is registered in container.',
        );
    });

export const injectDependencies = <T extends (...args: any[]) => any>(f: T, ...serviceIds: string[]) =>
    f.bind(f, ...useDependencies(...serviceIds));

export interface WithDependencies {
    services: any[];
}

export const withDependencies = <T extends any>(
    ...servicesIds: string[]
): (<P extends WithDependencies>(component: (props: P) => T) => (props: Omit<P, 'services'>) => T) => {
    return component => (props: any) => component({ ...props, services: useDependencies(...servicesIds) });
};

export class FunctionalDepencencyInjectorPass implements ICompilerPass {
    public async process(container: Container) {
        if (globContainer) {
            throw new RuntimeException(
                'Seems like the FunctionalDepencencyInjectorPass was already processed. Make sure that only one is loaded in container.',
            );
        }

        globContainer = container;
    }
}
