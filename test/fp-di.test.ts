import * as fpDi from '@sifodyas/fp-di';
import { BundleExtended, Container, Kernel } from '@sifodyas/sifodyas';

const TEST_SERVICE_ID = 'TEST_SERVICE_ID';
const TEST_PARAM_ID = 'TEST_SERVICE_ID';

declare module '@sifodyas/sifodyas' {
    interface KernelParametersKeyType {
        [TEST_PARAM_ID]: string;
    }

    interface ServicesKeyType {
        [TEST_SERVICE_ID]: { run(): void };
    }
}

describe('Functional Programing Dependency Injection Plugin', () => {
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
            const [service] = fpDi.getServices(TEST_SERVICE_ID);
            service.run();
        })();
        (() => fpDi.getService(TEST_SERVICE_ID).run())();

        // inject in param
        fpDi.injectServices(([service]) => service.run(), TEST_SERVICE_ID)();
        fpDi.injectService(service => service.run(), TEST_SERVICE_ID)();

        // hof / hoc
        fpDi.withServices(TEST_SERVICE_ID)(props => props.services[0].run())({});
        fpDi.withService(TEST_SERVICE_ID)(props => props.service.run())({});

        expect(flagBoot).toBeCalledTimes(6);
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
            const [param] = fpDi.getParameters(TEST_PARAM_ID);
            return param;
        };
        expect(f1()).toEqual(TEST_PARAM_ID);
        const f1bis = () => fpDi.getParameter(TEST_PARAM_ID);
        expect(f1bis()).toEqual(TEST_PARAM_ID);

        // inject in param
        const f2 = fpDi.injectParameters(([param]) => param, TEST_PARAM_ID);
        expect(f2()).toEqual(TEST_PARAM_ID);
        const f2bis = fpDi.injectParameter(param => param, TEST_PARAM_ID);
        expect(f2bis()).toEqual(TEST_PARAM_ID);

        // hof / hoc
        const f3 = fpDi.withParameters(TEST_PARAM_ID);
        const ehancedF3 = f3(({ parameters: [param] }) => param);
        expect(ehancedF3({})).toEqual(TEST_PARAM_ID);

        const f3bis = fpDi.withParameter(TEST_PARAM_ID);
        const ehancedF3bis = f3bis(({ parameter }) => parameter);
        expect(ehancedF3bis({})).toEqual(TEST_PARAM_ID);
    });
});
