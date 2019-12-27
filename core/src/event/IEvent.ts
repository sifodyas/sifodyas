export interface IEvent<TState = unknown> {
    namespace: string;

    /**
     * Get the current state of the event or of the component from which the event was fired.
     */
    getState?(): TState;
}
