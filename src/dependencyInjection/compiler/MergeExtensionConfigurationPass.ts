import { Container, MergeExtensionConfigurationContainer } from '../Container';
import { ICompilerPass } from './ICompilerPass';

/**
 * Merges extension configs into the container.
 */
export class MergeExtensionConfigurationPass implements ICompilerPass {
    constructor(private extensions: string[]) {}

    /**
     * @inheritdoc
     */
    public async process(container: Container) {
        // HttpKernel/DependencyInjection/MergeExtensionConfigurationPass.process
        this.extensions.forEach(name => {
            if (!Object.keys(container.getExtensionConfig(name)).length) {
                container.loadFromExtension(name, {});
            }
        });

        // main
        const parameters = container.parameterBag.all();

        const p: Array<Promise<void>> = [];
        for (const [name, extension] of container.extensions) {
            let config = container.getExtensionConfig(name);
            if (!config) {
                return;
            }

            config = (await container.parameterBag.resolveValue(config)) as object;

            p.push(
                (async () => {
                    const tmpContainer: Container = new MergeExtensionConfigurationContainer(
                        extension,
                        container.parameterBag,
                    );
                    await extension.load(config, tmpContainer);

                    container.merge(tmpContainer);
                    container.parameterBag.add(parameters);
                })(),
            );
        }

        await Promise.all(p);
    }
}
