import { Utils, WKLMessageboxTypes, ApiManager, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SMST041VM extends VMBase {
    constructor(props) {
        super(props);
        console.log('This is props ', props)
        this.init();
        this._WebApi = 'SMST015';
    }

    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SMST041";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            SMST041_LangCode: null,
            SMST041_Status: null,
            ModifiedOn: null,
            ModifiedBy: '',
            IsEdit: false,
            IsSelected: true,

        };
        model.SearchInput = {
            SMST041_StatusSrch: true,
        };
        model.AllSelected = false;
        model.GridInfo = {
            Items: [{
                "id": 1,
                "firstName": "Heathrow Group",
                "lastName": "Doe",
                "age": 20,
                "gender": "Male",
                "status": "Active",
                "major": "Computer Science",
                "city": "New York"
            },
            {
                "id": 2,
                "firstName": "London Group",
                "lastName": "Smith",
                "age": 22,
                "gender": "Female",
                "status": "Inactive",
                "major": "Mathematics",
                "city": "Los Angeles"
            },
            {
                "id": 3,
                "firstName": "Heathrow Group",
                "lastName": "Johnson",
                "age": 21,
                "gender": "Male",
                "status": "Active",
                "major": "Physics",
                "city": "Chicago"
            },
            {
                "id": 4,
                "firstName": "London Group",
                "lastName": "Davis",
                "age": 19,
                "gender": "Female",
                "status": "Active",
                "major": "Chemistry",
                "city": "Houston"
            },
            {
                "id": 5,
                "firstName": "Heathrow Group",
                "lastName": "Brown",
                "age": 23,
                "gender": "Male",
                "status": "Inactive",
                "major": "Biology",
                "city": "San Francisco"
            }]
            , Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 10
        };
        model.GridInfo.Columns = [
            { text: 'Name', field: 'firstName', width: '40%' },
            { text: 'Status', field: 'status', width: '30%' },
            { text: 'Actions', field: '', width: '30%' },
        ];

        this.newMode();
    }
    newMode() {
        const model = this.Data;
        model.Input = {
            SMST041_Status: true,
            ModifiedOn: null,
            ModifiedBy: '',
            IsEdit: false
        };
        this.setFocus('SMST041_LangCode');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();

    }
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.ssm_srl = model.SMST015_SSMSNO;
        if (!Utils.isNullOrEmpty(model.SMST015_SSMID)) {
            dataInfo.ssm_id = model.SMST015_SSMID.ID;
        }
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    loadInitData() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST010InitLoadDataAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                me.fillSearchResult(r.InputFields || {}, selectedItem);
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
        this.setFocus("SSM_Id_F");
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.map(e => {
            if (e.ssm_status === "True") {
                return { ...e, ssm_status: "Active" }
            } else {
                return { ...e, ssm_status: "Inactive" }
            }
        }) || [];
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

    handleSearch() {
        const me = this;
        me.loadPage(1)
        me.setFocus('SMST015_SSMIDSrch');
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;

        if (clearAll === true) {
            model.SearchInput.SMST015_SSMIDSrch = '';
            model.SearchInput.SMST015_StatusSrch = true;
            this.setFocus('SMST015_SSMIDSrch');
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        this.updateUI();
    }
    loadPage(pageIndex, columnOptions = null) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.SortTyp = null;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "Name" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST010InitLoadDataAsync`, data: dataInfo, files: [] }, (r) => {
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
        if (!Utils.isNullOrEmpty(model.Input.SMST017_LangCode)) {
            dataInfo.lang_cd = model.Input.SMST017_LangCode.ID;
        }
        //model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST017BlurSearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                //model.Loading = false;
                r = r || {};
                if (r.Isavailable === true) {
                    me.handleModified(r.Items);
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

                model.Input.SMST017_Status = data.act_inact_ind.toUpperCase() == "TRUE" ? true : false;
                model.Input.ModifiedOn = data.mod_dttm;
                model.Input.ModifiedBy = data.mod_by_usr_cd;
                model.Input.IsEdit = true;
            }
            else {
                me.setFocus("")
            }

        });
    }
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.ssm_srl);
    }
    loadSelectedData(id) {
        const me = this;
        const model = this.Data;
        let dataInfo = {};
        dataInfo.ssm_srl = id;
        me.Data.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${me._WebApi}/SMST015SearchAsync`, data: dataInfo }, (r) => {
            try {
                me.Data.Loading = false;
                if (r) {
                    r = r[0];
                    model.Input.SMST015_SSMSNO = r.ssm_srl;
                    model.Input.SMST015_Status = r.act_inact_ind.toUpperCase() == "TRUE" ? true : false;
                    model.Input.ModifiedOn = r.mod_dttm;
                    model.Input.ModifiedBy = r.mod_by_usr_cd;
                    model.Input.IsEdit = true;

                }
                else {

                    model.Input.SMST015_SSMSNO = 0;
                    model.Input.SMST015_Status = true;
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
                this.setFocus('SMST015_SSMAirports');
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
    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.SMST015_SSMID)) {
            this.showAlert('Please Select SSMID(32)', 'SMST015_Cartpy');
            return false;
        }
        if (Utils.isNullOrEmpty(model.SMST015_Cartpy)) {
            this.showAlert('Please Select the Car Type(32)', 'SMST015_Cartpy');
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
                me.showAlert("No changes has been made.", 'SMST015_SSMID');
            }
            else {
                me.showAlert("Please Enter required fields(87)", 'SMST015_SSMID');
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
            let pageNo = model.GridInfo.Page;
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SMST015SaveAsync`, data: dataInfo }, r => {
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
        me.showAlert('Data saved successfully (4)', 'SMST015_SSMID');

        this.loadPage(pageNo);
        me.newMode(true);
    }
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit) {
            model.Title = `${this.props.data.Title} / Edit`;
        }
        else {
            model.Title = "SSM / New";
        }

    }

    handleValueChange(followUpAction) {
        const model = this.Data;
        if (this.isValueChanged()) {
            const me = this;
            this.showConfirmation("Do you want to save the current data ?", true, (e) => {
                try {
                    if (e == 0) {
                        Utils.invokeAction({
                            owner: this,
                            formID: model.FormID,
                            controlID: me.Data.Input.IsEdit ? 'btn_edit' : 'btn_new',
                            callback: (e) => {
                                e = e || {};
                                if (followUpAction && typeof (followUpAction) === 'function') {
                                    e.followUpAction = followUpAction;
                                }
                                else
                                    e.followUpAction = () => this.newMode();
                                me.doSave(e);
                            }
                        });
                    }
                    else if (e == 1) {
                        if (followUpAction && typeof (followUpAction) === 'function') {
                            me.newMode();
                            followUpAction();
                        }
                        else
                            me.newMode(true);
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
    doClose() {
        this.handleValueChange(() => this.close({ IsSaved: this.Data.IsSaved }));
    }
   
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
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
    showConfirmation(msgNo, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
        let text = '';
        if (typeof msgNo === 'number') {
            text = Utils.getMessage(msgNo)
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
}