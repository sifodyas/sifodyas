# @sifodyas/fp-di

<img align="right" src="../../../doc/img/sifodyas.svg" height="200" alt="Sifodyas Logo" title="Sifodyas Logo"/>

Provide a way to have DI from Sifodyas container into Functional Programing (or functional components)

## Installation
### yarn
`$ yarn add @sifodyas/fp-di`
### npm
`$ npm install --save @sifodyas/fp-di`

## About
This Sifodyas plugin helps you using the container and the dependency injection in functional programing situations.  
It can be used in React functional components or other non class based component from other frameworks or architecture choices.

## Usage
### Init

```typescript
// setup the plugin in your kernel

import { Container, Kernel } from '@sifodyas/sifodyas';
import { FunctionalDepencencyInjectorPass } from '@sifodyas/fp-di';

class MyKernel extends Kernel {
    public build(container: Container) {
        container.addCompilerPass(new FunctionalDepencencyInjectorPass());
    }
}
```

Registering this compiler pass will setup an internal glbal container for the plugin to work.

### Example
Use case: *we want to display a red outline if we are in debug mode.*
```tsx
import React from 'react';
import { withParameter } from '@sifodyas/fp-di';

const Comp = withParameter('kernel.debug')(({ parameter: isDebug }) => { // "isDebug" will be typed as boolean
    const style = isDebug ? { style: { border: '1px solid red' } } : {};

    return (<div {...style}>{ props.children }</div>)
});
```

```ts
import { injectParameter } from '@sifodyas/fp-di';

// in the injected function, every other arguments after the first one (where container's values are injected)
// are infer back into the type of the returned function.
const f = injectParameter((isDebug, something: string) => {
    // use isDebug and render
}, 'kernel.debug');

// f will be now typed as: (something: string) => void

f('Rendered!');
```

### API
The plugin provides 3 ways of using the container: `get`, `inject`, `with`. Each "way" works with parameters or services. Also, what you request will be typed if your mapping is properly set in you code (by augmenting Sifodyas).

**Setup the container:**
```typescript
// for example purpose, we setup our own services and parameters
// into Sifodyas.
// In next code, Container boot phase is skipped, only type augmentation is shown
type MyService = { run(): void };
declare module '@sifodyas/sifodyas' {
    // augment param key list with associated type
    interface KernelParametersKeyType {
        foo: number;
        bar: string;
    }

    // augment service key list with associated type
    interface ServicesKeyType {
        baz: MyService;
        qux: MyService
    }
}
```

#### `get`
*Get* will just get what you need from the container and return it as is. It's more a locator/retriever than an injection.
```typescript
const foo = getParameter('foo'); // typed as number
const [foo, bar] = getParameters('foo', 'bar'); // typed as number and string

getService('baz').run(); // because returned value is typed as MyService
getServices('baz', 'qux').forEach(s => s.run()); // because returned value is typed as a tuple of [MyService, MyService]
```

#### `inject`
*Inject* will bind a function to inject what you need in its first argument. The returned bound function will have every other arguments typed and extracted from the original function.
```typescript
injectParameter(foo => {}, 'foo')(); // foo, inside the function, is typed as number
injectParameters(([foo, bar]) => {}, 'foo', 'bar')(); // foo ans bar, inside the function, are typed as number and string

injectService(baz => { baz.run() }, 'baz')();
injectServices(([baz, qux]) => { baz.run(); qux.run(); }, 'baz', 'qux')();
```

#### `with`
*With* will act like an high order function and will hydrate the first argument object with a property containing what you requested.
```typescript
withParameter('foo')(({parameter: foo}) => {})(); // the "parameter" property will be provided with the string value from foo
withParameters('foo', 'bar')(props => { const [foo, bar] = props.parameters; })(); // for multiple things, the "parameters" (plural) property will be stuffed

interface Props extends WithService {
    data: string;
}
withService('baz')((props: Props) => {
    props.service.run();
    console.log(props.data);
})({ data: 'Hello World!' });

interface Props extends WithServices {
    data?: number;
}
withServices('baz', 'qux')<Props>(props => {
    const [baz, qux] = props.parameters;
    baz.run();
    qux.run();
})();
```
