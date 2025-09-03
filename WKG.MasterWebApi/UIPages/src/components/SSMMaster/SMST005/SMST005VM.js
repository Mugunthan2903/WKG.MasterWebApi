import { click } from "@testing-library/user-event/dist/click";
import { Utils, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import { data } from "jquery";

export default class SMST005VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SMST004';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        this._saving = false;
        const model = this.Data;
        model.FormID = "SMST005";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Clk = "";
        model.flg = "Y";
        model.SearchInput = {
            Poscode: null,

        };
        model.Input = {
            SMST005_Pos_code: null,
            IsActive: 'S',
            IsEdit: false
        };
        model.PoscodeList = [];
        model.SMST005_Pos_code_list = [];
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
                { text: 'Supplier Map Id', field: 'supp_map_id', width: '35%' },
                { text: 'Pos Name', field: 'pos_nam', width: '35%' , sort: { enabled: true }},
                { text: 'Pos Active Endpoints', field: 'pos_actv_end_pnt', width: '30%' }
            ]
        };
        this.newMode(true);
    }
    // Set the title based on whether it's in edit mode or new mode
    setTitle() {
        const model = this.Data;
        model.Title = model.Input.IsEdit ? `Pos Config/ Edit / ${this.props.data.InputData}` : `Pos Config / New`;
    }
    loadInitData() {
        this.loadPage(1, () => this.setFocus(''));
    }

    handleSearch(flag) {
        const model = this.Data;
        model.Clk = flag;
        this.loadPage();
    }
    loadPage(pageIndex, columnOptions = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        if (model.Clk !== "") {
            if (!Utils.isNullOrEmpty(model.SearchInput.Poscode)) {
                dataInfo.pos_cd = model.SearchInput.Poscode.ID;
            }
        }
        dataInfo.supp_map_id = this.props.data.InputData;
        // model.SearchInput.IsActive === true ? 1 : 0,
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "pos_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST005_Getsupposconfigdata`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                console.log(r);
                model.PoscodeList = r.srch_cmb_col.map(data => ({ ID: data.pos_cd, Text: data.pos_nam }));
                model.SMST005_Pos_code_list = r.srch_cmb_col.map(data => ({ ID: data.pos_cd, Text: data.pos_nam }));
                this.fillSearchResult(r || {}, selectedItem);
                
            } catch (ex) {
                console.error(ex);
            } finally {
                this.updateUI();
            }
        });


    }

    // Handle search clear button click
    handleSearchClear() {
        this.doSearchClear(true);
    }

    // Clear search results
    doSearchClear(clearAll = false) {
        const model = this.Data;
        if (clearAll == true) {
            model.SearchInput.Poscode = null;
        }
        const gridInfo = model.GridInfo;
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;

        this.updateUI();
    }

    // Fill the search result table
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.srch_rslt_col.map(e => ({
            ...e,
            pos_actv_end_pnt: e.pos_actv_end_pnt.toUpperCase() === "P" ? "Production" : "Sandbox"
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
    // Handle data change
    // handleDataChange(selectedItem) {
    //     const me = this;
    //     const model = this.Data;
    //     let isNew = true;
    //     if (selectedItem) {
    //         if (selectedItem.pos_cd && selectedItem.pos_nam === model.Input.SMST005_Pos_code) {
    //             this.setFocus('SMST005_Pos_code');
    //             return;
    //         }
    //         isNew = false;
    //     }

    //     if (this.isValueChanged()) {
    //         this.showConfirmation("Do you want to discard the changes?", true, (_e) => {
    //             try {
    //                 if (_e === 0) {
    //                     Utils.invokeAction({
    //                         owner: this,
    //                         formID: model.FormID,
    //                         controlID: model.IsEdit ? 'btn_edit' : 'btn_new',
    //                         callback: (e) => {
    //                             e = e || {};
    //                             if (selectedItem)
    //                                 e.followUpAction = () => this.setSelectedItem(selectedItem, true);
    //                             me.doSave(e);
    //                         }
    //                     });

    //                 }
    //                 else if (_e === 1) {
    //                     if (selectedItem)
    //                         this.setSelectedItem(selectedItem, true);
    //                     else
    //                         this.newMode();
    //                 }
    //             }
    //             catch (ex) {

    //             }
    //             finally { }
    //         });
    //     }
    //     else {
    //         if (selectedItem)
    //             this.setSelectedItem(selectedItem, true);
    //         else
    //             this.newMode();
    //     }
    // }

    handleDataChange(selectedItem) {
        const model = this.Data;
        // Check if the selected item is new or existing
        let isNew = !selectedItem || (selectedItem.pos_cd && selectedItem.pos_nam === model.Input.SMST005_Pos_code);
        // Check if any changes have been made
        if (this.isValueChanged()) {
            // Prompt user to confirm discarding changes
            this.showConfirmation("Do you want to save the current data ?", true, (_e) => {
                try {
                    if (_e === 0) {
                        // User wants to discard changes and save data
                        const action = model.IsEdit ? 'btn_edit' : 'btn_new'; // Determine action based on edit mode
                        Utils.invokeAction({
                            owner: this,
                            formID: model.FormID,
                            controlID: action,
                            callback: (e) => {
                                e = e || {};
                                if (selectedItem)
                                    e.followUpAction = () => this.setSelectedItem(selectedItem, true); // Set selected item after saving
                                this.doSave(e); // Save data
                            }
                        });
                    } else if (_e === 1) {
                        // User wants to keep changes
                        if (selectedItem)
                            this.setSelectedItem(selectedItem, true); // Set selected item
                        else
                            this.newMode(); // Enter new mode
                    }
                } catch (ex) {
                    console.error(ex);
                } finally {
                    // Any cleanup code can be placed here
                }
            });
        } else {
            // No changes, set selected item or enter new mode
            if (selectedItem)
                this.setSelectedItem(selectedItem, true); // Set selected item
            else
                this.newMode(); // Enter new mode
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
    isValueChanged() {
        const dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    // Set selected item in the grid
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true) this.loadSelectedData(selectedItem.supp_map_id, selectedItem.pos_cd);
        //if (loadData === true) this.handleDelete(selectedItem.supp_map_id, selectedItem.pos_cd);
    }
    // Load selected data
    loadSelectedData(id, cd) {
        const me = this;
        const model = this.Data.Input;
        const dataInfo = { supp_map_id: id, pos_cd: cd, Status: "E" };
        me.Data.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${me._WebApi}/SMST004_Edittabledata`, data: dataInfo }, (r) => {
            try {
                me.Data.Loading = false;
                if (r) {
                    r = r[0];
                    model.SMST005_Pos_code = { ID: r.pos_cd, Text: r.pos_nam };
                    model.IsActive = r.pos_actv_end_pnt.toUpperCase();
                    model.mod_dttm = r.mod_dttm;
                    model.mod_by_usr_cd = r.mod_by_usr_cd;
                    model.IsEdit = true;
                } else {
                    model.SMST005_Pos_code = '';
                    model.IsActive = "S";
                    model.Input.IsEdit = true;
                }
                me.setTitle();
                const dataCopyEx = this.getData();
                this.Data.DataCopy = JSON.stringify(dataCopyEx);
                //this.setFocus('');
            } catch (ex) {
                console.error(ex);
            } finally {
                this.updateUI();
            }
        });
    }
    // changes
    newMode(setFocus = true, callback) {
        const model = this.Data;
        model.Input.SMST005_Pos_code = null;
        model.Input.IsActive = 'S';
        this.setTitle();
        model.Input.IsEdit = false
        var dataCopyEx = this.getData();
        model.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
        Utils.invoke(callback);
    }
    // Get rendering form Data
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.pos_actv_end_pnt = model.IsActive;
        if (!Utils.isNullOrEmpty(model.SMST005_Pos_code)) {
            dataInfo.pos_cd = model.SMST005_Pos_code.ID;
        }
        return dataInfo;
    }

    // Handle save function
    handleSave(e) {
        const model = this.Data.Input;
        if (this.isValueChanged() && model.SMST005_Pos_code !== null) {
            this.doSave(e);
        }
        else {
            if (model.SMST005_Pos_code === null) {
                const me = this;
                const opts = {
                    text: "Please Enter Pos Code",
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.setFocus("SMST005_Pos_code");
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
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.Text)) {
            this.showAlert(32, '    ');
            //this.setFocus('SMST005_Pos_code');//Please enter name
            return false;
        }
        return true;
    }
    // On save DB
    doSave(e) {
        //if (this.isvalidSave(e)) {
        const me = this;
        const model = this.Data;
        const dataInfo = this.getData();
        dataInfo.Mode = model.Input.IsEdit ? "UPDATE" : "INSERT";
        if (dataInfo.Mode == "UPDATE") {
            dataInfo.supp_map_id = this.Data.GridInfo.SelectedItem.supp_map_id;
        }
        else {
            dataInfo.supp_map_id = this.props.data.InputData;
        }
        let pageNo = model.GridInfo.Page;
        model.Loading = true;
        me.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST005_PosconfigSaveAsync`, data: dataInfo }, r => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess === true) {
                    model.IsSaved = true;
                    me.handleSaveFollowup(e);
                }
                else {
                    if (r.ErrorNo === -1) {//Duplicate code
                        me.showAlert(104, 'ID');
                    }
                    else if (r.ErrorNo === -2) {//Modified
                        me.handleModified(dataInfo, e);
                    }
                    else if (r.ErrorNo === -3) {//Overlapping
                        me.handleModified(dataInfo, e);
                    }
                    else if (r.ErrorNo >= 241) {//Duplicate code
                        me.showAlert(r.ErrorNo, 'Type');
                    }
                    else {
                        me.showAlert(1);
                    }
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
    //}
    handleDelete(e) {
        const me = this;
        const model = this.Data;
        if (model.Input.IsEdit === true) {
            this.showConfirmation(2, false, (_e) => {
                if (_e == 0) {
                    me.doDelete(e);
                }
            });
        }
    }
    doDelete(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        const items = model.GridInfo.Items || [];
        if (items.length === 1) {
            pageNo -= 1;
        }
        const dataInfo = {};
        dataInfo.supp_map_id = model.GridInfo.SelectedItem.supp_map_id;
        if (!Utils.isNullOrEmpty(model.Input.SMST005_Pos_code)) {
            dataInfo.pos_cd = model.Input.SMST005_Pos_code.ID;
        }
        model.Loading = true;
        Utils.ajax({ url: `${this._WebApi}/SMST005_PosconfigSaveAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess === true) {
                    me.showToaster(3, () => {
                        me.loadPage(pageNo, () => this.newMode());
                    });
                }
                else {
                    this.showAlert(1);
                }
            }
            catch (es) { }
            finally {
                me.updateUI();
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
