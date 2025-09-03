import { Utils, ApiManager, WKLMessageboxTypes, WKLWindowStyles, VMBase } from "../../../wkl-components";

export default class SSM060VM extends VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SSM060';
        this.init();
    }

    init() {
        if (Object.keys(this.Data).length !== 0) { return; }

        const model = this.Data;
        model.FormID = "SSM060";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false;
        model.DataCopy = null;
        model.DataCopyGrid = null;
        model.DataCopyGridarr = null;
        model.SupplierMapID = "";
        model.ImageDirectory = "";
        model.SearchInput = {
            Prod_Name: "",
            StatusSrch: true,
            Adult_Aval_Srch: false,
            Child_Aval_Srch: false,

        };
        model.Input = {
            mod_dttm: "",
            mod_by_usr_cd: "",
            IsEdit: false,
        };

        model.AllSelected = true;
        model.GridInfo = {
            Items: [],
            Page: 1,
            TotalPage: 0,
            TotalCount: 0,
            SelectedItem: null,
            PageSize: 5,
            Columns: [
                { text: '', field: 'Text', width: '5%' },
                { text: 'Name', field: 'lp_prod_nam', width: '35%', sort: { enabled: true } },
                { text: 'Adult Available', field: 'adult_aval', width: '20%' },
                { text: 'Child Available', field: 'child_aval', width: '20%' },
                { text: 'Status', field: 'act_inact_ind', width: '10%' },
                { text: '', field: 'Text', width: '10%' }


            ]
        };

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
    loadInitData(loading) {
        this.adjustPageSize();
        this.loadPage(1, "", loading);
    }

    isGridChanged(e) {
        return JSON.stringify(e) !== this.Data.DataCopyGrid;
    }

    handleSearch(pageNo, columnOptions, loadpage) {
        const me = this;
        if (this.isGridChanged(me.Data.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected })))) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        this.loadPage(pageNo, columnOptions, loadpage);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            this.loadPage(pageNo, columnOptions, loadpage);
        }

    }
    handleSearchClear() {
        const me = this;
        if (this.isGridChanged(me.Data.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected })))) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        this.doSearchClear(true);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            this.doSearchClear(true);
        }

    }

    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        if (clearAll === true) {
            model.SearchInput.Prod_Name = "";
            model.SearchInput.StatusSrch = true;
            model.SearchInput.Adult_Aval_Srch = false;
            this.setFocus("Prod_Name");
        }
        model.AllSelected = false;
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        gridInfo.TotalCount = 0;
        this.Data.DataCopyGrid = JSON.stringify(gridInfo.Items.map(e => ({ IsSelected: e.IsSelected })));
        this.updateUI();
    }

    loadPage(pageIndex, columnOptions = null, loading = true) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {
            PageNo: pageIndex,
            PageSize: gridInfo.PageSize
        }
        dataInfo.lp_prod_nam = model.SearchInput.Prod_Name;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrch === true ? 1 : 0;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "lp_prod_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        if (loading) {
            model.Loading = true;
        }
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM060GetOnloadScrh`, data: dataInfo }, (r) => {
            try {
                if(r){
                    console.log(r);
                    model.SupplierMapID = r.SupplierMapID;
                    model.ImageDirectory = r.ImageDirectory;
                    model.Loading = false;
                    this.fillSearchResult(r || {}, selectedItem);
                }
            } catch (ex) {
                console.error(ex);
            } finally {
                this.updateUI();
            }
        });
    }

    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(data => {
            let newData = { ...data };

            if (data.act_inact_ind === "True") {
                newData.act_inact_ind = "Active"
                newData.IsSelected = true;
                newData.AllSelected = true;
            }
            else {
                newData.act_inact_ind = "Inactive"
                newData.IsSelected = false
            }

            if (data.adult_aval === "True") {
                newData.adult_aval = "Yes"
            } else {
                newData.adult_aval = "No"
            }

            if (data.child_aval === "True") {
                newData.child_aval = "Yes"
            } else {
                newData.child_aval = "No"
            }
            return newData;

        }) || [];
        model.AllSelected = (gridInfo.Items.length === gridInfo.Items.count(i => i.IsSelected) && gridInfo.Items.length !== 0);
        gridInfo.Page = r.CurrentPage || 0;
        gridInfo.TotalPage = r.TotalPages || 0;
        gridInfo.TotalCount = r.TotalCount || 0;
        if (gridInfo.Items.length > 0) {
            if (selectedItem !== undefined && selectedItem !== null) {
                selectedItem = gridInfo.Items.find(i => i.ID === selectedItem.ID);
            }
            if (selectedItem === null) selectedItem = gridInfo.Items[0];
        }
        if (selectedItem != null) selectedItem.isSelected = true;
        gridInfo.SelectedItem = selectedItem;
        this.Data.DataCopyGrid = JSON.stringify(gridInfo.Items.map(e => ({ IsSelected: e.IsSelected })));
        this.Data.DataCopyGridarr = gridInfo.Items.map(e => ({ IsSelected: e.IsSelected }));
    }

    setSelectedItem(selectedItem) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
    }

    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected })))) {
            this.doSave(e);
        }
        else {
            me.showAlert("No changes has been made");
        }
    }

    doSave(e) {
        const me = this;
        const model = this.Data;
        var Selectedrow = model.GridInfo.Items;
        const temp = Selectedrow.filter((e, i) => e.IsSelected !== model.DataCopyGridarr[i].IsSelected)
        const dataInfo = {};
        dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
        dataInfo.supp_map_id = model.SupplierMapID;
        dataInfo.Selectedrow = temp;
        model.Loading = true;
        me.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM060SaveExcDataAsync`, data: dataInfo }, r => {
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
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        me.showAlert('Data saved successfully');

        this.loadPage(pageNo, '', true);
    }

    handleValueChange(followUpAction) {
        const model = this.Data;
        const me = this;
        if (this.isGridChanged(me.Data.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected })))) {
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
        this.handleValueChange(() => this.close());
    }

    setTitle() {
        const model = this.Data;
        model.Title = model.Input.IsEdit ? `London Pass Product / Edit / ${model.Input.SSM060_Mpid.Text}` : `London Pass Product`;
    }

    setFocus(Txtbxname) {
        if (this.ComponentRef);
        this.ComponentRef.setFocus(Txtbxname);
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

    openWindow(Type, pid, pname) {
        const me = this;
        if (this.isGridChanged(me.Data.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected })))) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        this.openShowWindow(Type, pid, pname);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            this.openShowWindow(Type, pid, pname);
        }

    }
    openShowWindow(Type, pid, pname) {
        const me = this;
        const model = this.Data;
        if (Type === "Exception") {
            this.showWindow({
                url: 'SSM/SSM062', data: { InputData: { pid, pname,SuppMapID:model.SupplierMapID } }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                }
            });
        } else if (Type === "Edit_grid") {
            this.showWindow({
                url: 'SSM/SSM061', data: { Prod_ID: pid, Prod_Name: pname,SuppMapID:model.SupplierMapID }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    this.loadInitData(false);
                }
            });
        }
        else if (Type === "Info") {
            this.showWindow({
                url: 'SSM/SSM064', data: { Prod_ID: pid, Prod_Name: pname, SuppMapID:model.SupplierMapID, ImageDirectory:model.ImageDirectory }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                }
            });
        }

    }

}

