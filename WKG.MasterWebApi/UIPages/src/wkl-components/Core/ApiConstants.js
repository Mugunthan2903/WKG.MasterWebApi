export const ApplicationInfo = {
    Authority: 'DMC',
    Name: 'DMC APP'
};
const LoginActions = {
    SignIn: 'sign-in',
    RefreshToken: 'refresh-token',
    Signout: 'sign-out'
};
const prefix = 'auth';
export const ApplicationPaths = {
    ApiAuthorizationPrefix: prefix,
    SignIn: `${prefix}/${LoginActions.SignIn}`,
    RefreshToken: `${prefix}/${LoginActions.RefreshToken}`,
    Signout: `${prefix}/${LoginActions.Signout}`,
    ConfigUrl: 'config.json',
    LoginUrl: '/login',
    StartInitUrl: ''
};
export const Msgs = {
    Signin: 'SIGN-IN',
    Signout: 'SIGN-OUT',
    ApiUrlLoaded: 'API-URL-LOADED',
    SessionTimeout: 'SESSION-TIMEOUT',
    SessionLock: 'SESSION-LOCK',
    SessionUnlock: 'SESSION-UNLOCK',
    LanguageChanged: 'LANGUAGE-CHANGED'
};