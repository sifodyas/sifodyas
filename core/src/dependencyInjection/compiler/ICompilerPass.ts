import { IContainer } from '../IContainer';

/**
 * Interface that must be implemented by compilation passes.
 */
export interface ICompilerPass {
    /**
     * You can modify the container here.
     * @async
     */
    process(container: IContainer): Promise<void>;
}
