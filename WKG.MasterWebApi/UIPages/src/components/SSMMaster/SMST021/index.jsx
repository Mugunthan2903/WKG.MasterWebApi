import React from 'react';
import SMST021VM from './SMST021VM';
import * as cntrl from '../../../wkl-components';

export default class SMST021 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST021VM(props));
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

    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }
    onChangeSrch = (e) => {
        if (this.VM) {
            this.VM.Data.SearchInput[e.name] = e.value;
            this.VM.doSearchClear();
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
                    this.VM.handleSearch("Click");
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
                    this.VM.handleDataChange();
                }
            }
        }
    }
    onSearchChange = (e) => {
        if (this.VM) {
            this.VM.Data.SearchInput[e.name] = e.value;
            this.VM.doSearchClear(false);
        }
    };

    onSearchChangeIn = (e) => {
        if (this.VM) {
            this.VM.Data.Input[e.name] = e.value;
            this.VM.doSearchClear(false);
        }
    };

    //handle page change
    onPageChange = (e) => {
        if (this.VM)
            this.VM.loadPage(e.value, e.columnOptions);
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
    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.loadPage(gridInfo.Page, e.columnOptions);

    }
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
               // console.log(gridInfo.Items.filter(data=>data.IsSelected));
            }
            this.updateUI();
        }
    };
    columnCheckBox = (e) => {
        return(<div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" style={{ width: "30px", height: "18px" }} role="switch" id="switchSizeLarge"  name="IsSelected" checked={e.row.IsSelected === true} onChange={(ex) => this.onCheckChange(ex, e.row, e.dataSource)}/>
        </div>)
        //return (<input class="form-check-input" type="checkbox"  role="switch" style={{ width: "20px", height: "20px" }} name="IsSelected" checked={e.row.IsSelected === true} onChange={(ex) => this.onCheckChange(ex, e.row, e.dataSource)} />)
    };
    headerColumnCheckBox = () => {
        const model = this.VM.Data;
        return (
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" style={{ width: "30px", height: "18px" }} role="switch" id="switchSizeLarge" name="AllSelected" checked={model.AllSelected === true} onChange={(e) => this.onCheckChange(e)}/>
        </div>)
        //return (<input class="form-check-input" type="checkbox" role="switch" style={{ width: "20px", height: "20px" }} name="AllSelected" checked={model.AllSelected === true} onChange={(e) => this.onCheckChange(e)} />)
    };

    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
        gridInfo.Columns[0].onRender = this.columnCheckBox;
        gridInfo.Columns[0].text = this.headerColumnCheckBox();
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
          
            // disableDeleteButton = !model.Input.IsEdit;

            //     //if (model.GridInfo.SelectedItem)
            //       disableEdit = false;
        }

        return (
            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={"City Config for Tui"}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area vh-100 p-3">
                    <div className="container-fluid h-100 p-0">
                        <div className="row h-100">
                            <div className="col-md-12">
                                <div className="row">
                                    <div className="col-md-3 mb-2">
                                        <label className="form-label" >City Name</label>
                                        <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SMST021_ScrhcityName')} name="SMST021_ScrhcityName" value={dataModel.SMST021_ScrhcityName} onChange={this.onChangeSrch} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
                                        </cntrl.WKLTextbox>

                                    </div>
                                    <div className="col-md-1">
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
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">

                        </div>
                        <div className="col border-start">

                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={this.VM.Data.SearchInput.IsEdit ? 'btn_edit' : 'btn_new'} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            </cntrl.WKLButtonWrapper>
                            {/* <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_cancel' })}><i className="fa fa-refresh"></i> Clear</button> */}
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>
        )
    }
}
