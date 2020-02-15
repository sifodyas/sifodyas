# Upgrade

## `v2.0.0` to `v2.1.0`
### Bundles
- "Parents & dependencies" features will not be added. You can safely remove related methods.

### Kernel
- `boot` and `shutdown` methods does not longer return something. (they return `Promise<void>` now)
- `getParameter` is not async anymore
- Loaders returned by `getContainerLoader` are now only `JsonLoader` by default. `YamlLoader` is now in a separated plugin, `@sifodyas/yaml-loader`.  
  Also, the protected member `loaders` should now be used in order to change default loaders.

### Config
- The env prefix `yaml:` is now handled by a separated plugin, `@sifodyas/yaml-env-parser`

### Global
- `KernelParametersKeyType` is now `ParametersKeyType`

### Event sytem
- `EventPublisher` and `EventSubscriber` are now available as services.

## `v1.7` to `v2.0.0`
### Global changes
- Sifodyas now supports env var in config files: (basic usage in yaml) `key: %env(MY_ENV_VAR)%`.
  - Front: env var are fetched in window object with the `ENV_` prefix: `window.ENV_MY_ENV_VAR`.
  - Node: env var are fetched in `process.env`.
  - Env var can be deep resolved (if an env var contains another `env()` function as a value) and so on.
- If you had it, you don't need to setup an alias for `yamljs` in webpack config anymore.
- Loader are now imported directly from Sifodyas itslef
    ```ts
        // 1.7
        import { Loader } from '@sifodyas/sifodyas';
        const JsonLoader = Loader.JsonLoader;

        // 2.0
        import { JsonLoader } from '@sifodyas/sifodyas';
    ```
- Sifodyas is now node compatible, you should then maybe disable node related code access during front developpement
    ```js
    // in webpack config
        node: {
            fs: 'empty',
            process: false,
        },
    ```

### Dependency Injection
- Your `dependencyInjection/Configuration.ts` must now implements `validateConfig(obj)` method. This method passes through the config object of your bundle and returns it, validated and formated. If you don't need validation or format, just return the `obj` straight as it is.
- `ParameterBag` & `FrozenParameterBag` now holds `unknown` values instead of a generic type.
- `IParameterBag` following methods are now async: `get`, `resolve`, `resolveValue`
- `ParameterBag.resolveString` method is now async

#### `Container`
- Is no longer a "standalone" class. It now implements an `IContainer` interface which itself implements a PSR like interface.
- Is also now restable with the `reset` method.
- `getParameter` method is now async and will now have the good return type for kernel parameters keys
- `get` (service) method will now have the good return type for `kernel` and `service_container` keys
- `isFrozen` method no longer exists. Use `isCompiled` instead.
- Compile phase is now handled separately in a `Compiler` class. This compiler will hold `CompilerPass`s which are used as hooks during various steps of the compilation process.

### `Kernel`
- The versions are now showing the dev suffix when a dev version is used.
- Bundle cannot have or be "parent" anymore. `getBundle()` will always return one bundle.
- `bundleMap` property no longer exists, use `bundles` instead.
- `getOverriddenParameters` method is now async.
- `getEnvParameters` method no longer exists. 
