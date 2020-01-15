import { IEvent } from './IEvent';

/**
 * Event object generated for all kernel related event.
 *
 * Related to all `event.kernel.*` events triggered.
 */
export class KernelEvent implements IEvent {
    public namespace = 'kernel';
}
