import React from 'react';
import SMST020VM from './SMST020VM';
import * as cntrl from '../../../wkl-components';
import { fontSize } from '../../../wkl-components/WKLEditor/src/plugins';

export default class SMST020 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST020VM(props));
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
    //handle radio Change for 
    onRadioChangeStatus = (e) => {
        if (this.VM) {
            let model = '';
            model = this.VM.Data.SearchInput;
            model[e.target.name] = e.target.value === "A";
            this.VM.updateUI();
        }
    };
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
                else if (action === 'btn_open_windowcity') {
                    this.VM.openWindow("City");
                }
                else if (action === 'btn_open_windowCategory') {
                    this.VM.openWindow("Category");
                }
                else if (action === 'btn_Exp') {
                    this.VM.openWindow("Exptation", e.pid);
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

    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.IniloadPage(gridInfo.Page, e.columnOptions);

    }
    columnCheckBox = (e) => {
        const pid = e.row.tui_prod_id;
        return (<div>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Exception"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ pid, id: 'btn_Exp' })}><i className="fas fa-bug" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_search" title={"Language"} data-bs-toggle="tooltip" data-bs-placement="left" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ pid })}><i className="fas fa-language" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_search" title={"Image"} data-bs-toggle="tooltip" data-bs-placement="left" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ pid })}><i className="fas fa-image" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_search" title={"Status"} data-bs-toggle="tooltip" data-bs-placement="left" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ pid })}><i className="fas fa-check-circle" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
        </div>)
    };
    // headerColumnCheckBox = () => {
    //     const model = this.VM.Data;
    //     return (<input class="form-check-input" type="checkbox" name="AllSelected" checked={model.AllSelected === true} onChange={(e) => this.onCheckChange(e)} />)
    // };
    //Rendering grid
    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
        gridInfo.Columns.forEach((e, i) => {
            if (i === 4)
                e.onRender = this.columnCheckBox;
        })
        //gridInfo.Columns[4].onRender = this.columnCheckBox;
        // gridInfo.Columns[4].text = this.headerColumnCheckBox();
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
                            <div className="col-md-12">
                                <div className="row">
                                    <div className="col-md-3 mb-2">
                                        <label className="form-label" htmlFor="SMST020_Lng">Language <span class="text-danger text-mandatory">*</span></label>

                                        <cntrl.WKLSelect name="SMST020_Lng" compareKey="ID" displayField="Text" placeholder="Select Language" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST020_Lng')} selectedItem={dataModel.SMST020_Lng} dataSource={model.SMST020_Lnglist} onChange={this.onSearchChange}>
                                        </cntrl.WKLSelect>
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="form-label" >Name</label>
                                        <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Pord_Name')} name="Pord_Name" value={dataModel.Pord_Name} onChange={this.onSearchChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
                                        </cntrl.WKLTextbox>
                                    </div>
                                    <div className="col-md-2 mb-2">
                                        <label className="form-label" >Status</label>
                                        <div className="form-control border-0 ps-0">
                                            <div className="form-check  form-check-inline">
                                                <input type="radio" className="form-check-input" id="SMST020_StatusSrchA" radioGroup="SMST020_StatusSrch" name="SMST020_StatusSrch" checked={dataModel.SMST020_StatusSrch} onChange={this.onRadioChangeStatus} value="A" />
                                                <label className="form-check-label" htmlFor="SMST020_StatusSrchA">Active</label>
                                            </div>
                                            <div className="form-check  form-check-inline">
                                                <input type="radio" className="form-check-input" id="SMST020_StatusSrchI" radioGroup="SMST020_StatusSrch" name="SMST020_StatusSrch" checked={dataModel.SMST020_StatusSrch === false} onChange={this.onRadioChangeStatus} value="I" />
                                                <label className="form-check-label" htmlFor="SMST020_StatusSrchI">Inactive</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-2 mb-2">
                                        <label className="form-label" >Tui Product Available</label>
                                        <div className="form-control border-0 ps-0">
                                            <div className="form-check  form-check-inline">
                                                <input type="radio" className="form-check-input" id="SMST020_Prd_avalY" radioGroup="SMST020_Prd_aval" name="SMST020_Prd_aval" checked={dataModel.SMST020_Prd_aval} onChange={this.onRadioChangeStatus} value="A" />
                                                <label className="form-check-label" htmlFor="SMST020_StatusSrchA">Yes</label>
                                            </div>
                                            <div className="form-check  form-check-inline">
                                                <input type="radio" className="form-check-input" id="SMST020_Prd_avalN" radioGroup="SMST020_Prd_aval" name="SMST020_Prd_aval" checked={dataModel.SMST020_Prd_aval === false} onChange={this.onRadioChangeStatus} value="I" />
                                                <label className="form-check-label" htmlFor="SMST020_StatusSrchI">No</label>
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
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col">
                                {this.renderGrid()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                            {/* <button type="button" id="btn_new1" hot-key="N" className="btn btn-sm btn-add1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_new1' })} ><i className="fa fa-plus"></i> New</button>
                            <button type="button" id="btn_edit1" disabled={disableEdit} hot-key="M" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_edit1' })}> <i className="fa fa-edit"></i> Modify</button>
                            */}
                            <button type="button" id="btn_open_windowcity" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_open_windowcity' })}>City</button>
                            <button type="button" id="btn_open_windowcategory" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_open_windowCategory' })}>Category</button>
                        </div>
                        <div className="col border-start">
                            {/*<cntrl.WKLButtonWrapper disabled={!model.Input.IsEdit} id="btn_delete" hidden={disableDeleteButton} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hidden={disableDeleteButton} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                            </cntrl.WKLButtonWrapper>
                            */}
                        </div>
                        <div className="col-auto">
                            {/* <button type="button" id={this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_new'} formID={model.FormID} onClick={(e) => this.clickAction({ id: this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_new' })} hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_cancel' })}><i className="fa fa-refresh"></i> Clear</button>
                            */}
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>
        )
    }
}