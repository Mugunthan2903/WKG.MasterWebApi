import React from 'react';
import SMST055VM from './SMST055VM';
import * as cntrl from '../../../wkl-components';
import DataTable from '../WKLDatatable';
const Textstyle = { width: '100%', height: '200px' };

export default class SMST055 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST055VM(props));
        this.inputRefs = {};

    }
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
    }

    onChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            if (e.name)
                model[e.name] = e.value;
            else if (e.target && e.target.name)
                model[e.target.name] = e.target.value;
            this.updateUI();
            this.VM.handleSearch();
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
                else if (action == "btn_close") {
                    this.VM.doClose(e);
                }
                else if (action == "btn_new" || action == "btn_edit") {
                    this.VM.handleSave(e);
                }
                else if (action == "btn_cancel") {
                    this.VM.handleDataChange()
                }
            }
        }
    }
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
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

    onChangegridtext = (e, datamodel) => {

        if (this.VM) {
            const model = this.VM.Data;
            datamodel = datamodel || model;
            datamodel[e.name] = e.value;

            this.updateUI();
        }
    };
    Textboxview = (e, field) => {
        const model = this.VM.Data;
        return (<cntrl.WKLTextbox name={field} style={Textstyle} id={e.row.data_srl} displayField="Text" ref={(el) => this.onRefChange(el, `${field}`)} value={e.row[field]} onChange={(ex) => this.onChangegridtext(ex, e.row)}>
        </cntrl.WKLTextbox>);

    };

    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }

    // renderGrid(e, field) {
    //     const model = this.VM.Data;
    //     const gridInfo = this.VM.Data.GridInfo;
    //     if (gridInfo.Columns?.length > 0) {
    //         gridInfo.Columns.forEach((e, i) => {
    //             if (e.field === 'data_srl' || e.field === 'data_typ_cd') {

    //             }
    //             else {
    //                 e.onRender = (_e) => this.Textboxview(_e, e.field);

    //             }
    //         })
    //     }

    //     const attr =
    //     {
    //         footerClass:model.FormID,
    //         rowHeight : 35,
    //         externalSort: true,
    //         dataSource: gridInfo.Items,
    //         selectedItems: [gridInfo.SelectedItem],
    //         isRemoteSort: false,
    //         rowSelection: true,
    //         multiSelect: false,
    //         paging: true,
    //         totalRows: gridInfo.PageSize,
    //         columns: gridInfo.Columns,
    //         pageInfo: {
    //             currentPage: gridInfo.Page,
    //             totalPages: gridInfo.TotalPage,
    //             totalCount: gridInfo.TotalRecords,
    //             onPageChange: this.onPageChange
    //         },
    //         rowStyle: [
    //             { className: 'inactive-row', condition: (p) => { return p['Status'] == "Inactive" } },
    //         ],
    //         onGridCellClick: this.onGridCellClick,
    //         onGridCellDoubleClick: this.onGridCellDoubleClick,
    //         onSortChange: this.onSortChange,
    //         colResize: true
    //     };
    //     return (<cntrl.WKLGrid {...attr} />);
    // }
    renderDataTable() {       
        const model = this.VM.Data;
        const gridInfo = this.VM.Data.GridInfo;
        const attr =
        {
            data: gridInfo.Items,
            columns: gridInfo.Columns,
            pageSize: 10,
        };
        return (<DataTable{...attr} />);

    }

    render() {
        const owner = this;
        const model = this.VM.Data;
        const gridInfo = this.VM.Data.GridInfo;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area vh-100 p-3">
                    <div className="col-md-12">
                        <div className="row mb-3">
                            <div className="col-md-3">
                                <label className="col-form-label pt-0" htmlFor="Grp_NameSrch">Language Type</label>
                                <cntrl.WKLSelect name="TypeCodes" compareKey="ID" displayField="Text" placeholder="Select Type" allowClear={false} ref={(el) => this.onRefChange(el, 'TypeCodes')} selectedItem={model.TypeCodes} dataSource={model.TypeCodesList} onChange={this.onChange}>
                                </cntrl.WKLSelect>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button type="button" name="btn_search" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_search' })}><i className="fa fa-search"></i> </button>
                                <button type="button" name="btn_clear" hot-key="R" className="btn btn-sm btn-icon1 btn-primary " onClick={(e) => this.clickAction({ id: 'btn_clear' })}><i className="fa fa-refresh"></i> </button>
                            </div>
                        </div>
                        {this.renderDataTable()}
                        {/* {gridInfo.Items.length > 0 &&
                            <div className='row'>
                                <div className="col-md-12">
                                    {this.renderGrid()}
                                </div>
                            </div>
                        } */}
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col ">
                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={'btn_save'} formID={model.FormID} onClick={(e) => this.clickAction({ id: 'btn_new' })}>
                                <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            </cntrl.WKLButtonWrapper>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>);
    }
}

