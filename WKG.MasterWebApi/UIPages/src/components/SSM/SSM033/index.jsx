import React from 'react';
import SSM033VM from './SSM033VM';
import * as cntrl from '../../../wkl-components';

class SSM033 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM033VM(props));
        this.inputRefs = { header: null, childs: {} };
    }
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 300)
    }
    onChangeImg = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            if (e.name) {
                model.Image_Array = e.files;
                model.WKLImage_SNO = null;
                model.WKLImage_Url = null;
                model[e.name] = e.value;
            }
            this.VM.onBlurCheck(e.value);
            this.updateUI();
        }
    };
    onChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data.Input;
            if (e.name)
                model[e.name] = e.value;
            else if (e.target && e.target.name)
                model[e.target.name] = e.target.value;

            this.updateUI();
        }
    };
    onRadioChange = (e) => {
        if (this.VM) {
            let model = '';
            model = this.VM.Data.Input;
            model[e.target.name] = e.target.value;
            this.VM.updateUI();
        }
    };
    onCheckChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data.Input;
            model[e.target.name] = e.target.checked;
            this.updateUI();
        }
    };
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    }

    setFocus = (name) => {
        if (this.inputRefs[name] && this.inputRefs[name].focus) {
            this.inputRefs[name].focus();
        }
    }

    onRefChange = (el, name) => {
        this.inputRefs[name] = el;
    }

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
                if (action === "btn_close") {
                    this.VM.doClose(e);
                }
                else if (action == "btn_Lat_click") {
                    this.VM.openWindow("btn_Lat_click");
                }
                else if (action == "sec2_New") {
                    this.VM.openWindow("sec2_New");
                }
                else if (action == "btn_sec") {
                    this.updateUI();
                }
                else if (action === "btn_save") {
                    this.VM.handleSave();
                }
                else if (action === "btn_remove") {
                    this.VM.handleDelete();
                }
                else if (action === "btn_Addimg_ltd") {
                    this.VM.openWindow("btn_Addimg_ltd");
                }

            }
        }
    }

    onGridCellClick = (e, item) => {
        if (this.VM) {
            this.VM.setSelectedItem(e.row);
            this.updateUI();
        }
    }
    onPageChange = (e, type, val) => {
        if (this.VM) {
            this.VM.loadPage(e.value, e.columnOptions);
        }
    }
    onEditclick = (e) => {
        if (this.VM) {
            this.VM.onEditclick(e);
        }
    }
    columnEditButton = (e) => {
        return (<span>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Edit"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={() => { this.onEditclick(e.row) }}><i className="fas fa-edit" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
        </span>)
    };
    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
        gridInfo.Columns[2].onRender = this.columnEditButton;
        const attr =
        {
            externalSort: true,
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
                onPageChange: this.onPageChange
            },
            rowStyle: [
                { className: 'inactive-row', condition: (p) => { return p['Status'] == "Inactive" } },
            ],
            onGridCellClick: this.onGridCellClick,
            //onGridCellDoubleClick: this.onGridCellDoubleClick,
            //onSortChange: this.onSortChange,
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
    }

    render() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;
        let title = model.Title;
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
        }

        return (

            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area w-100 vh-100 p-3" style={{ width: "55rem" }}>
                    <div className="container-fluid h-100 p-0">
                        <div className='row'>
                            <div class="accordion" id="accordionExample" style={{ width: "53rem" }}>
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingOne">
                                        <button class="wkl-window-header accordion-button p-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne" style={{ background: "#eef2f7" }}>
                                            Config
                                        </button>
                                    </h2>
                                    <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                        <div class="accordion-body p-2">
                                            <div className='row'>
                                                <div className="col-md-12">
                                                    <label className="col-form-label" >Name </label>
                                                    <cntrl.WKLTextbox name="Prod_Name" disabled={true} value={dataModel.Prod_Name} onChange={this.onChange} placeholder="Name" maxLength={100} inputType={cntrl.WKLTextboxTypes.sentenceCase} />
                                                </div>
                                                <div className='col-md-5 my-2'>
                                                    <div className="mb-2">
                                                        <label className="form-label" >Booking Fee</label>
                                                        <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'booking_fee')} name="booking_fee" value={dataModel.booking_fee} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} prefix={10} suffix={2}></cntrl.WKLTextbox>
                                                    </div>
                                                    <div className="mb-2">
                                                        <label className="form-label" >Booking Fee Type</label>
                                                        <div className="form-control border-0 ps-0">
                                                            <div className="form-check  form-check-inline">
                                                                <input type="radio" className="form-check-input" id="fee_type_P" radioGroup="fee_type" name="bkfee_type" checked={dataModel.bkfee_type === model.radios.percentage} onChange={this.onRadioChange} value={model.radios.percentage} />
                                                                <label className="form-check-label" htmlFor="fee_type_P">Percentage</label>
                                                            </div>
                                                            <div className="form-check  form-check-inline">
                                                                <input type="radio" className="form-check-input" id="fee_type_F" radioGroup="fee_type" name="bkfee_type" checked={dataModel.bkfee_type === model.radios.fixed} onChange={this.onRadioChange} value={model.radios.fixed} />
                                                                <label className="form-check-label" htmlFor="fee_type_F">Fixed</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-md-5 mt-2'>
                                                    <div className="mb-2">
                                                        <label className="form-label" >Latitude</label>
                                                        <cntrl.WKLTextbox disabled ref={(el) => this.onRefChange(el, 'Latitude')} name="Latitude" value={dataModel.Latitude} prefix={6} suffix={9} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} maxLength={9}>
                                                        </cntrl.WKLTextbox>
                                                    </div>
                                                    <div className="mb-1">
                                                        <label className="form-label" >Longitude</label>
                                                        <cntrl.WKLTextbox disabled ref={(el) => this.onRefChange(el, 'Longitude')} name="Longitude" value={dataModel.Longitude} prefix={6} suffix={9} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} maxLength={9}>
                                                        </cntrl.WKLTextbox>
                                                    </div>
                                                </div>
                                                <div className='col-md-1 my-auto'>
                                                    <div className="col-md-2">
                                                        <button data-bs-toggle="tooltip" data-bs-placement="left" title={"Set Location"} type="button" name="btn_Lat_click" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Lat_click' })}><i className="fa fa-map"></i> </button>
                                                    </div>
                                                </div>
                                                <div className="col-md-5 mt-2">
                                                    <label className="col-form-label" >Sort </label>
                                                    <cntrl.WKLTextbox name="Sort_order" value={dataModel.Sort_order} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} prefix={2} suffix={0} />
                                                </div>
                                                <div className='col-md-2 mt-2'>
                                                    <label className="col-form-label" htmlFor="Featured_Prod">Featured Product</label>
                                                    <div className="col-md-3 mt-2">
                                                        <input className="form-check-input" type="checkbox" name="Featured_Prod" checked={dataModel.Featured_Prod} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingTwo">
                                        <button onClick={(e) => this.clickAction({ id: 'btn_sec' })} data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo" class="wkl-window-header accordion-button p-2" type="button" style={{ background: "#eef2f7" }}>
                                            Product Name
                                        </button>
                                    </h2>
                                    <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                        <div class="accordion-body p-2">
                                            <div className='row'>
                                                <div className="col-md-12 mb-3 px-3">
                                                    <div className='d-flex' style={{ justifyContent: "end", paddingTop: "10px" }}>
                                                        <button type="button" id="sec2_New" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'sec2_New' })}><i className="fa fa-add"></i> Add New</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-12'>
                                                {this.renderGrid()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingThree">
                                        <button onClick={(e) => this.clickAction({ id: 'btn_sec' })} class="wkl-window-header accordion-button p-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree" style={{ background: "#eef2f7" }}>
                                            Image
                                        </button>
                                    </h2>
                                    <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                                        <div class="accordion-body p-2">
                                            <div className='row'>
                                                <div className="col-md-6">
                                                    <label className="col-form-label" >LTD</label>
                                                    <div className="border mt-1" style={{ height: "160px" }}>

                                                        {dataModel.Image_path == "" ?
                                                            <img src="" style={{ height: "196px", width: "100%" }}></img> : <img src={dataModel.Image_path} style={{ height: "196px", width: "100%" }}></img>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="col-md-6" >
                                                    <label className="col-form-label" >WKL</label>
                                                    <div className="col-md-12 d-flex justify-content-between">
                                                        <div className="col-md-10">
                                                            <cntrl.WKLFile accept='image/*' isMultiFile={false} name="WKLImage_Upload" value={model.WKLImage_Upload} onChange={this.onChangeImg} placeholder="Select Image" />
                                                        </div>
                                                        <div className="col-md-2 px-2">
                                                            <button style={{ height: "33px" }} type="button" id="btn_Addimg_ltd" hot-key="L" className="btn btn-sm btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Addimg_ltd' })}><i className="fa fa-image"></i> </button>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 border mt-1" style={{ height: "160px" }}>
                                                        {model.WKLImage_Url == "" ?
                                                            <img src="" style={{ height: "160px", width: "100%" }}></img> : <img src={model.WKLImage_Url} style={{ height: "160px", width: "100%", objectFit: 'cover' }}></img>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row" style={{ justifyContent: "end" }}>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={'btn_save'} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            </cntrl.WKLButtonWrapper>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>

                    </div>
                </div>
            </cntrl.WKLControl>

        );
    }
}

export default SSM033;