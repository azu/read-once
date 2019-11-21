/***
 * Schema boolean value is true, pick the value
 * Schema boolean value is false, omit the value
 */
type ValueToSchema<T> = {
    [P in keyof T]?: ValueToSchema<T[P]> | boolean;
}

enum ParentSchema {
    FALSE,
    TRUE
}

const pickSchema = <T extends { [index: string]: any }>(schema: ValueToSchema<T>, keyStack: string[]): ValueToSchema<T> => {
    let lastValue = schema;
    while (keyStack.length > 0) {
        const lastKey = keyStack.pop();
        // unexpected
        if (lastKey === undefined) {
            return {};
        }
        const _lastValue = lastValue[lastKey];
        if (typeof _lastValue === "object") {
            lastValue = _lastValue;
        }
    }
    return lastValue;
};
/**
 * toJSON with Schema
 * Return JSON object that includes schema's value is `true`
 * @param localTarget
 * @param localSchema
 * @param keyStack
 * @param options
 */
const toJSONWithSchema = <T extends { [index: string]: any }>(
    {
        localTarget,
        localSchema,
        localKeyStack
    }: {
        localTarget: T,
        localSchema: ValueToSchema<T> | ParentSchema,
        localKeyStack: string[],
    }, options: Required<proxySchemaOptions>) => {
    // If the `localSchema` is inherited from ParentSchame, just return object or empty object(hidden).
    if (localSchema === ParentSchema.TRUE) {
        return localTarget;
    } else if (localSchema === ParentSchema.FALSE) {
        return {}; // empty
    }
    const schema = pickSchema(localSchema, localKeyStack);
    // should traverse target, because schema properties is optional
    return Object.keys(localTarget).reduce((obj, key) => {
        const childSchemaOrBoolean = schema[key];
        // dig child for the object
        if (typeof childSchemaOrBoolean === "object" && typeof localTarget[key] === "object" && localTarget.hasOwnProperty(key)) {
            // childSchemaOrBoolean is schema
            // reverse concat
            obj[key] = toJSONWithSchema({
                localTarget: localTarget[key],
                localSchema: childSchemaOrBoolean,
                localKeyStack: localKeyStack.slice(0, -1)
            }, options);
        } else if (typeof childSchemaOrBoolean === "boolean") {
            // childSchemaOrBoolean is boolean
            // childSchemaOrBoolean is true and include the value to JSON
            if (childSchemaOrBoolean) {
                obj[key] = localTarget[key];
            }
        } else if (childSchemaOrBoolean === undefined) {
            /// defaultHidden option
            if (!options.defaultHidden) {
                obj[key] = localTarget[key];
            }
        }
        return obj;
    }, {} as { [index: string]: any });
};

export interface proxySchemaOptions {
    defaultHidden?: boolean;
}

export const DefaultOptions = {
    defaultHidden: true
};

/**
 * proxy with schema object
 * @param rootTarget
 * @param rootSchema
 * @param options
 */
export const proxySchema = <T extends { [index: string]: any }>(rootTarget: T, rootSchema: ValueToSchema<T>, options?: proxySchemaOptions): T => {
    const defaultHidden = options && options.defaultHidden !== undefined ? options.defaultHidden : DefaultOptions.defaultHidden;

    function innerProxy(localTarget: T, localSchema: ValueToSchema<T> | ParentSchema, keyStack: string[] = []): T {
        return new Proxy(localTarget, {
            get: (target: T, key: string | number | symbol, receiver: any) => {
                if (key === "toJSON") {
                    // return dummy toJSON method
                    return function toJSONByProxySchema() {
                        return toJSONWithSchema({
                            localTarget: localTarget,
                            localSchema: localSchema,
                            localKeyStack: keyStack
                        }, { defaultHidden });
                    };
                }
                const childTarget = Reflect.get(target, key, receiver);
                if (childTarget !== null && typeof childTarget === "object" && typeof key === "string") {
                    // localSchema value is boolean, convert to ParentSchame
                    // It aim to support assign object
                    const childSchema = (() => {
                        if (typeof localSchema === "object") {
                            const childSchema = Reflect.get(localSchema, key);
                            if (typeof childSchema === "object") {
                                return childSchema;
                            }
                            if (childSchema) {
                                return ParentSchema.TRUE;
                            } else {
                                return ParentSchema.FALSE;
                            }
                        } else {
                            // already boolean
                            return localSchema;
                        }
                    })();
                    return innerProxy(childTarget, childSchema, keyStack.concat(key));
                }
                return childTarget;
            }
        });
    }

    return innerProxy(rootTarget, rootSchema);
};
