import { Ctor, Use } from '@lsagetlethias/tstrait';
import { Container } from '../../dependencyInjection/Container';
import { ContainerAwareTrait } from '../../dependencyInjection/ContainerAwareTrait';
import { IExtension } from '../../dependencyInjection/extension/IExtension';
import { IBundle } from './IBundle';

/**
 * An implementation of IBundle.
 */
abstract class AbstractBundle implements IBundle {
    protected name!: string;

    public abstract boot(): Promise<any>;

    public abstract shutdown(): Promise<any>;

    public build(_container: Container) {}

    public getName() {
        return (this.name = this.name ?? this.constructor.name);
    }

    /** @deprecated */
    public getNamespace() {
        return '';
    }

    public getContainerExtension(): IExtension {
        return null;
    }

    public isCore() {
        return false;
    }
}

export type BundleExtended = AbstractBundle & ContainerAwareTrait;
export const BundleClass = Use(ContainerAwareTrait)(AbstractBundle as Ctor<AbstractBundle>);
