import { BaseException } from '../../core/BaseException';

/**
 * This exception is thrown when a circular reference in a parameter is detected.
 */
export class ParameterCircularReferenceException extends BaseException {
    private _parameters: string[];
    public baseClass = 'ParameterCircularReferenceException';

    constructor(parameters: string[], previous: Error = null) {
        super(
            `Circular reference detected for parameter "${parameters[0]}" ("${parameters.join('" > "')}" > "${
                parameters[0]
            }"). [${previous?.message ?? ''}]`,
        );

        this._parameters = parameters;
    }

    get parameters() {
        return this._parameters;
    }
}
