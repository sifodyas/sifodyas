<img align="right" src="img/sifodyas.svg" />
<h1>Boot Sequence</h1>

The boot sequence is pretty straightforward. Here you can see how it works.  
When the application asks for a `Kernel.boot`, the workflow goes through some several phases.

<img width="100%" src="img/sifodyas-flow-boot.svg" />

## 0. Init `Kernel.boot`
During the first steps, the Kernel creates a Container and a Compiler and link them together. It's also there where the main config and param file name is provided.

## 1. Prepare Container
This phase is dedicated to bundles. Each one can register its own extension and add hooks it to the Container / Compiler lifecycle. Those hooks are called *Compiler Passes*.  
After that, the Container itself will add a **Merge Config Pass** that will handle the distribution of config to each bundle extension.

## 2. Build Container
If the Kernel implements the Pass interface, it can add its own `process` method and will register itself as Pass in the Compiler.  
The Container will then load the config file.  
The parameters will after that be resolved and set in the Container and each registered Extension will have to validate and get its own configuration. (see [container doc](container.md))

## 3. Compile Container
This phase will finalize the Compiler and with it, the Container.  
For that, the compiler will "process" each pass registered earlier.  
In order:
- `mergePass`, which is the *Merge Config Pass*
- `beforeOptimizationPasses`
- `optimizationPasses`
- `beforeRemovingPasses`
- `removingPasses`
- `afterRemovingPasses`

After that, the parameter bag will be finally frozen.

## 4. Real Boot
Just before finally call the `boot` method of every bundle, the Kernel will set itself as a service into the Container.

<img width="100%" src="img/sifodyas-flow-async-boot.svg" />

From now, depending of the parameters, or if some of the bundles are `CoreBundle`, the booting process will be either sync or async.
