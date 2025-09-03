import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class HOME002VM extends VMBase {
    constructor(props) {
        super(props);
        this.setTitle();
    }
    loadInitData() {

    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        model.Title = `Home SSM`;
    }
    doClose() {
        this.close()
    }
}