import { NULL } from "sass";
import { Utils, WKLMessageboxTypes, ApiManager, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SMST015VM extends VMBase {
    constructor(props) {
        super(props);
        console.log('This is props ', props)
        this.init();
        this._WebApi = 'SMST015';
    }

    //Iniatialise 
    init() {
        if (Object.keys(this.Data).length != 0)
            return;

        this._saving = false;
        const model = this.Data;
        model.FormID = "SMST015";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            SMST015_SSMSNO: 0,
            SMST015_SSMID: null,
            SMST015_To_Do: true,
            SMST015_Slide: true,
            SMST015_ConHelp: true,
            SMST015_ConFlight: true,
            SMST015_ConCancl: true,
            SMST015_SSM_loc_name: '',
            SMST015_SSM_loc_lat: '',
            SMST015_SSM_loc_lon: '',
            SMST015_SSM_loc_pstcode: '',
            SMST015_SSM_loc_shtname: '',

            SMST015_Cartpy: true,
            SMST015_Uberallcars: false,
            SMST015_Uber_Book_Fee: '',
            SMST015_Wkl_Book_Fee: '',
            SMST015_SSMAirports: null,
            SMST015_DfltAirport: null,
            SMST015_DfltJourney_tpy: false,
            SMST015_Email_req: true,
            SMST015_Status: true,
            ModifiedOn: null,
            ModifiedBy: '',
            IsEdit: false
        };
        model.SearchInput = {

            SMST015_SSMIDSrch: null,
            SMST015_StatusSrch: true,

        };
        model.AllSelected = false;
        model.SMST015_SSMIDListSrch = [];
        model.SMST015_SSMIDList = [];
        model.SMST015_SSMAirportsList = [];
        model.SMST015_DfltAirportList = [];
        model.SMST015_AirportListTemp = [];

        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 12 };
        model.GridInfo.Columns = [

            // { text: '', field: 'Text', width: '25px' },
            { text: 'SSM Name', field: 'ssm_nam', width: '50%', sort: { enabled: true } },
            { text: 'Status', field: 'act_inact_ind', width: '50%' },
        ];
        this.newMode(false);
    }

    // For set the value on initial load
    newMode(setFocus = true, callback) {
        const model = this.Data;
        model.Input.IsEdit = false;
        model.Input = {

            SMST015_SSMSNO: 0,
            SMST015_SSMID: null,
            SMST015_To_Do: true,
            SMST015_Slide: true,
            SMST015_ConHelp: true,
            SMST015_ConFlight: true,
            SMST015_ConCancl: true,
            SMST015_SSM_loc_name: '',
            SMST015_SSM_loc_lat: '',
            SMST015_SSM_loc_lon: '',
            SMST015_SSM_loc_pstcode: '',
            SMST015_SSM_loc_shtname: '',

            SMST015_Cartpy: null,
            SMST015_Uberallcars: false,
            SMST015_Uber_Book_Fee: '',
            SMST015_Wkl_Book_Fee: '',
            SMST015_SSMAirports: null,
            SMST015_DfltAirport: null,

            SMST015_DfltJourney_tpy: "D",
            SMST015_Email_req: "Y",
            SMST015_Status: true,
            ModifiedOn: null,
            ModifiedBy: '',
            IsEdit: false
        };
        model.SMST015_DfltAirportList = [];
        for (const itm of model.SMST015_SSMAirportsList) {
            itm.isSelected = false;
        }

        this.setTitle();
        if (setFocus === true)
            this.setFocus('SMST015_SSMID');

        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
        Utils.invoke(callback);
    }
    //For retaining values
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.ssm_srl = model.SMST015_SSMSNO;
        if (!Utils.isNullOrEmpty(model.SMST015_SSMID)) {
            dataInfo.ssm_id = model.SMST015_SSMID.ID;
        }
        //dataInfo.ssm_id = model.SMST015_SSMID;
        dataInfo.hmpg_car_typ = model.SMST015_Cartpy;

        dataInfo.hmpg_todo = model.SMST015_To_Do === true ? 1 : 0;
        dataInfo.hmpg_slide = model.SMST015_Slide === true ? 1 : 0;
        dataInfo.hmpg_concier_hlp = model.SMST015_ConHelp === true ? 1 : 0;
        dataInfo.hmpg_concier_flght = model.SMST015_ConFlight === true ? 1 : 0;
        dataInfo.hmpg_concier_cncl = model.SMST015_ConCancl === true ? 1 : 0;
        dataInfo.email_req = model.SMST015_Email_req === true ? 1 : 0;
        dataInfo.arpt_jrny_typ = model.SMST015_DfltJourney_tpy;
        dataInfo.ubr_all_cars = model.SMST015_Uberallcars === true ? 1 : 0;
        if (!Utils.isNullOrEmpty(model.SMST015_DfltAirport)) {
            dataInfo.dflt_arpt_srl = model.SMST015_DfltAirport.ID;
        }
        if (!Utils.isNullOrEmpty(model.SMST015_SSMAirports)) {
            dataInfo.appl_arpt_srls = model.SMST015_SSMAirports.map(item => item.ID).join(',');
        }
        dataInfo.ubr_bkng_fee = model.SMST015_Uber_Book_Fee;
        dataInfo.mj_bkng_fee = model.SMST015_Wkl_Book_Fee;
        dataInfo.dflt_loc_desc = model.SMST015_SSM_loc_name;
        dataInfo.dflt_loc_lat = model.SMST015_SSM_loc_lat;
        dataInfo.dflt_loc_lon = model.SMST015_SSM_loc_lon;
        dataInfo.dflt_loc_post_cd = model.SMST015_SSM_loc_pstcode;
        dataInfo.dflt_loc_shrt_nam = model.SMST015_SSM_loc_shtname;
        dataInfo.act_inact_ind = model.SMST015_Status === true ? 1 : 0;
        dataInfo.mod_by_usr_cd = model.ModifiedBy;
        dataInfo.mod_dttm = model.ModifiedOn;
        dataInfo.IsEdit = this.Data.Input.IsEdit;
        return dataInfo;

    }
    //For checking the form values are changed or not 
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    //For set focus 
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    handleSearch() {
        const me = this;
        me.loadPage(1);
    }
    //Call clear function 
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    //Clear the values
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;

        if (clearAll === true) {
            model.SearchInput.SMST015_SSMIDSrch = '';
            model.SearchInput.SMST015_StatusSrch = true;
            this.setFocus('SMST015_SSMIDSrch');
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        this.updateUI();
    }
    //For show alert box 
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
    //For show confirmation box 
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

    loadInitData() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const dataInfo = {};
        dataInfo.PageNo = 1;
        dataInfo.PageSize = gridInfo.PageSize;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST015OnloadAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                model.SMST015_SSMIDListSrch = r.SSMItem.map((data) => ({ ID: data.ssm_id_mast, Text: data.ssm_nam_mast }));
                model.SMST015_SSMIDList = r.SSMItem.map((data) => ({ ID: data.ssm_id_mast, Text: data.ssm_nam_mast }));
                model.SMST015_SSMAirportsList = r.AirportItem.map((data) => ({ ID: data.arpt_srl_mast, Text: data.arpt_nam_mast }));
                model.SMST015_AirportListTemp = r.AirportItemAll.map((data) => ({ ID: data.arpt_srl_mast, Text: data.arpt_nam_mast }));
                me.fillSearchResult(r || {});
            }

            catch (ex) { }
            finally {
                me.updateUI();
                //this.setFocus('SMST015_SSMID');

            }
        });
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map((data) => {
            if (data.act_inact_ind.toUpperCase() === 'TRUE') {
                return { ...data, act_inact_ind: 'Active' };
            }
            else {
                return { ...data, act_inact_ind: 'Inactive' };
            }
        }) || [];

        gridInfo.Page = r.CurrentPage || 0;
        gridInfo.TotalPage = r.TotalPages || 0;
        gridInfo.TotalCount = r.TotalCount || 0;
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
        dataInfo.Mode = "SEARCH";
        if (!Utils.isNullOrEmpty(model.SearchInput.SMST015_SSMIDSrch)) {
            dataInfo.ssm_id = model.SearchInput.SMST015_SSMIDSrch.ID;
        }
        dataInfo.act_inact_ind = model.SearchInput.SMST015_StatusSrch == true ? 1 : 0;
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "ssm_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST015SearchAsync`, data: dataInfo }, (r) => {
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
    onBlurSrch() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.ssm_srl = this.props.data.SSMNO;
        if (!Utils.isNullOrEmpty(model.Input.SMST015_SSMID)) {
            dataInfo.ssm_id = model.Input.SMST015_SSMID.ID;
        }
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST015BlurSearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                r = r || {};
                if (r.Isavailable === true) {
                    me.handleModified(r.Items[0]);
                }
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }
    handleModified(data) {
        const model = this.Data;
        const me = this;
        this.showConfirmation("Record already exists. Do you want to retrieve?", false, (e) => {
            if (e == 0) {
                model.Input.SMST015_SSMAirports = [];
                model.SMST015_DfltAirportList = [];
                model.Input.SMST015_SSMSNO = data.ssm_srl;
                model.Input.SMST015_SSMID = model.SMST015_SSMIDList.find(obj => obj.ID === data.ssm_id);
                model.Input.SMST015_To_Do = data.hmpg_todo.toUpperCase() == "TRUE" ? true : false;
                model.Input.SMST015_Slide = data.hmpg_slide.toUpperCase() == "TRUE" ? true : false;
                model.Input.SMST015_ConHelp = data.hmpg_concier_hlp.toUpperCase() == "TRUE" ? true : false;
                model.Input.SMST015_ConFlight = data.hmpg_concier_flght.toUpperCase() == "TRUE" ? true : false;
                model.Input.SMST015_ConCancl = data.hmpg_concier_cncl.toUpperCase() == "TRUE" ? true : false;
                model.Input.SMST015_SSM_loc_name = data.dflt_loc_desc || '';
                model.Input.SMST015_SSM_loc_lat = data.dflt_loc_lat || '';
                model.Input.SMST015_SSM_loc_lon = data.dflt_loc_lon || '';
                model.Input.SMST015_SSM_loc_pstcode = data.dflt_loc_post_cd || '';
                model.Input.SMST015_SSM_loc_shtname = data.dflt_loc_shrt_nam || '';
                model.Input.SMST015_Cartpy = data.hmpg_car_typ.toUpperCase();
                model.Input.SMST015_Uberallcars = data.ubr_all_cars.toUpperCase() == "TRUE" ? true : false;
                model.Input.SMST015_Uber_Book_Fee = data.ubr_bkng_fee || '';
                model.Input.SMST015_Wkl_Book_Fee = data.mj_bkng_fee || '';
                this.clear(data.appl_arpt_srls, "multi");
                this.clear(data.dflt_arpt_srl, "single");
                model.Input.SMST015_DfltJourney_tpy = data.arpt_jrny_typ;
                model.Input.SMST015_Email_req = data.email_req.toUpperCase() == "TRUE" ? "Y" : "N";
                model.Input.SMST015_Status = data.act_inact_ind.toUpperCase() == "TRUE" ? true : false;
                model.Input.ModifiedOn = data.mod_dttm;
                model.Input.ModifiedBy = data.mod_by_usr_cd;
                model.Input.IsEdit = true;

                me.setTitle();
            }
            else {
                me.setFocus("SMST015_SSMID")
            }

        });
    }
    //For set the selected Item 
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.ssm_srl);
    }
    //Ajax call to load the selected data 
    loadSelectedData(id) {
        const me = this;
        const model = this.Data;
        let dataInfo = {};
        dataInfo.Mode = "SELECT";
        dataInfo.ssm_srl = id;
        me.Data.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${me._WebApi}/SMST015SearchAsync`, data: dataInfo }, (r) => {
            try {
                me.Data.Loading = false;
                if (r.Items) {
                    r = r.Items[0];
                    model.Input.SMST015_SSMAirports = [];
                    model.SMST015_DfltAirportList = [];
                    model.Input.SMST015_SSMSNO = r.ssm_srl;
                    model.Input.SMST015_SSMID = model.SMST015_SSMIDList.find(obj => obj.ID === r.ssm_id);;
                    model.Input.SMST015_To_Do = r.hmpg_todo.toUpperCase() == "TRUE" ? true : false;
                    model.Input.SMST015_Slide = r.hmpg_slide.toUpperCase() == "TRUE" ? true : false;
                    model.Input.SMST015_ConHelp = r.hmpg_concier_hlp.toUpperCase() == "TRUE" ? true : false;
                    model.Input.SMST015_ConFlight = r.hmpg_concier_flght.toUpperCase() == "TRUE" ? true : false;
                    model.Input.SMST015_ConCancl = r.hmpg_concier_cncl.toUpperCase() == "TRUE" ? true : false;
                    model.Input.SMST015_SSM_loc_name = r.dflt_loc_desc || '';
                    model.Input.SMST015_SSM_loc_lat = r.dflt_loc_lat || '';
                    model.Input.SMST015_SSM_loc_lon = r.dflt_loc_lon || '';
                    model.Input.SMST015_SSM_loc_pstcode = r.dflt_loc_post_cd || '';
                    model.Input.SMST015_SSM_loc_shtname = r.dflt_loc_shrt_nam || '';
                    model.Input.SMST015_Cartpy = r.hmpg_car_typ.toUpperCase();
                    model.Input.SMST015_Uberallcars = r.ubr_all_cars.toUpperCase() == "TRUE" ? true : false;
                    model.Input.SMST015_Uber_Book_Fee = r.ubr_bkng_fee || '';
                    model.Input.SMST015_Wkl_Book_Fee = r.mj_bkng_fee || '';
                    this.clear(r.appl_arpt_srls, "multi");
                    this.clear(r.dflt_arpt_srl, "single");
                    model.Input.SMST015_DfltJourney_tpy = r.arpt_jrny_typ;
                    model.Input.SMST015_Email_req = r.email_req.toUpperCase() == "TRUE" ? "Y" : "N";
                    model.Input.SMST015_Status = r.act_inact_ind.toUpperCase() == "TRUE" ? true : false;
                    model.Input.ModifiedOn = r.mod_dttm;
                    model.Input.ModifiedBy = r.mod_by_usr_cd;
                    model.Input.IsEdit = true;
                }
                else {
                    model.Input.SMST015_SSMSNO = 0;
                    model.Input.SMST015_SSMID = null;
                    model.Input.SMST015_To_Do = true;
                    model.Input.SMST015_Slide = true;
                    model.Input.SMST015_ConHelp = true;
                    model.Input.SMST015_ConFligh = true;
                    model.Input.SMST015_ConCancl = true;
                    model.Input.SMST015_SSM_loc_name = '';
                    model.Input.SMST015_SSM_loc_lat = '';
                    model.Input.SMST015_SSM_loc_lon = '';
                    model.Input.SMST015_SSM_loc_pstcode = '';
                    model.Input.SMST015_SSM_loc_shtname = '';
                    model.Input.SMST015_Cartpy = true;
                    model.Input.SMST015_Uberallcars = false;
                    model.Input.SMST015_Uber_Book_Fee = '';
                    model.Input.SMST015_Wkl_Book_Fee = '';
                    model.Input.SMST015_SSMAirports = null;
                    model.Input.SMST015_DfltAirport = null;
                    model.SMST015_DfltAirportList = null;
                    model.Input.SMST015_DfltJourney_tpy = false;
                    model.Input.SMST015_Email_req = true;
                    model.Input.SMST015_Status = true;
                    model.Input.ModifiedBy = '';
                    model.Input.ModifiedOn = null;
                    model.Input.IsEdit = false;
                }
                me.setTitle();
                let dataCopyEx = this.getData();
                this.Data.DataCopy = JSON.stringify(dataCopyEx);
                //this.setFocus('SMST015_SSMAirports');
            }
            catch (ex) { }
            finally {
                this.updateUI();
            }
        });
    }
    clear(value, type) {
        const model = this.Data;
        if (type === "multi") {
            if (value !== null && value !== '') {
                value = value.split(',');
                value.forEach((id) => { model.Input.SMST015_SSMAirports.push(model.SMST015_AirportListTemp.find(i => i.ID === id)) });
                value.forEach((id) => { model.SMST015_DfltAirportList.push(model.SMST015_AirportListTemp.find(i => i.ID === id)) });
            }
            else {
                model.Input.SMST015_SSMAirports = null;
            }
            for (const itm of model.SMST015_SSMAirportsList) {
                itm.isSelected = false;
            }
        }
        if (type === "single") {
            if (value !== null && value !== '') {
                model.Input.SMST015_DfltAirport = model.SMST015_DfltAirportList.find(i => i.ID === value);
            }
            else {
                model.Input.SMST015_DfltAirport = null;
            }
            for (const itm of model.SMST015_DfltAirportList) {
                itm.isSelected = false;
            }
        }
        this.updateUI();
    }

    setDefaultAiportList(clearAll) {
        const me = this;
        const model = this.Data;
        let setdflt = '';
        if (clearAll === true) {
            model.Input.SMST015_DfltAirport = null;
        }
        model.SMST015_DfltAirportList = [];
        if (!(Utils.isNullOrEmpty(model.Input.SMST015_SSMAirports))) {
            setdflt = model.Input.SMST015_SSMAirports.map(item => item.ID).join(',');
            if (setdflt !== null && setdflt !== '') {
                let airport = setdflt.split(',');
                airport.forEach(arpt => { model.SMST015_DfltAirportList.push(model.SMST015_AirportListTemp.find(obj => obj.ID === arpt)) });
            }
        }
    }

    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data;
        if (selectedItem) {
            if (selectedItem.ssm_srl === model.Input.SMST015_SSMSNO) {
                this.setFocus('SMST015_SSMAirports');
                return;
            }
            else {
                if (this.isValueChanged()) {
                    this.showConfirmation("Do you want to save the current data ?", true, (_e) => {
                        try {
                            if (_e === 0) {
                                Utils.invokeAction({
                                    owner: this,
                                    formID: model.FormID,
                                    controlID: model.IsEdit ? 'btn_edit' : 'btn_new',
                                    callback: (e) => {
                                        e = e || {};
                                        if (selectedItem)
                                            e.followUpAction = () => this.setSelectedItem(selectedItem, true);
                                        me.doSave(e);
                                    }
                                });
                            }
                            else if (_e === 1) {
                                if (selectedItem)
                                    this.setSelectedItem(selectedItem, true);
                                else
                                    this.newMode();
                            }
                        }
                        catch (ex) { }
                        finally { }
                    });
                }
                else {
                    if (selectedItem)
                        this.setSelectedItem(selectedItem, true);
                    else
                        this.newMode();
                }
            }

        }
        else {
            if (this.isValueChanged()) {
                this.showConfirmation("Do you want to save the current data ?", true, (_e) => {
                    try {
                        if (_e === 0) {
                            Utils.invokeAction({
                                owner: this,
                                formID: model.FormID,
                                controlID: model.IsEdit ? 'btn_edit' : 'btn_new',
                                callback: (e) => {
                                    e = e || {};
                                    if (selectedItem)
                                        e.followUpAction = () => this.setSelectedItem(selectedItem, true);
                                    me.doSave(e);
                                }
                            });
                        }
                        else if (_e === 1) {
                            if (selectedItem)
                                this.setSelectedItem(selectedItem, true);
                            else
                                this.newMode(true);
                        }
                    }
                    catch (ex) { }
                    finally { }
                });
            }
            else {
                if (selectedItem)
                    this.setSelectedItem(selectedItem, true);
                else
                    this.newMode(true);
            }
        }
    }
    //Check the empty validation
    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.SMST015_SSMID)) {
            this.showAlert('Please Select SSMName(32)', 'SMST015_SSMID');
            return false;
        }
        if (Utils.isNullOrEmpty(model.SMST015_Cartpy)) {
            this.showAlert('Please Select the Car Type(32)', 'SMST015_Cartpy');
            return false;
        }
        if (Utils.isNullOrEmpty(model.SMST015_SSM_loc_name)) {
            this.showAlert('Please Enter Location Name (103)', 'SMST015_SSM_loc_name');
            return false;
        }
        if (Utils.isNullOrEmpty(model.SMST015_SSM_loc_lat)) {
            this.showAlert('Please Enter Location Latitude', 'SMST015_SSM_loc_lat');
            return false;
        }
        if (Utils.isNullOrEmpty(model.SMST015_SSM_loc_lon)) {
            this.showAlert('Please Enter Location Longitude', 'SMST015_SSM_loc_lon');
            return false;
        }
        if (Utils.isNullOrEmpty(model.SMST015_SSM_loc_pstcode)) {
            this.showAlert('Please Enter Location Post code', 'SMST015_SSM_loc_pstcode');
            return false;
        }
        if (model.SMST015_ConFlight) {

            if (Utils.isNullOrEmpty(model.SMST015_SSMAirports) || model.SMST015_SSMAirports.length == 0) {
                this.showAlert('Please Select the SSM Airport ', 'SMST015_SSMAirports');
                return false;
            }
            if (Utils.isNullOrEmpty(model.SMST015_DfltAirport)) {
                this.showAlert('Please Select the Default Airport ', 'SMST015_DfltAirport');
                return false;
            }
            if (Utils.isNullOrEmpty(model.SMST015_DfltJourney_tpy)) {
                this.showAlert('Please Select the Default Journey Type ', 'SMST015_DfltJourney_tpy');
                return false;
            }
        }
        return true;
    }
    //For save
    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            if (model.Input.IsEdit) {
                me.showAlert("No changes has been made.", 'SMST015_SSMID');
            }
            else {
                me.showAlert("Please Enter required fields(87)", 'SMST015_SSMID');
            }

        }
    }
    //Ajax call for save value 
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = model.Input.IsEdit === true ? "UPDATE" : "SAVE";
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SMST015SaveAsync`, data: dataInfo }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        model.IsSaved = true;
                        me.handleSaveFollowup(e);
                    }
                    else {
                            me.showAlert('Something went wrong (1)');
                        
                    }
                }
                catch (ex) { }
                finally {
                    me.updateUI();
                }
            });
        }
    }
    //handle save success
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        me.showAlert('Data saved successfully (4)', 'SMST015_SSMID');
        this.loadPage(pageNo);
        me.newMode(true);
    }
    //Set the title
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit) {
            if (!Utils.isNullOrEmpty(model.Input.SMST015_SSMID)) {
                model.Title = `${this.props.data.Title} / Edit / ${model.Input.SMST015_SSMID.Text}`;
            }
        }
        else
            model.Title = `${this.props.data.Title} / New `;
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

    //Handle the close function
    doClose() {
        this.handleValueChange(() => this.close({ IsSaved: this.Data.IsSaved }));
    }

    openWindow(type) {
        const model = this.Data;
        let ssmname = '';
        if (!Utils.isNullOrEmpty(model.Input.SMST015_SSMID)) {
            ssmname = model.Input.SMST015_SSMID.Text;
        }
        if (type == "Heading") {
            this.showWindow({
                url: 'SSMMaster/SMST016', data: { Title: this.props.data.Title, SSMName: ssmname, SSMNO: model.Input.SMST015_SSMSNO }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

                }
            });
        }
        else if (type == "Slide") {
            this.showWindow({
                url: 'SSMMaster/SMST017', data: { Title: this.props.data.Title, SSMName: ssmname, SSMNO: model.Input.SMST015_SSMSNO }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

                }
            });
        }
        else if (type == "Todo") {
            this.showWindow({
                url: 'SSMMaster/SMST018', data: { Title: this.props.data.Title, SSMName: ssmname, SSMNO: model.Input.SMST015_SSMSNO }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

                }
            });
        }

    }
}