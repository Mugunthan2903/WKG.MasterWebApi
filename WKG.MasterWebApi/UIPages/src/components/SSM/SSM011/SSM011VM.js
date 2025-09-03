import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM011VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM010';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM011";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.country_Cd = this.props.data.country_Cd;
        model.Pos_cd = this.props.data.Poscd
        model.DefaultBookFeeType = {
            Percentage: "",
            Fixed: ""
        };
        model.Input = {
            Grp_ID: this.props.data.Grp_ID,
            SSM_ID: this.props.data.SSM_ID,
            SSM_Name: this.props.data.SSM_Name,
            Location_name: '',
            Location_latitude: '',
            Location_longitude: '',
            Location_shortname: '',
            Location_postcode: '',
            Location_Subzone:"",
            Location_Accespoint:"",
            Cust_Cd: null,
            Outlt_Cd: null,
            Arena_Locat: null,
            Uber_Uuid: null,
            HandpointSN: "",
            HandpointTermTyp: "",
            HandpointKey: "",
            Payment_typ:null,
            Frdm_str_id:"",
            Frdm_trmnl_id:"",
            Frdm_dcc_req:true,
            Booking_fee: "",
            BookFeeTyp: model.DefaultBookFeeType.Percentage,
            IsEdit: this.props.data.IsEdit
        };
        model.Cust_CdList = [];
        model.Outlt_CdList = [];
        model.Uber_UuidList = [];
        model.Arena_LocatList = [];
        model.Arena_LocatListTemp = [];
        model.PaymentTypList = [];

        this.newMode();

    }
    newMode(flag = false) {
        console.log('NewMOde', this.props);
        const model = this.Data;

        if (flag === true) {
            model.Input.IsEdit = false;
        }
        else {
            model.Input.IsEdit = this.props.data.IsEdit;
        }

        model.Input.Grp_ID = this.props.data.Grp_ID;
        model.Input.SSM_ID = "";
        model.Input.SSM_Name = "";
        model.Input.Location_name = '';
        model.Input.Location_latitude = '';
        model.Input.Location_longitude = '';
        model.Input.Location_shortname = '';
        model.Input.Location_postcode = '';
        model.Input.Location_Subzone = "";
        model.Input.Location_Accespoint = "";
        model.Input.Cust_Cd = null;
        model.Input.Outlt_Cd = null;
        model.Input.Arena_Locat = null;
        model.Input.Uber_Uuid = null;
        model.Input.Payment_typ= null;
        model.Input.HandpointSN = "";
        model.Input.HandpointTermTyp = "";
        model.Input.HandpointKey = "";
        model.Input.Frdm_str_id = "";
        model.Input.Frdm_trmnl_id = "";
        model.Input.Frdm_dcc_req = true;
        model.Input.Booking_fee = "";
        model.Input.BookFeeTyp = model.DefaultBookFeeType.Percentage;
        model.Input.Status = true;

        this.setTitle();
        if (model.Input.IsEdit) {
            this.setFocus('SSM_Name');
        }
        else {
            this.setFocus('SSM_ID');
        }
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();

    }
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.ssm_id = model.SSM_ID;
        dataInfo.pos_grp_id = this.props.data.Grp_ID;
        dataInfo.ssm_nam = model.SSM_Name;
        dataInfo.dflt_loc_desc = model.Location_name;
        dataInfo.dflt_loc_lat = model.Location_latitude;
        dataInfo.dflt_loc_lon = model.Location_longitude;
        dataInfo.dflt_loc_post_cd = model.Location_postcode;
        dataInfo.dflt_loc_shrt_nam = model.Location_shortname;
        dataInfo.dflt_ubr_subzn_nam = model.Location_Subzone;
        dataInfo.dflt_ubr_acspnt_nam = model.Location_Accespoint;
        if (!Utils.isNullOrEmpty(model.Outlt_Cd)) {
            dataInfo.Outlt_cd = model.Outlt_Cd.ID;
        }
        if (!Utils.isNullOrEmpty(model.Arena_Locat)) {
            dataInfo.arena_loc_srl = model.Arena_Locat.ID;
        }
        if (!Utils.isNullOrEmpty(model.Uber_Uuid)) {
            dataInfo.ubr_org_uuid = model.Uber_Uuid.ID;
        }
         if (!Utils.isNullOrEmpty(model.Payment_typ)) {
            dataInfo.pos_pymnt_typ = model.Payment_typ.ID;
        }
        if (!Utils.isNullOrEmpty(model.Cust_Cd)) {
            dataInfo.Cust_cd = model.Cust_Cd.ID;
        }
        if (!Utils.isNullOrEmpty(model.Booking_fee)) {
            dataInfo.bkng_fee = model.Booking_fee;
            dataInfo.bkng_fee_typ = model.BookFeeTyp;
        }
        else {
            dataInfo.bkng_fee = "";
            dataInfo.bkng_fee_typ = "";
        }
        if (dataInfo.pos_pymnt_typ == "H") {
            dataInfo.hndpnt_srl_num = model.HandpointSN;
            dataInfo.hndpnt_key = model.HandpointKey;
            dataInfo.hndpnt_trmnl_typ = model.HandpointTermTyp;
        }
        if (dataInfo.pos_pymnt_typ == "F") {
            dataInfo.frdm_str_id = model.Frdm_str_id;
            dataInfo.frdm_trmnl_id = model.Frdm_trmnl_id;
            dataInfo.frdm_dcc_req = model.Frdm_dcc_req;
        }
         dataInfo.ssm_status = model.Status === true ? 1 : 0;

        return dataInfo;
    }
    loadInitData() {

        const me = this;
        const model = this.Data;
        this.loadpage();

    }

    onBlurSrch() {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.ssm_id = model.Input.SSM_ID;
        dataInfo.pos_grp_id = this.props.data.Grp_ID;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM011BlurAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                r = r || {};
                if (r.Isavailable === true) {
                    me.handleModified(r.Items[0]);
                }
                else if (r.ErrorNo == -1) {
                    const info = r.Items[0];
                    model.Input.SSM_ID = "";
                    me.showAlert(`This SSM Id already exists in ${info.pos_grp_nam}`, "SSM_ID");
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

    handleModified(data) {
        const model = this.Data;
        const me = this;
        this.showConfirmation("Record already exists.Do you want to retrieve?", false, (e) => {
            if (e == 0) {
                model.Input.IsEdit = true;
                model.Input.SSM_ID = data.ssm_id;
                model.Input.SSM_Name = data.ssm_nam;
                this.props.data.SSM_Name = data.ssm_nam;
                me.loadpage(data.ssm_id);
                me.setTitle();
                this.setFocus('SSM_Name');
            }
            else if (e == 1) {
                model.Input.SSM_ID = "";
                this.setFocus('SSM_ID');
            }

        });
    }

    loadpage(ssm_id) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.PageNo = 1;
        dataInfo.PageSize = 10;
        if (ssm_id) {
            dataInfo.ssm_id = ssm_id;
        }
        else {
            dataInfo.ssm_id = this.props.data.SSM_ID;
        }
        dataInfo.pos_grp_id = this.props.data.Grp_ID;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM011SearchAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    model.Cust_CdList = r.Custdtls.map((data) => ({ ID: data.Cust_cd, Text: data.Cust_nam }));
                    model.Outlt_CdList = r.Outlt.map((data) => ({ ID: data.Outlt_cd, Text: data.Outlt_nam }));
                    model.Arena_LocatList = r.ArenaLocations.filter(data => data.act_inact_ind === true).map((data) => ({ ID: data.loc_srl, Text: data.loc_nam }));
                    model.Arena_LocatListTemp = r.ArenaLocations.map((data) => ({ ID: data.loc_srl, Text: data.loc_nam }));
                    model.Uber_UuidList = r.UberUuidList.map((data) => ({ ID: data.Uber_Uuid, Text: data.Uber_Uuid_nam }));
                    model.DefaultBookFeeType = r.BookingFeeType;
                    model.PaymentTypList = r.PaymentTypList;

                    if (r.Items.length != 0) {

                        const data = r.Items[0];
                        model.Input.SSM_ID = data.ssm_id;
                        model.Input.Grp_ID = data.pos_grp_id;
                        model.Input.SSM_Name = data.ssm_nam;
                        model.Input.Location_name = data.dflt_loc_desc;
                        model.Input.Location_latitude = data.dflt_loc_lat;
                        model.Input.Location_longitude = data.dflt_loc_lon;
                        model.Input.Location_shortname = data.dflt_loc_shrt_nam;
                        model.Input.Location_postcode = data.dflt_loc_post_cd;
                        model.Input.Location_Subzone = data.dflt_ubr_subzn_nam;
                        model.Input.Location_Accespoint = data.dflt_ubr_acspnt_nam;
                        model.Input.Booking_fee = data.bkng_fee;
                        model.Input.HandpointSN = data.hndpnt_srl_num;
                        model.Input.HandpointTermTyp = data.hndpnt_trmnl_typ;
                        model.Input.HandpointKey = data.hndpnt_key;
                        model.Input.Payment_typ = data.pos_pymnt_typ
                        model.Input.Frdm_str_id = data.frdm_str_id;
                        model.Input.Frdm_trmnl_id = data.frdm_trmnl_id;
                        model.Input.Frdm_dcc_req = data.frdm_dcc_req == "False" ? false : true;
                        
                        
                        if (!Utils.isNullOrEmpty(data.bkng_fee_typ)) {
                            model.Input.BookFeeTyp = data.bkng_fee_typ;
                        }
                        else {
                            model.Input.BookFeeTyp = model.DefaultBookFeeType.Percentage;
                        }
                        this.setCustcd(data.Cust_cd);
                        this.setUberUuid(data.ubr_org_uuid);
                        this.setOutltcd(data.Outlt_cd);
                        this.setArenaLocat(data.arena_loc_srl);
                        this.setPaymentTyp(data.pos_pymnt_typ)
                        model.Input.Status = data.ssm_status.toUpperCase() == "TRUE" ? true : false;
                        model.Input.ModifiedOn = data.mod_dttm;
                        model.Input.ModifiedBy = data.mod_by_usr_cd;
                        //this.setFocus("SSM_Name");
                    }
                    else {
                        //this.setFocus("SSM_ID");
                    }
                }
                else {

                }
            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                var dataCopyEx = this.getData();
                this.Data.DataCopy = JSON.stringify(dataCopyEx);
                me.updateUI();
            }
        });

    }
    setCustcd(value) {
        const model = this.Data;

        if (value !== null && value !== '') {
            model.Input.Cust_Cd = model.Cust_CdList.find(i => i.ID === value);
        }
        else {
            model.Input.Cust_Cd = null;
        }
        for (const itm of model.Cust_CdList) {
            itm.isSelected = false;
        }
        this.updateUI();
    }
    setOutltcd(value) {
        const model = this.Data;

        if (value !== null && value !== '') {
            model.Input.Outlt_Cd = model.Outlt_CdList.find(i => i.ID === value);
        }
        else {
            model.Input.Outlt_Cd = null;
        }
        for (const itm of model.Outlt_CdList) {
            itm.isSelected = false;
        }
        this.updateUI();
    }
    setArenaLocat(value) {
        const model = this.Data;
        if (value !== null && value !== '') {
            model.Input.Arena_Locat = model.Arena_LocatListTemp.find(i => i.ID === value);
        }
        else {
            model.Input.Arena_Locat = null;
        }
        for (const itm of model.Arena_LocatList) {
            itm.isSelected = false;
        }
        this.updateUI();
    }
    setUberUuid(value) {
        const model = this.Data;

        if (value !== null && value !== '') {
            model.Input.Uber_Uuid = model.Uber_UuidList.find(i => i.ID === value);
        }
        else {
            model.Input.Uber_Uuid = null;
            //model.Uber_UuidList[0];
        }
        for (const itm of model.Uber_UuidList) {
            itm.isSelected = false;
        }
        this.updateUI();
    }
    setPaymentTyp(value){
        const model = this.Data;
        if (value !== null && value !== '') {
            model.Input.Payment_typ = model.PaymentTypList.find(i => i.ID === value);
        }
        else {
            model.Input.Payment_typ = null;
        }
        for (const itm of model.PaymentTypList) {
            itm.isSelected = false;
        }
        this.updateUI();
    }

    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    handleDataChange() {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.showConfirmation("Unsaved changes exists. Save and proceed", false, (_e) => {
                try {
                    if (_e === 0) {
                        Utils.invokeAction({
                            owner: this,
                            formID: model.FormID,
                            controlID: model.IsEdit ? 'btn_edit' : 'btn_new',
                            callback: (e) => {
                                e = e || {};
                                me.doSave(e);
                            }
                        });
                    }
                    else if (_e === 1) {
                        this.newMode(true);
                    }
                }
                catch (ex) { }
                finally { }
            });
        }
        else {
            this.newMode(true);
        }
    }

    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.SSM_ID)) {
            this.showAlert('Please Select SSM Id', 'SSM_ID');
            return false;
        }
        if (Utils.isNullOrEmpty(model.Cust_Cd)) {
            this.showAlert('Please Select WkL Rate Config', 'Cust_Cd');
            return false;
        }
        if (Utils.isNullOrEmpty(model.Outlt_Cd)) {
            this.showAlert('Please Select Outlet Name', 'Outlt_Cd');
            return false;
        }

        return true;
    }
    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            if (model.Input.IsEdit) {
                me.showAlert("No changes has been made.", 'SSM_Name');
            }
            else {
                me.showAlert("Please Enter required fields.", 'SSM_ID');
            }

        }
    }
    doSave(e) {
         
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.stoprefresh = model.Pos_cd !== "SSM" ? 1 : 0;
            dataInfo.Mode = model.Input.IsEdit === true ? "UPDATE" : "SAVE";
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM011SaveAsync`, data: dataInfo, files: [] }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true && Utils.isNullOrEmpty(r.Message)) {
                        model.IsSaved = true;
                        me.handleSaveFollowup('Data saved successfully');
                    }
                    else if (r.IsSuccess === true && !Utils.isNullOrEmpty(r.Message)) {
                        me.handleSaveFollowup(r.Message);
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
    }
    handleSaveFollowup(msg) {
        const me = this;
        const model = this.Data;
        me.showAlert(msg);
        this.close();
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
        const model = this.Data;
        this.handleValueChange(() => this.close());
    }
    setTitle() {
        console.log("Settitle : ", this.props)
        const model = this.Data;
        const props = this.props.data;

        if (model.Input.IsEdit) {
            model.Title = `${this.props.data.Grp_Name} / SSM / ${this.props.data.SSM_Name} / Edit `;
        }
        else {
            model.Title = `${this.props.data.Grp_Name} / SSM / New `;
        }
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
    openWindow(type, InputObj) {
        const me = this;
        const model = this.Data;
        let Url = '';
        if (type === "btn_Lat_click") {
            if (!Utils.isNullOrEmpty(model.Input.Location_latitude) && !Utils.isNullOrEmpty(model.Input.Location_longitude)) {
                Url = 'SSM/SSM026';
                this.showWindow({
                    url: Url, data: { Title: this.props.data.Title, lat: model.Input.Location_latitude, lng: model.Input.Location_longitude }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                        if (e) {
                            model.Input.Location_latitude = e.lat;
                            model.Input.Location_longitude = e.lng;
                        }

                    }
                });

            } else {
                if (Utils.isNullOrEmpty(model.Input.Location_latitude)) {
                    me.showAlert("Please Select SSM Default Latitude", "Location_latitude");
                }
                else {
                    me.showAlert("Please Select SSM Default Longitude", "Location_longitude");
                }

            }
        }

    }
}