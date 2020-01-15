import { EventKeyType, UnknownMapping } from '..';
import { IReset } from '../IReset';
import { EventObserver, EventPublisher } from './EventPublisher';

export class EventSubscriber implements IReset {
    constructor(private eventPublisher: EventPublisher) {}

    public subscribe<
        KEY extends keyof EventKeyType | UnknownMapping,
        OBSERVER extends EventObserver<KEY extends keyof EventKeyType ? KEY : any>
    >(id: KEY, observer: OBSERVER) {
        const observers = this.eventPublisher.eventMap.get(id) ?? [];
        observers.push(observer);
        this.eventPublisher.eventMap.set(id, observers);
    }

    public subscribeOnce<KEY extends keyof EventKeyType>(id: KEY, observer: EventObserver<KEY>) {
        const onceObserver: EventObserver<KEY> = evt => {
            this.unsubscribe(id, onceObserver);
            observer(evt);
        };

        this.subscribe(id, onceObserver);
    }

    public unsubscribe<KEY extends keyof EventKeyType>(id: KEY, observer: EventObserver<KEY>) {
        this.eventPublisher.eventMap.set(
            id,
            (this.eventPublisher.eventMap.get(id) ?? []).filter(obs => obs !== observer),
        );
    }

    public reset() {
        this.eventPublisher.eventMap.clear();
    }
}
