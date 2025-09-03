import { Utils, ApiManager, WKLMessageboxTypes, WKLWindowStyles, VMBase } from "../../../wkl-components";

export default class SMST004VM extends VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SMST004';
        this.init();
    }

    // Initialize the view model
    init() {
        // Check if the Data object is empty before initializing
        if (Object.keys(this.Data).length !== 0) return;

        // Initialize model properties
        const model = this.Data;
        model.FormID = "SMST004";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false;
        model.DataCopy = null;
        model.SearchInput = {
            IsActive: true,
        };
        model.Input = {
            SMST004_Mpid: null,
            SMST004_prd_endpt: null,
            SMST004_sndx_endpt: null,
            SMST004_pull_dt: '',
            StatusN: null,
            mod_dttm: "",
            mod_by_usr_cd: "",
            IsEdit: false

        };
        model.SMST004_Mpid_list = [];
        model.SMST004_prd_endpt_list = [];
        model.SMST004_sndx_endpt_list = [];
       //model.AllSelected = false;
        model.GridInfo = {
            Items: [],
            Page: 1,
            TotalPage: 0,
            TotalCount: 0,
            SelectedItem: null,
            PageSize: 12,
            Columns: [
                //{ text: '', field: 'Text', width: '25px' },
                { text: 'Supplier Map Id', field: 'supp_map_id', width: '30%',sort: { enabled: true } },
                { text: 'Last Pull Datetime', field: 'lst_pull_dt', width: '50%' },
                { text: 'Status', field: 'act_inact_ind', width: '20%' }
            ]
        };

        // Set the view mode to new
        this.newMode(false);
    }

    // Set the title based on whether it's in edit mode or new mode
    setTitle() {
        const model = this.Data;
        model.Title = model.Input.IsEdit ? `Supplier Config/ Edit / ${model.Input.SMST004_Mpid.Text}` : `Supplier Config / New`;
    }

    // Load initial data when the page is initialized
    loadInitData() {


        this.IniloadPage(1, () => { });
    }

    // Handle search button click
    handleSearch() {
        this.IniloadPage(1, () => { });
    }

    // Load data for the initial page
    IniloadPage(pageIndex, columnOptions = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {
            Status: model.SearchInput.IsActive === true ? 1 : 0,
            PageNo: pageIndex,
            PageSize: gridInfo.PageSize
        };
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "supp_map_id" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        this.updateUI();

        // Make an AJAX request to fetch data
        Utils.ajax({ url: `${this._WebApi}/SMST004_Srchcmbsupmpid`, data: dataInfo }, (r) => {
            try {
                // Process the response data
                model.Loading = false;
                model.SMST004_Mpid_list = r.supp_map_id_col.map(value => ({ ID: value, Text: value }));
                model.SMST004_prd_endpt_list = r.end_pnt_nam_col.map(value => ({ ID: value, Text: value }));
                model.SMST004_sndx_endpt_list = r.end_pnt_nam_col.map(value => ({ ID: value, Text: value }));
                this.fillSearchResult(r || {}, selectedItem);
            } catch (ex) {
                console.error(ex);
            } finally {
                this.updateUI();
            }
        });
    }

    // Fill the search result table
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.srch_rslt_col.map(e => ({
            ...e,
            act_inact_ind: e.act_inact_ind.toUpperCase() === "TRUE" ? "Active" : "InActive"
        })) || [];
        gridInfo.Page = r.CurrentPage || 0;
        gridInfo.TotalPage = r.TotalPages || 0;
        gridInfo.TotalCount = r.TotalCount || 0;
        // Handle selected item logic
        if (gridInfo.Items.length > 0) {
            if (selectedItem !== undefined && selectedItem !== null) {
                selectedItem = gridInfo.Items.find(i => i.ID === selectedItem.ID);
            }
            if (selectedItem === null) selectedItem = gridInfo.Items[0];
        }
        if (selectedItem != null) selectedItem.isSelected = true;
        gridInfo.SelectedItem = selectedItem;
    }

    // Set selected item in the grid
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true) this.loadSelectedData(selectedItem.supp_map_id);
    }

    // Handle search clear button click
    handleSearchClear() {
        this.doSearchClear(true);
    }

    // Clear search results
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        if (clearAll === true) model.SearchInput.IsActive = true;
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        this.updateUI();
    }

    // model.Input = {
    //     SMST004_Mpid: null,
    //     SMST004_prd_endpt: null,
    //     SMST004_sndx_endpt: null,
    //     SMST004_pull_dt: '',
    //     StatusN: null,
    //     mod_dttm: "",
    //     mod_by_usr_cd: "",
    //     IsEdit: false

    // };
    // Set view mode to new changes
    newMode(setFocus = true, callback) {
        const model = this.Data;
        model.Input.SMST004_Mpid = null;
        model.Input.SMST004_prd_endpt = null;
        model.Input.SMST004_sndx_endpt = null;
        model.Input.SMST004_pull_dt = "";
        model.Input.StatusN = true;
        model.Input.ModifiedOn = null;
        model.Input.IsEdit = false;
        this.setTitle();
        if (setFocus === true) this.setFocus('SMST004_Mpid');
        var dataCopyEx = this.getData();
        model.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
        Utils.invoke(callback);
    }

    // Handle data change
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data;
        let isNew = true;
        if (selectedItem) {
            if (selectedItem.supp_map_id === model.Input.SMST004_Mpid) {
                // this.setFocus('SMST004_Mpid');
                return;
            }
            isNew = false;
        }

        if (this.isValueChanged()) {
            this.showConfirmation("Do you want to save the current data ?", true, (_e) => {
                try {
                    if (_e === 0) {
                        me.doSave();
                    }
                    else if (_e === 1) {
                        if (selectedItem)
                            me.setSelectedItem(selectedItem, true);
                        else
                            me.newMode(false);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            if (selectedItem)
                this.setSelectedItem(selectedItem, true);
            else
                this.newMode();
        }
    }
    // show confirmation message 
    showConfirmation(text, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];

        this.showMessageBox({
            text: text,
            buttons: options,
            messageboxType: WKLMessageboxTypes.question,
            onClose: callback
        });
    }

    // Set focus on specified textbox
    setFocus(Txtbxname) {
        if (this.ComponentRef);
        this.ComponentRef.setFocus(Txtbxname);
    }

    // Check if data has been changed
    isValueChanged(e) {
        let dataCopyEx = this.getData();
        if (e === 1) {
            dataCopyEx = this.isRequiredFieldsEmpty();
        }
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }

    // Load selected data
    loadSelectedData(id) {
        const me = this;
        const model = this.Data.Input;
        const dataInfo = { supp_map_id: id };
        me.Data.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${me._WebApi}/SMST004_Edittabledata`, data: dataInfo }, (r) => {
            try {
                me.Data.Loading = false;
                if (r) {
                    r = r[0];
                    model.SMST004_Mpid = r.supp_map_id === null ? null : { ID: r.supp_map_id, Text: r.supp_map_id };
                    model.SMST004_prd_endpt = r.prod_end_pnt_nam === null ? null : { ID: r.prod_end_pnt_nam, Text: r.prod_end_pnt_nam };
                    model.SMST004_sndx_endpt = r.sndbx_end_pnt_nam === null ? null : { ID: r.sndbx_end_pnt_nam, Text: r.sndbx_end_pnt_nam };
                    model.StatusN = r.act_inact_ind === "True";
                    model.SMST004_pull_dt = r.lst_pull_dt || "";
                    model.mod_dttm = r.mod_dttm;
                    model.mod_by_usr_cd = r.mod_by_usr_cd;
                    model.IsEdit = true;
                } else {
                    model.SMST004_Mpid = null;
                    model.SMST004_prd_endpt = null;
                    model.SMST004_sndx_endpt = null;
                    model.StatusN = true;
                    model.SMST004_pull_dt = '';
                    model.Input.IsEdit = true;
                }
                me.setTitle();
                const dataCopyEx = this.getData();
                this.Data.DataCopy = JSON.stringify(dataCopyEx);
                // this.setFocus('SMST004_prd_endpt');
            } catch (ex) {
                console.error(ex);
            } finally {
                this.updateUI();
            }
        });
    }

    // Get rendering form Data
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        // if ( this.Data.GridInfo.SelectedItem !=""  ) {
        //     dataInfo.ISEdit = true;
        // }
        // else {
        //     dataInfo.ISEdit = false;
        // }
        dataInfo.act_inact_ind = model.StatusN;
        // dataInfo.mod_by_usr_cd= ApiManager.getUser().ID;
        if (!Utils.isNullOrEmpty(model.ModifiedOn)) {
            dataInfo.ModifiedOn = model.ModifiedOn;
        }
        if (!Utils.isNullOrEmpty(model.SMST004_Mpid)) {
            dataInfo.supp_map_id = model.SMST004_Mpid.ID;
        }
        if (!Utils.isNullOrEmpty(model.SMST004_prd_endpt)) {
            dataInfo.sndbx_end_pnt_nam = model.SMST004_prd_endpt.ID;
        }
        if (!Utils.isNullOrEmpty(model.SMST004_sndx_endpt)) {
            dataInfo.prod_end_pnt_nam = model.SMST004_sndx_endpt.ID;
        }
        return dataInfo;
    }

    // Handle save function
    handleSave(e) {
        const model = this.Data.Input;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            if (model.SMST004_Mpid === null) {
                const me = this;
                const opts = {
                    text: "Please Enter Supplier Map Id",
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.setFocus("SMST004_Mpid");
                    }
                };
                this.showMessageBox(opts);
                return;

            } else {
                const me = this;
                const opts = {
                    text: "Existing Data Conflict!",
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => { }
                };
                this.showMessageBox(opts);
                return;
            }
        }
    }
    isvalidSave(e) {
        const me = this;
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.SMST004_Mpid)) {
            this.showMessageBox({
                text: "Please Enter Supplier Map Id",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    me.setFocus('SMST004_Mpid');
                }
            });
            return false;
        }
        return true;
    }
    // On save DB
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            // dataInfo.ModifiedBy = e.userID || 0;
            let pageNo = model.GridInfo.Page;
            dataInfo.Mode = model.Input.IsEdit ? "UPDATE" : "INSERT";
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SMST004SaveAsync`, data: dataInfo }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        const opts = {
                            text: "Data Saved Successfully",
                            messageboxType: WKLMessageboxTypes.info,
                            onClose: (_e) => {
                                me.handleSearch();
                                me.newMode();
                            }
                        };
                        this.showMessageBox(opts);
                    }
                    else {
                        const opts = {
                            text: "Something went Wrong",
                            messageboxType: WKLMessageboxTypes.info,
                            onClose: (_e) => {
                            }
                        };
                        this.showMessageBox(opts);
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

    isRequiredFieldsEmpty() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.SMST004_Mpid = model.SMST004_Mpid;
        dataInfo.SMST004_prd_endpt = model.SMST004_prd_endpt;
        dataInfo.SMST004_sndx_endpt = model.SMST004_sndx_endpt;
        dataInfo.SMST004_pull_dt = model.SMST004_pull_dt;
        dataInfo.StatusN = model.StatusN;
        return dataInfo;
    }
    openWindow() {
        this.showWindow({
            url: 'SSMMaster/SMST005', data: { InputData: this.Data.Input.SMST004_Mpid.ID }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                if (e)
                    alert(`On window close Data: ${JSON.stringify(e)}`);

            }
        });
    }
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

