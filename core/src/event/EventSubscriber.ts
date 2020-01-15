import { EventKeyType, UnknownMapping } from '..';
import { IReset } from '../IReset';
import { EventObserver, EventPublisher } from './EventPublisher';

/**
 * Subscriber service for every event to subscribe to in the sifodyas system.
 *
 * Available under `event_subscriber` service id only if `kernel.events` parameter is enabled.
 */
export class EventSubscriber implements IReset {
    constructor(private eventPublisher: EventPublisher) {}

    /**
     * Subscribe to an event with an obeserver function everytime that a publish is made.
     *
     * The observer function, or callback, will have the event object (related to the event triggreed) as parameter.
     */
    public subscribe<
        KEY extends keyof EventKeyType | UnknownMapping,
        OBSERVER extends EventObserver<KEY extends keyof EventKeyType ? KEY : any>
    >(id: KEY, observer: OBSERVER) {
        const observers = this.eventPublisher.eventMap.get(id) ?? [];
        observers.push(observer);
        this.eventPublisher.eventMap.set(id, observers);
    }

    /**
     * Same as subscribe but will automatically unsubscribe after one fired event.
     */
    public subscribeOnce<KEY extends keyof EventKeyType>(id: KEY, observer: EventObserver<KEY>) {
        const onceObserver: EventObserver<KEY> = evt => {
            this.unsubscribe(id, onceObserver);
            observer(evt);
        };

        this.subscribe(id, onceObserver);
    }

    /**
     * Unsubscribe to a given event by giving it again the same observer function used during subscribe.
     */
    public unsubscribe<KEY extends keyof EventKeyType>(id: KEY, observer: EventObserver<KEY>) {
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
