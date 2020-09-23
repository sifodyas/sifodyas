import { ParameterKeys, ServiceKeys } from '..';
import { Container } from '../dependencyInjection/Container';
import { EventException } from './EventException';
import { IEvent } from './IEvent';

interface ContainerState {
    getParameterId?: ParameterKeys;
    getServiceId?: ServiceKeys;
    setServiceId?: ServiceKeys;
    reset?: boolean;
    stack?: string;
}

/**
 * Event object generated for all container related event.
 *
 * Related to all `event.container.*` events triggered.
 */
export class ContainerEvent implements IEvent<ContainerState> {
    private inited = false;
    private _container: Container;

    private state: ContainerState = {};

    public namespace = 'container';

    constructor(container: Container) {
        this.container = container;
    }

    get container() {
        return this._container;
    }

    /**
     * Internal method to set the container. If it's called from outside (when the ContainerEvent is already inited),
     * it will throw an EventException.
     */
    set container(container: Container) {
        if (this.inited) {
            throw new EventException('Container should not be overided in a fired ContainerEvent.');
        }
        this._container = container;
        this.inited = true;
    }

    public getState() {
        return { ...this.state };
    }

    /**
     * Set a new modification to current state of the event.
     * The modification will update an "error stack" as an info data.
     *
     * If the property of state is unknown, an EventException will be fired.
     */
    public setModif<K extends keyof ContainerState>(type: Exclude<K, 'stack'>, value: ContainerState[K]) {
        if (this.state[type]) {
            throw new EventException('State cannot be modified in a fired ContainerEvent.');
        }
        this.state[type as K] = value;
        this.state.stack = new Error().stack;
        return this;
    }
}
