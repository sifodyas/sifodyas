import { FunctionalDepencencyInjectorPass, getParameter, getService } from '@sifodyas/fp-di';
import {
    BundleExtended,
    Container,
    EventPublisher,
    EventSubscriber,
    IEvent,
    ILoader,
    Kernel,
    ParametersKeyType,
} from '@sifodyas/sifodyas';

class MockEvent implements IEvent {
    public namespace: 'myCustomEvent';
}

declare module '@sifodyas/sifodyas' {
    interface EventKeyType {
        myCustomEvent: MockEvent;
    }
}
class TestKernel extends Kernel {
    public ep: EventPublisher;
    public es: EventSubscriber;

    constructor(private disableEvent = false) {
        super('test', true);
    }

    /** @override */
    protected async initializeContainer() {
        await super.initializeContainer();

        this.ep = this.container.get('event_publisher');
        this.es = this.container.get('event_subscriber');
    }

    public async getOverriddenParameters(_container: Container) {
        if (this.disableEvent) {
            return new Map<keyof ParametersKeyType, unknown>([['kernel.events', false]]);
        }
        return super.getOverriddenParameters(_container);
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
}

describe('Event system', () => {
    let kernel: TestKernel;
    let eventPublisher: EventPublisher;
    let eventSubscriber: EventSubscriber;

    beforeEach(async () => {
        kernel = new TestKernel();
        await kernel.boot();
        eventPublisher = kernel.ep;
        eventSubscriber = kernel.es;
    });

    it('should detect when kernel is shutting down', async () => {
        const fn = jest.fn();
        await kernel.boot();
        eventSubscriber.subscribe('event.kernel.shutdown', fn);

        await kernel.shutdown();

        expect(fn).toBeCalledTimes(1);
    });

    it('should detect when we moving something from the container', async () => {
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
        const fn = jest.fn();

        eventSubscriber.subscribeOnce('event.container.getParameter', evt => {
            expect(evt.getState().getParameterId).toEqual('kernel.debug');
            fn();
        });
        getParameter('kernel.debug');
        getParameter('kernel.debug');

        expect(fn).toBeCalledTimes(1);
    });

    it('should trigger multiple times', async () => {
        const fn = jest.fn();

        eventSubscriber.subscribe('event.container.getParameter', evt => {
            expect(evt.getState().getParameterId).toEqual('kernel.debug');
            fn();
        });
        getParameter('kernel.debug');
        getParameter('kernel.debug');

        expect(fn).toBeCalledTimes(2);
    });

    it('should trigger by iteration multiple times', async () => {
        const fn = jest.fn();

        // defer listen
        const p = (async () => {
            let flag = 0;
            for await (const evt of eventSubscriber.iterate('event.container.getParameter')) {
                expect(evt.getState().getParameterId).toEqual('kernel.debug');
                fn();
                if (++flag === 2) {
                    // dont need to wait for other events
                    break;
                }
            }
        })();
        getParameter('kernel.debug');
        getParameter('kernel.debug');
        // wait for listen to finish
        await p;

        expect(fn).toBeCalledTimes(2);
    });

    it('should publish and subscribe to custom events', async () => {
        const fn = jest.fn();

        eventSubscriber.subscribe('myCustomEvent', evt => {
            expect(evt instanceof MockEvent).toBeTruthy();
            fn();
        });

        eventPublisher.publish('myCustomEvent', new MockEvent());

        expect(fn).toBeCalledTimes(1);
    });

    it('should not trigger event when they are disabled', async () => {
        const noEventKernel = new TestKernel(true);
        await noEventKernel.boot();

        expect(noEventKernel.ep).toBeUndefined();
        expect(noEventKernel.es).toBeUndefined();
    });
});
