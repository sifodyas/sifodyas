import { ParameterKeys, ParametersKeyType, ServiceKeys, ServicesKeyType, UnknownMapping } from '..';
import { Core } from '../core';
import { ContainerEvent } from '../event';
import { EventPublisher } from '../event/EventPublisher';
import { IReset } from '../IReset';
import { Compiler, CompilerPassType } from './compiler/Compiler';
import { ICompilerPass } from './compiler/passe/ICompilerPass';
import { EnvPrefix, EnvVarProcessor } from './env/EnvVarProcessor';
import { LogicException } from './exception/LogicException';
import { ParameterCircularReferenceException } from './exception/ParameterCircularReferenceException';
import { IExtension } from './extension/IExtension';
import { IContainer } from './IContainer';
import { FrozenParameterBag } from './parameterBag/FrozenParameterBag';
import { IParameterBag } from './parameterBag/IParameterBag';
import { ParameterBag } from './parameterBag/ParameterBag';

type ReturnParameterType<KEY extends keyof ParametersKeyType> = ParametersKeyType[KEY];
type ReturnServiceType<KEY extends keyof ServicesKeyType, ContainerType> = ServicesKeyType[KEY] extends Container
    ? ContainerType
    : ServicesKeyType[KEY];

/**
 * Container is a dependency injection container.
 *
 * It gives access to object instances (services).
 *
 * Services and parameters are simple key/pair stores.
 *
 * Parameter and service keys are case insensitive.
 */
export class Container implements IContainer, IReset {
    /**
     * Gets the service container parameter bag.
     *
     * @returns A IParameterBag instance.
     */
    public get parameterBag() {
        return this._parameterBag;
    }

    /**
     * Returns all registered extensions.
     *
     * @returns A map of IExtension
     */
    public get extensions() {
        return new Map(this._extensions);
    }

    private get eventPublisher() {
        if (!this._event) {
            this._event = this._services.get('event_publisher') as EventPublisher;
        }
        return this._event;
    }

    private static FORBIDDEN_SERVICE_NAMES = ['service_container'];

    private extensionConfigs = new Map<string, object>();

    private envCounters = new Map<string, number>();
    private envCache = new Map<string, string>();

    private compiler?: Compiler;
    private _event?: EventPublisher;

    private compiled = false;

    protected _parameterBag: IParameterBag;
    protected _services = new Map<string, unknown>();
    protected _extensions = new Map<string, IExtension>();

    protected resolving = new Map<string, boolean>();

    public constructor(parameterBag: IParameterBag = new ParameterBag()) {
        this._parameterBag = parameterBag;
        (this._parameterBag as ParameterBag).container = this;
    }
    /**
     * Fetches a variable from the environment.
     *
     * @param name The name of the environment variable
     *
     * @returns The value to use for the provided environment variable name
     *
     * @throws {EnvNotFoundException} When the environment variable is not found and has no default value
     */
    protected getEnv(name: string) {
        const envName = `env(${name})`;
        if (this.resolving.has(envName)) {
            throw new ParameterCircularReferenceException(Array.from(this.resolving.keys()));
        }

        if (this.envCache.has(name)) {
            return this.envCache.get(name);
        }

        const i = name.indexOf(':');
        let prefix: EnvPrefix = 'string';
        let localName = name;
        if (i !== -1) {
            prefix = name.substr(0, i) as EnvPrefix;
            localName = name.substr(1 + i);
        }

        const id = `container.env_var_processor_${prefix}`;
        let processor: EnvVarProcessor;
        if (this.has(id)) {
            processor = this.get(id) as EnvVarProcessor;
        } else {
            processor = new EnvVarProcessor(this);
            this.set(id, processor);
        }

        this.resolving.set(envName, true);
        const ret = processor.getEnv(prefix, localName, this.getEnv.bind(this)) as string;
        this.envCache.set(name, ret);
        this.resolving.delete(envName);
        return ret;
    }

    /**
     * Formerly known as ContainerBuilder.gerEnv
     */
    protected getEnvBuilder(name: string) {
        const value = this.getEnv(name);
        const bag = this.parameterBag;

        if (!Core.isString(value)) {
            return value;
        }

        this.resolving.set(`env(${name})`, true);
        const ret = bag.unescapeValue(value);
        this.resolving.delete(`env(${name})`);
        return ret;
    }

    /**
     * Compiles the container.
     *
     * This method does two things:
     *  * Parameter values are resolved;
     *  * The parameter bag is frozen.
     *
     * @async
     */
    public async compile() {
        // formerly ContainerBuilder.compile
        await this.getCompiler().compile(this);
        this.extensionConfigs = new Map();

        // formerly Container.compile
        this._parameterBag.resolve();
        this._parameterBag = new FrozenParameterBag(this._parameterBag.all());

        this.compiled = true;
    }

    /**
     * Sets a service.
     *
     * Setting a service to null resets the service: has() returns false and get() behaves in the same way as if the
     * service was never created.
     *
     * @param id The service identifier.
     * @param service The service instance.
     * @returns The container itself for chaining.
     */
    public set<T extends ServiceKeys | UnknownMapping>(
        id: T | ServiceKeys,
        service?: T extends ServiceKeys ? ReturnServiceType<T, this> : unknown,
    ) {
        if (Container.FORBIDDEN_SERVICE_NAMES.includes(id)) {
            throw new Error(`You cannot set service "${id}".`);
        }

        if ('event_publisher' !== id) {
            this.eventPublisher?.publish(
                'event.container.setService',
                new ContainerEvent(this).setModif('setServiceId', id as ServiceKeys),
            );
        }

        if (service) {
            this._services.set(id, service);
        } else {
            this._services.delete(id);
        }

        return this;
    }

    /**
     * Returns true if the given service is defined.
     *
     * @param id The service identifier.
     * @returns true if the service is defined, false otherwise.
     */
    public has<T extends ServiceKeys | UnknownMapping>(id: T | ServiceKeys) {
        if ('service_container' === id) {
            return true;
        }
        return this._services.has(id);
    }

    /**
     * Gets a service.
     *
     * @param id the service identifier.
     * @returns The associated service.
     */
    public get<
        T extends ServiceKeys | UnknownMapping,
        R extends T extends ServiceKeys ? ReturnServiceType<T, this> : unknown
    >(id: T | ServiceKeys) {
        if ('service_container' === id) {
            return this as R;
        }

        if ('event_publisher' !== id) {
            this.eventPublisher?.publish(
                'event.container.getService',
                new ContainerEvent(this).setModif('getServiceId', id as ServiceKeys),
            );
        }

        return this._services.get(id) as R;
    }

    /**
     * Returns true if the container is compiled.
     */
    public isCompiled() {
        return this.compiled;
    }

    /**
     * Gets a parameter.
     *
     * @param name The paramter name.
     * @returns The parameter value
     * @throws ParameterNotFoundException if the parameter is not defined.
     */
    public getParameter<
        T extends ParameterKeys | UnknownMapping,
        R extends T extends ParameterKeys ? ReturnParameterType<T> : unknown
    >(name: T | ParameterKeys): R {
        this.eventPublisher?.publish(
            'event.container.getParameter',
            new ContainerEvent(this).setModif('getParameterId', name as ParameterKeys),
        );
        return this._parameterBag.get(name) as R;
    }

    /**
     * Sets a parameter.
     *
     * @param name The parameter name.
     * @param value The parameter value.
     */
    public setParameter<T extends ParameterKeys | UnknownMapping>(
        name: T | ParameterKeys,
        value: T extends ParameterKeys ? ReturnParameterType<T> : unknown,
    ) {
        this._parameterBag.set(name, value);
    }

    /**
     * Checks if a parameter exists.
     *
     * @param name The parameter name.
     * @returns The presence of parameter in container.
     */
    public hasParameter<T extends ParameterKeys | UnknownMapping>(name: T | ParameterKeys) {
        return this._parameterBag.has(name);
    }

    /**
     * Merges a Container with the current Container configuration.
     *
     * @param container The Container instance to merge.
     * @throws BadMethodCallException When this ContainerBuilder is compiled
     */
    public merge(container: Container): void {
        if (this.isCompiled()) {
            throw new LogicException('Can not merge on a compiled container.');
        }

        this.parameterBag.add(container.parameterBag.all());

        this._extensions.forEach((_, name) => {
            if (!this.extensionConfigs.has(name)) {
                this.extensionConfigs.set(name, {});
            }

            const extCfg = this.extensionConfigs.get(name);
            this.extensionConfigs.set(name, { ...extCfg, ...container.getExtensionConfig(name) });
        });
    }

    /**
     * Register an extension.
     *
     * @param extension An extension instance.
     */
    public registerExtension(extension: IExtension): void {
        this._extensions.set(extension.getAlias(), extension);
    }

    /**
     * Returns an extension by alias.
     *
     * @param name An alias
     * @returns An extension instance.
     * @throws LogicException if the extension is not registered.
     */
    public getExtension(name: string): IExtension {
        if (this.hasExtension(name)) {
            return this._extensions.get(name);
        }

        throw new LogicException(`Container extension ${name} is not registered.`);
    }

    /**
     * Checks if we have an extension.
     *
     * @param name The alias of the extension.
     * @returns If the extension exists.
     */
    public hasExtension(name: string): boolean {
        return this._extensions.has(name);
    }

    /**
     * Returns the configuration map for the given extension.
     *
     * @param name The name of the extension.
     * @returns A map of configuration.
     */
    public getExtensionConfig(name: string): object {
        if (!this.extensionConfigs.has(name)) {
            this.extensionConfigs.set(name, {});
        }

        return this.extensionConfigs.get(name);
    }

    /**
     * Loads the configuration for an extension.
     *
     * @param extension The extension alias or namespace.
     * @param values    A map of values that customizes the extension.
     *
     * @returns The current instance.
     *
     * @throws LogicException if the container is compiled.
     */
    public loadFromExtension(extension: string, values: object = {}): this {
        if (this.isCompiled()) {
            throw new LogicException('Can not load from an extension on a compiled container.');
        }

        const alias = this.getExtension(extension).getAlias();

        let currentExtensionConfigs = this.extensionConfigs.get(alias);
        if (currentExtensionConfigs && Object.keys(currentExtensionConfigs).length > 0) {
            // > 0 because we want to split bundle config in seperate files if we want to
            Object.assign(currentExtensionConfigs, values);
        } else {
            currentExtensionConfigs = values;
        }
        this.extensionConfigs.set(alias, currentExtensionConfigs);

        return this;
    }

    public reset() {
        this.eventPublisher?.publish('event.container.beforeReset', new ContainerEvent(this).setModif('reset', true));

        const services = new Map(this._services.entries());
        this._services.clear();
        this._services = new Map();

        services.forEach(service => {
            try {
                service['reset']();
            } catch {}
        });
    }

    /**
     * Returns true if the given service has actually been initialized.
     */
    public initialized(id: string) {
        if ('service_container' === id) {
            return false;
        }

        return this._services.has(id);
    }

    public resolveEnvs(value: unknown, format = false, usedEnvs: Map<string, string> = new Map()) {
        const bag = this.parameterBag;
        if (format) {
            value = bag.resolveValue(value);
        }

        if (Core.isArray(value)) {
            const result = [];
            for (const k in value) {
                result[k] = this.resolveEnvs(value[k], format, usedEnvs);
            }

            return result;
        }

        if (Core.isMap(value)) {
            const result = new Map();
            for (const [k, v] of value.entries()) {
                result.set(k, this.resolveEnvs(v, format, usedEnvs));
            }

            return result;
        }

        if (Core.isPureObject(value)) {
            const result = {};
            for (const k of Object.keys(value)) {
                result[k] = this.resolveEnvs(value[k], format, usedEnvs);
            }

            return result;
        }

        if (!Core.isString(value)) {
            return value;
        }

        const env = value as string;
        const resolved = format ? bag.escapeValue(this.getEnvBuilder(env)) : `%%env(${env})%%`;

        usedEnvs.set(env, resolved as string);
        this.envCounters.set(env, this.envCounters.has(env) ? 1 + this.envCounters.get(env) : 1);

        return resolved;
    }

    /**
     * Adds a compiler pass.
     *
     * @param pass     A compiler pass
     * @param type     The type of compiler pass
     * @param priority Used to sort the passes
     */
    public addCompilerPass(pass: ICompilerPass, type = CompilerPassType.TYPE_BEFORE_OPTIMIZATION, priority = 0) {
        this.getCompiler().addPass(pass, type, priority);
        return this;
    }

    /**
     * Returns the compiler.
     *
     * @returns The compiler
     */
    public getCompiler() {
        if (!this.compiler) {
            this.compiler = new Compiler();
        }

        return this.compiler;
    }
}

/**
 * A container preventing using methods that wouldn't have any effect from extensions.
 */
export class MergeExtensionConfigurationContainer extends Container {
    private extensionClass: string;
    public constructor(extension: IExtension, parameterBag: IParameterBag = null) {
        super(parameterBag);
        this.extensionClass = extension.constructor.name;
    }

    public registerExtension(extension: IExtension) {
        throw new LogicException(
            `You cannot register extension "${extension.constructor.name}" from "${this.extensionClass}". Extension must be registered before the container is compiled.`,
        );
    }

    public async compile(_resolveEnvPlaceholders = false) {
        throw new LogicException(`Cannot compile the container in extension "${this.extensionClass}".`);
    }

    public resolveEnvs<T extends unknown[] | Map<string, unknown> | string>(
        value: T,
        format = false,
        usedEnvs: Map<string, string> = new Map(),
    ): T {
        if (true !== format || !Core.isString(value)) {
            return super.resolveEnvs(value, format, usedEnvs) as T;
        }
        const valueResolved = this.parameterBag.resolveValue(value);

        return super.resolveEnvs(valueResolved, format, usedEnvs) as T;
    }
}
