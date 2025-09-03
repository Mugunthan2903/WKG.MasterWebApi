import * as cntrl from '../../../wkl-components';
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SMPL005VM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this.loadInitData();

    }
    loadInitData() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.Loading = false;

        this.Newmode();

    };
    Newmode() {
        const model = this.Data;
        model.SMST024_latitude = 51.5074;
        model.SMST024_longitude = -0.1278;
    }
    doClose() {
        const me = this;
        this.close();

    }
    handleSearchClear() {
        this.doSearchClear();
    }

    // Clear search results
    doSearchClear() {
        const model = this.Data;
            model.SMST024_latitude = "";
            model.SMST024_longitude = "";
        
        this.updateUI();
    }
}
