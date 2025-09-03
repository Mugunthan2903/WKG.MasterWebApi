import * as cntrl from '../../../wkl-components';
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SSM103VM extends cntrl.VMBase {
    constructor(props) {
        super(props);

        this._WebApi = 'SSM100';
        this.init();

    }

    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM103";
        model.Title = '';
        model.Loading = false;
        model.DataCopy = null;
        model.DefaultBookFeeType = {
            Percentage: "",
            Fixed: ""
        }
        model.ovrd_srl = "";
        model.City_Name = this.props.data.City_Name;
        model.SuppMapID = this.props.data.SuppMapID;
        model.ToothBus = this.props.data.ToothBus;
        model.ImageDirectory = this.props.data.ImageDirectory;
        model.Image_Array = null;
        model.ImageNameExists = null;
        model.WKLImage_Upload = null;
        model.imageCopy = JSON.stringify(model.WKLImage_Upload);
        model.WKLImage_Url = null;
        model.WKLImage_SNO = null;
        model.Input = {
            Prod_ID: this.props.data.Prod_ID,
            Prod_Name: this.props.data.Prod_Name,
            supp_map_id: "",
            Featured_Prod: true,
            Latitude: "",
            Longitude: "",
            Sort_order: "",
            Cancl_policy: "",
            Cancl_refund: false,
            Image_SNO: "",
            Image_path: "",
            Image_Name: "",
            Modifiedon: null,
            Modifiedby: "",
            IsEdit: false,
            booking_fee: "",
            bkfee_type: model.DefaultBookFeeType.Percentage,
            WKG_Ctgry_ID: null,
        };

        model.SearchInput = {
        };
        model.WKG_Ctgry_IDList = [];
        model.WKG_Ctgry_IDListAll = [];
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 8 };
        model.GridInfo.Columns = [
            { text: 'Language', field: 'lang_nam', width: '20%' },
            { text: 'Name', field: 'prod_nam', width: '70%' },
            { text: '', field: '', width: '10%' }


        ];
        this.newMode();
    }



    newMode() {

        console.log("Props", this.props)
        const model = this.Data;
        const dataModel = this.Data.Input;
        dataModel.supp_map_id = "";
        dataModel.Prod_ID = this.props.data.Prod_ID;
        dataModel.Prod_Name = this.props.data.Prod_Name;

        dataModel.Image_SNO = "";
        dataModel.Image_path = "";
        dataModel.Image_Name = "";
        dataModel.Featured_Prod = true;
        dataModel.Latitude = "";
        dataModel.Longitude = "";
        dataModel.Sort_order = "";
        dataModel.Cancl_policy = "";
        dataModel.Cancl_refund = false;
        dataModel.booking_fee = "";
        dataModel.bkfee_type = model.DefaultBookFeeType.Percentage;
        dataModel.WKG_Ctgry_ID = null;

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
            prod_id: model.Prod_ID,
            img_nam: this.Data.WKLImage_Upload || "",
            img_dir: dataModel.ImageDirectory,
            img_srl: this.Data.WKLImage_SNO || "",
            prod_featrd: model.Featured_Prod,
            latitude: model.Latitude,
            longitude: model.Longitude,
            sort_ordr: model.Sort_order,
            cncl_plcy: model.Cancl_policy,
            cncl_rfnd: model.Cancl_refund,
            bkng_fee: model.booking_fee,
            bkng_fee_typ: Utils.isNullOrEmpty(model.booking_fee) ? "" : model.bkfee_type,
            tui_ctgry_ids: !Utils.isNullOrEmpty(model.WKG_Ctgry_ID) ? model.WKG_Ctgry_ID.map(item => item.ID).join(',') : null,
        };
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    isImageChanged() {
        const model = this.Data;
        return JSON.stringify(model.WKLImage_Upload) !== model.imageCopy;
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
        dataInfo.prod_id = model.Input.Prod_ID;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.PageNo = pageIndex;
        dataInfo.img_dir = model.ImageDirectory;
        dataInfo.supp_map_id = model.SuppMapID;
        dataInfo.sortType = true;
        if (loader) {
            model.Loading = true;
        }
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM103Gridbinding`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    model.WKG_Ctgry_IDList = r.WKGCtgryList.filter(data => data.act_inact_ind === true).map((data) => ({ ID: data.tour_ctgry_id, Text: data.tour_ctgry_nam }));
                    model.WKG_Ctgry_IDListAll = r.WKGCtgryList.map((data) => ({ ID: data.tour_ctgry_id, Text: data.tour_ctgry_nam }));
                    if (loadData) {
                        model.DefaultBookFeeType = r.BookingFeeType;
                        model.Input.bkfee_type = model.DefaultBookFeeType.Percentage;
                    }
                    if (r.GetOvrride.length !== 0 && loadData) {
                        model.ovrd_srl = r.GetOvrride[0].ovrd_srl;
                        model.Input.supp_map_id = r.GetOvrride[0].supp_map_id;
                        model.Input.Featured_Prod = r.GetOvrride[0].prod_featrd;
                        model.Input.Latitude = r.GetOvrride[0].latitude;
                        model.Input.Longitude = r.GetOvrride[0].longitude;
                        model.Input.Sort_order = r.GetOvrride[0].sort_ordr || "";
                        model.Input.Cancl_policy = r.GetOvrride[0].cncl_plcy;
                        model.Input.Cancl_refund = r.GetOvrride[0].cncl_rfnd;
                        model.Input.booking_fee = r.GetOvrride[0].bkng_fee || "";
                        if (!Utils.isNullOrEmpty(r.GetOvrride[0].bkng_fee_typ)) {
                            model.Input.bkfee_type = r.GetOvrride[0].bkng_fee_typ;
                        }
                        else {
                            model.Input.bkfee_type = model.DefaultBookFeeType.Percentage;
                        }
                        me.setWKGCatgry(r.GetOvrride[0].tui_ctgry_ids);
                        model.WKLImage_Upload = r.GetOvrride[0].img_nam;
                        model.WKLImage_Url = r.GetOvrride[0].img_url;
                        model.WKLImage_SNO = r.GetOvrride[0].img_srl;
                        model.Input.IsEdit = true;
                        model.imageCopy = JSON.stringify(model.WKLImage_Upload);
                        let dataCopyEx = me.getData();
                        model.DataCopy = JSON.stringify(dataCopyEx);
                    }
                    if (r.GetOvrride.length === 0 && loadData) {
                        me.setWKGCatgry(r.wkg_ctgry_ids);
                        var dataCopyEx1 = me.getData();
                        me.Data.DataCopy = JSON.stringify(dataCopyEx1);
                      }
                    if (r.GetImagedata.length != 0) {
                        model.Input.Image_path = r.GetImagedata[0].img_path;
                    }
                    if (!Utils.isNullOrEmpty(r.ImageName)) {
                        model.ImageNameExists = r.ImageName.split(',');
                    }
                    me.fillSearchResult(r || {}, selectedItem);
                }

            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                me.updateUI();
            }
        });
    };
    setWKGCatgry(value) {
        const model = this.Data;
        model.Input.WKG_Ctgry_ID = [];
        if (value !== null && value !== '') {
            value = value.split(',');
            value.forEach((id) => { model.Input.WKG_Ctgry_ID.push(model.WKG_Ctgry_IDListAll.find(i => i.ID === id)) });
            model.Input.WKG_Ctgry_ID = model.Input.WKG_Ctgry_ID.filter(ctgry => ctgry !== undefined);
            model.Input.WKG_Ctgry_ID = model.Input.WKG_Ctgry_ID.length === 0 ? null : model.Input.WKG_Ctgry_ID;
        }
        else {
            model.Input.WKG_Ctgry_ID = null;
        }
        for (const itm of model.WKG_Ctgry_IDList) {
            itm.isSelected = false;
        }


        this.updateUI();
    }
    onBlurCheck(name) {
        const model = this.Data;
        const me = this;
        if (!Utils.isNullOrEmpty(model.ImageNameExists)) {
            if (model.ImageNameExists.includes(name)) {
                me.showAlert('Image already exists.');
                model.WKLImage_Upload = "";
                model.Image_Array = null;
            }
            this.updateUI();
        }
    }

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
        if (this.isValueChanged() || this.isImageChanged()) {
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
        if (this.isImageChanged()) {
            dataInfo.ImageChanged = "YES";
        }
        else {
            dataInfo.ImageChanged = "NO";
        }
        if (!Utils.isNullOrEmpty(model.WKLImage_SNO)) {
            dataInfo.OldImg = "YES";
        }
        else {
            dataInfo.OldImg = "NO";
        }
        dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
        dataInfo.Savedata = model.Input.IsEdit ? "UPDATE" : "INSERT";
        dataInfo.ovrd_srl = model.ovrd_srl;
        dataInfo.bkng_fee_typ = Utils.isNullOrEmpty(model.Input.booking_fee) ? "" : model.Input.bkfee_type;
        model.Loading = true;
        me.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM103SaveOvrdImgData`, data: dataInfo, files: model.Image_Array || [] }, r => {
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
        model.Title = `${this.props.data.Title} / Edit / ${model.City_Name} / ${dataModel.Prod_Name} `;

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
        console.log("Props EDIT CLICK ".item);

        this.openWindow("sec2_Edit", item);
    }
    openWindow(type, InputObj) {
        const model = this.Data;
        const me = this;
        let Prod_ID = this.props.data.Prod_ID;
        let Prod_Name = this.props.data.Prod_Name;
        let IsEdit = '';
        let Url = '';

        if (type == "sec2_New") {
            Url = 'SSM/SSM105';
            IsEdit = false;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, Prod_Name: Prod_Name, SuppMapID: model.SuppMapID, InputData: InputObj }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    me.loadPage(1, false, false);
                }
            });
        }
        else if (type == "sec2_Edit") {
            Url = 'SSM/SSM105';
            IsEdit = true;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, Prod_Name: Prod_Name, SuppMapID: model.SuppMapID, InputData: InputObj }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    me.loadPage(1, false, false);
                }
            });
        }
        else if (type == "btn_Addimg_bbs") {
            Url = 'SSM/SSM009';
            IsEdit = true;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, Supp_ID: model.SuppMapID, Prod_Name: Prod_Name, Imag_Dir: model.ImageDirectory }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e) {
                        model.WKLImage_SNO = e.img_srl;
                        model.WKLImage_Upload = e.img_nam;
                        model.WKLImage_Url = e.img_url;
                    }
                }
            });
        }
        else if (type == "btn_Lat_click") {
            Url = 'SSM/SSM026';
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, Prod_Name: Prod_Name, InputData: InputObj, lat: model.Input.Latitude, lng: model.Input.Longitude }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e) {
                        model.Input.Latitude = e.lat;
                        model.Input.Longitude = e.lng;
                    }

                }
            });
        }




    }
}
