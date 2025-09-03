import React from 'react';
import SSM016VM from './SSM016VM';
import * as cntrl from '../../../wkl-components';

export default class SSM016 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM016VM(props));
        this.inputRefs = {};

    }
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM) {
                // this.VM.loadInitData();
            }
        }.bind(this), 100)
    }
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };
    onChange = (e) => {
        if (this.VM) {
            let model = this.Data.Input;
            model[e.name] = e.value;
            this.VM.updateUI();
        }
    }
    onCheckChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data.Input;
            model[e.target.name] = e.target.checked;
            this.updateUI();
        }
    }
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
                <div className="window-content-area p-3 vh-100" style={{ width: "30rem" }}>
                    <div className="container-fluid h-100 p-0">
                        <div className="row h-100">
                            <div className="col-md-12">
                                <div className="mb-2">
                                    <label className="form-label" >New Group Name<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Group_Name')} name="Group_Name" placeholder="Enter New Group Name" value={dataModel.Group_Name} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={200}>
                                    </cntrl.WKLTextbox>
                                </div>
                                <div className="col-md-12">
                                    <label className="col-form-label pt-0" htmlFor="Homepg_Config">Home Page Config</label>
                                    <div className="col-md-3">
                                        <input className="form-check-input ms-2" type="checkbox" name="Homepg_Config" checked={dataModel.Homepg_Config} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <label className="col-form-label pt-0" htmlFor="Popular_Dest">Popular Destination</label>
                                    <div className="col-md-3">
                                        <input className="form-check-input ms-2" type="checkbox" name="Popular_Dest" checked={dataModel.Popular_Dest} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <label className="col-form-label pt-0" htmlFor="Trans_Config">Transfer Config</label>
                                    <div className="col-md-3">
                                        <input className="form-check-input ms-2" type="checkbox" name="Trans_Config" checked={dataModel.Trans_Config} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <label className="col-form-label pt-0" htmlFor="Banner_Config">Banner Config</label>
                                    <div className="col-md-3">
                                        <input className="form-check-input ms-2" type="checkbox" name="Banner_Config" checked={dataModel.Banner_Config} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col">
                        </div>
                        <div className="col-auto">

                            <cntrl.WKLButtonWrapper id={this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_new'} formID={model.FormID} onClick={(e) => this.clickAction({ id: 'btn_new' })}>
                                <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-copy"></i> Copy</button>
                            </cntrl.WKLButtonWrapper>
                            {/* <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_cancel' })}><i className="fa fa-refresh"></i> Clear</button> */}
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>
        )
    }
}