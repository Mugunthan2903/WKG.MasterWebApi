import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM200VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM200';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SSM200";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.SSMHeading = '';
        model.SSM017DefaultCarType = {};
        model.DefaultHomescreen = {};
        model.DefaultUberSupplier = {};
        model.DefaultUberPricing = {};
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
            RefreshTime: "",
            Home_screen: model.DefaultHomescreen,
            HomePage: null,
            Pos_code: null,
            Payment_typ: null,
            Country_code: null,
            bkng_fee: "",
            IsEdit: false,
            ModifiedOn: null,
            ModifiedBy: '',
        };
        model.SearchInput = {
            Grp_NameSrch: '',
            Pos_NameSrch: null,
            StatusSrch: true,
            StatusSrchSSM: true
        };

        model.LangCodesList = [];
        model.LangListTemp = [];
        model.DefatLangCodeList = [];
        model.EndPointList = [];
        model.Enabled_apisList = [];
        model.Enabled_apisListTemp = [];
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
        model.PosNameList = [];
        model.UberPricingList = [];

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
            { text: 'SSM Name', field: 'ssm_nam_mast', width: '40%', sort: { enabled: true } },
            { text: 'Default Language', field: 'dflt_lang_cd_mast', width: '35%' },
            { text: '', field: '', width: '25%' }
        ];

        this.newMode();
    }
    newMode() {
        const model = this.Data;
        const gridInfo = model.GridInfoSSM;
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
        model.Input.RefreshTime = '';
        model.Input.Pos_code = null;
        model.Input.HomePage = null;
        model.Input.Home_screen = model.DefaultHomescreen;
        model.Input.Payment_typ = null;
        model.Input.Country_code = null;
        model.Input.bkng_fee = "";
        model.Input.ModifiedOn = null;
        model.Input.ModifiedBy = '';

        model.DfltAirportList = [];
        for (const itm of model.SSMAirportsList) {
            itm.isSelected = false;
        }

        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        this.setTitle();
    }

    loadInitData() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfoGrp;
        const dataInfo = {};
        dataInfo.PageNo = 1;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.pos_grp_nam = '';
        dataInfo.act_inact_ind = 1;
        model.Loading = true;

        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM200OnloadAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    model.LangCodesList = r.LangItems.map((data) => ({ ID: data.lang_cd_mast, Text: data.lang_nam_mast }));
                    model.DefatLangCodeList = r.LangItemsAll.map((data) => ({ ID: data.lang_cd_mast, Text: data.lang_nam_mast }));
                    model.SSMAirportsList = r.AirportItem.map((data) => ({ ID: data.arpt_srl_mast, Text: data.arpt_nam_mast }));
                    model.EndPointList = r.EndpointItem.map((data) => ({ ID: data.end_pnt_nam, Text: data.end_pnt_nam }));
                    model.Enabled_apisList = r.ApiEnableItem.map((data) => ({ ID: data.supp_map_id, Text: data.supp_nam }));
                    model.PosNameList = r.PosNameList || [];
                    model.PosconfigList = r.PosNameList || [];

                    this.fillSearchResult(r);
                }
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }

    handleSearch(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        me.loadPage(1);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            me.loadPage(1);
        }
    }

    setSelectedItem(selectedItem, type) {
        const model = this.Data;
        if (type === 'GRP') {
            model.GridInfoGrp.SelectedItem = selectedItem;
            model.GridInfoGrp.SelectedItem.isSelected = true;
            this.loadSSMData();
        } else if (type === 'SSM') {
            model.GridInfoSSM.SelectedItem = selectedItem;
            model.GridInfoSSM.SelectedItem.isSelected = true;
        }
    }

    loadSSMData() {
        const model = this.Data;
        const selectedGroup = model.GridInfoGrp.SelectedItem;
        if (selectedGroup && selectedGroup.pos_grp_id) {
            const dataInfo = {
                pos_grp_id: selectedGroup.pos_grp_id
            };
            model.Loading = true;
            this.updateUI();

            Utils.ajax({ url: `${this._WebApi}/SSM200SelectAsync`, data: dataInfo }, (r) => {
                try {
                    model.Loading = false;
                    if (r && r.SSMItems) {
                        model.GridInfoSSM.Items = r.SSMItems.map((data) => ({
                            ssm_id_mast: data.ssm_id_mast,
                            ssm_nam_mast: data.ssm_nam_mast,
                            dflt_lang_cd_mast: data.dflt_lang_cd_mast,
                            ssm_status_mast: data.ssm_status_mast || 'Active'
                        })) || [];
                    }
                }
                catch (ex) { 
                    console.log(ex);
                }
                finally {
                    this.updateUI();
                }
            });
        }
    }

    filterSSMByPOS() {
        const model = this.Data;
        if (model.Input.Pos_code) {
            this.loadSSMData();
        }
    }

    handleSearchClear() {
        const me = this;
        if (this.isValueChanged()) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        me.doSearchClear(true);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            me.doSearchClear(true);
        }

    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfoGrp;

        if (clearAll === true) {
            model.SearchInput.Grp_NameSrch = '';
            model.SearchInput.Pos_NameSrch = null;
            this.setFocus('Grp_NameSrch');
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        model.GridInfoSSM.Items = [];
        model.GridInfoSSM.SelectedItem = null;
        this.updateUI();
    }

    loadPage(pageIndex, columnOptions = null) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfoGrp;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.pos_grp_nam = model.SearchInput.Grp_NameSrch?.trim() || '';
        dataInfo.pos_cd = model.SearchInput.Pos_NameSrch?.ID || '';
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
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM200SearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                me.fillSearchResult(r || {}, selectedItem);
            }
            catch (ex) {
                console.log(ex)
            }
            finally {
                me.updateUI();
            }
        });
    }

    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfoGrp;

        gridInfo.Items = r.Items.map((data) => ({
            pos_grp_id: data.pos_grp_id,
            pos_grp_nam: data.pos_grp_nam,
            act_inact_ind: data.act_inact_ind,
            Status: data.act_inact_ind == '1' ? 'Active' : 'Inactive'
        })) || [];
        gridInfo.Page = r.CurrentPage || 1;
        gridInfo.TotalPage = r.TotalPages || 0;
        gridInfo.TotalCount = r.TotalRecords || 0;
        if (gridInfo.Items.length > 0) {
            if (selectedItem !== undefined && selectedItem !== null) {
                selectedItem = gridInfo.Items.first(i => i.pos_grp_id == selectedItem.pos_grp_id);
            }
            if (selectedItem === null)
                selectedItem = gridInfo.Items[0];
        }
        if (selectedItem != null)
            selectedItem.isSelected = true;
        gridInfo.SelectedItem = selectedItem;
        
        if (selectedItem) {
            this.loadSSMData();
        }
    }

    handleDataChange(selectedItem = null, type = null) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        if (selectedItem !== null && type === "GRP")
                            me.fillInput(selectedItem);
                        else
                            me.newMode();
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            if (selectedItem !== null && type === "GRP")
                me.fillInput(selectedItem);
            else
                me.newMode();
        }
    }

    fillInput(selectedItem) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.pos_grp_id = selectedItem.pos_grp_id;
        model.Loading = true;

        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM200SelectAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r && r.Items && r.Items.length > 0) {
                    const data = r.Items[0];
                    model.Input.Grp_ID = data.pos_grp_id;
                    model.Input.Grp_Name = data.pos_grp_nam;
                    model.Input.LangCodes = me.getMultiSelectValue(data.lang_cds, model.LangCodesList);
                    model.Input.DefatLangCode = me.getSingleSelectValue(data.dflt_lang_cd, model.DefatLangCodeList);
                    model.Input.SSMAirports = me.getMultiSelectValue(data.appl_arpt_srls, model.SSMAirportsList);
                    model.Input.DfltAirport = me.getSingleSelectValue(data.dflt_arpt_srl, model.DfltAirportList);
                    model.Input.Journey_tpy = me.getSingleSelectValue(data.dflt_arpt_jrny_typ, model.Journey_tpyList);
                    model.Input.Cartpy = me.getSingleSelectValue(data.dflt_car_typ, model.CartpyList);
                    model.Input.Uberallcars = data.ubr_all_cars === '1';
                    model.Input.UberSupplier = me.getSingleSelectValue(data.ubr_supp, model.UberSupplierList);
                    model.Input.EndPoint = me.getSingleSelectValue(data.end_pnt_nam, model.EndPointList);
                    model.Input.Tui_cities = me.getTourCityValue(data.tui_city_cds);
                    model.Input.Enabled_apis = me.getMultiSelectValue(data.apis_enbld, model.Enabled_apisList);
                    model.Input.RefreshTime = data.auto_rfrsh_tm || '';
                    model.Input.Pos_code = me.getSingleSelectValue(data.pos_cd, model.PosconfigList);
                    model.Input.HomePage = me.getMultiSelectValue(data.hmpg_typ, model.HomePageList);
                    model.Input.Home_screen = me.getSingleSelectValue(data.hmpg_typ, model.Home_screenList);
                    model.Input.Payment_typ = me.getSingleSelectValue(data.pos_pymnt_typ, model.PaymentTypList);
                    model.Input.Country_code = me.getSingleSelectValue(data.pos_cntry_cd, model.CountryCodeList);
                    model.Input.bkng_fee = data.bkng_fee || "";
                    model.Input.Status = data.act_inact_ind === '1';
                    model.Input.ModifiedOn = data.mod_dttm;
                    model.Input.ModifiedBy = data.mod_by_usr_cd;
                    model.Input.IsEdit = true;
                    model.SSMHeading = data.pos_grp_nam;

                    this.setDefaultAiportList(false);

                    if (r.SSMItems) {
                        model.GridInfoSSM.Items = r.SSMItems.map((data) => ({
                            ssm_id_mast: data.ssm_id_mast,
                            ssm_nam_mast: data.ssm_nam_mast,
                            dflt_lang_cd_mast: data.dflt_lang_cd_mast,
                            ssm_status_mast: data.ssm_status_mast || 'Active'
                        })) || [];
                    }
                }
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }

    getSingleSelectValue(value, list) {
        if (Utils.isNullOrEmpty(value) || !list || list.length === 0)
            return null;
        return list.find(i => i.ID === value) || null;
    }

    getMultiSelectValue(value, list) {
        if (Utils.isNullOrEmpty(value) || !list || list.length === 0)
            return null;
        const ids = value.split(',');
        return list.filter(i => ids.includes(i.ID)) || null;
    }

    getTourCityValue(value) {
        if (Utils.isNullOrEmpty(value))
            return null;
        const ids = value.split(',');
        return ids.map(id => ({ ID: id, Text: id }));
    }

    setDefaultAiportList(updateFilter = false) {
        const model = this.Data;
        model.DfltAirportList = [];
        if (model.Input.SSMAirports && Array.isArray(model.Input.SSMAirports)) {
            model.DfltAirportList = model.Input.SSMAirports.map(item => ({ ID: item.ID, Text: item.Text }));
        }
        if (updateFilter && model.Input.DfltAirport) {
            const found = model.DfltAirportList.find(i => i.ID === model.Input.DfltAirport.ID);
            if (!found) {
                model.Input.DfltAirport = null;
            }
        }
    }

    onBlurSrch(name, value) {
        const model = this.Data;
        if (name === "Home_screen") {
            model.DefaultHomescreen = value;
            model.Input.HomePage = null;
        }
    }

    handleDistribusion() {
        // Not applicable for SSM200 as distribution fields are removed
    }

    gridloadSSM(pageIndex, columnOptions = null, statusChanged = false) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfoSSM;
        const selectedGroup = model.GridInfoGrp.SelectedItem;
        
        if (!selectedGroup) return;

        const dataInfo = {};
        dataInfo.pos_grp_id = selectedGroup.pos_grp_id;
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.act_inact_ind = model.SearchInput.StatusSrchSSM ? 1 : 0;

        model.Loading = true;
        this.updateUI();
        
        Utils.ajax({ url: `${this._WebApi}/SSM200SelectAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r && r.SSMItems) {
                    model.GridInfoSSM.Items = r.SSMItems.map((data) => ({
                        ssm_id_mast: data.ssm_id_mast,
                        ssm_nam_mast: data.ssm_nam_mast,
                        dflt_lang_cd_mast: data.dflt_lang_cd_mast,
                        ssm_status_mast: data.ssm_status_mast || 'Active'
                    })) || [];
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

    isValueChanged() {
        const model = this.Data;
        return JSON.stringify(this.getData()) !== this.Data.DataCopy;
    }

    getData() {
        const model = this.Data;
        const dataInfo = {};
        dataInfo.pos_grp_id = model.Input.Grp_ID || '';
        dataInfo.pos_grp_nam = model.Input.Grp_Name || '';
        dataInfo.pos_cd = model.Input.Pos_code?.ID || '';
        dataInfo.lang_cds = model.Input.LangCodes ? model.Input.LangCodes.map(i => i.ID).join(',') : '';
        dataInfo.dflt_lang_cd = model.Input.DefatLangCode?.ID || '';
        dataInfo.end_pnt_nam = model.Input.EndPoint?.ID || '';
        dataInfo.tui_city_cds = model.Input.Tui_cities ? model.Input.Tui_cities.map(i => i.ID).join(',') : '';
        dataInfo.auto_rfrsh_tm = model.Input.RefreshTime || '';
        dataInfo.apis_enbld = model.Input.Enabled_apis ? model.Input.Enabled_apis.map(i => i.ID).join(',') : '';
        dataInfo.hmpg_typ = model.Input.Home_screen?.ID || '';
        dataInfo.appl_arpt_srls = model.Input.SSMAirports ? model.Input.SSMAirports.map(i => i.ID).join(',') : '';
        dataInfo.dflt_arpt_srl = model.Input.DfltAirport?.ID || '';
        dataInfo.dflt_arpt_jrny_typ = model.Input.Journey_tpy?.ID || '';
        dataInfo.dflt_car_typ = model.Input.Cartpy?.ID || '';
        dataInfo.ubr_all_cars = model.Input.Uberallcars ? '1' : '0';
        dataInfo.ubr_supp = model.Input.UberSupplier?.ID || '';
        dataInfo.pos_pymnt_typ = model.Input.Payment_typ?.ID || '';
        dataInfo.pos_cntry_cd = model.Input.Country_code?.ID || '';
        dataInfo.bkng_fee = model.Input.bkng_fee || '';
        dataInfo.act_inact_ind = model.Input.Status ? '1' : '0';
        dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
        dataInfo.Mode = model.Input.IsEdit ? 'U' : 'I';

        return dataInfo;
    }

    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged() || !model.Input.IsEdit) {
            if (this.isValidData()) {
                this.doSave(e);
            }
        }
        else {
            me.showAlert("No changes has been made.");
        }

    }

    isValidData() {
        const model = this.Data;
        if (Utils.isNullOrEmpty(model.Input.Grp_Name)) {
            this.showAlert("Group Name is required", "Grp_Name");
            return false;
        }
        if (Utils.isNullOrEmpty(model.Input.Pos_code)) {
            this.showAlert("Pos Name is required", "Pos_code");
            return false;
        }
        if (Utils.isNullOrEmpty(model.Input.EndPoint)) {
            this.showAlert("End Point is required", "EndPoint");
            return false;
        }
        if (Utils.isNullOrEmpty(model.Input.Payment_typ)) {
            this.showAlert("Payment is required", "Payment_typ");
            return false;
        }
        if (Utils.isNullOrEmpty(model.Input.Country_code)) {
            this.showAlert("Country code is required", "Country_code");
            return false;
        }
        return true;
    }

    doSave(e) {
        const me = this;
        const model = this.Data;
        const dataInfo = this.getData();
        model.Loading = true;
        me.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM200SaveAsync`, data: dataInfo }, r => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess === true) {
                    model.DataCopy = JSON.stringify(me.getData());
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
        me.showAlert('Data saved successfully');
        me.newMode();
        me.loadPage(1);
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
        model.Title = `Group Master Copy / ${model.Input.IsEdit ? 'Modify' : 'New'}`;
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
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }

    openWindow(type) {
        // Implement window opening logic as needed
        console.log('Opening window:', type);
    }

    onEditclick(type, row) {
        // Implement edit functionality as needed
        console.log('Edit click:', type, row);
    }

    ManageSSM(type, row) {
        // Implement SSM management functionality as needed
        console.log('Manage SSM:', type, row);
    }
}