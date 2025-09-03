export class Notifier {
    _nextSubscriptionId = 0;
    _callbacks = [];

    subscribe(callback, action = null) {
        const nextSubscriptionId = this._nextSubscriptionId++;
        this._callbacks.push({ callback, subscription: nextSubscriptionId, action: action || null });
        return nextSubscriptionId;
    }
    unsubscribe(subscriptionId) {
        const subscriptionIndex = this._callbacks
            .map((element, index) => element.subscription === subscriptionId ? { found: true, index } : { found: false })
            .filter(element => element.found === true);
        if (subscriptionIndex.length !== 1) {
            throw new Error(`Found an invalid number of subscriptions ${subscriptionIndex.length}`);
        }

        this._callbacks.splice(subscriptionIndex[0].index, 1);
    }
    notify(action, message) {
        for (let i = 0; i < this._callbacks.length; i++) {
            let subscribtion = this._callbacks[i];

            let notify = false;
            if (subscribtion.action) {
                if (Array.isArray(subscribtion.action)) {
                    notify = subscribtion.action.any(a => a === action);
                }
                else {
                    notify = action === subscribtion.action;
                }
            }
            else
                notify = true;

            if (notify === true) {
                try {
                    const callback = subscribtion.callback;
                    callback({ action: action, data: message });
                }
                catch (ex) {
                    console.log(`Subscription Error: ${ex.toString()}`);
                }
            }
        }
    }
}