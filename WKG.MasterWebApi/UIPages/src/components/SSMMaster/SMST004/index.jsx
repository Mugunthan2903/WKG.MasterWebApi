import React from 'react';
import SMST004VM from './SMST004VM';
import * as cntrl from '../../../wkl-components';

export default class SMST004 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST004VM(props));
        this.inputRefs = {};
    }
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
    }
    // added closing
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };

    //set focus input 
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

    //handle page change
    onPageChange = (e) => {
        if (this.VM)
            this.VM.IniloadPage(e.value, e.columnOptions);
    };
    //Get field name to focus
    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }

    //Btn click action
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
                else if (action === 'btn_open_window') {
                    this.VM.openWindow();
                }
            }
        }
    }

    //Onchange text field
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
    //Grid click
    onGridCellClick = (e, item) => {
        if (this.VM) {
            this.VM.setSelectedItem(e.row);
            this.updateUI();
        }
    }

    //Grid Double click
    onGridCellDoubleClick = (e, item) => {
        if (this.VM) {
            this.VM.Data.Input.IsEdit = true;
            this.VM.handleDataChange(e.row);
        }
    }
    //Radio btn change
    onRadioChange = (e) => {
        let model = "";
        if (this.VM) {
            if (e.target.name == "StatusN") {
                model = this.VM.Data.Input;
            }
            else {
                model = this.VM.Data.SearchInput;
            }
            model[e.target.name] = e.target.value === "A";
            this.VM.updateUI();
        }
    };

    //search input change
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

    //Rendering edit form
    renderForm() {
        const dataModel = this.VM.Data.Input;
        const model = this.VM.Data;
        return (<form>
            <div className="col-md-12">
                <div className="mb-3">
                    <label className="form-label" htmlFor="SMST001_txt_Text">Supplier Map Id<span className="text-danger text-mandatory">*</span></label>
                    <div className='col-md-12'>
                        <cntrl.WKLSelect disabled={dataModel.IsEdit} name="SMST004_Mpid" compareKey="ID" displayField="Text" placeholder="Select Map Id" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST004_Mpid')} selectedItem={dataModel.SMST004_Mpid} dataSource={model.SMST004_Mpid_list} onChange={this.onSearchChangeIn}>
                        </cntrl.WKLSelect>
                    </div>
                </div>


                <div className="mb-3">
                    <label className="form-label" htmlFor="SMST001_txt_Text">Production End Point</label>
                    <div className='col-md-12'>
                        <cntrl.WKLSelect name="SMST004_prd_endpt" compareKey="ID" displayField="Text" placeholder="Select Product" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST004_prd_endpt')} selectedItem={dataModel.SMST004_prd_endpt} dataSource={model.SMST004_prd_endpt_list} onChange={this.onSearchChangeIn}>
                        </cntrl.WKLSelect>
                    </div>
                </div>


                <div className="mb-3">
                    <label className="form-label" htmlFor="SMST001_txt_Text">Sandbox End Point</label>
                    <div className='col-md-12'>
                        <cntrl.WKLSelect name="SMST004_sndx_endpt" compareKey="ID" displayField="Text" placeholder="Select Sandbox" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST004_sndx_endpt')} selectedItem={dataModel.SMST004_sndx_endpt} dataSource={model.SMST004_sndx_endpt_list} onChange={this.onSearchChangeIn}>
                        </cntrl.WKLSelect>
                    </div>
                </div>


                <div className="mb-3">
                    <label className="form-label" >Status</label>
                    <div className="form-control border-0 ps-0">
                        <div className="form-check  form-check-inline">
                            <input type="radio" className="form-check-input" id="Input_SMST004A" radioGroup="Input_SMST004" name="StatusN" checked={dataModel.StatusN} onChange={this.onRadioChange} value="A" />
                            <label className="form-check-label" htmlFor="Input_SMST004A">Active</label>
                        </div>
                        <div className="form-check  form-check-inline">
                            <input type="radio" className="form-check-input" id="Input_SMST004IN" radioGroup="Input_SMST004" name="StatusN" checked={dataModel.StatusN === false} onChange={this.onRadioChange} value="I" />
                            <label className="form-check-label" htmlFor="Input_SMST004IN">Inactive</label>
                        </div>
                    </div>
                </div>


                <div className="mb-2">
                    <label className="form-label" htmlFor="SMST001_txt_Text">Last Pull Datetime</label>
                    <div className='col-md-12'>
                        <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SMST004_pull_dt')} name="SMST004_pull_dt" value={dataModel.SMST004_pull_dt} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={30} disabled={true}></cntrl.WKLTextbox>
                    </div>
                </div>

                {dataModel.IsEdit && dataModel.mod_dttm !== "" && (
                    <div className='row mt-4'>
                        <div className='col-md-12'>
                            {dataModel.IsEdit && dataModel.mod_by_usr_cd != "" && <cntrl.WKLAuditLabel modifiedOn={dataModel.mod_dttm} modifiedBy={dataModel.mod_by_usr_cd} />}
                        </div>
                    </div>)}
            </div>
        </form>);
    }
    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.IniloadPage(gridInfo.Page, e.columnOptions);

    }
    // columnCheckBox = (e) => {
    //     return (<input class="form-check-input" type="checkbox" name="IsSelected" checked={e.row.IsSelected === true} onChange={(ex) => this.onCheckChange(ex, e.row, e.dataSource)} />)
    // };
    // headerColumnCheckBox = () => {
    //     const model = this.VM.Data;
    //     return (<input class="form-check-input" type="checkbox" name="AllSelected" checked={model.AllSelected === true} onChange={(e) => this.onCheckChange(e)} />)
    // };
    //Rendering grid
    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
        //gridInfo.Columns[0].onRender = this.columnCheckBox;
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

    //Rendering search inputs
    render() {
        const owner = this;
        const model = this.VM.Data;
        const dataModel = this.VM.Data.SearchInput;
        let showloading = false;
        let title = '';
        let disableEdit = true;
        let disableDeleteButton = true;
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
                <div className="window-content-area vh-100 p-3">
                    <div className="container-fluid p-0">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="row">
                                    <div className="col-md-7 mb-2">
                                        <label className="form-label col-md-2" >Status</label>
                                        <div className="form-control border-0 ps-0">
                                            <div className="form-check  form-check-inline">
                                                <input type="radio" className="form-check-input" id="statusA_SMST004" radioGroup="status_SMST004" name="IsActive" checked={dataModel.IsActive} onChange={this.onRadioChange} value="A" />
                                                <label className="form-check-label" htmlFor="statusA_SMST004">Active</label>
                                            </div>
                                            <div className="form-check  form-check-inline">
                                                <input type="radio" className="form-check-input" id="statusI_SMST004" radioGroup="status_SMST004" name="IsActive" checked={dataModel.IsActive === false} onChange={this.onRadioChange} value="I" />
                                                <label className="form-check-label" htmlFor="statusI_SMST004">Inactive</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-5">
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
                            <div className="col-md-1 border-start">
                                <div className='row'>
                                    <div className='col'>
                                        <button disabled={!model.Input.IsEdit} type="button" id="btn_open_window" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_open_window' })}>Pos config</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                            <button type="button" id="btn_new1" hot-key="N" className="btn btn-sm btn-add1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_new1' })} ><i className="fa fa-plus"></i> New</button>
                            <button type="button" id="btn_edit1" disabled={disableEdit} hot-key="M" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_edit1' })}> <i className="fa fa-edit"></i> Modify</button>
                        </div>
                        <div className="col border-start">
                            {/*<cntrl.WKLButtonWrapper id="btn_delete" hidden={disableDeleteButton} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hidden={disableDeleteButton} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                            </cntrl.WKLButtonWrapper>
                            */}
                        </div>
                        <div className="col-auto">
                            <button type="button" id={this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_new'} formID={model.FormID} onClick={(e) => this.clickAction({ id: this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_new' })} hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_cancel' })}><i className="fa fa-refresh"></i> Clear</button>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>
        )
    }
}