// tslint:disable:no-console
import {
    Bundle,
    BundleExtended,
    Container,
    Core,
    Extension,
    IConfiguration,
    JsonLoader,
    Loader,
    TolerantKernel,
} from '@sifodyas/sifodyas';

window['ENV_TOTO'] = 'TOTOTOTO IS OK <%kernel.name%> TEHEHEHEHHE';

class AppBundle extends Bundle {
    public extension: Extension;

    public async boot(): Promise<void> {
        // console.log('APP BUNDLE BOOT');
        // console.log('APP BUNDLE OK BOOTED');
    }

    public async shutdown(): Promise<void> {}

    public getNamespace(): string {
        return '/';
    }

    public getContainerExtension(): Extension {
        return (this.extension = this.extension || new AppExtension(this));
    }
}

class AppExtension extends Extension {
    public getConfiguration(configs, container: Container) {
        const cfg = new AppConfiguration();
        return cfg;
    }

    public async load(configs: object, container: Container) {
        const cfg = this.getConfiguration(configs, container);
        const config = this.processConfiguration(cfg, configs);

        const loader = new JsonLoader(container);
        const resource = await Core.getResource(`${Core.getBasePath()}/config.json`);
        return loader.load(resource);
    }
}

class AppConfiguration implements IConfiguration {
    public validateConfig<T>(config: T): T {
        console.log('CONFIG', config);
        return config;
    }
    public getConfigurationRootName() {
        return 'app';
    }
}

class FatBundle extends Bundle {
    public fatArray: number[];

    constructor() {
        super();
        this.fatArray = [];
    }

    public boot() {
        // console.log('FATTY BUNDLE BOOT');
        return new Promise((ok, ko) => {
            setTimeout(() => {
                for (let i = 0; i < 10000; i++) {
                    this.fatArray[i] = Math.random();
                }
                // console.log('FATTY BUNDLE OK BOOTED');
                ok(true);
            }, 1);
        });
    }

    public async shutdown(): Promise<boolean> {
        // console.info('Shutdown FATTY');
        for (let i = 0; i < this.fatArray.length; i++) {
            this.fatArray[i] = null;
            delete this.fatArray[i];
        }
        // console.info('FATTY unloaded');
        return true;
    }

    public getNamespace(): string {
        return '/';
    }
}

class AppKernel extends TolerantKernel {
    public registerBundles(): BundleExtended[] {
        const bundles = [
            // new FatBundle(),
            new AppBundle(),
        ];
        // console.log(bundles);

        return bundles;
    }

    public async registerContainerConfiguration(loader) {
        // console.log('AppKernel.registerContainerConfiguration');
        const resource = await Core.getResource('config/sifodyas.config.yml');
        // console.log('HOHOHO', resource);
        return loader.load(resource);
    }
}

const kernel = (window['kernel'] = new AppKernel('prod', false));
kernel.boot().then(() => {
    console.log('KERNELLLLL', kernel);
    // kernel.unregisterBundles(['FatBundle']);
    // console.log('Unregistered !!!');
});
console.log('>>>> After boot !!!');
