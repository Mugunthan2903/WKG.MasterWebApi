import React from 'react';
import SMST023VM from './SMST023VM';
import * as cntrl from '../../../wkl-components';

export default class SMST023 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST023VM(props));
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
    onRadioChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data.Input;
            model[e.target.name] = e.target.value;
            this.VM.updateUI();
        }
    };
    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }
   
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

                if (action === "btn_search") {
                    this.VM.handleSearch("Click");
                }
                else if (action == "btn_clear") {
                    this.VM.handleSearchClear();
                }
                else if (action == "btn_new1") {
                    this.VM.handleDataChange();
                }
                else if (action == "btn_edit1") {
                    if (this.VM.Data.GridInfo.SelectedItem)
                        this.VM.handleDataChange(this.VM.Data.GridInfo.SelectedItem);
                }
                else if (action === 'btn_delete') {
                    this.VM.handleDelete(e);
                }
                else if (action == "btn_audit") {
                    this.VM.loadAuditWindow(e);
                }
                else if (action == "btn_close") {
                    this.VM.doClose(e);
                }
                else if (action == "btn_new" || action == "btn_edit") {
                    this.VM.handleSave(e);
                }
                else if (action == "btn_cancel") {
                    this.VM.handleDataChange();
                }
                else if (action === 'btn_Lat_click') {
                    this.VM.openWindow("Lat_click");
                }
            }
        }
    }
    onSearchChange = (e) => {
        if (this.VM) {
            this.VM.Data.SearchInput[e.name] = e.value;
            this.VM.doSearchClear(false);
        }
    };

    onSearchChangeIn = (e) => {
        if (this.VM) {
            this.VM.Data.Input[e.name] = e.value;
            // this.VM.doSearchClear(false);
        }
    };
   
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
        const owner = this;
        const dataModel = this.VM.Data.Input;
        const model = this.VM.Data;

        let disableEdit = true;

        let disableDeleteButton = true;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
            disableDeleteButton = !model.Input.IsEdit;
        }

        return (
            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area vh-100 p-3" style={{ width: "50rem" }}>
                    <div className="container-fluid h-100 p-0">
                        <div className="row h-100">
                            <div className="col-md-6">
                                <div className="mb-2">
                                    <label className="form-label" htmlFor="SMST001_txt_Text">Group Name<span className="text-danger text-mandatory">*</span></label>
                                    <div className='col-md-12'>
                                        <cntrl.WKLSelect name="SMST023_Group_Name"  compareKey="ID" displayField="Text" placeholder="Select Group Name" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST023_Group_Name')} selectedItem={dataModel.SMST023_Group_Name} dataSource={model.SMST023_Group_Name_List} onChange={this.onSearchChangeIn}>
                                        </cntrl.WKLSelect>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label" htmlFor="SMST001_txt_Text">Tui Category<span className="text-danger text-mandatory">*</span></label>
                                    <div className='col-md-12'>
                                        <cntrl.WKLSelect name="SMST023_Tui_Category"   multiSelect={true}  compareKey="ID" displayField="Text" placeholder="Select Tui Category" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST023_Tui_Category')} selectedItem={dataModel.SMST023_Tui_Category} dataSource={model.SMST023_Tui_Category_List} onChange={this.onSearchChangeIn}>
                                        </cntrl.WKLSelect>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label" >WKG Markup</label>
                                    <div className='col-md-12'>
                                        <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'SMST023_WKG_Markup')} name="SMST023_WKG_Markup" value={dataModel.SMST023_WKG_Markup} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric}  numericType={cntrl.WKLNumericTypes.both} maxLength={9} prefix={6} suffix={2}>
                                        </cntrl.WKLTextbox>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label" htmlFor="SMST001_txt_Text">Voucher Type<span className="text-danger text-mandatory">*</span></label>
                                    <div className='col-md-12'>
                                        <cntrl.WKLSelect name="SMST023_Voucher_Type"  compareKey="ID" displayField="Text" placeholder="Select Voucher Type" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST023_Voucher_Type')} selectedItem={dataModel.SMST023_Voucher_Type} dataSource={model.SMST023_Voucher_Type_List} onChange={this.onSearchChangeIn}>
                                        </cntrl.WKLSelect>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <label className="form-label" >Sort</label>
                                    <div className='col-md-12'>
                                        <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'SMST023_Sort')} name="SMST023_Sort" value={dataModel.SMST023_Sort} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} maxLength={40}>
                                        </cntrl.WKLTextbox>
                                    </div>
                                </div>

                            </div>
                            <div className="col-md-6">
                                <div className="mb-2">
                                    <label className="form-label" >Featured Product</label>
                                    <div className="form-control border-0 ps-0">
                                        <div className="form-check  form-check-inline">
                                            <input type="radio" className="form-check-input" id="statusY_SMST023" radioGroup="status_SMST023" name="IsActiveY" checked={dataModel.IsActiveY} onChange={this.onRadioChange} value="A" />
                                            <label className="form-check-label" htmlFor="statusY_SMST023">Yes</label>
                                        </div>
                                        <div className="form-check  form-check-inline">
                                            <input type="radio" className="form-check-input" id="statusN_SMST023" radioGroup="status_SMST023" name="IsActiveY" checked={dataModel.IsActiveY == false} onChange={this.onRadioChange} value="I" />
                                            <label className="form-check-label" htmlFor="statusN_SMST023">No</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label" >Status</label>
                                    <div className="form-control border-0 ps-0">
                                        <div className="form-check  form-check-inline">
                                            <input type="radio" className="form-check-input" id="statusA_SMST023" radioGroup="status_SMST023" name="IsActive" checked={dataModel.IsActive} onChange={this.onRadioChange} value="A" />
                                            <label className="form-check-label" htmlFor="statusA_SMST023">Active</label>
                                        </div>
                                        <div className="form-check  form-check-inline">
                                            <input type="radio" className="form-check-input" id="statusI_SMST023" radioGroup="status_SMST023" name="IsActive" checked={dataModel.IsActive == false} onChange={this.onRadioChange} value="I" />
                                            <label className="form-check-label" htmlFor="statusI_SMST023">InActive</label>
                                        </div>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-md-10'>
                                        <div className="mb-2">
                                            <label className="form-label" >Latitude</label>
                                            <div className='col-md-12'>
                                                <cntrl.WKLTextbox disabled ref={(el) => this.onRefChange(el, 'SMST023_Latitude')} name="SMST023_Latitude" value={dataModel.SMST023_Latitude} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.alphaNumeric} maxLength={40}>
                                                </cntrl.WKLTextbox>
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <label className="form-label" >Longitude</label>
                                            <div className='col-md-12'>
                                                <cntrl.WKLTextbox disabled ref={(el) => this.onRefChange(el, 'SMST023_Longitude')} name="SMST023_Longitude" value={dataModel.SMST023_Longitude} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.alphaNumeric} maxLength={40}>
                                                </cntrl.WKLTextbox>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-2 m-auto">
                                    <button type="button" name="btn_Lat_click" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Lat_click' })}><i className="fa fa-map"></i> </button>
                                    </div>
                                </div>
                                {dataModel.IsEdit && dataModel.mod_dttm !== "" && (
                                    <div className='row mt-4'>
                                        <div className='col'>
                                            {dataModel.IsEdit && dataModel.mod_by_usr_cd != "" && <cntrl.WKLAuditLabel modifiedOn={dataModel.mod_dttm} modifiedBy={dataModel.mod_by_usr_cd} />}
                                        </div>
                                    </div>)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                            {/*<button type="button" id="btn_new1" hot-key="N" className="btn btn-sm btn-add1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_new1' })} ><i className="fa fa-plus"></i> New</button>
                            <button type="button" id="btn_edit1" disabled={disableEdit} hot-key="M" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_edit1' })}> <i className="fa fa-edit"></i> Modify</button>
                            <button type="button" id="btn_audit" hot-key="A" className="btn btn-sm btn-audit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_audit' })}><i className="fa fa-history"></i> </button>*/}
                        </div>
                        <div className="col border-start">
                             {/*<cntrl.WKLButtonWrapper id="btn_delete" hidden={disableDeleteButton} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hidden={disableDeleteButton} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                            </cntrl.WKLButtonWrapper>*/}
                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_new'} formID={model.FormID} onClick={this.clickAction}>
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
