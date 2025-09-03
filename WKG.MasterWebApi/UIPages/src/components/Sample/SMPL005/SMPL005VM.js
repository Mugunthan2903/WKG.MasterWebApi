import * as cntrl from '../../../wkl-components';
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SMPL005VM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this.init();
    }

    init() {
        const model = this.Data;
        if (Object.keys(model).length !== 0)
            return;
        model.FormID = "SMST002";
        model.Input = {
            IsEdit: false,
            SearchInp: "",
            IsActiveS: true,
            SMST002_lang_code_form: "",
            SMST002_lang_name_form: "",
            SMST002_tui_lang_code_form: "",
            SMST002_combo: "",
            IsActiveF: true,
            prevSearchT: "",
            prevSearchR: true,
            isSearchClicked: false,
            SMST002_file: { name: "", value: "" },
            Name: ""
        }
        model.Loading = false;
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 10 };
        model.GridInfo.Columns = [
            // { text: 'selectall', field: 'selectall', width: '10%' },
            { text: 'Code', field: 'lang_cd', width: '15%' },
            { text: 'Name', field: 'lang_nam', width: '20%', sort: { enabled: true } },
            { text: 'Tui Code', field: 'tui_lang_cd', width: '20%' },
            { text: 'Status', field: 'act_inact_ind', width: '20%' },
            { text: 'actions', field: 'actions', width: '25%' },
        ];
        this.newMode();
    }
    newMode(setFocus = true, callback) {
        const model = this.Data;
        model.Input.ID = 0;
        model.Input.SMST002_lang_code_form = '';
        model.Input.SMST002_lang_name_form = '';
        model.Input.SMST002_tui_lang_code_form = '';
        model.Input.IsActiveF = true;
        // model.SearchInput.languageName = "";
        // model.SearchInput.IsActiveS = true;
        model.Input.IsEdit = false;
        this.setFocus('SMST002_lang_code_form');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
        Utils.invoke(callback);

    }
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.lang_cd);
    }
    loadSelectedData(lang_cd) {
        const me = this;
        const model = this.Data.Input;
        me.Data.Loading = true;
        Utils.ajax({ url: `SMST002/SMST002ModifyDataAsync`, data: { lang_cd } }, (r) => {
            model.SMST002_lang_code_form = r.lang_cd;
            model.SMST002_lang_name_form = r.lang_nam;
            model.SMST002_tui_lang_code_form = r.tui_lang_cd || "";
            model.IsActiveF = r.act_inact_ind;
            model.Modifiedby = r.mod_by_usr_cd;
            model.Modifiedon = r.mod_dttm;
            model.IsEdit = true;
            me.Data.Loading = false;
            me.setTitle();
            let dataCopyEx = me.getData();
            me.Data.DataCopy = JSON.stringify(dataCopyEx);
            me.setFocus('SMST002_lang_name_form');
            me.updateUI();
        });
        this.updateUI();
    }
    loadInitialData() {
        this.loadPage(1);
    }
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        // model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 10 };
        if (clearAll === true) {
            model.Input.languageName = '';
            model.Input.IsActiveS = true;
            this.setTitle();
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        gridInfo.TotalCount = 0;
        if (clearAll === true)
            this.setFocus('languageName');
        this.updateUI();
    }
    handleSort(options) {
        const model = this.Data;
        model.GridInfo.Items.sort((a, b) => {
            const comparison = a.lang_nam.localeCompare(b.lang_nam);
            return options[0].sort === 'asc' ? comparison : -comparison;
        });
        this.updateUI();
    }
    handleSearch(pageIndex) {
        const model = this.Data.Input;
        model.isSearchClicked = true;
        model.prevSearchT = model.SearchInp;
        model.prevSearchR = model.IsActiveS ? "true" : "false";
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
        dataInfo.lang_name = model.Input.prevSearchT;
        dataInfo.act_inact_ind = model.Input.prevSearchR;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "lang_nam" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.TuiAsc = itm.sort === 'asc';
                }
            }
        }
        // model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `Test/TestGetSearchDataAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                // model.Loading = false;
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
        gridInfo.Items = r.Items.map(e => {
            if (e.act_inact_ind) {
                return { ...e, act_inact_ind: "Active" }
            } else {
                return { ...e, act_inact_ind: "Inactive" }
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
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data;
        if (selectedItem) {
            if (selectedItem.lang_cd === model.Input.SMST002_lang_code_form && selectedItem.lang_nam === model.Input.SMST002_lang_name_form && selectedItem.tui_lang_cd === model.Input.SMST002_tui_lang_code_form && selectedItem.act_inact_ind === (model.Input.IsActiveF ? "Active" : "Inactive")) {
                me.setFocus('SMST002_lang_name_form');
                return;
            }
            else {
                if (this.isValueChanged()) {
                    let options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
                    this.showMessageBox({
                        text: "Do you want to save the current data ?",
                        buttons: options,
                        messageboxType: WKLMessageboxTypes.info,
                        onClose: (_e) => {
                            if (_e === 0) {
                                me.handleSave(5);
                            } else if (_e === 1) {
                                me.setSelectedItem(selectedItem, true);
                                me.setFocus('SMST002_lang_code_form');
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
            if (this.isValueChanged()) {
                let options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
                this.showMessageBox({
                    text: "Do you want to save the current data ?",
                    buttons: options,
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        if (_e === 0) {
                            me.Data.Input.IsEdit = true;
                            me.handleSave(1);
                            me.setFocus('SMST002_lang_code_form');
                        } else if (_e === 1) {
                            me.newMode();
                            me.setFocus('SMST002_lang_code_form');
                        }
                    }
                });
            } else {
                me.newMode();
            }
        }
    }
    handleSave(e) {
        const model = this.Data.Input;
        const me = this;
        if (model.SMST002_lang_code_form === "" || model.SMST002_lang_name_form === "" || model.IsActiveF === "") {
            const opts = {
                text: "",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (me.Data.Input.SMST002_lang_code_form === "") {
                        if (_e === 10) return;
                        if (e === 1) me.Data.Input.IsEdit = true;
                        this.setFocus("SMST002_lang_code_form");
                        me.updateUI();
                    } else if (model.SMST002_lang_name_form === "") {
                        if (_e === 10) return;
                        if (e === 1) me.Data.Input.IsEdit = true;
                        this.setFocus("SMST002_lang_name_form");
                        me.updateUI();
                    }
                }
            };
            if (me.Data.Input.SMST002_lang_code_form === "") {
                opts.text = "Please Enter Code";
            } else if (model.SMST002_lang_name_form === "") {
                opts.text = "Please Enter Name";
            }
            this.showMessageBox(opts);
            return;
        }
        if (!this.isValueChanged()) {
            const opts = {
                text: "Existing Data Conflict!",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (me.Data.Input.IsEdit)
                        me.setFocus("SMST002_lang_name_form");
                    else
                        me.setFocus("SMST002_lang_code_form");
                }
            };
            this.showMessageBox(opts);
            return;
        }
        const dataInfo = {
            lang_cd: model.SMST002_lang_code_form,
            lang_nam: model.SMST002_lang_name_form,
            tui_lang_cd: model.SMST002_tui_lang_code_form,
            act_inact_ind: model.IsActiveF,
            isEdit: model.IsEdit,
            mod_by_usr_cd: ApiManager.getUser().ID,
        }
        Utils.ajax({ url: `Test/TestSaveDataAsync`, data: dataInfo }, (r) => {
            if (r.IsSuccess) {
                const opts = {
                    text: "Data Saved Successfully",
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.loadPage(1);
                        if (e === 5) return;
                        me.newMode();
                        me.setFocus("SMST002_lang_code_form");
                    }
                };
                this.showMessageBox(opts);

            } else {
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
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit)
            model.Title = `Edit / ${model.Input.SMST002_lang_name_form}`;
        else
            model.Title = `New`;
    }
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.ID = model.ID;
        dataInfo.SMST002_lang_code_form = model.SMST002_lang_code_form;
        dataInfo.SMST002_lang_name_form = model.SMST002_lang_name_form;
        dataInfo.SMST002_tui_lang_code_form = model.SMST002_tui_lang_code_form;
        dataInfo.IsActiveF = model.IsActiveF;
        return dataInfo;
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    doClose() {
        this.close();
    }
    openWindow(type) {
        const model = this.Data;
        this.showWindow({
            url: 'SSMMaster/SMST041', data: { Title: '', SSMName: '', }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

            }
        });
    }
}