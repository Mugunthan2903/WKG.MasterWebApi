import { Utils, ApiManager, WKLMessageboxTypes, WKLWindowStyles, VMBase } from "../../../wkl-components";

export default class SSM100VM extends VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SSM100';
        this.init();
    }
    init() {
        if (Object.keys(this.Data).length !== 0) return;

        const model = this.Data;
        model.FormID = "SSM100";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false;
        model.DataCopy = null;
        model.DataCopyGrid = null;
        model.DataCopyGridarr = null;
        model.ImageDirectory = "";
        model.loadInit = true;
        model.ToothBus = "";
        model.SearchInput = {
            Supplier_Srch: null,
            Pord_Name: "",
            City_srch: null,
            StatusSrch: true,
            Prd_aval: false,
        };
        model.Input = {
            SSM100_Mpid: null,
            SSM100_pull_dt: '',
            StatusN: null,
            mod_dttm: "",
            mod_by_usr_cd: "",
            IsEdit: false

        };
        model.Supplier_Srch_List = [];
        model.City_srch_List = [];
        model.City_srch_ListAll = [];
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
                { text: 'Name', field: 'vntrt_prod_nam', width: '30%', sort: { enabled: true } },
                { text: 'City Name', field: 'vntrt_city_nam', width: '10%', sort: { enabled: true } },
                { text: 'Category', field: 'vntrt_ctgry_nam', width: '10%' },
                { text: 'WKG Category', field: 'tour_ctgry_nam', width: '15%' },
                { text: 'Status', field: 'act_inact_ind', width: '10%' },
                { text: 'Product Delisted', field: 'vntrt_prod_aval', width: '10%' },
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
        const me = this;
        const model = this.Data;
        const dataInfo = {};

        if (loading) model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM100GetProductOnload`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    model.ToothBus = r.ToothBus;
                    if (r.City_List) {
                        model.City_srch_ListAll = r.City_List.map(item => ({ ID: item.vntrt_city_cd, Text: item.vntrt_city_nam, supp_map_id: item.supp_map_id }));
                    }
                    if (r.Supplier_List) {
                        model.Supplier_Srch_List = r.Supplier_List.map(item => ({ ID: item.supp_map_id, Text: item.supp_nam }));
                        let temp = "";
                        temp = r.Supplier_List[0] || null;
                        if (temp) {
                            model.SearchInput.Supplier_Srch = { ID: temp.supp_map_id, Text: temp.supp_nam }
                            model.City_srch_List = model.City_srch_ListAll.filter((data) => data.supp_map_id == temp.supp_map_id).map(item => ({ ID: item.ID, Text: item.Text }));
                            this.IniloadPage(1, "", false, loading);
                        }
                    }
                }
            } catch (ex) {
                console.error(ex);
            } finally {
                this.updateUI();
            }
        });
    }

    handleSearch(pageNo, columnOptions, loadpage) {
        const me = this;
        const model = this.Data;
        if (Utils.isNullOrEmpty(model.SearchInput.Supplier_Srch)) {
            this.showAlert('Please Select Supplier', 'Supplier_Srch');
            return false;
        }
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
        dataInfo.vntrt_prod_nam = model.SearchInput.Pord_Name;
        dataInfo.supp_map_id = model.SearchInput.Supplier_Srch?.ID;
        dataInfo.vntrt_prod_cty_cd = model.SearchInput.City_srch ? model.SearchInput.City_srch.ID : null;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrch === true ? 1 : 0;
        dataInfo.vntrt_prod_aval = !model.SearchInput.Prd_aval;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "vntrt_prod_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
                if (itm.field === "vntrt_city_nam" && !Utils.isNullOrEmpty(itm.sort)) {
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
        Utils.ajax({ url: `${this._WebApi}/SSM100GetProductSearch`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    model.ImageDirectory = r.ImageDirectory;
                    if (r.Product_Dtls) {
                        this.fillSearchResult(r || {}, selectedItem);
                    }
                }
            } catch (ex) {
                console.error(ex);
            } finally {
                model.loadInit = false;
                this.setTitle();
                this.updateUI();
            }
        });
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Product_Dtls.map(data => {
            let newData = { ...data };

            if (data.act_inact_ind === true) {
                newData.act_inact_ind = "Active"
                newData.IsSelected = true;
                newData.AllSelected = true;
            }
            else {
                newData.act_inact_ind = "Inactive"
                newData.IsSelected = false
            }
            if (data.vntrt_prod_aval === true) {
                newData.vntrt_prod_aval = "No"
            } else {
                newData.vntrt_prod_aval = "Yes"
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
    handleCity() {
        const model = this.Data;
        model.SearchInput.City_srch = null;
        if (!Utils.isNullOrEmpty(model.SearchInput.Supplier_Srch)) {
            const supp_map_id = model.SearchInput.Supplier_Srch?.ID || "";
            model.City_srch_List = model.City_srch_ListAll.filter((data) => data.supp_map_id == supp_map_id).map(item => ({ ID: item.ID, Text: item.Text }));
            for (const itm of model.City_srch_List) {
                itm.isSelected = false;
            }
        }
        else {
            model.SearchInput.City_srch = null;
        }
        this.setTitle();
        this.updateUI();
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        if (clearAll === true) {
            model.SearchInput.Supplier_Srch = null;
            model.SearchInput.Pord_Name = "";
            model.SearchInput.City_srch = null;
            model.SearchInput.StatusSrch = true;
            model.SearchInput.Prd_aval = false;
            this.setFocus("Supplier_Srch");
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
        if (!Utils.isNullOrEmpty(model.SearchInput.Supplier_Srch)) {
            dataInfo.supp_map_id = model.SearchInput.Supplier_Srch?.ID;
        }
        model.Loading = true;
        me.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM100SaveProductGrid`, data: dataInfo }, r => {
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
        const me = this;
        const model = me.Data;
        if (!Utils.isNullOrEmpty(model.SearchInput.Supplier_Srch)) {
            model.Title = `${this.props.data.Title} / ${model.SearchInput.Supplier_Srch?.Text}`;
        }
        else {
            model.Title = `${this.props.data.Title}`;
        }

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
        let pageNo = model.GridInfo.Page;
        if (Sload == "City") {
            this.showWindow({
                url: 'SSM/SSM101', data: { Title: model.SearchInput.Supplier_Srch?.Text, SuppMapID: model.SearchInput.Supplier_Srch?.ID }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    this.IniloadPage(pageNo, "", false, false);
                }
            });
        }
        else if (Sload == "Category") {
            this.showWindow({
                url: 'SSM/SSM102', data: { Title: model.SearchInput.Supplier_Srch?.Text, SuppMapID: model.SearchInput.Supplier_Srch?.ID }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    this.IniloadPage(pageNo, "", false, false);
                }
            });
        }
        else if (Sload == "Exception") {
            this.showWindow({
                url: 'SSM/SSM104', data: { Title: model.SearchInput.Supplier_Srch?.Text, InputData: { pid, pname }, SuppMapID: model.SearchInput.Supplier_Srch?.ID }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

                }
            });
        } else if (Sload == "Edit_grid") {
            this.showWindow({
                url: 'SSM/SSM103', data: { Title: model.SearchInput.Supplier_Srch?.Text, Prod_ID: pid, Prod_Name: pname, City_Name: cityName, SuppMapID: model.SearchInput.Supplier_Srch?.ID, ImageDirectory: model.ImageDirectory, ToothBus: model.ToothBus }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    this.IniloadPage(pageNo, "", false, false);
                }
            });
        }

    }

}

