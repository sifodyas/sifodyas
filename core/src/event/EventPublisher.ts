import { EventKeyType, UnknownMapping } from '..';
import { IReset } from '../IReset';

export type EventType<KEY extends keyof EventKeyType> = EventKeyType[KEY];
export type EventObserver<KEY extends keyof EventKeyType = any> = (event: EventType<KEY>) => void;

export class EventPublisher implements IReset {
    public eventMap = new Map<string, EventObserver[]>();

    public publish<
        KEY extends keyof EventKeyType | UnknownMapping,
        EVENT extends KEY extends keyof EventKeyType ? EventType<KEY> : unknown
    >(id: KEY | keyof EventKeyType, event: EVENT) {
        (this.eventMap.get(id) ?? []).forEach(observer => observer(event));
    }

    public reset() {
        this.eventMap.clear();
    }
}
