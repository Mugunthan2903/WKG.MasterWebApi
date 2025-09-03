import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";


export default class SSM040VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM040';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        this._saving = false;
        const model = this.Data;
        model.FormID = "SSM040";
        model.IsSaved = false;
        model.Title = '';
        model.IsEdit = null;
        model.ShowLayer = false;
        model.ShowHtmlEditor = false;
        model.EditorColorList = [];
        model.GroupList = null;
        model.EditLayerObject = {
            event: null,
            item: {}
        }
        model.HtmlLayerObject = {
            event: null,
            item: {}
        }
        model.Loading = false
        model.DataCopy = null;
        model.DataCopyfilter = null;
        model.TypeCodes = null;
        model.TypeCodeText = "";
        model.TypeCodeComboList = null;
        model.TypeCodesList = [];
        model.CarriageTypes = null;
        model.CarriageTypesList = [];
        model.CarriageDisable = true;
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [];
        model.DefaultColorList = [
            '#ff0000', '#ff5e00', '#ffe400', '#abf200', '#00d8ff', '#0055ff', '#6600ff', '#ff00dd', '#000000',
            '#ffd8d8', '#fae0d4', '#faf4c0', '#e4f7ba', '#d4f4fa', '#d9e5ff', '#e8d9ff', '#ffd9fa', '#f1f1f1',
            '#ffa7a7', '#ffc19e', '#faed7d', '#cef279', '#b2ebf4', '#b2ccff', '#d1b2ff', '#ffb2f5', '#bdbdbd',
            '#f15f5f', '#f29661', '#e5d85c', '#bce55c', '#5cd1e5', '#6699ff', '#a366ff', '#f261df', '#8c8c8c',
            '#980000', '#993800', '#998a00', '#6b9900', '#008299', '#003399', '#3d0099', '#990085', '#353535',
            '#670000', '#662500', '#665c00', '#476600', '#005766', '#002266', '#290066', '#660058', '#222222'
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
                if (r) {
                    model.TypeCodesList = r.Srchcmbrslt.map(value => ({ ID: value.data_typ_cd, Text: value.data_typ_nam, attr: value.allw_data_add, multiline: value.multln_data, html_data: value.html_data, data_grp_cd: value.data_grp_cd }));
                    model.CarriageTypesList = r.CarriageTypesList.map(data => ({ ID: data.crrg_id, Text: data.crrg_nam }));
                    model.GroupList = r.GroupList;
                    let tempList = model.TypeCodesList.reduce((acc, item) => {
                        if (!acc[item.data_grp_cd]) {
                            acc[item.data_grp_cd] = [];
                        }
                        acc[item.data_grp_cd].push(item);
                        return acc;
                    }, {});

                    tempList = Object.keys(tempList).map(key => ({
                        Key: key,
                        Items: tempList[key]
                    }));
                    model.TypeCodeComboList = tempList.sort((a, b) => model.GroupList[a.Key]?.Item2 - model.GroupList[b.Key]?.Item2);
                    let temp = "";
                    temp = r.Srchcmbrslt[0] || null;
                    if (temp) {
                        model.TypeCodes = { ID: temp.data_typ_cd, Text: temp.data_typ_nam, attr: temp.allw_data_add, multiline: temp.multln_data, html_data: temp.html_data, data_grp_cd: temp.data_grp_cd }
                        model.TypeCodeText = model.TypeCodes?.Text || "";
                        this.handleSearch();
                    }
                    me.fetchColorJson().then(colorList => {
                        if (colorList) {
                            model.EditorColorList = colorList;
                        }
                    });
                }

            }
            catch (ex) {
                console.log("error : ", ex)
            }
            finally {
                me.updateUI();
            }
        });
    }
    async fetchColorJson() {
        let params = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/json/color.json`, params);
            if (!response.ok) {
                throw new Error('Error fetching color.json');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.log("ERROR:", error);
            if (error && error.message)
                this.showAlert(error.message);
            return null;
        } finally { }
    }
    handleSearchClear() {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged() && !model.ShowLayer) {
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
        model.TypeCodeText = "";
        model.CarriageTypes = null;
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        model.ShowLayer = false;
        model.ShowHtmlEditor = false;
        this.setFocus("TypeCodes");
        let dataCopyEx = gridInfo.Items;
        this.Data.DataCopyfilter = dataCopyEx;
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }

    handleSearch(e) {
        const model = this.Data;
        const me = this;
        model.ShowLayer = false;
        model.ShowHtmlEditor = false;
        const gridInfo = model.GridInfo;
        gridInfo.Items = [];
        gridInfo.SelectedItem = null;
        let dataCopyEx = gridInfo.Items;
        this.Data.DataCopyfilter = dataCopyEx;
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();

        if (Utils.isNullOrEmpty(model.TypeCodes)) {
            this.showAlert('Please Select Language Type', 'TypeCodes');
            return false;
        }
        if ((model.TypeCodes.ID === "DSTRBSNDES" || model.TypeCodes.ID === "DSTRBSNDIF" || model.TypeCodes.ID === "DSTRBSNFCD" || model.TypeCodes.ID === "DSTRBSNFCL")) {
            model.CarriageDisable = false;
        }
        else {
            model.CarriageDisable = true;
            model.CarriageTypes = null;
        }
        if (!model.CarriageDisable && Utils.isNullOrEmpty(model.CarriageTypes)) {
            this.showAlert('Please Select Distribusion Carriage', 'CarriageTypes');
            return false;
        }
        else {
            me.loadsearchData();
        }
    }

    loadsearchData() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.data_typ_cd = model.TypeCodes !== null ? model.TypeCodes.ID : "";
        dataInfo.html_data = model.TypeCodes !== null ? model.TypeCodes.html_data : "";
        if (!model.CarriageDisable)
            dataInfo.crrg_id = model.CarriageTypes !== null ? model.CarriageTypes.ID : "";
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM040SearchrecordAsync`, data: dataInfo }, (Gtdata) => {
            try {
                model.Loading = false;
                if (Gtdata) {
                    model.GridInfo.Items = null;
                    var data = JSON.parse(Gtdata);
                    var FnlData = data.Table;
                    for (let icnt = 0; icnt < FnlData.length; icnt++) {
                        let obj = FnlData[icnt];
                        let Setobj = [];
                        let collength = 0;
                        for (let Tbval in obj) {
                            if (Tbval !== "mod_by_usr_cd" && Tbval !== "mod_dttm") {

                                if (Tbval === "data_srl") {

                                }
                                else if (Tbval === "data_typ_cd") {

                                }
                                else if (Tbval === "data_cd" && model.TypeCodes?.ID === "DSTRBSNINF") {

                                }
                                else {
                                    FnlData[icnt][Tbval] = FnlData[icnt][Tbval] || "";
                                    collength++;
                                }
                            }
                        }
                        for (let Tbval in obj) {
                            if (Tbval !== "mod_by_usr_cd" && Tbval !== "mod_dttm") {
                                let objrndr = {};
                                if (Tbval === "data_srl") {
                                    objrndr = { text: "Id", field: Tbval, width: '6%', dataType: 'numeric' };
                                }
                                else if (Tbval === "data_typ_cd") {
                                    objrndr = { text: "Type Code", field: Tbval, width: '0%', dataType: 'string' };
                                }
                                else if (Tbval === "data_cd" && model.TypeCodes?.ID === "DSTRBSNINF") {
                                    objrndr = { text: "Data Code", field: Tbval, width: '0%', dataType: 'string' };
                                }
                                else {
                                    objrndr = { text: Tbval, field: Tbval ? Tbval : "", width: `${94 / collength}%`, dataType: 'string' };
                                }
                                Setobj.push(objrndr);
                            }
                        }

                        model.GridInfo.Columns = Setobj;
                    }
                    console.log("attr", model.TypeCodes)

                    if (!Utils.isNullOrEmpty(model.TypeCodes)) {
                        if (model.TypeCodes.attr) {
                            let NewObj = {};
                            model.GridInfo.Columns.forEach(element => {
                                if (element.text === "Type Code") {
                                    NewObj[element.field] = model.TypeCodes.ID;
                                }
                                else {
                                    NewObj[element.field] = '';
                                }
                            });
                            NewObj.last = true;
                            FnlData.push(NewObj);
                        }
                    }
                    model.GridInfo.Items = FnlData;
                }
            }
            catch (ex) {
                console.log(ex)
            }
            finally {
                let dataCopyEx = gridInfo.Items;
                this.Data.DataCopy = JSON.stringify(dataCopyEx);
                this.Data.DataCopyfilter = dataCopyEx;
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
            let fields = col.map((e) => e.field);

            for (let i = 0; i < model.Items.length; i++) {
                let item = model.Items[i];
                let en_GB_empty = true;

                if (item.en_GB === "" && item.data_srl !== "") {
                    me.showAlert("en_GB is mandatory", "");
                    result = false;
                    break;
                }
                else {
                    for (let j = 0; j < fields.length; j++) {
                        if (item.en_GB === "" && fields[j] !== "en_GB" && fields[j] !== "data_srl" && fields[j] !== "data_typ_cd") {
                            if (item[fields[j]] !== "") {
                                me.showAlert("en_GB is mandatory", "");
                                en_GB_empty = false;
                                return false;
                            }
                        }
                    }
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
            dataInfo.DynamicValues = dataInfo.DynamicValues.map(({ last, ...rest }) => rest);
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = "UPDATE";
            dataInfo.html_data = model.TypeCodes?.html_data;
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
    handleLayerClose(action) {
        const model = this.Data;
        const me = this;
        if (model.ShowLayer) {
            model.ShowLayer = false;
        }
        else if (model.ShowHtmlEditor) {
            model.ShowHtmlEditor = false
        }
        me.updateUI();
    }
}