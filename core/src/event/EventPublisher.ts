import { EventKeyType } from '..';
import { IReset } from '../IReset';

export type EventType<KEY extends keyof EventKeyType> = EventKeyType[KEY];
export type EventObserver<KEY extends keyof EventKeyType = any> = (event: EventType<KEY>) => void;

export class EventPublisher implements IReset {
    public eventMap = new Map<keyof EventKeyType, EventObserver[]>();

    public publish<KEY extends keyof EventKeyType>(id: KEY, event: EventType<KEY>) {
        (this.eventMap.get(id) ?? []).forEach(observer => observer(event));
    }

    public reset() {
        this.eventMap.clear();
    }
}
