import { click } from "@testing-library/user-event/dist/click";
import { Utils, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import { data } from "jquery";

export default class SMST023VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SMST020';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        this._saving = false;
        const model = this.Data;
        model.FormID = "SMST023";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Clk = "";
        model.flg = "Y";
        model.Input = {
            SMST023_Group_Name: null,
            SMST023_Tui_Category: null,
            SMST023_Voucher_Type: null,
            SMST023_WKG_Markup: "",
            SMST023_Sort: null,
            IsActiveY: true,
            IsActive: true,
            SMST023_Latitude: null,
            SMST023_Longitude: null,
            IsEdit: false
        };
        model.SMST023_Group_Name_List = [];
        model.SMST023_Tui_Category_List = [];
        model.SMST023_Voucher_Type_List = [];
        //model.AllSelected = false;
        //this.newMode(true);
    }
    // Set the title based on whether it's in edit mode or new mode
    setTitle() {
        const model = this.Data;
        model.Title = model.Input.IsEdit ? `Exception / Edit / ${this.props.data.InputData}` : `Exception`;
    }
    loadInitData() {
        this.loadPage(1, () => this.setFocus(''));
    }

    handleSearch(flag) {
        const model = this.Data;
        model.Clk = flag;
        this.loadPage();
    }
    loadPage(id, cd) {
        const me = this;
        const model = this.Data.Input;
        const datamodel = this.Data;
        const dataInfo = { prod_id: this.props.data.InputData };
        me.Data.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${me._WebApi}/SMST023_Combobinding`, data: dataInfo }, (r) => {
            try {
                me.Data.Loading = false;
                if (r) {
                    //r = r[0];
                    datamodel.SMST023_Group_Name_List = r.Exc_cmb_grp_name.map(data => ({ ID: data.pos_cd, Text: data.pos_grp_nam }));
                    datamodel.SMST023_Tui_Category_List = r.Exc_cmb_tui_cat.map(data => ({ ID: data.tui_ctgry_id, Text: data.tui_ctgry_nam }));
                    datamodel.SMST023_Voucher_Type_List = r.Exc_cmb_vch_typ.map(data => ({ ID: data.vchr_typ_cd, Text: data.vchr_typ_nam }));
                    if (r.Exc_cmb_srch_data != "" && r.Exc_cmb_srch_data != null) {
                        this.clear(r.Exc_cmb_srch_data.pos_cd, "single");
                        this.clear(r.Exc_cmb_srch_data.tui_ctgry_id, "multi");
                        this.clear(r.Exc_cmb_srch_data.vchr_typ_cd, "single");
                        model.SMST023_WKG_Markup = r.Exc_cmb_srch_data.wkg_markup;
                        model.SMST023_Sort = r.Exc_cmb_srch_data.sort_ordr;
                        model.IsActive = r.Exc_cmb_srch_data.act_inact_ind.toUpperCase();
                        model.IsActiveY = r.Exc_cmb_srch_data.prod_featrd.toUpperCase();
                        model.SMST023_Latitude = r.Exc_cmb_srch_data.latitude;
                        model.SMST023_Longitude = r.Exc_cmb_srch_data.longitude;
                        model.mod_dttm = r.Exc_cmb_srch_data.mod_dttm;
                        model.mod_by_usr_cd = r.Exc_cmb_srch_data.mod_by_usr_cd;
                    }
                    model.IsEdit = true;
                } else {
                    model.SMST023_Group_Name = null;
                    model.SMST023_Tui_Category = null;
                    model.SMST023_Voucher_Type = null;
                    model.SMST023_WKG_Markup = null;
                    model.SMST023_Sort = null;
                    model.IsActive = true;
                    model.IsActiveY = true;
                    model.SMST023_Latitude = null;
                    model.SMST023_Longitude = null;
                    model.mod_dttm = "";
                    model.mod_by_usr_cd = "";
                    model.IsEdit = true;

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
    // set multiselect 
    clear(value, type) {
        const model = this.Data;
        if (type === "multi") {
            if (value !== null && value !== '') {
                value = value.split(',');
                value.forEach((id) => { model.Input.SMST023_Tui_Category.push(model.SMST023_Tui_Category_List.find(i => i.ID === id)) });
                 // model.SMST023_Group_Name = { ID: r.pos_cd, Text: r.pos_grp_nam };
                    // model.SMST023_Tui_Category = { ID: r.tui_ctgry_id, Text: r.tui_ctgry_nam };
                    // model.SMST023_Voucher_Type = { ID: r.vchr_typ_cd, Text: r.vchr_typ_nam };
            }
            else {
                model.Input.SMST023_Tui_Category = null;
            }
            for (const itm of model.SMST023_Tui_Category_List) {
                itm.isSelected = false;
            }
        }
        if (type === "single") {
            if (value !== null && value !== '') {
                model.Input.SMST023_Group_Name = model.SMST023_Group_Name_List.find(i => i.ID === value);
                model.Input.SMST023_Voucher_Type = model.SMST023_Voucher_Type_List.find(i => i.ID === value);
            }
            else {
                model.Input.SMST023_Group_Name = null;
                model.Input.SMST023_Voucher_Type = null;
            }
            for (const itm of model.SMST023_Group_Name_List) {
                itm.isSelected = false;
            }
            for (const itm of model.SMST023_Voucher_Type_List) {
                itm.isSelected = false;
            }
        }
        this.updateUI();
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

    getData(){
    
    }
    // // show confirmation message 
    // showConfirmation(text, isThreeOption, callback) {
    //     let options = [{ text: 'Yes' }, { text: 'No' }];
    //     if (isThreeOption)
    //         options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];

    //     this.showMessageBox({
    //         text: text,
    //         buttons: options,
    //         messageboxType: WKLMessageboxTypes.question,
    //         onClose: callback
    //     });
    // }

    // // Set focus on specified textbox
    // setFocus(Txtbxname) {
    //     if (this.ComponentRef);
    //     this.ComponentRef.setFocus(Txtbxname);
    // }

    // Check if data has been changed
    isValueChanged() {
        const dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    // Set selected item in the grid
    // setSelectedItem(selectedItem, loadData = false) {
    //     const model = this.Data;
    //     model.GridInfo.SelectedItem = selectedItem;
    //     model.GridInfo.SelectedItem.isSelected = true;
    //     if (loadData === true) this.loadSelectedData(selectedItem.supp_map_id, selectedItem.pos_cd);
    //     //if (loadData === true) this.handleDelete(selectedItem.supp_map_id, selectedItem.pos_cd);
    // }
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
                    model.SMST023_Pos_code = { ID: r.pos_cd, Text: r.pos_nam };
                    model.IsActive = r.pos_actv_end_pnt.toUpperCase();
                    model.mod_dttm = r.mod_dttm;
                    model.mod_by_usr_cd = r.mod_by_usr_cd;
                    model.IsEdit = true;
                } else {
                    model.SMST023_Pos_code = '';
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
    openWindow(Sload) {
        if (Sload == "Lat_click") {
            this.showWindow({
                url: 'SSMMaster/SMST024', data: { InputData: "" }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e)
                        alert(`On window close Data: ${JSON.stringify(e)}`);
                }
            });
        }
    }
    // changes
    // newMode(setFocus = true, callback) {
    //     const model = this.Data;
    //     model.Input.SMST023_Pos_code = null;
    //     model.Input.IsActive = 'S';
    //     this.setTitle();
    //     model.Input.IsEdit = false
    //     var dataCopyEx = this.getData();
    //     model.DataCopy = JSON.stringify(dataCopyEx);
    //     this.updateUI();
    //     Utils.invoke(callback);
    // }
    // // Get rendering form Data
    // getData() {
    //     const model = this.Data.Input;
    //     const dataInfo = {};
    //     dataInfo.pos_actv_end_pnt = model.IsActive;
    //     if (!Utils.isNullOrEmpty(model.SMST023_Pos_code)) {
    //         dataInfo.pos_cd = model.SMST023_Pos_code.ID;
    //     }
    //     return dataInfo;
    // }

    // // Handle save function
    // handleSave(e) {
    //     const model = this.Data.Input;
    //     if (this.isValueChanged() && model.SMST023_Pos_code !== null) {
    //         this.doSave(e);
    //     }
    //     else {
    //         if (model.SMST023_Pos_code === null) {
    //             const me = this;
    //             const opts = {
    //                 text: "Please Enter Pos Code",
    //                 messageboxType: WKLMessageboxTypes.info,
    //                 onClose: (_e) => {
    //                     me.setFocus("SMST023_Pos_code");
    //                 }
    //             };
    //             this.showMessageBox(opts);
    //             return;

    //         } else {
    //             const me = this;
    //             const opts = {
    //                 text: "Existing Data Conflict!",
    //                 messageboxType: WKLMessageboxTypes.info,
    //                 onClose: (_e) => { }
    //             };
    //             this.showMessageBox(opts);
    //             return;
    //         }
    //     }
    // }
    // isvalidSave(e) {
    //     const model = this.Data.Input;
    //     if (Utils.isNullOrEmpty(model.Text)) {
    //         this.showAlert(32, '    ');
    //         //this.setFocus('SMST023_Pos_code');//Please enter name
    //         return false;
    //     }
    //     return true;
    // }
    // // On save DB
    // doSave(e) {
    //     //if (this.isvalidSave(e)) {
    //     const me = this;
    //     const model = this.Data;
    //     const dataInfo = this.getData();
    //     dataInfo.Mode = model.Input.IsEdit ? "UPDATE" : "INSERT";
    //     if (dataInfo.Mode == "UPDATE") {
    //         dataInfo.supp_map_id = this.Data.GridInfo.SelectedItem.supp_map_id;
    //     }
    //     else {
    //         dataInfo.supp_map_id = this.props.data.InputData;
    //     }
    //     let pageNo = model.GridInfo.Page;
    //     model.Loading = true;
    //     me.updateUI();
    //     Utils.ajax({ url: `${this._WebApi}/SMST023_PosconfigSaveAsync`, data: dataInfo }, r => {
    //         try {
    //             model.Loading = false;
    //             r = r || {};
    //             if (r.IsSuccess === true) {
    //                 model.IsSaved = true;
    //                 me.handleSaveFollowup(e);
    //             }
    //             else {
    //                 if (r.ErrorNo === -1) {//Duplicate code
    //                     me.showAlert(104, 'ID');
    //                 }
    //                 else if (r.ErrorNo === -2) {//Modified
    //                     me.handleModified(dataInfo, e);
    //                 }
    //                 else if (r.ErrorNo === -3) {//Overlapping
    //                     me.handleModified(dataInfo, e);
    //                 }
    //                 else if (r.ErrorNo >= 241) {//Duplicate code
    //                     me.showAlert(r.ErrorNo, 'Type');
    //                 }
    //                 else {
    //                     me.showAlert(1);
    //                 }
    //             }
    //         }
    //         catch (ex) {
    //             console.log(ex);
    //         }
    //         finally {
    //             me.updateUI();
    //         }
    //     });
    // }
    // //}
    // handleDelete(e) {
    //     const me = this;
    //     const model = this.Data;
    //     if (model.Input.IsEdit === true) {
    //         this.showConfirmation(2, false, (_e) => {
    //             if (_e == 0) {
    //                 me.doDelete(e);
    //             }
    //         });
    //     }
    // }
    // doDelete(e) {
    //     const me = this;
    //     const model = this.Data;
    //     let pageNo = model.GridInfo.Page;
    //     const items = model.GridInfo.Items || [];
    //     if (items.length === 1) {
    //         pageNo -= 1;
    //     }
    //     const dataInfo = {};
    //     dataInfo.supp_map_id = model.GridInfo.SelectedItem.supp_map_id;
    //     if (!Utils.isNullOrEmpty(model.Input.SMST023_Pos_code)) {
    //         dataInfo.pos_cd = model.Input.SMST023_Pos_code.ID;
    //     }
    //     model.Loading = true;
    //     Utils.ajax({ url: `${this._WebApi}/SMST023_PosconfigSaveAsync`, data: dataInfo }, (r) => {
    //         try {
    //             model.Loading = false;
    //             r = r || {};
    //             if (r.IsSuccess === true) {
    //                 me.showToaster(3, () => {
    //                     me.loadPage(pageNo, () => this.newMode());
    //                 });
    //             }
    //             else {
    //                 this.showAlert(1);
    //             }
    //         }
    //         catch (es) { }
    //         finally {
    //             me.updateUI();
    //         }
    //     });
    // }
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
