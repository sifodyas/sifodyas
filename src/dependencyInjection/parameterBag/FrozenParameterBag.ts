import { LogicException } from '../exception/LogicException';
import { ParameterBag } from './ParameterBag';

/**
 * Holds read-only parameters.
 */
export class FrozenParameterBag extends ParameterBag {
    /**
     * For performance reasons, the constructor assumes that
     * all keys are already lowercased.
     *
     * This is always the case when used internally.
     *
     * @param parameters An map of parameters.
     */
    constructor(parameters: Map<string, unknown> = new Map()) {
        super(parameters);
        this.resolved = true;
    }

    /** @inheritDoc */
    public clear() {
        throw new LogicException('Impossible to call clear() on a frozen ParameterBag.');
    }

    /** @inheritDoc */
    public add(_parameters: Map<string, unknown>) {
        throw new LogicException('Impossible to call add() on a frozen ParameterBag.');
    }

    /** @inheritDoc */
    public set(_name: string, _value: unknown) {
        throw new LogicException('Impossible to call set() on a frozen ParameterBag.');
    }

    /** @inheritDoc */
    public remove(_name: string) {
        throw new LogicException('Impossible to call remove() on a frozen ParameterBag.');
    }
}
