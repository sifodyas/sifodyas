import {
    Bundle,
    BundleExtended,
    Core,
    Extension,
    IConfiguration,
    ILoader,
    JsonLoader,
    Kernel,
    TolerantKernel,
} from '@sifodyas/sifodyas';
import { YamlLoader } from '@sifodyas/yaml-loader';
import { Utils } from './__utils__/Utils';

const ENV_VAR_MOCK = 'ENV_VAR_MOCK';

describe('Bundle', () => {
    let kernel: Kernel;

    beforeAll(() => {
        process.env.ENVVAR1 = ENV_VAR_MOCK;
    });

    beforeEach(() => {
        kernel = new (class TestKernel extends TolerantKernel {
            public loaders = [YamlLoader, JsonLoader];
            public async registerContainerConfiguration(loader: ILoader): Promise<void> {
                const resource = await Core.getResource(`${Utils.configRoot}/config_bundle.yaml`);
                return loader.load(resource);
            }

            public registerBundles(): BundleExtended[] {
                return [];
            }
        })('test', true);
    });

    it('should boot a Bundle', async () => {
        const flagBoot = jest.fn();
        kernel.registerBundles = () => [
            new (class TestBundle extends Bundle {
                public async boot(): Promise<any> {
                    flagBoot();
                    return true;
                }
                public shutdown(): Promise<any> {
                    throw new Error('Method not implemented.');
                }
                public getNamespace(): string {
                    throw new Error('Method not implemented.');
                }
            })(),
        ];

        await kernel.boot();

        expect(flagBoot).toBeCalledTimes(1);
    });

    it('should boot a Bundle with a config', async () => {
        const flagBoot = jest.fn();
        kernel.registerBundles = () => [
            new (class TestBundle extends Bundle {
                public async boot(): Promise<any> {
                    flagBoot();
                    return true;
                }
                public shutdown(): Promise<any> {
                    throw new Error('Method not implemented.');
                }
                public getNamespace(): string {
                    throw new Error('Method not implemented.');
                }

                public getContainerExtension() {
                    return new (class TestExtension extends Extension {
                        private configuration: IConfiguration<any>;
                        public getConfiguration(): IConfiguration<any> {
                            return (this.configuration =
                                this.configuration ||
                                new (class TestConfigueation implements IConfiguration<any> {
                                    public validateConfig(rawConfig: any) {
                                        return rawConfig;
                                    }
                                })());
                        }
                        public async load(configs: object) {
                            const config = this.processConfiguration(this.getConfiguration(), configs);

                            // p1: foo
                            // p2: '%env(ENVVAR1)%'
                            // p2: '%bar%'
                            expect(config).toEqual({ p1: 'foo', p2: ENV_VAR_MOCK, p3: 'baz' });
                        }

                        public getAlias() {
                            return 'test';
                        }
                    })();
                }
            })(),
        ];

        await kernel.boot();

        expect(flagBoot).toBeCalledTimes(1);
    });
});
