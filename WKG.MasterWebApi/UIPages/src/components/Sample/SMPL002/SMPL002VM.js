import { Utils, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SMPL002VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'GLAccount';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;

        this._saving = false;

        const model = this.Data;
        model.FormID = "GENM010";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {};
        model.SearchInput = {
            Text: '',
            Status: null,
            AccountType: null
        };
        model.StatusList = [{ ID: 'A', Text: 'Active' }, { ID: 'I', Text: 'Inactive' }];
        model.AccountTypeList = [{ ID: 'DEP-NET', Text: 'Deposit Net' }, { ID: 'DEP-TAX', Text: 'Deposit Tax' }, { ID: 'INH-MOV', Text: 'Inhouse movement' }, { ID: 'LDG-MOV', Text: 'Ledger Movement' }, { ID: '', Text: 'Others' }];
        model.TypeList = [{ ID: 'DEP-NET', Text: 'Deposit Net' }, { ID: 'DEP-TAX', Text: 'Deposit Tax' }, { ID: 'INH-MOV', Text: 'Inhouse movement' }, { ID: 'LDG-MOV', Text: 'Ledger Movement' }];
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 10 };
        model.GridInfo.Columns = [
            { text: 'Name', field: 'Text', width: '69%' },
            { text: 'Account Ref', field: 'AccountRef', width: '30%' }
        ];

        this.newMode(false);
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    showAlert(errorMsg, name, msgType = WKLMessageboxTypes.error) {
        console.log('show alert');
        if (typeof errorMsg === 'number') {
            console.log('show alert');
            errorMsg = Utils.getMessage(errorMsg);
        }

        const opts = {
            text: errorMsg,
            messageboxType: msgType
        };
        if (name) {
            opts.onClose = (_e) => {
                this.setFocus(name);
            }
        }
        this.showMessageBox(opts);
    }
    newMode(setFocus = true, callback) {
        const model = this.Data;
        model.Input.ID = 0;
        model.Input.Text = '';
        model.Input.AccountRef = '';
        model.Input.Type = null;
        model.Input.IsActive = true;
        model.Input.ModifiedOn = null;
        model.Input.IsEdit = false;
        this.setTitle();
        if (setFocus === true)
            this.setFocus('Text');

        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
        Utils.invoke(callback);

    }
    loadInitData() {
        this.loadPage(1, () => this.setFocus('Text'));
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items || [];
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
        me.loadPage(1, () => me.setFocus('SearchText'));
    }
    handleSearchClear() {
        const me = this;
        me.doSearchClear(true);
    }
    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;

        if (clearAll === true) {
            model.SearchInput.Text = '';
            model.SearchInput.Ref = '';
            model.SearchInput.Status = null;
            model.SearchInput.AccountType = null;
        }

        gridInfo.Items = [];
        gridInfo.SelectedItem = null;

        if (clearAll === true)
            this.setFocus('SearchText');
        this.updateUI();
    }
    loadPage(pageIndex, callback) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.Text = model.SearchInput.Text;
        dataInfo.AccountRef = model.SearchInput.Ref;
        if (model.SearchInput.Status)
            dataInfo.Status = model.SearchInput.Status.ID;

        dataInfo.AccountType = model.SearchInput.AccountType;

        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SearchAsync`, data: dataInfo }, (r) => {
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
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
        if (loadData === true)
            this.loadSelectedData(selectedItem.ID);
    }
    handleDataChange(selectedItem) {
        const me = this;
        const model = this.Data;
        let isNew = true;
        if (selectedItem) {
            if (selectedItem.ID === model.Input.ID) {
                this.setFocus('Text');
                return;
            }
            isNew = false;
        }

        if (this.isValueChanged()) {
            this.showConfirmation(5, true, (_e) => {
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
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit)
            model.Title = `Sample Master / Edit / ${model.Input.Text}`;
        else
            model.Title = `Sample Master / New`;
    }
    loadSelectedData(id) {
        const me = this;
        const model = this.Data;
        let dataInfo = {};
        dataInfo.ID = id;
        me.Data.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${me._WebApi}/SelectAsync`, data: dataInfo }, (r) => {
            try {
                me.Data.Loading = false;
                if (r) {
                    model.Input = r;
                    model.Input.OrgText = model.Input.Text;
                    model.Input.IsEdit = true;
                }
                else {
                    model.Input.ID = 0;
                    model.Input.Text = '';
                    model.Input.AccountRef = '';
                    model.Input.Type = null;
                    model.Input.ModifiedOn = null;
                    model.Input.IsEdit = false;
                }
                me.setTitle();

                let dataCopyEx = this.getData();
                this.Data.DataCopy = JSON.stringify(dataCopyEx);
                this.setFocus('Text');
            }
            catch (ex) { }
            finally {
                this.updateUI();
            }
        });
    }
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.ID = model.ID;
        dataInfo.Text = model.Text;
        dataInfo.AccountRef = model.AccountRef;
        dataInfo.IsTax = model.IsTax;
        dataInfo.IsFlat = model.IsFlat;
        if (!Utils.isNullOrEmpty(model.TaxValue))
            dataInfo.TaxValue = model.TaxValue;
        dataInfo.Type = model.Type;

        dataInfo.IsActive = model.IsActive;
        if (!Utils.isNullOrEmpty(model.ModifiedOn)) {
            dataInfo.ModifiedOn = model.ModifiedOn;
        }
        return dataInfo;
    }
    isvalidSave(e) {
        const model = this.Data.Input;
        if (Utils.isNullOrEmpty(model.Text)) {
            this.showAlert(32, 'Text');//Please enter name
            return false;
        }
        if (Utils.isNullOrEmpty(model.AccountRef)) {
            this.showAlert(103, 'AccountRef');//Please enter account reference
            return false;
        }
        return true;
    }
    showConfirmation(msgNo, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];

        this.showMessageBox({
            text: Utils.getMessage(msgNo),
            buttons: options,
            messageboxType: WKLMessageboxTypes.question,
            onClose: callback
        });
    }
    showToaster(msgNo = 4, callback) {
        const me = this;
        this.Data.ShowToast = true;
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
            message: Utils.getMessage(msgNo),
            toasterType: 'info',
        };
        this.updateUI();
    }
    handleSave(e) {
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            this.showToaster(87, () => this.setFocus('Text'));
        }
    }
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const dataInfo = this.getData();
            dataInfo.ModifiedBy = e.userID || 0;
            let pageNo = model.GridInfo.Page;

            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SaveAsync`, data: dataInfo }, r => {
                try {
                    model.Loading = false;
                    r = r || {};
                    if (r.IsSuccess === true) {
                        model.IsSaved = true;
                        me.handleSaveFollowup(e);
                    }
                    else {
                        if (r.ErrorNo === -1) {//Duplicate code
                            me.showAlert(104, 'ID');
                        }
                        else if (r.ErrorNo === -2) {//Modified
                            me.handleModified(dataInfo, e);
                        }
                        else if (r.ErrorNo === -3) {//Overlapping
                            me.handleModified(dataInfo, e);
                        }
                        else if (r.ErrorNo >= 241) {//Duplicate code
                            me.showAlert(r.ErrorNo, 'Type');
                        }
                        else {
                            me.showAlert(1);
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
        this.showConfirmation(61, false, (e) => {
            if (e == 0) {
                me.loadSelectedData(dataInfo.ID);
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
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        if (e.followUpAction && typeof (e.followUpAction) === 'function') {
            this.showToaster(4, e.followUpAction);
        }
        else {
            this.showToaster(4, () => me.loadPage(pageNo, () => me.newMode()));
        }
    }
    handleDelete(e) {
        const me = this;
        const model = this.Data;
        if (model.Input.IsEdit === true) {
            this.showConfirmation(2, false, (_e) => {
                if (_e == 0) {
                    me.doDelete(e);
                }
            });
        }
    }
    doDelete(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        const items = model.GridInfo.Items || [];
        if (items.length === 1) {
            pageNo -= 1;
        }
        const dataInfo = { ID: model.Input.ID, Text: model.Input.OrgText };
        model.Loading = true;
        Utils.ajax({ url: `${this._WebApi}/DeleteAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess === true) {
                    me.showToaster(3, () => {
                        me.loadPage(pageNo, () => this.newMode());
                    });
                }
                else {
                    this.showAlert(1);
                }
            }
            catch (es) { }
            finally {
                me.updateUI();
            }
        });
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    handleValueChange(followUpAction) {
        const model = this.Data;
        if (this.isValueChanged()) {
            const me = this;
            this.showConfirmation(5, true, (e) => {
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
    loadAuditWindow(e) {
        // const model = this.Data;
        // const dataInfo = { Title: 'G LAccount Master Audit', ProgramID: model.FormID };
        // this.showWindow({
        //     url: 'General/GENMADT',
        //     windowStyle: WKLWindowStyles.slideLeft,
        //     data: dataInfo
        // });
    }
    doClose() {
        this.handleValueChange(() => this.close({ IsSaved: this.Data.IsSaved }));
    }
}