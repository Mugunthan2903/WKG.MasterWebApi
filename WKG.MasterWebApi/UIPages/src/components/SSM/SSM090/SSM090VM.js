import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM090VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM090';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM090";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.imageCopy = null;
        model.Image_Array = null;
        model.ImageNameExists = null;
        //model.Image_Url = null;
        model.Image_SNO = null;
        model.Image_Upload = null;
        model.ImageDirectory = '';
        model.LangTypes = [];
        model.LangTypesCopy = [];
        model.Input = {
            Locat_SNO: "",
            Locat_nam: "",
            Data_SNO: "",
            Sort_order: "",
            Status: true,
            Modifiedon: null,
            Modifiedby: "",
            IsEdit: false,
        };
        model.SearchInput = {
            LocationSrch: "",
            StatusSrch: true,
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            { text: 'Location Name', field: 'loc_nam', width: '50%', sort: { enabled: true } },
            { text: 'Sort Order', field: 'sort_ordr', width: '30%' },
            { text: 'Status', field: 'act_inact_ind', width: '20%' },
        ];

        this.newMode();
    }
    newMode() {
        console.log("Props", this.props)
        const model = this.Data;
        const dataModel = this.Data.Input;
        model.LangTypes = model.LangTypes.map(e => ({ ...e, value: "" }));
        dataModel.Locat_SNO = "";
        dataModel.Locat_nam = "";
        dataModel.Data_SNO = "";
        model.Image_Array = null;
        model.Image_Upload = "";
        model.Image_SNO = null;
        dataModel.Sort_order = "";
        dataModel.Status = true;
        dataModel.Modifiedon = null;
        dataModel.Modifiedby = "";
        dataModel.IsEdit = false;

        this.setFocus('Locat_nam');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        model.LangTypesCopy = JSON.stringify(model.LangTypes);
        this.updateUI();
    }
    getData() {
        const model = this.Data;
        const dataModel = this.Data.Input;
        const dataInfo = {};
        dataInfo.loc_srl = dataModel.Locat_SNO;
        dataInfo.loc_nam = dataModel.Locat_nam || "";
        dataInfo.img_srl = model.Image_SNO;
        dataInfo.img_dir = model.ImageDirectory;
        dataInfo.img_nam = model.Image_Upload || "";
        dataInfo.data_srl = dataModel.Data_SNO;
        dataInfo.sort_ordr = dataModel.Sort_order;
        dataInfo.act_inact_ind = dataModel.Status;
        dataInfo.LangData = model.LangTypes;

        return dataInfo;
    }
    getMaxWindowHeight() {
        const model = this.Data;
        const gridFooter = document.querySelector(`.${model.FormID}`);
        const windowButtonArea = document.querySelector('.window-button-area');
        if (!gridFooter || !windowButtonArea) {
            return null;
        }
        const rectGridFooter = gridFooter.getBoundingClientRect();
        const rectWindowButtonArea = windowButtonArea.getBoundingClientRect();
        const distance = rectWindowButtonArea.top - rectGridFooter.bottom;
        return distance;
    }
    adjustPageSize() {
        const model = this.Data;
        var maxHeight = this.getMaxWindowHeight();
        var rowHeight = 27;
        var rowsPerPage = Math.floor(maxHeight / rowHeight);
        model.GridInfo.PageSize += rowsPerPage;
    }
    loadInitData() {
        this.adjustPageSize();
        this.onLoad(1);
    }
    isImageChanged() {
        const model = this.Data;
        return model.imageCopy !== model.Image_Upload;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    isLangChanged() {
        const model = this.Data;
        return JSON.stringify(model.LangTypes) !== model.LangTypesCopy;
    }
    onLoad(pageIndex) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrch === true ? 1 : 0;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM090OnloadAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    if (r.Items) {
                        me.fillSearchResult(r || {}, selectedItem);
                    }
                    model.ImageDirectory = r.img_dir;
                    if (!Utils.isNullOrEmpty(r.Lang_types)) {
                        this.BuildLangTypes(r.Lang_types);
                    }
                }
            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                me.newMode();
                me.updateUI();
            }
        });
    }
    BuildLangTypes(item) {
        const me = this;
        const model = this.Data;
        let data = JSON.parse(item);
        console.log("data : ", data);
        let obj = data[0];
        for (let field in obj) {
            if (field !== "mod_by_usr_cd" && field !== "mod_dttm") {
                if (field === "data_srl") {

                }
                else if (field === "data_typ_cd") {

                }
                else {
                    model.LangTypes.push({ text: field, value: '' });
                }
            }
        }
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(e => ({ ...e, act_inact_ind: e.act_inact_ind ? "Active" : "Inactive" })) || [];
        gridInfo.Page = r.CurrentPage || 0;
        gridInfo.TotalPage = r.TotalPages || 0;
        gridInfo.TotalCount = r.TotalRecords || 0;
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
    handleSearch(pageIndex) {
        this.loadPage(pageIndex);
    }
    loadPage(pageIndex, columnOptions = null,) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.loc_nam = model.SearchInput.LocationSrch;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrch === true ? 1 : 0;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "loc_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM090GetSearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r && r.Items) {
                    me.fillSearchResult(r || {}, selectedItem);
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
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        if (clearAll === true) {
            model.SearchInput.LocationSrch = '';
            model.SearchInput.StatusSrch = true;
            this.setFocus('LocationSrch');
            this.setTitle();
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        gridInfo.TotalCount = 0;
        this.updateUI();
    }
    onBlurCheck(name) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.img_dir = model.ImageDirectory;
        this.updateUI();
        if (!Utils.isNullOrEmpty(name)) {
            Utils.ajax({ url: `${this._WebApi}/SSM090BlurAsync`, data: dataInfo, files: [] }, (r) => {
                try {
                    if (r && r.ImageName) {
                        if (!Utils.isNullOrEmpty(r.ImageName)) {
                            model.ImageNameExists = r.ImageName.split(',');
                        }
                        if (!Utils.isNullOrEmpty(model.ImageNameExists) && model.ImageNameExists.length !== 0) {
                            if (model.ImageNameExists.includes(name)) {
                                me.showAlert('Image already exists.');
                                model.Image_Upload = "";
                                model.Image_Array = null;
                            }
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

        this.updateUI();
    }
    handleDataChange(selectedItem) {
        const me = this;
        const dataModel = this.Data.Input;
        if (selectedItem) {
            if (selectedItem.loc_srl === dataModel.Locat_SNO) {
                this.setFocus('Locat_nam');
                return;
            }
            else {
                if (this.isValueChanged()) {
                    this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                        try {
                            if (e === 0) {
                                me.doSave();
                            }
                            else if (e === 1) {
                                me.setSelectedItem(selectedItem, true);
                                me.setFocus('');
                            }
                        }
                        catch (ex) {

                        }
                        finally { }
                    });
                }
                else {
                    this.setSelectedItem(selectedItem, true);
                    me.setFocus('');
                }
            }
        }
        else {
            if (this.isValueChanged()) {
                this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                    try {
                        if (e == 0) {
                            me.doSave();
                        }
                        else if (e === 1) {
                            me.newMode();
                        }
                    }
                    catch (ex) {

                    }
                    finally { }
                });
            } else {
                me.newMode();
            }
        }
    }
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem);
    }
    loadSelectedData(selectedItem) {
        const me = this;
        const model = this.Data;
        const dataModel = this.Data.Input;
        const dataInfo = {};
        dataInfo.loc_srl = selectedItem.loc_srl;
        dataInfo.data_srl = selectedItem.data_srl;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM090GetSelectAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    if (r.Items) {
                        const loct = r.Items[0];
                        model.Image_Upload = loct.img_nam;
                        model.imageCopy = loct.img_nam;
                        // model.Image_Url = r.img_url;
                        model.Image_SNO = loct.img_srl;

                        dataModel.Locat_SNO = loct.loc_srl
                        dataModel.Locat_nam = loct.loc_nam || "";
                        dataModel.Data_SNO = loct.data_srl || "";
                        dataModel.Sort_order = loct.sort_ordr || "";
                        dataModel.Status = loct.act_inact_ind;
                        dataModel.Modifiedon = loct.mod_dttm;
                        dataModel.Modifiedby = loct.mod_by_usr_cd;
                        dataModel.IsEdit = true;
                    }
                    if (r.Lang_types) {
                        let data = JSON.parse(r.Lang_types);
                        if (data && data.length > 0) {
                            data.forEach(element => (
                                model.LangTypes = model.LangTypes.map(e => ({ ...e, value: element[e.text] || "" }))
                            ));

                        }
                        model.LangTypesCopy = JSON.stringify(model.LangTypes);
                    }
                    me.setTitle();
                    let dataCopyEx = me.getData();
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                    me.updateUI();
                }
                else {
                    model.Image_Upload = null;
                    // model.Image_Url = null;
                    model.Image_SNO = "";
                    dataModel.Locat_SNO = "";
                    dataModel.Locat_nam = "";
                    dataModel.Data_SNO = "";
                    dataModel.Sort_order = "";
                    dataModel.Status = true;
                    dataModel.Modifiedon = null;
                    dataModel.Modifiedby = "";
                    dataModel.IsEdit = false;
                    model.LangTypes = model.LangTypes.map(e => ({ ...e, value: "" }));
                }
            }
            catch (ex) {
                console.log(ex)
            }
            finally {
                this.updateUI();
            }
        });
    }
    isvalidSave(e) {
        const me = this;
        const dataModel = this.Data.Input;
        const model = this.Data;
        let result = true;
        if (Utils.isNullOrEmpty(dataModel.Locat_nam)) {
            this.showAlert('Please enter Location Name', () => this.setFocus('Locat_nam'));
            result = false;
            return false;

        }
        if (Utils.isNullOrEmpty(model.Image_Upload)) {
            this.showAlert('Please select Pickup Image', () => this.setFocus('Image_Upload'));
            result = false;
            return false;
        }
        if (model.LangTypes && model.LangTypes.length > 0) {
            model.LangTypes.forEach(element => {
                if (element.text && element.text === "en_GB" && Utils.isNullOrEmpty(element.value)) {
                    me.showAlert("en_GB is mandatory", "");
                    result = false;
                }
            })

        }
        return result;
    }
    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            if (model.Input.IsEdit) {
                me.showAlert("No changes has been made.", () => this.setFocus('Locat_nam'));
            }
            else {
                me.showAlert("Please Enter required fields.", () => this.setFocus('Locat_nam'));
            }
        }
    }
    doSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isvalidSave()) {
            const dataInfo = this.getData();
            if (this.isImageChanged()) {
                dataInfo.ImageChanged = "YES";
            }
            else {
                dataInfo.ImageChanged = "NO";
            }
            if (this.isLangChanged()) {
                dataInfo.LangChanged = "YES";
            }
            else {
                dataInfo.LangChanged = "NO";
            }
            if (!Utils.isNullOrEmpty(model.Image_SNO)) {
                dataInfo.OldImg = "YES";
            }
            else {
                dataInfo.OldImg = "NO";
            }
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = model.Input.IsEdit ? "UPDATE" : "INSERT";
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM090SaveDataAsync`, data: dataInfo, files: model.Image_Array || [] }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        model.IsSaved = true;
                        me.handleSaveFollowup(e);
                    }
                    else {
                        me.showAlert('Something went wrong');
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
        this.loadPage(pageNo);
        me.showAlert('Data saved successfully', () => me.newMode());
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
    doClose() {
        const model = this.Data;
        this.handleValueChange(() => this.close());
    }
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit) {
            model.Title = `${this.props.data.Title} / Edit / ${model.Input.Locat_nam}`;
        }
        else {
            model.Title = `${this.props.data.Title} / New `;
        }
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    showAlert(errorMsg, callback) {
        if (typeof errorMsg === 'number')
            errorMsg = Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,
            messageboxType: WKLMessageboxTypes.question,
            onClose: callback
        };
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
    openWindow(type) {
        const model = this.Data;
        const dataModel = this.Data.Input;
        const me = this;
        let Prod_Name = dataModel.Locat_nam;
        let IsEdit = '';
        let Url = '';

        if (type == "btn_Add_PickupImg") {
            Url = 'SSM/SSM009';
            IsEdit = true;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Grp_Name, IsEdit: IsEdit, Prod_ID: '', Supp_ID: "", Prod_Name: Prod_Name, Imag_Dir: model.ImageDirectory }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e) {
                        model.Image_SNO = e.img_srl;
                        model.Image_Upload = e.img_nam;
                        //model.Image_Url = e.img_url;
                        me.updateUI();
                    }
                }
            });
        }
    }
}