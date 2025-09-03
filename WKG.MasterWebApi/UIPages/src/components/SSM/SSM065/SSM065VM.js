import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM065VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
        this._WebApi = 'SSM060';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM065";
        model.Title = '';
        model.Loading = false;
        model.indexThis = null;
        model.DataCopyInfo = null;
        model.DataCopyNotes = null;
        model.rows = [];
        model.NotesArr = [];
        model.lang_cd = this.props.data.IsEdit ? this.props.data.InputData.lang_cd : "";
        model.Input = {
            lp_srl: this.props.data.IsEdit ? this.props.data.InputData.lp_srl : "",
            info_Head: "",
            Prod_Name: "",
            info_Des: "",
            Language: null,
            ModifiedOn: null,
            ModifiedBy: "",
            IsEdit: this.props.data.IsEdit,
        };
        model.LanguageList = [];
        model.Props_Data = this.props.data.InputData;
        this.newMode();
    }
    newMode(flag = false) {
        const model = this.Data.Props_Data;
        const dataModel = this.Data.Input;
        dataModel.lp_srl = this.props.data.IsEdit ? this.props.data.InputData.lp_srl : "";
        dataModel.info_Head = '';
        dataModel.Prod_Name = '';
        dataModel.info_Des = '';
        if (flag) {
            dataModel.IsEdit = false;
            dataModel.Language = null;
        }
        else {
            dataModel.IsEdit = this.props.data.IsEdit;
            if (dataModel.IsEdit) {
                dataModel.Language = model.lang_cd;
            }
        }
        dataModel.ModifiedOn = "";
        dataModel.ModifiedBy = "";
        this.Data.NotesArr = [{ note: "", sort_ordr: "", note_srl: "" }];
        this.Data.rows = [{ note: this.rendercell1(0), sort_ordr: this.rendercell2(0), cell3: <button disabled={this.Data.NotesArr[0].note_srl === ""} type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Delete"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={() => { this.onDeleteclick(0) }}><i className="fas fa-trash" style={{ fontSize: "10px", verticalAlign: "super" }}></i></button> }];
        this.setFocus('Language');
        this.setTitle();
        const dataCopyInfo = this.getDataInfo();
        this.Data.DataCopyInfo = JSON.stringify(dataCopyInfo);
        const dataCopyNotes = this.getDataNotes();
        this.Data.DataCopyNotes = JSON.stringify(dataCopyNotes);
        this.updateUI();
    }
    getDataInfo() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.lp_srl = model.lp_srl;
        dataInfo.lp_info_head = model.info_Head;
        dataInfo.lp_prod_nam = model.Prod_Name;
        dataInfo.lp_info_desc = model.info_Des;
        if (!Utils.isNullOrEmpty(model.Language)) {
            dataInfo.lang_cd = model.Language.ID;
        }
        return dataInfo;
    }
    getDataNotes() {
        const model = this.Data;
        let temp = model.rows.map((e, i) => ({ note: model.NotesArr[i].note ?? "", sort_ordr: model.NotesArr[i].sort_ordr ?? "", note_srl: model.NotesArr[i].note_srl ?? "" }))
        temp = temp.filter(e => e.note_srl !== "" || (e.note !== "" || e.sort_ordr !== ""))
        return temp;
    }
    loadInitData(load = true) {
        const me = this;
        const model = this.Data;
        const Props = this.Data.Props_Data;
        const dataInfo = {};
        dataInfo.lp_srl = model.Input.lp_srl;
        dataInfo.lang_cd = model.lang_cd;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM065OnLoadData`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                model.LanguageList = r.LangList.map((data) => ({ ID: data.lang_cd, Text: data.lang_nam }));

                if (model.Input.IsEdit) {
                    if (r.EditGrid.length !== 0
                        && load) {
                        const info = r.EditGrid[0];
                        this.setLangauge(info.lang_cd);
                        model.Input.lp_srl = info.lp_srl;
                        model.Input.info_Head = info.lp_info_head;
                        model.Input.Prod_Name = info.lp_prod_nam;
                        model.Input.info_Des = info.lp_info_desc;
                        model.Input.ModifiedOn = info.mod_dttm;
                        model.Input.ModifiedBy = info.mod_by_usr_cd;
                    }
                    if (r.Notes.length !== 0) {
                        // model.NotesArr = r.Notes.map(data => ({ note_srl: data.note_srl, note: data.note, sort_ordr: data.sort_ordr }))
                        // model.rows = r.Notes.map((data, index) => ({ note: this.rendercell1(index), sort_ordr: this.rendercell2(index), cell3: <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Delete"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={() => { this.onDeleteclick(model.NotesArr[index].note_srl) }}><i className="fas fa-trash" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button> }));
                        me.renderNotes(r.Notes);
                        const dataCopyNotes = this.getDataNotes();
                        this.Data.DataCopyNotes = JSON.stringify(dataCopyNotes);
                    }

                }
            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                const dataCopyInfo = this.getDataInfo();
                this.Data.DataCopyInfo = JSON.stringify(dataCopyInfo);
                const dataCopyNotes = this.getDataNotes();
                this.Data.DataCopyNotes = JSON.stringify(dataCopyNotes);
                me.setTitle();
                me.updateUI();
            }
        });
    };
    addRow = (index, e) => {
        const model = this.Data;
        model.NotesArr.push({ note: "", sort_ordr: "", note_srl: "" })
        model.rows = [...model.rows, {
            note: this.rendercell1(index + 1), sort_ordr: this.rendercell2(index + 1), cell3: <button disabled={model.NotesArr[index + 1].note_srl === ""} type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Delete"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={() => { this.onDeleteclick(model.NotesArr[index + 1].note_srl) }}><i className="fas fa-trash" style={{ fontSize: "10px", verticalAlign: "super" }}></i></button>
        }];
        this.updateUI();
    };

    handleFocus = (index, e) => {
        const model = this.Data;
        if (index === model.rows.length - 1 && e.target.name === 'sort_ordr') {
            this.addRow(index, e);
        }
    };
    rendercell1 = (index) => {
        const model = this.Data;
        const value = model.NotesArr[index].note;
        return (<cntrl.WKLTextbox inputType={cntrl.WKLTextboxTypes.sentenceCase} placeholder='Enter Note' maxLength={2000} name={'note'} value={value} onChange={(ex) => this.onChangeRow(ex, index)} />);
    }
    rendercell2 = (index) => {
        const model = this.Data;
        const value = model.NotesArr[index].sort_ordr;
        return (<cntrl.WKLTextbox inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} suffix={0} prefix={4} className='sort_ordr' name="sort_ordr" value={value} onChange={(ex) => this.onChangeRow(ex, index)} />);
    }
    onChangeRow = (e, index) => {
        const model = this.Data;
        const datamodel = model.NotesArr;
        datamodel[index][e.name] = e.value;

        // Update the UI
        model.rows[index].note = this.rendercell1(index, e); // Re-render cell1 with updated value
        model.rows[index].sort_ordr = this.rendercell2(index, e); // Re-render cell2 with updated value
        model.indexThis.updateUI();
        // this.updateUI();
    };
    onDeleteclick = (note_srl) => {
        const model = this.Data;
        const me = this;
        // if (model.rows.length > 1) {
        //     model.rows.splice(index, 1);
        //     model.NotesArr.splice(index, 1);
        // }
        const dataInfo = { note_srl };
        model.Loading = true;
        const dataCopyNotes = this.getDataNotes();
        this.Data.DataCopyNotes = JSON.stringify(dataCopyNotes);
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM065DeleteData`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r.IsSuccess) {
                    // me.loadInitData(false)
                    me.handleDeleteFollowUp(note_srl)
                }
            }
            catch (ex) {
                console.log(ex);
            } finally {
                me.updateUI();
            }
        });
    }
    handleDeleteFollowUp(note_srl) {
        const model = this.Data;
        const notescopy = JSON.parse(model.DataCopyNotes);
        const temp = notescopy.filter(e => e.note_srl !== note_srl);
        this.renderNotes(temp);
        this.showAlert("Note deleted successfully");
        const dataCopyNotes = this.getDataNotes();
        this.Data.DataCopyNotes = JSON.stringify(dataCopyNotes);
        this.updateUI();

    }
    renderNotes(info) {
        info.push({ note_srl: "", note: "", sort_ordr: "", lp_srl: "" });
        const model = this.Data;
        model.NotesArr = info.map(data => ({ note_srl: data.note_srl, note: data.note, sort_ordr: data.sort_ordr }))
        model.rows = info.map((data, index) => ({ note: this.rendercell1(index), sort_ordr: this.rendercell2(index), cell3: <button disabled={model.NotesArr[index].note_srl === ""} type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Delete"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={() => { this.onDeleteclick(model.NotesArr[index].note_srl) }}><i className="fas fa-trash" style={{ fontSize: "10px", verticalAlign: "super" }}></i></button> }));
    }
    setLangauge(value) {
        const model = this.Data;

        if (value !== null && value !== '') {
            model.Input.Language = model.LanguageList.find(i => i.ID === value);
        }
        else {
            model.Input.Language = null;
        }
        for (const itm of model.LanguageList) {
            itm.isSelected = false;
        }
        this.updateUI();
    }
    onBlurSrch() {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        if (!Utils.isNullOrEmpty(model.Input.Language)) {
            dataInfo.lang_cd = model.Input.Language.ID;
        }

        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM065OnBlurSearch`, data: dataInfo, files: [] }, (r) => {
            try {
                r = r || {};
                if (r.Isavailable === true) {
                    me.handleModified(r);
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

    handleModified(data) {
        const model = this.Data;
        const me = this;
        this.showConfirmation("Record already exists.Do you want to retrieve?", false, (e) => {
            if (e == 0) {
                model.Input.IsEdit = true;
                model.Input.lp_srl = data.lp_srl;
                model.lang_cd = data.lang_cd;
                me.loadInitData();
                me.setTitle();

            }
            else if (e == 1) {
                model.Input.Language = null;
                this.setFocus('Language');
            }

        });
    }

    isValueChanged() {
        const dataCopyEx = this.getDataInfo();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopyInfo;
    }
    isNotesChanged() {
        const dataCopyEx = this.getDataNotes();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopyNotes;
    }
    handleDataChange() {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged() || this.isNotesChanged()) {
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
                        this.newMode(true);
                    }
                }
                catch (ex) { }
                finally { }
            });
        }
        else {
            this.newMode(true);
        }
    }

    isvalidSave(e) {
        const model = this.Data.Input;
        const temp = this.getDataNotes();
        let noteFlag = true;
        if (Utils.isNullOrEmpty(model.Language)) {
            this.showAlert('Please Select Language', 'Language');
            noteFlag = false;
            return noteFlag;
        }
        temp.forEach(e => {
            if (Utils.isNullOrEmpty(e.note)) {
                noteFlag = false;
            }
        });
        if (!noteFlag) {
            this.showAlert('Please Enter Note');
        }
        return noteFlag;
    }
    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isValueChanged() || this.isNotesChanged()) {
            this.doSave(e);
        }
        else {
            if (model.Input.IsEdit) {
                me.showAlert("No changes has been made.", 'Prod_Name');
            }
            else {
                me.showAlert("Please Enter required fields.", 'Language');
            }

        }
    }
    doSave(e) {
        if (this.isvalidSave(e)) {
            const me = this;
            const model = this.Data;
            const notescopyarr = JSON.parse(model.DataCopyNotes)
            let dataInfo = {};
            dataInfo = this.getDataInfo();
            const Selectedrow = this.getDataNotes();
            const notesTemp1 = Selectedrow.filter(e => e.note_srl !== "");

            const notesTemp2 = Selectedrow.filter(e => e.note_srl === "" && (e.sort_ordr !== "" || e.note !== ""));

            const Changeddata = notesTemp1.filter((e, i) => e.note !== notescopyarr[i].note || e.sort_ordr !== notescopyarr[i].sort_ordr);

            if (this.isNotesChanged()) {
                dataInfo.NotesChanged = "YES";
            } else {
                dataInfo.NotesChanged = "NO";
            }
            if (this.isValueChanged()) {
                dataInfo.InfoChanged = "YES";
            } else {
                dataInfo.InfoChanged = "NO";
            }
            dataInfo.Selectedrow = [...notesTemp2, ...Changeddata] //.map(e => ({ ...e, mode: e.note_srl === "" ? "INSERT" : "UPDATE" }))
            dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
            dataInfo.Mode = model.Input.IsEdit === true ? "UPDATE" : "INSERT";
            model.Loading = true;
            me.updateUI();
            Utils.ajax({ url: `${this._WebApi}/SSM065SaveDataAsync`, data: dataInfo }, r => {
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
        if (this.isValueChanged() || this.isNotesChanged()) {
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
        const model = this.Data;
        this.handleValueChange(() => this.close());
    }
    setTitle() {
        console.log("Settitle : ", this.props)
        const model = this.Data;
        const props = this.props.data;

        console.log('props', props);

        if (model.Input.IsEdit) {
            model.Title = `${props.Title} / Edit / ${model.Input.Language.Text}`;
        }
        else {
            model.Title = `${props.Title} / New `;
        }
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