import { Utils, ApiManager, WKLMessageboxTypes, WKLWindowStyles, VMBase } from "../../../wkl-components";

export default class SSM161VM extends VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SSM160';
        this.init();
    }

    init() {

        if (Object.keys(this.Data).length !== 0) {
            return
        };
        const model = this.Data;
        model.FormID = "SSM161";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false;
        model.DataCopy = null;
        model.DataCopyfilter = null;
        model.Input = { IsEdit: false };
        model.EditorColorList = [];
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5 };
        model.GridInfo.Columns = [];
        model.GridInfo.FinalItems = {};
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
    loadInitData(loading) {
        this.IniloadPage(1, "", loading);
    }


    IniloadPage(pageIndex, columnOptions = null, loading = true) {
        const me = this;
        const model = this.Data;
        this.loadsearchData();
        me.fetchColorJson().then(colorList => {
            if (colorList) {
                model.EditorColorList = colorList;
            }
        });

    }

    loadsearchData() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const dataInfo = {};
        dataInfo.trm_srl = `${this.props.data.Trms_srl}`;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM161SearchrecordAsync`, data: dataInfo }, (Gtdata) => {
            try {
                model.Loading = false;
                if (Gtdata) {
                    model.GridInfo.Items = Gtdata.LangItems;
                    model.GridInfo.Columns = Gtdata.Lang_Cd.split(',');

                    let sample = { ...model.GridInfo.Items[0] };

                    for (let i = 0; i < model.GridInfo.Columns.length; i++) {
                        let column = model.GridInfo.Columns[i];

                        let exists = model.GridInfo.Items.some(item => item.lang_cd === column);

                        if (!exists) {
                            let newItem = { ...sample };
                            newItem.lang_cd = column;
                            newItem.trm_desc = null;
                            newItem.trm_srl = this.props.data.Trms_srl;
                            newItem.recordExists = false;
                            model.GridInfo.Items.push(newItem);
                        }
                    }

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
    isvalidSave() {
        const me = this;
        const model = this.Data.GridInfo;
        let result = true;
        try {

            for (let i = 0; i < model.Items.length; i++) {
                let item = model.Items[i];
                if (item.lang_cd === "en-GB" && Utils.isNullOrEmpty(item.trm_desc)) {
                    me.showAlert("en_GB is mandatory", "");
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

    doSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isvalidSave()) {
            const dataInfo = this.getData();
            dataInfo.DynamicValues = dataInfo.DynamicValues.map(({ last, ...rest }) => rest);
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;

            console.log("dataInfo : ", dataInfo);
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM161SaveDataAsync`, data: dataInfo }, r => {
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
        this.handleValueChange(() => this.close());
    }

    setTitle() {
        const me = this;
        const model = me.Data;
        model.Title = `${this.props.data.Title} / Edit / ${this.props.data.Trms_nam}`;
    }

    setFocus(Txtbxname) {
        if (this.ComponentRef);
        this.ComponentRef.setFocus(Txtbxname);
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