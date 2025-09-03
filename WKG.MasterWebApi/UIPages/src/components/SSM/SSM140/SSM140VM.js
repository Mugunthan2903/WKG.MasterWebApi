import * as cntrl from "../../../wkl-components";
import { Utils, WKLMessageboxTypes } from "../../../wkl-components";

export default class SSM140VM extends cntrl.VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM010';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SSM140";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.SSM_ID = this.props.data.SSM_ID;
        model.Grp_ID = this.props.data.Grp_ID;
        model.ConnectedStn = true;
        model.SSM_Name = this.props.data.SSM_Name;
        model.ImageDirectory = null;
        model.Supp_map_Id = null;
        model.imageCopy = null;
        model.Image_Array = null;
        model.ImageNameExists = null;
        model.DstrbnLocType = null;
        model.Input = {
            Location_SNO: '',
            Distribusion_Dflt_Stn: null,
            SSM_Dflt_Stn: true,
            TimToBusStp: "",
            Sort_Order: "",
            Distribusion_Loc_Img: null,
            Image_SNO: null,
            IsEdit: false,
            mod_dttm: "",
            mod_by_usr_cd: ""
        };
        model.SearchInput = {
            Station_NameSrch: "",
            SSM_Dflt_StnSrch: true,
        };
        model.Group_Name_List = [];
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            { text: 'Departure City/Area/Station Name', field: 'stn_nam', width: '59%', sort: { enabled: true } },
            { text: 'Sort', field: 'sort_ordr', width: '10%' },
            { text: 'Default', field: 'ssm_dflt_stn', width: '11%' },
            { text: 'Image', field: 'img_nam', width: '20%' },
        ];

        this.newMode();
    }
    newMode(flag = true) {
        const model = this.Data;
        model.Input = {
            Location_SNO: '',
            Distribusion_Dflt_Stn: "",
            SSM_Dflt_Stn: true,
            TimToBusStp: "",
            Sort_Order: "",
            Distribusion_Loc_Img: null,
            Image_SNO: null,
            IsEdit: false,
            mod_dttm: "",
            mod_by_usr_cd: ""
        };
        model.imageCopy = null;
        this.setTitle();
        if (flag) {
            this.setFocus('Distribusion_Dflt_Stn');
        }
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
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
        this.onLoad();
    }
    onLoad() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.ssm_id = model.SSM_ID;
        dataInfo.pos_grp_id = model.Grp_ID;
        dataInfo.stn_nam = model.SearchInput.Station_NameSrch || "";
        dataInfo.ssm_dflt_stn = model.SearchInput.SSM_Dflt_StnSrch === true ? 1 : 0;
        dataInfo.PageNo = 1;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.sortType = true;
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM140OnloadSrchAsync`, data: dataInfo }, (r) => {
            model.Loading = false;
            try {
                if (r) {
                    model.ImageDirectory = r.ImageDirectory;
                    model.Supp_map_Id = r.Supp_map_Id;
                    model.ConnectedStn = r.connectedStn;
                    model.DstrbnLocType = r.DstrbnLocType;
                    if (r && r.Items)
                        me.fillSearchResult(r || {}, selectedItem);
                }
            }
            catch (ex) {
                console.log("ERROR in SSM140OnloadSrchAsync", ex)
            }
            finally {
                me.newMode(false);
                me.updateUI();
            }

        });
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(e => ({ ...e, ssm_dflt_stn: e.ssm_dflt_stn ? "Yes" : "No" })) || [];
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
    loadPage(pageIndex, columnOptions = null) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.ssm_id = model.SSM_ID;
        dataInfo.pos_grp_id = model.Grp_ID;
        dataInfo.stn_nam = model.SearchInput.Station_NameSrch || "";
        dataInfo.ssm_dflt_stn = model.SearchInput.SSM_Dflt_StnSrch === true ? 1 : 0;
        dataInfo.supp_map_id = model.Supp_map_Id;
        dataInfo.sortType = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "stn_nam" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.sortType = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM140OnloadSrchAsync`, data: dataInfo }, (r) => {
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
    onBlurSearch() {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.ssm_id = model.SSM_ID;
        dataInfo.stn_cd = model.Input.Distribusion_Dflt_Stn?.ID;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM140StationBlurAsync`, data: dataInfo }, (r) => {
            try {
                if (r && r.Isavailable === true) {
                    me.showConfirmation('Record already exists.Do you want to retrieve?', false, (_e) => {
                        if (_e === 0) {
                            const dataInfo = {
                                loc_srl: r.ImageName,
                                loc_typ: r.loc_typ
                            }
                            me.loadSelectedData(dataInfo);
                        } else {
                            model.Input.Distribusion_Dflt_Stn = null;
                            me.setFocus('Distribusion_Dflt_Stn');
                        }
                    })
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
    onBlurCheck(name) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.img_dir = model.ImageDirectory;
        this.updateUI();
        if (!Utils.isNullOrEmpty(name)) {
            Utils.ajax({ url: `${this._WebApi}/SSM140ImageBlurSrch`, data: dataInfo }, (r) => {
                try {
                    if (r && r.ImageName) {
                        if (!Utils.isNullOrEmpty(r.ImageName)) {
                            model.ImageNameExists = r.ImageName.split(',');
                        }
                        if (!Utils.isNullOrEmpty(model.ImageNameExists) && model.ImageNameExists.length !== 0) {
                            if (model.ImageNameExists.includes(name)) {
                                me.showAlert('Image already exists.');
                                model.Input.Distribusion_Loc_Img = null;
                                model.Image_Array = null;
                            }
                        }
                    }
                }
                catch (ex) {
                    console.error("Error in SSM140 blur search direction image: ", ex);
                }
                finally {
                    me.updateUI();
                }
            });
        }
    }
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        if (clearAll === true) {
            me.setFocus('Station_NameSrch');
            me.setTitle();
            model.SearchInput.Station_NameSrch = "";
            model.SearchInput.SSM_Dflt_StnSrch = true;
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        me.updateUI();
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
        const datamodel = this.Data.Input;
        const dataInfo = {};
        dataInfo.loc_srl = selectedItem.loc_srl;
        dataInfo.loc_typ = selectedItem.loc_typ;
        model.Loading = true;
        me.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM140GetSelectAsync`, data: dataInfo }, (r) => {
            model.Loading = false;
            try {
                if (r) {
                    datamodel.Distribusion_Dflt_Stn = r.Dstrbsn_Dtls || null;
                    datamodel.Location_SNO = r.loc_srl || "";
                    datamodel.TimToBusStp = r.tm_to_stop_mnts || "";
                    datamodel.Sort_Order = r.sort_ordr || "";
                    datamodel.Distribusion_Loc_Img = r.img_nam || null;
                    datamodel.Image_SNO = r.stn_img_srl || '';
                    model.imageCopy = r.img_nam || null;
                    datamodel.IsEdit = true;
                    datamodel.SSM_Dflt_Stn = r.ssm_dflt_stn;
                    datamodel.mod_dttm = r.mod_dttm;
                    datamodel.mod_by_usr_cd = r.mod_by_usr_cd;
                }
            }
            catch (ex) {
                console.log("Error : ", ex);
            }
            finally {
                me.setTitle();
                let dataCopyEx = me.getData();
                model.DataCopy = JSON.stringify(dataCopyEx);
                me.setFocus('Distribusion_Dflt_Stn');
                me.updateUI();
            }
        });
    }
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data.Input;
        if (selectedItem) {
            if (selectedItem.loc_srl === model.Location_SNO) {
                me.setFocus('');
                return;
            }
            else {
                if (this.isValueChanged()) {
                    this.showConfirmation('Unsaved changes exists. Save and proceed', false, (_e) => {
                        if (_e === 0) {
                            me.handleSave();
                        } else if (_e === 1) {
                            me.setSelectedItem(selectedItem, true);
                            me.setFocus('');
                        }
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
                this.showConfirmation('Unsaved changes exists. Save and proceed', false, (_e) => {
                    if (_e === 0) {
                        me.handleSave();
                    } else if (_e === 1) {
                        me.newMode();
                    }
                });
            } else {
                me.newMode();
            }
        }
    }
    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            if (model.Input.IsEdit) {
                me.showAlert("No changes has been made.", () => this.setFocus('Distribusion_Dflt_Stn'));
            }
            else {
                me.showAlert("Please enter required fields", () => this.setFocus('Distribusion_Dflt_Stn'));
            }

        }
    }
    isvalidSave(e) {
        const me = this;
        const model = this.Data.Input;
        if (cntrl.Utils.isNullOrEmpty(model.Distribusion_Dflt_Stn)) {
            this.showAlert('Please select departure city/area/station name', () => this.setFocus('Distribusion_Dflt_Stn'));
            return false;
        }
        return true;
    }
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = cntrl.ApiManager.getUser().ID;
            dataInfo.Mode = model.Input.IsEdit ? "UPDATE" : "INSERT";
            if (this.isImageChanged()) {
                dataInfo.ImageChanged = "YES";
            }
            else {
                dataInfo.ImageChanged = "NO";
            }
            if (!cntrl.Utils.isNullOrEmpty(model.Input.Image_SNO)) {
                dataInfo.OldImg = "YES";
            }
            else {
                dataInfo.OldImg = "NO";
            }
            dataInfo.ssm_id = model.SSM_ID;
            dataInfo.img_dir = model.ImageDirectory;
            dataInfo.supp_map_id = model.Supp_map_Id;
            model.Loading = true;
            me.updateUI();
            cntrl.Utils.ajax({ url: `${this._WebApi}/SSM140DistrbtnSaveAsync`, data: dataInfo, files: model.Image_Array }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        me.handleSaveFollowup(e);
                    }
                    else {
                        me.showAlert('Something went wrong');
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
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        me.showAlert('Data saved successfully', () => me.newMode());
        this.loadPage(pageNo);
        me.updateUI();

    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit) {
            model.Title = `${this.props.data.Grp_Name} / Distribusion Default / ${this.props.data.SSM_Name} / Edit `;
        } else {
            model.Title = `${this.props.data.Grp_Name} / Distribusion Default / ${this.props.data.SSM_Name} / New`;
        }
    };
    showConfirmation(msg, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];

        this.showMessageBox({
            text: msg,
            buttons: options,
            messageboxType: cntrl.WKLMessageboxTypes.info,
            onClose: callback
        });
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
    getData() {
        const model = this.Data.Input;
        const dataInfo = {
            loc_srl: model.Location_SNO,
            ssm_dflt_stn: model.SSM_Dflt_Stn,
            tm_to_stop_mnts: model.TimToBusStp,
            sort_ordr: model.Sort_Order,
            stn_img_srl: model.Image_SNO,
            img_nam: model.Distribusion_Loc_Img
        };
        if (!cntrl.Utils.isNullOrEmpty(model.Distribusion_Dflt_Stn)) {
            dataInfo.stn_cd = model.Distribusion_Dflt_Stn.ID;
            dataInfo.loc_typ = model.Distribusion_Dflt_Stn.type;
        }
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    isImageChanged() {
        const model = this.Data;
        return model.imageCopy !== model.Input.Distribusion_Loc_Img;
    }
    doClose() {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            let options = [{ text: 'Yes' }, { text: 'No' }];
            this.showMessageBox({
                text: "Do you want to Discard the changes?",
                buttons: options,
                messageboxType: cntrl.WKLMessageboxTypes.info,
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
    openWindow(type, InputObj) {
        const me = this;
        const model = this.Data;
        let Url = '';
        if (type === "btn_Addimage_Distrbtn") {
            Url = 'SSM/SSM009';
            this.showWindow({
                url: Url, data: { Title: this.props.data.Grp_Name, Supp_ID: model.Supp_map_Id, Prod_Name: model.SSM_Name, Imag_Dir: model.ImageDirectory }, windowStyle: cntrl.WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e) {
                        model.Input.Image_SNO = e.img_srl;
                        model.Input.Distribusion_Loc_Img = e.img_nam;
                        me.updateUI();
                    }
                }
            });
        }

    }
}

