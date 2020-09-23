import { IConfiguration } from '../../config/definition/IConfiguration';
import { Core } from '../../core/Core';
import { BundleExtended } from '../../kernel/bundle/Bundle';
import { Container } from '../Container';
import { LogicException } from '../exception/LogicException';
import { IConfigurationExtension } from './IConfigurationExtension';
import { GenericConfig, IExtension } from './IExtension';

/**
 * Provides useful features shared by many extensions.
 */
export abstract class Extension<T = GenericConfig> implements IExtension, IConfigurationExtension<T> {
    protected bundle: BundleExtended;
    protected processedConfig: unknown = null;

    constructor(bundle?: BundleExtended) {
        this.bundle = bundle;
    }

    protected processConfiguration(configuration: IConfiguration<T>, configs: T): T {
        return {
            ...(this.processedConfig = configuration?.validateConfig(configs) ?? configs),
        };
    }

    /**
     * @internal
     */
    public getProcessedConfig() {
        try {
            return this.processedConfig;
        } finally {
            this.processedConfig = null;
        }
    }

    public abstract getConfiguration(config: GenericConfig, container: Container): IConfiguration<T>;

    public abstract load(configs: GenericConfig, container: Container): Promise<void>;

    public getAlias() {
        const SUFFIX = 'Extension',
            SUFFIX_TRICK_LENGTH = -SUFFIX.length;

        const className = this.constructor.name;
        if (className.substr(SUFFIX_TRICK_LENGTH) !== SUFFIX) {
            throw new LogicException(
                `This extension (${className}) does not follow the naming convention; you must overwrite the getAlias() method.`,
            );
        }

        return Core.toSnakeCase(className.replace(SUFFIX, ''));
    }
}
