// import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
// import { Notifier } from "./Notifier";

// class signalRManager {
//     _notifier = new Notifier();
//     _isConnected = false;
//     _connection = null;


//     init(url, accessTokenCallback) {
//         let authorization = null;
//         if (typeof accessTokenCallback === 'function')
//             authorization = { accessTokenFactory: accessTokenCallback };
//         this._connection = new HubConnectionBuilder()
//             .withUrl(url, authorization)
//             .configureLogging(LogLevel.Information)
//             .withAutomaticReconnect({
//                 nextRetryDelayInMilliseconds: retryContext => {
//                     return Math.random() * 10000;
//                 }
//             })
//             .build();
//         this._connection.on("ReceiveMessage", (action, message) => {
//             console.log(`ReceiveMessage ${action}: ${message}"`);
//             this._notifier.notify(action, message);
//         });
//         this._connection.onreconnecting(error => {
//             console.log(`Connection lost due to error "${error}". Reconnecting.`);
//         });
//         this._connection.onreconnected(connectionId => {
//             console.log(`Connection reestablished. Connected with connectionId "${connectionId}".`);
//         });
//         this._connection.onclose(error => {
//             console.log(`Connection closed due to error "${error}". Try refreshing this page to restart the connection.`);
//         });

//     }
//     start() {
//         this._connection.start().catch(err => console.error(err));
//     }
//     stop() {
//         this._connection.stop().catch(err => console.error(err));
//     }
//     subscribe(callback, action = null) {
//         return this._notifier.subscribe(callback, action);
//     }
//     unsubscribe(subscriptionId) {
//         return this._notifier.unsubscribe(subscriptionId);
//     }
// }

// const SignalRManager = new signalRManager();
// export { SignalRManager };