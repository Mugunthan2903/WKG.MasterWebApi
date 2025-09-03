import React from 'react';
import SSM102VM from './SSM102VM';
import * as cntrl from '../../../wkl-components';

export default class SSM102 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM102VM(props));
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
            let model = this.VM.Data.Input;
            if (e.name) {
                if (Array.isArray(e.value) && e.value.length === 0) {
                    model[e.name] = null;
                } else {
                    model[e.name] = e.value;
                }
            }
            else if (e.target && e.target.name)
                model[e.target.name] = e.target.value;
            this.updateUI();
        }
    };
    onChangeSrch = (e) => {
        if (this.VM) {
            const model = this.VM.Data.SearchInput;
            if (e.name) {
                model[e.name] = e.value;
            }
            else if (e.target && e.target.name) {
                model[e.target.name] = e.target.value;
            }
            this.VM.doSearchClear(false);
            this.updateUI();
        }
    };
    onCheckChange = (e) => {
        if (this.VM) {
            let model = '';
            if (e.target.name === "Status_Srch" || e.target.name === "Category_avail_Srch") {
                model = this.VM.Data.SearchInput;
            }
            else {
                model = this.VM.Data.Input;
            }
            model[e.target.name] = e.target.checked;
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
                    this.VM.handleSearch();
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

        this.VM.loadPage(e.value, e.columnOptions, true);
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
    onCheckChangeGrid = (e, dataModel) => {
        if (this.VM) {
            const model = this.VM.Data;
            const gridInfo = model.GridInfo;
            dataModel = dataModel || model;
            dataModel[e.target.name] = e.target.checked;

            if (e.target.name === 'AllSelected') {
                for (const itm of model.GridInfo.Items) {
                    itm.IsChecked = model.AllSelected;
                }
                gridInfo.Items = gridInfo.Items.map((data) => {
                    if (data.IsChecked) {
                        return { ...data, act_inact_ind: 'Active' };
                    }
                    else {
                        return { ...data, act_inact_ind: 'Inactive' };
                    }
                });
            }
            else {
                model.AllSelected = model.GridInfo.Items.length === model.GridInfo.Items.count(i => i.IsChecked);
                gridInfo.Items = gridInfo.Items.map((data) => {
                    if (data.IsChecked) {
                        return { ...data, act_inact_ind: 'Active' };
                    }
                    else {
                        return { ...data, act_inact_ind: 'Inactive' };
                    }


                }) || [];
            }
            model.gridSave = this.VM.isGridChanged(model.GridInfo.Items.map(e => ({ IsChecked: e.IsChecked })));
            this.updateUI();
        }
    };
    columnCheckBox = (e) => {
        return (<div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" style={{ width: "30px", height: "18px" }} role="switch" id="switchSizeLarge" name="IsChecked" checked={e.row.act_inact_ind === 'Active'} onChange={(ex) => this.onCheckChangeGrid(ex, e.row, e.dataSource)} />
        </div>)

    };
    headerColumnCheckBox = () => {
        const model = this.VM.Data;
        return (
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" style={{ width: "30px", height: "18px" }} role="switch" id="switchSizeLarge" name="AllSelected" checked={model.AllSelected === true} onChange={(e) => this.onCheckChangeGrid(e)} />
            </div>)

    };
    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
        const model = this.VM.Data;
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
            colResize: true,

        };
        return (<cntrl.WKLGrid {...attr} />);
    }
    renderForm() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;

        let disableModifiedBy = '';
        disableModifiedBy = !model.Input.IsEdit;

        return (<form>
            <div className="row mb-3">
                <div className="col-md-12">
                    <label className="form-label">Name<span className="text-danger text-mandatory">*</span></label>
                    <div className='col-md-12'>
                        <cntrl.WKLTextbox mandatory={true} disabled={true} name="Ctgry_Name" allowClear={true} ref={(el) => this.onRefChange(el, 'Ctgry_Name')} value={dataModel.Ctgry_Name} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={50}>
                        </cntrl.WKLTextbox>
                    </div>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col-md-12">
                    <label className="col-form-label" htmlFor="Ctgry_Type">WKG Category<span className="text-danger text-mandatory">*</span></label>
                    <cntrl.WKLSelect name="Ctgry_Type" compareKey="ID" displayField="Text" placeholder="Select WKG Category" multiSelect={true} allowClear={true} ref={(el) => this.onRefChange(el, 'Ctgry_Type')} selectedItem={dataModel.Ctgry_Type} dataSource={model.Ctgry_TypeList} onChange={this.onChange}>
                    </cntrl.WKLSelect>
                </div>
            </div>
            <div className="row mb-3">
                <label className="form-label">Sort Order</label>
                <div className='col-md-12'>
                    <cntrl.WKLTextbox name="Sort_Order" ref={(el) => this.onRefChange(el, 'Sort_Order')} value={dataModel.Sort_Order} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} prefix={4} suffix={0} onChange={this.onChange} >
                    </cntrl.WKLTextbox>
                </div>
            </div>
            <div className="col-md-2">
                <label className="col-form-label pt-0" htmlFor="Status">Status</label>
                <div className="col-md-4">
                    <input className="form-check-input ms-2" type="checkbox" name="Status" checked={dataModel.Status} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                </div>
            </div>
            <div className='row mt-4' hidden={disableModifiedBy}>
                <div className='col'>
                    <cntrl.WKLAuditLabel hidden={disableModifiedBy} modifiedOn={dataModel.Modifiedon} modifiedBy={dataModel.Modifiedby} />
                </div>
            </div>



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
            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area p-3 vh-100">
                    <div className="container-fluid p-0 h-100">
                        <div className="row h-100">
                            <div className="col-md-8">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label" >Name</label>
                                                <cntrl.WKLTextbox mandatory={true} name="Ctgry_Name_Srch" allowClear={true} ref={(el) => this.onRefChange(el, 'Ctgry_Name_Srch')} value={dataModel.Ctgry_Name_Srch} onChange={this.onChangeSrch} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
                                                </cntrl.WKLTextbox>
                                            </div>
                                            <div className="col-md-2">
                                                <label className="col-form-label pt-0" htmlFor="Status_Srch">Status</label>
                                                <div className="col-md-4  mt-1">
                                                    <input className="form-check-input ms-2" type="checkbox" name="Status_Srch" checked={dataModel.Status_Srch} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <label className="col-form-label pt-0" htmlFor="Category_avail_Srch">Delisted</label>
                                                <div className="col-md-4 mt-1">
                                                    <input className="form-check-input ms-2" type="checkbox" name="Category_avail_Srch" checked={dataModel.Category_avail_Srch} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="d-flex flex-row justify-content-end align-items-end h-100 w-100 pt-2">
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
                            <div className="col-md-4 border-start">
                                {this.renderForm()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                            <button type="button" id="btn_edit1" disabled={disableEdit} hot-key="M" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_edit1' })}> <i className="fa fa-edit"></i> Modify</button>
                        </div>
                        <div className="col border-start">
                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={this.VM.Data.IsEdit ? 'btn_edit' : 'btn_save'} formID={model.FormID} onClick={this.clickAction}>
                                <button disabled={!(model.Input.IsEdit || model.gridSave)} type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
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