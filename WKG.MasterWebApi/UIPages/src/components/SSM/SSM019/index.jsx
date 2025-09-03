import React from 'react';
import SSM019VM from './SSM019VM';
import * as cntrl from '../../../wkl-components';

class SSM019 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM019VM(props));
        this.inputRefs = { header: null, childs: {} };
    }
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
    }
    onChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            if (e.name)
                model[e.name] = e.value;
            else if (e.target && e.target.name)
                model[e.target.name] = e.target.value;

            this.updateUI();
        }
    };

    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
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
                else if (action == "btn_cancel") {
                    this.VM.handleDataChange();
                }
                else if (action === "btn_save") {
                    this.VM.handleSave();
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

    render() {
        const model = this.VM.Data;
        let title = "";
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <cntrl.WKLBody>
                    <div className="window-content-area vh-100 p-3" style={{ width: "50rem" }}>
                        <div className="container-fluid h-100 p-0">
                            <div className='row'>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="Sec_tm_ot">Session timeout Seconds<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLTextbox IsEdit={true} mandatory={true} ref={(el) => this.onRefChange(el, 'Sec_tm_ot')} name="Sec_tm_ot" value={model.Sec_tm_ot} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} suffix={0} prefix={5}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="At_cls_sec">Auto close timeout Seconds<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLTextbox IsEdit={true} mandatory={true} ref={(el) => this.onRefChange(el, 'At_cls_sec')} name="At_cls_sec" value={model.At_cls_sec} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} prefix={5} suffix={0}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="Onl_mil_sec">Online timeout Milliseconds<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLTextbox IsEdit={true} mandatory={true} ref={(el) => this.onRefChange(el, 'Onl_mil_sec')} name="Onl_mil_sec" value={model.Onl_mil_sec} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} prefix={5} suffix={0}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="Onl_chk_sec"> Online check interval Milliseconds<span className="text-danger text-mandator   y">*</span></label>
                                    <cntrl.WKLTextbox IsEdit={true} mandatory={true} ref={(el) => this.onRefChange(el, 'Onl_chk_sec')} name="Onl_chk_sec" value={model.Onl_chk_sec} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} prefix={5} suffix={0}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="Ptym_wt_min">Payment wait Minutes<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLTextbox IsEdit={true} mandatory={true} ref={(el) => this.onRefChange(el, 'Ptym_wt_min')} name="Ptym_wt_min" value={model.Ptym_wt_min} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} prefix={2} suffix={0}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="Ptym_dvsc_lco">Payment device location<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLSelect name="Ptym_dvsc_lco" allowclear={false} compareKey="ID" displayField="Text" placeholder="Select Payment device location" ref={(el) => this.onRefChange(el, 'Ptym_dvsc_lco')} selectedItem={model.Ptym_dvsc_lco} dataSource={model.Ptym_dvsc_lco_list} onChange={this.onChange}>
                                    </cntrl.WKLSelect>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="Gmp_Ky">Gmap Key<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Gmp_Ky')} name="Gmp_Ky" value={model.Gmp_Ky} onChange={this.onChange} maxLength={100}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="Gmp_Sty_Id">Gmap Style Id<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Gmp_Sty_Id')} name="Gmp_Sty_Id" value={model.Gmp_Sty_Id} onChange={this.onChange} maxLength={50}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="GmapCountryCode">Gmap Country</label>
                                    <cntrl.WKLTextbox mandatory={true} name="GmapCountryCode" value={model.GmapCountryCode?.Text} disabled={true}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="Theme">Theme<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLSelect name="Theme" allowclear={false} compareKey="ID" displayField="Text" placeholder="Select Theme" ref={(el) => this.onRefChange(el, 'Theme')} selectedItem={model.Theme} dataSource={model.Theme_list} onChange={this.onChange}>
                                    </cntrl.WKLSelect>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="ftp_url">Ftp Url<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'ftp_url')} name="ftp_url" value={model.ftp_url} onChange={this.onChange} maxLength={100}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="ftp_uid">Ftp User Id<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'ftp_uid')} name="ftp_uid" value={model.ftp_uid} onChange={this.onChange} maxLength={50}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="ftp_pwd">Ftp Password<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'ftp_pwd')} name="ftp_pwd" value={model.ftp_pwd} onChange={this.onChange} maxLength={200}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="col-form-label" htmlFor="Barcd_Rtry">BarcodeRetry</label>
                                    <cntrl.WKLSelect name="Barcd_Rtry" allowclear={false} compareKey="ID" displayField="Text" placeholder="Select BarcodeRetry" ref={(el) => this.onRefChange(el, 'Barcd_Rtry')} selectedItem={model.Barcd_Rtry} dataSource={model.Barcd_Rtry_list} onChange={this.onChange}>
                                    </cntrl.WKLSelect>
                                </div>
                                <div className="col-md-12 mb-2">
                                    <label className="col-form-label" htmlFor="Enabled_apiname">Enabled Apis</label>
                                    <cntrl.WKLTextbox mandatory={true} name="Enabled_apiname" value={model.Enabled_apiname} disabled={true}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-12 mb-2">
                                    <label className="col-form-label" htmlFor="Enabled_langname">Enabled Languages</label>
                                    <cntrl.WKLTextbox mandatory={true} name="Enabled_langname" value={model.Enabled_langname} disabled={true}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className='col-md-12 mb-2 mt-3' hidden={!model.IsEdit}>
                                    <div className='col'>
                                        <cntrl.WKLAuditLabel hidden={!model.IsEdit} modifiedOn={model.ModifiedOn} modifiedBy={model.ModifiedBy} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </cntrl.WKLBody>
                <div className="window-button-area">
                    <div className="row" style={{ justifyContent: "end" }}>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={this.VM.Data.IsEdit ? 'btn_edit' : 'btn_save'} formID={model.FormID} onClick={(e) => this.clickAction({ id: 'btn_save' })}>
                                <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i>&nbsp; Save</button>
                            </cntrl.WKLButtonWrapper>
                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_cancel' })}><i className="fa fa-refresh"></i> Clear</button>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>

                    </div>
                </div>
            </cntrl.WKLControl>

        );
    }
}

export default SSM019;