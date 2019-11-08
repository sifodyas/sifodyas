import { Ctor, Use } from '@bios21/tstrait';
import { Container } from '../../dependencyInjection/Container';
import { ContainerAwareTrait } from '../../dependencyInjection/ContainerAwareTrait';
import { IExtension } from '../../dependencyInjection/extension/IExtension';
import { IBundle } from './IBundle';

/**
 * An implementation of IBundle.
 */
abstract class AbstractBundle implements IBundle {
    protected name!: string;

    public abstract async boot(): Promise<any>;

    public abstract async shutdown(): Promise<any>;

    public build(_container: Container): void {}

    public getParent(): string {
        return null as any;
    }

    public getName() {
        return (this.name = this.name || this.constructor.name);
    }

    public abstract getNamespace(): string;

    public getContainerExtension(): IExtension {
        return null as any;
    }

    public isCore() {
        return false;
    }
}

export type BundleExtended = AbstractBundle & ContainerAwareTrait;
export const BundleClass = Use(ContainerAwareTrait)(AbstractBundle as Ctor<AbstractBundle>);
