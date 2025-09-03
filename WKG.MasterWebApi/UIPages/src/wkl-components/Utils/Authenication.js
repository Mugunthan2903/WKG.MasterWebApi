class Authenication {
    Functions = [];

    authenticationReqiured(formID, controlID) {
        try {
            var moduleFunction = this.Functions.first(f => f.ID === formID);
            if (moduleFunction != null && moduleFunction.Controls.length > 0) {
                var cntrl = moduleFunction.Controls.first(c => c.ID === controlID);
                if (cntrl != null) {
                    return false;
                }
                else
                    return false;
            }
        }
        catch (ex) { }
        return false;
    }
    showAuthenticate(options) {
        const wndwOptions = {};
        wndwOptions.title = 'Authenication';
        wndwOptions.url = 'Authenication';
        wndwOptions.style = { height: 'auto', width: 'auto' };
        wndwOptions.data = {};
        wndwOptions.data.formID = options.formID;
        wndwOptions.data.controlID = options.controlID;
        wndwOptions.onClose = (e) => {
            if (e.data && e.data.Isvalid === true) {
                const args = {};
                args.userID = e.data.User.ID;
                options.callback(args);
            }
        };
        options.owner.showWindow(wndwOptions);
    }
    invoke(options) {
        let mustAuthenicate = options.mustAuthenicate || false;

        const isvalid = !(Utils.isNullOrEmpty(options.formID) ||
            Utils.isNullOrEmpty(options.controlID));

        if (mustAuthenicate || (isvalid && Utils.authenticationReqiured(options.formID, options.controlID)))
            Utils.showAuthenticate(options);
        else {
            let userID = null;
            if (Utils.AppInfo && Utils.AppInfo.User)
                userID = Utils.AppInfo.User.ID || null;
            options.callback({ userID: userID });
        }
    }
}