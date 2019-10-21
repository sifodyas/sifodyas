import { Trait, Traitable } from '../core/Trait';
import { Container } from './Container';

/**
 * ContainerAware trait.
 */
export class ContainerAwareTrait extends Trait implements _ContainerAwareTrait {
    public container: Container = null;

    /**
     * Sets the container.
     *
     * @param container A Container instance or null.
     */
    public setContainer(container: Container): void {
        this.container = container;
    }
}

export interface _ContainerAwareTrait extends Traitable { // tslint:disable-line
    container?: Container;

    /**
     * Sets the container.
     *
     * @param container A Container instance or null.
     */
    setContainer?(container: Container): void;
}
