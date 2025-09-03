import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM018VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM010';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM018";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.imageCopy = null;
        model.GroupID_Copy = this.props.data.Grp_ID;
        model.Image_Array = null;
        model.ImageNameExists = null;
        model.Image_Url = null;
        model.Image_SNO = null;
        model.Image_Upload = null;
        model.DisableTypeEdit = false;
        model.ImageDirectory = '';
        model.GroupID = this.props.data.Grp_ID;
        model.Input = {
            BannerSrl: "",
            Upload_Type: false,
            Upload_manually: true,
            ImagePlaySeconds: "",
            Sort_order: "",
            Status: true,
            Modifiedon: null,
            Modifiedby: "",
            IsEdit: false,
            Image_SNO: "",
        };
        model.SearchInput = {
            BannerSrch: "",
            StatusSrch: true,
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            { text: 'Banner', field: 'img_nam', width: '50%', sort: { enabled: true } },
            { text: 'Sort', field: 'sort_ordr', width: '30%' },
            { text: 'Status', field: 'act_inact_ind', width: '20%' },
        ];

        this.newMode();
    }
    newMode() {
        console.log("Props", this.props)
        const model = this.Data;
        const dataModel = this.Data.Input;
        model.DisableTypeEdit = false;
        model.Image_Array = null;
        model.Image_Upload = "";
        model.Image_SNO = null;
        dataModel.BannerSrl = "";
        dataModel.Upload_Type = false;
        dataModel.Upload_manually = true;
        dataModel.ImagePlaySeconds = "";
        dataModel.Sort_order = "";
        dataModel.Status = true;
        dataModel.Modifiedon = null;
        dataModel.Modifiedby = "";
        dataModel.IsEdit = false;

        this.setFocus('Image_Upload');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }
    getData() {
        const model = this.Data;
        const dataModel = this.Data.Input;
        const dataInfo = {};
        dataInfo.img_nam = model.Image_Upload || "";
        dataInfo.pos_grp_id = model.GroupID;
        dataInfo.img_srl = model.Image_SNO;
        dataInfo.img_dir = model.ImageDirectory;
        dataInfo.sort_ordr = dataModel.Sort_order;
        dataInfo.is_video = dataModel.Upload_Type;
        dataInfo.mnl_upld = dataModel.Upload_manually;
        dataInfo.act_inact_ind = dataModel.Status;
        dataInfo.bnr_srl = dataModel.BannerSrl;
        if (!dataModel.Upload_Type) {
            dataInfo.img_play_second = dataModel.ImagePlaySeconds;
        }
        else {
            dataInfo.img_play_second = '';
        }

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
        console.log("DataCopy : ", this.Data.DataCopy);
        console.log("dataCopyEx : ", JSON.stringify(dataCopyEx));
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    onLoad(pageIndex) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.pos_grp_id = model.GroupID;
        dataInfo.img_nam = model.SearchInput.BannerSrch;
        dataInfo.img_dir = model.ImageDirectory;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrch === true ? 1 : 0;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM018GetOnloadAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    console.log('Onload r Items', r);
                    if (r.Items) {
                        me.fillSearchResult(r || {}, selectedItem);
                    }
                    model.ImageDirectory = r.img_dir;
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
        dataInfo.pos_grp_id = model.GroupID;
        dataInfo.img_nam = model.SearchInput.BannerSrch;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrch === true ? 1 : 0;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "img_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM018GetSearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r) {
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
            model.SearchInput.BannerSrch = '';
            model.SearchInput.StatusSrch = true;
            this.setFocus('BannerSrch');
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
            Utils.ajax({ url: `${this._WebApi}/SSM018BlurAsync`, data: dataInfo, files: [] }, (r) => {
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
            if (selectedItem.bnr_srl === dataModel.BannerSrl) {
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
        dataInfo.bnr_srl = selectedItem.bnr_srl;
        dataInfo.pos_grp_id = selectedItem.pos_grp_id;
        me.Data.Loading = true;
        Utils.ajax({ url: `${this._WebApi}/SSM018GetSelectDataAsync`, data: dataInfo }, (r) => {
            try {
                if (r) {
                    me.Data.Loading = false;
                    console.log('Items : ', r);

                    model.Image_Upload = r.img_nam;
                    model.imageCopy = r.img_nam;
                    model.Image_Url = r.img_url;
                    model.Image_SNO = r.img_srl;
                    dataModel.BannerSrl = r.bnr_srl;
                    dataModel.Upload_Type = r.is_video;
                    dataModel.Upload_manually = r.mnl_upld;
                    dataModel.ImagePlaySeconds = r.img_play_second || "";
                    dataModel.Sort_order = r.sort_ordr || "";
                    dataModel.Status = r.act_inact_ind;
                    dataModel.Modifiedon = r.mod_dttm;
                    dataModel.Modifiedby = r.mod_by_usr_cd;
                    dataModel.IsEdit = true;
                    model.DisableTypeEdit = true;

                    me.setTitle();
                    let dataCopyEx = me.getData();
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                    me.updateUI();
                }
                else {
                    model.Image_Upload = null;
                    model.Image_Url = null;
                    dataModel.BannerSrl = "";
                    model.Image_SNO = null;
                    dataModel.Upload_Type = false;
                    dataModel.Upload_manually = true;
                    dataModel.ImagePlaySeconds = "";
                    dataModel.Sort_order = "";
                    dataModel.Status = true;
                    dataModel.Modifiedon = null;
                    dataModel.Modifiedby = "";
                    dataModel.IsEdit = true;
                }
            }
            catch (ex) {
                console.log(ex)
            }
            finally {
                this.updateUI();
            }
        });
        this.updateUI();
    }
    isvalidSave(e) {
        const dataModel = this.Data.Input;
        const model = this.Data;
        if (!dataModel.Upload_Type) {
            if (Utils.isNullOrEmpty(dataModel.ImagePlaySeconds)) {
                this.showAlert('Please enter Image Play time In seconds', () => this.setFocus('ImagePlaySeconds'));
                return false;
            }
        }
        if (Utils.isNullOrEmpty(model.Image_Upload)) {
            this.showAlert('Please select Banner', () => this.setFocus('Image_Upload'));
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
                me.showAlert("No changes has been made.", () => this.setFocus('Image_Upload'));
            }
            else {
                me.showAlert("Please Enter required fields.", () => this.setFocus('Image_Upload'));
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
            Utils.ajax({ url: `${this._WebApi}/SSM018SaveData`, data: dataInfo, files: model.Image_Array || [] }, r => {
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
            model.Title = `${this.props.data.Grp_Name} / Banner Config / Edit / ${model.Image_Upload}`;
        }
        else {
            model.Title = `${this.props.data.Grp_Name} / Banner Config / New `;
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
        let Prod_ID = this.props.data.Prod_ID;
        let Prod_Name = this.props.data.Grp_Name;
        let IsEdit = '';
        let Url = '';

        if (type == "btn_Addimage_banner") {
            Url = 'SSM/SSM009';
            IsEdit = true;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Grp_Name, IsEdit: IsEdit, Prod_ID: Prod_ID, Supp_ID: model.SuppMapID, Prod_Name: Prod_Name, Imag_Dir: model.ImageDirectory }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e) {
                        model.Image_SNO = e.img_srl;
                        model.Image_Upload = e.img_nam;
                        model.Image_Url = e.img_url;
                        dataModel.Upload_Type = e.is_video;
                        dataModel.Upload_manually = e.mnl_upld;
                        model.DisableTypeEdit = true;
                        me.updateUI();
                    }
                }
            });
        }
    }
}