export const DEFAULT_ON_OWN_KEYS: PrivateFactoryOptions["onOwnKeys"] = ({ key, value }) => {
    throw new Error(`key:${String(key)}, value:${String(value)} should not serialized`);
};
export const DEFAULT_ON_SET: PrivateFactoryOptions["onSet"] = ({ oldValue, newValue, defaultValue, factory }) => {
    factory.unSecret(oldValue);
    factory.secret(newValue, defaultValue);
};

export interface PrivateFactoryOptions {
    silent?: boolean;
    onSet?: <T extends object>({
                                   key,
                                   oldValue,
                                   newValue,
                                   defaultValue,
                                   target,
                                   factory
                               }: {
        key?: PropertyKey,
        oldValue?: any,
        newValue?: any;
        defaultValue?: any;
        target?: T;
        factory: PrivateFactory
    }) => void
    onOwnKeys?: <T extends object>({
                                       key,
                                       value,
                                       target,
                                       factory
                                   }: {

        key?: PropertyKey,
        value?: any;
        target?: T;
        factory: PrivateFactory
    }) => void
}

export class PrivateFactory {
    private privateValueMap = new Map();

    constructor(private options: PrivateFactoryOptions = {}) {
        this.options.onSet = options.onSet || DEFAULT_ON_SET;
        this.options.onOwnKeys = !options.silent
            ? options.onOwnKeys || DEFAULT_ON_OWN_KEYS
            : () => {
            };
    }

    create = <T extends object>(object: T): T => {
        const map = this.privateValueMap;
        const options = this.options;
        return new Proxy(object, {
            ownKeys: (target: T): PropertyKey[] => {
                const ownKeys = Reflect.ownKeys(target);
                return ownKeys.filter(key => {
                    const rawValue = Reflect.get(target, key);
                    const isSecretValue = map.has(rawValue);
                    if (isSecretValue && options && options.onOwnKeys) {
                        options.onOwnKeys({
                            key,
                            value: rawValue,
                            target,
                            factory: this
                        });
                    }
                    return !isSecretValue;
                });
            },
            get: (target: T, p: string | number | symbol, receiver: any) => {
                const value = Reflect.get(target, p, receiver);
                if (value !== null && typeof value === "object") {
                    return this.create(value);
                }
                return value;
            },
            set: (target: T, key: string | number | symbol, value: any, receiver: any): boolean => {
                const rawValue = Reflect.get(target, key);
                const isSecretValue = map.has(rawValue);
                if (isSecretValue) {
                    const originalDEfaultValue = map.get(rawValue);
                    if (options && options.onSet) {
                        options.onSet({
                            key,
                            oldValue: rawValue,
                            newValue: value,
                            defaultValue: originalDEfaultValue,
                            target,
                            factory: this
                        });
                    }
                }
                return Reflect.set(target, key, value, receiver);
            }
        });
    };

    /**
     * mark secret value
     * @param value
     * @param defaultValue
     */
    secret<T extends {}>(value: T, defaultValue: any = undefined): T {
        this.privateValueMap.set(value, defaultValue);
        return value;
    }

    /**
     * mark secret value
     * @param value
     */
    unSecret<T extends {}>(value: T): void {
        this.privateValueMap.delete(value);
    }
}
