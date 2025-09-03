import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM010VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM010';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SSM010";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.SSMHeading = '';
        model.SSM017DefaultCarType = {};
        model.DefaultHomescreen = {};
        model.DefaultUberSupplier = {};
        model.DefaultUberPricing = {};
        model.disableDistribusion = true;
        model.Distibusion_CntryCopy = null;
        model.Distibusion_CrrgCopy = null;
        model.DBSuppMapID = null;
        model.HomeScreenTypes = null;
        model.Input = {
            Grp_ID: 0,
            Grp_Name: "",
            LangCodes: null,
            DefatLangCode: null,
            Status: null,
            SSMAirports: '',
            DfltAirport: null,
            Journey_tpy: null,
            Cartpy: null,
            Uberallcars: true,
            UberSupplier: model.DefaultUberSupplier,
            UberPricing: model.DefaultUberPricing,
            EndPoint: null,
            Tui_cities: null,
            Enabled_apis: null,
            Trms_cndtn: null,
            RefreshTime: "",
            Home_screen: model.DefaultHomescreen,
            HomePage: null,
            Pos_code: null,
            Payment_typ: null,
            Country_code: null,
            Distibusion_Cntry: null,
            Distibusion_Crrg: null,
            DstrbsnConnStn: true,
            IsEdit: false,
            ModifiedOn: null,
            ModifiedBy: '',
        };
        model.SearchInput = {
            Grp_NameSrch: '',
            StatusSrch: true,
            StatusSrchSSM: true
        };

        model.LangCodesList = [];
        model.LangListTemp = [];
        model.DefatLangCodeList = [];
        model.EndPointList = [];
        model.Enabled_apisList = [];
        model.Enabled_apisListTemp = [];
        model.Trms_cndtnList = [];
        model.Trms_cndtnListTemp = [];
        model.HomePageList = [];
        model.SSMAirportsList = [];
        model.DfltAirportList = [];
        model.AirportListTemp = [];

        model.Journey_tpyList = [];
        model.CartpyList = [];
        model.Home_screenList = [];
        model.PaymentTypList = [];
        model.CountryCodeList = [];
        model.UberSupplierList = [];
        model.PosconfigList = [];
        model.UberPricingList = [];
        model.DistibusionCntryList = [];
        model.DistibusionCrrgList = [];
        model.DistibusionCrrgListAll = [];

        model.GridInfoGrp = {
            Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 26
        };
        model.GridInfoGrp.Columns = [
            { text: 'Group Name', field: 'pos_grp_nam', width: '50%', sort: { enabled: true } },
            { text: 'Status', field: 'act_inact_ind', width: '50%' }
        ];
        model.GridInfoSSM = {
            Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 10
        };
        model.GridInfoSSM.Columns = [
            { text: 'SSM Id', field: 'ssm_id_mast', width: '25%' },
            { text: 'SSM Name', field: 'ssm_nam_mast', width: '35%', sort: { enabled: true } },
            { text: 'Status', field: 'ssm_status_mast', width: '20%' },
            { text: '', field: '', width: '20%' }
        ];


        this.newMode();
    }
    newMode() {
        const model = this.Data;
        const gridInfo = model.GridInfoSSM;
        model.Distibusion_CntryCopy = null;
        model.Distibusion_CrrgCopy = null;
        model.disableDistribusion = true;
        model.Input.Grp_ID = 0;
        model.Input.Grp_Name = "";
        model.SSMHeading = "";
        model.Input.LangCodes = null;
        model.Input.DefatLangCode = null;
        model.Input.Status = true;
        model.Input.SSMAirports = null;
        model.Input.DfltAirport = null;
        model.Input.Journey_tpy = null;
        model.Input.Cartpy = null;
        model.Input.Uberallcars = true;
        model.Input.UberSupplier = model.DefaultUberSupplier;
        model.Input.UberPricing = model.DefaultUberPricing;
        model.Input.EndPoint = null;
        model.Input.Tui_cities = null;
        model.Input.Enabled_apis = null;
        model.Input.Trms_cndtn = null;
        model.Input.RefreshTime = '';
        model.Input.Pos_code = null;
        model.Input.HomePage = null;
        model.Input.Home_screen = model.DefaultHomescreen;
        model.Input.Payment_typ = null;
        model.Input.Country_code = null;
        model.Input.Distibusion_Cntry = null;
        model.Input.Distibusion_Crrg = null;
        model.Input.DstrbsnConnStn = true;
        model.Input.ModifiedOn = null;
        model.Input.ModifiedBy = '';

        model.DfltAirportList = [];
        for (const itm of model.SSMAirportsList) {
            itm.isSelected = false;
        }
        for (const itm of model.LangCodesList) {
            itm.isSelected = false;
        }
        for (const itm of model.HomePageList) {
            itm.isSelected = false;
        }
        for (const itm of model.Enabled_apisList) {
            itm.isSelected = false;
        }
        for (const itm of model.Trms_cndtnList) {
            itm.isSelected = false;
        }
        for (const itm of model.CountryCodeList) {
            itm.isSelected = false;
        }
        for (const itm of model.DistibusionCntryList) {
            itm.isSelected = false;
        }
        for (const itm of model.DistibusionCrrgList) {
            itm.isSelected = false;
        }
        model.Input.IsEdit = false;
        model.SearchInput.StatusSrchSSM = true;
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        this.setFocus('Grp_Name');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();

    }
    getData() {
        const model = this.Data.Input;
        const dataModel = this.Data;
        const dataInfo = {};

        dataInfo.pos_grp_id = model.Grp_ID;
        dataInfo.pos_grp_nam = model.Grp_Name;
        dataInfo.pos_cd = model.Pos_code;
        if (!Utils.isNullOrEmpty(model.LangCodes)) {
            dataInfo.lang_cds = model.LangCodes.map(item => item.ID).join(',');
        }
        if (!Utils.isNullOrEmpty(model.DefatLangCode)) {
            dataInfo.dflt_lang_cd = model.DefatLangCode.ID;
        }
        if (!Utils.isNullOrEmpty(model.EndPoint)) {
            dataInfo.end_pnt_nam = model.EndPoint.ID;
        }
        if (!Utils.isNullOrEmpty(model.Tui_cities)) {
            dataInfo.tui_city_cds = model.Tui_cities.map(item => item.ID).join(',');
        }
        if (!Utils.isNullOrEmpty(model.Enabled_apis)) {
            dataInfo.apis_enbld = model.Enabled_apis.map(item => item.ID).join(',');
        }
        if (!Utils.isNullOrEmpty(model.Trms_cndtn)) {
            dataInfo.trm_appl_cds = model.Trms_cndtn.map(item => item.ID).join(',');
        }

        dataInfo.auto_rfrsh_tm = model.RefreshTime;

        if (!Utils.isNullOrEmpty(model.HomePage)) {
            dataInfo.hmpg_todo = model.HomePage.find(obj => obj.ID === 'T') ? 1 : 0;
            dataInfo.hmpg_slide = model.HomePage.find(obj => obj.ID === 'S') ? 1 : 0;
            dataInfo.hmpg_hlp = model.HomePage.find(obj => obj.ID === 'H') ? 1 : 0;
            dataInfo.hmpg_flght = model.HomePage.find(obj => obj.ID === 'F') ? 1 : 0;
            dataInfo.hmpg_cncl = model.HomePage.find(obj => obj.ID === 'C') ? 1 : 0;
        }
        else {
            dataInfo.hmpg_todo = 0;
            dataInfo.hmpg_slide = 0;
            dataInfo.hmpg_hlp = 0;
            dataInfo.hmpg_flght = 0;
            dataInfo.hmpg_cncl = 0;
        }
        if (!Utils.isNullOrEmpty(model.SSMAirports)) {
            dataInfo.appl_arpt_srls = model.SSMAirports.map(item => item.ID).join(',');
        }
        if (!Utils.isNullOrEmpty(model.DfltAirport)) {
            dataInfo.dflt_arpt_srl = model.DfltAirport.ID;
        }
        if (!Utils.isNullOrEmpty(model.Journey_tpy)) {
            dataInfo.dflt_arpt_jrny_typ = model.Journey_tpy.ID;
        }
        if (!Utils.isNullOrEmpty(model.Cartpy)) {
            dataInfo.dflt_car_typ = model.Cartpy.ID;
        }
        if (!Utils.isNullOrEmpty(model.Home_screen)) {
            dataInfo.hmpg_typ = model.Home_screen.ID;
        }
        if (!Utils.isNullOrEmpty(model.UberSupplier)) {
            dataInfo.ubr_supp = model.UberSupplier.ID;
        }
        if (!Utils.isNullOrEmpty(model.Pos_code)) {
            dataInfo.pos_cd = model.Pos_code.ID;
        }
        if (!Utils.isNullOrEmpty(model.UberPricing)) {
            dataInfo.ubr_bkngfee_dsply = model.UberPricing.ID;
        }
        if (!Utils.isNullOrEmpty(model.Payment_typ)) {
            dataInfo.pos_pymnt_typ = model.Payment_typ.ID;
        }
        if (!Utils.isNullOrEmpty(model.Country_code)) {
            dataInfo.pos_cntry_cd = model.Country_code.ID;
        }
        if (!Utils.isNullOrEmpty(model.Distibusion_Cntry)) {
            dataInfo.dstrbsn_cntry_cds = model.Distibusion_Cntry.map(item => item.ID).join(',');
        }
        if (!Utils.isNullOrEmpty(model.Distibusion_Crrg)) {
            dataInfo.dstrbsn_crrg_ids = model.Distibusion_Crrg.map(item => item.ID).join(',');
        }
        dataInfo.ubr_all_cars = model.Uberallcars === true ? 1 : 0;
        dataInfo.act_inact_ind = model.Status === true ? 1 : 0;
        dataInfo.dstrbsn_cnctd_stn = model.DstrbsnConnStn;
        dataInfo.mod_by_usr_cd = model.ModifiedBy;
        dataInfo.mod_dttm = model.ModifiedOn;

        console.log('dataInfo ', dataInfo)
        return dataInfo;
    }

    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    loadInitData() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfoGrp;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = 1;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.pos_grp_nam = model.Input.Grp_Name;
        dataInfo.act_inact_ind = model.Input.Status === true ? 1 : 0;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM010OnloadAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    model.Journey_tpyList = r.JourneyTpyeList;
                    model.HomePageList = r.HomePageList;
                    model.Home_screenList = r.HomescreenList;
                    model.UberSupplierList = r.UberSupplierList;
                    model.UberPricingList = r.UberPricingList;
                    model.CountryCodeList = r.CountryCodeList;
                    model.DistibusionCntryList = r.CountryCodeList;
                    model.DistibusionCrrgList = r.DistribusionCrrgList.filter(data => data.Default === true);
                    model.DistibusionCrrgListAll = r.DistribusionCrrgList;
                    model.DBSuppMapID = r.DBSuppMapID;
                    model.PaymentTypList = r.PaymentTypList;
                    model.CartpyList = r.CartypeList;
                    model.DefaultHomescreen = r.HomescreenList.find((data) => (data.Default === true));
                    model.DefaultUberSupplier = r.UberSupplierList.find((data) => (data.Default === true));
                    model.PosconfigList = r.PosconfigList
                    model.DefaultUberPricing = r.UberPricingList.find((data) => (data.Default === true));
                    model.SSM017DefaultCarType = r.CarType;
                    model.HomeScreenTypes = r.HomeScreenTypes;

                    model.LangCodesList = r.LangItems.map((data) => ({ ID: data.lang_cd_mast, Text: data.lang_nam_mast }));
                    model.DefatLangCodeList = r.LangItems.map((data) => ({ ID: data.lang_cd_mast, Text: data.lang_nam_mast }));
                    model.LangListTemp = r.LangItemsAll.map((data) => ({ ID: data.lang_cd_mast, Text: data.lang_nam_mast }));
                    model.SSMAirportsList = r.AirportItem.map((data) => ({ ID: data.arpt_srl_mast, Text: data.arpt_nam_mast }));
                    model.AirportListTemp = r.AirportItemAll.map((data) => ({ ID: data.arpt_srl_mast, Text: data.arpt_nam_mast }));
                    model.EndPointList = r.EndpointItem.map((data) => ({ ID: data.end_pnt_nam, Text: data.end_pnt_nam }));
                    model.Enabled_apisList = r.ApiEnableItem.filter(data => data.act_inact_ind === true).map((data) => ({ ID: data.supp_map_id, Text: data.supp_nam }));
                    model.Enabled_apisListTemp = r.ApiEnableItem.map((data) => ({ ID: data.supp_map_id, Text: data.supp_nam }));
                    model.Trms_cndtnList = r.TermsList.filter(data => data.Default === true).map((data) => ({ ID: data.ID, Text: data.Text }));
                    model.Trms_cndtnListTemp = r.TermsList.map((data) => ({ ID: data.ID, Text: data.Text }));
                    me.fillSearchResult(r || {}, selectedItem, "GRP");
                }
            }
            catch (ex) { }
            finally {
                this.newMode();
                me.updateUI();
            }
        });
        this.setFocus("Grp_NameSrch");
    }
    fillSearchResult(r, selectedItem = null, grid) {
        const model = this.Data;
        let gridInfo = '';

        if (grid === "SSM") {
            gridInfo = model.GridInfoSSM;

            gridInfo.Items = r.SSMItems.map(e => {
                if (e.ssm_status_mast === "True") {
                    return { ...e, ssm_status_mast: "Active" }
                } else {
                    return { ...e, ssm_status_mast: "Inactive" }
                }
            }) || [];
        }
        else if (grid === "GRP") {
            gridInfo = model.GridInfoGrp;

            gridInfo.Items = r.Items.map(e => {
                if (e.act_inact_ind === "True") {
                    return { ...e, act_inact_ind: "Active" }
                } else {
                    return { ...e, act_inact_ind: "Inactive" }
                }
            }) || [];

        }
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
    handleSearch() {

        const me = this;
        me.loadPage(1)
        me.setFocus('Grp_NameSrch');
    }

    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfoGrp;

        if (clearAll === true) {
            model.SearchInput.Grp_NameSrch = '';
            model.SearchInput.StatusSrch = true;
            this.setFocus('Grp_NameSrch');
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        this.updateUI();
    }
    loadPage(pageIndex, columnOptions = null, loader = true) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfoGrp;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.pos_grp_nam = model.SearchInput.Grp_NameSrch
        dataInfo.act_inact_ind = model.SearchInput.StatusSrch == true ? 1 : 0;
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "pos_grp_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        if (loader) {
            model.Loading = true;
        }
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM010SearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                me.fillSearchResult(r || {}, selectedItem, "GRP");
            }
            catch (ex) {
                console.log(ex)
            }
            finally {
                me.updateUI();
            }
        });
    }

    onBlurSrch(name, value) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.pos_grp_id = model.Input.Grp_ID;
        if (model.Input.IsEdit) {
            Utils.ajax({ url: `${this._WebApi}/SSM010BlurAsync`, data: dataInfo, files: [] }, (r) => {
                try {
                    r = r || {};
                    if (r.Isavailable === true) {
                        if (r.Items.hmpg_typ !== value?.ID)
                            me.handleModified(name, value, r.Items);
                    }
                }
                catch (ex) { }
                finally {
                    me.updateUI();
                }
            });
        }
    }

    handleModified(name, value, item) {
        const model = this.Data;
        const dataModel = this.Data.Input;
        const me = this;
        this.showConfirmation("Modifying home screen will modify data in home page config. Still do you want to proceed ?", false, (e) => {
            if (e == 0) {
                dataModel[name] = value;
            }
            else {
                dataModel[name] = model.Home_screenList.find(i => i.ID === item.hmpg_typ) || model.DefaultHomescreen;;
            }
        });
        me.updateUI();
    }
    setSelectedItem(selectedItem, grid, loadData = false) {
        const model = this.Data;
        let gridInfo = '';
        if (grid === 'SSM') {
            gridInfo = model.GridInfoSSM;
        }
        else if (grid === 'GRP') {
            gridInfo = model.GridInfoGrp;
        }
        gridInfo.SelectedItem = selectedItem;
        gridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.pos_grp_id);
    }
    loadSelectedData(id) {
        const me = this;
        const model = this.Data;
        const gridInfo = this.Data.GridInfoSSM;
        let dataInfo = {};
        dataInfo.pos_grp_id = id;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrchSSM === true ? 1 : 0;
        dataInfo.PageNo = 1;
        dataInfo.PageSize = gridInfo.PageSize;
        me.Data.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${me._WebApi}/SSM010SelectAsync`, data: dataInfo }, (r) => {
            try {
                me.Data.Loading = false;
                if (r) {
                    if (r.SSMItems.length != 0) {
                        me.fillSearchResult(r || {}, '', "SSM");
                    }
                    else {
                        gridInfo.Items = [];
                        gridInfo.Page = r.CurrentPage || 0;
                        gridInfo.TotalPage = r.TotalPages || 0;
                        gridInfo.TotalCount = r.TotalRecords || 0;
                    }
                    model.Input.HomePage = [];
                    model.Input.LangCodes = [];
                    model.Input.SSMAirports = [];
                    model.Input.Enabled_apis = [];
                    model.Input.Trms_cndtn = [];
                    model.Input.Distibusion_Cntry = [];
                    model.Input.Distibusion_Crrg = [];
                    model.DfltAirportList = [];

                    let data = r.Items[0];
                    model.Input.Grp_ID = data.pos_grp_id;
                    model.Input.Grp_Name = data.pos_grp_nam;
                    model.SSMHeading = data.pos_grp_nam;
                    model.Input.Pos_code = model.PosconfigList.find(i => i.ID === data.pos_cd) || null;

                    this.setLangValues(data.lang_cds, "multi");
                    this.setLangValues(data.dflt_lang_cd, "single");
                    this.setAirportValues(data.appl_arpt_srls, "multi");
                    this.setAirportValues(data.dflt_arpt_srl, "single");
                    this.setTuiCities(data.tui_city_cds);
                    this.setEnabledApis(data.apis_enbld);
                    this.setTermsAndCondition(data.trm_appl_cds);
                    model.disableDistribusion = data.apis_enbld?.includes(model.DBSuppMapID) ? false : true || true;
                    this.setDistribusionCntrys(data.dstrbsn_cntry_cds);
                    this.setDistribusionCrrgs(data.dstrbsn_crrg_ids);

                    model.Input.Cartpy = model.CartpyList.find(i => i.ID === data.dflt_car_typ) || null;
                    model.Input.Home_screen = model.Home_screenList.find(i => i.ID === data.hmpg_typ) || model.DefaultHomescreen;
                    model.Input.Payment_typ = model.PaymentTypList.find(i => i.ID === data.pos_pymnt_typ) || null;
                    model.Input.Country_code = model.CountryCodeList.find(i => i.ID === data.pos_cntry_cd) || null;
                    model.Input.Journey_tpy = model.Journey_tpyList.find(i => i.ID === data.dflt_arpt_jrny_typ) || null;
                    model.Input.EndPoint = model.EndPointList.find(i => i.ID === data.end_pnt_nam) || null;
                    model.Input.RefreshTime = data.auto_rfrsh_tm || "";
                    model.Input.UberSupplier = model.UberSupplierList.find(i => i.ID === data.ubr_supp) || model.DefaultUberSupplier;
                    model.Input.UberPricing = model.UberPricingList.find(i => i.ID === data.ubr_bkngfee_dsply) || model.DefaultUberPricing;
                    if (!Utils.isNullOrEmpty(data.ubr_all_cars)) {
                        model.Input.Uberallcars = data.ubr_all_cars.toUpperCase() == "TRUE" ? true : false;
                    }
                    else {
                        model.Input.Uberallcars = null;
                    }
                    if (!Utils.isNullOrEmpty(data.hmpg_todo)) {
                        if (data.hmpg_todo.toUpperCase() == "TRUE") {
                            model.Input.HomePage.push(model.HomePageList.find(obj => obj.ID === "T"));
                        }
                    }
                    if (!Utils.isNullOrEmpty(data.hmpg_slide)) {
                        if (data.hmpg_slide.toUpperCase() == "TRUE") {
                            model.Input.HomePage.push(model.HomePageList.find(obj => obj.ID === "S"));
                        }
                    }
                    if (!Utils.isNullOrEmpty(data.hmpg_hlp)) {
                        if (data.hmpg_hlp.toUpperCase() == "TRUE") {
                            model.Input.HomePage.push(model.HomePageList.find(obj => obj.ID === "H"));
                        }
                    }
                    if (!Utils.isNullOrEmpty(data.hmpg_flght)) {
                        if (data.hmpg_flght.toUpperCase() == "TRUE") {
                            model.Input.HomePage.push(model.HomePageList.find(obj => obj.ID === "F"));
                        }
                    }
                    if (!Utils.isNullOrEmpty(data.hmpg_cncl)) {
                        if (data.hmpg_cncl.toUpperCase() == "TRUE") {
                            model.Input.HomePage.push(model.HomePageList.find(obj => obj.ID === "C"));
                        }
                    }

                    if (model.Input.HomePage.length === 0) {
                        model.Input.HomePage = null;
                    }
                    console.log("Homepage", model.Input.HomePage);
                    for (const itm of model.HomePageList) {
                        itm.isSelected = false;
                    }

                    model.Input.Status = data.act_inact_ind.toUpperCase() == "TRUE" ? true : false;
                    model.Input.DstrbsnConnStn = data.dstrbsn_cnctd_stn !== false ? true : false;
                    model.Input.ModifiedOn = data.mod_dttm;
                    model.Input.ModifiedBy = data.mod_by_usr_cd;
                    model.Input.IsEdit = true;

                }
                else {

                    model.Input.Grp_ID = 0;
                    model.Input.Grp_Name = "";
                    model.Input.LangCodes = null;
                    model.Input.DefatLangCode = null;
                    model.Input.Status = true;
                    model.Input.SSMAirports = null;
                    model.Input.DfltAirport = null;
                    model.Input.Journey_tpy = null;
                    model.Input.Cartpy = null
                    model.Input.Uberallcars = true;
                    model.Input.UberSupplier = model.DefaultUberSupplier;
                    model.Input.UberPricing = model.DefaultUberPricing;
                    model.Input.Home_screen = model.DefaultHomescreen;
                    model.Input.Payment_typ = null;
                    model.Input.Country_code = null;
                    model.Input.Distibusion_Cntry = null;
                    model.Input.Distibusion_Crrg = null;
                    model.Input.DstrbsnConnStn = true;
                    model.Input.EndPoint = null;
                    model.Input.Tui_cities = null;
                    model.Input.Enabled_apis = null;
                    model.Input.Trms_cndtn = null;
                    model.Input.RefreshTime = '';
                    model.Input.Pos_code = null
                    model.Input.HomePage = null;
                    model.Input.ModifiedOn = null;
                    model.Input.ModifiedBy = '';
                    model.Input.IsEdit = false;
                }

                me.setTitle();
                let dataCopyEx = this.getData();
                this.Data.DataCopy = JSON.stringify(dataCopyEx);
                this.setFocus('Grp_Name');
            }
            catch (ex) {
                console.log(ex)
            }
            finally {
                this.updateUI();
            }
        });
    }
    handleDistribusion() {
        const me = this;
        const model = this.Data;
        const dataModel = this.Data.Input;
        if (!cntrl.Utils.isNullOrEmpty(dataModel.Enabled_apis) && dataModel.Enabled_apis.map(item => item.ID).join(',')?.includes(model.DBSuppMapID)) {
            model.disableDistribusion = false;
            if (!dataModel.Distibusion_Cntry) {
                dataModel.Distibusion_Cntry = [];
                let CntryIds = model.DistibusionCntryList.map(item => item.ID).join(',');
                if (CntryIds !== null && CntryIds !== '') {
                    CntryIds = CntryIds.split(',');
                    CntryIds.forEach((id) => { dataModel.Distibusion_Cntry.push(model.DistibusionCntryList.find(i => i.ID === id)) });
                    dataModel.Distibusion_Cntry = dataModel.Distibusion_Cntry.filter(api => api !== undefined);
                }
            }
            if (!dataModel.Distibusion_Crrg) {
                dataModel.Distibusion_Crrg = [];
                let CrrgIds = model.DistibusionCrrgList.map(item => item.ID).join(',');
                if (CrrgIds !== null && CrrgIds !== '') {
                    CrrgIds = CrrgIds.split(',');
                    CrrgIds.forEach((id) => { dataModel.Distibusion_Crrg.push(model.DistibusionCrrgList.find(i => i.ID === id)) });
                    dataModel.Distibusion_Crrg = dataModel.Distibusion_Crrg.filter(api => api !== undefined);
                }
            }
        }
        else {
            model.disableDistribusion = true;
            dataModel.Distibusion_Cntry = null;
            dataModel.Distibusion_Crrg = null;
            dataModel.DstrbsnConnStn = true;
        }
        for (const itm of model.DistibusionCntryList) {
            itm.isSelected = false;
        }
        for (const itm of model.DistibusionCrrgList) {
            itm.isSelected = false;
        }
        me.updateUI();
    }
    setDefaultAiportList(clearAll) {
        const me = this;
        const model = this.Data;
        let setdflt = '';
        if (clearAll === true) {
            model.Input.DfltAirport = null;
        }
        model.DfltAirportList = [];
        if (!(Utils.isNullOrEmpty(model.Input.SSMAirports))) {
            setdflt = model.Input.SSMAirports.map(item => item.ID).join(',');
            if (setdflt !== null && setdflt !== '') {
                let airport = setdflt.split(',');
                airport.forEach(arpt => { model.DfltAirportList.push(model.AirportListTemp.find(obj => obj.ID === arpt)) });
            }
        }
    }

    setLangValues(value, type) {
        const model = this.Data;
        if (type === "multi") {
            if (value !== null && value !== '') {
                value = value.split(',');
                value.forEach((id) => { model.Input.LangCodes.push(model.LangListTemp.find(i => i.ID === id)) });
                model.Input.LangCodes = model.Input.LangCodes.filter(lang => lang !== undefined);
            }
            else {
                model.Input.LangCodes = null;
            }
            for (const itm of model.LangCodesList) {
                itm.isSelected = false;
            }
        }
        if (type === "single") {
            if (value !== null && value !== '') {
                model.Input.DefatLangCode = model.LangListTemp.find(i => i.ID === value);
            }
            else {
                model.Input.DefatLangCode = null;
            }
            for (const itm of model.DefatLangCodeList) {
                itm.isSelected = false;
            }
        }
        this.updateUI();
    }

    setAirportValues(value, type) {
        const model = this.Data;
        if (type === "multi") {
            if (value !== null && value !== '') {
                value = value.split(',');
                value.forEach((id) => { model.Input.SSMAirports.push(model.AirportListTemp.find(i => i.ID === id)) });
                value.forEach((id) => { model.DfltAirportList.push(model.AirportListTemp.find(i => i.ID === id)) });
                model.DfltAirportList = model.DfltAirportList.filter(airlist => airlist !== undefined);
                model.Input.SSMAirports = model.Input.SSMAirports.filter(airport => airport !== undefined);
            }
            else {
                model.Input.SSMAirports = null;
            }
            for (const itm of model.SSMAirportsList) {
                itm.isSelected = false;
            }
        }
        if (type === "single") {
            if (value !== null && value !== '') {
                model.Input.DfltAirport = model.DfltAirportList.find(i => i.ID === value);
            }
            else {
                model.Input.DfltAirport = null;
            }
            for (const itm of model.DfltAirportList) {
                itm.isSelected = false;
            }
        }
        this.updateUI();
    }
    setTuiCities(value) {
        const model = this.Data;
        if (value !== null && value !== '') {
            model.Input.Tui_cities = [];
            value = value.split(',');
            value.forEach((item) => {
                let citydesc = item?.split('/');
                model.Input.Tui_cities.push({ ID: citydesc[0], Text: citydesc[1] });
            });
        }
        else {
            model.Input.Tui_cities = null;
        }

        this.updateUI();
    }
    setEnabledApis(value) {
        const model = this.Data;
        if (value !== null && value !== '') {
            value = value.split(',');
            value.forEach((id) => { model.Input.Enabled_apis.push(model.Enabled_apisListTemp.find(i => i.ID === id)) });
            model.Input.Enabled_apis = model.Input.Enabled_apis.filter(api => api !== undefined);
        }
        else {
            model.Input.Enabled_apis = null;
        }
        for (const itm of model.Enabled_apisList) {
            itm.isSelected = false;
        }

        this.updateUI();
    }
    setTermsAndCondition(value) {
        const model = this.Data;
        if (value !== null && value !== '') {
            value = value.split(',');
            value.forEach((id) => { model.Input.Trms_cndtn.push(model.Trms_cndtnListTemp.find(i => i.ID === id)) });
            model.Input.Trms_cndtn = model.Input.Trms_cndtn.filter(api => api !== undefined);
        }
        else {
            model.Input.Trms_cndtn = null;
        }
        for (const itm of model.Trms_cndtnList) {
            itm.isSelected = false;
        }

        this.updateUI();
    }
    setDistribusionCntrys(value) {
        const model = this.Data;
        if (value !== null && value !== '') {
            value = value.split(',');
            value.forEach((id) => { model.Input.Distibusion_Cntry.push(model.DistibusionCntryList.find(i => i.ID === id)) });
            model.Input.Distibusion_Cntry = model.Input.Distibusion_Cntry.filter(api => api !== undefined);
            model.Distibusion_CntryCopy = JSON.stringify(model.Input.Distibusion_Cntry);
        }
        else {
            model.Input.Distibusion_Cntry = null;
            model.Distibusion_CntryCopy = JSON.stringify(model.Input.Distibusion_Cntry);
        }
        for (const itm of model.DistibusionCntryList) {
            itm.isSelected = false;
        }
        this.updateUI();
    }
    setDistribusionCrrgs(value) {
        const model = this.Data;
        if (value !== null && value !== '') {
            value = value.split(',');
            value.forEach((id) => { model.Input.Distibusion_Crrg.push(model.DistibusionCrrgListAll.find(i => i.ID === id)) });
            model.Input.Distibusion_Crrg = model.Input.Distibusion_Crrg.filter(api => api !== undefined);
            model.Distibusion_CrrgCopy = JSON.stringify(model.Input.Distibusion_Crrg);
        }
        else {
            model.Input.Distibusion_Crrg = null;
            model.Distibusion_CrrgCopy = JSON.stringify(model.Input.Distibusion_Crrg);
        }
        for (const itm of model.DistibusionCrrgList) {
            itm.isSelected = false;
        }

        this.updateUI();
    }
    gridloadSSM(pageIndex, columnOptions = null, loader = true) {

        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfoSSM;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.pos_grp_id = model.Input.Grp_ID;
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.SortTyp = true;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrchSSM == true ? 1 : 0;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "ssm_nam_mast" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        if (loader) {
            model.Loading = true;
        }
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM011GridAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                me.fillSearchResult(r || {}, selectedItem, "SSM");
            }
            catch (ex) {
                console.log(ex)
            }
            finally {
                me.updateUI();
            }
        });
    }
    handleDataChange(selectedItem, grid) {
        const me = this;
        const model = this.Data;
        if (selectedItem) {
            if (selectedItem.pos_grp_id === model.Input.Grp_ID) {
                this.setFocus('Grp_Name');
                return;
            }
            else {
                if (this.isValueChanged()) {
                    this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (_e) => {
                        try {
                            if (_e === 0) {
                                Utils.invokeAction({
                                    owner: this,
                                    formID: model.FormID,
                                    controlID: model.IsEdit ? 'btn_edit' : 'btn_new',
                                    callback: (e) => {
                                        e = e || {};
                                        if (selectedItem)
                                            e.followUpAction = () => this.setSelectedItem(selectedItem, grid, true);
                                        me.doSave(e);

                                    }
                                });
                            }
                            else if (_e === 1) {
                                if (selectedItem)
                                    this.setSelectedItem(selectedItem, grid, true);
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
                        this.setSelectedItem(selectedItem, grid, true);
                    else
                        this.newMode();
                }
            }

        }
        else {
            if (this.isValueChanged()) {
                this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (_e) => {
                    try {
                        if (_e === 0) {
                            Utils.invokeAction({
                                owner: this,
                                formID: model.FormID,
                                controlID: model.IsEdit ? 'btn_edit' : 'btn_new',
                                callback: (e) => {
                                    e = e || {};
                                    if (selectedItem)
                                        e.followUpAction = () => this.setSelectedItem(selectedItem, grid, true);
                                    me.doSave(e);
                                }
                            });
                        }
                        else if (_e === 1) {
                            if (selectedItem)
                                this.setSelectedItem(selectedItem, grid, true);
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
                    this.setSelectedItem(selectedItem, grid, true);
                else
                    this.newMode();
            }
        }
    }
    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.Grp_Name)) {
            this.showAlert('Please Enter Group Name', () => this.setFocus('Grp_Name'));
            return false;
        }
        if (Utils.isNullOrEmpty(model.Pos_code)) {
            this.showAlert('Please Enter Pos Name', () => this.setFocus('Pos_code'));
            return false;
        }
        if (Utils.isNullOrEmpty(model.EndPoint)) {
            this.showAlert('Please Select End Point', () => this.setFocus('EndPoint'));
            return false;
        }
        if (Utils.isNullOrEmpty(model.Country_code)) {
            this.showAlert('Please Select Country', () => this.setFocus('Country_code'));
            return false;
        }
        if (Utils.isNullOrEmpty(model.Payment_typ)) {
            this.showAlert('Please Select Payment', () => this.setFocus('Payment_typ'));
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
                me.showAlert("No changes has been made.", () => this.setFocus('Grp_Name'));
            }
            else {
                me.showAlert("Please Enter required fields.", () => this.setFocus('Grp_Name'));
            }

        }
    }
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = model.Input.IsEdit === true ? "UPDATE" : "SAVE";
            if ((JSON.stringify(model.Input.Distibusion_Cntry) !== model.Distibusion_CntryCopy) || (JSON.stringify(model.Input.Distibusion_Crrg) !== model.Distibusion_CrrgCopy)) {
                dataInfo.DISBTNCHANGE = true;
            }
            else {
                dataInfo.DISBTNCHANGE = false;
            }
            // let pageNo = model.GridInfoGrp.Page;
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM010SaveAsync`, data: dataInfo }, r => {
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
    }
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfoGrp.Page;
        this.loadPage(pageNo);
        me.showAlert('Data saved successfully', () => me.newMode());
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
        if (model.Input.IsEdit) {
            model.Title = `${this.props.data.Title} / Edit / ${model.Input.Grp_Name}`;
        }
        else {
            model.Title = `${this.props.data.Title} / New `;
        }

    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    showAlert(errorMsg, callback) {
        if (typeof errorMsg === 'number')
            errorMsg = Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,
            messageboxType: WKLMessageboxTypes.question,
            onClose: callback
        };
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

    onEditclick(type, item) {
        const model = this.Data.Input;
        model.IsEdit = true;
        this.openWindow(type, item);
    }

    ManageSSM(type, item) {
        const model = this.Data.Input;
        model.IsEdit = true;
        this.openWindow(type, item);
    }

    openWindow(action, InputObj) {
        const model = this.Data;
        const me = this;
        if (this.isValueChanged()) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (_e) => {
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
                        this.openNewWindow(action, InputObj);
                    }
                }
                catch (ex) {
                    console.log("Error Open New Window : ", ex);
                }
                finally { }
            });
        }
        else {
            this.openNewWindow(action, InputObj);
        }
    }

    openNewWindow(action, InputObj) {
        const model = this.Data.Input;
        const dataModel = this.Data;
        let url = "";
        let SSM_Name = '';
        let SSM_ID = '';
        let IsEdit = '';
        let poscd = "";
        if (action === "home") {
            url = "SSM/SSM012"
        }
        else if (action === "ssm_new") {
            url = "SSM/SSM011"
            IsEdit = false;
            SSM_ID = '';
            SSM_Name = '';
            poscd = model.Pos_code.ID;
        }
        else if (action === "ssm_edit") {
            url = "SSM/SSM011"
            IsEdit = true;
            SSM_ID = InputObj.ssm_id_mast;
            SSM_Name = InputObj.ssm_nam_mast;
        }
        else if (action === "destination") {
            url = "SSM/SSM014"
        }
        else if (action === "manage_ssm") {
            url = "SSM/SSM015"
            IsEdit = true;
            SSM_ID = InputObj.ssm_id_mast;
            poscd = model.Pos_code.ID;
        }
        else if (action === "save_ssm") {
            url = "SSM/SSM019";
            IsEdit = true;
            SSM_ID = InputObj.ssm_id_mast;
            poscd =model.Pos_code.ID;
        }
        else if (action === "copy_data") {
            url = "SSM/SSM016"
        }
        else if (action === "transfer") {
            url = "SSM/SSM017"
            InputObj = dataModel.SSM017DefaultCarType;
        }
        else if (action === "banner") {
            url = "SSM/SSM018"
        }
        else if (action === "btn_Distribusion") {
            SSM_ID = InputObj.ssm_id_mast;
            SSM_Name = InputObj.ssm_nam_mast;
            url = "SSM/SSM140"
        }
        this.showWindow({
            url: url, data: { Title: this.props.data.Title, IsEdit: IsEdit, SSM_ID: SSM_ID, Poscd: poscd, SSM_Name: SSM_Name, Grp_ID: model.Grp_ID, Grp_Name: model.Grp_Name, country_Cd: model.Country_code?.ID, InputData: InputObj }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                console.log("gridloadSSM", model.Grp_ID)
                if (action === "ssm_edit" || action === "ssm_new") {
                    this.gridloadSSM(1, '', false);
                }
                else if (action === "copy_data") {
                    this.loadPage(1, '', false);
                    if (e && e.save) {
                        this.showAlert('Data copied successfully', () => this.newMode());
                    }

                }
            }
        });
    }
}   