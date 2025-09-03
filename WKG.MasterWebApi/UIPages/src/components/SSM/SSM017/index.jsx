import React from 'react';
import SSM017VM from './SSM017VM';
import * as cntrl from '../../../wkl-components';

export default class SSM017 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM017VM(props));
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
    onRadioChangeSrch = (e) => {
        if (this.VM) {
            const model = this.VM.Data.SearchInput;
            model[e.target.name] = e.target.value;
            this.VM.updateUI();
        }
    };
    onChangeSrch = (e) => {
        if (this.VM) {
            const model = this.VM.Data.SearchInput;
            if (e.name)
                model[e.name] = e.value;
            else if (e.target && e.target.name)
                model[e.target.name] = e.target.value;
            this.VM.doSearchClear(false);
            this.updateUI();
        }
    };
    onBlurSrch = (e) => {
        const model = this.VM.Data.Input
        if (this.VM && !model.IsEdit && model.SSM_ID !== "") {
            this.VM.onBlurSrch();
        }
    }
    onCheckChange = (e) => {
        let model = '';
        if (e.target.name === "StatusSrch") {
            model = this.VM.Data.SearchInput;
        }
        else {
            model = this.VM.Data.Input;
        }
        model[e.target.name] = e.target.checked;
        this.VM.updateUI();
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

                if (action === "btn_search") {
                    this.VM.handleSearch(1);
                }
                else if (action == "btn_clear") {
                    this.VM.handleSearchClear();
                }
                else if (action == "btn_new1") {
                    this.VM.handleDataChange();
                }
                else if (action == "btn_edit1") {
                    if (this.VM.Data.GridInfo.SelectedItem) {
                        this.VM.handleDataChange(this.VM.Data.GridInfo.SelectedItem);
                    }
                }
                else if (action == "btn_close") {
                    this.VM.doClose(e);
                }
                else if (action == "btn_save" || action == "btn_edit") {
                    this.VM.handleSave(e);
                }
                else if (action == "btn_cancel") {
                    this.VM.handleDataChange();
                }
                else if (action === "btn_delete") {
                    this.VM.handleDelete();
                }
            }
        }
    }
    onGridCellClick = (e) => {
        if (this.VM) {
            this.VM.setSelectedItem(e.row);
            this.updateUI();
        }
    }
    onGridCellDoubleClick = (e) => {
        if (this.VM) {
            this.VM.handleDataChange(e.row);
        }
    }
    onPageChange = (e) => {

        this.VM.loadPage(e.value, e.columnOptions);
    }
    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.loadPage(gridInfo.Page, e.columnOptions);

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
    renderGrid() {
        const model = this.VM.Data;
        const gridInfo = this.VM.Data.GridInfo;
        const attr =
        {
            footerClass: model.FormID,
            externalSort: true,
            dataSource: gridInfo.Items,
            selectedItems: [gridInfo.SelectedItem],
            isRemoteSort: false,
            rowSelection: true,
            multiSelect: false,
            paging: true,
            totalRows: gridInfo.PageSize,
            columns: gridInfo.Columns,
            pageInfo: {
                currentPage: gridInfo.Page,
                totalPages: gridInfo.TotalPage,
                totalCount: gridInfo.TotalRecords,
                onPageChange: this.onPageChange
            },
            rowStyle: [
                { className: 'inactive-row', condition: (p) => { return p['s'] == "Inactive" } },
            ],
            onGridCellClick: this.onGridCellClick,
            onGridCellDoubleClick: this.onGridCellDoubleClick,
            onSortChange: this.onSortChange,
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
    }
    renderForm() {
        const dataModel = this.VM.Data.Input;
        const model = this.VM.Data;

        return (<form>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label" >Car Type</label>
                    <div className="form-control border-0 ps-0">
                        <div className="form-check  form-check-inline">
                            <input type="radio" className="form-check-input" id="Car_Tpy_B" disabled={model.IsEdit} radioGroup="Car_Tpy" name="Car_Tpy" checked={dataModel.Car_Tpy === model.DefaultCarTpye.Hybrid} onChange={this.onRadioChange} value={model.DefaultCarTpye.Hybrid} />
                            <label className="form-check-label" htmlFor="Car_Tpy_B">Hybrid</label>
                        </div>
                        <div className="form-check  form-check-inline">
                            <input type="radio" className="form-check-input" id="Car_Tpy_E" disabled={model.IsEdit} radioGroup="Car_Tpy" name="Car_Tpy" checked={dataModel.Car_Tpy === model.DefaultCarTpye.Eshuttle} onChange={this.onRadioChange} value={model.DefaultCarTpye.Eshuttle} />
                            <label className="form-check-label" htmlFor="Car_Tpy_E">Eshuttle</label>
                        </div>
                    </div>
                </div>
                <div className="mb-2">
                    <label className="form-label">Postcode<span className="text-danger text-mandatory">*</span></label>
                    <div className='col-md-12'>
                        <cntrl.WKLTextbox mandatory={true} disabled={model.IsEdit} ref={(el) => this.onRefChange(el, 'Postcode')} name="Postcode" value={dataModel.Postcode} onChange={this.onChange} events={{ onBlur: () => this.onBlurSrch() }} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={10} >
                        </cntrl.WKLTextbox>
                    </div>
                </div>
                <div className="mb-2">
                    <label className="col-form-label pt-0" htmlFor="Default_Airport">Default Airport</label>
                    <div className="col-md-4 mt-1">
                        <input className="form-check-input ms-2" type="checkbox" name="Default_Airport" checked={dataModel.Default_Airport} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                    </div>
                </div>
                <div className="mb-2">
                    <label className="col-form-label pt-0" htmlFor="Default_Hotel">Default Hotel</label>
                    <div className="col-md-4 mt-1">
                        <input className="form-check-input ms-2" type="checkbox" name="Default_Hotel" checked={dataModel.Default_Hotel} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                    </div>
                </div>
                <div className="mb-2">
                    <label className="col-form-label pt-0" htmlFor="Eshuttle">Eshuttle</label>
                    <div className="col-md-4 mt-1">
                        <input className="form-check-input ms-2" type="checkbox" name="Eshuttle" checked={dataModel.Eshuttle} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                    </div>
                </div>
                <div className="mb-2">
                    <label className="col-form-label pt-0" htmlFor="Status">Status</label>
                    <div className="col-md-4 mt-1">
                        <input className="form-check-input ms-2" type="checkbox" name="Status" checked={dataModel.Status} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                    </div>
                </div>
            </div>

            {model.IsEdit && dataModel.Modifiedon != "" &&
                (<div className='row mt-4'>
                    <div className='col'>
                        <cntrl.WKLAuditLabel modifiedOn={dataModel.Modifiedon} modifiedBy={dataModel.Modifiedby} />

                    </div>
                </div>)}
        </form >);
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
            disableDeleteButton = !model.IsEdit;

            if (model.GridInfo.SelectedItem)
                disableEdit = false;

        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area p-3 vh-100">
                    <div className="container-fluid p-0 h-100">
                        <div className="row h-100">
                            <div className="col-md-8">
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="mb-2">
                                            <label className="form-label">Postcode</label>
                                            <div className='col-md-12'>
                                                <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'PostcodeSrch')} name="PostcodeSrch" value={model.SearchInput.PostcodeSrch} onChange={this.onChangeSrch} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={10} >
                                                </cntrl.WKLTextbox>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-2">
                                            <label className="form-label" >Car Type</label>
                                            <div className="form-control border-0 ps-0">
                                                <div className="form-check  form-check-inline">
                                                    <input type="radio" className="form-check-input" id="Car_Tpy_Srch_B" radioGroup="Car_Tpy_Srch" name="Car_Tpy_Srch" checked={model.SearchInput.Car_Tpy_Srch === model.DefaultCarTpye.Hybrid} onChange={this.onRadioChangeSrch} value={model.DefaultCarTpye.Hybrid} />
                                                    <label className="form-check-label" htmlFor="Car_Tpy_Srch_B">Hybrid</label>
                                                </div>
                                                <div className="form-check  form-check-inline">
                                                    <input type="radio" className="form-check-input" id="Car_Tpy_Srch_E" radioGroup="Car_Tpy_Srch" name="Car_Tpy_Srch" checked={model.SearchInput.Car_Tpy_Srch === model.DefaultCarTpye.Eshuttle} onChange={this.onRadioChangeSrch} value={model.DefaultCarTpye.Eshuttle} />
                                                    <label className="form-check-label" htmlFor="Car_Tpy_Srch_E">Eshuttle</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="col-md-2">
                                        <label className="col-form-label pt-0" htmlFor="StatusSrch">Status</label>
                                        <div className="col-md-3">
                                            <input className="form-check-input ms-2" type="checkbox" name="StatusSrch" checked={model.SearchInput.StatusSrch} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                        </div>
                                    </div> */}
                                    <div className="col-md-2">
                                        <div className="d-flex flex-row justify-content-end align-items-end h-100 w-100 p-2">
                                            <button type="button" name="btn_search" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_search' })}><i className="fa fa-search"></i> </button>
                                            <button type="button" name="btn_clear" hot-key="R" className="btn btn-sm btn-icon1 btn-primary " onClick={(e) => this.clickAction({ id: 'btn_clear' })}><i className="fa fa-refresh"></i> </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="row mt-2">
                                    <div className="col">
                                        {this.renderGrid()}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 border-start">
                                {this.renderForm()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                            <button type="button" id="btn_new1" hot-key="N" className="btn btn-sm btn-add1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_new1' })} ><i className="fa fa-plus"></i> New</button>
                            <button type="button" id="btn_edit1" disabled={disableEdit} hot-key="M" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_edit1' })}> <i className="fa fa-edit"></i> Modify</button>
                            {/* <button type="button" id="btn_audit" hot-key="A" className="btn btn-sm btn-audit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_audit' })}><i className="fa fa-history"></i> </button> */}
                        </div>
                        <div className="col">
                            <cntrl.WKLButtonWrapper id="btn_delete" formID={model.FormID} onClick={this.clickAction}>
                                <button disabled={disableDeleteButton} type="button" hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                            </cntrl.WKLButtonWrapper>
                        </div>
                        <div className="col-auto">
                            {/* <button type="button" id={model.Input.IsEdit ? "btn_edit" : "btn_save"} hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1" onClick={(e) => this.clickAction({ id: model.Input.IsEdit ? "btn_edit" : "btn_save" })}><i className="fa fa-save"></i> Save</button> */}
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