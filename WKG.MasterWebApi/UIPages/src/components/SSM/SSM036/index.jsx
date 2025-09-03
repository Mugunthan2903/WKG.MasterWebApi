import React from 'react';
import SSM036VM from './SSM036VM';
import * as cntrl from '../../../wkl-components';

export default class SSM036 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM036VM(props));
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
            model[e.name] = e.value;
            if (e.name === "Language" && e.value !== null) {
                this.VM.checkProdExist();
            }
            this.VM.updateUI();
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
        let disableLang = true;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
        }
        disableLang = dataModel.IsEdit;
        disableModifiedBy = !dataModel.IsEdit;

        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area p-3 vh-100" style={{ width: "40rem" }}>
                    <div className="container-fluid h-100 p-0">
                        <div className="row">
                            <div className="col-md-12">
                                <div className='row'>
                                    <div className="col-md-6">
                                        <label className="col-form-label" >Language<span className="text-danger text-mandatory">*</span></label>
                                        <cntrl.WKLSelect name="Language" disabled={disableLang} compareKey="ID" displayField="Text" placeholder="Select Language" allowClear={true} ref={(el) => this.onRefChange(el, 'Language')} selectedItem={dataModel.Language} dataSource={model.LanguageList} onChange={this.onChange}>
                                        </cntrl.WKLSelect>
                                    </div>
                                    <div className="col-md-12">
                                        <label className="col-form-label" >Name </label>
                                        <cntrl.WKLTextbox name="Prod_Name" value={dataModel.Prod_Name} onChange={this.onChange} placeholder="Name" maxLength={800} inputType={cntrl.WKLTextboxTypes.sentenceCase} />
                                    </div>
                                    <div className="col-md-12 mt-4">
                                        <div className='row' hidden={disableModifiedBy}>
                                            <div className='col'>
                                                <cntrl.WKLAuditLabel hidden={disableModifiedBy} modifiedOn={dataModel.ModifiedOn} modifiedBy={dataModel.ModifiedBy} />
                                            </div>
                                        </div>
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
                                <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            </cntrl.WKLButtonWrapper>
                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_cancel' })}><i className="fa fa-refresh"></i> Clear</button>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>
        )
    }
}