import * as cntrl from "../../../wkl-components";

export default class SMST051VM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SMST051';
        this.init();
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SMST051";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {};
        model.SearchInput = {};
        model.AllSelected = false;
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 10 };
        this.newMode();
    }
    newMode() {
        const model = this.Data;
        model.Input.IsEdit = false;
        this.setTitle();
        this.updateUI();

    }
    loadInitData() {
    }
    setTitle() {
        const model = this.Data;
        model.Title = "Section 2 / New";
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    doClose() {
        const me = this;
        this.close()
    }
}