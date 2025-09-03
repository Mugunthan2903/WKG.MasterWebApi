import React from 'react';
import SSM012VM from './SSM012VM';
import * as cntrl from '../../../wkl-components';

export default class SSM012 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM012VM(props));
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
    // handles all button clicks
    clickAction = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
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
                if (action === "btn_close") {
                    this.VM.doClose(e);
                } else if (action === "btn_save") {
                    this.updateUI();
                    this.VM.handleSave();
                } else if (action === "btn_cancel") {
                    this.VM.handleClear();
                } else if (action === "sec2_NewEdit") {
                    this.VM.openWindow(2, e.isEdit, e.hmpg_srl, e.slide_srl, e.todo_srl);
                } else if (action === "sec3_NewEdit") {
                    this.VM.openWindow(3, e.isEdit, e.hmpg_srl, e.slide_srl, e.todo_srl);
                } else if (action === "sec4_NewEdit") {
                    this.VM.openWindow(4, e.isEdit, e.hmpg_srl, e.slide_srl, e.todo_srl);
                }
                else if (action === "btn_sec") {
                    this.updateUI();
                } else if (action === "btn_Addimg_banner") {
                    this.VM.openWindow('Addimg_banner');
                } else if (action === "btn_Add_hdrimg_banner") {
                    this.VM.openWindow('hdrimg_banner');
                }
                else if (action == "btn_preview") {
                    this.VM.openPreview();
                    //cntrl.Utils.openHtmlInWindow(model.HtmlEditor);
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
    onChange = (e) => {
        if (this.VM) {
            console.log(e);
            const model = this.VM.Data;
            if (e.name === 'DateFlipper') {
                model.DateFlipperStart = e.start;
                model.DateFlipperEnd = e.end;
            }
            else if (e.name === "Image_File_sec1") {
                model.imagearr = e.files;
                model[e.name] = e.value;
                model.img_srl = null;
                model.oldImg = false;
                this.VM.onBlurCheck(e.value, e.name);
            } else if (e.name === "HeaderImage_File_sec1") {
                model.hdrimagearr = e.files;
                model[e.name] = e.value;
                model.img_srl_hdr = null;
                model.oldImg_hdr = false;
                this.VM.onBlurCheck(e.value, e.name);
            }
            else {
                model[e.name] = e.value;
            }
            this.updateUI();
        }
    };
    selectChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            model[e.name] = e.value;
            this.VM.updateUI();
        }
    };
    //function that adds ref of input controls to the inputRefs object based on name
    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }
    columnButton = (e, id) => {
        const hmpg_srl = e.row.hmpg_srl;
        const slide_srl = e.row.slide_srl;
        const todo_srl = e.row.todo_srl;
        return (<span><button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Edit"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={() => this.clickAction({ id, isEdit: true, hmpg_srl, slide_srl, todo_srl })}><i className="fas fa-edit" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button></span>)
    };
    onGridCellClick = (e, tableNo) => {
        if (this.VM) {
            this.VM.setSelectedItem(e.row, tableNo);
            this.updateUI();
        }
    }
    onPageChange = (e, section) => {
        this.VM.loadPage(e.value, section);
    }
    renderGrid(e) {
        const me = this;
        const model = this.VM.Data;
        let gridInfo = model.Section2Grid;
        if (e === 2) {
            gridInfo = model.Section2Grid;
            gridInfo.Columns[3].onRender = (e) => this.columnButton(e, 'sec2_NewEdit');
        } else if (e === 3) {
            gridInfo = model.Section3Grid;
            gridInfo.Columns[3].onRender = (e) => this.columnButton(e, 'sec3_NewEdit');
        } else if (e === 4) {
            gridInfo = model.Section4Grid;
            gridInfo.Columns[3].onRender = (e) => this.columnButton(e, 'sec4_NewEdit');
        }
        const attr =
        {
            dataSource: gridInfo.Items,
            selectedItems: [gridInfo.SelectedItem],
            isRemoteSort: false,
            rowSelection: true,
            multiSelect: false,
            paging: true,
            totalRows: gridInfo.PageSize,
            columns: gridInfo.Columns || [],
            pageInfo: {
                currentPage: gridInfo.Page,
                totalPages: gridInfo.TotalPage,
                totalCount: gridInfo.TotalRecords,
                onPageChange: (ex) => this.onPageChange(ex, e)
            },
            rowStyle: [
                { className: 'inactive-row', condition: (p) => { return p['Status'] == "Inactive" } },
            ],
            onGridCellClick: (ex) => this.onGridCellClick(ex, e),
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
    }
    render() {
        const model = this.VM.Data;
        let disableForHomePage = true;
        let title = '';
        let showloading = false;
        if (model.Grp_hmpg_typ === model.HomeScreenList?.Standard || model.Grp_hmpg_typ === model.HomeScreenList?.HomeScreen2 || model.Grp_hmpg_typ === model.HomeScreenList?.Tenerife) {
            disableForHomePage = false;
        }
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;

        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <cntrl.WKLBody>
                    <div className="window-content-area p-3 vh-100" style={{ width: "60rem" }}>
                        <div className='row'>
                            <div class="accordion" id="accordionExample">
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingOne">
                                        <button class="wkl-window-header accordion-button p-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne" style={{ background: "#eef2f7" }}>
                                            Section 1 - Top Banner
                                        </button>
                                    </h2>
                                    <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                        <div class="accordion-body">
                                            <div className='row'>
                                                {model.Grp_hmpg_typ !== model.HomeScreenList?.Tenerife &&
                                                    <div className="col-md-4 px-3" >
                                                        <label className="col-form-label" > {model.Grp_hmpg_typ === model.HomeScreenList?.OTHHeathrow ? "Logo" : "Header Image"}</label>
                                                        <div className="col-md-12 d-flex justify-content-between">
                                                            <div className="col-md-10">
                                                                <cntrl.WKLFile isMultiFile={false} accept='image/*' name="HeaderImage_File_sec1" value={model.HeaderImage_File_sec1} placeholder={model.Grp_hmpg_typ === model.HomeScreenList?.OTHHeathrow ? "Select Logo" : "Select Header Image"} onChange={this.onChange} />
                                                            </div>
                                                            <div className="col-md-2 px-2">
                                                                <button style={{ height: "33px" }} type="button" id="btn_Add_hdrimg_banner" hot-key="L" className="btn btn-sm btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Add_hdrimg_banner' })}><i className="fa fa-image"></i> </button>
                                                            </div>
                                                        </div>
                                                    </div>}
                                                {model.Grp_hmpg_typ === model.HomeScreenList?.Tenerife && <div className="col-md-4 px-3">
                                                    <label className="col-form-label" >Header Text </label>
                                                    <cntrl.WKLSelect name="HeaderText_Sec1" compareKey="ID" displayField="Text" placeholder="Select Header Text" allowClear={true} ref={(el) => this.onRefChange(el, 'HeaderText_Sec1')} selectedItem={model.HeaderText_Sec1} dataSource={model.HeaderTextList_Sec1} onChange={this.selectChange}>
                                                    </cntrl.WKLSelect>
                                                </div>}
                                                <div className="col-md-4 px-3">
                                                    <label className="col-form-label" >Content Text</label>
                                                    <cntrl.WKLSelect name="ContentText_Sec1" compareKey="ID" displayField="Text" placeholder="Select Content" allowClear={true} ref={(el) => this.onRefChange(el, 'ContentText_Sec1')} selectedItem={model.ContentText_Sec1} dataSource={model.HeaderTextList_Sec1} onChange={this.selectChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-4 px-3" hidden={model.Grp_hmpg_typ === model.HomeScreenList?.OTHHeathrow}>
                                                    <label className="col-form-label" >To Link</label>
                                                    <cntrl.WKLSelect name="FormId_sec1" compareKey="ID" displayField="Text" placeholder="Select To Link" allowClear={true} ref={(el) => this.onRefChange(el, 'FormId_sec1')} selectedItem={model.FormId_sec1} dataSource={model.FormIdList_sec1} onChange={this.selectChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                {model.Grp_hmpg_typ === model.HomeScreenList?.OTHHeathrow && <div class="col-md-4 px-3" >
                                                    <label className="col-form-label" >Font Color</label>
                                                    <cntrl.WKLColorPicker name="Backgroundcolor_sec1" value={model.Backgroundcolor_sec1} onChange={this.onChange} placeholder="Select Font Color" />
                                                </div>}
                                                <div className="col-md-4 px-3" >
                                                    <label className="col-form-label" >{model.Grp_hmpg_typ === model.HomeScreenList?.OTHHeathrow ? "Banner" : (model.Grp_hmpg_typ === model.HomeScreenList?.Tenerife ? "Background Image" : "Image")}<span className="text-danger text-mandatory">*</span></label>
                                                    <div className="col-md-12 d-flex justify-content-between">
                                                        <div className="col-md-10">
                                                            <cntrl.WKLFile isMultiFile={false} accept='image/*' name="Image_File_sec1" value={model.Image_File_sec1} placeholder={model.Grp_hmpg_typ === model.HomeScreenList?.OTHHeathrow ? "Select Banner" : (model.Grp_hmpg_typ === model.HomeScreenList?.Tenerife ? "Select Background Image" : "Select Image")} onChange={this.onChange} />
                                                        </div>
                                                        <div className="col-md-2 px-2">
                                                            <button style={{ height: "33px" }} type="button" id="btn_Addimg_banner" hot-key="L" className="btn btn-sm btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Addimg_banner' })}><i className="fa fa-image"></i> </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {(model.Grp_hmpg_typ !== model.HomeScreenList?.OTHHeathrow && model.Grp_hmpg_typ !== model.HomeScreenList?.Tenerife) && <div class="col-md-4 px-3" >
                                                    <label className="col-form-label" >Background Color</label>
                                                    <cntrl.WKLColorPicker name="Backgroundcolor_sec1" value={model.Backgroundcolor_sec1} onChange={this.onChange} placeholder="Select Background Color" />
                                                </div>}
                                                {(model.Grp_hmpg_typ === model.HomeScreenList?.Tenerife) && <div class="col-md-4 px-3" >
                                                    <label className="col-form-label" >Header Text Color</label>
                                                    <cntrl.WKLColorPicker name="Backgroundcolor_sec1" value={model.Backgroundcolor_sec1} onChange={this.onChange} placeholder="Select Header Text Color" />
                                                </div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item" >
                                    <h2 class="accordion-header" id="headingTwo">
                                        <button onClick={(e) => this.clickAction({ id: 'btn_sec' })} data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo" class="wkl-window-header accordion-button p-2" type="button" style={disableForHomePage ? { background: "#e9ecef", cursor: "not-allowed" } : { background: "#eef2f7" }}>
                                            Section 2 - To Do
                                        </button>
                                    </h2>
                                    <div id={disableForHomePage ? "" : "collapseTwo"} class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                        <div class="accordion-body">
                                            <div className='p-0'>
                                                <div className='row'>
                                                    <div className="col-md-4  mb-3 px-3">
                                                        <label className="col-form-label" >Header Text</label>
                                                        <cntrl.WKLSelect name="HeaderText_Sec2" compareKey="ID" displayField="Text" placeholder="Select Header" allowClear={true} ref={(el) => this.onRefChange(el, 'HeaderText_Sec2')} selectedItem={model.HeaderText_Sec2} dataSource={model.HeaderTextList_Sec1} onChange={this.selectChange}>
                                                        </cntrl.WKLSelect>
                                                    </div>
                                                    <div className="col-md-4  mb-3 px-3">
                                                        <label className="col-form-label" >City</label>
                                                        <cntrl.WKLSelect name="HeaderCity_Sec2" compareKey="ID" displayField="Text" placeholder="Select City" allowClear={true} ref={(el) => this.onRefChange(el, 'HeaderCity_Sec2')} selectedItem={model.HeaderCity_Sec2} dataSource={model.HeaderCityList_Sec2} onChange={this.selectChange}>
                                                        </cntrl.WKLSelect>
                                                    </div>
                                                    <div className="col-md-4  mt-3 px-3">
                                                        <div className='d-flex mt-2' style={{ justifyContent: "end", paddingTop: "10px" }}>
                                                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'sec2_NewEdit' })}><i className="fa fa-add"></i> Add New</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {this.renderGrid(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingThree">
                                        <button onClick={(e) => this.clickAction({ id: 'btn_sec' })} class="wkl-window-header accordion-button p-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree" style={disableForHomePage ? { background: "#e9ecef", cursor: "not-allowed" } : { background: "#eef2f7" }}>
                                            Section 3 - Slider
                                        </button>
                                    </h2>
                                    <div id={disableForHomePage ? "" : "collapseThree"} class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                                        <div class="accordion-body">
                                            <div className=' p-0'>
                                                <div className='row'>
                                                    <div className="col-md-6  mb-3 px-3">
                                                        <label className="col-form-label" >Header Text</label>
                                                        <cntrl.WKLSelect name="HeaderText_Sec3" compareKey="ID" displayField="Text" placeholder="Select Header" allowClear={true} ref={(el) => this.onRefChange(el, 'HeaderText_Sec3')} selectedItem={model.HeaderText_Sec3} dataSource={model.HeaderTextList_Sec1} onChange={this.selectChange}>
                                                        </cntrl.WKLSelect>
                                                    </div>
                                                    <div className="col-md-6  mt-3 px-3">
                                                        <div className='d-flex mt-2' style={{ justifyContent: "end", paddingTop: "10px" }}>
                                                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'sec3_NewEdit' })}><i className="fa fa-add"></i> Add New</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {this.renderGrid(3)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingFour">
                                        <button onClick={(e) => this.clickAction({ id: 'btn_sec' })} class="wkl-window-header accordion-button p-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour" style={disableForHomePage ? { background: "#e9ecef", cursor: "not-allowed" } : { background: "#eef2f7" }}>
                                            Section 4 -  Concierge
                                        </button>
                                    </h2>
                                    <div id={disableForHomePage ? "" : "collapseFour"} class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                                        <div class="accordion-body">
                                            <div className=' p-0'>
                                                <div className='row'>
                                                    <div className="col-md-6  mb-3 px-3">
                                                        <label className="col-form-label" >Header Text</label>
                                                        <cntrl.WKLSelect name="HeaderText_Sec4" compareKey="ID" displayField="Text" placeholder="Select Header" allowClear={true} ref={(el) => this.onRefChange(el, 'HeaderText_Sec4')} selectedItem={model.HeaderText_Sec4} dataSource={model.HeaderTextList_Sec1} onChange={this.selectChange}>
                                                        </cntrl.WKLSelect>
                                                    </div>
                                                    <div className="col-md-6  mt-3 px-3">
                                                        <div className='d-flex mt-2' style={{ justifyContent: "end", paddingTop: "10px" }}>
                                                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'sec4_NewEdit' })}><i className="fa fa-add"></i> Add New</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {this.renderGrid(4)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {model.IsEdit && model.Modifiedon != "" &&
                            (<div className='row mt-4'>
                                <div className='col'>
                                    <cntrl.WKLAuditLabel modifiedOn={model.Modifiedon} modifiedBy={model.Modifiedby} />
                                </div>
                            </div>)}
                    </div>
                </cntrl.WKLBody>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                            <button type="button" id="btn_preview" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_preview' })}><i className="fa fa-eye"></i> Preview</button>
                        </div>
                        <div className="col border-start">
                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={'btn_save'} formID={model.FormID} onClick={this.clickAction}>
                                <button disabled={model.save_btn} type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            </cntrl.WKLButtonWrapper>
                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_cancel' })}><i className="fa fa-refresh"></i> Clear</button>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl >
        )
    }
}