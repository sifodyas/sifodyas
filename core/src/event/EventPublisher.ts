import { EventKeyType, UnknownMapping } from '..';
import { IReset } from '../IReset';

/**
 * Corresponding mapped type from a given event id.
 */
export type EventType<KEY extends keyof EventKeyType> = EventKeyType[KEY];
export type EventObserver<KEY extends keyof EventKeyType = any> = (event: EventType<KEY>) => void;

/**
 * Publisher service for every event to publish into in the sifodyas system.
 *
 * Available under `event_publisher` service id only if `kernel.events` parameter is enabled.
 */
export class EventPublisher implements IReset {
    /**
     * Internal access to the eventMap. Can be used to "raw-subscribe" to an event.
     */
    public eventMap = new Map<string, EventObserver[]>();

    /**
     * Publish an event object to a given event id.
     */
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
