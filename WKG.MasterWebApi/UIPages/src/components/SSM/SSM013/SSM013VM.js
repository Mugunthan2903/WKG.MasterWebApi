import { WKLWindowStyles, Utils } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SSM013VM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SSM012';
        this.init();
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM013";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.ExistingPrdList = {};
        model.imageCopytodo = null;
        model.imageCopyslide = null;
        model.imageCopysec5 = null;
        model.ImageNameExists = null;
        model.DefaultType_sec2 = {};
        model.Image_sec2 = "";
        model.BGColor_sec2 = "";
        model.Btn_sec2 = "";
        model.img_srl = null;
        model.todo_srl = this.props.data.todo_srl;
        model.hmpg_srl = this.props.data.hmpg_srl;
        model.SectionType = this.props.data.flag;
        model.IsEdit = this.props.data.isEdit;
        model.Pos_Grp_ID = this.props.data.pos_grp_id;
        model.HeaderTextList_Sec4 = this.props.data.HeaderSelectList;
        model.TodoList = this.props.data.TodoList;
        model.TotalAvailForList_sec2 = this.props.data.TodoList;
        model.FormList = this.props.data.FormList;
        model.SuppList = [];
        model.ProductList = [];
        model.ProductListAll = [];
        model.CategoryList = [];
        model.CategoryListAll = [];
        model.oldImg = false;
        model.Modifiedon = "";
        model.Modifiedby = "";
        model.radios = {
            page: '',
            product: '',
            category: '',
        }
        model.section2 = {
            ToDoName_sec2: null,
            Type_sec2: model.DefaultType_sec2,
            TotalAvail_sec2: "",
            TotalAvailFor_sec2: null,
            Backgroundcolor_sec2: "",
            Gradientcolor_sec2: "",
            imagearr: null,
            Image_sec2: null,
            SortOrder_sec2: "",
            ToLink_sec2: null,
            Status_sec2: true,
            LinkType_sec2: '',
            supp_sec2: null,
            Product_sec2: null,
            category_sec2: null
        };
        model.section3 = {
            File_sec3: null,
            sortOrdr_sec3: "",
            imagearr: null,
            toLink_sec3: null,
            IsSelected_sec3: true,
            //pgRprd: '',
            supp_sec3: null,
            Product_sec3: null,
            LinkType_sec3: '',
            category_sec3: null
        };
        model.section4 = {
            ContentText_sec4: null,
            Backgroundcolor_sec4: "",
            ImageFile_sec4: null,
            imagearr: null,
            sortOrder_sec4: "",
            //FormId_sec4: null,
            IsSelected_sec4: true,
            toLink_sec4: null,
            supp_sec4: null,
            Product_sec4: null,
            LinkType_sec4: '',
            category_sec4: null
        };
        this.newMode();
    }
    newMode() {
        const model = this.Data;
        model.section2 = {
            ToDoName_sec2: null,
            Type_sec2: model.DefaultType_sec2,
            TotalAvail_sec2: "",
            TotalAvailFor_sec2: null,
            Backgroundcolor_sec2: "",
            Gradientcolor_sec2: "",
            imagearr: null,
            Image_sec2: null,
            SortOrder_sec2: "",
            ToLink_sec2: null,
            Status_sec2: true,
            LinkType_sec2: '',
            supp_sec2: null,
            Product_sec2: null,
            category_sec2: null
        };
        model.section3 = {
            File_sec3: null,
            sortOrdr_sec3: "",
            imagearr: null,
            toLink_sec3: null,
            IsSelected_sec3: true,
            //pgRprd: '',
            LinkType_sec3: '',
            supp_sec3: null,
            Product_sec3: null,
            category_sec3: null
        };
        model.section4 = {
            ContentText_sec4: null,
            Backgroundcolor_sec4: "",
            ImageFile_sec4: null,
            imagearr: null,
            sortOrder_sec4: "",
            //FormId_sec4: null,
            IsSelected_sec4: true,
            toLink_sec4: null,
            supp_sec4: null,
            Product_sec4: null,
            LinkType_sec4: '',
            category_sec4: null
        };
        this.setTitle();
        this.updateUI();
        if (model.SectionType === 4) {
            const dataCopyEx = this.getData4();
            this.Data.DataCopy = JSON.stringify(dataCopyEx);
        } else if (model.SectionType === 3) {
            const dataCopyEx = this.getData3();
            this.Data.DataCopy = JSON.stringify(dataCopyEx);
        } else if (model.SectionType === 2) {
            const dataCopyEx = this.getData2();
            this.Data.DataCopy = JSON.stringify(dataCopyEx);
        }
    }
    loadInitData() {
        let model = this.Data;
        if (model.SectionType === 4) {
            const me = this;
            const dataInfo = {};
            dataInfo.pos_grp_id = model.Pos_Grp_ID;
            dataInfo.hmpg_srl = model.hmpg_srl;
            dataInfo.img_dir = "ssm";
            // dataInfo.pos_grp_id = this.props.data.Grp_ID;
            model.Loading = true;
            this.updateUI();
            cntrl.Utils.ajax({ url: `${this._WebApi}/SSM012LoadInitData5Async`, data: dataInfo }, (r) => {
                try {
                    model.Loading = false;
                    if (r) {
                        if (!Utils.isNullOrEmpty(r.ImageName)) {
                            model.ImageNameExists = r.ImageName.split(',');
                        }
                        model.SuppList = r.supplierList.map(e => ({ ID: e.id, Text: e.supp_map_id }));
                        model.CategoryListAll = r.TourCategoryList.map(e => ({ ID: e.tour_ctgry_id, Text: e.tour_ctgry_nam }))
                        model.CategoryList = r.TourCategoryList.filter(ex => ex.act_inact_ind).map(e => ({ ID: e.tour_ctgry_id, Text: e.tour_ctgry_nam }))
                        if (r.cntTxtExist) {
                            model.section4.ContentText_sec4 = model.HeaderTextList_Sec4.find(e => e.ID === r.cptn_data_srl) ?? null;
                            model.section4.Backgroundcolor_sec4 = r.cptn_bg_clr;
                            model.section4.ImageFile_sec4 = r.bg_img;
                            model.section4.sortOrder_sec4 = r.sort_ordr;
                            model.section4.toLink_sec4 = model.FormList.find(e => e.ID === r.form_id) ?? null;
                            //model.section4.FormId_sec4 = model.FormList.find(e => e.ID === r.form_id) ?? null;
                            model.section4.LinkType_sec4 = ((r.wkg_ctgry_id !== null && r.form_id !== null) ? "CATEGORY" : (r.form_id !== null || (r.form_id === null && r.supp_map_id === null && r.prod_id === null && r.wkg_ctgry_id === null) ? "PAGE" : "PRODUCT"));
                            model.section4.supp_sec4 = model.SuppList.find(e => e.Text === r.supp_map_id) ?? null;
                            model.section4.category_sec4 = model.CategoryListAll.find(ex => ex.ID === r.wkg_ctgry_id) || null;
                            model.section4.IsSelected_sec4 = r.act_inact_ind;
                            model.img_srl = r.img_srl;
                            model.Modifiedon = r.mod_dttm;
                            model.Modifiedby = r.mod_by_usr_cd;
                            if (r.supp_map_id)
                                me.getProductList(r.supp_map_id, r.prod_id);
                        }
                        if (!r.cntTxtExist) {
                            model.section4.LinkType_sec4 = r.LinkTypeSC.Page;
                        }
                    }
                }
                catch (ex) { }
                finally {
                    me.setTitle();
                    me.updateUI();
                    var dataCopyEx = me.getData4();
                    model.imageCopysec5 = JSON.stringify(model.section4.ImageFile_sec4);
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                    me.Data.radios.page = r.LinkTypeSC.Page;
                    me.Data.radios.product = r.LinkTypeSC.Product;
                    me.Data.radios.category = r.LinkTypeSC.Category;
                }
            });
        }
        if (model.SectionType === 3) {
            const me = this;
            const dataInfo = {};
            dataInfo.pos_grp_id = model.Pos_Grp_ID;
            dataInfo.slide_srl = this.props.data.slide_srl;
            dataInfo.img_dir = "slide";
            // dataInfo.pos_grp_id = this.props.data.Grp_ID;
            model.Loading = true;
            this.updateUI();
            cntrl.Utils.ajax({ url: `${this._WebApi}/SSM012LoadInitData3Async`, data: dataInfo }, (r) => {
                try {
                    if (r) {
                        model.Loading = false;
                        if (!Utils.isNullOrEmpty(r.ImageName)) {
                            model.ImageNameExists = r.ImageName.split(',');
                        }
                        model.SuppList = r.supplierList.map(e => ({ ID: e.id, Text: e.supp_map_id }));
                        model.CategoryListAll = r.TourCategoryList.map(e => ({ ID: e.tour_ctgry_id, Text: e.tour_ctgry_nam }))
                        model.CategoryList = r.TourCategoryList.filter(ex => ex.act_inact_ind).map(e => ({ ID: e.tour_ctgry_id, Text: e.tour_ctgry_nam }))
                        if (r.cntTxtExist) {
                            model.section3.File_sec3 = r.bg_img;
                            model.section3.sortOrdr_sec3 = r.sort_ordr;
                            model.section3.toLink_sec3 = model.FormList.find(e => e.ID === r.form_id) ?? null;
                            model.section3.IsSelected_sec3 = r.act_inact_ind;
                            model.img_srl = r.img_srl;
                            //model.section3.LinkType_sec3 = (r.form_id !== null || (r.form_id === null && r.supp_map_id === null && r.prod_id === null && r.wkg_ctgry_id === null)) ? "PAGE" : (r.supp_map_id !== null ? "PRODUCT" : "CATEGORY");
                            model.section3.LinkType_sec3 = ((r.wkg_ctgry_id !== null && r.form_id !== null) ? "CATEGORY" : (r.form_id !== null || (r.form_id === null && r.supp_map_id === null && r.prod_id === null && r.wkg_ctgry_id === null) ? "PAGE" : "PRODUCT"));

                            model.section3.supp_sec3 = model.SuppList.find(e => e.Text === r.supp_map_id) ?? null;
                            model.section3.category_sec3 = model.CategoryListAll.find(ex => ex.ID === r.wkg_ctgry_id) || null;
                            model.Modifiedon = r.mod_dttm;
                            model.Modifiedby = r.mod_by_usr_cd;
                            if (r.supp_map_id)
                                me.getProductList(r.supp_map_id, r.prod_id);
                        }
                        if (!r.cntTxtExist) {
                            model.section3.LinkType_sec3 = r.LinkTypeSC.Page;
                        }
                    }
                }
                catch (ex) {
                    console.log(ex);
                }
                finally {
                    me.setTitle();
                    me.updateUI();
                    var dataCopyEx = me.getData3();
                    model.imageCopyslide = JSON.stringify(model.section3.File_sec3);
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                    me.Data.radios.page = r.LinkTypeSC.Page;
                    me.Data.radios.product = r.LinkTypeSC.Product;
                    me.Data.radios.category = r.LinkTypeSC.Category;
                }
            });
        }
        if (model.SectionType === 2) {
            const me = this;
            const dataInfo = {};
            dataInfo.pos_grp_id = model.Pos_Grp_ID;
            dataInfo.todo_srl = model.todo_srl;
            dataInfo.img_dir = "todo";
            // dataInfo.pos_grp_id = this.props.data.Grp_ID;
            model.Loading = true;
            this.updateUI();
            cntrl.Utils.ajax({ url: `${this._WebApi}/SSM012LoadInitDataSec2Async`, data: dataInfo }, (r) => {
                try {
                    model.Loading = false;
                    if (r) {
                        if (!Utils.isNullOrEmpty(r.ImageName)) {
                            model.ImageNameExists = r.ImageName.split(',');
                        }
                        model.SuppList = r.supplierList.map(e => ({ ID: e.id, Text: e.supp_map_id }));
                        model.CategoryListAll = r.TourCategoryList.map(e => ({ ID: e.tour_ctgry_id, Text: e.tour_ctgry_nam }))
                        model.CategoryList = r.TourCategoryList.filter(ex => ex.act_inact_ind).map(e => ({ ID: e.tour_ctgry_id, Text: e.tour_ctgry_nam }))
                        model.TypeList_sec2 = r.TypeList;
                        model.DefaultType_sec2 = r.TypeList.find((data) => (data.Default === true));
                        model.Image_sec2 = r.Image;
                        model.BGColor_sec2 = r.BackgroundColor;
                        model.Btn_sec2 = r.Button;

                        model.TotalAvailForList_sec2 = r.todoList.map(e => ({ ID: e.data_srl, Text: e.enGB }));
                        if (r.todoExist) {
                            model.TodoList = r.todoList.map(e => ({ ID: e.data_srl, Text: e.enGB }));
                            model.section2.ToDoName_sec2 = model.TodoList.find(e => e.ID === r.data.data_srl) ?? null;
                            model.section2.Backgroundcolor_sec2 = r.data.todo_bg_clr;
                            model.section2.Gradientcolor_sec2 = r.data.todo_grdnt_clr;
                            model.section2.Image_sec2 = r.data.todo_img;
                            model.section2.SortOrder_sec2 = r.data.sort_ordr;
                            model.section2.ToLink_sec2 = model.FormList.find(e => e.ID === r.data.form_id) ?? null;
                            model.section2.Status_sec2 = r.data.act_inact_ind;
                            model.img_srl = r.data.img_srl;
                            //model.section2.LinkType_sec2 = (r.data.form_id !== null || (r.data.form_id === null && r.data.supp_map_id === null && r.data.prod_id === null && r.data.wkg_ctgry_id === null)) ? "PAGE" : (r.data.supp_map_id !== null ? "PRODUCT" : "CATEGORY");
                            model.section2.LinkType_sec2 = ((r.data.wkg_ctgry_id !== null && r.data.form_id !== null) ? "CATEGORY" : (r.data.form_id !== null || (r.data.form_id === null && r.data.supp_map_id === null && r.data.prod_id === null && r.data.wkg_ctgry_id === null) ? "PAGE" : "PRODUCT"));
                            model.section2.supp_sec2 = model.SuppList.find(ex => ex.Text === r.data.supp_map_id) || null;
                            model.section2.category_sec2 = model.CategoryListAll.find(ex => ex.ID === r.data.wkg_ctgry_id) || null;
                            model.Modifiedon = r.data.mod_dttm;
                            model.Modifiedby = r.data.mod_by_usr_cd;
                            model.section2.TotalAvail_sec2 = r.data.tot_aval_txt;
                            model.section2.Type_sec2 = model.TypeList_sec2.find(e => e.ID === r.data.sec_typ) ?? model.DefaultType_sec2;
                            model.section2.TotalAvailFor_sec2 = model.TotalAvailForList_sec2.find(e => e.ID === r.data.aval_typ_data_srl) ?? null;
                            if (r.data.supp_map_id)
                                me.getProductList(r.data.supp_map_id, r.data.prod_id);
                        }
                        if (!r.todoExist) {
                            model.section2.LinkType_sec2 = r.LinkTypeSC.Page;
                            model.section2.Type_sec2 = model.DefaultType_sec2;
                        }
                    }
                }
                catch (ex) { }
                finally {
                    me.setTitle();
                    me.updateUI();
                    var dataCopyEx = me.getData2();
                    model.imageCopytodo = JSON.stringify(model.section2.Image_sec2);
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                    me.Data.radios.page = r.LinkTypeSC.Page;
                    me.Data.radios.product = r.LinkTypeSC.Product;
                    me.Data.radios.category = r.LinkTypeSC.Category;
                }
            });
        }
    }
    handleSave() {
        const model = this.Data;
        const me = this;

        if (model.SectionType === 4) {
            if (model.section4.ContentText_sec4 === null) {
                const opts = {
                    text: "Please Select Content Text",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.setFocus("ContentText_sec4");
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            if (model.section4.Backgroundcolor_sec4 === "") {
                const opts = {
                    text: "Please Select Background Color",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.setFocus("Backgroundcolor_sec4");
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            if (model.section4.ImageFile_sec4 === "" || model.section4.ImageFile_sec4 === null) {
                const opts = {
                    text: "Please Select Image",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            if (model.section4.supp_sec4 !== null && model.section4.Product_sec4 === null) {
                const opts = {
                    text: "Please Select Product",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.setFocus("Product_sec4");
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            if (!this.isValueChanged()) {
                const opts = {
                    text: "No changes has been made.",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            const dataInfo = {
                pos_grp_id: model.Pos_Grp_ID,
                cptn_data_srl: model.section4.ContentText_sec4 === null ? null : model.section4.ContentText_sec4.ID,
                cptn_bg_clr: model.section4.Backgroundcolor_sec4,
                bg_img: model.section4.ImageFile_sec4,
                sort_ordr: model.section4.sortOrder_sec4,
                //form_id: model.section4.FormId_sec4 === null ? null : model.section4.FormId_sec4.ID,
                form_id: (model.section4.LinkType_sec4 === "CATEGORY" && model.section4.category_sec4 !== null) ? "ATR" : (model.section4.toLink_sec4 === null ? null : model.section4.toLink_sec4.ID),
                supp_map_id: model.section4.supp_sec4 ? model.section4.supp_sec4.Text : null,
                prod_id: model.section4.Product_sec4 ? model.section4.Product_sec4.ID : null,
                linkType: model.section4.LinkType_sec4,
                hmpg_srl: model.hmpg_srl,
                img_srl: model.img_srl,
                isImageChanged: this.isImageChangedSec5(),
                act_inact_ind: model.section4.IsSelected_sec4,
                mode: model.IsEdit ? "UPDATE" : "INSERT",
                mod_by_usr_cd: cntrl.ApiManager.getUser().ID,
                oldImage: model.oldImg,
                wkg_ctgry_id: model.section4.category_sec4 ? model.section4.category_sec4.ID : null
            }
            model.Loading = true;
            this.updateUI();
            cntrl.Utils.ajax({ url: `${this._WebApi}/SSM012SaveDataSec5Async`, data: dataInfo, files: model.section4.imagearr || [] }, (r) => {
                if (r && r.IsSuccess) {
                    model.Loading = false;
                    const opts = {
                        text: "Data Saved Successfully",
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => {
                            me.close();
                        }
                    };
                    this.showMessageBox(opts);
                } else {
                    model.Loading = false;
                    const opts = {
                        text: "Something went Wrong",
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => { }
                    };
                    this.showMessageBox(opts);
                }
            });
        } else if (model.SectionType === 3) {
            if (model.section3.File_sec3 === null || model.section3.File_sec3 === "") {
                const opts = {
                    text: "Please Select Image",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.setFocus("File_sec3");
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            if (model.section3.supp_sec3 !== null && model.section3.Product_sec3 === null) {
                const opts = {
                    text: "Please Select Product",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.setFocus("Product_sec3");
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            if (!this.isValueChanged()) {
                const opts = {
                    text: "No changes has been made.",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => { }
                };
                this.showMessageBox(opts);
                return;
            }
            const dataInfo = {
                pos_grp_id: model.Pos_Grp_ID,
                bg_img: model.section3.File_sec3,
                slide_srl: this.props.data.slide_srl,
                sort_ordr: model.section3.sortOrdr_sec3,
                //form_id: (model.section3.LinkType_sec3 === "CATEGORY" && model.section3.category_sec3 !== null) ? "ATR" : (model.section3.toLink_sec3 === null ? null : model.section3.toLink_sec3.ID),
                form_id: (model.section3.LinkType_sec3 === "CATEGORY" && model.section3.category_sec3 !== null) ? "ATR" : (model.section3.toLink_sec3 === null ? null : model.section3.toLink_sec3.ID),
                supp_map_id: model.section3.supp_sec3 ? model.section3.supp_sec3.Text : null,
                prod_id: model.section3.Product_sec3 ? model.section3.Product_sec3.ID : null,
                linkType: model.section3.LinkType_sec3,
                act_inact_ind: model.section3.IsSelected_sec3,
                img_srl: model.img_srl,
                isImageChanged: this.isImageChangedSlide(),
                mode: model.IsEdit ? "UPDATE" : "INSERT",
                mod_by_usr_cd: cntrl.ApiManager.getUser().ID,
                oldImage: model.oldImg,
                wkg_ctgry_id: model.section3.category_sec3 ? model.section3.category_sec3.ID : null
            }
            model.Loading = true;
            this.updateUI();
            cntrl.Utils.ajax({ url: `${this._WebApi}/SSM012SaveDataSec3Async`, data: dataInfo, files: model.section3.imagearr || [] }, (r) => {
                if (r && r.IsSuccess) {
                    model.Loading = false;
                    const opts = {
                        text: "Data Saved Successfully",
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => {
                            me.close();
                        }
                    };
                    this.showMessageBox(opts);
                } else {
                    model.Loading = false;
                    const opts = {
                        text: "Something went Wrong",
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => { }
                    };
                    this.showMessageBox(opts);
                }
            });
        } else if (model.SectionType === 2) {
            if (model.section2.Type_sec2 === null) {
                const opts = {
                    text: "Please Select Type",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.setFocus("Type_sec2");
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            if (model.section2.ToDoName_sec2 === null) {
                const opts = {
                    text: "Please Select To do Name",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.setFocus("ToDoName_sec2");
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            if ((!cntrl.Utils.isNullOrEmpty(model.section2.Type_sec2) && (model.section2.Type_sec2.ID === model.Btn_sec2 || model.section2.Type_sec2.ID === model.BGColor_sec2)) && cntrl.Utils.isNullOrEmpty(model.section2.Backgroundcolor_sec2)) {
                const opts = {
                    text: "Please Select Background Color",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.setFocus("Backgroundcolor_sec2");
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            if ((!cntrl.Utils.isNullOrEmpty(model.section2.Type_sec2) && model.section2.Type_sec2.ID === model.BGColor_sec2) && cntrl.Utils.isNullOrEmpty(model.section2.Gradientcolor_sec2)) {
                const opts = {
                    text: "Please Select Gradient Color",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.setFocus("Gradientcolor_sec2");
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            if ((!cntrl.Utils.isNullOrEmpty(model.section2.Type_sec2) && (model.section2.Type_sec2.ID === model.Image_sec2 || model.section2.Type_sec2.ID === model.BGColor_sec2)) && (model.section2.Image_sec2 === '' || model.section2.Image_sec2 === null)) {
                const opts = {
                    text: "Please Select Image",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            if (model.section2.supp_sec2 !== null && model.section2.Product_sec2 === null) {
                const opts = {
                    text: "Please Select Product",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => {
                        me.setFocus("Product_sec2");
                    }
                };
                this.showMessageBox(opts);
                return;
            }
            if (!this.isValueChanged()) {
                const opts = {
                    text: "No changes has been made.",
                    messageboxType: cntrl.WKLMessageboxTypes.info,
                    onClose: (_e) => { }
                };
                this.showMessageBox(opts);
                return;
            }
            const dataInfo = {
                pos_grp_id: model.Pos_Grp_ID,
                data_srl: model.section2.ToDoName_sec2 === null ? null : model.section2.ToDoName_sec2.ID,
                tot_aval_txt: (model.section2.Type_sec2 && model.section2.Type_sec2.ID !== model.Image_sec2) ? null : model.section2.TotalAvail_sec2,
                sec_typ: model.section2.Type_sec2 === null ? null : model.section2.Type_sec2.ID,
                aval_typ_data_srl: (model.section2.Type_sec2 && model.section2.Type_sec2.ID !== model.Image_sec2) ? null : (model.section2.TotalAvailFor_sec2 === null ? null : model.section2.TotalAvailFor_sec2.ID),
                todo_srl: model.todo_srl,
                todo_bg_clr: (model.section2.Type_sec2 && model.section2.Type_sec2.ID === model.Image_sec2) ? null : model.section2.Backgroundcolor_sec2,
                todo_grdnt_clr: model.section2.Gradientcolor_sec2,
                todo_img: (model.section2.Type_sec2 && model.section2.Type_sec2.ID === model.Btn_sec2) ? null : model.section2.Image_sec2,
                sort_ordr: model.section2.SortOrder_sec2,
                //form_id: model.section2.ToLink_sec2 === null ? null : model.section2.ToLink_sec2.ID,
                form_id: (model.section2.LinkType_sec2 === "CATEGORY" && model.section2.category_sec2 !== null) ? "ATR" : (model.section2.ToLink_sec2 === null ? null : model.section2.ToLink_sec2.ID),
                act_inact_ind: model.section2.Status_sec2,
                isImageChanged: this.isImageChangedTodo(),
                img_srl: (model.section2.Type_sec2 && model.section2.Type_sec2.ID === model.Btn_sec2) ? null : model.img_srl,
                mode: model.IsEdit ? "UPDATE" : "INSERT",
                mod_by_usr_cd: cntrl.ApiManager.getUser().ID,
                oldImage: model.oldImg,
                linkType: model.section2.LinkType_sec2,
                supp_map_id: model.section2.supp_sec2 ? model.section2.supp_sec2.Text : null,
                prod_id: model.section2.Product_sec2 ? model.section2.Product_sec2.ID : null,
                wkg_ctgry_id: model.section2.category_sec2 ? model.section2.category_sec2.ID : null
            }
            model.Loading = true;
            this.updateUI();
            console.log(dataInfo)
            cntrl.Utils.ajax({ url: `${this._WebApi}/SSM012SaveDataSec2Async`, data: dataInfo, files: model.section2.imagearr || [] }, (r) => {
                if (r && r.IsSuccess) {
                    model.Loading = false;
                    const opts = {
                        text: "Data Saved Successfully",
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => {
                            me.close();
                        }
                    };
                    this.showMessageBox(opts);
                } else {
                    model.Loading = false;
                    const opts = {
                        text: "Something went Wrong",
                        messageboxType: cntrl.WKLMessageboxTypes.info,
                        onClose: (_e) => { }
                    };
                    this.showMessageBox(opts);
                }
            });
        }

    }
    // checkExistTodo() {
    //     const me = this;
    //     const model = this.Data;
    //     const dataInfo = { data_srl: model.section2.ToDoName_sec2 === null ? null : model.section2.ToDoName_sec2.ID, pos_grp_id: model.Pos_Grp_ID }
    //     this.updateUI();
    //     cntrl.Utils.ajax({ url: `${this._WebApi}/SSM012TodoExistSec2Async`, data: dataInfo }, (r) => {
    //         if (r && r.todoExist) {
    //             me.showConfirmation("Record already exists.Do you want to retrieve?", false, (e) => {
    //                 if (e === 0) {
    //                     model.IsEdit = true;
    //                     model.section2.ToDoName_sec2 = model.TodoList.find(e => e.ID === r.data_srl) ?? null;
    //                     model.section2.Backgroundcolor_sec2 = r.todo_bg_clr;
    //                     model.section2.Gradientcolor_sec2 = r.todo_grdnt_clr;
    //                     model.section2.Image_sec2 = r.todo_img;
    //                     model.section2.SortOrder_sec2 = r.sort_ordr;
    //                     model.section2.ToLink_sec2 = model.FormList.find(e => e.ID === r.form_id) ?? null;
    //                     model.section2.Status_sec2 = r.act_inact_ind;
    //                     model.img_srl = r.img_srl;
    //                     model.todo_srl = r.todo_srl;
    //                     //model.section2.LinkType_sec2 = (r.form_id !== null || (r.form_id === null && r.supp_map_id === null && r.prod_id === null && r.wkg_ctgry_id === null)) ? "PAGE" : (r.supp_map_id !== null ? "PRODUCT" : "CATEGORY");
    //                     model.section2.LinkType_sec2 = ((r.wkg_ctgry_id !== null && r.form_id !== null) ? "CATEGORY" : (r.form_id !== null || (r.form_id === null && r.supp_map_id === null && r.prod_id === null && r.wkg_ctgry_id === null) ? "PAGE" : "PRODUCT"));
    //                     model.section2.supp_sec2 = model.SuppList.find(ex => ex.Text === r.supp_map_id) || null;
    //                     model.section2.category_sec2 = model.CategoryListAll.find(ex => ex.ID === r.wkg_ctgry_id) || null;
    //                     model.Modifiedon = r.mod_dttm;
    //                     model.Modifiedby = r.mod_by_usr_cd;
    //                     me.setTitle();
    //                     me.updateUI();
    //                     var dataCopyEx = me.getData2();
    //                     model.imageCopytodo = JSON.stringify(model.section2.Image_sec2);
    //                     me.Data.DataCopy = JSON.stringify(dataCopyEx);
    //                     if (r.supp_map_id)
    //                         me.getProductList(r.supp_map_id, r.prod_id);
    //                 } else {
    //                     model.section2.ToDoName_sec2 = null;
    //                     me.setFocus("ToDoName_sec2");
    //                     me.updateUI();
    //                 }
    //             })
    //         }
    //         me.updateUI();
    //     });
    // }
    onBlurCheck(name) {
        const model = this.Data;
        const me = this;
        if (!Utils.isNullOrEmpty(model.ImageNameExists)) {
            if (model.ImageNameExists.includes(name)) {
                me.showAlert('Image already exists.');
                if (model.SectionType === 2) {
                    model.section2.Image_sec2 = null;
                    model.section2.imagearr = null;
                } else if (model.SectionType === 3) {
                    model.section3.File_sec3 = null;
                    model.section3.imagearr = null;
                } else if (model.SectionType === 4) {
                    model.section4.ImageFile_sec4 = null;
                    model.section4.imagearr = null;
                }
            }
        }
        this.updateUI();
    }
    checkExistSec5() {
        const me = this;
        const model = this.Data;

        const dataInfo = {};
        dataInfo.pos_grp_id = model.Pos_Grp_ID;
        dataInfo.cptn_data_srl = model.section4.ContentText_sec4 === null ? null : model.section4.ContentText_sec4.ID;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM012ContentTextExistAsync`, data: dataInfo }, (r) => {
            if (r && r.cntTxtExist) {
                me.showConfirmation("Record already exists.Do you want to retrieve?", false, (e) => {
                    try {
                        if (e === 0) {
                            model.IsEdit = true;
                            model.section4.ContentText_sec4 = model.HeaderTextList_Sec4.find(e => e.ID === r.cptn_data_srl) ?? null;
                            model.section4.Backgroundcolor_sec4 = r.cptn_bg_clr;
                            model.section4.ImageFile_sec4 = r.bg_img;
                            model.section4.sortOrder_sec4 = r.sort_ordr;
                            model.section4.toLink_sec4 = model.FormList.find(e => e.ID === r.form_id) ?? null;
                            //model.section4.FormId_sec4 = model.FormList.find(e => e.ID === r.form_id) ?? null;
                            model.section4.LinkType_sec4 = ((r.wkg_ctgry_id !== null && r.form_id !== null) ? "CATEGORY" : (r.form_id !== null || (r.form_id === null && r.supp_map_id === null && r.prod_id === null && r.wkg_ctgry_id === null) ? "PAGE" : "PRODUCT"));
                            model.section4.supp_sec4 = model.SuppList.find(ex => ex.Text === r.supp_map_id) || null;
                            model.section4.category_sec4 = model.CategoryListAll.find(ex => ex.ID === r.wkg_ctgry_id) || null;
                            model.section4.IsSelected_sec4 = r.act_inact_ind;
                            model.img_srl = r.img_srl;
                            model.hmpg_srl = r.hmpg_srl;
                            model.Modifiedon = r.mod_dttm;
                            model.Modifiedby = r.mod_by_usr_cd;
                            me.setTitle();
                            me.updateUI();
                            var dataCopyEx = me.getData4();
                            model.imageCopysec5 = JSON.stringify(model.section4.ImageFile_sec4);
                            me.Data.DataCopy = JSON.stringify(dataCopyEx);
                            if (r.supp_map_id)
                                me.getProductList(r.supp_map_id, r.prod_id);
                        } else {
                            model.section4.ContentText_sec4 = null;
                            me.setFocus("ContentText_sec4");
                            me.updateUI();
                        }
                    } catch (ex) { }
                    finally {
                        me.updateUI();
                        var dataCopyEx = me.getData4();
                        model.imageCopysec5 = JSON.stringify(model.section4.ImageFile_sec4);
                        me.Data.DataCopy = JSON.stringify(dataCopyEx);
                    }
                })
            }
            me.updateUI();
        });
    }
    async getProductList(supp_map_id, prod_id) {
        const model = this.Data;
        const me = this;
        if (model.ExistingPrdList[`${supp_map_id}`]) {
            model.ProductList = model.ExistingPrdList[`${supp_map_id}`];
            if (prod_id) {
                if (model.SectionType === 3) {
                    model.section3.Product_sec3 = model.ProductListAll.find(e => e.ID === prod_id);
                    var dataCopyEx = me.getData3();
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                } else if (model.SectionType === 2) {
                    model.section2.Product_sec2 = model.ProductListAll.find(e => e.ID === prod_id);
                    var dataCopyEx = me.getData2();
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                }
                else if (model.SectionType === 4) {
                    model.section4.Product_sec4 = model.ProductListAll.find(e => e.ID === prod_id);
                    var dataCopyEx = me.getData4();
                    me.Data.DataCopy = JSON.stringify(dataCopyEx);
                }
            }
            return;
        }
        const dataInfo = { supp_map_id }
        model.Loading = true;
        this.updateUI();
        await cntrl.Utils.ajax({ url: `${this._WebApi}/SSM013GetProductList`, data: dataInfo }, (r) => {
            model.Loading = false;
            if (r) {
                try {
                    model.ProductListAll = r.ProductList.map(e => ({ ID: e.prod_id, Text: e.prod_nam }));
                    model.ProductList = r.ProductList.filter(ex => ex.act_inact_ind).map(e => ({ ID: e.prod_id, Text: e.prod_nam }));
                    if (prod_id) {
                        if (model.SectionType === 3) {
                            model.section3.Product_sec3 = model.ProductListAll.find(e => e.ID === prod_id);
                            var dataCopyEx = me.getData3();
                            me.Data.DataCopy = JSON.stringify(dataCopyEx);
                        } else if (model.SectionType === 2) {
                            model.section2.Product_sec2 = model.ProductListAll.find(e => e.ID === prod_id);
                            var dataCopyEx = me.getData2();
                            me.Data.DataCopy = JSON.stringify(dataCopyEx);
                        }
                        else if (model.SectionType === 4) {
                            model.section4.Product_sec4 = model.ProductListAll.find(e => e.ID === prod_id);
                            var dataCopyEx = me.getData4();
                            me.Data.DataCopy = JSON.stringify(dataCopyEx);
                        }
                    }
                    model.ExistingPrdList[`${supp_map_id}`] = model.ProductList;
                } catch (ex) { }
                finally {
                }
            }
            me.updateUI();
        });
    }
    getData2() {
        const model = this.Data.section2;
        const dataInfo = {
            ToDoName_sec2: model.ToDoName_sec2,
            Type_sec2: model.Type_sec2,
            TotalAvail_sec2: model.TotalAvail_sec2,
            TotalAvailFor_sec2: model.TotalAvailFor_sec2,
            Backgroundcolor_sec2: model.Backgroundcolor_sec2,
            Gradientcolor_sec2: model.Gradientcolor_sec2,
            Image_sec2: model.Image_sec2,
            SortOrder_sec2: model.SortOrder_sec2,
            ToLink_sec2: model.ToLink_sec2,
            Status_sec2: model.Status_sec2,
            LinkType_sec2: model.LinkType_sec2,
            supp_sec2: model.supp_sec2,
            Product_sec2: model.Product_sec2,
            category_sec2: model.category_sec2
        };
        return dataInfo;
    }
    getData3() {
        const model = this.Data.section3;
        const dataInfo = {};
        dataInfo.File_sec3 = model.File_sec3;
        dataInfo.sortOrdr_sec3 = model.sortOrdr_sec3;
        dataInfo.toLink_sec3 = model.toLink_sec3;
        dataInfo.IsSelected_sec3 = model.IsSelected_sec3;
        //dataInfo.pgRprd = model.pgRprd;
        dataInfo.LinkType_sec3 = model.LinkType_sec3;
        dataInfo.supp_sec3 = model.supp_sec3;
        dataInfo.Product_sec3 = model.Product_sec3;
        dataInfo.category_sec3 = model.category_sec3;
        return dataInfo;
    }
    getData4() {
        const model = this.Data.section4;
        const dataInfo = {
            ContentText_sec4: model.ContentText_sec4,
            Backgroundcolor_sec4: model.Backgroundcolor_sec4,
            ImageFile_sec4: model.ImageFile_sec4,
            sortOrder_sec4: model.sortOrder_sec4,
            //FormId_sec4: model.FormId_sec4,
            toLink_sec4: model.toLink_sec4,
            LinkType_sec4: model.LinkType_sec4,
            supp_sec4: model.supp_sec4,
            Product_sec4: model.Product_sec4,
            category_sec4: model.category_sec4,
            IsSelected_sec4: model.IsSelected_sec4

        };
        return dataInfo;
    }
    setTitle() {
        const model = this.Data;
        if (model.SectionType === 2) {
            model.Title = `${this.props.data.pos_grp_nam} / To Do / ${model.IsEdit ? `Edit / ${model.section2.ToDoName_sec2 !== null ? model.section2.ToDoName_sec2.Text : ""}` : "New"}`;
        } else if (model.SectionType === 3) {
            model.Title = `${this.props.data.pos_grp_nam} / Slider / ${model.IsEdit ? `Edit / ${model.section3.File_sec3}` : "New"}`;
        } else if (model.SectionType === 4) {
            model.Title = `${this.props.data.pos_grp_nam} / Concierge / ${model.IsEdit ? `Edit / ${model.section4.ContentText_sec4 !== null ? model.section4.ContentText_sec4.Text : ""}` : "New"}`;
        }
    }
    isValueChanged() {
        const model = this.Data;
        if (model.SectionType === 4) {
            var dataCopyEx = this.getData4();
            return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
        } else if (model.SectionType === 3) {
            var dataCopyEx = this.getData3();
            return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
        } else if (model.SectionType === 2) {
            var dataCopyEx = this.getData2();
            return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
        }
    }
    handleClear() {
        const model = this.Data;
        const me = this;
        if (!this.isValueChanged()) {
            if (model.SectionType === 2) {
                model.section2 = {
                    ToDoName_sec2: null,
                    Type_sec2: model.DefaultType_sec2,
                    TotalAvail_sec2: "",
                    TotalAvailFor_sec2: null,
                    Backgroundcolor_sec2: "",
                    Gradientcolor_sec2: "",
                    imagearr: null,
                    Image_sec2: null,
                    SortOrder_sec2: "",
                    ToLink_sec2: null,
                    Status_sec2: true,
                    LinkType_sec2: 'PAGE',
                    supp_sec2: null,
                    Product_sec2: null,
                    category_sec2: null
                };
                this.setFocus("ToDoName_sec2");
                model.IsEdit = false;
                var dataCopyEx = me.getData2();
                me.Data.DataCopy = JSON.stringify(dataCopyEx);
            } else if (model.SectionType === 3) {
                model.section3 = {
                    File_sec3: null,
                    sortOrdr_sec3: "",
                    imagearr: null,
                    toLink_sec3: null,
                    IsSelected_sec3: true,
                    //pgRprd: true,
                    LinkType_sec3: 'PAGE',
                    supp_sec3: null,
                    Product_sec3: null,
                    category_sec3: null
                };
                model.IsEdit = false;
                var dataCopyEx = me.getData3();
                me.Data.DataCopy = JSON.stringify(dataCopyEx);
            } else if (model.SectionType === 4) {
                model.section4 = {
                    ContentText_sec4: null,
                    Backgroundcolor_sec4: "",
                    ImageFile_sec4: null,
                    imagearr: null,
                    sortOrder_sec4: "",
                    //FormId_sec4: null,
                    toLink_sec4: null,
                    LinkType_sec4: 'PAGE',
                    supp_sec4: null,
                    Product_sec4: null,
                    category_sec4: null,
                    IsSelected_sec4: true
                };
                this.setFocus("ContentText_sec4");
                model.IsEdit = false;
                var dataCopyEx = me.getData4();
                me.Data.DataCopy = JSON.stringify(dataCopyEx);
            }

        } else {
            if (this.areFieldsEmpty()) {
                return;
            }
            let options = [{ text: 'Yes' }, { text: 'No' }];
            this.showMessageBox({
                text: "Unsaved changes exists. Save and proceed",
                buttons: options,
                messageboxType: cntrl.WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (_e === 0) {
                        me.handleSave();
                    } else if (_e === 1) {
                        if (model.SectionType === 2) {
                            model.section2 = {
                                ToDoName_sec2: null,
                                Type_sec2: model.DefaultType_sec2,
                                TotalAvail_sec2: "",
                                TotalAvailFor_sec2: null,
                                Backgroundcolor_sec2: "",
                                Gradientcolor_sec2: "",
                                Image_sec2: null,
                                SortOrder_sec2: "",
                                ToLink_sec2: null,
                                Status_sec2: true,
                                LinkType_sec2: 'PAGE',
                                supp_sec2: null,
                                Product_sec2: null,
                                category_sec2: null
                            };
                            me.setFocus("ToDoName_sec2");
                            model.IsEdit = false;
                            me.setTitle();
                            var dataCopyEx = me.getData2();
                            me.Data.DataCopy = JSON.stringify(dataCopyEx);
                        } else if (model.SectionType === 3) {
                            model.section3 = {
                                File_sec3: null,
                                sortOrdr_sec3: "",
                                imagearr: null,
                                toLink_sec3: null,
                                IsSelected_sec3: true,
                                //pgRprd: true,
                                LinkType_sec3: 'PAGE',
                                supp_sec3: null,
                                Product_sec3: null,
                                category_sec3: null
                            };
                            model.IsEdit = false;
                            me.setTitle();
                            var dataCopyEx = me.getData3();
                            me.Data.DataCopy = JSON.stringify(dataCopyEx);
                        } else if (model.SectionType === 4) {
                            model.section4 = {
                                ContentText_sec4: null,
                                Backgroundcolor_sec4: "",
                                ImageFile_sec4: null,
                                imagearr: null,
                                sortOrder_sec4: "",
                                //FormId_sec4: null,
                                toLink_sec4: null,
                                LinkType_sec4: 'PAGE',
                                supp_sec4: null,
                                Product_sec4: null,
                                category_sec4: null,
                                IsSelected_sec4: true
                            };
                            me.setFocus("ContentText_sec4");
                            model.IsEdit = false;
                            me.setTitle();
                            var dataCopyEx = me.getData4();
                            me.Data.DataCopy = JSON.stringify(dataCopyEx);
                        }
                    }
                }
            });
        }
        this.setTitle();
        this.updateUI();
    }
    showConfirmation(msg, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];

        this.showMessageBox({
            text: msg,
            buttons: options,
            messageboxType: cntrl.WKLMessageboxTypes.info,
            onClose: callback
        });
    }
    showAlert(errorMsg, name) {
        if (typeof errorMsg === 'number')
            errorMsg = cntrl.Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,
            messageboxType: cntrl.WKLMessageboxTypes.question
        };
        if (name) {
            opt.onClose = (_e) => {
                me.setFocus(name);
            }
        }
        this.showMessageBox(opt);
    }
    areFieldsEmpty() {
        const model = this.Data;
        if (model.SectionType === 2) {
            if (model.section2.ToDoName_sec2 === null && model.section2.Backgroundcolor_sec2 === "" && model.section2.Gradientcolor_sec2 === "" && model.section2.Image_sec2 === null && model.section2.SortOrder_sec2 === "" && model.section2.ToLink_sec2 === null && model.section2.Status_sec2 === false && model.section2.imagearr === null && model.section2.Type_sec2 === model.DefaultType_sec2 && model.section2.TotalAvail_sec2 === "" && model.section2.TotalAvailFor_sec2 === null) {
                return true;
            }
        } else if (model.SectionType === 3) {
            if (model.section3.File_sec3 === null && model.section3.sortOrdr_sec3 === "" && model.section3.toLink_sec3 === null && model.section3.IsSelected_sec3 === false) {
                return true;
            }
        } else if (model.SectionType === 4) {
            if (model.section4.ContentText_sec4 === null && model.section4.Backgroundcolor_sec4 === "" && model.section4.ImageFile_sec4 === null && model.section4.sortOrder_sec4 === "" && model.section4.toLink_sec4 === null && model.section4.IsSelected_sec4 === false) {
                return true;
            }
        }
        return false;
    };
    openWindow(type) {
        const me = this;
        const model = this.Data;
        if (type === "Addimg_todo") {
            this.showWindow({
                url: 'SSM/SSM009', data: { Title: this.props.data.Title, IsEdit: true, Prod_Name: 'To Do', Imag_Dir: 'todo' }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e) {
                        model.img_srl = e.img_srl;
                        model.section2.Image_sec2 = e.img_nam;
                        model.WKLImage_Url = e.img_url;
                        model.oldImg = true;
                    }
                }
            });
        } else if (type === "Addimg_slide") {
            this.showWindow({
                url: 'SSM/SSM009', data: { Title: this.props.data.Title, IsEdit: true, Prod_Name: 'Slide', Imag_Dir: 'slide' }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e) {
                        model.img_srl = e.img_srl;
                        model.section3.File_sec3 = e.img_nam;
                        model.WKLImage_Url = e.img_url;
                        model.oldImg = true;
                    }
                }
            });
        } else if (type === "Addimg_sec5") {
            this.showWindow({
                url: 'SSM/SSM009', data: { Title: this.props.data.Title, IsEdit: true, Prod_Name: 'Concierge', Imag_Dir: 'ssm' }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e) {
                        model.img_srl = e.img_srl;
                        model.section4.ImageFile_sec4 = e.img_nam;
                        model.WKLImage_Url = e.img_url;
                        model.oldImg = true;
                    }
                }
            });
        }
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    isImageChangedTodo() {
        const model = this.Data;
        return model.imageCopytodo !== JSON.stringify(model.section2.Image_sec2);
    }
    isImageChangedSlide() {
        const model = this.Data;
        return model.imageCopyslide !== JSON.stringify(model.section3.File_sec3);
    }
    isImageChangedSec5() {
        const model = this.Data;
        return model.imageCopysec5 !== JSON.stringify(model.section4.ImageFile_sec4);
    }
    doClose() {
        const me = this;
        if (this.isValueChanged()) {
            this.showConfirmation("Do you want to Discard the changes?", false, (_e) => {
                if (_e === 0) {
                    me.close();
                }
            })
        } else {
            this.close();
        }
    }
}