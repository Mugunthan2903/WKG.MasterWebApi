import React from 'react';
import SMST052VM from './SMST052VM';
import * as cntrl from '../../../wkl-components';

export default class SMST052 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST052VM(props));
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
        const dataModel = this.VM.Data.SearchInput;
        let disableEdit = true;
        let disableDeleteButton = true;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
            disableDeleteButton = !model.Input.IsEdit;

            if (model.GridInfo.SelectedItem)
                disableEdit = false;

        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area p-3 vh-100" style={{ width: "40rem" }}>
                    <div className="container-fluid p-0">
                        <div className="row">
                            <div className="col-md-12">
                                <div className='row'>
                                    
                                    <div className="col-md-6 mb-3 px-2" >
                                        <label className="col-form-label" htmlFor="Name">Image</label>
                                        <cntrl.WKLFile isMultiFile={true} name="File" value={model.File} onChange={this.onChange} placeholder="select File" />
                                    </div>
                                    <div className="col-md-6  mb-3 px-2">
                                        <label className="col-form-label" htmlFor="SentenceCase">Sort Order</label>
                                        <cntrl.WKLTextbox name="SentenceCase" value={model.SentenceCase} onChange={this.onChange} placeholder="Sort Order" maxLength={20} inputType={cntrl.WKLTextboxTypes.sentenceCase} />
                                    </div>

                                    <div className="col-md-6  mb-3 px-2">
                                        <label className="col-form-label" htmlFor="SentenceCase">To Link</label>
                                        <cntrl.WKLTextbox name="SentenceCase" value={model.SentenceCase} onChange={this.onChange} placeholder="href" maxLength={20} inputType={cntrl.WKLTextboxTypes.sentenceCase} />
                                    </div>
                                    <div className="col-md-4  mb-3 px-2">
                                        <label className="col-form-label" htmlFor="SentenceCase">Status</label>
                                        <div className="col-md-1">
                                            <input className="form-check-input ms-2" type="checkbox" name="IsSelected" checked="checked" onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                            {/* <button type="button" id="btn_evnt_typ" hot-key="R" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_evnt_typ' })}> <i className="fa fa-edit"></i> Event</button>
                        <button type="button" id="btn_delvry_typ" hot-key="D" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_delvry_typ' })}> <i className="fa fa-edit"></i> Delivery</button>
                        <button type="button" id="btn_audit" hot-key="A" className="btn btn-sm btn-audit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_audit' })}><i className="fa fa-history"></i> </button> */}
                        </div>
                        <div className="col border-start">
                            {/* <cntrl.WKLButtonWrapper id="btn_delete" hidden={true} formID={model.FormID} onClick={this.clickAction}>
                            <button type="button" hidden={true} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                        </cntrl.WKLButtonWrapper> */}
                        </div>
                        <div className="col-auto">
                            <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1"><i className="fa fa-refresh"></i> Clear</button>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>
        )
    }
}