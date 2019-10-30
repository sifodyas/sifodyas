import { Use } from '../../core/@/Use';
import { Container } from '../../dependencyInjection/Container';
import { _ContainerAwareTrait, ContainerAwareTrait } from '../../dependencyInjection/ContainerAwareTrait';
import { IExtension } from '../../dependencyInjection/extension/IExtension';
import { IBundle } from './IBundle';

/**
 * An implementation of IBundle.
 */
@Use(ContainerAwareTrait)
abstract class BundleObject implements IBundle {
    protected name!: string;

    /** @inheritDoc */
    public abstract async boot(): Promise<any>;

    /** @inheritDoc */
    public abstract async shutdown(): Promise<any>;

    /** @inheritDoc */
    public build(_container: Container): void {}

    /** @inheritDoc */
    public getParent(): string {
        return null as any;
    }

    /** @inheritDoc */
    public getDependencies(): string[] {
        return null as any;
    }

    /** @inheritDoc */
    public getName() {
        return (this.name = this.name || this.constructor.name);
    }

    /** @inheritDoc */
    public abstract getNamespace(): string;

    /** @inheritDoc */
    public getContainerExtension(): IExtension {
        return null as any;
    }

    /** @inheritDoc */
    public isCore() {
        return false;
    }
}

export type BundleExtended = BundleObject & ContainerAwareTrait;

declare abstract class Bundle extends BundleObject implements _ContainerAwareTrait {
    public container: Container;

    public setContainer(container: Container): void;
}

export const BundleClass = BundleObject as typeof Bundle;
