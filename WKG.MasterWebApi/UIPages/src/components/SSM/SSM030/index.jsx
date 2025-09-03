import React from 'react';
import SSM030VM from './SSM030VM';
import * as cntrl from '../../../wkl-components';

export default class SSM030 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM030VM(props));
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
    onCheckChange = (e, dataModel) => {
        if (this.VM) {
            const model = this.VM.Data;
            const gridInfo = model.GridInfo;
            dataModel = dataModel || model;
            dataModel[e.target.name] = e.target.checked;

            if (e.target.name === 'AllSelected') {
                for (const itm of model.GridInfo.Items) {
                    itm.IsSelected = model.AllSelected;
                }
                gridInfo.Items = gridInfo.Items.map((data) => {
                    if (data.IsSelected) {
                        return { ...data, act_inact_ind: 'Active' };
                    }
                    else {
                        return { ...data, act_inact_ind: 'InActive' };
                    }
                });
            }
            else {
                model.AllSelected = model.GridInfo.Items.length === model.GridInfo.Items.count(i => i.IsSelected);
                gridInfo.Items = gridInfo.Items.map((data) => {
                    if (data.IsSelected) {
                        return { ...data, act_inact_ind: 'Active' };
                    }
                    else {
                        return { ...data, act_inact_ind: 'InActive' };
                    }


                }) || [];
            }
            this.updateUI();
        }
    };
    onCheckChangeSrch = (e) => {
        if (this.VM) {
            let model = this.VM.Data.SearchInput;
            model[e.target.name] = e.target.checked;
            this.updateUI();
        }
    };
    onSearchChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data.SearchInput;
            model[e.name] = e.value;
            this.VM.doSearchClear(false);
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
                if (action === "btn_search") {
                    this.VM.handleSearch(1, "", false);
                }
                else if (action == "btn_clear") {
                    this.VM.handleSearchClear();
                }
                else if (action == "btn_close") {
                    this.VM.doClose(e);
                }
                else if (action == "btn_save" || action == "btn_edit") {
                    this.VM.handleSave(e);
                }
                else if (action === "btn_delvry_typ" || action === "btn_evnt_typ") {
                    this.VM.openConfigWindow(action);
                }
                else if (action === "btn_Edit_grid") {
                    this.VM.openConfigWindow(action, e.pid, e.pname);
                }
                else if (action === "btn_Exp_grid") {
                    this.VM.openConfigWindow(action, e.pid, e.pname);
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
    // handles page change for grid
    onPageChange = (e) => {
        // this.VM.loadPage(e.value, e.columnOptions);
        this.VM.handleSearch(e.value, e.columnOptions, false);
    }
    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        // this.VM.loadPage(gridInfo.Page, e.columnOptions);
        this.VM.handleSearch(gridInfo.Page, e.columnOptions, false);

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
    columnbtn = (e) => {
        const pid = e.row.ltd_prod_id;
        const pname = e.row.ltd_evnt_nam;
        return (<div>

            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_search" title={"Edit"} data-bs-toggle="tooltip" data-bs-placement="left" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ pname, pid, id: 'btn_Edit_grid' })}><i className="fas fa-edit" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Exception"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ pname, pid, id: 'btn_Exp_grid' })}><i className="fas fa-bug" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
        </div>)
    };
    //function that renders slide switch inside grid rows
    rowSwitch = (e) => {
        return (<div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" style={{ width: "30px", height: "18px" }} role="switch" id="switchSizeLarge" name="IsSelected" checked={e.row.IsSelected} onChange={(ex) => this.onCheckChange(ex, e.row, e.dataSource)} />
        </div>)

    };
    //function that renders slide switch inside grid headers
    headerSwitch = () => {
        const model = this.VM.Data;
        return (
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" style={{ width: "30px", height: "18px" }} role="switch" id="switchSizeLarge" name="AllSelected" checked={model.AllSelected === true} onChange={(e) => this.onCheckChange(e)} />
            </div>)

    };
    // function the that renders grid
    renderGrid() {
        const model = this.VM.Data;
        const gridInfo = this.VM.Data.GridInfo;
        gridInfo.Columns.forEach((e, i) => {
            if (i === 7)
                e.onRender = this.columnbtn;
        })
        gridInfo.Columns[0].onRender = this.rowSwitch;
        gridInfo.Columns[0].text = this.headerSwitch();
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
            onSortChange: this.onSortChange,
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
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
                    <div className="container-fluid p-0">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="row name_div">
                                    <div className="col-md-4 mb-2">
                                        <label className="form-label" >Name</label>
                                        <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'prd_name_S')} name="prd_name_S" value={dataModel.prd_name_S} onChange={this.onSearchChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
                                        </cntrl.WKLTextbox>
                                    </div>
                                    <div className="col-md-1 mb-2">
                                        <label className="form-label" >Status</label>
                                        <div className="col-md-1 mt-2">
                                            <input className="form-check-input" type="checkbox" name="status_S" checked={dataModel.status_S} onChange={this.onCheckChangeSrch} style={{ width: "20px", height: "20px" }} />
                                        </div>
                                    </div>
                                    <div className="col-md-2 mb-2">
                                        <label className="form-label" >Product Delisted</label>
                                        <div className="col-md-2 mt-2">
                                            <input className="form-check-input" type="checkbox" name="prd_delisted_S" checked={dataModel.prd_delisted_S} onChange={this.onCheckChangeSrch} style={{ width: "20px", height: "20px" }} />
                                        </div>
                                    </div>
                                    <div className="col-md-1">
                                        <div className="d-flex flex-row justify-content-end align-items-end h-100 w-100 p-2">
                                            <button type="button" name="btn_search" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_search' })}><i className="fa fa-search"></i> </button>
                                            <button type="button" name="btn_clear" hot-key="R" className="btn btn-sm btn-icon1 btn-primary " onClick={(e) => this.clickAction({ id: 'btn_clear' })}><i className="fa fa-refresh"></i> </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col grid_div_ltd">
                                        {this.renderGrid()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                            <button type="button" id="btn_evnt_typ" hot-key="R" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_evnt_typ' })}> Filter Types</button>
                            <button type="button" id="btn_delvry_typ" hot-key="D" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_delvry_typ' })}> Delivery</button>
                            {/* <button type="button" id="btn_audit" hot-key="A" className="btn btn-sm btn-audit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_audit' })}><i className="fa fa-history"></i> </button> */}
                        </div>
                        <div className="col border-start">
                            {/* <cntrl.WKLButtonWrapper id="btn_delete" hidden={true} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hidden={true} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                            </cntrl.WKLButtonWrapper> */}
                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={model.Input.IsEdit ? "btn_edit" : "btn_save"} formID={model.FormID}  onClick={(e) => this.clickAction({ id: model.Input.IsEdit ? "btn_edit" : "btn_save" })}>
                            <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            </cntrl.WKLButtonWrapper>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>
        )
    }
}