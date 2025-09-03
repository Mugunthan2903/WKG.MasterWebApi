import { Utils, WKLMessageboxTypes, ApiManager, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SMST016VM extends VMBase {
    constructor(props) {
        super(props);
        console.log('This is props ', props)
        this.init();
        this._WebApi = 'SMST015';
    }

    //Iniatialise 
    init() {
        if (Object.keys(this.Data).length != 0)
            return;

        this._saving = false;
        const model = this.Data;
        model.FormID = "SMST016";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {

            SMST016_LangSNO: 0,
            SMST016_LangSSMSNO: 0,
            SMST016_LangCode: null,
            SMST016_CarHeading: '',
            SMST016_TodoHeading: '',
            SMST016_SlideHeading: '',
            SMST016_ConcierHeading: '',
            SMST016_Status: true,
            ModifiedOn: null,
            ModifiedBy: '',
            IsEdit: false
        };
        model.SearchInput = {

            SMST016_LangCodeSrch: null,

        };
        model.AllSelected = false;
        model.SMST016_LangCodeListSrch = [];
        model.SMST016_LangCodelist = [];
        model.SMST016_LangSSMSNO = [];
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 10 };
        model.GridInfo.Columns = [
            // { text: '', field: 'Text', width: '25px' },
            { text: 'Language', field: 'lang_nam', width: '40%', sort: { enabled: true } },
            { text: 'Modified By', field: 'mod_by_usr_cd', width: '30%' },
            { text: 'Modified On', field: 'mod_dttm', width: '30%' },
        ];
        this.newMode(false);
    }

    // For set the value on initial load
    newMode(setFocus = true, callback) {
        const model = this.Data;
        //model.Input.IsEdit = false;
        model.Input = {

            SMST016_LangSNO: 0,
            SMST016_LangSSMSNO: 0,
            SMST016_LangCode: null,
            SMST016_CarHeading: '',
            SMST016_TodoHeading: '',
            SMST016_SlideHeading: '',
            SMST016_ConcierHeading: '',
            SMST016_Status: true,
            ModifiedOn: null,
            ModifiedBy: '',
            IsEdit: false
        };


        this.setTitle();
        if (setFocus === true)
            this.setFocus('SMST016_LangCode');

        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
        Utils.invoke(callback);
    }

    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.lang_srl = model.SMST016_LangSNO;
        dataInfo.ssm_srl = this.props.data.SSMNO;

        if (!Utils.isNullOrEmpty(model.SMST016_LangCode)) {
            dataInfo.lang_cd = model.SMST016_LangCode.ID;
        }

        // dataInfo.lang_cd = model.SMST016_LangCode;
        dataInfo.car_head = model.SMST016_CarHeading;
        dataInfo.todo_head = model.SMST016_TodoHeading;
        dataInfo.slide_head = model.SMST016_SlideHeading;
        dataInfo.concier_head = model.SMST016_ConcierHeading;
        dataInfo.mod_by_usr_cd = model.ModifiedBy;
        dataInfo.mod_dttm = model.ModifiedOn;
        dataInfo.IsEdit = this.Data.Input.IsEdit;
        return dataInfo;

    }

    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    handleSearch() {
        const me = this;
        me.loadPage(1);
        me.setFocus('SMST015_SSMIDSrch');
    }
    //Call clear function 
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    //Clear the values
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;

        if (clearAll === true) {
            model.SearchInput.SMST016_LangCodeSrch = null;
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;

        if (clearAll === true)
            this.setFocus('SMST015_SSMIDSrch');
        this.updateUI();
    }
    //For show alert box 
    showAlert(errorMsg, name) {
        if (typeof errorMsg === 'number')
            errorMsg = Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,
            messageboxType: WKLMessageboxTypes.question
        };
        if (name) {
            opt.onClose = (_e) => {
                me.setFocus(name);
            }
        }
        this.showMessageBox(opt);
    }
    //For show confirmation box 
    showConfirmation(msgNo, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
        let text = '';
        if (typeof msgNo === 'number') {
            text: Utils.getMessage(msgNo)
        }
        else {
            text = msgNo;
        }
        this.showMessageBox({
            text: text,
            buttons: options,
            messageboxType: WKLMessageboxTypes.question,
            onClose: callback
        });
    }
    loadInitData() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const dataInfo = {};
        dataInfo.ssm_srl = this.props.data.SSMNO;
        dataInfo.PageNo = 1;
        dataInfo.PageSize = gridInfo.PageSize;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST016OnloadAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                model.SMST016_LangCodeListSrch = r.LangItems.map((data) => ({ ID: data.lang_cd_mast, Text: data.lang_nam_mast }));
                model.SMST016_LangCodelist = r.LangItems.map((data) => ({ ID: data.lang_cd_mast, Text: data.lang_nam_mast }));
                me.fillSearchResult(r || {});

            }

            catch (ex) { }
            finally {
                me.updateUI();
                this.setFocus('');

            }
        });
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items || [];

        gridInfo.Page = r.CurrentPage || 0;
        gridInfo.TotalPage = r.TotalPages || 0;
        gridInfo.TotalCount = r.TotalCount || 0;
        if (gridInfo.Items.length > 0) {
            if (selectedItem !== undefined && selectedItem !== null) {
                selectedItem = gridInfo.Items.first(i => i.ID == selectedItem.ID);
            }
            if (selectedItem === null)
                selectedItem = gridInfo.Items[0];
        }
        if (selectedItem != null)
            selectedItem.isSelected = true;
        gridInfo.SelectedItem = selectedItem;
    }
    loadPage(pageIndex, columnOptions = null) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.Mode = "SEARCH";
        if (!Utils.isNullOrEmpty(model.SearchInput.SMST016_LangCodeSrch)) {
            dataInfo.lang_cd = model.SearchInput.SMST016_LangCodeSrch.ID;
        }
        else {
            dataInfo.lang_cd = '';
        }
        dataInfo.ssm_srl = this.props.data.SSMNO;
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "lang_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST016SearchAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                me.fillSearchResult(r || {}, selectedItem);
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }
    onBlurSrch() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.ssm_srl = this.props.data.SSMNO;
        if (!Utils.isNullOrEmpty(model.Input.SMST016_LangCode)) {
            dataInfo.lang_cd = model.Input.SMST016_LangCode.ID;
        }
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST016BlurSearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                r = r || {};
                if (r.Isavailable === true) {
                    me.handleModified(r.Items[0]);
                }
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }
    handleModified(data) {
        const model = this.Data;
        const me = this;
        this.showConfirmation("Record already exists. Do you want to retrieve?", false, (e) => {
            if (e == 0) {
                model.Input.SMST016_LangSNO = data.lang_srl;
                model.Input.SMST016_LangSSMSNO = data.ssm_srl;
                model.Input.SMST016_CarHeading = data.car_head || "";
                model.Input.SMST016_TodoHeading = data.todo_head || "";
                model.Input.SMST016_SlideHeading = data.slide_head || "";
                model.Input.SMST016_ConcierHeading = data.concier_head || "";
                model.Input.ModifiedOn = data.mod_dttm;
                model.Input.ModifiedBy = data.mod_by_usr_cd;
                model.Input.IsEdit = true;
                model.Input.SMST016_LangCode = model.SMST016_LangCodelist.find(obj => obj.ID === data.lang_cd);
            }
            else{
                me.setFocus("SMST016_LangCode")
            }

        });
    }
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.lang_srl);
    }
    loadSelectedData(id) {
        const me = this;
        const model = this.Data;
        let dataInfo = {};
        dataInfo.Mode = "SELECT";
        dataInfo.lang_srl = id;
        me.Data.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${me._WebApi}/SMST016SearchAsync`, data: dataInfo }, (r) => {
            try {
                me.Data.Loading = false;
                if (r.Items) {
                    r = r.Items[0];
                    model.Input.SMST016_LangSNO = r.lang_srl;
                    model.Input.SMST016_LangSSMSNO = r.ssm_srl;
                    model.Input.SMST016_CarHeading = r.car_head || "";
                    model.Input.SMST016_TodoHeading = r.todo_head || "";
                    model.Input.SMST016_SlideHeading = r.slide_head || "";
                    model.Input.SMST016_ConcierHeading = r.concier_head || "";
                    model.Input.ModifiedOn = r.mod_dttm;
                    model.Input.ModifiedBy = r.mod_by_usr_cd;
                    model.Input.IsEdit = true;
                    model.Input.SMST016_LangCode = model.SMST016_LangCodelist.find(obj => obj.ID === r.lang_cd);

                }
                else {

                    model.Input.SMST016_LangSNO = '';
                    model.Input.SMST016_LangSSMSNO = '';
                    model.Input.SMST016_LangCode = null;
                    model.Input.SMST016_CarHeading = '';
                    model.Input.SMST016_TodoHeading = '';
                    model.Input.SMST016_SlideHeading = '';
                    model.Input.SMST016_ConcierHeading = '';
                    model.Input.ModifiedBy = '';
                    model.Input.ModifiedOn = null;
                    model.Input.IsEdit = false;
                }

                me.setTitle();
                let dataCopyEx = this.getData();
                this.Data.DataCopy = JSON.stringify(dataCopyEx);

                this.setFocus('SMST015_SSMAirports');
            }
            catch (ex) { }
            finally {
                this.updateUI();
            }
        });
    }

    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data;
        if (selectedItem) {
            if (selectedItem.ssm_srl === model.Input.SMST015_SSMSNO) {
                this.setFocus('SMST016_LangCode');
                return;
            }
            else {
                if (this.isValueChanged()) {
                    this.showConfirmation("Do you want to save the current data ?", true, (_e) => {
                        try {
                            if (_e === 0) {
                                Utils.invokeAction({
                                    owner: this,
                                    formID: model.FormID,
                                    controlID: model.IsEdit ? 'btn_edit' : 'btn_new',
                                    callback: (e) => {
                                        e = e || {};
                                        if (selectedItem)
                                            e.followUpAction = () => this.setSelectedItem(selectedItem, true);
                                        me.doSave(e);
                                    }
                                });
                            }
                            else if (_e === 1) {
                                if (selectedItem)
                                    this.setSelectedItem(selectedItem, true);
                                else
                                    this.newMode();
                            }
                        }
                        catch (ex) { }
                        finally { }
                    });
                }
                else {
                    if (selectedItem)
                        this.setSelectedItem(selectedItem, true);
                    else
                        this.newMode();
                }
            }

        }
        else {
            if (this.isValueChanged()) {
                this.showConfirmation("Do you want to save the current data ?", true, (_e) => {
                    try {
                        if (_e === 0) {
                            Utils.invokeAction({
                                owner: this,
                                formID: model.FormID,
                                controlID: model.IsEdit ? 'btn_edit' : 'btn_new',
                                callback: (e) => {
                                    e = e || {};
                                    if (selectedItem)
                                        e.followUpAction = () => this.setSelectedItem(selectedItem, true);
                                    me.doSave(e);
                                }
                            });
                        }
                        else if (_e === 1) {
                            if (selectedItem)
                                this.setSelectedItem(selectedItem, true);
                            else
                                this.newMode(true);
                        }
                    }
                    catch (ex) { }
                    finally { }
                });
            }
            else {
                if (selectedItem)
                    this.setSelectedItem(selectedItem, true);
                else
                    this.newMode(true);
            }
        }
    }


    handleValueChange(followUpAction) {
        const model = this.Data;
        if (this.isValueChanged()) {
            const me = this;
            this.showConfirmation("Do you want to Discard the changes?", false, (e) => {
                try {
                    if (e == 0) {
                        me.close();
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            Utils.invoke(followUpAction);
        }
    }
    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.SMST016_LangCode)) {
            this.showAlert('Please Select Language(32)', 'SMST016_LangCode');
            return false;
        }
        return true;
    }

    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            if (model.Input.IsEdit) {
                me.showAlert("No changes has been made.", 'SMST016_LangCode');
            }
            else {
                me.showAlert("Please Enter required fields(87)", 'SMST016_LangCode');
            }
        }
    }

    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = model.Input.IsEdit === true ? "UPDATE" : "SAVE";
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SMST016SaveAsync`, data: dataInfo }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        model.IsSaved = true;
                        me.handleSaveFollowup(e);
                    }
                    else {
                        me.showAlert('Something went wrong (1)');
                    }
                }
                catch (ex) { }
                finally {
                    me.updateUI();
                }
            });
        }
    }
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        me.showAlert('Data saved successfully (4)', 'SMST016_LangCode');
        this.loadPage(pageNo);
        me.newMode(true);
    }
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit) {
            if (!Utils.isNullOrEmpty(model.Input.SMST016_LangCode)) {
                model.Title = `${this.props.data.Title} / ${this.props.data.SSMName} / Language  / Edit  / ${model.Input.SMST016_LangCode.Text} `;
            }
            else {
                model.Title = `${this.props.data.Title} / ${this.props.data.SSMName} / Language  / Edit `;
            }
        }
        else {
            model.Title = `${this.props.data.Title} / ${this.props.data.SSMName}  / Language / New `;
        }

    }
    doClose() {
        this.handleValueChange(() => this.close({ IsSaved: this.Data.IsSaved }));
    }
}