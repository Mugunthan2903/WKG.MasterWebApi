import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";



export default class SSM012VM extends VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SSM012';
        this.init();
    }
    init() {
        if (Object.keys(this.Data).length !== 0)
            return;
        const model = this.Data;
        model.IsEdit = false;
        model.DataCopy = null;
        model.imageCopy = null;
        model.hdrimageCopy = null;
        model.FormID = "SSM012";
        model.img_srl = null;
        model.img_srl_hdr = null;
        model.hdrImgRm = false;
        model.ImageNameExists = null;
        model.HtmlEditor = "";
        model.Sec1hmpgsrl = null;
        model.Sec2hmpgsrl = null;
        model.Sec3hmpgsrl = null;
        model.Sec4hmpgsrl = null;
        model.HeaderImage_File_sec1 = null;
        model.HeaderText_Sec1 = null;
        model.ContentText_Sec1 = null;
        model.Image_File_sec1 = null;
        model.Backgroundcolor_sec1 = "";
        model.FormId_sec1 = null;
        model.HeaderText_Sec2 = null;
        model.HeaderCity_Sec2 = null;
        model.Section2Exist = null;
        model.HeaderText_Sec3 = null;
        model.Section3Exist = null;
        model.HeaderText_Sec4 = null;
        model.Section4Exist = null;
        model.HeaderTextList_Sec1 = null;
        model.TodoList = null;
        model.FormIdList_sec1 = null;
        model.Modifiedon = "";
        model.Modifiedby = "";
        model.imagearr = null;
        model.hdrimagearr = null;
        model.save_btn = false;
        model.oldImg = false;
        model.oldImg_hdr = false;
        model.Grp_hmpg_typ = "";
        model.HomeScreenList = null;
        model.Section2Grid = {
            Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5
        };
        model.Section2Grid.Columns = [
            { text: 'Name', field: 'todoName', width: '30%' },
            { text: 'Sort Order', field: 'sort_ordr', width: '30%' },
            { text: 'Status', field: 'act_inact_ind', width: '30%' },
            { text: 'Edit', field: 'btns', width: '10%' },
        ];
        model.Section3Grid = {
            Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5
        };
        model.Section3Grid.Columns = [
            { text: 'Name', field: 'slide_img', width: '30%' },
            { text: 'Sort Order', field: 'sort_ordr', width: '30%' },
            { text: 'Status', field: 'act_inact_ind', width: '30%' },
            { text: 'Edit', field: 'btns', width: '10%' },
        ];
        model.Section4Grid = {
            Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5
        };
        model.Section4Grid.Columns = [
            { text: 'Name', field: 'en_GB', width: '30%' },
            { text: 'Sort Order', field: 'sort_ordr', width: '30%' },
            { text: 'Status', field: 'act_inact_ind', width: '30%' },
            { text: 'Edit', field: 'btns', width: '10%' },
        ];
        this.setTitle();
    }
    loadInitData(load = true) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.Section2Grid;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        // dataInfo.pos_grp_id = 1;
        dataInfo.pos_grp_id = this.props.data.Grp_ID;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.PageNo = 1;
        dataInfo.img_dir = "ssm";
        if (load) {
            model.Loading = true;
        }
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM012InitLoadDataAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    model.HeaderTextList_Sec1 = r.HeaderTextSec1.map(e => ({ ID: e.data_srl, Text: e.enGB }))
                    model.HeaderCityList_Sec2 = r.HeaderCitySec2.map(e => ({ ID: e.data_srl, Text: e.enGB }));
                    model.FormIdList_sec1 = r.FormId.map(e => ({ ID: e.form_id, Text: e.form_nam }))
                    model.TodoList = r.TodoSec2.map(e => ({ ID: e.data_srl, Text: e.enGB }));
                    model.Grp_hmpg_typ = r.Grphmpgtyp;
                    model.HomeScreenList = r.HomeScreenList;
                    if (!Utils.isNullOrEmpty(r.ImageName)) {
                        model.ImageNameExists = r.ImageName.split(',');
                    }
                    if (r.posIdExist.isPosGrpIdExist && load) {
                        try {
                            model.IsEdit = true;
                            model.Sec1hmpgsrl = r.posIdExist.SectionExist.Sec1hmpgsrl;
                            model.HeaderImage_File_sec1 = r.posIdExist.FormData[r.posIdExist.SectionExist.Sec1Index].hdr_img ?? null;
                            model.img_srl_hdr = r.posIdExist.FormData[r.posIdExist.SectionExist.Sec1Index].head_img_srl !== 0 ? r.posIdExist.FormData[r.posIdExist.SectionExist.Sec1Index].head_img_srl : null;
                            model.oldImg_hdr = model.HeaderImage_File_sec1 ? true : false;

                            model.ContentText_Sec1 = model.HeaderTextList_Sec1.find(e => e.ID === r.posIdExist.FormData[r.posIdExist.SectionExist.Sec1Index].cptn_data_srl) ?? null;

                            model.FormId_sec1 = model.FormIdList_sec1.find(e => e.ID === r.posIdExist.FormData[r.posIdExist.SectionExist.Sec1Index].form_id) ?? null;
                            model.HeaderText_Sec1 = model.HeaderTextList_Sec1.find(e => e.ID === r.posIdExist.FormData[r.posIdExist.SectionExist.Sec1Index].head_data_srl_sec1) || null;
                            model.Image_File_sec1 = r.posIdExist.FormData[r.posIdExist.SectionExist.Sec1Index].bg_img ?? null;
                            model.oldImg = model.Image_File_sec1 ? true : false;

                            model.img_srl = r.posIdExist.FormData[r.posIdExist.SectionExist.Sec1Index].img_srl !== 0 ? r.posIdExist.FormData[r.posIdExist.SectionExist.Sec1Index].img_srl : null;

                            model.Backgroundcolor_sec1 = r.posIdExist.FormData[r.posIdExist.SectionExist.Sec1Index] === undefined ? null : r.posIdExist.FormData[r.posIdExist.SectionExist.Sec1Index].cptn_bg_clr ?? '';

                            model.Section2Exist = r.posIdExist.SectionExist.Sec2Exist;
                            model.Sec2hmpgsrl = r.posIdExist.SectionExist.Sec2hmpgsrl;
                            model.HeaderText_Sec2 = r.posIdExist.SectionExist.Sec2Exist ? model.HeaderTextList_Sec1.find(e => e.ID === r.posIdExist.FormData[r.posIdExist.SectionExist.Sec2Index].head_data_srl_sec2) ?? null : null;
                            model.HeaderCity_Sec2 = r.posIdExist.SectionExist.Sec2Exist ? model.HeaderCityList_Sec2.find(e => e.ID === r.posIdExist.FormData[r.posIdExist.SectionExist.Sec2Index].cptn_data_srl_sec2) ?? null : null;
                            model.Section3Exist = r.posIdExist.SectionExist.Sec3Exist;
                            model.Sec3hmpgsrl = r.posIdExist.SectionExist.Sec3hmpgsrl;
                            model.HeaderText_Sec3 = r.posIdExist.SectionExist.Sec3Exist ? model.HeaderTextList_Sec1.find(e => e.ID === r.posIdExist.FormData[r.posIdExist.SectionExist.Sec3Index].head_data_srl_sec3) ?? null : null;
                            model.Section4Exist = r.posIdExist.SectionExist.Sec4Exist;
                            model.Sec4hmpgsrl = r.posIdExist.SectionExist.Sec4hmpgsrl;
                            model.HeaderText_Sec4 = r.posIdExist.SectionExist.Sec4Exist ? model.HeaderTextList_Sec1.find(e => e.ID === r.posIdExist.FormData[r.posIdExist.SectionExist.Sec4Index].head_data_srl_sec4) ?? null : null;
                            model.Modifiedon = r.posIdExist.FormData[0].mod_dttm;
                            model.Modifiedby = r.posIdExist.FormData[0].mod_by_usr_cd;
                        } catch (ex) { }
                    }
                    me.fillSearchResult(r.Section2Table || {}, 2, selectedItem);
                    me.fillSearchResult(r.Section3Table || {}, 3, selectedItem);
                    me.fillSearchResult(r.Section4Table || {}, 4, selectedItem);
                }
            }
            catch (ex) { }
            finally {
                this.setTitle();
                me.updateUI();
                if (load) {
                    var dataCopyEx = me.getData();
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                    me.Data.imageCopy = model.Image_File_sec1;
                    me.Data.hdrimageCopy = model.HeaderImage_File_sec1;
                }
            }
        });
    }
    loadPage(pageIndex, tableNo) {
        const me = this;
        const model = this.Data;
        let gridInfo = model.Section2Grid;
        let selectedItem = gridInfo.SelectedItem;
        if (tableNo === 2) {
            gridInfo = model.Section2Grid;
            selectedItem = gridInfo.SelectedItem;
        } else if (tableNo === 3) {
            gridInfo = model.Section3Grid;
            selectedItem = gridInfo.SelectedItem;
        } else if (tableNo === 4) {
            gridInfo = model.Section4Grid;
            selectedItem = gridInfo.SelectedItem;
        }
        const dataInfo = {};
        dataInfo.pos_grp_id = this.props.data.Grp_ID;
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.TableNo = tableNo;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM012TablePagination`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    me.fillSearchResult(r || {}, tableNo, selectedItem);
                }
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }
    fillSearchResult(r, tableNo, selectedItem = null) {
        const model = this.Data;
        let gridInfo = model.Section2Grid;
        if (tableNo === 2) {
            gridInfo = model.Section2Grid;
        } else if (tableNo === 3) {
            gridInfo = model.Section3Grid;
        } else if (tableNo === 4) {
            gridInfo = model.Section4Grid;
        }
        gridInfo.Items = r.Items.map(e => {
            if (e.act_inact_ind) {
                return { ...e, act_inact_ind: "Active" }
            } else {
                return { ...e, act_inact_ind: "Inactive" }
            }
        }) || [];
        gridInfo.Page = r.CurrentPage || 0;
        gridInfo.TotalPage = r.TotalPages || 0;
        gridInfo.TotalCount = r.TotalRecords || 0;
        if (gridInfo.Items.length > 0) {
            if (selectedItem !== undefined && selectedItem !== null) {
                selectedItem = gridInfo.Items.first(i => i.ID === selectedItem.ID);
            }
            if (selectedItem === null)
                selectedItem = gridInfo.Items[0];
        }

        if (selectedItem != null)
            selectedItem.isSelected = true;
        gridInfo.SelectedItem = selectedItem;
    }
    setSelectedItem(selectedItem, tableNo) {
        const model = this.Data;
        let gridInfo = model.Section2Grid;
        if (tableNo === 2) {
            gridInfo = model.Section2Grid;
            gridInfo.SelectedItem = selectedItem;
            gridInfo.SelectedItem.isSelected = true;
        } else if (tableNo === 3) {
            gridInfo = model.Section3Grid;
            gridInfo.SelectedItem = selectedItem;
            gridInfo.SelectedItem.isSelected = true;
        } else if (tableNo === 4) {
            gridInfo = model.Section4Grid;
            gridInfo.SelectedItem = selectedItem;
            gridInfo.SelectedItem.isSelected = true;
        }

    }
    handleSave() {
        const model = this.Data;
        const me = this;
        if (!this.isValueChanged() && model.IsEdit) {
            const opts = {
                text: "No changes has been made.",
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => { }
            };
            this.showMessageBox(opts);
            return;
        }
        if (cntrl.Utils.isNullOrEmpty(model.Image_File_sec1)) {
            const opts = {
                text: (model.Grp_hmpg_typ === model.HomeScreenList?.OTHHeathrow ? "Please Select Banner" : (model.Grp_hmpg_typ === model.HomeScreenList?.Tenerife ? "Please Background Image" : "Please Select Image")),
                messageboxType: cntrl.WKLMessageboxTypes.info,
                onClose: (_e) => {
                }
            };
            this.showMessageBox(opts);
            return;
        }
        model.save_btn = true;
        this.updateUI();
        const dataInfo = {
            // pos_grp_id: 1,
            pos_grp_id: this.props.data.Grp_ID,
            hdr_img: model.HeaderImage_File_sec1 === null ? null : model.HeaderImage_File_sec1,
            head_img_srl: model.img_srl_hdr,
            head_data_srl_sec1: model.HeaderText_Sec1 === null ? null : +model.HeaderText_Sec1.ID,
            head_data_srl_sec2: model.HeaderText_Sec2 === null ? null : +model.HeaderText_Sec2.ID,
            cptn_data_srl_sec2: model.HeaderCity_Sec2 === null ? null : +model.HeaderCity_Sec2.ID,
            head_data_srl_sec3: model.HeaderText_Sec3 === null ? null : +model.HeaderText_Sec3.ID,
            head_data_srl_sec4: model.HeaderText_Sec4 === null ? null : +model.HeaderText_Sec4.ID,
            cptn_data_srl: model.ContentText_Sec1 === null ? null : +model.ContentText_Sec1.ID,
            bg_img: model.Image_File_sec1,
            form_id: ((model.Grp_hmpg_typ === model.HomeScreenList?.OTHHeathrow) ? null : (model.FormId_sec1 === null ? null : model.FormId_sec1.ID)),
            cptn_bg_clr: model.Backgroundcolor_sec1,
            mode: model.IsEdit ? "UPDATE" : "INSERT",
            isImageChanged: this.isImageChanged(),
            img_srl: model.img_srl,
            mod_by_usr_cd: ApiManager.getUser().ID,
            Sec2Exist: model.Section2Exist === true ? true : false,
            Sec3Exist: model.Section3Exist === true ? true : false,
            Sec4Exist: model.Section4Exist === true ? true : false,
            Sec1hmpgsrl: model.Sec1hmpgsrl === 0 ? null : model.Sec1hmpgsrl,
            Sec2hmpgsrl: model.Sec2hmpgsrl === 0 ? null : model.Sec2hmpgsrl,
            Sec3hmpgsrl: model.Sec3hmpgsrl === 0 ? null : model.Sec3hmpgsrl,
            Sec4hmpgsrl: model.Sec4hmpgsrl === 0 ? null : model.Sec4hmpgsrl,
            oldImage: model.oldImg,
            oldhdrImage: model.oldImg_hdr,
            hdrImgRm: model.HeaderImage_File_sec1 === null ? true : false
        }
        model.Loading = true;
        let files = [];
        if (model.imagearr) {
            files.push(...model.imagearr);
        }
        if (model.hdrimagearr) {
            files.push(...model.hdrimagearr);
        }
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM012SaveDataAsync`, data: dataInfo, files: files }, (r) => {
            if (r && r.IsSuccess) {
                var dataCopyEx = me.getData();
                me.Data.DataCopy = JSON.stringify(dataCopyEx);
                model.Loading = false;
                const opts = {
                    text: "Data Saved Successfully",
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.doClose();
                    }
                };
                this.showMessageBox(opts);
            } else {
                model.save_btn = false;
                model.Loading = false;
                const opts = {
                    text: "Something went Wrong",
                    messageboxType: WKLMessageboxTypes.info,
                    onClose: (_e) => { }
                };
                this.showMessageBox(opts);
                me.updateUI();
            }
        });
    }
    handleClear(clear = false) {
        const model = this.Data;
        const me = this;
        if (!this.isValueChanged() || clear) {
            model.imagearr = null;
            model.hdrimagearr = null
            model.HeaderText_Sec1 = null;
            model.HeaderImage_File_sec1 = null;
            model.ContentText_Sec1 = null;
            model.Image_File_sec1 = null;
            model.FormId_sec1 = null;
            model.Backgroundcolor_sec1 = "";
            model.HeaderText_Sec2 = null;
            model.HeaderCity_Sec2 = null;
            model.HeaderText_Sec3 = null;
            model.HeaderText_Sec4 = null;
        } else {
            if (model.HeaderText_Sec1 = null && model.HeaderImage_File_sec1 === null && model.ContentText_Sec1 === null && model.Image_File_sec1 === null && model.FormId_sec1 === null && model.HeaderText_Sec2 === null && model.HeaderCity_Sec2 === null && model.HeaderText_Sec3 === null && model.HeaderText_Sec4 === null && model.Backgroundcolor_sec1 === "") {
                return
            }
            let options = [{ text: 'Yes' }, { text: 'No' }];
            this.showMessageBox({
                text: "Unsaved changes exists. Save and proceed",
                buttons: options,
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (_e === 0) {
                        me.handleSave();
                    } else if (_e === 1) {
                        model.HeaderText_Sec1 = null;
                        model.HeaderImage_File_sec1 = null;
                        model.ContentText_Sec1 = null;
                        model.Image_File_sec1 = null;
                        model.FormId_sec1 = null;
                        model.Backgroundcolor_sec1 = "";
                        model.HeaderText_Sec2 = null;
                        model.HeaderCity_Sec2 = null;
                        model.HeaderText_Sec3 = null;
                        model.HeaderText_Sec4 = null;
                        var dataCopyEx = me.getData();
                        me.Data.DataCopy = JSON.stringify(dataCopyEx);

                    }
                }
            });
        }
        this.updateUI();
    }

    getData() {
        const model = this.Data;
        const dataInfo = {};
        dataInfo.HeaderText_Sec1 = model.HeaderText_Sec1;
        dataInfo.HeaderImage_File_sec1 = model.HeaderImage_File_sec1;
        dataInfo.ContentText_Sec1 = model.ContentText_Sec1;
        dataInfo.FormId_sec1 = model.FormId_sec1;
        dataInfo.Image_File_sec1 = model.Image_File_sec1;
        dataInfo.Backgroundcolor_sec1 = model.Backgroundcolor_sec1;
        dataInfo.HeaderText_Sec2 = model.HeaderText_Sec2;
        dataInfo.HeaderCity_Sec2 = model.HeaderCity_Sec2;
        dataInfo.HeaderText_Sec3 = model.HeaderText_Sec3;
        dataInfo.HeaderText_Sec4 = model.HeaderText_Sec4;
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        if (model) {
            if (model.IsEdit)
                model.Title = `${this.props.data.Grp_Name} / Home Page / Edit`;
            else
                model.Title = `${this.props.data.Grp_Name} / Home Page / New`;
        }
    }
    onBlurCheck(value, name) {
        const model = this.Data;
        const me = this;
        if (!Utils.isNullOrEmpty(model.ImageNameExists)) {
            if (model.ImageNameExists.includes(value)) {
                if (name === "Image_File_sec1") {
                    me.showAlert('Image already exists.');
                    model.Image_File_sec1 = null;
                    model.imagearr = null;
                } else {
                    me.showAlert('Header Image already exists.');
                    model.HeaderImage_File_sec1 = null;
                    model.hdrimagearr = null;
                }
            }
        }
        this.updateUI();
    }
    doClose() {
        const me = this;
        if (this.isValueChanged()) {
            let options = [{ text: 'Yes' }, { text: 'No' }];
            this.showMessageBox({
                text: "Do you want to Discard the changes?",
                buttons: options,
                messageboxType: WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (_e === 0) {
                        me.close();
                    }
                }
            });
        } else {
            this.close();
        }
    }
    isImageChanged() {
        const model = this.Data;
        return model.imageCopy !== model.Image_File_sec1 || model.hdrimageCopy !== model.HeaderImage_File_sec1;
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
    openWindow(type, isEdit = false, hmpg_srl, slide_srl, todo_srl) {
        const me = this;
        const model = this.Data;
        // const pos_grp_id = 1;
        const HeaderSelectList = model.HeaderTextList_Sec1;
        const TodoList = model.TodoList;
        const FormList = model.FormIdList_sec1;
        const pos_grp_id = this.props.data.Grp_ID;
        const pos_grp_nam = this.props.data.Grp_Name;
        if (type == "Addimg_banner") {
            this.showWindow({
                url: 'SSM/SSM009', data: { Title: this.props.data.Title, Prod_Name: 'Top Banner', IsEdit: true, Imag_Dir: 'ssm' }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e) {
                        model.img_srl = e.img_srl;
                        model.Image_File_sec1 = e.img_nam;
                        model.WKLImage_Url = e.img_url;
                        model.oldImg = true;
                    }
                }
            });
        } else if (type === "hdrimg_banner") {
            this.showWindow({
                url: 'SSM/SSM009', data: { Title: this.props.data.Title, Prod_Name: 'Header Image', IsEdit: true, Imag_Dir: 'ssm' }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e) {
                        model.img_srl_hdr = e.img_srl;
                        model.HeaderImage_File_sec1 = e.img_nam;
                        model.WKLImage_Url = e.img_url;
                        model.oldImg_hdr = true;
                    }
                }
            });
        } else {
            this.showWindow({
                url: 'SSM/SSM013', data: { Title: 'SSM013', flag: type, isEdit, pos_grp_id, pos_grp_nam, HeaderSelectList, TodoList, FormList, hmpg_srl, slide_srl, todo_srl }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    me.loadInitData(false);
                }
            });
        }
    }

    openPreview() {
        const model = this.Data;
        const me = this;
        const dataInfo = {}
        dataInfo.pos_grp_id = this.props.data.Grp_ID;
        this.updateUI();
        model.Loading = true;
        Utils.ajax({ url: `${this._WebApi}/LoadpreviewData`, data: dataInfo, files: model.imagearr || [] }, (r) => {
            console.log("Htmldata", r);
            model.Loading = false;
            try {
                if (r) {
                    var currentDate = new Date();
                    var formattedDate = currentDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',

                    });
                    var formattedTime = currentDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    var cssToAdd = `:root {
                --text-black: #212121;
                --text-white: #FFFFFF;
                --bg-black: #121212;
                --bg-white: #ffffff;
                --light-grey: #ECEDF4;
                --font-size-22: 22px;
                --font-size-70: 70px;
                --character-spacing-0: 0px;
                --Figtree-Regular: Figtree-Regular;
                --Figtree-SemiBold: Figtree-SemiBold;
                --customisable-primary-colour: #00A6D3;
                }

                .h3-38pt-bold {
                font-family: Lato;
                font-size: 38px;
                font-weight:600;
                color: var(--text-black);
                }

                .h5-30pt-bold {
                font-family:Lato;
                font-size: 30px;
                font-weight:500;
                color: var(--text-black);
                }

                .h5-30pt-book {
                font-family: Lato;
                font-size: 30px;
                font-weight:500;
                line-height: var(--line-spacing-38);
                letter-spacing: var(--character-spacing-0);
                color: var(--text-black);
                }
                .h6-white-25pt-book {
                font-family: var(--circular-prott);
                font-size: var(--font-size-25);
                line-height: var(--line-spacing-32);
                letter-spacing: var(--character-spacing-0);
                color: var(--text-white);
                }

                .bx-wrapper {
                position: relative;
                margin-bottom: 20px;
                margin-top: 20px;
                padding: 0;
                *zoom: 1;
                -ms-touch-action: pan-y;
                touch-action: pan-y;
                }

                .bx-wrapper img {
                max-width: 100%;
                display: block;
                }

                .bxslider {
                margin: 0;
                padding: 0;
                }

                ul.bxslider {
                list-style: none;
                }

                .bx-viewport {
                -webkit-transform: translateZ(0);
                }

                .bx-wrapper .bx-pager,
                .bx-wrapper .bx-controls-auto {
                position: absolute;
                bottom: -30px;
                width: 100%;
                }

                .bx-wrapper .bx-loading {
                min-height: 50px;
                background: url('images/bx_loader.gif') center center no-repeat #ffffff;
                height: 100%;
                width: 100%;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 2000;
                }

                .bx-wrapper .bx-pager {
                text-align: center;
                font-size: .85em;
                font-family: Lato;
                font-weight: bold;
                color: #00A6D3;
                padding-top: 20px;
                }

                .bx-wrapper .bx-pager.bx-default-pager a {
                background: #00A6D3;
                text-indent: -9999px;
                display: block;
                width: 10px;
                height: 10px;
                margin: 0 5px;
                outline: 0;
                -moz-border-radius: 5px;
                -webkit-border-radius: 5px;
                border-radius: 5px;
                }

                .bx-wrapper .bx-pager.bx-default-pager a:hover,
                .bx-wrapper .bx-pager.bx-default-pager a.active,
                .bx-wrapper .bx-pager.bx-default-pager a:focus {
                background: #d8d8d8;
                }

                .bx-wrapper .bx-pager-item,
                .bx-wrapper .bx-controls-auto .bx-controls-auto-item {
                display: inline-block;
                vertical-align: bottom;
                *zoom: 1;
                *display: inline;
                }

                .bx-wrapper .bx-pager-item {
                font-size: 0;
                line-height: 0;
                }

                .bx-wrapper .bx-prev {
                left: -50px;
                }

                .bx-wrapper .bx-prev:hover,
                .bx-wrapper .bx-prev:focus {
                background-position: 0 0;
                }

                .bx-wrapper .bx-next {
                right: -50px;
                }

                .bx-wrapper .bx-next:hover,
                .bx-wrapper .bx-next:focus {
                background-position: -0px 0;
                }

                .bx-wrapper .bx-controls-direction a {
                position: absolute;
                top: 50%;
                margin-top: -16px;
                outline: 0;
                width: 40px;
                height: 40px;
                text-indent: -9999px;
                z-index: 9999;
                }

                .bx-wrapper .bx-controls-direction a.disabled {
                display: none;
                }

                .bx-wrapper .bx-controls-auto {
                text-align: center;
                }

                .bx-wrapper .bx-controls-auto .bx-start {
                display: block;
                text-indent: -9999px;
                width: 10px;
                height: 11px;
                outline: 0;
                margin: 0 3px;
                }
                .h5-white-30pt-bold {
                font-family: var(--circular-std);
                font-size: var(--font-size-30);
                line-height: var(--line-spacing-38);
                letter-spacing: var(--character-spacing-0);
                color: var(--text-white);
                }
                .bx-wrapper .bx-controls-auto .bx-start:hover,
                .bx-wrapper .bx-controls-auto .bx-start.active,
                .bx-wrapper .bx-controls-auto .bx-start:focus {
                background-position: -86px 0;
                }

                .bx-wrapper .bx-controls-auto .bx-stop {
                display: block;
                text-indent: -9999px;
                width: 9px;
                height: 11px;
                outline: 0;
                margin: 0 3px;
                }

                .bx-wrapper .bx-controls-auto .bx-stop:hover,
                .bx-wrapper .bx-controls-auto .bx-stop.active,
                .bx-wrapper .bx-controls-auto .bx-stop:focus {
                background-position: -86px -33px;
                }

                .bx-wrapper .bx-controls.bx-has-controls-auto.bx-has-pager .bx-pager {
                text-align: left;
                width: 80%;
                }

                .bx-wrapper .bx-controls.bx-has-controls-auto.bx-has-pager .bx-controls-auto {
                right: 0;
                width: 35px;
                }

                .bx-wrapper .bx-caption {
                position: absolute;
                bottom: 0;
                left: 0;
                background: #666;
                background: rgba(80, 80, 80, 0.75);
                width: 100%;
                }

                .bx-wrapper .bx-caption span {
                color: #fff;
                font-family: Lato;
                display: block;
                font-size: .85em;
                padding: 10px;
                }

                .TrpBtnOtr {
                width:800px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 40px;
                }


                .TrpOneBtn a {
                width:375px;
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 20px;
                background-color: var(--light-grey);
                }

                .TrpDblBtn a {
                width:375px;
                height: 120px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 20px;
                background-color: var(--customisable-primary-colour);
                }

                .ErrBtmLn {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-end;
                height: 275px;
                }

                .RevContOtrThtr {
                display: flex;
                justify-content: space-between;
                align-items: center;
                }


                .ThngBlkNewRf {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: flex-start;
                }


                .ThngBlk .img-01 {
                background:url(../images/Harry-potter-studio.jpg);
                padding:25px;
                border-radius: 20px;
                height:189px;
                box-sizing: border-box;
                }

                .ThngBlk .img-02 {
                background:url(../images/London-Eye-02.jpg);
                padding:25px;
                border-radius: 20px;
                height:189px;
                box-sizing: border-box;
                }

                .ThngBlk .ImgInnr {
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: flex-start;
                height: 139px;
                }

                .ThngBlk .ImgTitRf {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                }

                .ThngBlk .ImgTit {
                color: var(--text-white);
                }

                .ThngBlk-02 a {
                width:452px;
                height:295px;
                display: block;
                text-decoration: none;
                }

                .ThngBlk-02 .img-03 {
                background:url(../images/Stonehenge.jpg);
                padding:25px;
                border-radius: 20px;
                height:295px;
                box-sizing: border-box;
                }

                .ThngBlk-02 .ImgInnr {
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: flex-start;
                height: 240px;
                }

                .ThngBlk-02 .ImgTitRf {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                }

                .ThngBlk-02 .ImgTit {
                color: var(--text-white);
                }

                .ThngBlkBtn a {
                width:452px;
                height: 80px;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: var(--highlight-blue);
                color:var(--text-white);
                margin-top: 15px;
                text-decoration: none;
                border-radius: 20px;
                }

                .ConsrgBlkNewOtr {
                width:920px;
                display: flex;
                margin: 20px auto 0px auto;
                justify-content: flex-start;
                flex-wrap: wrap;
                }

                .ConsrgNewRf {
                width:222.5px;
                height: 200px;
                background-color: var(--highlight-blue);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                border-radius: 20px;
                margin-right:10px;
                }

                .ConsrgNew a {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                }

                .ConsrgNewRf:last-child {
                margin-right: 0;
                }

                .ConsrgNewRf .tit {
                color: var(--text-white);
                text-align: center;
                margin-top: 10px;
                }

                /*--------------------------*/
                .ThngBlk-Nw a {
                width:452px;
                display: block;
                text-decoration: none;
                }

                .ThngBlk-Nw .img-01 {
                padding:25px;
                border-radius: 20px;
                height:181px;
                box-sizing: border-box;
                }

                .ThngBlk-Nw .img-02 {
                background:url(../images/London-Eye-02.jpg);
                padding:25px;
                border-radius: 20px;
                height:189px;
                box-sizing: border-box;
                }

                .ThngBlk-Nw .ImgInnr {
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: flex-start;
                height: 139px;
                }

                .ThngBlk-Nw .ImgTitRf {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                }

                .ThngBlk-Nw .ImgTit {
                color: var(--text-white);
                font-weight:bold;
                }

                .ThngBlk-Nw-02 a {
                width:452px;
                /*    height:301px;*/
                display: block;
                text-decoration: none;
                }

                .ThngBlk-Nw-02 .img-03 {
                background:url(../images/Stonehenge.jpg);
                padding:25px;
                border-radius: 20px;
                height:301px;
                box-sizing: border-box;
                }

                .ThngBlk-Nw-02 .ImgInnr {
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: flex-start;
                height: 240px;
                }

                .ThngBlk-Nw-02 .ImgTitRf {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                }

                .ThngBlk-Nw-02 .ImgTit {
                color: var(--text-white);
                }
                .h5-white-30pt-bold {
                    font-family: var(--circular-std);
                    font-size: var(--font-size-30);
                    line-height: var(--line-spacing-38);
                    letter-spacing: var(--character-spacing-0);
                    color: var(--text-white);
                }
                

                .ConsrgBlkNewOtr-Nw {
                /*    width:920px;*/
                margin: 20px auto 0px auto;
                display: flex;
                flex-wrap: nowrap;
                }

                .ConsrgNewRf-Nw {
                height: 200px;
                background-color: var(--highlight-blue);   
                display: flex;
                flex: 0 0 218px;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                border-radius: 20px;
                margin-right:10px;
                }

                .ConsrgNew a {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                }

                .ConsrgNewRf-Nw:last-child {
                    margin-right: 0;
                }

                .ConsrgNewRf-Nw .tit {
                    color: var(--text-white);
                    text-align: center;
                    margin-top: 10px;
                }
                .ThngBlkBtn-Nw a {
                    width:452px;
                    height: 93px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #2171ec;
                    color:#fff;
                    margin-top: 15px;
                    text-decoration: none;
                    border-radius: 20px;
                }
                .Tit-Nw {
                    margin: 54px auto 30px auto;
                }
                .CalenSub {
                    font-family: var(--Figtree-Regular);
                    font-size: var(--font-size-22);
                    float: left;
                }
                 .MnTnrif {
                    width:100%;
                    padding: 50px 0px 0px 0px;
                    box-sizing: border-box;
                    position: relative;
                    height:457px;
                    background-position: center center;
                    background-size: 1200px auto;
                }
                .LngOtr { 
                    height: 51px;
                    background-color: var(--light-grey);
                    border-radius: 30px;
                    display: inline-flex;
                    justify-content: space-around;
                    align-items: center;
                    margin-left: 50px;
                    padding: 5px 20px 0 20px;
                    box-sizing: border-box;
                }
                .UbrOtr {
                    display: flex;
                    flex-direction: column;
                }
                .UbrTxtBx {
                    width:608px;
                    height:120px;
                    padding: 40px 55px;
                    box-sizing: border-box;
                    font-family: var(--Figtree-Regular);
                    color: var(--text-black);
                    background:var(--bg-white) url(../images/forward-black-arrow.svg) 90% center no-repeat;
                    background-size: 65px;
                    border-radius: 90px;
                    font-size: 40px;
                    margin-top: 50px;
                    border:none;
                    outline: none;
                }
                .UbrTxtBx::placeholder {
                    color: var(--text-black);
                }
                .CalenOth {
                    display: flex;
                    justify-content: space-between;
                    margin: 0 30px;
                }
                .WeknwLgo {
                    width:140px;
                }
                .MnTpOtr {
                    padding: 0px 0px 0px 80px;
                }
                .h2-white-70pt-bold {
                    font-family: var(--Figtree-SemiBold);
                    font-size: var(--font-size-70);
                    line-height: var(--line-spacing-70);
                    letter-spacing: var(--character-spacing-0);
                    color: var(--text-white);
                }
                .IgSz {
                    width: 100%;
                    height: auto;
                }`;

                    var dbCSS = `
                    :root {
                    --db-text-white: #FFFFFF;
             	--db-bg-dark-grey: #ECEDF4;
                --db-text-black-1: #121212;
                --db-text-black-2: #212121;
                --db-bg-white: #ffffff;
                --db-border-light-grey: #EEEEEE;
                --db-text-light-grey:#A0A4A7;
                --db-text-black-2: #212121;
                --db-text-dark-grey: #565656;
                --db-bg-main: #F8F9FD;
                --db--line-spacing-25: 25px;
                --db--font-size-21: 21px;
                --db--line-spacing-25: 25px;
                --db--Figtree-Regular: Figtree-Regular;
                --db--Figtree-SemiBold: Figtree-SemiBold;
                }
                    .db-body {
                            padding: 0 0 0 0;
                            font-family: var(--db--Figtree-Regular);
                            color: var(--db-text-black-1);
                            margin: 0 auto;
                            max-width: 1080px;
                            max-height: 1920px;
                            background-color: var(--db-bg-main);

                        }
                    .db-SplOtr {
                        width:100%;
                        height:1251px;
                    }
                    .db-LgoOtr {
                        padding:46px 80px 10px 80px;
                        overflow: hidden;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .db-langRf a {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 9px 30px;
                        border-radius: 47px;
                        background-color: var(--db-bg-dark-grey);
                        float: left;
                        text-decoration: none;
                        color:var(--db-text-black-1);
                    }
                    .db-LogoRt {
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;
                        float: right;
                    }
                    .-db-h11-white-21px-25 {
                        font-family: var(--db--Figtree-Regular);
                        font-size: var(--db--font-size-21);
                        line-height: var(--db--line-spacing-25);
                        color: var(--db-text-white);
                    }
                    .-db-h11-21px-25 {
                        font-family: var(--db--Figtree-Regular);
                        font-size: var(--db--font-size-21);
                        line-height: var(--db--line-spacing-25);
                        color: var(--db-text-black-1);
                    }
                    .-db-h11-white-21px-25-bold {
                        font-family: var(--db--Figtree-SemiBold);
                        font-size: var(--db--font-size-21);
                        line-height: var(--db--line-spacing-25);
                        color: var(--db-text-white);
                    }
                    .-db-h1-white-124px-149-bold {
                        font-family: var(--db--Figtree-SemiBold);
                        font-size: 124px;
                        line-height: 149px;
                        color: var(--db-text-white);
                    }
                    .-db-h4-40px-51-bold {
                        font-family: var(--db--Figtree-SemiBold);
                        font-size: 40px;
                        line-height: 51px;
                        color: var(--db-text-black-2);
                    }
                    .-db-h6-grey-35px-44 {
                        font-family: var(--db--Figtree-Regular);
                        font-size: 35px;
                        line-height: 44px;
                        color: var(--db-text-light-grey);
                    }
                    .db-TktBtn a {
                        width:920px;
                        height: 218px;
                        background-color: var(--db-bg-white);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0 60px 0 40px;
                        margin: 0 auto;
                        text-decoration: none;
                        border:solid 2px var(--db-border-light-grey);
                        border-radius:20px;
                        box-sizing: border-box;
                    }

                    .db-TktBtn .db-TktHdrRf {
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                    }

                    .db-TktBtn .db-TktHdr {
                        color:var(--db-text-black-2);
                    }

                    .db-TktBtn .db-TktSubHdr {
                        color:var(--db-text-dark-grey);
                    }`;

                    const origin = window.location.origin;
                    const pathname = window.location.pathname;
                    const dynamicBaseUrl = origin + pathname.substring(0, pathname.lastIndexOf('/'));
                    console.log("window.location : ", window.location);
                    let PreviewAppend = "";
                    PreviewAppend += "<!DOCTYPE html>";
                    PreviewAppend += "<html>";
                    PreviewAppend += "<head>";
                    PreviewAppend += "<meta charset=\"utf-8\">";
                    PreviewAppend += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">";
                    PreviewAppend += "<link href=\"https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap\" rel=\"stylesheet\"></link>";
                    PreviewAppend += "<script type=\"text/javascript\" src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js\"></script>";
                    PreviewAppend += "<script type=\"text/javascript\" src=\"https://cdn.jsdelivr.net/bxslider/4.2.12/jquery.bxslider.min.js\"></script>";
                    if (r.Grpmastinfo && r.Grpmastinfo.hmpg_typ !== model.HomeScreenList?.OTHHeathrow)
                        PreviewAppend += "<style>" + cssToAdd + "</style>";
                    else
                        PreviewAppend += "<style>" + dbCSS + "</style>";
                    PreviewAppend += "</head>";

                    if (r.Grpmastinfo && r.Grpmastinfo.hmpg_typ !== model.HomeScreenList?.OTHHeathrow) {
                        PreviewAppend += "<body style=\"border:1px solid red;margin: 0 auto;padding: 0;font-family: Lato;color: var(--text-black);font-weight: 400;max-width: 1080px;max-height: 1920px;background-color: var(--background);\">";
                        if (r.Grpmastinfo && r.Grpmastinfo.hmpg_typ === model.HomeScreenList?.Tenerife) {
                            r.Homepage.forEach(function (item) {
                                if (item.hmpg_sctn_cd === "SEC1") {
                                    PreviewAppend += "<div class=\"MnTnrif\" style=\"background:url(" + item.fnl_path_img + ") no-repeat;\">"
                                }
                            });
                            PreviewAppend += "<div class=\"CalenOth\">"
                            PreviewAppend += "<div class=\"CalenSub\">"
                            PreviewAppend += "<div class=\"LngOtr\">"
                            PreviewAppend += "<div><img src=\"" + dynamicBaseUrl + "/images/Language-Icon.svg\" style=\"width:20px; height:auto; margin-right: 15px;\"></div>"
                            PreviewAppend += "<div class=\"h7-22pt-book\" style=\"padding-bottom:5px;\">English</div>"
                            PreviewAppend += "<div><img src=\"" + dynamicBaseUrl + "/images/db-Flag-GB.jpg\" style=\"width:35px; height:auto; margin-left: 15px;\"></div>"
                            PreviewAppend += "</div>"
                            PreviewAppend += "</div>"
                            PreviewAppend += "<div class=\"WeknwLgo\"><img src=\"" + dynamicBaseUrl + "/images/we-Know-logo.png\" class=\"IgSz\"></div>"
                            PreviewAppend += "</div>"
                            r.Homepage.forEach(function (item) {
                                if (item.hmpg_sctn_cd === "SEC1") {
                                    PreviewAppend += "<div class=\"MnTpOtr\">"
                                    PreviewAppend += "<div class=\"h2-white-70pt-bold\" style=\"margin-top: 50px;color:" + item.cptn_bg_clr + ";\">" + item.head_data + "</div>"
                                    PreviewAppend += "<div class=\"UbrOtr\">"
                                    PreviewAppend += "<div><input type=\"text\" name=\"\" class=\"UbrTxtBx\" placeholder=\"" + item.cptn_data + "\" style=\"width: 608px;height: 120px;padding: 40px 55px;box-sizing: border-box;font-family: Lato;color: var(--text-black);background: var(--bg-white) url(" + dynamicBaseUrl + "/images/forward-black-arrow.svg) 90% center no-repeat;background-size: 65px;border-radius: 90px;font-size: 40px;margin-top: 50px;border: none;outline: none;\"></div>";
                                    PreviewAppend += "</div>"
                                    PreviewAppend += "</div>"
                                }
                            });
                            PreviewAppend += "</div>"
                        }
                        else {
                            r.Homepage.forEach(function (item) {
                                if (item.hmpg_sctn_cd === "SEC1") {
                                    PreviewAppend += "<div class=\"MnTp\" style=\"width: 100%;padding: 50px 0px 0px 0px;box-sizing: border-box;position: relative;height: 470px;background-color: " + item.cptn_bg_clr + "\">";
                                }
                            });
                            PreviewAppend += "<div class=\"CalenOth\" style=\"display: flex;justify-content: space-between;margin: 0 30px;\">";
                            PreviewAppend += "<div class=\"Calendr\" style=\"font-size: 22px;color: var(--text-white);\">" + formattedDate + " | " + formattedTime + "</div>";
                            PreviewAppend += "<div class=\"WeknwLgo\" style=\"width: 140px;\"><img src=\"" + dynamicBaseUrl + "/images/we-Know-logo.png\" class=\"IgSz\" style=\"width: 100%;height: auto;\"></div>";
                            PreviewAppend += "</div>";

                            r.Homepage.forEach(function (item) {
                                if (item.hmpg_sctn_cd === "SEC1") {
                                    PreviewAppend += "<div class=\"MnTpOtr\" style=\"padding: 0px 0px 0px 80px;\">";
                                    PreviewAppend += "<div class=\"UbrOtr\" style=\"display: flex;flex-direction: column;\">";
                                    PreviewAppend += "<div class=\"UbrLgoOtr\" style=\"width: 202px;height: auto;display: flex;margin: 80px 0 0 0;\"><img src=\"" + item.head_img_srl + "\" class=\"IgSz\" style=\"width: 100%;height: auto;\"></div>";
                                    PreviewAppend += "<div><input type=\"text\" name=\"\" class=\"UbrTxtBx\" placeholder=\"" + item.cptn_data + "\" style=\"width: 608px;height: 120px;padding: 40px 55px;box-sizing: border-box;font-family: Lato;color: var(--text-black);background: var(--bg-white) url(" + dynamicBaseUrl + "/images/forward-black-arrow.svg) 90% center no-repeat;background-size: 65px;border-radius: 90px;font-size: 40px;margin-top: 50px;border: none;outline: none;\"></div>";
                                    PreviewAppend += "</div>";
                                    PreviewAppend += "<div class=\"UbrImg\" style=\"position: absolute;bottom: -10%;right: 0;z-index: 100000;width: 315px;\"><img src=\"" + item.fnl_path_img + "\" class=\"IgSz\" style=\"width: 100%;height: auto;\"></div>";
                                    PreviewAppend += "</div>";
                                }
                            });
                            PreviewAppend += "</div>";
                        }

                        PreviewAppend += "<div class=\"Mn\" style=\"width: 920px;margin: 0 auto 30px auto;\">";
                        r.Homepage.forEach(function (item) {
                            if (item.hmpg_sctn_cd === "SEC2" && item.head_data !== null) {
                                PreviewAppend += "<div class=\"h3-38pt-bold Tit-01\" style=\"font-family: Lato;font-style: var(--font-normal);line-height: var(--line-spacing-48);letter-spacing: var(--character-spacing--0-19);color: var(--text-full-black);margin: 64px auto 30px auto;\">" + item.head_data + "" + (item.cptn_data ? item.cptn_data : "") + "</div>";
                            }
                        });
                        PreviewAppend += "<div class=\"ThngBlkOtr\" style=\"width: 920px;display: flex;margin: 20px auto 0px auto;justify-content: space-between;flex-wrap: wrap;\">";
                        let inarry = '';
                        r.Todo.forEach((item, index) => {
                            if (item.sec_typ === "B" && index < 2) {
                                inarry = index;
                            }
                        });
                        PreviewAppend += "<div class=\"ThngBlkNewRf\">";
                        r.Todo.forEach((item, index) => {

                            if (index < 2) {
                                if (item.sec_typ === "C") {
                                    PreviewAppend += "<div class=\"ThngBlk-NW\" style=\"margin-bottom:10px;width: 452px;\">";
                                    PreviewAppend += "<a href=\"javascript:void(0)\" onclick=\"\" style=\"display: block;text-decoration: none !important;\">";

                                    if (inarry !== "") {
                                        PreviewAppend += "<div class=\"Bg-01\" style=\"background: linear-gradient(90deg," + item.todo_bg_clr + "," + item.todo_grdnt_clr + ");padding: 25px;border-radius: 20px;height:216px;\">";
                                        PreviewAppend += "<div class=\"Otr\" style=\"display: flex;justify-content: space-between;align-items: center;\">";
                                        PreviewAppend += "<div class=\"h5-30pt-bold Tit\" style=\"font-family: Lato;font-weight:bold;line-height: var(--line-spacing-38);letter-spacing: var(--character-spacing-0);color: var(--text-white);margin-top: 165px;\"> " + item.todo_nam + " </div>";
                                    }
                                    else {
                                        PreviewAppend += "<div class=\"Bg-01\" style=\"background: linear-gradient(90deg," + item.todo_bg_clr + "," + item.todo_grdnt_clr + ");padding: 25px;border-radius: 20px;\">";
                                        PreviewAppend += "<div class=\"Otr\" style=\"display: flex;justify-content: space-between;align-items: center;\">";
                                        PreviewAppend += "<div class=\"h5-30pt-bold Tit\" style=\"font-family: Lato;font-weight:bold;line-height: var(--line-spacing-38);letter-spacing: var(--character-spacing-0);color: var(--text-white);margin-top: 95px;\"> " + item.todo_nam + " </div>";
                                    }
                                    PreviewAppend += "<div class=\"Icn-01\" style=\"width: 96px;\"><img src=\"" + item.fnl_path_img + "\" class=\"IgSz\" style=\"width: 100%;height: auto;\"></div>";
                                    PreviewAppend += "</div>";
                                    PreviewAppend += "</div>";
                                    PreviewAppend += "</a>";
                                    PreviewAppend += "</div>";
                                } else if (item.sec_typ === "I") {
                                    PreviewAppend += "<div class=\"ThngBlk-Nw\" style=\"margin-bottom:10px;\">";
                                    PreviewAppend += "<a href=\"#\">";

                                    if (inarry !== "") {
                                        PreviewAppend += "<div class=\"img-01\" style=\"background:url(" + item.fnl_path_img + ");background-size: cover;height:266px;\">";
                                        PreviewAppend += "<div class=\"ImgInnr\" style=\"height:210px;\">";
                                    }
                                    else {
                                        PreviewAppend += "<div class=\"img-01\" style=\"background:url(" + item.fnl_path_img + ");background-size: cover;\">";
                                        PreviewAppend += "<div class=\"ImgInnr\">";
                                    }
                                    PreviewAppend += "<div class=\"ImgTitRf\">";
                                    PreviewAppend += "<div class=\"ImgTit h5-30pt-bold\" style=\"color:" + item.todo_grdnt_clr + ";\">" + item.todo_nam + "</div>";
                                    PreviewAppend += "<div><img src=\"" + dynamicBaseUrl + "/images/right-white-arrow.svg\" style=\"margin-left:30px; width:25px; margin-top: 7px;\"/></div>";
                                    PreviewAppend += "</div>";
                                    PreviewAppend += "<div class=\"h6-white-25pt-book\" style=\"font-weight:bold;color:" + item.todo_grdnt_clr + "\">" + item.tot_aval_txt + " " + item.aval_typ_data + "</div>";
                                    PreviewAppend += "</div>";
                                    PreviewAppend += "</div>";
                                    PreviewAppend += "</a>";
                                    PreviewAppend += "</div>";
                                } else if (item.sec_typ === "B") {
                                    PreviewAppend += `<div class="ThngBlkBtn-Nw" style="margin-bottom:10px;">`;
                                    PreviewAppend += "<a href=\"#\" style=\"margin-top: 0px;\">";
                                    PreviewAppend += "<div class=\"h5-white-30pt-bold\" style=\"font-size:27px;color:" + item.todo_grdnt_clr + ";\">" + item.todo_nam + "</div>";
                                    PreviewAppend += "<div><img src=\"" + dynamicBaseUrl + "/images/right-white-arrow.svg\" style=\"margin-left:15px; width:25px; margin-top: 7px;\"></div>";
                                    PreviewAppend += "</a>";
                                    PreviewAppend += "</div>";
                                }

                            }
                        });
                        PreviewAppend += "</div>";
                        inarry = '';
                        r.Todo.forEach((item, index) => {
                            if (item.sec_typ === "B" && index > 1) {
                                inarry = index;
                            }
                        });
                        PreviewAppend += "<div class=\"ThngBlkNewRf\">";
                        r.Todo.forEach((item, index) => {
                            if (index > 1) {

                                if (item.sec_typ === "C") {
                                    PreviewAppend += "<div class=\"ThngBlk-NW\" style=\"margin-bottom:10px;width: 452px;\">";
                                    PreviewAppend += "<a href=\"javascript:void(0)\" onclick=\"\" style=\"display: block;text-decoration: none !important;\">";


                                    if (inarry !== "") {
                                        PreviewAppend += "<div class=\"Bg-01\" style=\"background: linear-gradient(90deg," + item.todo_bg_clr + "," + item.todo_grdnt_clr + ");padding: 25px;border-radius: 20px;height:216px;\">";
                                        PreviewAppend += "<div class=\"Otr\" style=\"display: flex;justify-content: space-between;align-items: center;\">";
                                        PreviewAppend += "<div class=\"h5-30pt-bold Tit\" style=\"font-family: Lato;font-weight:bold;line-height: var(--line-spacing-38);letter-spacing: var(--character-spacing-0);color: var(--text-white);margin-top: 165px;\"> " + item.todo_nam + " </div>";
                                    }
                                    else {
                                        PreviewAppend += "<div class=\"Bg-01\" style=\"background: linear-gradient(90deg," + item.todo_bg_clr + "," + item.todo_grdnt_clr + ");padding: 25px;border-radius: 20px;\">";
                                        PreviewAppend += "<div class=\"Otr\" style=\"display: flex;justify-content: space-between;align-items: center;\">";
                                        PreviewAppend += "<div class=\"h5-30pt-bold Tit\" style=\"font-family: Lato;font-weight:bold;line-height: var(--line-spacing-38);letter-spacing: var(--character-spacing-0);color: var(--text-white);margin-top: 95px;\"> " + item.todo_nam + " </div>";
                                    }

                                    PreviewAppend += "<div class=\"Icn-01\" style=\"width: 96px;\"><img src=\"" + item.fnl_path_img + "\" class=\"IgSz\" style=\"width: 100%;height: auto;\"></div>";
                                    PreviewAppend += "</div>";
                                    PreviewAppend += "</div>";
                                    PreviewAppend += "</a>";
                                    PreviewAppend += "</div>";
                                } else if (item.sec_typ === "I") {
                                    PreviewAppend += "<div class=\"ThngBlk-Nw\" style=\"margin-bottom:10px;\">";
                                    PreviewAppend += "<a href=\"#\">";

                                    if (inarry !== "") {
                                        PreviewAppend += "<div class=\"img-01\" style=\"background:url(" + item.fnl_path_img + ");background-size: cover;height:266px;\">";
                                        PreviewAppend += "<div class=\"ImgInnr\" style=\"height:210px;\">";
                                    }
                                    else {
                                        PreviewAppend += "<div class=\"img-01\" style=\"background:url(" + item.fnl_path_img + ");background-size: cover;\">";
                                        PreviewAppend += "<div class=\"ImgInnr\">";
                                    }

                                    PreviewAppend += "<div class=\"ImgTitRf\">";
                                    PreviewAppend += "<div class=\"ImgTit h5-30pt-bold\" style=\"color:" + item.todo_grdnt_clr + ";\">" + item.todo_nam + "</div>";
                                    PreviewAppend += "<div><img src=\"" + dynamicBaseUrl + "/images/right-white-arrow.svg\" style=\"margin-left:30px; width:25px; margin-top: 7px;\"/></div>";
                                    PreviewAppend += "</div>";
                                    PreviewAppend += "<div class=\"h6-white-25pt-book\" style=\"font-weight:bold;color:" + item.todo_grdnt_clr + "\">" + item.tot_aval_txt + " " + item.aval_typ_data + "</div>";
                                    PreviewAppend += "</div>";
                                    PreviewAppend += "</div>";
                                    PreviewAppend += "</a>";
                                    PreviewAppend += "</div>";
                                } else if (item.sec_typ === "B") {
                                    PreviewAppend += `<div class="ThngBlkBtn-Nw" style="margin-bottom:10px;">`;
                                    PreviewAppend += "<a href=\"#\" style=\"margin-top: 0px;\">";
                                    PreviewAppend += "<div class=\"h5-white-30pt-bold\" style=\"font-size:27px;color:" + item.todo_grdnt_clr + ";\">" + item.todo_nam + "</div>";
                                    PreviewAppend += "<div><img src=\"" + dynamicBaseUrl + "/images/right-white-arrow.svg\" style=\"margin-left:15px; width:25px; margin-top: 7px;\"></div>";
                                    PreviewAppend += "</a>";
                                    PreviewAppend += "</div>";
                                }

                            }
                        });
                        PreviewAppend += "</div>";
                        PreviewAppend += "</div>";
                        r.Homepage.forEach(function (item) {
                            if (item.hmpg_sctn_cd === "SEC3" && item.head_data !== null) {
                                PreviewAppend += "<div class=\"h3-38pt-bold Tit-01\" style=\"font-family: Lato;font-style: var(--font-normal);line-height: var(--line-spacing-48);letter-spacing: var(--character-spacing--0-19);color: var(--text-full-black);margin: 64px auto 30px auto;\">" + item.head_data + "</div>";
                            }
                        });
                        PreviewAppend += "<a href=\"javascript:void(0)\" onclick=\"\" style=\"text-decoration: none !important;\">";
                        PreviewAppend += "<div class=\"SldOtr\" id=\"tchone\">";
                        PreviewAppend += "<div class=\"slider\">";
                        r.Slide.forEach(function (item) {
                            PreviewAppend += "<div style=\"width:915px !important;margin:auto;\"><img src=\"" + item.fnl_path_img + "\" class=\"IgSz\" style=\"width: 99%;height: 400px;\"></div>";
                        });
                        PreviewAppend += "</div>";
                        PreviewAppend += "</div>";
                        PreviewAppend += "</a>";
                        r.Homepage.forEach(function (item) {
                            if (item.hmpg_sctn_cd === "SEC4" && item.head_data !== null) {
                                PreviewAppend += "<div class=\"h3-38pt-bold Tit-01\" style=\"font-family: Lato;font-style: var(--font-normal);line-height: var(--line-spacing-48);letter-spacing: var(--character-spacing--0-19);color: var(--text-full-black);margin: 64px auto 30px auto;\">" + item.head_data + "</div>";
                            }
                        });
                        var SEC5array = [];
                        r.Homepage.forEach(function (item, index, array) {
                            SEC5array = array.filter(data => data.hmpg_sctn_cd === "SEC5" && data.act_inact_ind === true);
                        });

                        if (SEC5array.length > 4) {
                            PreviewAppend += "<div class=\"ConsrgBlkOtr\" id=\"tchone2\" style=\"margin: 20px auto 0px auto;width: 999px; display: flex; flex-wrap: nowrap;overflow:auto;scrollbar-width: none;\">";
                            PreviewAppend += "<div  class=\"sliderx\">"
                        }
                        else {
                            PreviewAppend += "<div class=\"ConsrgBlkOtr\" id=\"tchone2\" style=\"margin: 20px auto 0px auto;display: flex; flex-wrap: nowrap;overflow:auto;scrollbar-width: none;\">";
                            PreviewAppend += "<div  class=\"sliderx\">"
                        }

                        SEC5array.forEach((item, index) => {
                            var marginRight = (index === SEC5array.length - 1) ? "0px" : "15.93px";
                            PreviewAppend += "<div style=\"width:226px;height: 200px; background-color:" + item.cptn_bg_clr + "; display: flex; flex: 0 0 218px; flex-direction: column; justify-content: center; align-items: center; border-radius: 20px;margin-right: " + marginRight + "\">";
                            PreviewAppend += "<a href=\"#\" style=\"display: flex; flex-direction: column; justify-content: center; align-items: center;text-decoration: none !important;\">";
                            PreviewAppend += "<div>";
                            PreviewAppend += "<img src=\"" + item.fnl_path_img + "\" style = \"width: 35px;\">";
                            PreviewAppend += "</div>";
                            PreviewAppend += "<div style=\"font-family: Lato;line-height: var(--line-spacing-38);letter-spacing: var(--character-spacing-0);text-decoration: none !important;color: var(--text-white); text-align: center; margin-top: 10px;font-size:30px;padding: 0px 10px;\" class=\"tit\">" + item.cptn_data + "</div>";
                            PreviewAppend += "</a>";
                            PreviewAppend += "</div>";
                        });
                        PreviewAppend += "</div>"
                        PreviewAppend += "</div>";
                        PreviewAppend += "</div>";
                    }
                    else {
                        const homeDetails = r.Homepage.filter((item) => item.hmpg_sctn_cd === "SEC1") || null;

                        PreviewAppend += `<body class="db-body">`;
                        PreviewAppend += `<div class="db-SplOtr" style="background-image: url('${homeDetails[0].fnl_path_img}'); background-size: cover; background-repeat: no-repeat;">`;
                        PreviewAppend += `<div class="db-LgoOtr">`;
                        PreviewAppend += `<div class="db-langRf">`;
                        PreviewAppend += `<a href="#">`;
                        PreviewAppend += `<div><img src="${dynamicBaseUrl}/images/db-Globe.svg" style="width:18px; height: 18px;"></div>`;
                        PreviewAppend += `<div class="-db-h11-21px-25" style="margin:0 12px; padding-bottom: 4px;">English</div>`;
                        PreviewAppend += `<div><img src="${dynamicBaseUrl}/images/db-Flag-GB.jpg"></div>`;
                        PreviewAppend += `</a></div>`;
                        PreviewAppend += `<div class="db-LogoRt">`;
                        PreviewAppend += `<div class="-db-h11-white-21px-25">Powered by</div>`;
                        PreviewAppend += `<div><img src="${homeDetails[0].head_img_srl}" style="width:130px; height: auto; margin-left: 20px;"></div>`;
                        PreviewAppend += `</div>`;
                        PreviewAppend += `</div>`;
                        PreviewAppend += `<div class="-db-h1-white-124px-149-bold" style="margin: 200px 80px 0 80px; color:${homeDetails[0].cptn_bg_clr};">${homeDetails[0].cptn_data || ""} </div>`;
                        PreviewAppend += `</div>`;
                        PreviewAppend += `<div class="db-TktBtn" style="margin-top:101px;"><a href="#">`;
                        PreviewAppend += `<div class="db-TktHdrRf">`;
                        PreviewAppend += `<div><img src="${dynamicBaseUrl}/images/db-Chevron-plus.svg" style="width:60px; height: auto; margin-right: 37px;"></div>`;
                        PreviewAppend += `<div>`;
                        PreviewAppend += `<div class="TktHdr -db-h4-40px-51-bold">Buy tickets</div>`;
                        PreviewAppend += `<div class="TktSubHdr -db-h6-grey-35px-44" style="margin-top: 10px;">Find trips by coach and train</div>`;
                        PreviewAppend += `</div>`;
                        PreviewAppend += `</div>`;
                        PreviewAppend += `<div><img src="${dynamicBaseUrl}/images/db-right-arrow-black.svg" style="width:12px; height:auto;"></div>`;
                        PreviewAppend += `</a></div>`;
                        PreviewAppend += `<div class="db-TktBtn" style="margin-top:41px;"><a href="#">`;
                        PreviewAppend += `<div class="db-TktHdrRf">`;
                        PreviewAppend += `<div><img src="${dynamicBaseUrl}/images/db-Chevron-cancel.svg" style="width:60px; height: auto; margin-right: 37px;"></div>`;
                        PreviewAppend += `<div>`;
                        PreviewAppend += `<div class="TktHdr -db-h4-40px-51-bold">Change of plans?</div>`;
                        PreviewAppend += `<div class="TktSubHdr -db-h6-grey-35px-44" style="margin-top: 10px;">Cancel your booking</div>`;
                        PreviewAppend += `</div>`;
                        PreviewAppend += `</div>`;
                        PreviewAppend += `<div><img src="${dynamicBaseUrl}/images/db-right-arrow-black.svg" style="width:12px; height:auto;"></div>`;
                        PreviewAppend += `</a></div>`;
                    }

                    PreviewAppend += "<script type=\"text/javascript\">";
                    PreviewAppend += "$('.slider').bxSlider({";
                    PreviewAppend += "auto: true,";
                    PreviewAppend += "pager: true,";
                    PreviewAppend += "speed: 2000";
                    PreviewAppend += "});";
                    PreviewAppend += "document.getElementById(\"tchone\").addEventListener(\"click\", function () {";
                    PreviewAppend += "window.location.href = \"javascript:void(0)\";";
                    PreviewAppend += "});";

                    PreviewAppend += "$('.sliderx').bxSlider({";
                    PreviewAppend += "minSlides: 4.4,";
                    PreviewAppend += "touchEnabled: true,";
                    PreviewAppend += "maxSlides: 4.4,";
                    PreviewAppend += "moveSlides: 1,";
                    PreviewAppend += "slideWidth: 300,";
                    PreviewAppend += "slideMargin: 10,";
                    PreviewAppend += "auto: false,";
                    PreviewAppend += "pager: false,";
                    PreviewAppend += "controls: true,";
                    //PreviewAppend += "speed: 500";
                    PreviewAppend += "});";
                    PreviewAppend += "document.getElementById(\"tchone2\").addEventListener(\"click\", function () {";
                    PreviewAppend += "window.location.href = \"javascript:void(0)\";";
                    PreviewAppend += "});";
                    PreviewAppend += "</script>";

                    PreviewAppend += "</body>";
                    PreviewAppend += "</html>";

                    console.log("PreviewAppend : ", PreviewAppend);
                    model.HtmlEditor = PreviewAppend;
                    Utils.openHtmlInWindow(model.HtmlEditor);

                    this.updateUI();
                }
            }
            catch (ex) {
                console.log("Error in load preview page : ", ex);
            }
            finally {
                me.updateUI();
            }
        });
    }
}