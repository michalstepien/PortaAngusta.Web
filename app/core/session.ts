import cls from 'cls-hooked';

const nsid = 'a6a29a6f-6747-4b5f-b99f-07ee96e32f88';
const ns = cls.createNamespace(nsid);

export default class Session {
    public static middleware = (req: any, res: any, next: any) => {
        ns.run(() => next());
    }

    public static get(key: string) {
        if (ns && ns.active) {
            return ns.get(key);
        }
    }

    public static set(key: string, value: any) {
        if (ns && ns.active) {
            return ns.set(key, value);
        }
    }
}
