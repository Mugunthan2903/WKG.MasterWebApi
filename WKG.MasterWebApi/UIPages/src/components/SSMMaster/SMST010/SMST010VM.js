import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SMST010VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SMST010';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SMST010";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            SSM_Id_F: "",
            SSM_Name_F: "",
            groupName_F: null,
            Refresh_Type_F: 1,
            Schedule_Date_F: null,
            Api_end_pt_F: null,
            IsActiveF: true,
            IsEdit: false,
            Modifiedby: "",
            Modifiedon: "",
        };
        model.SearchInput = {
            groupName_S: null,
            IsActiveS: true,
            // prevSort: true
        };
        model.groupNamesList = null;
        model.endptList = null;
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 12 };
        model.GridInfo.Columns = [
            // { text: 'selectall', field: 'selectall', width: '6%' },
            { text: 'Ssm Name', field: 'ssm_nam', width: '30%', sort: { enabled: true } },
            { text: 'Group Name', field: 'pos_grp_nam', width: '30%' },
            { text: 'Last Refresh', field: 'last_rfrsh', width: '25%' },
            { text: 'Status', field: 'ssm_status', width: '15%' },
        ];

        this.newMode();
    }
    newMode() {
        const model = this.Data.Input;
        model.ID = 0;
        model.SSM_Id_F = '';
        model.SSM_Name_F = '';
        model.groupName_F = null;
        model.Refresh_Type_F = 1;
        model.Schedule_Date_F = null;
        model.Api_end_pt_F = null;
        model.IsActiveF = true;
        model.IsEdit = false;
        this.setFocus('SSM_Id_F');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();

    }
    loadInitData() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.PageNo = 1;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST010InitLoadDataAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                model.groupNamesList = r.GroupFields.map(e => ({ ID: e.pos_grp_id, Text: e.pos_grp_nam }));
                model.endptList = r.EndPointFields.map((e, i) => ({ ID: i, Text: e.end_pnt_nam }));
                me.fillSearchResult(r.InputFields || {}, selectedItem);
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
        this.setFocus("SSM_Id_F");
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(e => {
            if (e.ssm_status.toUpperCase() === "TRUE") {
                return { ...e, ssm_status: "Active" }
            } else {
                return { ...e, ssm_status: "Inactive" }
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
    loadPage(pageIndex, columnOptions = null) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.pos_grp_nam = model.SearchInput.groupName_S !== null ? model.SearchInput.groupName_S.Text : "";
        dataInfo.ssm_status = model.SearchInput.IsActiveS ? "true" : "false";
        dataInfo.ssmAsc = true;
        // dataInfo.ssmAsc = model.SearchInput.prevSort;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "ssm_nam" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.ssmAsc = itm.sort === 'asc';
                    // model.SearchInput.prevSort = dataInfo.ssmAsc;
                }
            }
        }
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SMST010SearchDataAsync`, data: dataInfo, files: [] }, (r) => {
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
    handleSearch(pageIndex) {
        this.loadPage(pageIndex);
    }
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;

        if (clearAll === true) {
            model.SearchInput.groupName_S = null;
            model.SearchInput.IsActiveS = true;
            this.setTitle();
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        gridInfo.Page = 1;
        gridInfo.TotalPage = 1;
        if (clearAll === true)
            this.setFocus('groupName_S');
        this.updateUI();
    }
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data;
        if (selectedItem) {
            if (selectedItem.ssm_id === model.Input.SSM_Id_F && selectedItem.ssm_nam === model.Input.SSM_Name_F && selectedItem.pos_grp_nam === model.Input.groupName_F?.Text && selectedItem.ssm_status === (model.Input.IsActiveF ? "Active" : "Inactive")) {
                me.setFocus('SSM_Id_F');
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
                                me.handleSave(5, () => me.setSelectedItem(selectedItem, true));
                            } else if (_e === 1) {
                                me.setSelectedItem(selectedItem, true);
                                me.setFocus('SSM_Id_F');
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
                            me.handleSave(me.Data.GridInfo.Page);
                            me.setFocus('SSM_Id_F');
                        } else if (_e === 1) {
                            me.newMode();
                            me.setFocus('SSM_Id_F');
                        }
                    }
                });
            } else {
                me.newMode();
            }
        }
    }
    handleSave(e, callback) {
        const model = this.Data.Input;
        const me = this;
        if (this.isRequiredFieldsEmpty()) {
            const opts = {
                text: "",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (model.SSM_Id_F === "") {
                        if (_e === 10) return;
                        if (e === 1) {
                            model.IsEdit = true;
                        }
                        me.setFocus("SSM_Id_F");
                        me.updateUI();
                    } else if (model.groupName_F === null) {
                        if (_e === 10) return;
                        if (e === 1) {
                            model.IsEdit = true;
                        }
                        me.setFocus("groupName_F");
                        me.updateUI();
                    } else if ((model.Refresh_Type_F === 1 || model.Refresh_Type_F === 3) && model.Schedule_Date_F === null) {
                        if (_e === 10) return;
                        if (e === 1) {
                            model.IsEdit = true;
                        }
                        me.setFocus("Schedule_Date_F");
                        me.updateUI();
                    } else if (model.Api_end_pt_F === null) {
                        if (_e === 10) return;
                        if (e === 1) {
                            model.IsEdit = true;
                        }
                        me.setFocus("Api_end_pt_F");
                        me.updateUI();
                    }
                }
            };
            if (model.SSM_Id_F === "" && model.groupName_F === null && (model.Refresh_Type_F === 1 || model.Refresh_Type_F === 3) && model.Schedule_Date_F === null && model.Api_end_pt_F === null) {
                opts.text = "Please Enter the Required Fields";
            } else if (model.SSM_Id_F === "") {
                opts.text = "Please Enter SSM Id";
            } else if (model.groupName_F === null) {
                opts.text = "Please Enter Group Name";
            } else if ((model.Refresh_Type_F === 1 || model.Refresh_Type_F === 3) && model.Schedule_Date_F === null) {
                opts.text = "Please Enter Schedule Date";
            } else if (model.Api_end_pt_F === null) {
                opts.text = "Please Enter the End Point";
            }
            this.showMessageBox(opts);
            return;
        }
        if (!this.isValueChanged()) {
            const opts = {
                text: "No changes has been made.",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (me.Data.Input.IsEdit)
                        me.setFocus("SSM_Name_F");
                    else
                        me.setFocus("SSM_Id_F");
                }
            };
            this.showMessageBox(opts);
            return;
        }
        let tomorrow = new Date();
        if (model.Refresh_Type_F === 1 || model.Refresh_Type_F === 3) {
            tomorrow = new Date(model.Schedule_Date_F);
            tomorrow.setDate(model.Schedule_Date_F?.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
        }
        const dataInfo = {
            ssm_id: model.SSM_Id_F,
            ssm_nam: model.SSM_Name_F,
            pos_grp_id: model.groupName_F.ID,
            refresh_type: model.Refresh_Type_F,
            schedule_date: tomorrow.toISOString(),
            endpoint: model.Api_end_pt_F.Text,
            ssm_status: model.IsActiveF,
            mode: model.IsEdit ? "UPDATE" : "INSERT",
            mod_by_usr_cd: ApiManager.getUser().ID,
        }
        Utils.ajax({ url: `${this._WebApi}/SMST010SaveDataAsync`, data: dataInfo }, (r) => {
            if (r.IsSuccess) {
                const opts = {
                    text: "Data Saved Successfully",
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.handleSearch(me.Data.GridInfo.Page);
                        me.newMode();
                        if (callback) {
                            callback()
                        } else
                            me.setFocus("SSM_Id_F");
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
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.ssm_id);
    }
    loadSelectedData(ssm_id) {
        const me = this;
        const model = this.Data;
        const dataModel = this.Data.Input;
        me.Data.Loading = true;
        Utils.ajax({ url: `${this._WebApi}/SMST010LoadFormDataAsync`, data: { ssm_id } }, (r) => {
            dataModel.SSM_Id_F = r.ssm_id;
            dataModel.SSM_Name_F = r.ssm_nam;
            dataModel.groupName_F = model.groupNamesList.find(e => e.ID === r.pos_grp_id);
            dataModel.Refresh_Type_F = parseInt(r.refresh_type);
            dataModel.Schedule_Date_F = r.schedule_date === "" ? null : new Date(r.schedule_date);
            dataModel.Api_end_pt_F = model.endptList.find(e => e.Text === r.endpoint);
            dataModel.IsActiveF = r.ssm_status.toLowerCase() === "true" ? true : false;
            dataModel.Modifiedby = r.mod_by_usr_cd;
            dataModel.Modifiedon = r.mod_dttm;
            dataModel.IsEdit = true;
            model.Loading = false;
            me.setTitle();
            let dataCopyEx = me.getData();
            model.DataCopy = JSON.stringify(dataCopyEx);
            me.setFocus('SSM_Name_F');
            me.updateUI();
        });
        this.updateUI();
    }
    openConfigWindow() {
        const model = this.Data;
        this.showWindow({
            url: 'SSMMaster/SMST011',
            data: { Title: 'SMST011' },
            windowStyle: cntrl.WKLWindowStyles.slideLeft, onClose: (e) => { }
        });
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit)
            model.Title = `${this.props.data.Title} / Edit / ${model.Input.groupName_F.Text}`;
        else
            model.Title = `${this.props.data.Title} / New`;
    }
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.SSM_Id_F = model.SSM_Id_F;
        dataInfo.SSM_Name_F = model.SSM_Name_F;
        dataInfo.groupName_F = model.groupName_F;
        dataInfo.Refresh_Type_F = model.Refresh_Type_F;
        dataInfo.Schedule_Date_F = model.Schedule_Date_F === null ? null : model.Schedule_Date_F.setHours(0, 0, 0, 0);
        dataInfo.Api_end_pt_F = model.Api_end_pt_F;
        dataInfo.IsActiveF = model.IsActiveF;
        return dataInfo;
    }
    isRequiredFieldsEmpty() {
        const model = this.Data.Input;
        if (model.SSM_Id_F === "") {
            return true;
        } else if (model.groupName_F === null) {
            return true;
        } else if ((model.Refresh_Type_F === 1 || model.Refresh_Type_F === 3) && model.Schedule_Date_F === null) {
            return true;
        } else if (model.Api_end_pt_F === null) {
            return true;
        }
        return false;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    checkPrimary() {
        const me = this;
        const model = this.Data.Input;
        const dataModel = this.Data;
        const dataInfo = {
            ssm_id: model.SSM_Id_F
        };
        Utils.ajax({ url: `${this._WebApi}/SMST010CheckPrimaryAsync`, data: dataInfo }, (r) => {
            if (r.isPrimaryExist) {
                const options = [{ text: 'Yes' }, { text: 'No' }];

                this.showMessageBox({
                    text: "Record already exists. Do you want to retrieve?",
                    buttons: options,
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        if (_e === 0) {
                            model.IsEdit = true;
                            model.SSM_Id_F = r.editFields[0].ssm_id;
                            model.SSM_Name_F = r.editFields[0].ssm_nam;
                            model.groupName_F = dataModel.groupNamesList.find(e => e.ID === r.editFields[0].pos_grp_id);
                            model.Refresh_Type_F = parseInt(r.editFields[0].refresh_type);
                            model.Schedule_Date_F = r.editFields[0].schedule_date === "" ? null : new Date(r.editFields[0].schedule_date);
                            model.Api_end_pt_F = dataModel.endptList.find(e => e.Text === r.editFields[0].endpoint);
                            model.IsActiveF = r.editFields[0].ssm_status.toLowerCase() === "true";
                            model.Modifiedby = r.editFields[0].mod_by_usr_cd;
                            model.Modifiedon = r.editFields[0].mod_dttm;
                            me.setFocus("SSM_Name_F");
                            me.updateUI();
                            var dataCopyEx = this.getData();
                            me.Data.DataCopy = JSON.stringify(dataCopyEx);
                        } else {
                            me.setFocus("SSM_Id_F");
                        }
                    }
                });

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