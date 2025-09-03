import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";


export default class SSM005 extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM005';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        this._saving = false;
        const model = this.Data;
        model.FormID = "SSM005";
        model.IsSaved = false;
        model.Title = '';
        model.IsEdit = null;
        model.Loading = false;
        model.DataCopyGrid = null;
        model.DataCopyGridChanged = null;
        model.SearchInput = {
            SSM_Name: null,
            Grp_Name: null,
        }
        model.Overallrefresh = null;
        model.Overalldate = "";
        model.Overalltime = "";
        model.GridInfo = {
            Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5
        };
        model.GridInfo.Columns = [
            { text: 'Refresh', field: 'Text', width: '10%' },
            { text: 'SSM Name', field: 'ssm_nam', width: '30%' , sort: { enabled: true } },
            { text: 'Version', field: 'ver_num', width: '10%' },
            { text: 'Scheduled Date ', field: 'setDate', width: '30%' },
            { text: 'Scheduled Time', field: 'setTime', width: '20%' },
        ];
        this.setTitle();
    }
    getMaxWindowHeight() {
        const model = this.Data;
        const gridFooter = document.querySelector(`.${model.FormID}`);
        const windowButtonArea = document.querySelector('.window-button-area');
        if (!gridFooter || !windowButtonArea) {
            return null;
        }
        const rectGridFooter = gridFooter.getBoundingClientRect();
        const rectWindowButtonArea = windowButtonArea.getBoundingClientRect();
        const distance = rectWindowButtonArea.top - rectGridFooter.bottom;
        return distance;
    }
    adjustPageSize() {
        const model = this.Data;
        var maxHeight = this.getMaxWindowHeight();
        var rowHeight = 27;
        var rowsPerPage = Math.floor(maxHeight / rowHeight);
        model.GridInfo.PageSize += rowsPerPage;
    }    

    loadInitData() {
        this.adjustPageSize();
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const dataInfo = {};
        dataInfo.PageNo = 1;
        dataInfo.PageSize = gridInfo.PageSize;
        model.Loading = true;

        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM005OnloadAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if(r){
                    model.Grp_NameList = r.GroupItems.map((data) => ({ ID: data.pos_grp_id, Text: data.pos_grp_nam }));
                    model.SSM_NameList = r.SSMItems.map((data) => ({ ID: data.ssm_id, Text: data.ssm_nam }));
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
    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
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
        const gridInfo = model.GridInfo;

        if (clearAll === true) {
            model.SearchInput.Grp_Name = null;
            model.SearchInput.SSM_Name = null;
            this.setFocus('Grp_Name');
        }
        model.Overalldate = "";
        model.Overalltime= "";
        model.Overallrefresh = false;
        gridInfo.Items = [];
        model.DataCopyGrid = JSON.stringify(gridInfo.Items)
        gridInfo.SelectedItem = null;
        this.updateUI();
    }

    loadPage(pageIndex, columnOptions = null) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        if (!Utils.isNullOrEmpty(model.SearchInput.Grp_Name)) {
            dataInfo.pos_grp_id = model.SearchInput.Grp_Name.ID;
        }
        if (!Utils.isNullOrEmpty(model.SearchInput.SSM_Name)) {
            dataInfo.ssm_id = model.SearchInput.SSM_Name.ID;
        }
        dataInfo.act_inact_ind = model.SearchInput.StatusSrch == true ? 1 : 0;
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
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM005SearchAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if(r){
                    me.fillSearchResult(r || {}, selectedItem);
                }
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
        const gridInfo = model.GridInfo;

        gridInfo.Items = r.Items.map((data) => {

            var formattedDate = null;
            var Time = "";
            var Mode = "";

            if (!Utils.isNullOrEmpty(data.schdld_date)) {
                formattedDate = new Date(data.schdld_date);
            }
            if (!Utils.isNullOrEmpty(data.schdld_time)) {
                Time = data.schdld_time;
            }
            if (Utils.isNullOrEmpty(data.rfrsh_compl) && !Utils.isNullOrEmpty(data.rfrsh_crtd)) {
                data.IsSelected = true;
                Mode = "A";
            }
            else {
                data.IsSelected = false;
                Mode = "I";
            }
            return { ...data, setDate: formattedDate, setTime: Time, Mode: Mode };

        }) || [];
        model.Overallrefresh = (gridInfo.Items.length === gridInfo.Items.count(i => i.IsSelected) && gridInfo.Items.length !== 0);
        gridInfo.Page = r.CurrentPage || 1;
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

        this.Data.DataCopyGrid = JSON.stringify(gridInfo.Items.map((data) => ({ Mode: data.Mode, setDate: data.setDate, setTime: data.setTime, ssm_id: data.ssm_id })));
        this.Data.DataCopyGridChanged = gridInfo.Items.map((data) => ({ Mode: data.Mode, setDate: data.setDate, setTime: data.setTime, ssm_id: data.ssm_id }));
    }

    setGridDateTime(type){
        const model = this.Data;
        const gridInfo = this.Data.GridInfo;
        if(type === "Overalldate"){
            gridInfo.Items = gridInfo.Items.map((data) => {return {...data, setDate : model.Overalldate}}) || [];
       }
       else{
           gridInfo.Items = gridInfo.Items.map((data) => {return {...data,setTime : model.Overalltime}}) || [];
       }
        this.updateUI();
    }

    isValueChanged() {
        const model = this.Data;
        var dataCopyEx = model.GridInfo.Items.map((data) => ({ Mode: data.Mode, setDate: data.setDate, setTime: data.setTime, ssm_id: data.ssm_id }));
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopyGrid;
    }

    getData() {
        const model = this.Data;
        let dataInfo = '';
        let dataInfoFinal = '';
        let DataTemp2 = '';
        let Temp = model.DataCopyGridChanged;
        let DataTemp = model.GridInfo.Items.filter((e, i) => e.Mode !== Temp[i].Mode);
        if(Utils.isNullOrEmpty(model.Overalldate)){
            DataTemp2 = model.GridInfo.Items.filter((e, i) => e.Mode === "A" && (e.setDate !== Temp[i].setDate || e.setTime !== Temp[i].setTime));
        }
        else{
            DataTemp2 = model.GridInfo.Items.filter((e, i) => e.Mode === "A");
        }
        const combinedArray = new Set();
        dataInfoFinal = [...DataTemp, ...DataTemp2].filter(item => {
            if (!combinedArray.has(item.ssm_id)) {
                combinedArray.add(item.ssm_id);
                return true;
            }
            return false;
        });
        let flag = true;
        dataInfo = dataInfoFinal.map((data) => {

            const dateTimeString = (data.setDate || "") + "";
            const TimeString = data.setTime === "" ? "00:00" : data.setTime;
            var sqlFormattedDate = '';

            if (!Utils.isNullOrEmpty(dateTimeString)) {

                var [_, month, day, year] = dateTimeString.split(" ");

                var [hours, minutes, seconds] = (TimeString + ":00").split(":").map(part => parseInt(part));

                sqlFormattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            }
            else{
                if (Utils.isNullOrEmpty(dateTimeString) && TimeString !== "00:00" && data.Mode ==="A") {
                    flag = false;
                }
            }            
            return { ...data, rfrsh_schdld: sqlFormattedDate };

        });
        if(flag){
            return dataInfo;
        }else{
            return [false];
        }
        
    }

    handleSave(e) {
        const me = this;
        const model = this.Data;
        const Checkdata = this.getData();
        if ((this.isValueChanged() || !Utils.isNullOrEmpty(model.Overalldate)) && (Checkdata.length !== 0)) {
            if(Checkdata[0]){
                this.doSave(e);
            }
            else{
                this.showAlert("Please select scheduled date");
            }
        }
        else {
            if (this.isValueChanged()) {
                me.showAlert("No active records to save");
            } else {
                me.showAlert("No changes has been made.");
            }
        }

    }

    doSave(e) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.Selectedrow = this.getData();
        dataInfo.rfrsh_by_usr_cd = ApiManager.getUser().ID;
        let pageNo = model.GridInfo.Page;
        model.Loading = true;
        me.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM005SaveAsync`, data: dataInfo }, r => {
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
        const gridInfo = this.Data.GridInfo;
        gridInfo.Items = [];
        model.DataCopyGrid = JSON.stringify(gridInfo.Items);
        gridInfo.SelectedItem = null;
        model.Overalldate = "";
        model.Overalltime= "";
        model.Overallrefresh = false;
        me.showAlert('Data saved successfully');
        //this.loadPage(1);
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
        model.Title = `${this.props.data.Title}`;

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
}