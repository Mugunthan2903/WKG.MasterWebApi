import { Utils, WKLMessageboxTypes, ApiManager, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SMST004VM extends VMBase {
    constructor(props) {
        super(props);
        console.log('This is props ', props)
        this.init();
        this._WebApi = 'Test';
    }

    //Iniatialise 
    init() {
        if (Object.keys(this.Data).length != 0)
            return;

        this._saving = false;
        const model = this.Data;
        model.FormID = "SMPL004";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            SMST003_PosGroupId: 0,
            SMST003_Name: '',
            SMST003_PosCode: null,
            SMST003_LangCodes: [],
            SMST003_DefatLangCode: null,
            SMST003_DefatLangCodeList: [],
            Status: null,
            ModifiedOn: null,
            ModifiedBy: '',
            File_Upload : '',
            IsSelected:true,
            Time24hr:'',
            ColorPicker:'',
            IsEdit: false
        };
        model.SearchInput = {
            SMST003_ScrhName: '',
            IsActive: true,
        };
        model.SMST003_PosCodeList = [];
        model.SMST003_LangCodesList = [];
        model.SMST003_DefatLangCodeList = [];

        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 15 };
        model.GridInfo.Columns = [

            { text: 'Name', field: 'pos_grp_nam', width: '40%' },
            { text: 'PosCode', field: 'pos_cd', width: '40%' },
            { text: 'Status', field: 'act_inact_ind', width: '20%' },
        ];
        this.newMode(false);
    }
    //For set focus 
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    // For set the value on initial load
    newMode(setFocus = true, callback) {
        const model = this.Data;
        //model.Input.IsEdit = false;
        model.Input = {
            SMST003_PosGroupId: 0,
            SMST003_Name: '',
            SMST003_PosCode: null,
            SMST003_LangCodes: [],
            SMST003_DefatLangCode: null,
            SMST003_DefatLangCodeList: [],
            Status: true,
            ModifiedOn: null,
            ModifiedBy: '',
            IsEdit: false,
        };
        for (const itm of model.SMST003_LangCodesList)
            itm.isSelected = false;

        this.setTitle();
        if (setFocus === true)
            this.setFocus('SMST003_Name');


        for (const itm of model.SMST003_LangCodesList)
            itm.isSelected = false;

        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
        Utils.invoke(callback);
    }
    //Ajax call to set valuse on inital load
    loadInitData() {
        //this.loadPage();
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/TestOnloadAsync`, data: dataInfo }, (r) => {
            try {
                console.log('datainfo ', r);
                model.Loading = false;
                let langlist = new Set();
                model.SMST003_PosCodeList = r.PosItem.map((data) => ({ ID: data.pos_cd_mast, Text: data.pos_nam_mast }))
                model.SMST003_LangCodesList = r.LangItem.map((data) => ({ ID: data.lang_cds_mast, Text: data.lang_name_mast }));

                me.fillSearchResult(r.Items || {});
            }

            catch (ex) { console.log('ex', ex) }
            finally {
                me.updateUI();
                this.setFocus('SMST003_Name');
                console.log('datainfo Language codes', model.SMST003_LangCodesList);
            }
        });
    }
    //call the search function
    handleSearch() {
        const me = this;
        me.loadPage(1, () => me.setFocus('SMST003_ScrhName'));

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
            model.SearchInput.SMST003_ScrhName = '';
            model.SearchInput.IsActive = true;
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;

        if (clearAll === true)
            this.setFocus('SMST003_ScrhName');
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
            text: Utils.getMessage(msgNo)
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
    //For show toaster
    showToaster(msgNo = 4, callback) {
        const me = this;
        this.Data.ShowToast = true;
        let msg = '';
        if (typeof msgNo === 'number') {
            msg: Utils.getMessage(msgNo)
        }
        else {
            msg = msgNo;
        }
        this.Data.ToastConfig = {
            onClose: () => {
                me.Data.ShowToast = false;
                try {
                    Utils.invoke(callback);
                }
                catch (ex) { }
                finally {
                    me.updateUI();
                }
            },
            title: 'Confirmation',
            message: msg,//Utils.getMessage(msgNo),
            toasterType: 'info',
        };
        this.updateUI();
    }
    //For ajax call to search 
    loadPage(pageIndex, callback) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.pos_grp_nam = model.SearchInput.SMST003_ScrhName;
        dataInfo.act_inact_ind = model.SearchInput.IsActive == true ? 1 : 0;
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/TestSearchAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                me.fillSearchResult(r || {}, selectedItem);
                Utils.invoke(callback);
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }
    //For set values in the grid 
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.map((data) => {
            if (data.act_inact_ind.toUpperCase() == 'TRUE') {
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
    //For retaining values
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.pos_grp_id = model.SMST003_PosGroupId === '' ? '' : parseInt(model.SMST003_PosGroupId);
        dataInfo.pos_grp_nam = model.SMST003_Name;
        dataInfo.act_inact_ind = model.Status == true ? 1 : 0;

        if (!Utils.isNullOrEmpty(model.SMST003_PosCode)) {
            dataInfo.pos_cd = model.SMST003_PosCode.ID;
        }
        if (!Utils.isNullOrEmpty(model.SMST003_DefatLangCode)) {
            dataInfo.dflt_lang_cd = model.SMST003_DefatLangCode.ID;
        }
        if (!Utils.isNullOrEmpty(model.SMST003_LangCodes)) {
            dataInfo.lang_cds = model.SMST003_LangCodes.map(item => item.ID).join(',');
        }

        if (!Utils.isNullOrEmpty(model.ModifiedOn)) {
            dataInfo.mod_dttm = model.ModifiedOn;
        }
        if (!Utils.isNullOrEmpty(model.ModifiedBy)) {
            dataInfo.mod_by_usr_cd = model.ModifiedBy;
        }
        dataInfo.IsEdit = this.Data.Input.IsEdit;
        console.log('dataInfo', dataInfo)
        console.log('dataInfo this.Data.Input', this.Data.Input)
        return dataInfo;

    }
    //For checking the form values are changed or not 
    isValueChanged() {
        var dataCopyEx = this.getData();
        console.log('isvalue', JSON.stringify(dataCopyEx));
        console.log('isvalue', this.Data.DataCopy);
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }

    //Show confirmation box in the value change
    handleValueChange(followUpAction) {
        const model = this.Data;
        if (this.isValueChanged()) {
            const me = this;
            this.showConfirmation("Do you want to save the current data ? (5)", true, (e) => {
                try {
                    if (e == 0) {
                        Utils.invokeAction({
                            owner: this,
                            formID: model.FormID,
                            controlID: me.Data.Input.IsEdit ? 'btn_edit' : 'btn_new',
                            callback: (e) => {
                                e = e || {};
                                if (followUpAction && typeof (followUpAction) === 'function') {
                                    e.followUpAction = followUpAction;
                                }
                                else
                                    e.followUpAction = () => this.newMode();
                                me.doSave(e);
                            }
                        });
                    }
                    else if (e == 1) {
                        if (followUpAction && typeof (followUpAction) === 'function') {
                            me.newMode();
                            followUpAction();
                        }
                        else
                            me.newMode(true);
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
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.pos_grp_id);
    }
    loadSelectedData(id) {
        const me = this;
        const model = this.Data;
        let dataInfo = {};
        dataInfo.pos_grp_id = id;
        me.Data.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${me._WebApi}/TestProductsAsync`, data: dataInfo }, (r) => {
            try {
                me.Data.Loading = false;
                if (r) {
                    r = r[0];
                    console.log('The result', model.Input);
                    model.Input.SMST003_LangCodes = [];
                    model.SMST003_DefatLangCodeList = [];
                    model.Input.SMST003_PosGroupId = r.pos_grp_id;
                    model.Input.SMST003_Name = r.pos_grp_nam;
                    model.Input.SMST003_PosCode = model.SMST003_PosCodeList.find(obj => obj.ID === r.pos_cd);

                    if (r.lang_cds !== null && r.lang_cds !== '') {
                        let lang = r.lang_cds.split(',');
                        this.clear(lang, 'multi');
                    }
                    else {
                        this.clear('multi');
                    }

                    if (r.dflt_lang_cd !== null && r.dflt_lang_cd !== '') {
                        this.clear(r.dflt_lang_cd, 'single');

                    }
                    else {
                        this.clear('single');
                    }

                    model.Input.Status = r.act_inact_ind == "True";
                    model.Input.ModifiedBy = r.mod_by_usr_cd;
                    model.Input.ModifiedOn = r.mod_dttm;
                    model.Input.IsEdit = true;
                }
                else {

                    model.Input.SMST003_PosGroupId = 0;
                    model.Input.SMST003_Name = '';
                    model.Input.SMST003_PosCode = null;
                    model.Input.SMST003_LangCodes = [];
                    model.Input.SMST003_DefatLangCode = null;
                    model.Input.Status = true;
                    model.Input.ModifiedBy = '';
                    model.Input.ModifiedOn = null;
                    model.Input.IsEdit = false;
                }

                me.setTitle();
                let dataCopyEx = this.getData();
                this.Data.DataCopy = JSON.stringify(dataCopyEx);
                this.setFocus('SMST003_Name');
            }
            catch (ex) { console.log(ex) }
            finally {
                this.updateUI();
            }
        });
    }

    clear(type) {

        const model = this.Data;
        if (type === "multi") {
            model.Input.SMST003_LangCodes = null;
            for (const itm of model.SMST003_LangCodesList)
                itm.isSelected = false;
        }
        else if (type === "single") {
            model.Input.SMST015_DfltAirport = null;
            for (const itm of model.SMST003_DefatLangCodeList) {
                itm.isSelected = false;
            }
        }
    }
    clear(value, type) {
        const model = this.Data;
        if (type === "multi") {

            value.forEach((id) => { model.Input.SMST003_LangCodes.push(model.SMST003_LangCodesList.find(i => i.ID === id)) });

            model.Input.SMST003_LangCodes = model.Input.SMST003_LangCodes.filter(item => item != undefined) || [];

            value.forEach((id) => { model.SMST003_DefatLangCodeList.push(model.SMST003_LangCodesList.find(i => i.ID === id)) });

            model.SMST003_DefatLangCodeList = model.SMST003_DefatLangCodeList.filter(item => item != undefined) || [];

            for (const itm of model.SMST003_LangCodesList)
                itm.isSelected = false;
        }
        if (type === "single") {

            model.Input.SMST003_DefatLangCode = model.SMST003_DefatLangCodeList.find(i => i.ID === value);

            for (const itm of model.SMST003_DefatLangCodeList) {
                itm.isSelected = false;
            }
        }
        this.updateUI();
    }
    setDefaultAiportList(clearAll) {

        console.log('ClearAll', clearAll)
        const me = this;
        const model = this.Data;
        let setdflt = '';
        if (clearAll === true) {
            model.Input.SMST003_DefatLangCode = null;
        }
        model.SMST003_DefatLangCodeList = [];
        if (!(Utils.isNullOrEmpty(model.Input.SMST003_LangCodes))) {

            setdflt = model.Input.SMST003_LangCodes.map(item => item.ID).join(',');

            if (setdflt !== null && setdflt !== '') {
                let airport = setdflt.split(',');
                airport.forEach(arpt => { model.SMST003_DefatLangCodeList.push(model.SMST003_LangCodesList.find(obj => obj.ID === arpt)) });
            }

        }

    }
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data;
        let isNew = true;
        if (selectedItem) {
            if (selectedItem.pos_grp_id === model.Input.SMST003_PosGroupId) {
                this.setFocus('SMST003_Name');
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
                                    controlID: model.Input.IsEdit ? 'btn_edit' : 'btn_new',
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
                        catch (ex) {

                        }
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
                                controlID: model.Input.IsEdit ? 'btn_edit' : 'btn_new',
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
                    catch (ex) {

                    }
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
    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.SMST003_Name)) {
            this.showAlert('Please Enter the Name(32)', 'SMST003_Name');
            return false;
        }
        if (Utils.isNullOrEmpty(model.SMST003_PosCode)) {
            this.showAlert('Please Enter the Code(103)', 'SMST003_PosCode');
            return false;
        }
        return true;
    }
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            let pageNo = model.GridInfo.Page;
            console.log('the datainfo', dataInfo)
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/TestSaveAsync`, data: dataInfo }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        model.IsSaved = true;
                        me.handleSaveFollowup(e);
                    }
                    else {
                        if (r.ErrorNo === -3) {
                            me.handleModified(dataInfo, e);
                        }
                        else {
                            me.showAlert('Something went wrong (1)');
                        }
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
    }
    handleModified(dataInfo, e) {
        const me = this;
        this.showConfirmation("Do you want to retry again ?(61)", false, (e) => {
            if (e == 0) {
                me.loadSelectedData(dataInfo.pos_grp_id);
            }
            else {
                if (e.followUpAction && typeof (e.followUpAction) === 'function') {
                    Utils.invoke(e.followUpAction);
                }
                else
                    me.newMode();
            }
        });
    }
    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            if (model.Input.IsEdit) {
                me.showAlert("Existing data conflict", 'SMST003_Name');
            }
            else {
                me.showAlert("Please Enter required fields(87)", 'SMST003_Name');
            }

        }
    }
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        me.showAlert('Data saved successfully (4)', 'SMST003_Name');
        this.loadPage(pageNo, () => me.newMode(true));
    }
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit)
            model.Title = ` Edit / ${model.Input.SMST003_Name}`;
        else
            model.Title = ` New `;
    }
    loadAuditWindow(e) {
        // const model = this.Data;
        // const dataInfo = { Title: 'G LAccount Master Audit', ProgramID: model.FormID };
        // this.showWindow({
        //     url: 'General/GENMADT',
        //     windowStyle: WKLWindowStyles.slideLeft,
        //     data: dataInfo
        // });
    }
    //Handle the close function
    doClose() {
        this.handleValueChange(() => this.close({ IsSaved: this.Data.IsSaved }));
    }
}