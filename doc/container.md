# Container Mechanics

A Container can be seen as a big `Map` containing Services and configurations.  
It stores common stuff that will be shared between bundles.  
For now, a service is set manually, and conventionally during the boot phase of the Kernel or a Bundle. But you can set it anytime you have access to the container.  
Just don't forget that outside the boot method, it's up to you to handle the lifecycle of your service (when it's set, when it's get, when it's deleted, etc).

## Services Worklow
<img width="100%" src="img/sifodyas-container-bundle.svg" />

## "Classic" Dependency Injection
WIP

## "Straigt Object" Dependency Injection
A "Straight Object" is basically any type of instancied object or primitives. Unlike a classic DI, Services set as straight will not be instanciated and cannot be injected with an `interface`.  
Use a `type` to type what you get from the container.

With this method, service ids are plain strings and can conventionally be name like `<bundleName>.<serviceId>`. You can for exemple set ids in an `const enum` to avoid magic strings

`FooBundle.ts`:
```ts
export type AuthorizationService = { };

const enum FooServices {
    AUTHORIZATION = 'FooBundle.authorizationService',
    VERSION = 'version',
}

class FooBundle extends Bundle {
    private static readonly VERSION = 'v1.0.0';
    public async boot() {
        const authorizationService: AuthorizationService = { /* stuff */ };
        this.container.set(FooServices.AUTHORIZATION, authorizationService);

        this.container.set(FooServices.VERSION, FooBundle.VERSION);
    }
}
```

The to retrieve it in any other class:
```ts
import { Container } from '@sifodyas/sifodyas'; // import type != import code
import { AuthorizationService, FooServices } from './FooBundle'; // import const enum != import code

class Stuff {
    constructor(container: Container) {
        const authorizationService = container.get(FooServices.AUTHORIZATION) as AuthorizationService;
    }
}
```
