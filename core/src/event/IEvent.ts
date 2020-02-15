/**
 * Event interface to mutualize common methods between event objects.
 *
 * It also ensure that the namespace of the event is persited through the event declaration process.
 * Basically, namespace are part of the event id to subscribe. `event.<namespace>.*`.
 */
export interface IEvent<TState = unknown> {
    namespace: string;

    /**
     * Get the current state of the event or of the component from which the event was fired.
     */
    getState?(): TState;
}
