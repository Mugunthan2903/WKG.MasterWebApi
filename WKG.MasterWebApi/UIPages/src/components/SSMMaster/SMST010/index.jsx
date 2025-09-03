import React from 'react';
import SMST010VM from './SMST010VM';
import * as cntrl from '../../../wkl-components';

export default class SMST010 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST010VM(props));
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
    onRadioChangeF = (e) => {
        if (this.VM) {
            const model = this.VM.Data.Input;
            if (e.target.name === "Refresh_Type_F") {
                if (e.target.value === "hr")
                    model[e.target.name] = 1;
                else if (e.target.value === "er")
                    model[e.target.name] = 2;
                else if (e.target.value === "r")
                    model[e.target.name] = 3;
                else if (e.target.value === "nr")
                    model[e.target.name] = 4;
            } else {
                model[e.target.name] = e.target.value === "A";
            }
            this.VM.updateUI();
        }
    };
    // handling radio change for search
    onRadioChangeS = (e) => {
        if (this.VM) {
            const model = this.VM.Data.SearchInput;
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
    // Combo box change
    selectChange = (e) => {
        if (this.VM) {
            let model;
            if (e.name === "groupName_S") {
                model = this.VM.Data.SearchInput;
                this.VM.doSearchClear(false);
            }
            else
                model = this.VM.Data.Input;
            model[e.name] = e.value;
            this.VM.updateUI();
        }
    };
    // handling form field change
    onChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data.Input;
            if (e.name === "SSM_Id_F") {
            }
            if (e.name)
                model[e.name] = e.value;
            else if (e.target && e.target.name)
                model[e.target.name] = e.target.value;

            this.updateUI();
        }
    };
    onBlurPrimary = (e) => {
        const model = this.VM.Data.Input
        if (this.VM && !model.IsEdit && model.SSM_Id_F !== "") {
            this.VM.checkPrimary();
        }
    }
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
    columnCheckBox = (e) => {
        return (<input class="form-check-input" type="checkbox" name="IsSelected" checked={e.row.IsSelected === true} onChange={(ex) => this.onCheckChange(ex, e.row, e.dataSource)} />)
    };
    headerColumnCheckBox = () => {
        const model = this.VM.Data;
        return (<input class="form-check-input" type="checkbox" name="AllSelected" checked={model.AllSelected === true} onChange={(e) => this.onCheckChange(e)} />)
    };
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

        let startDate = new Date();

        return (<form>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label">SSM Id<span className="text-danger text-mandatory">*</span></label>
                    <div className='col-md-12'>
                        <cntrl.WKLTextbox disabled={dataModel.IsEdit} mandatory={true} name="SSM_Id_F" allowClear={true} ref={(el) => this.onRefChange(el, 'SSM_Id_F')} value={dataModel.SSM_Id_F} onChange={this.onChange} events={{ onBlur: () => this.onBlurPrimary() }} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={50}>
                        </cntrl.WKLTextbox>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label">SSM Name</label>
                    <div className='col-md-12'>
                        <cntrl.WKLTextbox mandatory={true} name="SSM_Name_F" allowClear={true} ref={(el) => this.onRefChange(el, 'SSM_Name_F')} value={dataModel.SSM_Name_F} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
                        </cntrl.WKLTextbox>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label">Group Name<span className="text-danger text-mandatory">*</span></label>
                    <div className='col-md-12'>
                        <cntrl.WKLSelect name="groupName_F" compareKey="ID" displayField="Text" placeholder="Select Group" allowClear={true} ref={(el) => this.onRefChange(el, 'groupName_F')} selectedItem={dataModel.groupName_F} dataSource={model.groupNamesList} onChange={this.selectChange}>
                        </cntrl.WKLSelect>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label" >Refresh Type<span className="text-danger text-mandatory">*</span></label>
                    <div className="form-control border-0 ps-0">
                        <div className="form-check  form-check-inline">
                            <input type="radio" className="form-check-input" id="hard_refresh_F" radioGroup="SMST010_Refresh_Type_F" name="Refresh_Type_F" checked={dataModel.Refresh_Type_F === 1} onChange={this.onRadioChangeF} value="hr" />
                            <label className="form-check-label" htmlFor="hard_refresh_F">Hard</label>
                        </div>
                        <div className="form-check  form-check-inline" style={{ margin: "0 5px 0 5px" }}>
                            <input type="radio" className="form-check-input" id="emergency_refresh_F" radioGroup="SMST010_act_inact_F" name="Refresh_Type_F" checked={dataModel.Refresh_Type_F === 2} onChange={this.onRadioChangeF} value="er" />
                            <label className="form-check-label" htmlFor="emergency_refresh_F">Emergency</label>
                        </div>
                        <div className="form-check  form-check-inline" style={{ margin: "0 5px 0 5px" }}>
                            <input type="radio" className="form-check-input" id="refresh_F" radioGroup="SMST010_act_inact_F" name="Refresh_Type_F" checked={dataModel.Refresh_Type_F === 3} onChange={this.onRadioChangeF} value="r" />
                            <label className="form-check-label" htmlFor="refresh_F">Refresh</label>
                        </div>
                        <div className="form-check  form-check-inline" style={{ margin: "0 5px 0 5px" }}>
                            <input type="radio" className="form-check-input" id="noRefresh_F" radioGroup="SMST010_act_inact_F" name="Refresh_Type_F" checked={dataModel.Refresh_Type_F === 4} onChange={this.onRadioChangeF} value="nr" />
                            <label className="form-check-label" htmlFor="noRefresh_F">None</label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row gx-0 col-md-12 px-0 mb-2">
                {(dataModel.Refresh_Type_F === 1 || dataModel.Refresh_Type_F === 3) && (

                    <div className='col-md-6 px-1 pl-0'>
                        <label className="form-label">Schedule Date<span className="text-danger text-mandatory">*</span></label>
                        <cntrl.WKLDatepicker startDate={startDate} name="Schedule_Date_F" value={dataModel.Schedule_Date_F} onChange={this.onChange} ref={(el) => this.onRefChange(el, 'Schedule_Date_F')} placeholder="Schedule Date" />
                    </div>

                )}

                <div className='col-md-6 px-1 '>
                    <label className="form-label">End Point<span className="text-danger text-mandatory">*</span></label>
                    <cntrl.WKLSelect name="Api_end_pt_F" compareKey="ID" displayField="Text" placeholder="Select End Point" allowClear={true} ref={(el) => this.onRefChange(el, 'Api_end_pt_F')} selectedItem={dataModel.Api_end_pt_F} dataSource={model.endptList} onChange={this.selectChange}>
                    </cntrl.WKLSelect>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label" >Status<span className="text-danger text-mandatory">*</span></label>
                    <div className="form-control border-0 ps-0">
                        <div className="form-check  form-check-inline" style={{ margin: "0 5px 0 5px" }}>
                            <input type="radio" className="form-check-input" id="act_inactA_F" radioGroup="SMST010_act_inact_F" name="IsActiveF" checked={dataModel.IsActiveF} onChange={this.onRadioChangeF} value="A" />
                            <label className="form-check-label" htmlFor="act_inactA_F">Active</label>
                        </div>
                        <div className="form-check  form-check-inline" style={{ margin: "0 5px 0 5px" }}>
                            <input type="radio" className="form-check-input" id="act_inactI_F" radioGroup="SMST010_act_inact_F" name="IsActiveF" checked={dataModel.IsActiveF === false} onChange={this.onRadioChangeF} value="I" />
                            <label className="form-check-label" htmlFor="act_inactI_F">Inactive</label>
                        </div>
                    </div>
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
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area p-3 vh-100">
                    <div className="container-fluid p-0 h-100">
                        <div className="row h-100">
                            <div className="col-md-6">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-2">
                                            <label className="form-label" >Group Name</label>
                                            <cntrl.WKLSelect name="groupName_S" compareKey="ID" displayField="Text" placeholder="Select Group" allowClear={true} ref={(el) => this.onRefChange(el, 'groupName_S')} selectedItem={dataModel.groupName_S} dataSource={model.groupNamesList} onChange={this.selectChange}>
                                            </cntrl.WKLSelect>
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
                            <div className="col-md-1 border-start text-center">
                                <button type="button" id="btn_open_config_window" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_open_config_window' })}>Group Config</button>
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