import * as cntrl from "../../../wkl-components";

export default class SSM030VM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SSM030';
        this.init();
    }
    init() {
        if (Object.keys(this.Data).length !== 0)
            return;
        const model = this.Data;
        model.FormID = "SSM030";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.DataCopyGrid = null;
        model.DataCopyGridarr = null;
        model.SupplierMapID = "";
        model.ImageDirectory = "";
        model.Input = {};
        model.SearchInput = {
            prd_name_S: "",
            status_S: true,
            prd_delisted_S: false
        };
        model.columnOptionsCopy = [{ field: 'ltd_evnt_nam', dataType: '', sort: 'asc' }, { field: 'start_dt', dataType: '', sort: 'asc' }, { field: 'end_dt', dataType: '', sort: 'asc' }]
        model.AllSelected = false;
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [
            { text: '', field: 'switch', width: '4%' },
            { text: 'Name', field: 'ltd_evnt_nam', width: '30%', sort: { enabled: true } },
            { text: 'Type', field: 'evnt_typ_nam', width: '10%' },
            { text: 'Start Date', field: 'start_dt', width: '13%', sort: { enabled: true } },
            { text: 'End Date', field: 'end_dt', width: '13%', sort: { enabled: true } },
            { text: 'Status', field: 'act_inact_ind', width: '7%' },
            { text: 'Product Delisted', field: 'ltd_prod_aval', width: '13%' },
            { text: '', field: 'btns', width: '10%' }
        ];
        this.setFocus('SSM_Id_F');
        this.setTitle();
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
    loadInitData(loading = true) {
        this.adjustPageSize();
        this.loadPage(1, '', false, loading)
    }
    handleSearch(PageNo, columnOptions, onload) {
        const me = this;
        if (!this.isGridChanged()) {
            this.loadPage(PageNo, columnOptions, onload);
        } else {
            this.showConfirmation("Unsaved changes exists. Save and proceed", false, (e) => {
                if (e === 0) {
                    me.handleSave();
                } else {
                    this.loadPage(PageNo, columnOptions, onload);
                }
            })
        }
    }
    loadPage(pageIndex, columnOptions = null, onload = true, loading = true) {
        const me = this;
        const model = this.Data;
        let columnOptionstemp = columnOptions;
        if (JSON.stringify(model.columnOptionsCopy) !== JSON.stringify(columnOptions) && columnOptions !== "") {
            columnOptionstemp = columnOptions.filter((e, i) => e.sort !== model.columnOptionsCopy[i].sort);
            model.columnOptionsCopy = columnOptions;
        }
        const gridInfo = this.Data.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.ltd_evnt_nam = model.SearchInput.prd_name_S;
        dataInfo.act_inact_ind = model.SearchInput.status_S;
        dataInfo.ltd_prod_aval = !model.SearchInput.prd_delisted_S;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.PageNo = pageIndex;
        dataInfo.sortType = null;
        dataInfo.stdtsortType = null;
        dataInfo.endtsortType = null;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "ltd_evnt_nam") {
                    dataInfo.sortType = itm.sort ? itm.sort === 'asc' : null;
                } else if (itm.field === "start_dt") {
                    dataInfo.stdtsortType = itm.sort ? itm.sort === 'asc' : null;
                } else if (itm.field === "end_dt") {
                    dataInfo.endtsortType = itm.sort ? itm.sort === 'asc' : null;
                }
            }
        }
        this.updateUI();
        if (this.isGridChanged() && onload) {
            this.showConfirmation('Unsaved changes exists. Save and proceed', false, (e) => {
                if (e === 0) {
                    me.handleSave();
                } else if (e === 1) {
                    me.searchAjax(dataInfo, selectedItem, loading)
                } else {
                    me.updateUI();
                }
            })
        } else {
            me.searchAjax(dataInfo, selectedItem, loading)
        }
    }
    searchAjax(dataInfo, selectedItem, loading) {
        const me = this;
        const model = this.Data;
        if (loading) {
            model.Loading = true;
        }
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM030SearchAsync`, data: dataInfo }, (r) => {
            try {
                if(r){
                    model.Loading = false;
                    model.SupplierMapID = r.SupplierMapID;
                    model.ImageDirectory = r.ImageDirectory;
                    me.fillSearchResult(r || {}, selectedItem);
                }
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
        gridInfo.Items = r.Items.map(e => ({ ...e, act_inact_ind: e.act_inact_ind ? "Active" : "Inactive", ltd_prod_aval: e.ltd_prod_aval ? "No" : "Yes", IsSelected: e.act_inact_ind })) || [];
        model.AllSelected = (gridInfo.Items.length === gridInfo.Items.count(i => i.IsSelected) && gridInfo.Items.length !== 0);
        gridInfo.Page = r.CurrentPage || 0;
        gridInfo.TotalPage = r.TotalPages || 0;
        gridInfo.TotalCount = r.TotalRecords || 0;
        if (gridInfo.Items.length > 0) {
            if (selectedItem !== undefined && selectedItem !== null) {
                selectedItem = gridInfo.Items.first(i => i.ID === selectedItem.ID);
            }
            if (selectedItem === null)
                selectedItem = gridInfo.Items[0];
        }

        if (selectedItem !== null)
            selectedItem.isSelected = true;
        gridInfo.SelectedItem = selectedItem;
        const dataEX = this.getGrid();
        this.Data.DataCopyGridarr = this.getGrid();
        this.Data.DataCopyGrid = JSON.stringify(dataEX);
    }
    setSelectedItem(selectedItem) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
    }
    handleSave() {
        if (this.isGridChanged()) {
            this.doSave();
        } else {
            this.showAlert("No changes has been made")
        }
    }
    doSave() {
        const me = this;
        const model = this.Data;
        const gridItems = model.GridInfo.Items;
        const temp = gridItems.filter((e, i) => e.IsSelected !== model.DataCopyGridarr[i].IsSelected);
        const dataInfo = {};
        dataInfo.gridItems = temp;
        dataInfo.mod_by_usr_cd = cntrl.ApiManager.getUser().ID;
        dataInfo.supp_map_id = model.SupplierMapID;
        model.Loading = true;
        me.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM030SaveDataAsync`, data: dataInfo }, r => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess) {
                    me.showAlert('Data saved successfully');
                    me.loadPage(1, '', false)
                } else {
                    me.showAlert('Something went wrong!');
                }
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }
    openConfigWindow(id, pid, pname) {
        const me = this;
        if (!this.isGridChanged()) {
            this.doOpenConfigWindow(id, pid, pname);
        } else {
            this.showConfirmation("Unsaved changes exists. Save and proceed", false, (e) => {
                if (e === 0) {
                    me.handleSave();
                } else {
                    me.doOpenConfigWindow(id, pid, pname);
                }
            })
        }
    }
    doOpenConfigWindow(id, pid, pname) {
        const me = this;
        const model = this.Data;
        let urlbtn = "";
        let title = "";
        if (id === "btn_evnt_typ") {
            urlbtn = "SSM/SSM031";
            title = "Filter Types";
        } else if (id === "btn_delvry_typ") {
            urlbtn = "SSM/SSM032";
            title = "Delivery";
        } else if (id === "btn_Edit_grid") {
            urlbtn = "SSM/SSM033";
            title = "SSM033";
        } else if (id === "btn_Exp_grid") {
            urlbtn = "SSM/SSM034";
            title = "SSM034";
        }
        this.showWindow({
            url: urlbtn,
            data: { Title: title, Prod_ID: pid, Prod_Name: pname, SuppMapID: model.SupplierMapID, ImageDirectory:model.ImageDirectory},
            windowStyle: cntrl.WKLWindowStyles.slideLeft, onClose: (e) => {
                if (id === "btn_evnt_typ" || id === "btn_Edit_grid") {
                    me.loadInitData(false);
                }
            }
        });
    }
    handleSearchClear() {
        const me = this;
        if (!this.isGridChanged()) {
            this.doSearchClear(true);
        } else {
            this.showConfirmation('Unsaved changes exists. Save and proceed', false, (e) => {
                if (e === 0) {
                    me.handleSave();
                } else {
                    me.doSearchClear(true);
                }
            });
        }
    }

    // Clear search results
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        if (clearAll === true) {
            model.SearchInput.prd_name_S = "";
            model.SearchInput.status_S = true;
            model.SearchInput.prd_delisted_S = false;
            this.setFocus("prd_name_S");
        }
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        gridInfo.TotalCount = 0;
        model.DataCopyGrid = JSON.stringify([]);
        model.DataCopyGridarr = null;
        gridInfo.Items = [];
        model.AllSelected = false;
        gridInfo.SelectedItem = null;
        this.updateUI();
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        model.Title = `Ltd Product`;
    }
    getGrid() {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const dataInfo = gridInfo.Items.map(e => ({ IsSelected: e.IsSelected }));
        return dataInfo;
    }
    isGridChanged() {
        var dataCopyEx = this.getGrid();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopyGrid;
    }
    showAlert(errorMsg, name) {
        if (typeof errorMsg === 'number')
            errorMsg = cntrl.Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,
            messageboxType: cntrl.WKLMessageboxTypes.question
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
            text = cntrl.Utils.getMessage(msgNo)
        }
        else {
            text = msgNo;
        }
        this.showMessageBox({
            text: text,
            buttons: options,
            messageboxType: cntrl.WKLMessageboxTypes.question,
            onClose: callback
        });
    }
    doClose() {
        const me = this;
        if (this.isGridChanged()) {
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