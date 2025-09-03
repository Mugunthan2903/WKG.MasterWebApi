import React from 'react';
import SSM015VM from './SSM015VM';
import * as cntrl from '../../../wkl-components';

class SSM015 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM015VM(props));
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
                    <div className="window-content-area vh-100 p-3" style={{ width: "30rem" }}>
                        <div className="container-fluid h-100 p-0">
                            <div className='row'>
                                <div className="col-md-12 mb-2">
                                    <label className="col-form-label" htmlFor="Api_key">API<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLSelect name="Api_key" allowclear={false} compareKey="ID" displayField="Text" placeholder="Select API" ref={(el) => this.onRefChange(el, 'Api_key')} selectedItem={model.Api_key} dataSource={model.Api_key_list} onChange={this.onChange}>
                                    </cntrl.WKLSelect>
                                </div>
                                <div className="col-md-12 mb-2">
                                    <label className="col-form-label" htmlFor="SignalRApi_key">SignalR API<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLSelect name="SignalRApi_key" allowclear={false} compareKey="ID" displayField="Text" placeholder="Select SignalR API" ref={(el) => this.onRefChange(el, 'SignalRApi_key')} selectedItem={model.SignalRApi_key} dataSource={model.SignalRApi_key_list} onChange={this.onChange}>
                                    </cntrl.WKLSelect>
                                </div>
                                <div className="col-md-12 mb-2">
                                    <label className="col-form-label" htmlFor="DataApi_key">Data API<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLSelect name="DataApi_key" allowclear={false} compareKey="ID" displayField="Text" placeholder="Select Data API" ref={(el) => this.onRefChange(el, 'DataApi_key')} selectedItem={model.DataApi_key} dataSource={model.DataApi_key_list} onChange={this.onChange}>
                                    </cntrl.WKLSelect>
                                </div>
                                <div className="col-md-12 mb-2">
                                    <label className="col-form-label" htmlFor="Img_dmn_path">Image Path<span className="text-danger text-mandatory">*</span></label>
                                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Img_dmn_path')} name="Img_dmn_path" value={model.Img_dmn_path} onChange={this.onChange} maxLength={50}>
                                    </cntrl.WKLTextbox>
                                </div>
                            </div>
                        </div>
                    </div>
                </cntrl.WKLBody>
                <div className="window-button-area">
                    <div className="row" style={{ justifyContent: "end" }}>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper formID={model.FormID} onClick={(e) => this.clickAction({ id: 'btn_save' })}>
                                <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-file"></i>&nbsp; Generate Config</button>
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

export default SSM015;