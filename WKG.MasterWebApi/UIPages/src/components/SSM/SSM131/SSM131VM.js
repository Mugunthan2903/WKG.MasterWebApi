import * as cntrl from '../../../wkl-components';
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SSM131VM extends cntrl.VMBase {
    constructor(props) {
        super(props);

        this._WebApi = 'SSM130';
        this.init();

    }

    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM131";
        model.Title = '';
        model.Loading = false;
        model.DataCopy = null;
        model.DefaultBookFeeType = {
            Percentage: "",
            Fixed: ""
        }
        model.ovrd_srl = "";
        model.SuppMapID = this.props.data.SuppMapID;
        model.Input = {
            Crrg_ID: this.props.data.Crrg_ID,
            Crrg_Name: this.props.data.Crrg_Name,
            supp_map_id: "",
            Sort_order: "",
            Srvc_until: "",
            booking_fee: "",
            bkfee_type: model.DefaultBookFeeType.Percentage,
            Modifiedon: null,
            Modifiedby: "",
            IsEdit: false,
        };

        model.SearchInput = {
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 8 };
        model.GridInfo.Columns = [
            { text: 'Language', field: 'lang_nam', width: '20%' },
            { text: 'Name', field: 'prod_nam', width: '70%' },
            { text: '', field: '', width: '10%' }
        ];
        this.newMode();
    }

    newMode() {
        const model = this.Data;
        const dataModel = this.Data.Input;
        dataModel.supp_map_id = "";
        dataModel.Crrg_ID = this.props.data.Crrg_ID;
        dataModel.Crrg_Name = this.props.data.Crrg_Name;
        dataModel.Sort_order = "";
        dataModel.Srvc_until = "";
        dataModel.booking_fee = "";
        dataModel.bkfee_type = model.DefaultBookFeeType.Percentage;
        dataModel.Modifiedon = null;
        dataModel.Modifiedby = "";
        dataModel.IsEdit = false;
        this.setFocus('');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }
    getData() {
        const model = this.Data.Input;
        const dataModel = this.Data;
        const dataInfo = {
            supp_map_id: dataModel.SuppMapID,
            prod_id: model.Crrg_ID,
            sort_ordr: model.Sort_order,
            dstrbsn_srvc_untl: model.Srvc_until,
            bkng_fee: model.booking_fee,
            bkng_fee_typ: Utils.isNullOrEmpty(model.booking_fee) ? "" : model.bkfee_type,
        };
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    loadInitData() {
        this.loadPage(1, true);
    }

    loadPage(pageIndex, loader = true, loadData = true) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.prod_id = model.Input.Crrg_ID;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.PageNo = pageIndex;
        dataInfo.supp_map_id = model.SuppMapID;
        dataInfo.sortType = true;
        if (loader) {
            model.Loading = true;
        }
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM131OverrideOnload`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    if (loadData) {
                        model.DefaultBookFeeType = r.BookingFeeType;
                        model.Input.bkfee_type = model.DefaultBookFeeType.Percentage;
                    }
                    if (r.GetOvrride.length !== 0 && loadData) {
                        model.ovrd_srl = r.GetOvrride[0].ovrd_srl;
                        model.Input.supp_map_id = r.GetOvrride[0].supp_map_id;
                        model.Input.Sort_order = r.GetOvrride[0].sort_ordr || "";
                        model.Input.Srvc_until = r.GetOvrride[0].dstrbsn_srvc_untl || "";
                        model.Input.booking_fee = r.GetOvrride[0].bkng_fee || "";
                        if (!Utils.isNullOrEmpty(r.GetOvrride[0].bkng_fee_typ)) {
                            model.Input.bkfee_type = r.GetOvrride[0].bkng_fee_typ;
                        }
                        else {
                            model.Input.bkfee_type = model.DefaultBookFeeType.Percentage;
                        }
                        model.Input.IsEdit = true;
                        let dataCopyEx = me.getData();
                        model.DataCopy = JSON.stringify(dataCopyEx);
                    }
                    if (r.GetOvrride.length === 0 && loadData) {
                        var dataCopyEx1 = me.getData();
                        me.Data.DataCopy = JSON.stringify(dataCopyEx1);
                    }
                    me.fillSearchResult(r || {}, selectedItem);
                }
            }
            catch (ex) {
                console.log("Error in SSM131 onload override", ex);
            }
            finally {
                me.updateUI();
            }
        });
    };

    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.ExpLanggrid || [];
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
    setSelectedItem(selectedItem) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
    }
    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            if (model.Input.IsEdit) {
                me.showAlert("No changes has been made.", 'booking_fee');
            }
            else {
                me.showAlert("No changes has been made", 'booking_fee');
            }

        }
    }
    doSave(e) {
        const me = this;
        const model = this.Data;
        const dataInfo = this.getData();
        dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
        dataInfo.Mode = model.Input.IsEdit ? "UPDATE" : "INSERT";
        dataInfo.ovrd_srl = model.ovrd_srl;
        dataInfo.bkng_fee_typ = Utils.isNullOrEmpty(model.Input.booking_fee) ? "" : model.Input.bkfee_type;
        model.Loading = true;
        me.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM131SaveOverride`, data: dataInfo }, r => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess === true) {
                    model.IsSaved = true;
                    me.handleSaveFollowup(e);
                }
                else {
                    me.showAlert('Something went wrong');
                }
            }
            catch (ex) {
                console.error("Error in SSM131 Save override : ", ex);
            }
            finally {
                me.updateUI();
            }
        });
    }
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        me.showAlert('Data saved successfully', '');
        me.close();
    }

    handleValueChange(followUpAction) {
        const model = this.Data;
        if (this.isValueChanged()) {
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
        const dataModel = this.Data.Input;
        model.Title = `${this.props.data.Title} / Edit / ${dataModel.Crrg_Name} `;

    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
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
    onEditclick(item) {
        const model = this.Data.Input;
        this.openWindow("sec2_lang_Edit", item);
    }
    openWindow(type, InputObj) {
        const model = this.Data;
        const me = this;
        let Crrg_ID = this.props.data.Crrg_ID;
        let Crrg_Name = this.props.data.Crrg_Name;
        let IsEdit = '';
        let Url = '';

        if (type == "sec2_lang_New") {
            Url = 'SSM/SSM133';
            IsEdit = false;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Crrg_ID: Crrg_ID, Crrg_Name: Crrg_Name, SuppMapID: model.SuppMapID, InputData: InputObj }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    me.loadPage(1, false, false);
                }
            });
        }
        else if (type == "sec2_lang_Edit") {
            Url = 'SSM/SSM133';
            IsEdit = true;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Crrg_ID: Crrg_ID, Crrg_Name: Crrg_Name, SuppMapID: model.SuppMapID, InputData: InputObj }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    me.loadPage(1, false, false);
                }
            });
        }
    }
}
