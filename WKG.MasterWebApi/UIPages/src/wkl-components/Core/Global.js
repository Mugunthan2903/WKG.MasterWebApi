export class Global {

    static get localStorage() {
        if (typeof window !== 'undefined') {
            return localStorage;
        }
        return null;
    }

    static get sessionStorage() {
        if (typeof window !== 'undefined') {
            return sessionStorage;
        }
        return null;
    }
}