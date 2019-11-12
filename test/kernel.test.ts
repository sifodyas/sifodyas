import { BundleExtended, Container, Core, ILoader, Kernel, TolerantKernel } from '../src';
import { Utils } from './__utils__/Utils';

const ENV_VAR_MOCK = 'ENV_VAR_MOCK';

describe('Kernel', () => {
    let configRoot: string;

    beforeAll(() => {
        process.env.ENV_VAR_MOCK = ENV_VAR_MOCK;
        configRoot = Utils.configRoot;
    });

    it('should create and boot properly a Kernel instance', async () => {
        const kernel = new (class TestKernel extends Kernel {
            public async registerContainerConfiguration(loader: ILoader): Promise<void> {
                return loader.load({ content: '{}', path: 'test.json' });
            }

            public registerBundles(): BundleExtended[] {
                return [];
            }
        })('test', true);

        await expect(kernel.boot()).resolves.not.toThrow();
        expect(kernel.getName()).toEqual('TestKernel');
        expect(kernel['container']).not.toBeNull();
        expect(kernel['booted']).toBeTruthy();
    });

    [
        'config.yaml',
        'config.json',
        'config_hybrid.yaml',
        'config_hybrid.json',
        'config_override.yaml',
        //
    ].forEach(config =>
        it(`should load ${config}`, async () => {
            const kernel = new (class TestKernel extends TolerantKernel {
                public async registerContainerConfiguration(loader: ILoader): Promise<void> {
                    return loader.load(await Core.getResource(`${configRoot}/${config}`));
                }

                public registerBundles(): BundleExtended[] {
                    return [];
                }
            })('test', true);

            await kernel.boot();

            const container: Container = kernel['container'];

            expect(await container.getParameter('foo')).toEqual('bar');
            expect(await container.getParameter('bar')).toEqual(ENV_VAR_MOCK);
            expect(await container.getParameter('baz')).toEqual({
                bar: 'baz',
                foo: 'bar',
            });
        }),
    );

    it('should fail loading unknown conf', async () => {
        const kernel = new (class TestKernel extends Kernel {
            public async registerContainerConfiguration(loader: ILoader): Promise<void> {
                return loader.load(await Core.getResource(`${configRoot}/config_bundle.yaml`));
            }

            public registerBundles(): BundleExtended[] {
                return [];
            }
        })('test', true);

        await expect(kernel.boot()).rejects.toThrow();
    });

    it('should NOT fail loading unknown conf with Tolerant', async () => {
        const kernel = new (class TestKernel extends TolerantKernel {
            public async registerContainerConfiguration(loader: ILoader): Promise<void> {
                return loader.load(await Core.getResource(`${configRoot}/config_bundle.yaml`));
            }

            public registerBundles(): BundleExtended[] {
                return [];
            }
        })('test', true);

        await expect(kernel.boot()).resolves.not.toThrow();
    });
});
