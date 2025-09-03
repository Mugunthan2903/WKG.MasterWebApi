import React from 'react';
import SSM011VM from './SSM011VM';
import * as cntrl from '../../../wkl-components';

export default class SSM011 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM011VM(props));
        this.inputRefs = {};

    }
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
    }
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };
    onChange = (e) => {
        if (this.VM) {
            let model = this.Data.Input;
            let dataModel = this.Data;
            if (e.value) {
                model[e.name] = e.value;
            }
            else {
                model[e.name] = "";
            }

            this.VM.updateUI();
        }
    }
    onChangeLoct = (e) => {
        if (this.VM) {
            let model = this.Data.Input;

            if (e.response) {

                if (e.value) {
                    model.Location_name = e.value.placeName;
                    model.Location_latitude = e.value.geocode.lat.toFixed(9);
                    model.Location_longitude = e.value.geocode.lng.toFixed(9);
                    model.Location_shortname = e.value.placeName.toString().substring(0, 50);
                    model.Location_postcode = e.value.postalCode;
                }
            }
            else {
                model[e.name] = e.value;
                model.Location_latitude = '';
                model.Location_longitude = '';
                model.Location_shortname = '';
                model.Location_postcode = '';
            }
            this.VM.updateUI();
            console.log("onChange : ", e);
        }

    }
    onBlurSrch = (e) => {
        const model = this.VM.Data.Input
        if (this.VM && !model.IsEdit && model.SSM_ID !== "") {
            this.VM.onBlurSrch();
        }
    }
    onCheckChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data.Input;
            model[e.target.name] = e.target.checked;
            console.log('onCheckchnage ', e.target.value, e.target.checked, e.target.name);
            console.log('onCheckchnage ', model);
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
    clickAction = (e) => {
        if (this.VM) {
            console.log('clickAction');
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
                    this.VM.doClose(e);
                }
                else if (action == "btn_new" || action == "btn_edit") {
                    this.VM.handleSave(e);
                }
                else if (action == "btn_cancel") {
                    this.VM.handleDataChange()
                }
                else if (action === "btn_Lat_click") {
                    this.VM.openWindow("btn_Lat_click");
                }
                else if (action === "btn_Addimage_Distrbtn") {
                    this.VM.openWindow("btn_Addimage_Distrbtn");
                }

            }
        }
    }
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
    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }
    render() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;
        let disableModifiedBy = true;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
        }
        disableModifiedBy = !dataModel.IsEdit;

        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <cntrl.WKLBody>
                    <div className="window-content-area p-3 vh-100" style={{ width: "50rem" }}>
                        <div className="container-fluid h-100 p-0">
                            <div className='row'>
                                <div class="accordion" id="accordionExample" style={{ width: "53rem" }}>
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="headingGeneral">
                                            <button class="wkl-window-header accordion-button p-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseGeneral" aria-expanded="true" aria-controls="collapseGeneral" style={{ background: "#eef2f7" }}>
                                                SSM Config
                                            </button>
                                        </h2>
                                        <div id="collapseGeneral" class="accordion-collapse collapse show" aria-labelledby="headingGeneral" data-bs-parent="#accordionExample">
                                            <div class="accordion-body p-2">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="col-md-12">
                                                            <div className="mb-2">
                                                                <label className="form-label" >SSM Id<span className="text-danger text-mandatory">*</span></label>
                                                                <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SSM_ID')} name="SSM_ID" placeholder="Enter SSM Id" disabled={dataModel.IsEdit} value={dataModel.SSM_ID} onChange={this.onChange} events={{ onBlur: () => this.onBlurSrch() }} inputType={cntrl.WKLTextboxTypes.textbox} maxLength={50}>
                                                                </cntrl.WKLTextbox>
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label" htmlFor="Cust_Cd">WkL Rate Config<span className="text-danger text-mandatory">*</span></label>
                                                                <cntrl.WKLSelect name="Cust_Cd" compareKey="ID" displayField="Text" placeholder="Select WkL Rate Config" allowClear={true} ref={(el) => this.onRefChange(el, 'Cust_Cd')} selectedItem={dataModel.Cust_Cd} dataSource={model.Cust_CdList} onChange={this.onChange}>
                                                                </cntrl.WKLSelect>
                                                            </div>
                                                            <div className='mb-2'>
                                                                <label className="col-form-label" >Booking Fee</label>
                                                                <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'Booking_fee')} name="Booking_fee" value={dataModel.Booking_fee} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} prefix={10} suffix={2}></cntrl.WKLTextbox>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="col-md-12">
                                                            <div className="mb-2">
                                                                <label className="form-label" >SSM Name</label>
                                                                <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SSM_Name')} placeholder="Enter SSM Name" name="SSM_Name" value={dataModel.SSM_Name} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
                                                                </cntrl.WKLTextbox>
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label" htmlFor="Outlt_Cd">Outlet Name<span className="text-danger text-mandatory">*</span></label>
                                                                <cntrl.WKLSelect name="Outlt_Cd" compareKey="ID" displayField="Text" placeholder="Select Outlet Name" allowClear={true} ref={(el) => this.onRefChange(el, 'Outlt_Cd')} selectedItem={dataModel.Outlt_Cd} dataSource={model.Outlt_CdList} onChange={this.onChange}>
                                                                </cntrl.WKLSelect>
                                                            </div>
                                                            <div className='row col-md-12'>
                                                                <div className='col-md-8 mb-2'>
                                                                    <label className="col-form-label" >Booking Fee Type</label>
                                                                    <div className="form-control border-0 ps-0">
                                                                        <div className="form-check  form-check-inline">
                                                                            <input type="radio" className="form-check-input" id="BookFeeTypP" radioGroup="BookFeeTyp" name="BookFeeTyp" checked={dataModel.BookFeeTyp === model.DefaultBookFeeType.Percentage} onChange={this.onRadioChange} value={model.DefaultBookFeeType.Percentage} />
                                                                            <label className="form-check-label" htmlFor="BookFeeTypP">Percentage</label>
                                                                        </div>
                                                                        <div className="form-check  form-check-inline">
                                                                            <input type="radio" className="form-check-input" id="BookFeeTypF" radioGroup="BookFeeTyp" name="BookFeeTyp" checked={dataModel.BookFeeTyp === model.DefaultBookFeeType.Fixed} onChange={this.onRadioChange} value={model.DefaultBookFeeType.Fixed} />
                                                                            <label className="form-check-label" htmlFor="BookFeeTypF">Fixed</label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-4'>
                                                                    <div className="mb-2">
                                                                        <label className="col-form-label" htmlFor="Status">Status</label>
                                                                        <div className="mb-2">
                                                                            <input className="form-check-input ms-2" type="checkbox" name="Status" checked={dataModel.Status} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
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
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="headingOne">
                                            <button class="wkl-window-header accordion-button p-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne" style={{ background: "#eef2f7" }}>
                                                Car Transfer
                                            </button>
                                        </h2>
                                        <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                            <div class="accordion-body p-2">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="col-md-12">
                                                            <div className="mb-2">
                                                                <label className="form-label" >SSM Default Location</label>
                                                                <cntrl.WKLPlaceSearch country_Cd={model.country_Cd} ref={(el) => this.onRefChange(el, 'Location_name')} apiKey={cntrl.Utils.ConfigInfo.GmapKey || ''} placeholder="Select SSM Default Location" name="Location_name" value={dataModel.Location_name} onChange={this.onChangeLoct} maxLength={200} />
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label" >SSM Default Short Name</label>
                                                                <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Location_shortname')} placeholder="Select SSM Default Short Name" name="Location_shortname" value={dataModel.Location_shortname} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={50}>
                                                                </cntrl.WKLTextbox>
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label" >SSM Default Post Code</label>
                                                                <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'Location_postcode')} placeholder="Select SSM Default Post Code" name="Location_postcode" value={dataModel.Location_postcode} inputType={cntrl.WKLTextboxTypes.sentenceCase} onChange={this.onChange} maxLength={15} />
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label" >Uber Default Sub Zone Name</label>
                                                                <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'Location_Subzone')} placeholder="Select Uber Default Sub Zone Name" name="Location_Subzone" value={dataModel.Location_Subzone} inputType={cntrl.WKLTextboxTypes.sentenceCase} onChange={this.onChange}  />
                                                            </div>
                                                         
                                                            <div className="mb-2">
                                                                <label className="form-label" htmlFor="Uber_Uuid">Uber Uuid</label>
                                                                <cntrl.WKLSelect name="Uber_Uuid" compareKey="ID" displayField="Text" placeholder="Select Uber Uuid" allowClear={true} ref={(el) => this.onRefChange(el, 'Uber_Uuid')} selectedItem={dataModel.Uber_Uuid} dataSource={model.Uber_UuidList} onChange={this.onChange}>
                                                                </cntrl.WKLSelect>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="col-md-12">
                                                            <div className="row">
                                                                <div className="col-md-10">
                                                                    <div className="mb-2">
                                                                        <label className="form-label" >SSM Default Latitude</label>
                                                                        <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Location_latitude')} name="Location_latitude" value={dataModel.Location_latitude} onChange={this.onChange} prefix={6} suffix={9} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} maxLength={9}>
                                                                        </cntrl.WKLTextbox>
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <label className="form-label" >SSM Default Longitude</label>
                                                                        <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Location_longitude')} name="Location_longitude" value={dataModel.Location_longitude} onChange={this.onChange} prefix={6} suffix={9} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} maxLength={9}>
                                                                        </cntrl.WKLTextbox>
                                                                    </div>
                                                                </div>
                                                                <div className='col-md-2 my-auto'>
                                                                    <div className="col-md-2">
                                                                        <button data-bs-toggle="tooltip" data-bs-placement="left" title={"Set Location"} type="button" name="btn_Lat_click" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Lat_click' })}><i className="fa fa-map"></i> </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label" htmlFor="Arena_Locat">Arena Location</label>
                                                                <cntrl.WKLSelect name="Arena_Locat" compareKey="ID" displayField="Text" placeholder="Select Arena Location" allowClear={true} ref={(el) => this.onRefChange(el, 'Arena_Locat')} selectedItem={dataModel.Arena_Locat} dataSource={model.Arena_LocatList} onChange={this.onChange}>
                                                                </cntrl.WKLSelect>
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label" >Uber Default Access Point Name</label>
                                                                <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'Location_Accespoint')} placeholder="Select Uber Default Access Point Name" name="Location_Accespoint" value={dataModel.Location_Accespoint} inputType={cntrl.WKLTextboxTypes.sentenceCase} onChange={this.onChange}  />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="headingTwo">
                                            <button data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo" class="wkl-window-header accordion-button p-2" type="button" style={{ background: "#eef2f7" }}>
                                                Payment
                                            </button>
                                        </h2>
                                        <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                            <div class="accordion-body p-2">

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="col-md-12">
                                                            <div className="mb-2">
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label" htmlFor="Payment_typ">Payment</label>
                                                                <cntrl.WKLSelect name="Payment_typ" compareKey="ID" displayField="Text" placeholder="Select Payment" allowClear={true} ref={(el) => this.onRefChange(el, 'Payment_typ')} selectedItem={dataModel.Payment_typ} dataSource={model.PaymentTypList} onChange={this.onChange}>
                                                                </cntrl.WKLSelect>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                 {dataModel?.Payment_typ?.ID == "H" && <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="col-md-12">
                                                            <div className="mb-2">
                                                                <label className="form-label" >Handpoint Key</label>
                                                                <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'HandpointKey')} name="HandpointKey" placeholder="Enter Handpoint Key" value={dataModel.HandpointKey} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.textbox} maxLength={100}>
                                                                </cntrl.WKLTextbox>
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label" >Handpoint Terminal</label>
                                                                <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'HandpointTermTyp')} name="HandpointTermTyp" placeholder="Enter Handpoint Terminal" value={dataModel.HandpointTermTyp} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.textbox} maxLength={25}>
                                                                </cntrl.WKLTextbox>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="col-md-12">
                                                            <div className="mb-2">
                                                                <label className="form-label" >Handpoint Serial Number</label>
                                                                <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'HandpointSN')} name="HandpointSN" placeholder="Enter Handpoint Serial Number" value={dataModel.HandpointSN} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.textbox} maxLength={25}>
                                                                </cntrl.WKLTextbox>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>}

                                             {dataModel?.Payment_typ?.ID == "F" && <div className="row">
                                                <div className="col-md-6">
                                                    <div className="col-md-12">
                                                        <div className="mb-2">
                                                            <label className="form-label" >Freedom Store Id</label>
                                                            <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Frdm_str_id')} name="Frdm_str_id" placeholder="Enter Freedom Store Id" value={dataModel.Frdm_str_id} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.textbox} maxLength={100}>
                                                            </cntrl.WKLTextbox>
                                                        </div>
                                                        <div className="mb-2">
                                                            <label className="form-label" >Freedom Terminal Id</label>
                                                            <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Frdm_trmnl_id')} name="Frdm_trmnl_id" placeholder="Freedom Terminal Id" value={dataModel.Frdm_trmnl_id} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.textbox} maxLength={100}>
                                                            </cntrl.WKLTextbox>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="col-md-12">
                                                        <div className="mb-2">
                                                           <label className="col-form-label" htmlFor="Frdm_dcc_req">Freedom DCC</label>
                                                            <div className="mb-2">
                                                            <input className="form-check-input ms-2" type="checkbox" name="Frdm_dcc_req" checked={dataModel.Frdm_dcc_req} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>}



                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='row mx-auto mt-3 mb-2' hidden={disableModifiedBy}>
                                <div className='col'>
                                    <cntrl.WKLAuditLabel hidden={disableModifiedBy} modifiedOn={dataModel.ModifiedOn} modifiedBy={dataModel.ModifiedBy} />
                                </div>
                            </div>
                        </div>
                    </div>
                </cntrl.WKLBody >
                <div className="window-button-area">
                    <div className="row">
                        <div className="col">
                        </div>
                        <div className="col-auto">

                            <cntrl.WKLButtonWrapper id={this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_new'} formID={model.FormID} onClick={(e) => this.clickAction({ id: 'btn_new' })}>
                                <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
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