import { Container } from '../Container';
import { InvalidArgumentException } from '../exception';
import { ICompilerPass } from './passe';

export enum CompilerPassType {
    TYPE_AFTER_REMOVING = 'afterRemoving',
    TYPE_BEFORE_OPTIMIZATION = 'beforeOptimization',
    TYPE_BEFORE_REMOVING = 'beforeRemoving',
    TYPE_OPTIMIZE = 'optimization',
    TYPE_REMOVE = 'removing',
}

/**
 * Compiler + Pass Configuration.
 *
 * This class has a default configuration embedded.
 * This class is used to remove circular dependencies between individual passes.
 */
export class Compiler {
    private _mergePass?: ICompilerPass;
    private _afterRemovingPasses: ICompilerPass[][] = [];
    private _beforeOptimizationPasses: ICompilerPass[][] = [];
    private _beforeRemovingPasses: ICompilerPass[][] = [];
    private _optimizationPasses: ICompilerPass[][] = [];
    private _removingPasses: ICompilerPass[][] = [];

    public static isPass(obj: unknown): obj is ICompilerPass {
        const pass = obj as ICompilerPass;
        return pass.process && typeof pass.process === 'function';
    }

    /**
     * Sort passes by priority.
     *
     * @param passes ICompilerPass instances with their priority as key
     */
    private sortPasses(passes: ICompilerPass[][]) {
        if (!passes.length) {
            return [];
        }
        passes.sort().reverse();
        return passes.reduce((previous, current) => [...previous, ...current], []);
    }

    /**
     * Run the Compiler and process all Passes.
     *
     * @async
     */
    public async compile(container: Container) {
        for (const pass of this.getPasses()) {
            await pass.process(container);
        }
    }

    /**
     * Returns all passes in order to be processed.
     */
    public getPasses() {
        return [
            this.mergePass,
            ...this.beforeOptimizationPasses,
            ...this.optimizationPasses,
            ...this.beforeRemovingPasses,
            ...this.removingPasses,
            ...this.afterRemovingPasses,
        ];
    }

    /**
     * Adds a pass.
     *
     * @param pass     A Compiler pass
     * @param type     The pass type
     * @param priority Used to sort the passes
     *
     * @throws {InvalidArgumentException} when a pass type doesn't exist
     */
    public addPass(pass: ICompilerPass, type = CompilerPassType.TYPE_BEFORE_OPTIMIZATION, priority = 0) {
        const property = `_${type}Passes`;
        const passes: ICompilerPass[][] = this[property];
        if (!passes) {
            throw new InvalidArgumentException(`Invalid type "${type}".`);
        }

        if (!passes[priority]) {
            passes[priority] = [];
        }
        passes[priority].push(pass);
    }

    /**
     * Gets all passes for the AfterRemoving pass.
     */
    get afterRemovingPasses() {
        return this.sortPasses(this._afterRemovingPasses);
    }
    /**
     * Sets the AfterRemoving passes.
     */
    set afterRemovingPasses(passes: ICompilerPass[]) {
        this._afterRemovingPasses = [passes];
    }

    /**
     * Gets all passes for the BeforeOptimization pass.
     */
    get beforeOptimizationPasses() {
        return this.sortPasses(this._beforeOptimizationPasses);
    }
    /**
     * Sets the BeforeOptimization passes.
     */
    set beforeOptimizationPasses(passes: ICompilerPass[]) {
        this._beforeOptimizationPasses = [passes];
    }

    /**
     * Gets all passes for the BeforeRemoving pass.
     */
    get beforeRemovingPasses() {
        return this.sortPasses(this._beforeRemovingPasses);
    }
    /**
     * Sets the BeforeRemoving passes.
     */
    set beforeRemovingPasses(passes: ICompilerPass[]) {
        this._beforeRemovingPasses = [passes];
    }

    /**
     * Gets all passes for the Optimization pass.
     */
    get optimizationPasses() {
        return this.sortPasses(this._optimizationPasses);
    }
    /**
     * Sets the Optimization passes.
     */
    set optimizationPasses(passes: ICompilerPass[]) {
        this._optimizationPasses = [passes];
    }

    /**
     * Gets all passes for the Removing pass.
     */
    get removingPasses() {
        return this.sortPasses(this._removingPasses);
    }
    /**
     * Sets the Removing passes.
     */
    set removingPasses(passes: ICompilerPass[]) {
        this._removingPasses = [passes];
    }

    /**
     * Gets the Merge pass.
     */
    get mergePass() {
        return this._mergePass;
    }
    /**
     * Sets the Merge pass.
     */
    set mergePass(pass: ICompilerPass) {
        this._mergePass = pass;
    }
}
