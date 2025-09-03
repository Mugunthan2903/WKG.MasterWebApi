import * as cntrl from '../../../wkl-components';
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SSM081VM extends cntrl.VMBase {
    constructor(props) {
        super(props);

        this._WebApi = 'SSM080';
        this.init();

    }

    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM081";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.DefaultBookFeeType = {
            Percentage:"",
            Fixed:""
        }
        model.imageCopy = null;
        model.ovrd_srl = "";
        model.SuppMapID = this.props.data.SuppMapID;
        model.Image_Array = null;
        model.WKLImage_Upload = null;
        model.WKLImage_Url = null;
        model.WKLImage_SNO = null;
        model.Input = {
            Prod_ID: this.props.data.Prod_ID,
            Prod_Name: this.props.data.Prod_Name,
            Sort_order: "",
            Adult_avail: true,
            Adult_price: "",
            Child_avail: true,
            Child_price: "",
            //status_act_inact: true,
            IsEdit: false,
            booking_fee: "",
            bkfee_type: model.DefaultBookFeeType.Percentage
        };

        model.SearchInput = {
        };
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 8 };
        model.GridInfo.Columns = [
            { text: 'Language', field: 'lang_nam', width: '20%' },
            { text: 'Name', field: 'lp_prod_nam', width: '70%' },
            { text: '', field: '', width: '10%' }


        ];
        this.newMode();
    }



    newMode() {
        const model = this.Data;
        const dataModel = this.Data.Input;
        dataModel.Prod_ID = this.props.data.Prod_ID;
        dataModel.Prod_Name = this.props.data.Prod_Name;
        dataModel.IsEdit = false;
        dataModel.booking_fee = "";
        dataModel.bkfee_type = model.DefaultBookFeeType.Percentage;

        this.setTitle();
        this.updateUI();
    }
    loadInitData() {
        this.loadPage(1);
    }

    loadPage(pageIndex, loader = true) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.lp_prod_id = model.Input.Prod_ID;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.PageNo = pageIndex;
        dataInfo.sortType = true;
        if (loader) {
            model.Loading = true;
        }
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM081OnLoadDataAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r && loader) {
                    model.DefaultBookFeeType = r.radios;
                    model.Input.Sort_order = r.PrdDtl.sort_ordr;
                    model.Input.Adult_avail = r.PrdDtl.adult_aval.toLowerCase() === 'true';
                    model.Input.Adult_price = r.PrdDtl.adult_price || "";
                    model.Input.Child_avail = r.PrdDtl.child_aval.toLowerCase() === 'true';
                    model.Input.Child_price = r.PrdDtl.child_price || "";
                    model.ovrd_srl = r.PrdOvrdDtl.ovrd_srl || "";
                    model.Input.booking_fee = r.PrdOvrdDtl.bkng_fee || "";
                    model.Input.bkfee_type = r.PrdOvrdDtl.bkng_fee_typ === null ? model.DefaultBookFeeType.Percentage : (r.PrdOvrdDtl.bkng_fee_typ);
                    //model.Input.status_act_inact = r.PrdDtl.act_inact_ind.toLowerCase() === 'true';
                    let dataCopyEx = me.getData();
                    model.DataCopy = JSON.stringify(dataCopyEx);
                }
                me.fillSearchResult(r || {}, selectedItem);
            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                me.updateUI();
            }
        });
    };

    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.EditGrid || [];
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
    }
    doSave() {
        const model = this.Data;
        const me = this;
        const dataInfo = this.getData();
        dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
        dataInfo.supp_map_id = model.SuppMapID;
        dataInfo.ovrd_srl = model.ovrd_srl;
        dataInfo.bkng_fee_typ = Utils.isNullOrEmpty(model.Input.booking_fee) ? "" : (model.Input.bkfee_type);
        model.Loading = true;
        me.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM081SaveDataAsync`, data: dataInfo }, r => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess === true) {
                    me.showAlert('Data Saved Successfully', () => me.close());
                    me.close();
                }
                else {
                    me.showAlert('Something went wrong');
                }
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }
    handleSave() {
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave()
        } else {
            this.showAlert("No changes has been made", (ex) => this.setFocus('booking_fee'));
        }
    }
    getData() {
        const model = this.Data.Input;
        const dataInfo = {
            lp_prod_id: model.Prod_ID,
            sort_ordr: model.Sort_order,
            adult_aval: model.Adult_avail ? 1 : 0,
            adult_price: model.Adult_price,
            child_aval: model.Child_avail ? 1 : 0,
            child_price: model.Child_price,
            bkng_fee: model.booking_fee,
            bkng_fee_typ: Utils.isNullOrEmpty(model.booking_fee) ? "" : model.bkfee_type
            //act_inact_ind: model.status_act_inact ? 1 : 0
        };
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    doClose() {
        const me = this;
        if (this.isValueChanged()) {
            this.showConfirmation("Do you want to Discard the changes?", false, (ex) => {
                if (ex === 0) {
                    me.close();
                }
            });
        } else {
            this.close();
        }

    }
    showAlert(errorMsg, callback) {
        if (typeof errorMsg === 'number')
            errorMsg = Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,
            messageboxType: WKLMessageboxTypes.question
        };
        if (callback && typeof callback === 'function') {
            opt.onClose = (_e) => {
                callback();
            }
        }
        this.showMessageBox(opt);
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
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
    setTitle() {
        const model = this.Data;
        const dataModel = this.Data.Input;
        model.Title = `Explorer Pass Product / Edit / ${dataModel.Prod_Name} `;

    }
    onEditclick(item) {
        const model = this.Data.Input;
        console.log("Props EDIT CLICK ".item);

        this.openWindow("sec2_Edit", item);
    }
    openWindow(type, InputObj) {
        const model = this.Data;
        let Prod_ID = this.props.data.Prod_ID;
        let Prod_Name = this.props.data.Prod_Name;
        let IsEdit = '';
        let Url = '';
        if (type == "sec2_New") {

            Url = 'SSM/SSM083';
            IsEdit = false;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, Prod_Name: Prod_Name, InputData: InputObj, SuppMapID:model.SuppMapID, lat: model.Input.Latitude, lng: model.Input.Longitude }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    this.loadPage(1, false);
                }
            });
        }
        else if (type == "sec2_Edit") {
            Url = 'SSM/SSM083';
            IsEdit = true;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, Prod_Name: Prod_Name, InputData: InputObj,  SuppMapID:model.SuppMapID, lat: model.Input.Latitude, lng: model.Input.Longitude }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    this.loadPage(1, false);
                }
            });
        }
    }
}
