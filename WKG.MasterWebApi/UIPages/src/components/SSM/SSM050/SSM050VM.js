import { Utils, ApiManager, WKLMessageboxTypes, WKLWindowStyles, VMBase } from "../../../wkl-components";

export default class SSM050VM extends VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SSM050';
        this.init();
    }


    init() {

        if (Object.keys(this.Data).length !== 0) {
            return
        };
        const model = this.Data;
        model.FormID = "SSM050";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false;
        model.DataCopy = null;
        model.DataCopyGrid = null;
        model.DataCopyGridarr = null;
        model.BigbusSuppID = "";
        model.BigbusImgdir = "";
        model.SearchInput = {
            Prod_Name: "",
            Status_Srch: true,
            Prd_Aval_Srch: false,

        };
        model.Input = {
            mod_dttm: "",
            mod_by_usr_cd: "",
            IsEdit: false

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
                { text: '', field: 'Text', width: '4%' },
                { text: 'Name', field: 'bg_prod_nam', width: '50%', sort: { enabled: true } },
                { text: 'Status', field: 'act_inact_ind', width: '23%' },
                { text: 'Product Delisted', field: 'bg_prod_aval', width: '13%' },
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
        this.IniloadPage(1, "", loading);
    }

    IniloadPage(pageIndex, columnOptions = null, loading = true) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {
            PageNo: pageIndex,
            PageSize: gridInfo.PageSize
        }
        dataInfo.lang_cd = "en-GB";
        dataInfo.bg_prod_nam = model.SearchInput.Prod_Name;
        dataInfo.act_inact_ind = model.SearchInput.Status_Srch === true ? 1 : 0;
        dataInfo.bg_prod_aval = !model.SearchInput.Prd_Aval_Srch;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "bg_prod_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        if (loading) {
            model.Loading = true;
        }
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM050GetOnloadScrh`, data: dataInfo }, (r) => {
            try {
                if(r){
                    model.Loading = false;
                    model.BigbusSuppID = r.BigbusSuppID;
                    model.BigbusImgdir = r.ImageDirectory;
                    this.fillSearchResult(r || {}, selectedItem);
                }
            } catch (ex) {
                console.error(ex);
            } finally {
                me.updateUI();
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
            if (data.bg_prod_aval === "True") {
                newData.bg_prod_aval = "No"
            } else {
                newData.bg_prod_aval = "Yes"
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

    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
    }

    handleSearch(PageNo, columnOptions, loading) {
        const me = this;
        const model = this.Data;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected })))) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        this.IniloadPage(PageNo, columnOptions, loading);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            this.IniloadPage(PageNo, columnOptions, loading);
        }


    }

    handleSearchClear() {
        const me = this;
        const model = this.Data;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected })))) {
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
            model.SearchInput.Status_Srch = true;
            model.SearchInput.Prd_Aval_Srch = false;
            this.setFocus("Prod_Name");
        }
        gridInfo.Items = [];
        this.Data.DataCopyGrid = JSON.stringify(gridInfo.Items.map(e => ({ IsSelected: e.IsSelected })));
        gridInfo.SelectedItem = null;
        model.AllSelected = false;
        this.updateUI();
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
        const dataInfo = {};
        dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
        dataInfo.supp_map_id = model.BigbusSuppID;
        dataInfo.Selectedrow = Selectedrow.filter((e, i) => e.IsSelected !== model.DataCopyGridarr[i].IsSelected);
        model.Loading = true;
        me.updateUI();
        console.log('dataInfo', dataInfo);
        Utils.ajax({ url: `${this._WebApi}/SSM050_SaveAsyncMinex`, data: dataInfo }, r => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess === true) {
                    model.IsSaved = true;
                    me.handleSaveFollowup(e);
                }
                else {
                    if (r.ErrorNo === -3) {//Overlapping
                        me.handleModified(dataInfo, e);
                    }
                    else {
                        me.showAlert('Something went wrong (1)');
                    }
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

        this.IniloadPage(pageNo, "", true);
    }
    isGridChanged(e) {
        return JSON.stringify(e) !== this.Data.DataCopyGrid;
    }
    handleValueChange(followUpAction) {
        const model = this.Data;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected })))) {
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
        this.handleValueChange(() => this.close());
    }

    setTitle() {
        const model = this.Data;
        model.Title = model.Input.IsEdit ? `Big Bus Product / Edit ` : `Big Bus Product`;
    }

    setFocus(Txtbxname) {
        if (this.ComponentRef);
        this.ComponentRef.setFocus(Txtbxname);
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
    openWindow(Sload, pid, pname) {
        const model = this.Data;
        const me = this;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected })))) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        this.openNewWindow(Sload, pid, pname);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            this.openNewWindow(Sload, pid, pname);
        }


    }
    openNewWindow(Sload, pid, pname) {
        const model = this.Data;
        const me = this;
        if (Sload == "Edit_grid") {
            this.showWindow({
                url: 'SSM/SSM051', data: { Prod_ID: pid, Prod_Name: pname,SuppMapID:model.BigbusSuppID,ImageDirectory:model.BigbusImgdir}, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    me.loadInitData(false);
                }
            });
        }

        else if (Sload == "Exception") {
            this.showWindow({
                url: 'SSM/SSM052', data: { InputData: { pid, pname,SuppMapID:model.BigbusSuppID } }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

                }
            });
        }


    }


}

