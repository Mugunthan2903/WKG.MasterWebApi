import { Utils, ApiManager, WKLMessageboxTypes, WKLWindowStyles, VMBase } from "../../../wkl-components";

export default class SSM020VM extends VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SSM020';
        this.init();
    }

    // Initialize the view model
    init() {
        // Check if the Data object is empty before initializing
        if (Object.keys(this.Data).length !== 0) return;

        // Initialize model properties
        const model = this.Data;
        model.FormID = "SSM020";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false;
        model.DataCopy = null;
        model.DataCopyGrid = null;
        model.DataCopyGridarr = null;
        model.SupplierMapID = "";
        model.ImageDirectory = "";
        model.CityList = [];
        model.loadInit = true;
        model.SearchInput = {
            SSM020_Lng: null,
            Pord_Name: "",
            City_srch: null,
            SSM020_StatusSrch: true,
            SSM020_Prd_aval: false,

        };
        model.Input = {
            SSM020_Mpid: null,
            SSM020_prd_endpt: null,
            SSM020_sndx_endpt: null,
            SSM020_pull_dt: '',
            StatusN: null,
            mod_dttm: "",
            mod_by_usr_cd: "",
            IsEdit: false

        };

        model.AllSelected = true;
        model.SSM020_Lnglist = [];
        model.SSM020_prd_endpt_list = [];
        model.SSM020_sndx_endpt_list = [];
        //model.AllSelected = false;
        model.GridInfo = {
            Items: [],
            Page: 1,
            TotalPage: 0,
            TotalCount: 0,
            SelectedItem: null,
            PageSize: 5,
            Columns: [
                { text: '', field: 'Text', width: '5%' },
                { text: 'Name', field: 'tui_prod_nam', width: '35%', sort: { enabled: true } },
                { text: 'City Name', field: 'tui_city_nam', width: '10%', sort: { enabled: true } },
                { text: 'Tui Category', field: 'ctgry_nam', width: '10%' },
                { text: 'WKG Category', field: 'ctgry_typ_nam', width: '10%' },
                { text: 'Status', field: 'act_inact_ind', width: '10%' },
                { text: 'Product Delisted', field: 'tui_prod_aval', width: '10%' },
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
        this.IniloadPage(1, "", false, loading);
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
                        this.IniloadPage(pageNo, columnOptions, loadpage);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            this.IniloadPage(pageNo, columnOptions, loadpage);
        }

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

    IniloadPage(pageIndex, columnOptions = null, onload = false, loading = true) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {
            PageNo: pageIndex,
            PageSize: gridInfo.PageSize
        }
        dataInfo.lang_cd = "en-GB";
        dataInfo.tui_prod_nam = model.SearchInput.Pord_Name;
        dataInfo.tui_city_cd = model.SearchInput.City_srch ? model.SearchInput.City_srch.ID : null;
        dataInfo.act_inact_ind = model.SearchInput.SSM020_StatusSrch === true ? 1 : 0;
        dataInfo.tui_prod_aval = !model.SearchInput.SSM020_Prd_aval;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "tui_prod_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
                if (itm.field === "tui_city_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTypCity = itm.sort === 'asc';
                }
            }
        }
        if (loading) {
            model.Loading = true;
        }
        this.updateUI();
        if (onload === true) {
            if (this.isGridChanged(gridInfo.Items.map(e => ({ IsSelected: e.IsSelected })))) {
                model.Loading = true;
                this.showConfirmation('Unsaved changes exists. Save and proceed.', false, (e) => {
                    if (e === 0) {
                        me.handleSave();
                    } else if (e === 1) {
                        me.ajaxcall(dataInfo, selectedItem);
                    }
                });
            } else {
                this.ajaxcall(dataInfo, selectedItem);
            }
        }
        else {
            this.ajaxcall(dataInfo, selectedItem);
        }

    }

    ajaxcall(dataInfo, selectedItem) {
        const model = this.Data;
        const me = this;
        Utils.ajax({ url: `${this._WebApi}/SSM020_Srchcmbproduct`, data: dataInfo }, (r) => {
            try {
                if(r){
                    console.log(r);
                    model.Loading = false;
                    model.SupplierMapID = r.SupplierMapID;
                    model.ImageDirectory = r.ImageDirectory;
                    model.SSM020_Lnglist = r.Lng_cmb_rslt.map(value => ({ ID: value.lang_cd, Text: value.lang_nam }));
                    if (r.CityList) model.CityList = r.CityList.map(value => ({
                        ID: value.tui_city_cd, Text: value.tui_city_nam
                    }));
                    this.fillSearchResult(r || {}, selectedItem);
              }
            } catch (ex) {
                console.error(ex);
            } finally {
                model.loadInit = false;
                this.updateUI();
            }
        });
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.srch_rslt.map(data => {
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
            if (data.tui_prod_aval === "True") {
                newData.tui_prod_aval = "No"
            } else {
                newData.tui_prod_aval = "Yes"
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
            model.SearchInput.Pord_Name = "";
            model.SearchInput.City_srch = null;
            model.SearchInput.SSM020_StatusSrch = true;
            model.SearchInput.SSM020_Prd_aval = false;
            this.setFocus("Pord_Name");
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
    setFocus(Txtbxname) {
        if (this.ComponentRef);
        this.ComponentRef.setFocus(Txtbxname);
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
        dataInfo.Selectedrow = temp;
        dataInfo.supp_map_id = model.SupplierMapID;
        model.Loading = true;
        me.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM020SaveAsync`, data: dataInfo }, r => {
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

        this.IniloadPage(pageNo, '', false);
    }
    isValueChanged() {
        const gridInfo = this.Data.GridInfo;
        var dataCopyEx = gridInfo.Items;
        console.log('json ', JSON.stringify(dataCopyEx))
        console.log('json ', JSON.stringify(this.Data.DataCopy))
        return JSON.stringify(dataCopyEx) !== JSON.stringify(this.Data.DataCopy);
    }
    isGridChanged(e) {
        return JSON.stringify(e) !== this.Data.DataCopyGrid;
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
        model.Title = model.Input.IsEdit ? `Tui Product / Edit / ${model.Input.SSM020_Mpid.Text}` : `Tui Product`;
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
    openWindow(Sload, pid, pname, cityName) {
        const me = this;
        if (this.isGridChanged(me.Data.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected })))) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        this.newopenWindow(Sload, pid, pname, cityName);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            this.newopenWindow(Sload, pid, pname, cityName);
        }

    }
    newopenWindow(Sload, pid, pname, cityName) {

        const model = this.Data;
        if (Sload == "City") {
            this.showWindow({
                url: 'SSM/SSM021', data: {Title: model.Title, SuppMapID: model.SupplierMapID}, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    this.loadInitData(false);
                }
            });
        }
        else if (Sload == "Category") {
            this.showWindow({
                url: 'SSM/SSM022', data: { Title: model.Title, SuppMapID: model.SupplierMapID}, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    this.loadInitData(false);
                }
            });
        }
        else if (Sload == "Exptation") {
            this.showWindow({
                url: 'SSM/SSM023', data: { InputData: { pid, pname }, SuppMapID: model.SupplierMapID}, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

                }
            });
        } else if (Sload == "Edit_grid") {
            this.showWindow({
                url: 'SSM/SSM024', data: { Prod_ID: pid, Prod_Name: pname, City_Name: cityName, SuppMapID: model.SupplierMapID, ImageDirectory:model.ImageDirectory }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    this.loadInitData(false);
                }
            });
        }

    }

}

