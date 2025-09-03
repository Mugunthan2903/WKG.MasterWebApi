import React from 'react';
import SMST018VM from './SMST018VM';
import * as cntrl from '../../../wkl-components';


export default class SMST018 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST018VM(props));
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
            model[e.name] = e.value;
            this.VM.updateUI();
        }
        console.log('onchnage : ', e)
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
                    this.VM.handleSearch();
                }
                else if (action == "btn_clear") {
                    this.VM.handleSearchClear();
                }
                else if (action == "btn_new1") { //new 
                    this.VM.handleDataChange();
                }
                else if (action == "btn_edit1") { //modify
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
                    this.VM.handleDataChange()
                }
                else if (action === 'btn_open_window') {
                    this.VM.openWindow();
                }
            }
        }
    }
    onGridCellClick = (e, item) => {
        if (this.VM) {
            this.VM.setSelectedItem(e.row);
            this.updateUI();
        }
    }
    onGridCellDoubleClick = (e, item) => {
        if (this.VM) {
            this.VM.handleDataChange(e.row);
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

    onPageChange = (e) => {
        if (this.VM)
            this.VM.loadPage(e.value, e.columnOptions);
    };
    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.loadPage(gridInfo.Page, e.columnOptions);

    }
    onCheckChange = (e, dataModel) => {
        if (this.VM) {
            const model = this.VM.Data;
            dataModel = dataModel || model;
            dataModel[e.target.name] = e.target.checked;

            if (e.target.name === 'AllSelected') {
                for (const itm of model.GridInfo.Items) {
                    itm.IsSelected = model.AllSelected;
                }
            }
            else {
                model.AllSelected = model.GridInfo.Items.length === model.GridInfo.Items.count(i => i.IsSelected);
            }
            this.updateUI();
        }
    };
    columnCheckBox = (e) => {
        return (<input class="form-check-input" type="checkbox" name="IsSelected" checked={e.row.IsSelected === true} onChange={(ex) => this.onCheckChange(ex, e.row, e.dataSource)} />)
    };
    headerColumnCheckBox = () => {
        const model = this.VM.Data;
        return (<input class="form-check-input" type="checkbox" name="AllSelected" checked={model.AllSelected === true} onChange={(e) => this.onCheckChange(e)} />)
    };

    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
        // gridInfo.Columns[0].onRender = this.columnCheckBox;
        // gridInfo.Columns[0].text = this.headerColumnCheckBox();
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
            columns: gridInfo.Columns || [],
            pageInfo: {
                currentPage: gridInfo.Page,
                totalPages: gridInfo.TotalPage,
                totalCount: gridInfo.TotalRecords,
                onPageChange: this.onPageChange
            },
            rowStyle: [
                { className: 'inactive-row', condition: (p) => { return p['Status'] == "Inactive" } },
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

        let disableModifiedBy = '';
        let disableSSMName = '';
        disableModifiedBy = !model.Input.IsEdit;

        return (<form>

            <div className="mb-2">
                <label className="form-label" htmlFor="SMST018_LangCode">Language<span className="text-danger text-mandatory">*</span></label>
                <div className='col-md-12'>
                    <cntrl.WKLSelect name="SMST018_LangCode" compareKey="ID" displayField="Text" placeholder="Select Language" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST018_LangCode')} selectedItem={dataModel.SMST018_LangCode} dataSource={model.SMST018_LangCodeList} onChange={this.onChangeSelect}>
                    </cntrl.WKLSelect>
                </div>
            </div>
            <div className="mb-3">
                <label className="form-label" >Status</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST018_StatusA" radioGroup="SMST018_Status" name="SMST018_Status" checked={dataModel.SMST018_Status} onChange={this.onRadioChange} value="A" />
                        <label className="form-check-label" htmlFor="SMST018_StatusA">Active</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST018_StatusI" radioGroup="SMST018_Status" name="SMST018_Status" checked={dataModel.SMST018_Status === false} onChange={this.onRadioChange} value="I" />
                        <label className="form-check-label" htmlFor="SMST018_StatusI">Inactive</label>
                    </div>
                </div>
            </div>
            <div className='row mt-4' hidden={disableModifiedBy}>
                <div className='col'>
                    <cntrl.WKLAuditLabel hidden={disableModifiedBy} modifiedOn={dataModel.ModifiedOn} modifiedBy={dataModel.ModifiedBy} />
                </div>
            </div>
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
            disableDeleteButton = !model.Input.IsEdit;
            if (model.GridInfo.SelectedItem)
                disableEdit = false;

        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area vh-100 p-3" >
                    <div className="container-fluid h-100 p-0">
                        <div className="row h-100">
                            <div className="col-md-7">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label" >Status</label>
                                            <div className="form-control border-0 ps-0">
                                                <div className="form-check  form-check-inline">
                                                    <input type="radio" className="form-check-input" id="SMST018_StatusSrchA" radioGroup="SMST018_StatusSrch" name="SMST018_StatusSrch" checked={dataModel.SMST018_StatusSrch} onChange={this.onRadioChange} value="A" />
                                                    <label className="form-check-label" htmlFor="SMST018_StatusSrchA">Active</label>
                                                </div>
                                                <div className="form-check  form-check-inline">
                                                    <input type="radio" className="form-check-input" id="SMST018_StatusSrchI" radioGroup="SMST018_StatusSrch" name="SMST018_StatusSrch" checked={dataModel.SMST018_StatusSrch === false} onChange={this.onRadioChange} value="I" />
                                                    <label className="form-check-label" htmlFor="SMST018_StatusSrchI">Inactive</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3 mb-2">
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
                            <div className="row col-md-5 border-start">
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
                            <button type="button" id="btn_audit" hidden={true} hot-key="A" className="btn btn-sm btn-audit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_audit' })}><i className="fa fa-history"></i> </button>
                        </div>
                        <div className="col border-start">
                            <cntrl.WKLButtonWrapper id="btn_delete" hidden={true} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hidden={true} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                            </cntrl.WKLButtonWrapper>
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


    