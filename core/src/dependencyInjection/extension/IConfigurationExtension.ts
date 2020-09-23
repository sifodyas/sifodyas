import { IConfiguration } from '../../config/definition/IConfiguration';
import { Container } from '../Container';
import { GenericConfig } from './IExtension';

/**
 * IConfigurationExtension is the interface implemented by container extension classes.
 */
export interface IConfigurationExtension<T> {
    /**
     * Returns extension configuration.
     *
     * @param config Config values.
     * @param container A Container instance.
     */
    getConfiguration(config: GenericConfig, container: Container): IConfiguration<T>;
}
