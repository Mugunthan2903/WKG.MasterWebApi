import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SMST055VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM040';
    }
    init() {
        if (Object.keys(this.Data).length !== 0)
            return;
        this._saving = false;
        const model = this.Data;
        model.FormID = "SMST055";
        model.IsSaved = false;
        model.Title = '';
        model.IsEdit = null;
        model.Loading = false
        model.DataCopy = null;
        model.TypeCodes = null;
        model.TypeCodesList = [];
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [];

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
        var rowHeight = 35;
        var rowsPerPage = Math.floor(maxHeight / rowHeight);
        model.GridInfo.PageSize += rowsPerPage;
    }

    loadInitData() {
        this.adjustPageSize();
        const me = this;
        const model = this.Data;
        const dataInfo = { Onload: "Yes" };
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM040ComboSearchAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                model.TypeCodesList = r.Srchcmbrslt.map(value => ({ ID: value.data_typ_cd, Text: value.data_typ_nam, attr: value.allw_data_add }));
                let temp = "";
                temp = r.Srchcmbrslt.find(i => i.data_typ_cd === "HMPG");
                if (temp) {
                    model.TypeCodes = { ID: temp.data_typ_cd, Text: temp.data_typ_nam, attr: temp.allw_data_add }
                    this.handleSearch();
                }

            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }

    handleSearchClear() {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        this.doSearchClear();
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            this.doSearchClear();
        }
    }

    doSearchClear() {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        model.TypeCodes = null;
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        this.setFocus("TypeCodes");
        let dataCopyEx = gridInfo.Items;
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }

    handleSearch(e) {
        const model = this.Data;
        const me = this;
        if (Utils.isNullOrEmpty(model.TypeCodes)) {
            this.showAlert('Please Select Language Type', 'TypeCodes');
            me.setFocus('TypeCodes');
            return false;
        }
        else {
            me.loadsearchData();
        }
    }
    columntextbox = (index, data , colname) => {
        return (<div>
            <cntrl.WKLTextbox mandatory={true} name={colname} value={data[colname]} onChange={(e) => this.onChangeTxt(e, index, data)} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
            </cntrl.WKLTextbox>
        </div>)
    };
    onChangeTxt = (e, index, val) => {

        const model = this.Data.DataTable;
        const Info = val || model;

        val[e.name] = e.value;
        //model.DataTable = Info;
        this.updateUI();

    }
    loadsearchData() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.data_typ_cd = model.TypeCodes !== null ? model.TypeCodes.ID : "";
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM040SearchrecordAsync`, data: dataInfo }, (Gtdata) => {
            try {
                model.Loading = false;
                model.GridInfo.Items = {};
                model.GridInfo.Items = null;
                var data = JSON.parse(Gtdata);
                var FnlData = data.Table;
                for (let icnt = 0; icnt < FnlData.length; icnt++) {
                    let obj = FnlData[icnt];
                    let Setobj = [];
                    for (let Tbval in obj) {
                        if (Tbval !== "mod_by_usr_cd" && Tbval !== "mod_dttm") {
                            let objrndr = {};
                            if (Tbval !== "data_srl" && Tbval !== "data_typ_cd") {
                                objrndr = { title: Tbval, key: 'textbox'+ Tbval, width: '50%' };
                                Setobj.push(objrndr);
                                //objrndr = { title: Tbval, key: Tbval, width: '0%' };
                            }
                            // else if (Tbval === "data_typ_cd") {
                            //    // objrndr = { title: "Type Code", key: Tbval, width: '0%' };
                            // }
                            // else {
                            //     objrndr = { title: Tbval, key: Tbval ? Tbval : "", width: '50%' };
                            // }

                        }
                    }

                    model.GridInfo.Columns = Setobj;
                }

                FnlData.forEach((element, index) => {
                    for (let Tbval in element) {
                        if (Tbval !== "mod_by_usr_cd" && Tbval !== "mod_dttm") {
                            if (Tbval !== "data_srl" && Tbval !== "data_typ_cd") {
                                //element[Tbval] = () => this.columntextbox(index, element , Tbval);
                                element['textbox' +Tbval] = () => this.columntextbox(index, element , Tbval);
                            }
                        }
                    }
                    //NewObj.textbox = () => this.columntextbox(index, element);
                    //data.textbox = () => this.columntextbox(index, data);
                });

                if (!Utils.isNullOrEmpty(model.TypeCodes)) {
                    if (model.TypeCodes.attr !== null && model.TypeCodes.attr === "True") {
                        let NewObj = {};
                        model.GridInfo.Columns.forEach((element, index) => {
                            if (element.title === "Type Code") {
                                NewObj[element.key] = model.TypeCodes.ID;
                            }
                            else {
                                NewObj[element.key] = '';
                            }
                            // NewObj.textbox = () => this.columntextbox(index, element);
                            //data.textbox = () => this.columntextbox(index, data);
                        });
                        FnlData.push(NewObj);
                    }
                }
                model.GridInfo.Items = FnlData;


                console.log("DataMaster Columns : " , model.GridInfo.Columns);
                console.log("DataMaster Items : " , model.GridInfo.Items);

            }
            catch (ex) {
                console.log(ex)
            }
            finally {
                let dataCopyEx = gridInfo.Items;
                this.Data.DataCopy = JSON.stringify(dataCopyEx);
                me.updateUI();
            }
        });
    }
    isValueChanged() {
        const model = this.Data.GridInfo;
        var gridInfo = model.Items;
        const DataCopyGrid = JSON.parse(this.Data.DataCopy);
        const temp = gridInfo.filter((e, i) => JSON.stringify(e) !== JSON.stringify(DataCopyGrid[i]));
        return temp.length > 0;
    }
    getData() {
        const model = this.Data.GridInfo;
        const gridInfo = model.Items;
        const DataCopyGrid = JSON.parse(this.Data.DataCopy);
        const dataInfo = {};
        const GridInfoval = gridInfo.filter((e, i) => JSON.stringify(e) !== JSON.stringify(DataCopyGrid[i]));
        dataInfo.DynamicValues = GridInfoval;

        return dataInfo;
    }

    isvalidSave() {
        const me = this;
        const model = this.Data.GridInfo;
        let result = true;
        try {

            const col = model.Columns;
            let fields = col.map((e) => e.key);

            for (let i = 0; i < model.Items.length; i++) {
                let item = model.Items[i];
                let en_GB_empty = true;

                if (item.en_GB === "" && item.data_srl !== "") {
                    me.showAlert("en_GB is mandatory", "");
                    result = false;
                    break;
                }
                else {
                    fields.forEach((e, j) => {

                        if (item.en_GB === "" && e !== "en_GB" && e !== "data_srl" && e !== "data_typ_cd") {
                            if (item[e] !== "") {
                                me.showAlert("en_GB is mandatory", "");
                                en_GB_empty = false;
                                return false;
                            }
                        }

                    });
                }

                if (!en_GB_empty) {
                    result = false;
                    break;
                }

            }
            if (result) {
                return true;
            }
            else {
                return false;
            }

        }
        catch (ex) {
            console.log(ex);
        }
    }

    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged()) {
            this.doSave(e);
        }
        else {
            me.showAlert("No changes has been made.");
        }

    }

    doSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isvalidSave()) {
            const dataInfo = this.getData();
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = "UPDATE";
            let pageNo = model.GridInfo.Page;
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM040SaveDataAsync`, data: dataInfo }, r => {
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
        me.showAlert('Data saved successfully');
        this.loadsearchData();
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