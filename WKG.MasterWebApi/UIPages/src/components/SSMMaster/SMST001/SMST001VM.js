import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SMST001VM extends VMBase {
    constructor(props) {
        super(props);
        this.init();
        this._WebApi = 'SMST001';
    }

    // Inizilation
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        this._saving = false;
        const model = this.Data;
        model.FormID = "SMST001";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            IsEdit: false,
            Poscd: '',
            PosName: '',
            StatusN: true,
            SMST001_Pos_Id: "",
            SMST001_Pos_Name: "",
            ModifiedBy: "",
            ModifiedOn: ""
        };
        model.SearchInput = {
            PosName: '',
            IsActive: true,
        };
        //model.AllSelected = false;
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 11 };
        model.GridInfo.Columns = [
            //{ text: '', field: 'Text', width: '25px' },
            { text: 'Pos Id', field: 'pos_cd', width: '20%' },
            { text: 'Pos Name', field: 'pos_nam', width: '60%', sort: { enabled: true } },
            { text: 'Status', field: 'act_inact_ind', width: '20%' }
        ];
        this.newMode(false);
    }

    //Intial page load
    loadInitData() {
        this.IniloadPage(1);
        this.setFocus('SMST001_Pos_Id');
    }

    // If bind intial to use 
    IniloadPage(pageIndex, callback) {
        this.SearchloadPage(pageIndex, callback);
    }
    //Search Textbox
    handleSearch() {
        const me = this;
        me.SearchloadPage(1, () => me.setFocus('PosName'));
    }

    //Search call DB
    SearchloadPage(pageIndex, columnOptions = null) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.Mode = "SEARCH"
        dataInfo.Name = model.SearchInput.PosName;
        dataInfo.Status = model.SearchInput.IsActive == true ? 1 : 0;
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        console.log(dataInfo);
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "pos_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST001SearchAsync`, data: dataInfo }, (r) => {
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

    //Search result set table 
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(e => {
            if (e.act_inact_ind.toUpperCase() == "TRUE") {
                return { ...e, act_inact_ind: "Active" }
            }
            else {
                return { ...e, act_inact_ind: "Inactive" }
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

    //Grid row selection
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.pos_cd);
    }

    //Search clear btn
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }

    //Search clear function
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;

        if (clearAll === true) {
            model.SearchInput.PosName = '';
            model.SearchInput.IsActive = true;
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;

        if (clearAll === true)
            this.setFocus('PosName');
        this.updateUI();
    }

    //Set After Setfocus
    setFocus(Txtbxname) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(Txtbxname);
    }

    //Close page
    doClose() {
        const me = this;
        if (this.isValueChanged()) {
            let options = [{ text: 'Yes' }, { text: 'No' }];
            this.showMessageBox({
                text: "Do you want to Discard the changes?",
                buttons: options,
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (_e === 0) {
                        me.close();
                    }
                }
            });
        }
        else {
            this.close()
        }
    }

    //To set Tittle
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit)
            model.Title = `${this.props.data.Title} / Edit / ${model.Input.SMST001_Pos_Name}`;
        else
            model.Title = `${this.props.data.Title} / New`;
        // model.Title = `${this.props.InputData.Title ? `${this.props.InputData.Title}` : "Pos Master"}/ New`;
    }

    //Get edit data table to render form
    loadSelectedData(id) {
        const me = this;
        const model = this.Data;
        let dataInfo = {};
        dataInfo.Mode = "SELECT"
        dataInfo.pos_cd = id;
        me.Data.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${me._WebApi}/SMST001SearchAsync`, data: dataInfo }, (r) => {
            try {
                me.Data.Loading = false;
                if (r) {
                    console.log("r.Items : " , r)
                    r = r.Items[0];
                    model.Input.SMST001_Pos_Id = r.pos_cd;
                    model.Input.SMST001_Pos_Name = r.pos_nam;
                    model.Input.StatusN = r.act_inact_ind.toUpperCase() === 'TRUE';
                    model.Input.ModifiedBy = r.mod_by_usr_cd;
                    model.Input.ModifiedOn = r.mod_dttm;
                    model.Input.IsEdit = true;

                }
                else {
                    model.Input.SMST001_Pos_Id = '';
                    model.Input.SMST001_Pos_Name = '';
                    model.Input.Status = null;
                    model.Input.ModifiedOn = null;
                    model.Input.IsEdit = false;

                }
                me.setTitle();
                let dataCopyEx = this.getData();
                this.Data.DataCopy = JSON.stringify(dataCopyEx);
                this.setFocus('SMST001_Pos_Id');
            }
            catch (ex) { }
            finally {
                this.updateUI();
            }
        });
    }

    // On save Validation
    isvalidSave(e) {
        const model = this.Data.Input;
        const me = this;
        const opts = {
            text: "",
            messageboxType: WKLMessageboxTypes.info
        };
        if (Utils.isNullOrEmpty(model.SMST001_Pos_Id)) {
            opts.text = "Please enter Pos Id";
            this.showAlert(32, 'SMST001_Pos_Id');//Please enter name
            opts.onClose = (_e) => {
                me.setFocus("SMST001_Pos_Id");
            }
            return false;
        } else if (Utils.isNullOrEmpty(model.SMST001_Pos_Name)) {
            opts.text = "Please enter Pos Name";
            opts.onClose = (_e) => {
                if (model.Input.SMST001_Pos_Id === "")
                    me.setFocus("SMST001_Pos_Id");
                else if (model.Input.SMST001_Pos_Name === "")
                    me.setFocus("SMST001_Pos_Name");
            }
        }

        this.showMessageBox(opts);
        return true;
    }

    // Get rendering form Data
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.pos_cd = model.SMST001_Pos_Id;
        dataInfo.pos_nam = model.SMST001_Pos_Name;
        dataInfo.act_inact_ind = model.StatusN;
        return dataInfo;
    }

    handleSave(e) {
        const model = this.Data.Input;
        const me = this;
        if (model.SMST001_Pos_Id === "" || model.SMST001_Pos_Name === "") {
            const opts = {
                text: "",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (me.Data.Input.SMST001_Pos_Id === "") {
                        if (_e === 10) return;
                        if (e === 1) me.Data.Input.IsEdit = true;
                        this.setFocus("SMST001_Pos_Id");
                        me.updateUI();
                    } else if (model.SMST001_Pos_Name === "") {
                        if (_e === 10) return;
                        if (e === 1) me.Data.Input.IsEdit = true;
                        this.setFocus("SMST001_Pos_Name");
                        me.updateUI();
                    }
                }
            };
            if(me.Data.Input.SMST001_Pos_Id === "" && model.SMST001_Pos_Name === ""){
                opts.text = "Please Enter Required Fields";
            }
            else if (me.Data.Input.SMST001_Pos_Id === "") {
                opts.text = "Please Enter Pos Id";
            } else if (model.SMST001_Pos_Name === "") {
                opts.text = "Please Enter Pos Name";
            }
            this.showMessageBox(opts);
            return;
        }
        if (!this.isValueChanged()) {
            const opts = {
                text: "No changes has been made.",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (me.Data.Input.IsEdit)
                        me.setFocus("SMST001_Pos_Name");
                    else
                        me.setFocus("SMST001_Pos_Id");
                }
            };
            this.showMessageBox(opts);
            return;
        }
        const dataInfo = this.getData();
        dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
        dataInfo.ISEdit = model.IsEdit;
        Utils.ajax({ url: `${this._WebApi}/SMST001SaveAsync`, data: dataInfo }, (r) => {
            if (r.IsSuccess) {
                const opts = {
                    text: "Data Saved Successfully",
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        let pageNo = this.Data.GridInfo.Page;
                        me.SearchloadPage(pageNo);
                        if (e === 5) return;
                        me.newMode();
                        me.setFocus("SMST001_Pos_Id");
                    }
                };
                this.showMessageBox(opts);

            } else {
                const opts = {
                    text: "Something went Wrong",
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                    }
                };
                this.showMessageBox(opts);
            }
        });
    }

    // On save DB
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            if (model.Input.SMST001_Pos_Id === "" || model.Input.SMST001_Pos_Name === "") {
                const opts = {
                    text: "",
                    messageboxType: WKLMessageboxTypes.info
                };
                if (model.Input.SMST001_Pos_Id === "") opts.text = "Please enter Pos Id";
                if (model.Input.SMST001_Pos_Name === "") opts.text = "Please enter Pos Name";
                opts.onClose = (_e) => {
                    if (model.Input.SMST001_Pos_Id === "")
                        me.setFocus("SMST001_Pos_Id");
                    else if (model.Input.SMST001_Pos_Name === "")
                        me.setFocus("SMST001_Pos_Name");
                }
                this.showMessageBox(opts);
            } else {
                model.Loading = true;
                me.updateUI();
                Utils.ajax({ url: `${this._WebApi}/SMST001SaveAsync`, data: dataInfo }, r => {
                    try {
                        model.Loading = false;
                        r = r || {};
                        if (r.IsSuccess === true) {
                            model.IsSaved = true;
                            me.handleSaveFollowup(e);
                        }
                        else {
                            if (r.ErrorNo === -1) {//Duplicate code
                                me.showAlert(104, 'ID');
                            }
                            else if (r.ErrorNo === -2) {//Modified
                                me.handleModified(dataInfo, e);
                            }
                            else if (r.ErrorNo === -3) {//Overlapping
                                me.handleModified(dataInfo, e);
                            }
                            else if (r.ErrorNo >= 241) {//Duplicate code
                                me.showAlert(r.ErrorNo, 'Type');
                            }
                            else {
                                me.showAlert(1);
                            }
                        }
                    }
                    catch (ex) {
                        console.log(ex);
                    }
                    finally {
                        me.updateUI();
                    }
                });
            }
        }
    }
    handleModified(dataInfo, e) {
        const me = this;
        this.showConfirmation(61, false, (e) => {
            if (e == 0) {
                me.loadSelectedData(dataInfo.ID);
            }
            else {
                if (e.followUpAction && typeof (e.followUpAction) === 'function') {
                    Utils.invoke(e.followUpAction);
                }
                else
                    me.newMode();
            }
        });
    }
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        if (e.followUpAction && typeof (e.followUpAction) === 'function') {
            this.showToaster(4, e.followUpAction);
        }
        else {
            this.showToaster(4, () => me.IniloadPage(pageNo, () => me.newMode()));
        }
    }
    handleDelete(e) {
        const me = this;
        const model = this.Data;
        if (model.Input.IsEdit === true) {
            this.showConfirmation(2, false, (_e) => {
                if (_e == 0) {
                    me.doDelete(e);
                }
            });
        }
    }
    doDelete(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        const items = model.GridInfo.Items || [];
        if (items.length === 1) {
            pageNo -= 1;
        }
        const dataInfo = { ID: model.Input.ID, Text: model.Input.OrgText };
        model.Loading = true;
        Utils.ajax({ url: `${this._WebApi}/DeleteAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess === true) {
                    me.showToaster(3, () => {
                        me.IniloadPage(pageNo, () => this.newMode());
                    });
                }
                else {
                    this.showAlert(1);
                }
            }
            catch (es) { }
            finally {
                me.updateUI();
            }
        });
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    showAlert(errorMsg, name, msgType = WKLMessageboxTypes.error) {
        console.log('show alert');
        if (typeof errorMsg === 'number') {
            console.log('show alert');
            errorMsg = Utils.getMessage(errorMsg);
        }
        const opts = {
            text: errorMsg,
            messageboxType: msgType
        };
        if (name) {
            opts.onClose = (_e) => {
                this.setFocus(name);
            }
        }
        this.showMessageBox(opts);
    }


    newMode(setFocus = true, callback) {
        const model = this.Data;
        model.Input.StatusN = true;
        model.Input.SMST001_Pos_Id = "";
        model.Input.SMST001_Pos_Name = "";

        model.Input.ModifiedOn = "";
        model.Input.ModifiedBy = "";
        model.Input.IsEdit = false;
        this.setTitle();
        this.setFocus('SMST001_Pos_Id');

        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
        Utils.invoke(callback);
    }

    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data;
        if (selectedItem) {
            if (selectedItem.pos_cd === model.Input.SMST001_Pos_Id && selectedItem.pos_nam === model.Input.SMST001_Pos_Name && selectedItem.act_inact_ind === (model.Input.StatusN ? "Active" : "Inactive")) {
                me.setFocus('SMST001_Pos_Name');
                return;
            }
            else {
                if (this.isValueChanged()) {
                    let options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
                    this.showMessageBox({
                        text: "Do you want to save the current data ?",
                        buttons: options,
                        messageboxType: WKLMessageboxTypes.info,
                        onClose: (_e) => {
                            if (_e === 0) {
                                me.handleSave();
                            } else if (_e === 1) {
                                model.Input.IsEdit = true;
                                me.setSelectedItem(selectedItem, true);
                                me.setFocus('SMST001_Pos_Name');
                            }

                        }
                    });
                }
                else {
                    this.setSelectedItem(selectedItem, true);
                    me.setFocus('SMST001_Pos_Name');
                }
            }
        }
        else {
            if (this.isValueChanged()) {
                let options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
                this.showMessageBox({
                    text: "Do you want to save the current data ?",
                    buttons: options,
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        if (_e === 0) {
                            me.Data.Input.IsEdit = true;
                            me.handleSave();
                            me.setFocus('SMST001_Pos_Id');
                        } else if (_e === 1) {
                            me.newMode();
                            // me.setFocus('SMST001_Pos_Id');
                        }
                    }
                });
            } else {
                me.newMode();
            }
        }
    }
    showConfirmation(msgNo, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];

        this.showMessageBox({
            text: Utils.getMessage(msgNo),
            buttons: options,
            messageboxType: WKLMessageboxTypes.question,
            onClose: callback
        });
    }



    showToaster(msgNo = 4, callback) {
        const me = this;
        this.Data.ShowToast = true;
        this.Data.ToastConfig = {
            onClose: () => {
                me.Data.ShowToast = false;
                try {
                    Utils.invoke(callback);
                }
                catch (ex) { }
                finally {
                    me.updateUI();
                }
            },
            title: 'Confirmation',
            message: Utils.getMessage(msgNo),
            toasterType: 'info',
        };
        this.updateUI();
    }

}