import { EventKeyType, UnknownMapping } from '..';
import { IReset } from '../IReset';
import { EventObserver, EventPublisher } from './EventPublisher';
import { IEvent } from './IEvent';

/**
 * Subscriber service for every event to subscribe to in the sifodyas system.
 *
 * Available under `event_subscriber` service id only if `kernel.events` parameter is enabled.
 */
export class EventSubscriber implements IReset {
    constructor(private eventPublisher: EventPublisher) {}

    /**
     * Subscribe to an event with an observer function that will trigger everytime a publish is made.
     *
     * The observer function, or callback, will have the event object (related to the event triggered) as parameter.
     */
    public subscribe<
        KEY extends keyof EventKeyType | UnknownMapping,
        OBSERVER extends EventObserver<KEY extends keyof EventKeyType ? KEY : any>
    >(id: KEY | keyof EventKeyType, observer: OBSERVER) {
        const observers = this.eventPublisher.eventMap.get(id) ?? [];
        observers.push(observer);
        this.eventPublisher.eventMap.set(id, observers);
    }

    /**
     * Subscribe to an event with an async iterator. The iterator is "infinite" and will return a event object
     * (related to the event triggered) everytime a publish is made.
     *
     * This feature is experimental, use it at your own risk.
     *
     * @deprecated experimental
     */
    public async *iterate<KEY extends keyof EventKeyType | UnknownMapping>(
        id: KEY | keyof EventKeyType,
    ): AsyncIterableIterator<EventKeyType[KEY extends keyof EventKeyType ? KEY : any]> {
        yield* subsriberIterator(this, id);
    }

    /**
     * Same as subscribe but will automatically unsubscribe after one fired event.
     */
    public subscribeOnce<KEY extends keyof EventKeyType | UnknownMapping>(
        id: KEY | keyof EventKeyType,
        observer: EventObserver<KEY extends keyof EventKeyType ? KEY : any>,
    ) {
        const onceObserver: EventObserver<KEY extends keyof EventKeyType ? KEY : any> = evt => {
            this.unsubscribe(id, onceObserver);
            observer(evt);
        };

        this.subscribe(id, onceObserver);
    }

    /**
     * Unsubscribe to a given event by giving it again the same observer function used during subscribe.
     */
    public unsubscribe<KEY extends keyof EventKeyType | UnknownMapping>(
        id: KEY | keyof EventKeyType,
        observer: EventObserver<KEY extends keyof EventKeyType ? KEY : any>,
    ) {
        this.eventPublisher.eventMap.set(
            id,
            (this.eventPublisher.eventMap.get(id) ?? []).filter(obs => obs !== observer),
        );
    }

    /**
     * Reset and delete all event subscribed.
     */
    public reset() {
        this.eventPublisher.eventMap.clear();
    }
}

// utils
const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {}));

function createIterResult(value: unknown, done: boolean) {
    return { value, done };
}

interface PromiseResult<T> {
    resolve(value: T): void;
    reject(error: unknown): void;
}

/**
 * Node 13 EventEmitter.on port for Subscriber
 */
function subsriberIterator<
    TES extends EventSubscriber = EventSubscriber,
    TEvent extends keyof EventKeyType | UnknownMapping = keyof EventKeyType
>(emitter: TES, event: TEvent | keyof EventKeyType) {
    const unconsumedEvents: unknown[] = [];
    const unconsumedPromises: Array<PromiseResult<unknown>> = [];
    let error: Error | null = null;
    let finished = false;

    const iterator = Object.setPrototypeOf(
        {
            next() {
                // First, we consume all unread events
                const value = unconsumedEvents.shift();
                if (value) {
                    return Promise.resolve(createIterResult(value, false));
                }

                // Then we error, if an error happened
                // This happens one time if at all, because after 'error'
                // we stop listening
                if (error) {
                    const p = Promise.reject(error);
                    // Only the first element errors
                    error = null;
                    return p;
                }

                // If the iterator is finished, resolve to done
                if (finished) {
                    return Promise.resolve(createIterResult(undefined, true));
                }

                // Wait until an event happens
                return new Promise((resolve, reject) => {
                    unconsumedPromises.push({ resolve, reject });
                });
            },

            return() {
                emitter.unsubscribe(event, eventHandler);
                // emitter.unsubscribe('error', errorHandler);
                finished = true;

                for (const promise of unconsumedPromises) {
                    promise.resolve(createIterResult(undefined, true));
                }

                return Promise.resolve(createIterResult(undefined, true));
            },

            throw(err: unknown) {
                if (!err || !(err instanceof Error)) {
                    throw new Error(`subsriberIterator.AsyncIterator ${err}`);
                }
                error = err;
                emitter.unsubscribe(event, eventHandler);
                // emitter.unsubscribe('error', errorHandler);
            },

            [Symbol.asyncIterator]() {
                return this;
            },
        },
        AsyncIteratorPrototype,
    );

    emitter.subscribe(event, eventHandler);
    // emitter.subscribe('error', errorHandler);

    return iterator;

    function eventHandler(evt: IEvent) {
        const promise = unconsumedPromises.shift();
        if (promise) {
            promise.resolve(createIterResult(evt, false));
        } else {
            unconsumedEvents.push(evt);
        }
    }
}
