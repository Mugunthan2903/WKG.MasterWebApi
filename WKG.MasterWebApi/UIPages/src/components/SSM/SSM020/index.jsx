import React from 'react';
import SSM020VM from './SSM020VM';
import * as cntrl from '../../../wkl-components';
import { fontSize } from '../../../wkl-components/WKLEditor/src/plugins';

export default class SSM020 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM020VM(props));
        this.inputRefs = {};
    }
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData(true);
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
            this.VM.handleSearch(e.value, e.columnOptions, false);
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
                    this.VM.handleSearch(1, '', false);
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
                    this.VM.openWindow("Exptation", e.pid, e.pname, e.cityName);
                }
                else if (action === 'btn_Edit_grid') {
                    this.VM.openWindow("Edit_grid", e.pid, e.pname, e.cityName);
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
    // onGridCellDoubleClick = (e, item) => {
    //     if (this.VM) {
    //         this.VM.Data.Input.IsEdit = true;
    //         this.VM.handleDataChange(e.row);
    //     }
    // }
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

    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.handleSearch(gridInfo.Page, e.columnOptions, false);

    }
    onCheckChangeSrch = (e) => {
        if (this.VM) {
            let model = '';
            if (e.target.name === "SSM020_StatusSrch" || e.target.name === "SSM020_Prd_aval") {
                model = this.VM.Data.SearchInput;
            }
            else {
                model = this.VM.Data.Input;
            }
            model[e.target.name] = e.target.checked;
            this.updateUI();
        }
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
                        return { ...data, act_inact_ind: 'Inactive' };
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
                        return { ...data, act_inact_ind: 'Inactive' };
                    }


                }) || [];
            }
            this.updateUI();
        }
    };

    columnbtn = (e) => {
        const pid = e.row.tui_prod_id;
        const pname = e.row.tui_prod_nam;
        const cityName = e.row.tui_city_nam;
        return (<div>

            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_search" title={"Edit"} data-bs-toggle="tooltip" data-bs-placement="left" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ pname, pid, cityName, id: 'btn_Edit_grid' })}><i className="fas fa-edit" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Exception"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ pname, pid, id: 'btn_Exp' })}><i className="fas fa-bug" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
        </div>)
    };
    columnCheckBox = (e) => {
        return (<div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" style={{ width: "30px", height: "18px" }} role="switch" id="switchSizeLarge" name="IsSelected" checked={e.row.IsSelected === true} onChange={(ex) => this.onCheckChange(ex, e.row, e.dataSource)} />
        </div>)

    };
    headerColumnCheckBox = () => {
        const model = this.VM.Data;
        return (
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" style={{ width: "30px", height: "18px" }} role="switch" id="switchSizeLarge" name="AllSelected" checked={model.AllSelected === true} onChange={(e) => this.onCheckChange(e)} />
            </div>)

    };
    //Rendering grid
    renderGrid() {
        const model = this.VM.Data;
        const gridInfo = this.VM.Data.GridInfo;
        gridInfo.Columns.forEach((e, i) => {
            if (i === 7)
                e.onRender = this.columnbtn;
        })
        gridInfo.Columns[0].onRender = this.columnCheckBox;
        gridInfo.Columns[0].text = this.headerColumnCheckBox();
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
            // onGridCellDoubleClick: this.onGridCellDoubleClick,
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
                                    {/*<div className="col-md-3 mb-2">
                                        <label className="form-label" htmlFor="SSM020_Lng">Language <span class="text-danger text-mandatory">*</span></label>
                                        <cntrl.WKLSelect name="SSM020_Lng" compareKey="ID" displayField="Text" placeholder="Select Language" ref={(el) => this.onRefChange(el, 'SSM020_Lng')} selectedItem={dataModel.SSM020_Lng} dataSource={model.SSM020_Lnglist} onChange={this.onSearchChange}>
                                        </cntrl.WKLSelect>
                                    </div>*/}
                                    <div className="col-md-4 mb-2">
                                        <label className="form-label" >Name</label>
                                        <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Pord_Name')} name="Pord_Name" value={dataModel.Pord_Name} onChange={this.onSearchChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
                                        </cntrl.WKLTextbox>
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="form-label" >City Name</label>
                                        <cntrl.WKLSelect name="City_srch" compareKey="ID" displayField="Text" placeholder="Select City Name" allowClear={true} ref={(el) => this.onRefChange(el, 'City_srch')} selectedItem={dataModel.City_srch} dataSource={model.CityList} onChange={this.onSearchChange}>
                                        </cntrl.WKLSelect>
                                    </div>
                                    <div className="col-md-1 mb-2">
                                        <label className="form-label" >Status</label>
                                        <div className="col-md-1 mt-2">
                                            <input className="form-check-input" type="checkbox" name="SSM020_StatusSrch" checked={dataModel.SSM020_StatusSrch} onChange={this.onCheckChangeSrch} style={{ width: "20px", height: "20px" }} />
                                        </div>
                                        {/*<div className="form-control border-0 ps-0">*/}
                                        {/*    <div className="form-check  form-check-inline">*/}
                                        {/*        <input type="radio" className="form-check-input" id="SSM020_StatusSrchA" radioGroup="SSM020_StatusSrch" name="SSM020_StatusSrch" checked={dataModel.SSM020_StatusSrch} onChange={this.onRadioChangeStatus} value="A" />*/}
                                        {/*        <label className="form-check-label" htmlFor="SSM020_StatusSrchA">Active</label>*/}
                                        {/*    </div>*/}
                                        {/*    <div className="form-check  form-check-inline">*/}
                                        {/*        <input type="radio" className="form-check-input" id="SSM020_StatusSrchI" radioGroup="SSM020_StatusSrch" name="SSM020_StatusSrch" checked={dataModel.SSM020_StatusSrch === false} onChange={this.onRadioChangeStatus} value="I" />*/}
                                        {/*        <label className="form-check-label" htmlFor="SSM020_StatusSrchI">Inactive</label>*/}
                                        {/*    </div>*/}
                                        {/*</div>*/}
                                    </div>
                                    <div className="col-md-2 mb-2">
                                        <label className="form-label" >Product Delisted</label>
                                        <div className="col-md-2 mt-2">
                                            <input className="form-check-input" type="checkbox" name="SSM020_Prd_aval" checked={dataModel.SSM020_Prd_aval} onChange={this.onCheckChangeSrch} style={{ width: "20px", height: "20px" }} />
                                        </div>
                                    </div>
                                    <div className="col-md-1">
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
                            <button type="button" id="btn_open_windowcategory" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_open_windowCategory' })}>Filter Types</button>
                        </div>
                        <div className="col border-start">
                            {/*<cntrl.WKLButtonWrapper disabled={!model.Input.IsEdit} id="btn_delete" hidden={disableDeleteButton} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hidden={disableDeleteButton} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                            </cntrl.WKLButtonWrapper>
                            */}
                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_new'} formID={model.FormID} onClick={(e) => this.clickAction({ id: this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_new' })}>
                            <button type="button"  formID={model.FormID}  hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            </cntrl.WKLButtonWrapper>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>
        )
    }
}