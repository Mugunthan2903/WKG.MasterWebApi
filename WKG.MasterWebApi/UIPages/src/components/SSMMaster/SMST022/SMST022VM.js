import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SMST022VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SMST020';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SMST022";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            Cat_Id_F: "",
            Cat_Name_F: "",
            Shrt_name_F: "",
            WKG_Type_F: "",
            Sort_order_F: "",
            IsActiveF: "",
            Availability: true,
            Modifiedon: "",
            Modifiedby: ""
        };
        model.IsEdit = false;
        model.SearchInput = {
            Cat_Name_S: ""
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 12 };
        //Category Name, Category Level, Parent Category,WKG Category Type,sort order, status,
        model.GridInfo.Columns = [
            { text: 'Name', field: 'tui_ctgry_nam', width: '35%', sort: { enabled: true } },
            { text: 'Level', field: 'tui_ctgry_lvl', width: '10%' },
            { text: 'Parent Id', field: 'tui_prnt_id', width: '15%' },
            { text: 'sort', field: 'sort_ordr', width: '10%' },
            { text: 'Type', field: 'ctgry_typ', width: '15%' },
            { text: 'status', field: 'act_inact_ind', width: '15%' },
        ];
        this.newMode();
    }
    newMode() {
        const model = this.Data;
        const dataModel = this.Data.Input;
        model.ID = 0;
        dataModel.Cat_Id_F = "";
        dataModel.Cat_Name_F = "";
        dataModel.Shrt_name_F = "";
        dataModel.WKG_Type_F = "";
        dataModel.Sort_order_F = "";
        dataModel.IsActiveF = true;
        dataModel.Tui_cat_F = "";
        dataModel.Modifiedon = "";
        dataModel.Modifiedby = "";
        model.IsEdit = false;
        this.setFocus('Cat_Name_S');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }
    loadInitData() {
        this.loadPage(1);
        this.setFocus("SSM_Id_F");
    }
    loadPage(pageIndex, columnOptions = null) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.PageNo = pageIndex;
        dataInfo.tui_ctgry_nam = "";
        dataInfo.sortType = true;
        // dataInfo.ssmAsc = model.SearchInput.prevSort;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "evnt_typ_nam" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.sortType = itm.sort === 'asc';
                    // model.SearchInput.prevSort = dataInfo.ssmAsc;
                }
            }
        }
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SMST022_SearchDataAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
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
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.tui_ctgry_id);
    }
    loadSelectedData(tui_ctgry_id) {
        const me = this;
        const model = this.Data;
        model.Loading = true;
        cntrl.Utils.ajax({ url: `${this._WebApi}/SMST022_LoadFormDataAsync`, data: { tui_ctgry_id } }, (r) => {
            model.Input.Cat_Id_F = r.tui_ctgry_id;
            model.Input.Cat_Name_F = r.tui_ctgry_nam;
            model.Input.Shrt_name_F = r.evnt_typ_nam || r.tui_ctgry_nam;
            model.Input.IsActiveF = r.act_inact_ind;
            model.Input.WKG_Type_F = r.tui_ctgry_aval ? "Yes" : "No";
            model.Input.Sort_order_F = r.sort_ordr;
            model.Input.Modifiedon = r.mod_dttm;
            model.Input.Modifiedby = r.mod_by_usr_cd || "123";
            model.IsEdit = true;
            model.Loading = false;
            me.setTitle();
            let dataCopyEx = me.getData();
            model.DataCopy = JSON.stringify(dataCopyEx);
            me.setFocus('Short_name_F');
            me.updateUI();
        });
        this.updateUI();
    }
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data.Input;
        if (selectedItem) {
            if (selectedItem.tui_ctgry_nam === model.Cat_Name_F) {
                return;
            }
            else {
                if (this.isValueChanged()) {
                    let options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
                    this.showMessageBox({
                        text: "Do you want to save the current data ?",
                        buttons: options,
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => {
                            if (_e === 0) {
                                me.handleSave(10, () => me.setSelectedItem(selectedItem, true));
                                me.setFocus('Shrt_name_F');
                            } else if (_e === 1) {
                                me.setSelectedItem(selectedItem, true);
                                me.setFocus('Shrt_name_F');
                            }
                        }
                    });
                }
                else {
                    this.setSelectedItem(selectedItem, true);
                    me.setFocus('Shrt_name_F');
                }
            }
        }
        else {
            if (this.isValueChanged()) {
                let options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
                this.showMessageBox({
                    text: "Do you want to save the current data ?",
                    buttons: options,
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        if (_e === 0) {
                            me.Data.Input.IsEdit = true;
                            me.handleSave();
                            me.newMode();
                        } else if (_e === 1) {
                            me.newMode();
                        }
                    }
                });
            } else {
                me.newMode();
            }
        }
    }
    handleSave(c, callback) {
        const model = this.Data.Input;
        const me = this;
        if (this.isValueChanged()) {
            const dataInfo = {
                tui_ctgry_id: model.Cat_Id_F,
                shrt_nam: model.Shrt_name_F,
                act_inact_ind: model.IsActiveF
            }
            cntrl.Utils.ajax({ url: `${this._WebApi}/SMST022_SaveCategoryAsync`, data: dataInfo }, (r) => {
                if (r.IsSuccess) {
                    const opts = {
                        text: "Data Saved Successfully",
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => {
                            me.loadPage(me.Data.GridInfo.Page);
                            if (callback) callback()
                            if (c === 1) me.newMode();
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
            });
        } else {
            const opts = {
                text: "No changes has been made.",
                messageboxType: cntrl.WKLMessageboxTypes.info,
                onClose: (_e) => {
                    me.setFocus("Shrt_name_F");
                }
            };
            this.showMessageBox(opts);
        }
    }
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;

        if (clearAll === true) {
            model.SearchInput.Cat_Name_S = "";
            this.setFocus('Cat_Name_S');
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        this.updateUI();
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        model.Title = `${this.props.data.Title} / Edit ${model.Input.Cat_Name_F !== "" ? `/ ${model.Input.Cat_Name_F}` : ""}`;
    }
    getData() {
        const model = this.Data.Input;
        return model;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    doClose() {
        this.close()
    }
}