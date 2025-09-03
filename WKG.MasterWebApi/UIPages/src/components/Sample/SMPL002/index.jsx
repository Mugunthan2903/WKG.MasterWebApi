import React from 'react';
import SMPL002VM from './SMPL002VM';
import * as cntrl from '../../../wkl-components';

export default class SMPL002 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMPL002VM(props));
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
            model[e.target.name] = e.target.value === "A";
            this.VM.updateUI();
        }
    };
    onSearchChange = (e) => {
        if (this.VM) {
            this.VM.Data.SearchInput[e.name] = e.value;
            this.VM.doSearchClear(false);
        }
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
            }
        }
    }
    onGridCellClick = (e, item) => {
        if (this.VM) {
            this.VM.setSelectedItem(item.data);
            this.updateUI();
        }
    }
    onGridCellDoubleClick = (e, item) => {
        if (this.VM) {
            this.VM.handleDataChange(item.data);
        }
    }
    onPageChange = (e, type, val) => {
        if (this.VM)
            this.VM.loadPage(val);
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
    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }

    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
        const attr =
        {
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
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
    }
    renderForm() {
        const dataModel = this.VM.Data.Input;

        return (<form>
            <div className="mb-2">
                <label className="form-label" htmlFor="GENM010_txt_Text">Name<span className="text-danger text-mandatory">*</span></label>
                <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Text')} name="Text" value={dataModel.Text} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}></cntrl.WKLTextbox>
            </div>
            <div className="row">
                <div className="col">
                    <div className="mb-2">
                        <label className="form-label" htmlFor="GENM010_txt_accountrf">Account Ref<span className="text-danger text-mandatory">*</span></label>
                        <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'AccountRef')} name="AccountRef" value={dataModel.AccountRef} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={10}></cntrl.WKLTextbox>
                    </div>
                </div>
                <div className="col">
                    <div className="mb-2">
                        <label className="form-label" htmlFor="GENM010_txt_taxcode">Type</label>
                        <cntrl.WKLSelect name="Type" compareKey="ID" displayField="Text" placeholder="Select Type" allowClear={true} ref={(el) => this.onRefChange(el, 'Type')} selectedItem={dataModel.Type} dataSource={this.VM.Data.TypeList} onChange={(e, s, d) => this.onChange({ name: 'Type', value: s })}>
                        </cntrl.WKLSelect>
                    </div>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >Status</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="statusA_GENM010" radioGroup="status_GENM010" name="IsActive" checked={dataModel.IsActive} onChange={this.onRadioChange} value="A" />
                        <label className="form-check-label" htmlFor="statusA_GENM010">Active</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="statusI_GENM010" radioGroup="status_GENM010" name="IsActive" checked={dataModel.IsActive === false} onChange={this.onRadioChange} value="I" />
                        <label className="form-check-label" htmlFor="statusI_GENM010">Inactive</label>
                    </div>
                </div>
            </div>
        </form >);
    }
    render() {
        const owner = this;

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
                <div className="window-content-area p-3">
                    <div className="container-fluid p-0">
                        <div className="row">
                            <div className="col-md-5">
                                <div className="row">
                                    <div className="col">
                                        <div className="mb-2">
                                            <label className="form-label" >GL Account</label>
                                            <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SearchText')} name="Text" value={dataModel.Text} onChange={this.onSearchChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
                                            </cntrl.WKLTextbox>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-5">
                                        <div className="mb-2">
                                            <label className="form-label" >Account Type</label>
                                            <cntrl.WKLSelect name="AccountType" compareKey="ID" displayField="Text" placeholder="Select account type" allowClear={true} ref={(el) => this.onRefChange(el, 'SearchAccountType')} selectedItem={dataModel.AccountType} dataSource={model.AccountTypeList} onChange={(e, s, d) => this.onSearchChange({ name: 'AccountType', value: s })}>
                                            </cntrl.WKLSelect>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-2">
                                            <label className="form-label" >Status</label>
                                            <cntrl.WKLSelect name="Status" compareKey="ID" displayField="Text" placeholder="Select Status" allowClear={true} ref={(el) => this.onRefChange(el, 'SearchStatus')} selectedItem={dataModel.Status} dataSource={model.StatusList} onChange={(e, s, d) => this.onSearchChange({ name: 'Status', value: s })}>
                                            </cntrl.WKLSelect>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
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
                            <div className="col-md-7 border-start">
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
                            <button type="button" id="btn_audit" hot-key="A" className="btn btn-sm btn-audit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_audit' })}><i className="fa fa-history"></i> </button>
                        </div>
                        <div className="col border-start">
                            <cntrl.WKLButtonWrapper id="btn_delete" hidden={disableDeleteButton} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hidden={disableDeleteButton} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                            </cntrl.WKLButtonWrapper>
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