/**
 * Represents an expression.
 */
export class Expression {
    protected expression: string;

    /**
     * Constructor.
     *
     * @param expression An expression.
     */
    constructor(expression: unknown) {
        this.expression = Object.prototype.toString.call(expression);
    }

    /**
     * Gets the expression.
     *
     * @returns The expression.
     */
    public toString() {
        return this.expression;
    }
}
