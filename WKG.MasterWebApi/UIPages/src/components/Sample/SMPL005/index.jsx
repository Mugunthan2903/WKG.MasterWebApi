import React from 'react';
import SMPL005VM from './SMPL005VM';
import * as cntrl from '../../../wkl-components';

export default class SMPL005 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMPL005VM(props));
        this.inputRefs = { header: null, childs: {} };
    }
    onLoad = () => {
        if (this.VM) {
            this.VM.loadInitialData();
        }
    };
    onClosing = (e) => {
        if (this.VM)
            this.VM.doClose();
        return false;
    };
    onChange = (e) => {
        if (this.VM) {
            console.log(e);
            const model = this.VM.Data.Input;
            if (e.name === 'SMST002_lang_code_form') {
                model[e.name] = e.value;
                this.VM.doSearchClear(false);
            }
            else
                model[e.name] = e.value;
            this.updateUI();
        }
    };
    fileChange = (e) => {
        const model = this.VM.Data.Input;
        model.SMST002_file.name = e.name
        model.SMST002_file.value = e.value
        this.updateUI();
    }
    setFocus = (name) => {
        if (this.inputRefs[name] && this.inputRefs[name].focus)
            this.inputRefs[name].focus();
    };
    onRefChange = (el, name) => {
        this.inputRefs[name] = el;
    };
    onRadioChangeF = (e) => {
        if (this.VM) {
            const model = this.VM.Data.Input;
            model[e.target.name] = e.target.value === "A";
            this.VM.updateUI();
        }
    };
    onRadioChangeS = (e) => {
        if (this.VM) {
            const model = this.VM.Data.Input;
            model[e.target.name] = e.target.value === "A";
            this.VM.updateUI();
        }
    };
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
            }
        }
    }
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };
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
    // onSortChange = (e) => {
    //     const gridInfo = this.VM.Data.GridInfo;
    //     this.VM.handleSort(e.columnOptions);
    // }
    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.loadPage(1, e.columnOptions);

    }
    onFilterChange = (e) => {
        console.log("filterChange", e)
    }
    renderForm() {
        const dataModel = this.VM.Data.Input;

        return (<form>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label" >Code<span className="text-danger text-mandatory">*</span></label>
                    <div className='col-md-12'>
                        <cntrl.WKLTextbox disabled={dataModel.IsEdit} mandatory={true} name="SMST002_lang_code_form" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST002_lang_code_form')} value={dataModel.SMST002_lang_code_form} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={10}>
                        </cntrl.WKLTextbox>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label" htmlFor="SMST002_lang_nam">Name<span className="text-danger text-mandatory">*</span></label>
                    <div className='col-md-12'>
                        <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SMST002_lang_name_form')} name="SMST002_lang_name_form" value={dataModel.SMST002_lang_name_form} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={30}></cntrl.WKLTextbox>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label" >Tui Code</label>
                    <div className='col-md-12'>
                        <cntrl.WKLTextbox mandatory={true} name="SMST002_tui_lang_code_form" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST002_tui_lang_code_form')} value={dataModel.SMST002_tui_lang_code_form} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={10}>
                        </cntrl.WKLTextbox>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label" >Combo</label>
                    <div className='col-md-12'>
                        <cntrl.WKLCombobox mandatory={true} name="SMST002_combo" ref={(el) => this.onRefChange(el, 'SMST002_combo')} value={dataModel.SMST002_combo} onChange={this.onChange}>
                        </cntrl.WKLCombobox>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label" >File</label>
                    <div className='col-md-12'>
                        <cntrl.WKLFile isMultiFile={true} accept=".png,.jpg.svg,.txt" mandatory={true} name="SMPL005" value={dataModel.SMST002_file.value} onChange={this.fileChange}>
                        </cntrl.WKLFile>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label" >Status<span className="text-danger text-mandatory">*</span></label>
                    <div className="form-control border-0 ps-0">
                        <div className="form-check  form-check-inline">
                            <input type="radio" className="form-check-input" id="statusA_SMST002_F" radioGroup="status_SMST002_F" name="IsActiveF" checked={dataModel.IsActiveF} onChange={this.onRadioChangeF} value="A" />
                            <label className="form-check-label" htmlFor="statusA_SMST002_F">Active</label>
                        </div>
                        <div className="form-check  form-check-inline">
                            <input type="radio" className="form-check-input" id="statusI_SMST002_F" radioGroup="status_SMST002_F" name="IsActiveF" checked={dataModel.IsActiveF === false} onChange={this.onRadioChangeF} value="I" />
                            <label className="form-check-label" htmlFor="statusI_SMST002_F">Inactive</label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col-md-8">
                    <label className="col-form-label pt-0" htmlFor="Name">Autocomplete</label>
                    <cntrl.WKLPlaceSearch name="Name" value={dataModel.Name} isCitySearch={true} onChange={this.onChange} placeholder="Name" maxLength={20} inputType={cntrl.WKLTextboxTypes.textbox} />
                </div>
            </div>
            {dataModel.IsEdit && dataModel.Modifiedon != "" &&
                (<div className='row mt-4'>
                    <div className='col'>
                        <cntrl.WKLAuditLabel modifiedOn={dataModel.Modifiedon} modifiedBy={dataModel.Modifiedby} />

                    </div>
                </div>)}
        </form >);
    }
    rowButtonClick = (e) => {
        if (this.VM) {
            this.VM.openWindow();
        }

    }
    columnCheckBox = (e) => {
        return (<><button className='' name={e.row.lang_cd} onClick={this.rowButtonClick}>{e.row.lang_cd}</button></>)
    };
    renderGrid() {
        const model = this.VM.Data.Input;
        const gridInfo = this.VM.Data.GridInfo;
        // model.isSearchClicked = true;
        // console.log('model from grid', model);
        gridInfo.Columns.forEach((e, i) => {
            if (i === 4)
                e.onRender = this.columnCheckBox;
        })
        // model.isSearchClicked = false;
        const attr =
        {
            // showFilter: true,
            // externalSort: true,
            multiSelect: true,
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
                { className: 'inactive-row', condition: (p) => { return p['act_inact_ind'] == "Inactive" } },
            ],
            onGridCellClick: this.onGridCellClick,
            onGridCellDoubleClick: this.onGridCellDoubleClick,
            onSortChange: this.onSortChange,
            onFilterChange: this.onFilterChange,
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
    }
    render() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;
        let disableEdit = true;
        let disableDeleteButton = true;
        let title = '';
        let showloading = false;
        console.log("smpl005 VM", this.VM);
        console.log("smpl005 DATA", this.Data);
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
                    <div className="container-fluid h-100 p-0">
                        <div className="row h-100">
                            <div className="col-md-6">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-2">
                                            <label className="form-label" >Search Input</label>
                                            <cntrl.WKLTextbox name="SearchInp" compareKey="ID" displayField="Text" placeholder="Search" allowClear={true} ref={(el) => this.onRefChange(el, 'SearchInp')} value={dataModel.SearchInp} onChange={this.onChange}>
                                            </cntrl.WKLTextbox>
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-2">
                                        <label className="form-label col-md-2" >Status</label>
                                        <div className="form-control border-0 ps-0">
                                            <div className="form-check  form-check-inline">
                                                <input type="radio" className="form-check-input" id="act_inactA_S" radioGroup="SMST010_act_inact_S" name="IsActiveS" checked={dataModel.IsActiveS} onChange={this.onRadioChangeS} value="A" />
                                                <label className="form-check-label" htmlFor="act_inactA_S">Active</label>
                                            </div>
                                            <div className="form-check  form-check-inline">
                                                <input type="radio" className="form-check-input" id="act_inactI_S" radioGroup="SMST010_act_inact_S" name="IsActiveS" checked={dataModel.IsActiveS === false} onChange={this.onRadioChangeS} value="I" />
                                                <label className="form-check-label" htmlFor="act_inactI_S">Inactive</label>
                                            </div>
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
                            <div className="col-md-1 border-start">
                                {/* <button type="button" id="btn_open_config_window" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_open_config_window' })}>Config</button> */}
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
                        <div className="col border-start">
                            {/* <cntrl.WKLButtonWrapper id="btn_delete" hidden={true} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hidden={true} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                            </cntrl.WKLButtonWrapper> */}
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