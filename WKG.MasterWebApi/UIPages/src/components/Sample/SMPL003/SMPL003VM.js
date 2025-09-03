import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SMPL003VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SMPL003';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SMPL003";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.TabId = "home";
        model.Tabs = [
            { id: 'home', label: 'Product Config', content: 'Content for Product Config' },
            { id: 'profile', label: 'Pos', content: 'Content for Pos' },
            { id: 'contact', label: 'Config', content: 'Content for Config' }
        ];
    }
    loadInitData() { }
}