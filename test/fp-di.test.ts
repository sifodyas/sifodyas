import * as fpDi from '@sifodyas/fp-di';
import { BundleExtended, Container, Kernel } from '@sifodyas/sifodyas';

describe('Functional Programing Dependency Injection Plugin', () => {
    const TEST_SERVICE_ID = 'TEST_SERVICE_ID';
    const TEST_PARAM_ID = 'TEST_SERVICE_ID';
    class TestKernel extends Kernel {
        public async registerContainerConfiguration(_) {}
        public registerBundles(): BundleExtended[] {
            return [];
        }
    }

    it('get services', async () => {
        const flagBoot = jest.fn();
        class TestService {
            public run() {
                flagBoot();
            }
        }

        await new (class extends TestKernel {
            public build(container: Container) {
                container.set(TEST_SERVICE_ID, new TestService());
                container.addCompilerPass(new fpDi.FunctionalDepencencyInjectorPass());
            }
        })('test', true).boot();

        // hook like
        (() => {
            const [service] = fpDi.useServices(TEST_SERVICE_ID) as [TestService];
            service.run();
        })();

        // inject in param
        fpDi.injectServices((service: TestService) => service.run(), TEST_SERVICE_ID)();

        // hof / hoc
        fpDi.withServices(TEST_SERVICE_ID)(props => (props.services[0] as TestService).run())({});

        expect(flagBoot).toBeCalledTimes(3);
    });

    it('get parameters', async () => {
        await new (class extends TestKernel {
            public build(container: Container) {
                container.setParameter(TEST_PARAM_ID, TEST_PARAM_ID);
                container.addCompilerPass(new fpDi.FunctionalDepencencyInjectorPass());
            }
        })('test', true).boot();

        // hook like
        const f1 = () => {
            const [param] = fpDi.useParameters(TEST_PARAM_ID);
            return param;
        };
        expect(f1()).toEqual(TEST_PARAM_ID);

        // inject in param
        const f2 = fpDi.injectParameters((param: string) => param, TEST_PARAM_ID);
        expect(f2()).toEqual(TEST_PARAM_ID);

        // hof / hoc
        const f3 = fpDi.withParameters(TEST_PARAM_ID);
        const ehanced = f3(props => props.parameters[0]);
        expect(ehanced({})).toEqual(TEST_PARAM_ID);
    });

    it('get dependencies', async () => {
        const flagBoot = jest.fn();
        class TestService {
            public run() {
                flagBoot();
            }
        }
        await new (class extends TestKernel {
            public build(container: Container) {
                container.set(TEST_SERVICE_ID, new TestService());
                container.setParameter(TEST_PARAM_ID, TEST_PARAM_ID);
                container.addCompilerPass(new fpDi.FunctionalDepencencyInjectorPass());
            }
        })('test', true).boot();

        // hook like
        const f1 = () => {
            const [[service], [param]] = fpDi.useDependencies([TEST_SERVICE_ID], [TEST_PARAM_ID]) as [
                [TestService],
                [string],
            ];
            service.run();
            return param;
        };
        expect(f1()).toEqual(TEST_PARAM_ID);

        // inject in param
        const f2 = fpDi.injectDependencies(
            ([service]: [TestService], [param]: [string]) => {
                service.run();
                return param;
            },
            [TEST_SERVICE_ID],
            [TEST_PARAM_ID],
        );
        expect(f2()).toEqual(TEST_PARAM_ID);

        // hof / hoc
        const f3 = fpDi.withDependencies([TEST_SERVICE_ID], [TEST_PARAM_ID]);
        const ehanced = f3(props => {
            (props.services[0] as TestService).run();
            return props.parameters[0];
        });
        expect(ehanced({})).toEqual(TEST_PARAM_ID);
    });
});
