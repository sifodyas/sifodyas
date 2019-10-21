import { DelegatingLoader } from '../config/DelegatingLoader';
import { ILoader } from '../config/ILoader';
import { JsonLoader } from '../config/JsonLoader';
import { LoaderResolver } from '../config/LoaderResolver';
import { YamlLoader } from '../config/YamlLoader';
import { Container } from '../dependencyInjection/Container';
import { Kernel, KernelParametersKey } from './Kernel';

/**
 * The Kernel is the heart of the Sifodyas system.
 *
 * It manages an environment made of bundles.
 *
 * In its tolerant form, it can accept config file with non-loaded bundle section for multi shared file.
 */
export abstract class TolerantKernel extends Kernel {
    /** @inheritDoc */
    protected getContainerLoader(container: Container): ILoader {
        const resolver = new class TolerantLoaderResolver extends LoaderResolver {
            public addLoader(loader: ILoader): void {
                const tmpLoadMethod = loader.load.bind(loader);
                loader.load = async (resource: any, type?: string) => {
                    try {
                        await tmpLoadMethod(resource, type);
                    } catch (e) {
                        if (e.baseClass !== 'LogicException') {
                            throw e;
                        }
                    }
                };
                super.addLoader(loader);
            }
        }([new YamlLoader(container), new JsonLoader(container)]);

        return new DelegatingLoader(resolver);
    }

    /** @inheritDoc */
    protected getKernelParameters(): Map<KernelParametersKey | string, any> {
        const parameters = super.getKernelParameters();
        parameters.set('kernel.tolerant', true);

        return parameters;
    }
}
