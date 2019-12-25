export * from './config';
export * from './core';
export * from './dependencyInjection';
export * from './expressionLanguage';
export * from './kernel';

export * from './IReset';

// we explicitly export what could be ambient overridden
import { Container, ParameterBag } from './dependencyInjection';
import { Bundle, Kernel } from './kernel';
export { Container, ParameterBag, Bundle, Kernel };

export interface KernelParametersKeyType {
    'kernel.tolerant': boolean;
    'kernel.boot.sync': boolean;
    'kernel.unregister.parallel': boolean;
    'kernel.environment': 'dev' | 'prod' | 'test';
    'kernel.debug': boolean;
    'kernel.name': string;
    'kernel.bundles': string[];
    'kernel.coreBundles': string[];
    'kernel.version': string;
    'kernel.path': string;
}

export interface ServicesKeyType {
    kernel: Kernel;
    service_container: Container;
}
