import React from 'react';
import SSM013VM from './SSM013VM';
import * as cntrl from '../../../wkl-components';

export default class SSM013 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM013VM(props));
        this.inputRefs = {};
    }
    // called on load
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
    }
    // called on closing
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };
    onRadioChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data.section3;
            if (e.target.name === 'pgRprd') {
                model.toLink_sec3 = null;
                model.supp_sec3 = null;
                model.Product_sec3 = null;
            }
            model[e.target.name] = e.target.value;
            this.VM.updateUI();
        }
    };
    onChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data;
            if (e.target && (e.target.name === 'LinkType_sec2')) {
                model.section2.ToLink_sec2 = null;
                model.section2.supp_sec2 = null;
                model.section2.Product_sec2 = null;
                model.section2.category_sec2 = null;
            }
            if (e.target && (e.target.name === 'LinkType_sec3')) {
                model.section3.toLink_sec3 = null;
                model.section3.supp_sec3 = null;
                model.section3.Product_sec3 = null;
                model.section3.category_sec3 = null;
            }
            if (e.target && (e.target.name === "LinkType_sec4")) {
                model.section4.toLink_sec4 = null;
                model.section4.supp_sec4 = null;
                model.section4.Product_sec4 = null;
                model.section4.category_sec4 = null;
            }
            if (model.SectionType === 2) {
                model = this.VM.Data.section2;
            } else if (model.SectionType === 3) {
                model = this.VM.Data.section3;
            } else if (model.SectionType === 4) {
                model = this.VM.Data.section4;
            }
            if (e.name) {
                model[e.name] = e.value;
            }
            else if (e.target && e.target.name) {
                model[e.target.name] = e.target.value;
            }

            this.updateUI();
        }
    }
    onImgChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data;
            if (model.SectionType === 2) {
                model = this.VM.Data.section2;
            } else if (model.SectionType === 3) {
                model = this.VM.Data.section3;
            } else if (model.SectionType === 4) {
                model = this.VM.Data.section4;
            }
            model.imagearr = e.files;
            model[e.name] = e.value;
            model.img_srl = null;
            model.oldImg = false;
            this.VM.onBlurCheck(e.value);
        }
        this.updateUI();
    }
    selectChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data;
            if (model.SectionType === 2) {
                model = this.VM.Data.section2
            } else if (model.SectionType === 3) {
                model = this.VM.Data.section3
            } else {
                model = this.VM.Data.section4
            }
            model[e.name] = e.value;
            if (e.value !== null) {
                // if (e.name === "ToDoName_sec2") {
                //     this.VM.checkExistTodo();
                if (e.name === "ContentText_sec4") {
                    this.VM.checkExistSec5();
                }
            }
            if (e.name === "category_sec2" || e.name === "category_sec3" || e.name === "category_sec4") {
                model.toLink_sec3 = null;
                model.ToLink_sec2 = null;
                model.toLink_sec4 = null;
            }
            if ((e.name === "supp_sec3" || e.name === "supp_sec2" || e.name === "supp_sec4") && e.value !== null) {
                this.VM.getProductList(e.value.Text);
                model.Product_sec3 = null;
                model.Product_sec2 = null;
                model.Product_sec4 = null;
            } else if ((e.name === "supp_sec3" || e.name === "supp_sec2" || e.name === "supp_sec4") && e.value === null) {
                this.VM.Data.ProductList = [];
                model.Product_sec3 = null;
                model.Product_sec2 = null;
                model.Product_sec4 = null;
            }
            this.VM.updateUI();
        }
    };
    onCheckChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data;
            if (model.SectionType === 2) {
                model = this.VM.Data.section2;
            } else if (model.SectionType === 3) {
                model = this.VM.Data.section3;
            } else if (model.SectionType === 4) {
                model = this.VM.Data.section4;
            }
            if (e.name)
                model[e.name] = e.value;
            else if (e.target && e.target.name)
                model[e.target.name] = !model[e.target.name];
            this.updateUI();
        }
    }
    // handles all button clicks
    clickAction = (e) => {
        if (this.VM) {
            if (e) {
                let action = e.id;
                if (action === undefined && e.target) {
                    action = e.target.name || e.target.id || '';
                    e = undefined;
                }
                if (!action) {
                    return;
                }

                try {
                    if (e && e.stopPropagation) {
                        e.stopPropagation();
                        e.preventDefault();
                        e.nativeEvent.stopImmediatePropagation();
                    }

                } catch (ex) { }


                if (action == "btn_close") {
                    this.VM.doClose();
                } else if (action === "btn_save") {
                    this.VM.handleSave();
                } else if (action === "btn_clear") {
                    this.VM.handleClear();
                } else if (action === "btn_Addimg_todo") {
                    this.VM.openWindow('Addimg_todo');
                } else if (action === "btn_Addimg_slide") {
                    this.VM.openWindow('Addimg_slide');
                } else if (action === "btn_Addimg_sec5") {
                    this.VM.openWindow('Addimg_sec5');
                }
            }
        }
    }
    // used to set focus for input controls based on name
    setFocus(name) {
        if (this.inputRefs && this.inputRefs[name] && this.inputRefs[name].focus) {
            try {
                this.inputRefs[name].focus(true);
            }
            catch {
                this.inputRefs[name].focus();
            }
        }
    }
    //function that adds ref of input controls to the inputRefs object based on name
    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }

    render() {
        const model = this.VM.Data;
        const sectionFlag = model.SectionType;
        const editFlag = model.IsEdit;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
        }

        return (
            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                {sectionFlag === 2 && (
                    <><div className="window-content-area p-3 vh-100" style={{ width: "40rem" }}>
                        <div className="container-fluid p-0">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className='row'>
                                        <div className="col-md-4  mb-3 px-2">
                                            <label className="col-form-label">Type<span className="text-danger text-mandatory">*</span></label>
                                            <cntrl.WKLSelect name="Type_sec2" compareKey="ID" displayField="Text" placeholder="Select Type" allowClear={false} ref={(el) => this.onRefChange(el, 'Type_sec2')} selectedItem={model.section2.Type_sec2} dataSource={model.TypeList_sec2} onChange={this.selectChange}>
                                            </cntrl.WKLSelect>
                                        </div>
                                        <div className="col-md-8  mb-3 px-2">
                                            <label className="col-form-label">To do Name<span className="text-danger text-mandatory">*</span></label>
                                            <cntrl.WKLSelect name="ToDoName_sec2" compareKey="ID" displayField="Text" placeholder="Select To do Name" allowClear={true} ref={(el) => this.onRefChange(el, 'ToDoName_sec2')} selectedItem={model.section2.ToDoName_sec2} dataSource={model.TodoList} onChange={this.selectChange}>
                                            </cntrl.WKLSelect>
                                        </div>
                                        {(model.section2.Type_sec2 && model.section2.Type_sec2.ID === model.Image_sec2) && <><div className="col-md-6  mb-3 px-2">
                                            <label className="col-form-label">Total Avalablity<span> (Example : 10+)</span></label>
                                            <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'TotalAvail_sec2')} name="TotalAvail_sec2" placeholder="Enter Total Avalablity" value={model.section2.TotalAvail_sec2} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.textbox} maxLength={20}>
                                            </cntrl.WKLTextbox>

                                        </div>
                                            <div className="col-md-6  mb-3 px-2">
                                                <label className="col-form-label">Total Avalablity For</label>
                                                <cntrl.WKLSelect name="TotalAvailFor_sec2" compareKey="ID" displayField="Text" placeholder="Select Total Avalablity For" allowClear={true} ref={(el) => this.onRefChange(el, 'TotalAvailFor_sec2')} selectedItem={model.section2.TotalAvailFor_sec2} dataSource={model.TotalAvailForList_sec2} onChange={this.selectChange}>
                                                </cntrl.WKLSelect>
                                            </div></>}
                                        {(model.section2.Type_sec2 && model.section2.Type_sec2.ID !== model.Image_sec2) && <div class="col-md-6 mb-3 px-2">
                                            <label className="col-form-label">Background Color<span className="text-danger text-mandatory">*</span></label>
                                            <cntrl.WKLColorPicker name="Backgroundcolor_sec2" value={model.section2.Backgroundcolor_sec2} onChange={this.onChange} placeholder="Select Color" />
                                        </div>}
                                        {(model.section2.Type_sec2 && model.section2.Type_sec2.ID === model.BGColor_sec2) &&
                                            <>
                                                <div className="col-md-6  mb-3 px-2">
                                                    <label className="col-form-label">Gradient Color<span className="text-danger text-mandatory">*</span></label>
                                                    <cntrl.WKLColorPicker name="Gradientcolor_sec2" value={model.section2.Gradientcolor_sec2} onChange={this.onChange} placeholder="Select Color" />
                                                </div>
                                                <div className="col-md-6 mb-3 px-2" >
                                                    <label className="col-form-label" >Image<span className="text-danger text-mandatory">*</span></label>
                                                    <div className="col-md-12 d-flex justify-content-between">
                                                        <div className="col-md-10">
                                                            <cntrl.WKLFile accept='image/*' isMultiFile={false} name="Image_sec2" value={model.section2.Image_sec2} onChange={this.onImgChange} placeholder="Select Image" />
                                                        </div>
                                                        <div className="col-md-2 px-2">
                                                            <button style={{ height: "33px" }} type="button" id="btn_Addimg_todo" hot-key="L" className="btn btn-sm btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Addimg_todo' })}><i className="fa fa-image"></i> </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>}
                                        {(model.section2.Type_sec2 && model.section2.Type_sec2.ID === model.Image_sec2) &&
                                            <><div className="col-md-6 mb-3 px-2" >
                                                <label className="col-form-label" >Image<span className="text-danger text-mandatory">*</span></label>
                                                <div className="col-md-12 d-flex justify-content-between">
                                                    <div className="col-md-10">
                                                        <cntrl.WKLFile accept='image/*' isMultiFile={false} name="Image_sec2" value={model.section2.Image_sec2} onChange={this.onImgChange} placeholder="Select Image" />
                                                    </div>
                                                    <div className="col-md-2 px-2">
                                                        <button style={{ height: "33px" }} type="button" id="btn_Addimg_todo" hot-key="L" className="btn btn-sm btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Addimg_todo' })}><i className="fa fa-image"></i> </button>
                                                    </div>
                                                </div>
                                            </div>
                                                <div className="col-md-6  mb-3 px-2">
                                                    <label className="col-form-label">Font Color</label>
                                                    <cntrl.WKLColorPicker name="Gradientcolor_sec2" value={model.section2.Gradientcolor_sec2} onChange={this.onChange} placeholder="Select Color" />
                                                </div>
                                            </>}
                                        {(model.section2.Type_sec2 && model.section2.Type_sec2.ID === model.Btn_sec2) &&
                                            <>
                                                <div className="col-md-6  mb-3 px-2">
                                                    <label className="col-form-label">Font Color</label>
                                                    <cntrl.WKLColorPicker name="Gradientcolor_sec2" value={model.section2.Gradientcolor_sec2} onChange={this.onChange} placeholder="Select Color" />
                                                </div>
                                            </>}
                                        {/* <div className="col-md-6 mb-3 px-2" >
                                            <label className="col-form-label">Image<span className="text-danger text-mandatory">*</span></label>
                                            <cntrl.WKLFile accept='image/*' isMultiFile={true} name="Image_sec2" value={model.section2.Image_sec2} onChange={this.onImgChange} placeholder="Select Image" />
                                        </div> */}
                                        <div className="col-md-6  mb-3 px-2">
                                            <label className="col-form-label">Sort</label>
                                            <cntrl.WKLTextbox name="SortOrder_sec2" value={model.section2.SortOrder_sec2} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} suffix={0} prefix={4} />
                                        </div>
                                        {(model.section2.Type_sec2 && model.section2.Type_sec2.ID !== model.BGColor_sec2) &&
                                            <><div className="col-md-4  mb-3 px-2">
                                                <label className="col-form-label">Status</label>
                                                <div className="col-md-1">
                                                    <input className="form-check-input ms-2" type="checkbox" name="Status_sec2" checked={model.section2.Status_sec2} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                </div>
                                            </div>
                                                <div className="col-md-12  mb-3 px-2">
                                                    <label className="form-label" >Link Type</label>
                                                    <div className="form-control border-0 ps-0">
                                                        <div className="form-check  form-check-inline mt-2 mx-2">
                                                            <input type="radio" className="form-check-input" id="pgRprd_A_2" radioGroup="status_SSM013_sec2" name="LinkType_sec2" checked={model.section2.LinkType_sec2 === model.radios.page} onChange={this.onChange} value={model.radios.page} />
                                                            <label className="form-check-label" htmlFor="pgRprd_A_2">Page</label>
                                                        </div>
                                                        <div className="form-check  form-check-inline mt-2 mx-2">
                                                            <input type="radio" className="form-check-input" id="pgRprd_I_2" radioGroup="status_SSM013_sec2" name="LinkType_sec2" checked={model.section2.LinkType_sec2 === model.radios.product} onChange={this.onChange} value={model.radios.product} />
                                                            <label className="form-check-label" htmlFor="pgRprd_I_2">Product</label>
                                                        </div>
                                                        <div className="form-check  form-check-inline mt-2 mx-1">
                                                            <input type="radio" className="form-check-input" id="pgRprd_C_2" radioGroup="status_SSM013_sec2" name="LinkType_sec2" checked={model.section2.LinkType_sec2 === model.radios.category} onChange={this.onChange} value={model.radios.category} />
                                                            <label className="form-check-label" htmlFor="pgRprd_C_2">WKG Category</label>
                                                        </div>
                                                    </div>
                                                </div></>}
                                        {(model.section2.Type_sec2 && model.section2.Type_sec2.ID === model.BGColor_sec2) &&
                                            <><div className="col-md-6  mb-3 px-2">
                                                <label className="form-label" >Link Type</label>
                                                <div className="form-control border-0 ps-0">
                                                    <div className="form-check  form-check-inline mt-2 mx-2">
                                                        <input type="radio" className="form-check-input" id="pgRprd_A_2" radioGroup="status_SSM013_sec2" name="LinkType_sec2" checked={model.section2.LinkType_sec2 === model.radios.page} onChange={this.onChange} value={model.radios.page} />
                                                        <label className="form-check-label" htmlFor="pgRprd_A_2">Page</label>
                                                    </div>
                                                    <div className="form-check  form-check-inline mt-2 mx-2">
                                                        <input type="radio" className="form-check-input" id="pgRprd_I_2" radioGroup="status_SSM013_sec2" name="LinkType_sec2" checked={model.section2.LinkType_sec2 === model.radios.product} onChange={this.onChange} value={model.radios.product} />
                                                        <label className="form-check-label" htmlFor="pgRprd_I_2">Product</label>
                                                    </div>
                                                    <div className="form-check  form-check-inline mt-2 mx-1">
                                                        <input type="radio" className="form-check-input" id="pgRprd_C_2" radioGroup="status_SSM013_sec2" name="LinkType_sec2" checked={model.section2.LinkType_sec2 === model.radios.category} onChange={this.onChange} value={model.radios.category} />
                                                        <label className="form-check-label" htmlFor="pgRprd_C_2">WKG Category</label>
                                                    </div>
                                                </div>
                                            </div><div className="col-md-4  mb-3 px-2">
                                                    <label className="col-form-label">Status</label>
                                                    <div className="col-md-1">
                                                        <input className="form-check-input ms-2" type="checkbox" name="Status_sec2" checked={model.section2.Status_sec2} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                    </div>
                                                </div></>}
                                        {model.section2.LinkType_sec2 === 'PAGE' ? <div className="col-md-6  mb-3 px-2">
                                            <label className="col-form-label">To Link</label>
                                            <cntrl.WKLSelect name="ToLink_sec2" compareKey="ID" displayField="Text" placeholder="Select To Link" allowClear={true} ref={(el) => this.onRefChange(el, 'ToLink_sec2')} selectedItem={model.section2.ToLink_sec2} dataSource={model.FormList} onChange={this.selectChange}>
                                            </cntrl.WKLSelect>
                                        </div> : model.section2.LinkType_sec2 === 'PRODUCT' ? <><div className="col-md-4 mb-3 px-2">
                                            <label className="col-form-label">Supplier</label>
                                            <cntrl.WKLSelect name="supp_sec2" compareKey="ID" displayField="Text" placeholder="Select Supplier" allowClear={true} ref={(el) => this.onRefChange(el, 'supp_sec2')} selectedItem={model.section2.supp_sec2} dataSource={model.SuppList} onChange={this.selectChange}>
                                            </cntrl.WKLSelect>
                                        </div><div className="col-md-8 mb-3 px-2">
                                                <label className="col-form-label">Product{model.section2.supp_sec2 && <span className="text-danger text-mandatory">*</span>}</label>
                                                <cntrl.WKLSelect disabled={model.section2.supp_sec2 === null} name="Product_sec2" compareKey="ID" displayField="Text" placeholder="Select Product" allowClear={true} ref={(el) => this.onRefChange(el, 'Product_sec2')} selectedItem={model.section2.Product_sec2} dataSource={model.ProductList} onChange={this.selectChange}>
                                                </cntrl.WKLSelect>
                                            </div></> : <div className="col-md-6 mb-3 px-2">
                                            <label className="col-form-label">WKG Category</label>
                                            <cntrl.WKLSelect name="category_sec2" compareKey="ID" displayField="Text" placeholder="Select WKG Category" allowClear={true} ref={(el) => this.onRefChange(el, 'category_sec2')} selectedItem={model.section2.category_sec2} dataSource={model.CategoryList} onChange={this.selectChange}>
                                            </cntrl.WKLSelect>
                                        </div>}
                                    </div>
                                    {model.IsEdit && model.Modifiedon != "" &&
                                        (<div className='row mt-2'>
                                            <div className='col'>
                                                <cntrl.WKLAuditLabel modifiedOn={model.Modifiedon} modifiedBy={model.Modifiedby} />

                                            </div>
                                        </div>)}
                                </div>
                            </div>
                        </div>
                    </div></>
                )}
                {sectionFlag === 3 && (
                    <>
                        <div className="window-content-area p-3 vh-100" style={{ width: "40rem" }}>
                            <div className="container-fluid p-0">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className='row'>
                                            <div className="col-md-6 mb-3 px-2" >
                                                <label className="col-form-label" >Image<span className="text-danger text-mandatory">*</span></label>
                                                <div className="col-md-12 d-flex justify-content-between">
                                                    <div className="col-md-10">
                                                        <cntrl.WKLFile isMultiFile={false} accept='image/*' name="File_sec3" value={model.section3.File_sec3} placeholder="Select Image" onChange={this.onImgChange} />
                                                    </div>
                                                    <div className="col-md-2 px-2">
                                                        <button style={{ height: "33px" }} type="button" id="btn_Addimg_slide" hot-key="L" className="btn btn-sm btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Addimg_slide' })}><i className="fa fa-image"></i> </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6  mb-3 px-2">
                                                <label className="col-form-label">Sort</label>
                                                <cntrl.WKLTextbox name="sortOrdr_sec3" value={model.section3.sortOrdr_sec3} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} suffix={0} prefix={4} />
                                            </div>
                                            <div className="col-md-6  mb-3 px-2">
                                                <label className="form-label" >Link Type</label>
                                                <div className="form-control border-0 ps-0">
                                                    <div className="form-check  form-check-inline mt-2 mx-2">
                                                        <input type="radio" className="form-check-input" id="pgRprd_A" radioGroup="status_SSM013" name="LinkType_sec3" checked={model.section3.LinkType_sec3 === model.radios.page} onChange={this.onChange} value={model.radios.page} />
                                                        <label className="form-check-label" htmlFor="pgRprd_A">Page</label>
                                                    </div>
                                                    <div className="form-check  form-check-inline mt-2 mx-2">
                                                        <input type="radio" className="form-check-input" id="pgRprd_I" radioGroup="status_SSM013" name="LinkType_sec3" checked={model.section3.LinkType_sec3 === model.radios.product} onChange={this.onChange} value={model.radios.product} />
                                                        <label className="form-check-label" htmlFor="pgRprd_I">Product</label>
                                                    </div>
                                                    <div className="form-check  form-check-inline mt-2 mx-1">
                                                        <input type="radio" className="form-check-input" id="pgRprd_C_2" radioGroup="status_SSM013" name="LinkType_sec3" checked={model.section3.LinkType_sec3 === model.radios.category} onChange={this.onChange} value={model.radios.category} />
                                                        <label className="form-check-label" htmlFor="pgRprd_C_2">WKG Category</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4  mb-3 px-2">
                                                <label className="col-form-label">Status</label>
                                                <div className="col-md-1">
                                                    <input className="form-check-input ms-2" type="checkbox" name="IsSelected_sec3" checked={model.section3.IsSelected_sec3} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                </div>
                                            </div>
                                            {model.section3.LinkType_sec3 === 'PAGE' ? <div className="col-md-6  mb-3 px-2">
                                                <label className="col-form-label">To Link</label>
                                                <cntrl.WKLSelect name="toLink_sec3" compareKey="ID" displayField="Text" placeholder="Select To Link" allowClear={true} ref={(el) => this.onRefChange(el, 'toLink_sec3')} selectedItem={model.section3.toLink_sec3} dataSource={model.FormList} onChange={this.selectChange}>
                                                </cntrl.WKLSelect>
                                            </div> : model.section3.LinkType_sec3 === 'PRODUCT' ? <><div className="col-md-4 mb-3 px-2">
                                                <label className="col-form-label">Supplier</label>
                                                <cntrl.WKLSelect name="supp_sec3" compareKey="ID" displayField="Text" placeholder="Select Supplier" allowClear={true} ref={(el) => this.onRefChange(el, 'supp_sec3')} selectedItem={model.section3.supp_sec3} dataSource={model.SuppList} onChange={this.selectChange}>
                                                </cntrl.WKLSelect>
                                            </div><div className="col-md-8 mb-3 px-2">
                                                    <label className="col-form-label">Product{model.section3.supp_sec3 && <span className="text-danger text-mandatory">*</span>}</label>
                                                    <cntrl.WKLSelect disabled={model.section3.supp_sec3 === null} name="Product_sec3" compareKey="ID" displayField="Text" placeholder="Select Product" allowClear={true} ref={(el) => this.onRefChange(el, 'Product_sec3')} selectedItem={model.section3.Product_sec3} dataSource={model.ProductList} onChange={this.selectChange}>
                                                    </cntrl.WKLSelect>
                                                </div></> : <div className="col-md-6 mb-3 px-2">
                                                <label className="col-form-label">WKG Category</label>
                                                <cntrl.WKLSelect name="category_sec3" compareKey="ID" displayField="Text" placeholder="Select WKG Category" allowClear={true} ref={(el) => this.onRefChange(el, 'category_sec3')} selectedItem={model.section3.category_sec3} dataSource={model.CategoryList} onChange={this.selectChange}>
                                                </cntrl.WKLSelect>
                                            </div>}
                                        </div>
                                        {model.IsEdit && model.Modifiedon != "" &&
                                            (<div className='row mt-4'>
                                                <div className='col'>
                                                    <cntrl.WKLAuditLabel modifiedOn={model.Modifiedon} modifiedBy={model.Modifiedby} />

                                                </div>
                                            </div>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>)}
                {sectionFlag === 4 && (
                    <>
                        <div className="window-content-area p-3 vh-100" style={{ width: "40rem" }}>
                            <div className="container-fluid p-0">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className='row'>

                                            <div className="col-md-6  mb-3 px-2">
                                                <label className="col-form-label">Content Text<span className="text-danger text-mandatory">*</span></label>
                                                <cntrl.WKLSelect disabled={model.IsEdit} name="ContentText_sec4" compareKey="ID" displayField="Text" placeholder="Select Content" allowClear={true} ref={(el) => this.onRefChange(el, 'ContentText_sec4')} selectedItem={model.section4.ContentText_sec4} dataSource={model.HeaderTextList_Sec4} onChange={this.selectChange}>
                                                </cntrl.WKLSelect>
                                            </div>
                                            <div class="col-md-6 mb-3 px-2">
                                                <label className="col-form-label">Background Color<span className="text-danger text-mandatory">*</span></label>
                                                <cntrl.WKLColorPicker name="Backgroundcolor_sec4" value={model.section4.Backgroundcolor_sec4} onChange={this.onChange} placeholder="Select Color" />
                                            </div>

                                            {/* <div className="col-md-6 mb-3 px-2" >
                                                <label className="col-form-label">Image<span className="text-danger text-mandatory">*</span></label>
                                                <cntrl.WKLFile accept='image/*' isMultiFile={true} name="ImageFile_sec4" value={model.section4.ImageFile_sec4} onChange={this.onImgChange} placeholder="Select Image" />
                                            </div> */}
                                            <div className="col-md-6 mb-3 px-2" >
                                                <label className="col-form-label" >Image<span className="text-danger text-mandatory">*</span></label>
                                                <div className="col-md-12 d-flex justify-content-between">
                                                    <div className="col-md-10">
                                                        <cntrl.WKLFile accept='image/*' isMultiFile={true} name="ImageFile_sec4" value={model.section4.ImageFile_sec4} onChange={this.onImgChange} placeholder="Select Image" />
                                                    </div>
                                                    <div className="col-md-2 px-2">
                                                        <button style={{ height: "33px" }} type="button" id="btn_Addimg_sec5" hot-key="L" className="btn btn-sm btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Addimg_sec5' })}><i className="fa fa-image"></i> </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6  mb-3 px-2">
                                                <label className="col-form-label">Sort</label>
                                                <cntrl.WKLTextbox name="sortOrder_sec4" value={model.section4.sortOrder_sec4} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} suffix={0} prefix={4} />
                                            </div>

                                            {/* <div className="col-md-6  mb-3 px-2">
                                                <label className="col-form-label">To Link</label>
                                                <cntrl.WKLSelect name="FormId_sec4" compareKey="ID" displayField="Text" placeholder="Select To Link" allowClear={true} ref={(el) => this.onRefChange(el, 'FormId_sec4')} selectedItem={model.section4.FormId_sec4} dataSource={model.FormList} onChange={this.selectChange}>
                                                </cntrl.WKLSelect>
                                            </div> */}
                                            <div className="col-md-6  mb-3 px-2">
                                                <label className="form-label" >Link Type</label>
                                                <div className="form-control border-0 ps-0">
                                                    <div className="form-check  form-check-inline mt-2 mx-2">
                                                        <input type="radio" className="form-check-input" id="pgRprd_A" radioGroup="status_SSM013_sec4" name="LinkType_sec4" checked={model.section4.LinkType_sec4 === model.radios.page} onChange={this.onChange} value={model.radios.page} />
                                                        <label className="form-check-label" htmlFor="pgRprd_A">Page</label>
                                                    </div>
                                                    <div className="form-check  form-check-inline mt-2 mx-2">
                                                        <input type="radio" className="form-check-input" id="pgRprd_I" radioGroup="status_SSM013_sec4" name="LinkType_sec4" checked={model.section4.LinkType_sec4 === model.radios.product} onChange={this.onChange} value={model.radios.product} />
                                                        <label className="form-check-label" htmlFor="pgRprd_I">Product</label>
                                                    </div>
                                                    <div className="form-check  form-check-inline mt-2 mx-1">
                                                        <input type="radio" className="form-check-input" id="pgRprd_C_2" radioGroup="status_SSM013_sec4" name="LinkType_sec4" checked={model.section4.LinkType_sec4 === model.radios.category} onChange={this.onChange} value={model.radios.category} />
                                                        <label className="form-check-label" htmlFor="pgRprd_C_2">WKG Category</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4  mb-3 px-2">
                                                <label className="col-form-label">Status</label>
                                                <div className="col-md-1">
                                                    <input className="form-check-input ms-2" type="checkbox" name="IsSelected_sec4" checked={model.section4.IsSelected_sec4} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                </div>
                                            </div>
                                            {model.section4.LinkType_sec4 === 'PAGE' ? <div className="col-md-6  mb-3 px-2">
                                                <label className="col-form-label">To Link</label>
                                                <cntrl.WKLSelect name="toLink_sec4" compareKey="ID" displayField="Text" placeholder="Select To Link" allowClear={true} ref={(el) => this.onRefChange(el, 'toLink_sec4')} selectedItem={model.section4.toLink_sec4} dataSource={model.FormList} onChange={this.selectChange}>
                                                </cntrl.WKLSelect>
                                            </div> : model.section4.LinkType_sec4 === 'PRODUCT' ? <><div className="col-md-4 mb-3 px-2">
                                                <label className="col-form-label">Supplier</label>
                                                <cntrl.WKLSelect name="supp_sec4" compareKey="ID" displayField="Text" placeholder="Select Supplier" allowClear={true} ref={(el) => this.onRefChange(el, 'supp_sec4')} selectedItem={model.section4.supp_sec4} dataSource={model.SuppList} onChange={this.selectChange}>
                                                </cntrl.WKLSelect>
                                            </div><div className="col-md-8 mb-3 px-2">
                                                    <label className="col-form-label">Product{model.section4.supp_sec4 && <span className="text-danger text-mandatory">*</span>}</label>
                                                    <cntrl.WKLSelect disabled={model.section4.supp_sec4 === null} name="Product_sec4" compareKey="ID" displayField="Text" placeholder="Select Product" allowClear={true} ref={(el) => this.onRefChange(el, 'Product_sec4')} selectedItem={model.section4.Product_sec4} dataSource={model.ProductList} onChange={this.selectChange}>
                                                    </cntrl.WKLSelect>
                                                </div></> : <div className="col-md-6 mb-3 px-2">
                                                <label className="col-form-label">WKG Category</label>
                                                <cntrl.WKLSelect name="category_sec4" compareKey="ID" displayField="Text" placeholder="Select WKG Category" allowClear={true} ref={(el) => this.onRefChange(el, 'category_sec4')} selectedItem={model.section4.category_sec4} dataSource={model.CategoryList} onChange={this.selectChange}>
                                                </cntrl.WKLSelect>
                                            </div>}
                                        </div>
                                        {model.IsEdit && model.Modifiedon != "" &&
                                            (<div className='row mt-4'>
                                                <div className='col'>
                                                    <cntrl.WKLAuditLabel modifiedOn={model.Modifiedon} modifiedBy={model.Modifiedby} />

                                                </div>
                                            </div>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>)}
                <div className="window-button-area">
                    <div className="row">
                        <div className="col">
                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={'btn_save'} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            </cntrl.WKLButtonWrapper>
                            <button onClick={(e) => this.clickAction({ id: 'btn_clear' })} type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1"><i className="fa fa-refresh"></i> Clear</button>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>
        );
    }

}