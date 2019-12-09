import { BundleExtended, Container, ILoader, LocalLoader, TolerantKernel } from '@sifodyas/sifodyas';
import { YamlPrefixParserPass } from '@sifodyas/yaml-env-parser';

const ENV_VAR_MOCK = `
p1: foo
p2: bar
`;

describe('Kernel', () => {
    beforeAll(() => {
        process.env.ENV_VAR_MOCK = ENV_VAR_MOCK;
    });

    it(`should load yml: prefix`, async () => {
        const kernel = new (class TestKernel extends TolerantKernel {
            public loaders = [LocalLoader];
            public async registerContainerConfiguration(loader: ILoader) {
                const content: any = {
                    parameters: {
                        foo: '%env(yml:ENV_VAR_MOCK)%',
                    },
                };
                await loader.load({
                    content,
                    path: '',
                });
            }

            public build(container: Container) {
                container.addCompilerPass(new YamlPrefixParserPass());
            }

            public registerBundles(): BundleExtended[] {
                return [];
            }
        })('test', true);

        await kernel.boot();

        const c: Container = kernel['container'];

        expect(c.getParameter('foo')).toEqual({ p1: 'foo', p2: 'bar' });
    });
});
