import React from 'react';
import SMST022VM from './SMST022VM';
import * as cntrl from '../../../wkl-components';

export default class SMST022 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST022VM(props));
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
    onChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data.Input;
            if (e.name === "Cat_Name_S") {
                model = this.VM.Data.SearchInput;
                this.VM.doSearchClear(false);
            }
            if (e.name)
                model[e.name] = e.value;
            else if (e.target && e.target.name)
                model[e.target.name] = e.target.value;
            this.updateUI();
        }
    };
    onRadioChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data.Input;
            model[e.target.name] = e.target.value === "A";
            this.VM.updateUI();
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
                    this.VM.loadPage(1);
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
                    this.VM.handleSave(1);
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
    // handles grid single click
    onGridCellClick = (e) => {
        if (this.VM) {
            this.VM.setSelectedItem(e.row);
            this.updateUI();
        }
    }
    // handles grid double click
    onGridCellDoubleClick = (e) => {
        if (this.VM) {
            this.VM.handleDataChange(e.row);
        }
    }
    // handles page change for grid
    onPageChange = (e) => {

        this.VM.loadPage(e.value, e.columnOptions);
    }
    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.loadPage(gridInfo.Page, e.columnOptions);

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
    // function the that renders grid
    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
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
    // function the that renders form
    renderForm() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;

        return (<form>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label">Name<span className="text-danger text-mandatory">*</span></label>
                    <div className='col-md-12'>
                        <cntrl.WKLTextbox disabled={true} mandatory={true} name="Cat_Name_F" allowClear={true} ref={(el) => this.onRefChange(el, 'Cat_Name_F')} value={dataModel.Cat_Name_F} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={50}>
                        </cntrl.WKLTextbox>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label">Short Name</label>
                    <div className='col-md-12'>
                        <cntrl.WKLTextbox mandatory={true} name="Shrt_name_F" allowClear={true} ref={(el) => this.onRefChange(el, 'Shrt_name_F')} value={dataModel.Shrt_name_F} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={50}>
                        </cntrl.WKLTextbox>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label" >Status<span className="text-danger text-mandatory">*</span></label>
                    <div className="form-control border-0 ps-0">
                        <div className="form-check  form-check-inline" style={{ margin: "0 5px 0 5px" }}>
                            <input type="radio" className="form-check-input" id="act_inactA_F" radioGroup="SMST022_act_inact_F" name="IsActiveF" checked={dataModel.IsActiveF} onChange={this.onRadioChange} value="A" />
                            <label className="form-check-label" htmlFor="act_inactA_F">Active</label>
                        </div>
                        <div className="form-check  form-check-inline" style={{ margin: "0 5px 0 5px" }}>
                            <input type="radio" className="form-check-input" id="act_inactI_F" radioGroup="SMST022_act_inact_F" name="IsActiveF" checked={dataModel.IsActiveF === false} onChange={this.onRadioChange} value="I" />
                            <label className="form-check-label" htmlFor="act_inactI_F">Inactive</label>
                        </div>
                    </div>
                </div>
            </div>
            {model.IsEdit && <><div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label">Type Available</label>
                    <div className='col-md-12'>
                        <cntrl.WKLTextbox disabled={true} name="WKG_Type_F" value={dataModel.WKG_Type_F} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={50}>
                        </cntrl.WKLTextbox>
                    </div>
                </div>
            </div>
                <div className="col-md-12">
                    <div className="mb-2">
                        <label className="form-label">Sort Order</label>
                        <div className='col-md-12'>
                            <cntrl.WKLTextbox disabled={true} name="Sort_order_F" value={dataModel.Sort_order_F} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={50}>
                            </cntrl.WKLTextbox>
                        </div>
                    </div>
                </div>
                <div className='row mt-4'>
                    <div className='col'>
                        <cntrl.WKLAuditLabel modifiedOn={dataModel.Modifiedon} modifiedBy={dataModel.Modifiedby} />
                    </div>
                </div></>}
        </form >);
    }
    render() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.SearchInput;
        let disableEdit = true;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;

            if (model.GridInfo.SelectedItem)
                disableEdit = false;

        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area p-3 vh-100">
                    <div className="container-fluid p-0 h-100">
                        <div className="row h-100">
                            <div className="col-md-7">
                                <div className="row">
                                    <div className="col-md-10">
                                        <div className="mb-2">
                                            <label className="form-label" >Category Name</label>
                                            <cntrl.WKLTextbox mandatory={true} name="Cat_Name_S" allowClear={true} ref={(el) => this.onRefChange(el, 'Cat_Name_S')} value={dataModel.Cat_Name_S} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
                                            </cntrl.WKLTextbox>
                                        </div>
                                    </div>
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
                            <div className="col-md-5 border-start">
                                {this.renderForm()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                            {/* <button type="button" id="btn_new1" hot-key="N" className="btn btn-sm btn-add1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_new1' })} ><i className="fa fa-plus"></i> New</button> */}
                            <button type="button" id="btn_edit1" disabled={disableEdit} hot-key="M" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_edit1' })}> <i className="fa fa-edit"></i> Modify</button>
                            {/* <button type="button" id="btn_audit" hot-key="A" className="btn btn-sm btn-audit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_audit' })}><i className="fa fa-history"></i> </button> */}
                        </div>
                        <div className="col border-start">
                            {/* <cntrl.WKLButtonWrapper id="btn_delete" hidden={true} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hidden={true} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                            </cntrl.WKLButtonWrapper> */}
                        </div>
                        <div className="col-auto">
                            {/* <button type="button" id={model.Input.IsEdit ? "btn_edit" : "btn_save"} hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1" onClick={(e) => this.clickAction({ id: model.Input.IsEdit ? "btn_edit" : "btn_save" })}><i className="fa fa-save"></i> Save</button> */}
                            <cntrl.WKLButtonWrapper id={this.VM.Data.IsEdit ? 'btn_edit' : 'btn_save'} formID={model.FormID} onClick={this.clickAction}>
                                <button disabled={!model.IsEdit} type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
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