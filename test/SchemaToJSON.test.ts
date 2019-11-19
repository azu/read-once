import assert from "assert";
import { proxySchema } from "../src/SchemaToJSON";

describe("SchemaToJSON", function() {
    it("should not omit when does not use JSON.strinigfy", () => {
        const object = {
            keyA: "A",
            keyB: "B"
        };
        const result = proxySchema(object, {
            keyA: true,
            keyB: false
        });
        assert.deepStrictEqual(result, object);
    });
    it("should omit schema: false values", () => {
        const object = {
            keyA: "A",
            keyB: "B"
        };
        const result = proxySchema(object, {
            keyA: true,
            keyB: false
        });
        assert.deepStrictEqual(JSON.stringify(result), `{"keyA":"A"}`);
    });
    it("should omit value that's schema is undefined(defaultHidden: true)", () => {
        const object = {
            keyA: "A",
            keyB: "B"
        };
        const result = proxySchema(object, {
            keyA: true
        });
        assert.deepStrictEqual(JSON.stringify(result), `{"keyA":"A"}`, "keyB should be omitted by default");
    });
    it("should pick value that's schema is undefined(defaultHidden: false)", () => {
        const object = {
            keyA: "A",
            keyB: "B"
        };
        const result = proxySchema(object, {
            keyA: false
        }, {
            defaultHidden: false
        });
        assert.deepStrictEqual(JSON.stringify(result), `{"keyB":"B"}`, "keyB should be picked");
    });
    it("should support all false", () => {
        const object = {
            keyA: "A",
            keyB: "B",
            keyC: {
                keyCA: "CA",
                keyCC: "CC"
            }
        };
        const result = proxySchema(object, {
            keyA: false,
            keyB: false,
            keyC: false
        });
        assert.deepStrictEqual(JSON.stringify(result), `{}`);
    });
    it("should support assigned object", () => {
        const object = {
            keyA: "A",
            keyB: "B",
            keyC: {
                keyCA: "CA",
                keyCC: "CC"
            }
        };
        const result = proxySchema(object, {
            keyA: false,
            keyB: false,
            keyC: false
        });
        const C = result.keyC;
        assert.deepStrictEqual(JSON.stringify(C), `{}`, "C values should be omitted");
    });
    it("should support assigned object with defaultHidden:false", () => {
        const object = {
            keyA: "A",
            keyB: "B",
            keyC: {
                keyCA: "CA",
                keyCC: "CC"
            }
        };
        const result = proxySchema(object, {
            keyA: false,
            keyB: false,
            keyC: false
        }, {
            defaultHidden: false
        });
        const C = result.keyC;
        assert.deepStrictEqual(JSON.stringify(C), `{}`, "C values should be omitted");
    });
    it("should support deep schema", () => {
        const object = {
            keyA: "A",
            keyB: "B",
            keyC: {
                keyCA: "CA",
                keyCC: "CC"
            }
        };
        const result = proxySchema(object, {
            keyA: true,
            keyB: false,
            keyC: {
                keyCA: true,
                keyCC: false
            }
        });
        assert.deepStrictEqual(JSON.stringify(result), `{"keyA":"A","keyC":{"keyCA":"CA"}}`);
    });
    it("should includes children values of true schema", () => {
        var object = {
            keyA: "A",
            keyB: "B",
            keyC: {
                a: 1,
                b: 2,
                c: 3
            }
        };
        const result = proxySchema(object, {
            keyA: true,
            keyB: false,
            keyC: true
        });
        assert.deepStrictEqual(JSON.stringify(result), `{"keyA":"A","keyC":{"a":1,"b":2,"c":3}}`);
    });
    it("should throw when object has Circular object", () => {
        var object: any = {
            keyA: "A",
            keyB: "B",
            req: object
        };
        // { keyA: 'A', keyB: 'B', req: [Circular] }
        object.req = object;
        const result = proxySchema(object, {
            keyA: true,
            keyB: false,
            req: true
        });
        assert.throws(() => {
            JSON.stringify(result);
        }, Error);
    });
});
