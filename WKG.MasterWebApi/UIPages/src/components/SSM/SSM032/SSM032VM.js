import * as cntrl from "../../../wkl-components";

export default class SSM032VM extends cntrl.VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM030';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SSM032";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            Delivery_name_F: "",
            Short_name_F: "",
            Delivery_id_F: "",
            IsActiveF: true,
            WKG_mrkup_F: "",
            delvry_price_F: "",
            Modifiedon: "",
            Modifiedby: "",
            IsEdit: false,
        };
        model.SearchInput = {
            Delivery_name_S: "",
            IsActiveS: true,
            delisted_S: false,
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            // { text: 'selectall', field: 'selectall', width: '6%' },
            { text: 'Name', field: 'dlvry_typ_nam', width: '50%', sort: { enabled: true } },
            { text: 'Delisted', field: 'dlvry_typ_aval', width: '30%' },
            { text: 'Status', field: 'act_inact_ind', width: '20%' },
        ];

        this.newMode();
    }
    newMode() {
        const model = this.Data.Input;
        model.ID = 0;
        model.Delivery_name_F = "";
        model.Short_name_F = "";
        model.Delivery_id_F = "";
        model.IsActiveF = true;
        model.WKG_mrkup_F = "";
        model.delvry_price_F = "";
        model.Modifiedon = "";
        model.Modifiedby = "";
        model.IsEdit = false;
        model.WKG_mrkup_avail_F = "";
        model.LTD_avail_F = "";
        model.Modifiedon = "";
        model.IsEdit = false;
        // this.setFocus('Delivery_name_S');
        this.setTitle();
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
        this.loadPage(1);
    }
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data.Input;
        if (selectedItem) {
            if (selectedItem.dlvry_typ_nam === model.Delivery_name_F) {
                return;
            }
            else {
                if (this.isValueChanged() && model.IsEdit) {
                    let options = [{ text: 'Yes' }, { text: 'No' }];
                    this.showMessageBox({
                        text: "Unsaved changes exists. Save and proceed",
                        buttons: options,
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => {
                            if (_e === 0) {
                                me.handleSave();
                            } else if (_e === 1) {
                                me.setSelectedItem(selectedItem, true);
                                me.setFocus('Short_name_F');
                            }
                        }
                    });
                }
                else {
                    this.setSelectedItem(selectedItem, true);
                }
            }
        }
        else {
            if (this.isValueChanged() && model.IsEdit) {
                let options = [{ text: 'Yes' }, { text: 'No' }];
                this.showMessageBox({
                    text: "Unsaved changes exists. Save and proceed",
                    buttons: options,
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        if (_e === 0) {
                            me.Data.Input.IsEdit = true;
                            me.handleSave();
                            me.setFocus('Delivery_name_S');
                        } else if (_e === 1) {
                            me.newMode();
                            me.setFocus('Delivery_name_S');
                        }
                    }
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
            this.loadSelectedData(selectedItem.dlvry_typ_id);
    }
    loadSelectedData(dlvry_typ_id) {
        const me = this;
        const model = this.Data;
        const dataModel = this.Data.Input;
        me.Data.Loading = true;
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM032LoadSelectedDataAsync`, data: { dlvry_typ_id } }, (r) => {
            dataModel.Delivery_id_F = r.dlvry_typ_id;
            dataModel.Delivery_name_F = r.dlvry_typ_nam;
            dataModel.Short_name_F = r.dlvry_shrt_nam || dataModel.Delivery_name_F;
            dataModel.IsActiveF = r.act_inact_ind;
            dataModel.delvry_price_F = r.dlvry_price || "";
            dataModel.WKG_mrkup_F = r.dlvry_wkg_markup || "";
            dataModel.Modifiedon = r.mod_dttm;
            dataModel.Modifiedby = r.mod_by_usr_cd;
            dataModel.IsEdit = true;
            model.Loading = false;
            me.setTitle();
            let dataCopyEx = me.getData();
            model.DataCopy = JSON.stringify(dataCopyEx);
            me.setFocus('Short_name_F');
            me.updateUI();
        });
        this.updateUI();
    }
    handleSearch(pageIndex) {
        this.loadPage(pageIndex);
    }
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;

        if (clearAll === true) {
            model.SearchInput.Delivery_name_S = "";
            model.SearchInput.IsActiveS = true;
            model.SearchInput.delisted_S = false;
            this.setFocus('Delivery_name_S');
            this.setTitle();
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
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
        dataInfo.dlvry_typ_nam = model.SearchInput.Delivery_name_S;
        dataInfo.act_inact_ind = model.SearchInput.IsActiveS;
        dataInfo.dlvry_typ_aval = !model.SearchInput.delisted_S;
        dataInfo.sortType = true;
        // dataInfo.ssmAsc = model.SearchInput.prevSort;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "dlvry_typ_nam" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.sortType = itm.sort === 'asc';
                    // model.SearchInput.prevSort = dataInfo.ssmAsc;
                }
            }
        }
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM032SearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                me.fillSearchResult(r || {}, selectedItem);
            }
            catch (ex) { }
            finally {
                // me.setFocus("Delivery_name_S");
                me.updateUI();
            }
        });
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(e => {
            if (e.act_inact_ind) {
                if (e.dlvry_typ_aval) {
                    return { ...e, act_inact_ind: "Active", dlvry_typ_aval: "No" }
                } else {
                    return { ...e, act_inact_ind: "Active", dlvry_typ_aval: "Yes" }
                }
            } else {
                if (e.dlvry_typ_aval) {
                    return { ...e, act_inact_ind: "Inactive", dlvry_typ_aval: "No" }
                } else {
                    return { ...e, act_inact_ind: "Inactive", dlvry_typ_aval: "Yes" }
                }
            }
        }) || [];
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
    handleSave() {
        const model = this.Data.Input;
        const me = this;
        if (this.isValueChanged()) {
            const dataInfo = {
                dlvry_typ_id: model.Delivery_id_F,
                dlvry_shrt_nam: model.Short_name_F,
                act_inact_ind: model.IsActiveF,
                dlvry_wkg_markup: model.WKG_mrkup_F,
                mod_by_usr_cd: cntrl.ApiManager.getUser().ID,
            }
            me.Data.Loading = true;
            this.updateUI();
            cntrl.Utils.ajax({ url: `${this._WebApi}/SSM032SaveDataAsync`, data: dataInfo }, (r) => {
                me.Data.Loading = true;
                if (r && r.IsSuccess) {
                    const opts = {
                        text: "Data Saved Successfully",
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => {
                            model.evnt_typ_id = "";
                            me.handleSearch(me.Data.GridInfo.Page);
                            me.newMode();
                        }
                    };
                    this.showMessageBox(opts);
                } else {
                    const opts = {
                        text: "Something went Wrong",
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => {
                        }
                    };
                    this.showMessageBox(opts);
                }
                me.updateUI();
            });
        } else {
            const opts = {
                text: "No changes has been made.",
                messageboxType: cntrl.WKLMessageboxTypes.info,
                onClose: (_e) => {
                    me.setFocus("Short_name_F");
                }
            };
            this.showMessageBox(opts);
        }
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        model.Title = `Ltd Product / ${this.props.data.Title} ${model.Input.Delivery_name_F === "" ? "" : `/ Edit / ${model.Input.Delivery_name_F}`}`;
    }
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.Event_name_F = model.Delivery_name_F;
        dataInfo.Short_name_F = model.Short_name_F;
        dataInfo.IsActiveF = model.IsActiveF;
        dataInfo.WKG_mrkup_F = model.WKG_mrkup_F;
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    doClose() {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged() && model.Input.IsEdit) {
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
}