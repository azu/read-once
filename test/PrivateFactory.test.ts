import { PrivateFactory } from "../src/PrivateFactory";
import assert from "assert";

describe("PrivateFactory", function() {
    it("should allow to access secret value as property", () => {
        const privateFactory = new PrivateFactory();
        // proxy object
        const data = privateFactory.create({
            public_data: "this is public",
            // mark it as secret
            private_data: privateFactory.secret("this is private")
        });
        assert.strictEqual(data.public_data, "this is public");
        assert.strictEqual(data.private_data, "this is private");
    });
    it("should replace marked secret value with defaultValue when serialized", () => {
        const privateFactory = new PrivateFactory({ silent: true });
        // proxy object
        const data = privateFactory.create({
            public_data: "this is public",
            // mark it as secret
            private_data: privateFactory.secret("this is private")
        });
        // serialized assertion
        const serialized = JSON.stringify(data);
        assert.strictEqual(serialized, "{\"public_data\":\"this is public\"}");
    });
    it("should support nest object", () => {
        const privateFactory = new PrivateFactory({ silent: true });
        // proxy object
        const data = privateFactory.create({
            data: {
                public_data: "this is public",
                // mark it as secret
                private_data: privateFactory.secret("this is private"),
                nest: {
                    api_key: privateFactory.secret("this is api_key")
                }
            }
        });
        // serialized assertion
        const serialized = JSON.stringify(data);
        assert.strictEqual(serialized, `{"data":{"public_data":"this is public","nest":{}}}`);
    });
    it("should handle when secret value is serializec", () => {
        const privateFactory = new PrivateFactory({
            onOwnKeys: ({ key, value }) => {
                assert.strictEqual(key, "private_data");
                assert.strictEqual(value, "this is private");
                isCalled = true;
            }
        });
        let isCalled = false;
        // proxy object
        const data = privateFactory.create({
            public_data: "this is public",
            // mark it as secret
            private_data: privateFactory.secret("this is private")
        });
        // serialized assertion
        JSON.stringify(data);
        assert.strictEqual(isCalled, true, "should catch serialize value");

    });
});
