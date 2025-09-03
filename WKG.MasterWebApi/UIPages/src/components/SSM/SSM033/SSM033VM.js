import * as cntrl from '../../../wkl-components';
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SSM033VM extends cntrl.VMBase {
    constructor(props) {
        super(props);

        this._WebApi = 'SSM030';
        this.init();

    }

    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM033";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.imageCopy = null;
        model.ovrd_srl = "";
        model.Image_Array = null;
        model.ImageNameExists = null;
        model.WKLImage_Upload = null;
        model.WKLImage_Url = null;
        model.WKLImage_SNO = null;
        model.imageDeleted = false;
        model.SuppMapID = this.props.data.SuppMapID;
        model.ImageDirectory = this.props.data.ImageDirectory;
        model.radios = {
            percentage: '',
            fixed: ''
        }
        model.Input = {
            Prod_ID: this.props.data.Prod_ID,
            Prod_Name: this.props.data.Prod_Name,
            supp_map_id: "",
            Featured_Prod: true,
            Latitude: "",
            Longitude: "",
            Sort_order: "",
            Image_SNO: "",
            Image_path: "",
            Image_Name: "",
            booking_fee: "",
            bkfee_type: '',

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

        console.log("Props", this.props)
        const model = this.Data;
        const dataModel = this.Data.Input;
        dataModel.supp_map_id = "";
        dataModel.Prod_ID = this.props.data.Prod_ID;
        dataModel.Prod_Name = this.props.data.Prod_Name;
        dataModel.Tui_ctgry_ID = null;
        dataModel.Featured_Prod = true;
        dataModel.Latitude = '';
        dataModel.Longitude = '';
        dataModel.booking_fee = "";
        dataModel.bkfee_type = model.radios.fixed;

        dataModel.Image_SNO = "";
        dataModel.Image_path = "";
        dataModel.Image_Name = "";

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
        const dataInfo = {
            prod_id: model.Prod_ID,
            prod_featrd: model.Featured_Prod,
            latitude: model.Latitude,
            longitude: model.Longitude,
            img_nam: this.Data.WKLImage_Upload,
            sort_ordr: model.Sort_order,
            booking_fee: model.booking_fee,
            bkng_fee_typ: Utils.isNullOrEmpty(model.booking_fee) ? "" : model.bkfee_type
        };
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    isImageChanged() {
        const model = this.Data;
        return model.imageCopy !== model.WKLImage_Upload;
    }
    loadInitData(loadData = true) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.img_dir = model.ImageDirectory;
        dataInfo.supp_map_id = model.SuppMapID;
        dataInfo.prod_id = model.Input.Prod_ID;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.PageNo = 1;
        dataInfo.sortType = true;
        if (loadData) {
            model.Loading = true;
        }
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM033LoadInitDataAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (loadData) {
                    model.Input.bkfee_type = r.radios.Percentage;
                    model.radios.percentage = r.radios.Percentage;
                    model.radios.fixed = r.radios.Fixed;
                }
                if (r && r.prod_exist && loadData) {
                    model.Input.IsEdit = true;
                    model.Input.Featured_Prod = r.data.prod_featrd;
                    model.Input.booking_fee = r.data.bkng_fee || "";
                    model.Input.bkfee_type = r.data.bkng_fee_typ === null ? r.radios.Percentage : (r.data.bkng_fee_typ);
                    model.ovrd_srl = r.data.ovrd_srl;
                    // model.Input.Prod_Name = r.data.prod_nam;
                    model.Input.Latitude = r.data.latitude;
                    model.Input.Longitude = r.data.longitude;
                    model.Input.Sort_order = r.data.sort_ordr === 0 ? "" : r.data.sort_ordr;
                    model.WKLImage_Upload = r.data.img_nam || "";
                    model.WKLImage_Url = r.data.img_url;
                    model.WKLImage_SNO = r.data.img_srl;
                    model.imageCopy = model.WKLImage_Upload;
                    let dataCopyEx = me.getData();
                    model.DataCopy = JSON.stringify(dataCopyEx);
                }
                model.Input.Image_path = r.image.img_path;
                if (!Utils.isNullOrEmpty(r.ImageName)) {
                    model.ImageNameExists = r.ImageName.split(',');
                }
                me.fillSearchResult(r.table2 || {}, selectedItem);
            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                me.updateUI();
            }
        });
    };

    onBlurCheck(name) {
        const model = this.Data;
        const me = this;
        if (!Utils.isNullOrEmpty(model.ImageNameExists)) {
            if (model.ImageNameExists.includes(name)) {
                me.showAlert('Image already exists.');
                model.WKLImage_Upload = "";
                model.Image_Array = null;
            }
        }
        this.updateUI();
    }

    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items || [];
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
            me.showAlert("No changes has been made.", 'booking_fee');

        }
    }
    doSave(e) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
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
        dataInfo.supp_map_id = model.SuppMapID;
        dataInfo.prod_id = model.Input.Prod_ID;
        dataInfo.ovrd_srl = model.ovrd_srl;
        dataInfo.prod_featrd = model.Input.Featured_Prod;
        dataInfo.latitude = model.Input.Latitude;
        dataInfo.longitude = model.Input.Longitude;
        dataInfo.img_nam = model.WKLImage_Upload || "";
        dataInfo.img_srl = model.WKLImage_SNO || "";
        dataInfo.img_dir = model.ImageDirectory;
        dataInfo.sort_ordr = model.Input.Sort_order === "" ? null : +model.Input.Sort_order;
        dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
        dataInfo.mode = model.Input.IsEdit ? "UPDATE" : "INSERT";
        dataInfo.bkng_fee = model.Input.booking_fee;
        dataInfo.bkng_fee_typ = Utils.isNullOrEmpty(model.Input.booking_fee) ? "" : model.Input.bkfee_type;
        // dataInfo.ovrd_srl = model.ovrd_srl;
        model.Loading = true;
        me.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM033SaveDataAsync`, data: dataInfo, files: model.Image_Array || [] }, r => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess === true) {
                    this.showMessageBox({
                        text: "Data Saved Successfully",
                        messageboxType: WKLMessageboxTypes.question,
                        onClose: (e) => {
                            me.close();
                        }
                    });
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
    // handleDelete(e) {

    //     const me = this;
    //     const model = this.Data;
    //     if (!model.Input.IsEdit) {
    //         return;
    //     }
    //     const dataInfo = this.getData();
    //     dataInfo.prod_id = model.Input.Prod_ID;
    //     dataInfo.img_srl = model.WKLImage_SNO;
    //     dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
    //     dataInfo.ovrd_srl = model.ovrd_srl;
    //     model.Loading = true;
    //     me.updateUI();
    //     Utils.ajax({ url: `${this._WebApi}/SSM033RemoveImage`, data: dataInfo, files: '' || [] }, r => {
    //         try {
    //             model.Loading = false;
    //             r = r || {};
    //             if (r.IsSuccess === true) {
    //                 model.imageDeleted = true;
    //                 me.handleDeleteFollowup(e);
    //             }
    //             else {
    //                 me.showAlert('Something went wrong');
    //             }
    //         }
    //         catch (ex) { }
    //         finally {
    //             me.updateUI();
    //         }
    //     });
    // }
    // handleDeleteFollowup(e) {
    //     const me = this;
    //     const model = this.Data;
    //     model.Image_Array = null;
    //     model.WKLImage_Upload = null;
    //     model.WKLImage_Url = null;
    //     model.WKLImage_SNO = null;
    //     model.imageCopy = null;
    //     var dataCopyEx = this.getData();
    //     this.Data.DataCopy = JSON.stringify(dataCopyEx);
    //     me.showAlert('Image removed successfully', '');
    //     me.updateUI();

    // }
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        me.showAlert('Data saved successfully', '');

        this.loadPage(pageNo);
        me.newMode();
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
        model.Title = `Ltd Product / Edit / ${dataModel.Prod_Name} `;

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
        const me = this;
        const model = this.Data;
        let Prod_ID = this.props.data.Prod_ID;
        let Prod_Name = this.props.data.Prod_Name;
        let IsEdit = '';
        let Url = '';
        let lang_cd = "";
        if (type == "btn_Lat_click") {
            Url = 'SSM/SSM035';
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, Prod_Name: Prod_Name, InputData: InputObj, lat: model.Input.Latitude, lng: model.Input.Longitude, lang_cd }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

                    console.log('Langtitude', e)
                    if (e) {
                        model.Input.Latitude = e.lat;
                        model.Input.Longitude = e.lng;
                    }

                }
            });
        }
        else if (type == "sec2_New") {
            Url = 'SSM/SSM036';
            IsEdit = false;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, Prod_Name: Prod_Name, SuppMapID: model.SuppMapID, InputData: InputObj, lat: model.Input.Latitude, lng: model.Input.Longitude, lang_cd }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    me.loadInitData(false)
                }
            });
        }
        else if (type == "sec2_Edit") {
            Url = 'SSM/SSM036';
            lang_cd = InputObj.lang_cd;
            IsEdit = true;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, SuppMapID: model.SuppMapID, Prod_Name: Prod_Name, InputData: InputObj, lat: model.Input.Latitude, lng: model.Input.Longitude, lang_cd }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    me.loadInitData(false)
                }
            });
        }
        else if (type == "btn_Addimg_ltd") {
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
    }
}
