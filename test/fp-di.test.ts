import {
    FunctionalDepencencyInjectorPass,
    injectDependencies,
    useDependencies,
    withDependencies,
} from '@sifodyas/fp-di';
import { BundleExtended, Container, Kernel } from '@sifodyas/sifodyas';

describe('Functional Programing Dependency Injection Plugin', () => {
    const TEST_SERVICE_ID = 'TEST_SERVICE_ID';
    class TestKernel extends Kernel {
        public async registerContainerConfiguration(_) {}
        public registerBundles(): BundleExtended[] {
            return [];
        }
    }
    it('inject properly', async () => {
        const flagBoot = jest.fn();
        class TestService {
            public run() {
                flagBoot();
            }
        }

        await new (class extends TestKernel {
            public build(container: Container) {
                container.set(TEST_SERVICE_ID, new TestService());
                container.addCompilerPass(new FunctionalDepencencyInjectorPass());
            }
        })('test', true).boot();

        // hook like
        (() => {
            const [service] = useDependencies(TEST_SERVICE_ID) as [TestService];
            service.run();
        })();

        // inject in param
        injectDependencies((service: TestService) => service.run(), TEST_SERVICE_ID)();

        // hof / hoc
        withDependencies(TEST_SERVICE_ID)(props => (props.services[0] as TestService).run())({});

        expect(flagBoot).toBeCalledTimes(3);
    });
});
