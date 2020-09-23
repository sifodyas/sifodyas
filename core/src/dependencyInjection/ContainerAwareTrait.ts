import { Trait } from '@lsagetlethias/tstrait';
import { Container } from './Container';

/**
 * ContainerAware trait.
 */
export class ContainerAwareTrait extends Trait {
    public container: Container = null;

    /**
     * Sets the container.
     *
     * @param container A Container instance or null.
     */
    public setContainer(container: Container) {
        this.container = container;
    }
}
