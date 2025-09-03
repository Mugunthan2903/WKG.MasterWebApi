import React from 'react';
import SSM138VM from './SSM138VM';
import * as cntrl from '../../../wkl-components';

export default class SSM138 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM138VM(props));
        this.inputRefs = {};

    }
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM) {
                this.VM.loadInitData();
            }
        }.bind(this), 100)
    }
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };
    onChangeSrch = (e) => {
        if (this.VM) {
            const model = this.VM.Data.SearchInput;
            if (e.name)
                model[e.name] = e.value;
            else if (e.target && e.target.name)
                model[e.target.name] = e.target.value;
            this.VM.doSearchClear(false);
            this.updateUI();
        }
    };
    onChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data.Input;
            if (Array.isArray(e.value) && e.value.length === 0) {
                model[e.name] = null;
            } else {
                model[e.name] = e.value;
            }
          
            this.VM.updateUI();
        }
    }
    onCheckChange = (e) => {
        if (this.VM) {
            let model = '';
            if (e.target.name === "Status") {
                model = this.VM.Data.Input;
            }
            else {
                model = this.VM.Data.SearchInput;
            }
            model[e.target.name] = e.target.checked;
            this.updateUI();
        }
    }
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
                    this.VM.handleSearch(1);
                }
                else if (action === "btn_new1") {
                    this.VM.handleDataChange();
                }
                else if (action === "btn_edit1") {
                    if (this.VM.Data.GridInfo.SelectedItem) {
                        this.VM.handleDataChange(this.VM.Data.GridInfo.SelectedItem);
                    }
                }
                else if (action === "btn_close") {
                    this.VM.doClose(e);
                }
                else if (action === "btn_new" || action == "btn_edit") {
                    this.VM.handleSave(e);
                }
                else if (action === "btn_clear") {
                    this.VM.handleSearchClear();
                }
                else if (action === "btn_cancel") {
                    this.VM.handleDataChange()
                }
                
            }
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
    renderGrid() {
        const model = this.VM.Data;
        const gridInfo = this.VM.Data.GridInfo;
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
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
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
        this.VM.loadPage(e.value, e.columnOptions);
    }
    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.loadPage(gridInfo.Page, e.columnOptions);
    }
    selectDistributionDfltStnSrch = (term) => {
        const model = this.VM.Data;
        var dataInfo = { Text: term};
        return cntrl.Utils.search({ url: 'TypeSearch/CombinationStationTypeAndSrch', data: dataInfo });
    }
   
    renderForm() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;

        return (
            <form>
                <div className='col-md-6 mb-2'>
                    <label className="form-label" >Name<span className="text-danger text-mandatory">*</span></label>
                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Grp_stn_nam')} name="Grp_stn_nam" value={dataModel.Grp_stn_nam} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={50}></cntrl.WKLTextbox>
                </div>
                <div className='col-md-6 mb-2'>
                    <label className="col-form-label" htmlFor="Pos_grp_ids">Group Name <span className="text-danger text-mandatory">*</span></label>
                    <cntrl.WKLSelect name="Pos_grp_ids" multiSelect={true} compareKey="ID" displayField="Text" placeholder="Select Group Name" allowClear={true} ref={(el) => this.onRefChange(el, 'Pos_grp_ids')} selectedItem={dataModel.Pos_grp_ids} dataSource={model.Pos_grp_idsList} onChange={this.onChange}>
                    </cntrl.WKLSelect>
                </div>

               
                <div className='col-md-10 mb-2'>
                    <label className="col-form-label" htmlFor="dprt_stn_cds">Departure Station </label>
                    <cntrl.WKLSelect minChar={3} multiSelect={true} name="dprt_stn_cds" ref={(el) => this.onRefChange(el, 'dprt_stn_cds')} allowClear={true} selectedItem={dataModel.dprt_stn_cds} onChange={this.onChange} asyncSearch={this.selectDistributionDfltStnSrch} placeholder="Select Departure Station" displayField="Text" compareKey="ID" />
                </div>
                <div className='col-md-10 mb-2'>
                    <label className="col-form-label" htmlFor="arvl_stn_cds">Arrival Station </label>
                    <cntrl.WKLSelect minChar={3} multiSelect={true} name="arvl_stn_cds" ref={(el) => this.onRefChange(el, 'arvl_stn_cds')} allowClear={true} selectedItem={dataModel.arvl_stn_cds} onChange={this.onChange} asyncSearch={this.selectDistributionDfltStnSrch} placeholder="Select Arrival Station" displayField="Text" compareKey="ID" />
                </div>

                <div className="mb-2">
                    <label className="form-label" >Status</label>
                    <div className="col-md-4">
                        <input className="form-check-input ms-2" type="checkbox" id="Status" name="Status" checked={dataModel.Status} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                    </div>
                </div>

                {dataModel.IsEdit && dataModel.mod_dttm !== "" && (
                    <div className="mb-2 mt-3">
                        <div className="col-md-12">
                            <cntrl.WKLAuditLabel modifiedOn={dataModel.Modifiedon} modifiedBy={dataModel.Modifiedby} />
                        </div>
                    </div>)}
            </form >
        );
    }
    render() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;
        let disableModifiedBy = true;
        let title = '';
        let disableEdit = true;
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
        }
        if (model.GridInfo.SelectedItem) {
            disableEdit = false;
        }
        disableModifiedBy = !dataModel.IsEdit;

        return (
            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <cntrl.WKLBody>
                    <div className="window-content-area p-3 vh-100">
                        <div className="container-fluid h-100 p-0">
                            <div className="row h-100">
                                <div className="col-md-6">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <label className="col-form-label pt-0" htmlFor="Stationsrch">Name</label>
                                                <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Stationsrch')} name="Stationsrch" value={model.SearchInput.Stationsrch} onChange={this.onChangeSrch} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={50}>
                                                </cntrl.WKLTextbox>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor='StatusSrch' className="form-label" >Status</label>
                                            <div className="col-md-4 mt-2">
                                                <input className="form-check-input ms-2" type="checkbox" id="StatusSrch" name="StatusSrch" checked={model.SearchInput.StatusSrch} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                            </div>
                                        </div>
                                        <div className="col-md-3 d-flex align-items-end">
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
                                <div className="col-md-6 border-start">
                                    {this.renderForm()}
                                </div>
                            </div>
                        </div>
                    </div>
                </cntrl.WKLBody>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                            <button type="button" id="btn_new1" hot-key="N" className="btn btn-sm btn-add1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_new1' })} ><i className="fa fa-plus"></i> New</button>
                            <button type="button" id="btn_edit1" disabled={disableEdit} hot-key="M" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_edit1' })}> <i className="fa fa-edit"></i> Modify</button>
                        </div>
                        <div className="col">
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