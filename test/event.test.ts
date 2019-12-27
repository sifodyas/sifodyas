import { FunctionalDepencencyInjectorPass, getParameter, getService } from '@sifodyas/fp-di';
import { BundleExtended, Container, EventPublisher, EventSubscriber, ILoader, Kernel } from '@sifodyas/sifodyas';

describe('Event system', () => {
    let kernel: Kernel & { setFooService(): void };
    let eventPublisher: EventPublisher;
    let eventSubscriber: EventSubscriber;
    eventPublisher;

    beforeEach(() => {
        kernel = new (class TestKernel extends Kernel {
            /** @override */
            protected async initializeContainer() {
                await super.initializeContainer();

                eventPublisher = this.container.get('event_publisher');
                eventSubscriber = this.container.get('event_subscriber');
            }

            /** @override */
            public build(container: Container) {
                container.addCompilerPass(new FunctionalDepencencyInjectorPass());
            }
            public async registerContainerConfiguration(loader: ILoader): Promise<void> {
                return loader.load({ content: '{}', path: 'test.json' });
            }

            public registerBundles(): BundleExtended[] {
                return [];
            }

            public setFooService() {
                this.container.set('foo', 'bar');
            }
        })('test', true);
    });

    it('should detect when kernel is shutting down', async () => {
        const fn = jest.fn();
        await kernel.boot();
        eventSubscriber.subscribe('event.kernel.shutdown', fn);

        await kernel.shutdown();

        expect(fn).toBeCalledTimes(1);
    });

    it('should detect when we moving something from the container', async () => {
        await kernel.boot();
        const fn = jest.fn();

        eventSubscriber.subscribeOnce('event.container.getParameter', evt => {
            expect(evt.getState().getParameterId).toEqual('kernel.debug');
            fn();
        });
        getParameter('kernel.debug');

        eventSubscriber.subscribeOnce('event.container.setService', evt => {
            expect(evt.getState().setServiceId).toEqual('foo');
            fn();
        });
        kernel.setFooService();

        eventSubscriber.subscribeOnce('event.container.getService', evt => {
            expect(evt.getState().getServiceId).toEqual('foo');
            fn();
        });
        getService('foo');

        eventSubscriber.subscribeOnce('event.container.beforeReset', evt => {
            expect(evt.getState().reset).toEqual(true);
            fn();
        });
        (kernel['container'] as Container).reset();

        expect(fn).toBeCalledTimes(4);
    });

    it('should only trigger once', async () => {
        await kernel.boot();
        const fn = jest.fn();

        eventSubscriber.subscribeOnce('event.container.getParameter', evt => {
            expect(evt.getState().getParameterId).toEqual('kernel.debug');
            fn();
        });
        getParameter('kernel.debug');
        getParameter('kernel.debug');

        expect(fn).toBeCalledTimes(1);
    });

    it('should only trigger multiple times', async () => {
        await kernel.boot();
        const fn = jest.fn();

        eventSubscriber.subscribe('event.container.getParameter', evt => {
            expect(evt.getState().getParameterId).toEqual('kernel.debug');
            fn();
        });
        getParameter('kernel.debug');
        getParameter('kernel.debug');

        expect(fn).toBeCalledTimes(2);
    });
});