/**
 *
 * Its main purpose is to facilitate detection of unintentional use.
 * It represents a sensitive value or concept.
 * It’s often a domain primitive.
 * Its value can be read once, and once only.
 * It prevents serialization of sensitive data.
 * It prevents subclassing and extension.
 */
export class SensitiveValue<T extends {}> {
    private internalValue: T | null;

    constructor(value: T) {
        if (value === undefined || value === null) {
            throw new Error("Sensitive value should have value: " + value);
        }
        this.internalValue = value;
    }

    public get value(): T {
        const value = this.internalValue;
        // mark consumed
        this.internalValue = null;
        Object.freeze(this);
        if (value === null) {
            throw new ReferenceError("Sensitive value has already been consumed");
        }
        return value;
    }

    public toString() {
        return "SensitiveValue{value=*****}";
    }

    public toJSON() {
        throw new ReferenceError("SensitiveValue is not allowed serialize");
    }
}
