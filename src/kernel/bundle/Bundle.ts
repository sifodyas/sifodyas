import { Ctor, Use } from '@bios21/tstrait';
import { Container } from '../../dependencyInjection/Container';
import { ContainerAwareTrait } from '../../dependencyInjection/ContainerAwareTrait';
import { IExtension } from '../../dependencyInjection/extension/IExtension';
import { IBundle } from './IBundle';

/**
 * An implementation of IBundle.
 */
abstract class BundleObject implements IBundle {
    protected name: string;

    /** @inheritDoc */
    public abstract async boot(): Promise<any>;

    /** @inheritDoc */
    public abstract async shutdown(): Promise<any>;

    /** @inheritDoc */
    public build(container: Container): void {}

    /** @inheritDoc */
    public getParent(): string {
        return null;
    }

    /** @inheritDoc */
    public getDependencies(): string[] {
        return null;
    }

    /** @inheritDoc */
    public getName() {
        return (this.name = this.name || this.constructor.name);
    }

    /** @inheritDoc */
    public abstract getNamespace(): string;

    /** @inheritDoc */
    public getContainerExtension(): IExtension {
        return null;
    }

    /** @inheritDoc */
    public isCore() {
        return false;
    }
}

export type BundleExtended = BundleObject & ContainerAwareTrait;
export const BundleClass = Use(ContainerAwareTrait)(BundleObject as Ctor<BundleObject>);
