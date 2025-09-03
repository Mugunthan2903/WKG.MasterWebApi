import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from '../../../wkl-components';

export default class SSM014VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM012';
    }
    //initializing model object
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM014";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.pos_grp_id = this.props.data.Grp_ID;
        model.country_Cd = this.props.data.country_Cd;
        model.Input = {
            poplr_srl: "",
            loc_srch_F: "",
            loc_shrt_name_F: "",
            loc_lat_F: "",
            loc_lng_F: "",
            post_cd_F: "",
            sort_ordr_F: "",
            Modifiedby: "",
            Modifiedon: "",
        };
        model.IsEdit = false;
        model.SearchInput = {
            loc_des_S: "",
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            { text: 'Location', field: 'loc_desc', width: '60%' },
            { text: 'Post Code', field: 'loc_post_cd', width: '20%' },
            { text: 'Sort', field: 'sort_ordr', width: '20%' },
        ];

        this.newMode();
    }
    //called when new entry is needed , empty's form field
    newMode() {
        const model = this.Data;
        model.IsEdit = false;
        model.Input = {
            loc_srch_F: "",
            loc_shrt_name_F: "",
            poplr_srl: "",
            loc_lat_F: "",
            loc_lng_F: "",
            post_cd_F: "",
            sort_ordr_F: "",
            Modifiedby: "",
            Modifiedon: "",
        };
        this.setTitle();
        this.setFocus("loc_srch_F");
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
    //called when page on load
    loadInitData() {
        this.adjustPageSize();
        this.loadPage(1);
    }
    //clearing search fields
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        if (clearAll === true) {
            model.SearchInput.loc_des_S = '';
            this.setFocus('loc_des_S');
            this.setTitle();
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        gridInfo.TotalCount = 0;
        this.updateUI();
    }
    //handles search button
    handleSearch(pageIndex) {
        this.loadPage(pageIndex);
    }
    loadPage(pageIndex) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.loc_desc = model.SearchInput.loc_des_S;
        dataInfo.pos_grp_id = model.pos_grp_id;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM014SearchDataAsync`, data: dataInfo, files: [] }, (r) => {
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
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items || [];
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
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data;
        if (selectedItem) {
            if (selectedItem.poplr_srl === model.Input.poplr_srl) {
                me.setFocus('loc_srch_F');
                return;
            }
            else {
                if (this.isValueChanged()) {
                    let options = [{ text: 'Yes' }, { text: 'No' }];
                    this.showMessageBox({
                        text: "Unsaved changes exists. Save and proceed",
                        buttons: options,
                        messageboxType: WKLMessageboxTypes.info,
                        onClose: (_e) => {
                            if (_e === 0) {
                                me.handleSave();
                            } else if (_e === 1) {
                                me.setSelectedItem(selectedItem, true);
                                me.setFocus('loc_srch_F');
                            }
                        }
                    });
                }
                else {
                    this.setSelectedItem(selectedItem, true);
                    me.setFocus('loc_srch_F');
                }
            }
        }
        else {
            if (this.isValueChanged()) {
                let options = [{ text: 'Yes' }, { text: 'No' }];
                this.showMessageBox({
                    text: "Unsaved changes exists. Save and proceed",
                    buttons: options,
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        if (_e === 0) {
                            me.Data.Input.IsEdit = true;
                            me.handleSave();
                            this.setFocus('loc_srch_F');
                        } else if (_e === 1) {
                            me.newMode();
                            this.setFocus('loc_srch_F');
                        }
                    }
                });
            } else {
                me.newMode();
            }
        }
    }
    //setting selected item when clicking on grid
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.poplr_srl);
    }
    //called when grid row double click
    loadSelectedData(poplr_srl) {
        const me = this;
        const model = this.Data.Input;
        me.Data.Loading = true;
        Utils.ajax({ url: `${this._WebApi}/SSM014LoadDataAsync`, data: { poplr_srl } }, (r) => {
            if (r) {
                model.poplr_srl = r.poplr_srl;
                model.loc_srch_F = r.loc_desc;
                model.loc_shrt_name_F = Utils.isNullOrEmpty(r.loc_shrt_nam) ? r.loc_desc.substring(0, 50) : r.loc_shrt_nam;
                model.loc_lat_F = r.loc_lat;
                model.loc_lng_F = r.loc_lon;
                model.post_cd_F = r.loc_post_cd;
                model.sort_ordr_F = r.sort_ordr || "";
                model.Modifiedby = r.mod_by_usr_cd;
                model.Modifiedon = r.mod_dttm;
                me.Data.IsEdit = true;
                me.Data.Loading = false;
                me.setTitle();
                let dataCopyEx = me.getData();
                me.Data.DataCopy = JSON.stringify(dataCopyEx);
                me.updateUI();
            }
        });
        this.updateUI();
    }
    // handles save functionality
    handleSave(e) {
        const model = this.Data.Input;
        const me = this;
        if (this.isRequiredFieldsEmpty()) {
            return;
        }
        if (!this.isValueChanged()) {
            const opts = {
                text: "No Changes has been made",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => { }
            };
            this.showMessageBox(opts);
            return;
        }
        const dataInfo = {
            poplr_srl: model.poplr_srl,
            pos_grp_id: me.Data.pos_grp_id,
            loc_desc: model.loc_srch_F,
            loc_shrt_nam: model.loc_shrt_name_F,
            loc_lat: model.loc_lat_F,
            loc_lon: model.loc_lng_F,
            loc_post_cd: model.post_cd_F,
            sort_ordr: model.sort_ordr_F,
            mode: me.Data.IsEdit ? 'UPDATE' : 'INSERT',
            mod_by_usr_cd: ApiManager.getUser().ID,
        }
        this.Data.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM014SaveDataAsync`, data: dataInfo }, (r) => {
            if (r.IsSuccess) {
                this.Data.Loading = false;
                const opts = {
                    text: "Data Saved Successfully",
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.loadPage(me.Data.GridInfo.Page);
                        me.newMode();
                    }
                };
                this.showMessageBox(opts);

            } else {
                this.Data.Loading = false;
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
    handleDelete() {
        const model = this.Data.Input;
        const me = this;
        this.showConfirmation("Are you sure you want to delete this record?", false, (e) => {
            if (e === 0) {
                const dataInfo = {
                    poplr_srl: model.poplr_srl,
                    pos_grp_id: me.Data.pos_grp_id,
                }
                me.Data.Loading = true;
                Utils.ajax({ url: `${this._WebApi}/SSM014DeleteDataAsync`, data: dataInfo }, (r) => {
                    if (r && r.IsSuccess) {
                        me.Data.Loading = false;
                        const opts = {
                            text: "Data Removed Successfully",
                            messageboxType: WKLMessageboxTypes.info,
                            onClose: (_e) => {
                                me.Data.GridInfo.SelectedItem = null;
                                me.loadPage(me.Data.GridInfo.Page);
                                me.newMode();
                            }
                        };
                        me.showMessageBox(opts);

                    } else {
                        me.Data.Loading = false;
                        const opts = {
                            text: "Something went Wrong",
                            messageboxType: WKLMessageboxTypes.info,
                            onClose: (_e) => {
                            }
                        };
                        me.showMessageBox(opts);
                    }
                });
            }
        });
    }
    // function that checks if the form data is changed
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    isRequiredFieldsEmpty() {
        const model = this.Data.Input;
        const me = this;
        if (model.loc_srch_F === "" && model.loc_lat_F === "" && model.loc_lng_F === "" && model.post_cd_F === "") {
            const opts = {
                text: "Please enter required fields",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    me.setFocus("loc_srch_F");
                }
            };
            this.showMessageBox(opts);
            return true;
        } else if (model.loc_srch_F === "") {
            const opts = {
                text: "Please select Location",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    me.setFocus("loc_srch_F");
                }
            };
            this.showMessageBox(opts);
            return true;
        } else if (model.loc_lat_F === "") {
            const opts = {
                text: "Please enter Latitude",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    me.setFocus("loc_lat_F");
                }
            };
            this.showMessageBox(opts);
            return true;
        } else if (model.loc_lng_F === "") {
            const opts = {
                text: "Please enter Longitude",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    me.setFocus("loc_lng_F");
                }
            };
            this.showMessageBox(opts);
            return true;
        } else if (model.post_cd_F === "") {
            const opts = {
                text: "Please enter Post Code",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    me.setFocus("post_cd_F");
                }
            };
            this.showMessageBox(opts);
            return true;
        } else {
            return false;
        }

    }
    //used to set focus on input controls
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    // used to show confirmation window
    showConfirmation(msg, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];

        this.showMessageBox({
            text: msg,
            buttons: options,
            messageboxType: WKLMessageboxTypes.info,
            onClose: callback
        });
    }
    //collects form data and returns it
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.loc_srch_F = model.loc_srch_F;
        dataInfo.loc_shrt_name_F = model.loc_shrt_name_F;
        dataInfo.loc_lat_F = model.loc_lat_F;
        dataInfo.loc_lng_F = model.loc_lng_F;
        dataInfo.post_cd_F = model.post_cd_F;
        dataInfo.sort_ordr_F = model.sort_ordr_F;
        return dataInfo;
    }
    //used to show toaster window
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
    //show alert messages
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
    // called for setting title
    setTitle() {
        const model = this.Data;
        if (model.IsEdit)
            model.Title = `${this.props.data.Grp_Name} / Popular Destination / Edit / ${model.Input.loc_srch_F}`;
        else
            model.Title = `${this.props.data.Grp_Name} / Popular Destination / New`;
    }
    // handles close 
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
}