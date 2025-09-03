import { Utils, WKLMessageboxTypes, ApiManager, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SMST017VM extends VMBase {
    constructor(props) {
        super(props);
        console.log('This is props ', props)
        this.init();
        this._WebApi = 'SMST015';
    }

    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.MultiSelectList = null;
        model.FormID = "SMST017";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {
            SMST017_SLIDESNO: 0,
            SMST017_SSMSNO: 0,
            SMST017_LangCode: null,
            SMST017_ImageName: null,
            SMST017_ImglinkTyp: null,
            SMST017_ImglinkProd: null,
            SMST017_SortOrder: null,
            SMST017_Status: null,
            ModifiedOn: null,
            ModifiedBy: '',
            IsEdit: false

        };
        model.SearchInput = {
            SMST017_StatusSrch: true,
        };
        model.SMST017_LangCodeList = [];
        model.SMST017_LangCodeListAll = [];
        model.SMST017_ImglinkTypList = [];
        model.SMST017_ImglinkProdList = [];
        model.AllSelected = false;
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 12};
        model.GridInfo.Columns = [
            // { text: '', field: 'Text', width: '10%' },
            { text: 'Language', field: 'lang_nam', width: '40%', sort: { enabled: true } },
            { text: 'Image Name', field: 'act_inact_ind', width: '30%' },
            { text: 'Status', field: 'act_inact_ind', width: '30%' }
        ];

        this.newMode();
    }
    newMode() {
        const model = this.Data;
        model.Input = {
            SMST017_SLIDESNO: 0,
            SMST017_SSMSNO: 0,
            SMST017_LangCode: null,
            SMST017_ImageName: null,
            SMST017_ImglinkTyp: null,
            SMST017_ImglinkProd: null,
            SMST017_SortOrder: null,
            SMST017_Status: true,
            ModifiedOn: null,
            ModifiedBy: '',
            IsEdit: false
        };
        this.setFocus('SMST017_LangCode');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();

    }
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.slide_srl = model.SMST017_SLIDESNO;
        dataInfo.ssm_srl = this.props.data.SSMNO;
        dataInfo.slide_img = model.SMST017_ImageName;
        if (!Utils.isNullOrEmpty(model.SMST017_LangCode)) {
            dataInfo.lang_cd = model.SMST017_LangCode.ID;
        }
        if (!Utils.isNullOrEmpty(model.SMST017_ImglinkTyp)) {
            dataInfo.form_id = model.SMST017_ImglinkTyp.ID;
        }
        if (!Utils.isNullOrEmpty(model.SMST017_ImglinkProd)) {
            dataInfo.prod_id = model.SMST017_ImglinkProd.ID;
        }
        dataInfo.sort_ordr = model.SMST017_SortOrder;
        dataInfo.act_inact_ind = model.SMST017_Status;
        dataInfo.mod_by_usr_cd = model.ModifiedBy;
        dataInfo.mod_dttm = model.ModifiedOn;
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }

    loadInitData() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST017OnloadAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                model.SMST017_LangCodeList = r.LangItems.map((data) => ({ ID: data.lang_cd_mast, Text: data.lang_nam_mast }));
                model.SMST017_ImglinkTypList = r.SlideItems.map((data) => ({ ID: data.form_id_mast, Text: data.form_nam_mast, ProdAval: data.prod_dtl_aval }));
                me.fillSearchResult(r.Items || {}, selectedItem);
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
        gridInfo.Items = r.map(e => {
            if (e.act_inact_ind === "True") {
                return { ...e, act_inact_ind: "Active" }
            } else {
                return { ...e, act_inact_ind: "Inactive" }
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
    handleSearch() {

        const me = this;
        me.loadPage(1)
    }
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }

    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        if (clearAll === true) {
            model.SearchInput.SMST017_StatusSrch = true;
        }
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        this.updateUI();
    }
    loadPage(pageIndex, columnOptions = null) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.Mode = "SEARCH";
        dataInfo.act_inact_ind = model.SearchInput.SMST017_StatusSrch;
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "lang_cd" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST017SearchAsync`, data: dataInfo, files: [] }, (r) => {
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
        if (!Utils.isNullOrEmpty(model.Input.SMST017_LangCode)) {
            dataInfo.lang_cd = model.Input.SMST017_LangCode.ID;
        }
        //model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SMST017BlurSearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                //model.Loading = false;
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
                model.Input.SMST017_SLIDESNO = data.slide_srl;
                model.Input.SMST017_SSMSNO = data.ssm_srl;
                //model.Input.SMST017_LangCode = data.ssm_srl;
                this.clear(data.lang_cd, 'lang');
                model.Input.SMST017_ImageName = data.ssm_srl;
                model.Input.SMST017_ImglinkTyp = data.ssm_srl;
                model.Input.SMST017_ImglinkProd = data.ssm_srl;
                model.Input.SMST017_SortOrder = data.ssm_srl;
                model.Input.SMST017_Status = data.act_inact_ind.toUpperCase() == "TRUE" ? true : false;
                model.Input.ModifiedOn = data.mod_dttm;
                model.Input.ModifiedBy = data.mod_by_usr_cd;
                model.Input.IsEdit = true;
            }
            else{
                me.setFocus("")
            }

        });
    }
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.slide_srl);
    }
    loadSelectedData(id) {
        const me = this;
        const model = this.Data;
        let dataInfo = {};
        dataInfo.slide_srl = id;
        me.Data.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${me._WebApi}/SMST017SearchAsync`, data: dataInfo }, (r) => {
            try {
                me.Data.Loading = false;
                if (r) {
                    r = r[0];
                    model.Input.SMST017_SLIDESNO = r.slide_srl;
                    model.Input.SMST017_SSMSNO = r.ssm_srl;
                    this.clear(r.lang_cd, 'lang');
                    model.Input.SMST017_ImageName = r.ssm_srl;
                    model.Input.SMST017_ImglinkTyp = r.ssm_srl;
                    model.Input.SMST017_ImglinkProd = r.ssm_srl;
                    model.Input.SMST017_SortOrder = r.ssm_srl;
                    model.Input.SMST017_Status = r.act_inact_ind.toUpperCase() == "TRUE" ? true : false;
                    model.Input.ModifiedOn = r.mod_dttm;
                    model.Input.ModifiedBy = r.mod_by_usr_cd;
                    model.Input.IsEdit = true;
                }
                else {
                    model.Input.SMST017_SLIDESNO = 0;
                    model.Input.SMST017_SSMSNO = 0;
                    model.Input.SMST017_LangCode = null;
                    model.Input.SMST017_ImageName = null;
                    model.Input.SMST017_ImglinkTyp = null;
                    model.Input.SMST017_ImglinkProd = null;
                    model.Input.SMST017_SortOrder = null;
                    model.Input.SMST017_Status = true;
                    model.Input.ModifiedBy = '';
                    model.Input.ModifiedOn = null;
                    model.Input.IsEdit = false;
                }

                me.setTitle();
                let dataCopyEx = this.getData();
                this.Data.DataCopy = JSON.stringify(dataCopyEx);
                //this.setFocus('SMST017_LangCode');
            }
            catch (ex) { }
            finally {
                this.updateUI();
            }
        });
    }
    clear(value, type) {
        const model = this.Data;

        if (type === "lang") {
            if (value !== null && value !== '') {
                model.Input.SMST017_LangCode = model.SMST017_LangCodeList.find(i => i.ID === value);
            }
            else {
                model.Input.SMST017_LangCode = null;
            }
            for (const itm of model.SMST017_LangCodeList) {
                itm.isSelected = false;
            }
        }
        this.updateUI();
    }
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data;
        if (selectedItem) {
            if (selectedItem.slide_srl === model.Input.SMST017_SLIDESNO) {
                this.setFocus('SMST017_LangCode');
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
    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.SMST017_LangCode)) {
            this.showAlert('Please Select Language', 'SMST017_LangCode');
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
                me.showAlert("No changes has been made.", 'SMST017_LangCode');
            }
            else {
                me.showAlert("Please Enter required fields(87)", 'SMST017_LangCode');
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
            let pageNo = model.GridInfo.Page;
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SMST017SaveAsync`, data: dataInfo }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        model.IsSaved = true;
                        me.handleSaveFollowup(pageNo);
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
    handleSaveFollowup(pageNo) {
        const me = this;
        const model = this.Data;
        me.showAlert('Data saved successfully');
        this.loadPage(pageNo);
        me.newMode(true);
    }
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit) {
            if (!Utils.isNullOrEmpty(model.Input.SMST017_LangCode)) {
                model.Title = `${this.props.data.Title} / ${this.props.data.SSMName} / Slide  / Edit  / ${model.Input.SMST017_LangCode.Text} `;
            }
            else {
                model.Title = `${this.props.data.Title} / ${this.props.data.SSMName} / Slide  / Edit`;
            }
        }
        else {
            model.Title = `${this.props.data.Title} / ${this.props.data.SSMName}  / Slide / New `;
        }
    }

    handleValueChange(followUpAction) {
        const model = this.Data;
        if (this.isValueChanged()) {
            const me = this;
            this.showConfirmation("Do you want to save the current data ?", true, (e) => {
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
    doClose() {
        this.handleValueChange(() => this.close({ IsSaved: this.Data.IsSaved }));
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
}