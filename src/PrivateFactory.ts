export class PrivateFactory {
    private privateValueMap = new Map();

    create = <T extends object>(object: T, handler?: (key?: PropertyKey, value?: any, target?: T) => void): T => {
        const map = this.privateValueMap;
        return new Proxy(object, {
            ownKeys: (target: T): PropertyKey[] => {
                const ownKeys = Reflect.ownKeys(target);
                return ownKeys.filter(key => {
                    const rawValue = Reflect.get(target, key);
                    const isSecretValue = map.has(rawValue);
                    if (isSecretValue && handler) {
                        handler(key, rawValue, target);
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
                    map.delete(rawValue);
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
}
