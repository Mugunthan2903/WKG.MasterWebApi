import React from 'react';
import SMST011VM from './SMST011VM';
import * as cntrl from '../../../wkl-components';

export default class SMST011 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST011VM(props));
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
    // handling radio change for form
    onRadioChangeC = (e) => {
        if (this.VM) {
            const model = this.VM.Data.Input;
            if (e.target.name === "Refresh_Type_C") {
                if (e.target.value === "hr")
                    model[e.target.name] = 1;
                else if (e.target.value === "er")
                    model[e.target.name] = 2;
                else if (e.target.value === "r")
                    model[e.target.name] = 3;
            } else {
                model[e.target.name] = e.target.value === "A";
            }
            this.VM.updateUI();
        }
    };
    // Combo box change
    selectChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data.Input;
            model[e.name] = e.value;
            this.VM.updateUI();
        }
    };
    // handling form field change
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
                else if (action == "btn_save" || action == "btn_edit") {
                    this.VM.handleSave(e);
                }
                else if (action == "btn_cancel") {
                    this.VM.handleDataChange();
                }
                else if (action === "btn_open_config_window") {
                    this.VM.openConfigWindow();
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
    // function the that renders form
    renderForm() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;
        let startDate = new Date();

        return (<form>
            <div className="col-md-12 mt-2">
                <div className="mb-2">
                    <label className="form-label">Group Name<span className="text-danger text-mandatory">*</span></label>
                    <div className='col-md-12'>
                        <cntrl.WKLSelect name="groupName_C" compareKey="ID" displayField="Text" placeholder="Select Group" allowClear={true} ref={(el) => this.onRefChange(el, 'groupName_C')} selectedItem={dataModel.groupName_C} dataSource={model.groupNamesListC} onChange={this.selectChange}>
                        </cntrl.WKLSelect>
                    </div>
                </div>
            </div>
            <div className='row'>
                <div className="col-md-6">
                    <div className="mb-2">
                        <label className="form-label" >Refresh Type<span className="text-danger text-mandatory">*</span></label>
                        <div className="form-control border-0 ps-0">
                            <div className="form-check  form-check-inline" style={{ marginRight: "7px" }}>
                                <input type="radio" className="form-check-input" id="hard_refresh_C" radioGroup="SMST011_Refresh_Type_C" name="Refresh_Type_C" checked={dataModel.Refresh_Type_C === 1} onChange={this.onRadioChangeC} value="hr" />
                                <label className="form-check-label" htmlFor="hard_refresh_C">Hard</label>
                            </div>
                            <div className="form-check  form-check-inline" style={{ marginRight: "7px" }}>
                                <input type="radio" className="form-check-input" id="emergency_refresh_C" radioGroup="SMST011_act_inact_C" name="Refresh_Type_C" checked={dataModel.Refresh_Type_C === 2} onChange={this.onRadioChangeC} value="er" />
                                <label className="form-check-label" htmlFor="emergency_refresh_C">Emergency</label>
                            </div>
                            <div className="form-check  form-check-inline" style={{ marginRight: "7px" }}>
                                <input type="radio" className="form-check-input" id="refresh_C" radioGroup="SMST010_act_inact_C" name="Refresh_Type_C" checked={dataModel.Refresh_Type_C === 3} onChange={this.onRadioChangeC} value="r" />
                                <label className="form-check-label" htmlFor="refresh_C">Refresh</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-2">
                    {(dataModel.Refresh_Type_C === 1 || dataModel.Refresh_Type_C === 3) && (

                        <div className='col-md-12'>
                            <label className="form-label">Schedule Date<span className="text-danger text-mandatory">*</span></label>
                            <cntrl.WKLDatepicker startDate={startDate} name="Schedule_Date_C" value={dataModel.Schedule_Date_C} onChange={this.onChange} ref={(el) => this.onRefChange(el, 'Schedule_Date_C')} placeholder="Schedule Date" />
                        </div>

                    )}
                </div>
            </div>
        </form >);
    }
    render() {
        const model = this.VM.Data;
        // let disableDeleteButton = true;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
            // disableDeleteButton = !model.Input.IsEdit;

        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12 " loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area p-3 vh-100" style={{ width: "40rem" }}>
                    <div className="container-fluid p-0 h-100">
                        <div className="row h-100">

                            <div className="col-md-12">
                                {this.renderForm()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col border-start">
                            {/* <cntrl.WKLButtonWrapper id="btn_delete" hidden={true} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hidden={true} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                            </cntrl.WKLButtonWrapper> */}
                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_save'} formID={model.FormID} onClick={this.clickAction}>
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