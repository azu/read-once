import * as assert from "assert";
import { SensitiveValue } from "../src/read-once";

describe("read-once", function() {
    it("should read at once", () => {
        const value = new SensitiveValue("secret");
        assert.strictEqual(value.value, "secret");
    });
    it("should throw error when read twice", () => {
        const value = new SensitiveValue("secret");
        assert.strictEqual(value.value, "secret");
        assert.throws(() => {
            value.value;
        }, ReferenceError);
    });
    it("should throw error when serialize the value", () => {
        const value = new SensitiveValue("secret");
        assert.throws(() => {
            const object = { value };
            JSON.stringify(object);
        }, ReferenceError);
    });
});
