import * as cntrl from "../../../wkl-components";

export class HeaderVM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this.init();
    }

    init() {
        const model = this.Data;
        if (Object.keys(model).length !== 0)
            return;

        model.UniqueID = cntrl.Utils.getUniqueID();
    }
    showLockWindow(data) {
        if (this.Data.SubscriptionID)
            cntrl.NotificationManager.unsubscribe(this.Data.SubscriptionID);
        this.showWindow({
            url: 'Common/Login',
            data: data,
            disableEscape: true,
            windowStyle: 'maximize',
            disableEscape: true,
            onClose: () => {
            }
        });
    }
    tryToLock(showMessage = false) {
        const data = { IsLocked: true };
        cntrl.ApiManager.sessionLock((r) => {
            if (r.IsValid === true) {
                data.User = r.User;
                this.showLockWindow(data);
            }
            else {
                if (showMessage === true) {
                    this.showMessageBox({
                        text: "Something went wrong",
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                    });
                }
            }
        });
    }
    lockAppln(e, showConfirmation = true) {
        const me = this;
        if (showConfirmation === true) {
            this.showMessageBox({
                text: "Are you sure that you want to lock?",
                buttons: [{ text: 'Yes' }, { text: 'No' }],
                messageboxType: cntrl.WKLMessageboxTypes.question,
                onClose: (_e) => {
                    if (_e === 0) {
                        me.tryToLock(true);
                    }
                }
            });
        }
        else {
            this.tryToLock(false);
        }
    }
    signOutAppln(e) {
        this.showMessageBox({
            text: "Are you sure that you want to exit?",//Do you want to delete the selected record(s)?
            buttons: [{ text: 'Yes' }, { text: 'No' }],
            messageboxType: cntrl.WKLMessageboxTypes.question,
            onClose: (_e) => {
                if (_e === 0) {
                    cntrl.ApiManager.signout(true);
                }
            }
        });
    }
    changePWD(e) {
        const dataInfo = {
            url: `General/HPOSM107`,
            windowStyle: cntrl.WKLWindowStyles.slideLeft,
            data: {},
            onClose: (e) => { }
        };

        this.showWindow(dataInfo);
    }
    onMyAccountClick() {
        const dataInfo = {
            url: `General/HPOSM106`,
            windowStyle: cntrl.WKLWindowStyles.slideLeft,
            data: { IsMyAccount: true },
            onClose: (e) => { }
        };

        this.showWindow(dataInfo);
    }
}