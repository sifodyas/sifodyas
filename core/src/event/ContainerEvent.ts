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

export class ContainerEvent implements IEvent<ContainerState> {
    private inited = false;
    private _container: Container;

    private state: ContainerState = {};

    public namespace = 'container';

    constructor(container: Container) {
        this.container = container;
    }

    public get container() {
        return this._container;
    }

    public set container(container: Container) {
        if (this.inited) {
            throw new EventException('Container should not be overided in a fired ContainerEvent.');
        }
        this._container = container;
        this.inited = true;
    }

    public getState() {
        return { ...this.state };
    }

    public setModif<K extends keyof ContainerState>(type: Exclude<K, 'stack'>, value: ContainerState[K]) {
        if (this.state[type]) {
            throw new EventException('State cannot be modified in a fired ContainerEvent.');
        }
        this.state[type as K] = value;
        this.state.stack = new Error().stack;
        return this;
    }
}
