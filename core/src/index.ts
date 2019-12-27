export * from './config';
export * from './core';
export * from './dependencyInjection';
export * from './event';
export * from './expressionLanguage';
export * from './kernel';

export * from './IReset';

// we explicitly export what could be ambient augmented without using the "dist" path
import { Container, ParameterBag } from './dependencyInjection';
import { ContainerEvent, KernelEvent } from './event';
import { EventPublisher } from './event/EventPublisher';
import { EventSubscriber } from './event/EventSubscriber';
import { Bundle, Kernel } from './kernel';
export { Container, ParameterBag, Bundle, Kernel };

/**
 * Mapping between parameter keys and their corresponding types.
 *
 * This interface can be augmented to type the `get` function return type from the Container.
 */
export interface ParametersKeyType {
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
    'kernel.events': boolean;
}

/**
 * Mapping between service keys and their corresponding types.
 *
 * This interface can be augmented to type the `getService` function return type from the Container.
 */
export interface ServicesKeyType {
    kernel: Kernel;
    service_container: Container;
    event_publisher: EventPublisher;
    event_subscriber: EventSubscriber;
}
/**
 * Mapping between event keys and their corresponding type.
 *
 * This interface can be augmented to type the event system.
 */
export interface EventKeyType {
    'event.kernel.shutdown': KernelEvent;
    'event.container.getParameter': ContainerEvent;
    'event.container.getService': ContainerEvent;
    'event.container.setService': ContainerEvent;
    'event.container.beforeReset': ContainerEvent;
}

export type ServiceKeys = keyof ServicesKeyType;
export type ParameterKeys = keyof ParametersKeyType;

/**
 * Hack for union string litteral with string to keep autocomplete
 */
export type UnknownMapping = string & { _?: never };

// Services types
export interface ExtendedServicesKeyType extends ServicesKeyType {
    [P: string]: unknown;
}
export type ServicesMappedType<T> = {
    [I in keyof T]: ExtendedServicesKeyType[Extract<T[I], ServiceKeys>];
};

// Parameters types
export interface ExtendedParametersKeyType extends ParametersKeyType {
    [P: string]: unknown;
}
export type ParametersMappedType<T> = {
    [I in keyof T]: ExtendedParametersKeyType[Extract<T[I], ParameterKeys>];
};
