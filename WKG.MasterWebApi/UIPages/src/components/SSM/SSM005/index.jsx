import React from 'react';
import SSM005VM from './SSM005VM';
import * as cntrl from '../../../wkl-components';
const Textstyle = { width: '100%', height: '200px' };

export default class SSM005 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM005VM(props));
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
            const model = this.VM.Data.SearchInput;
            if (e.name)
                model[e.name] = e.value;
            else if (e.target && e.target.name)
                model[e.target.name] = e.target.value;

            this.VM.doSearchClear();
            this.updateUI();

        }
    };
    onChangeOverall = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            if (e.name)
                 model[e.name] = e.value;
            this.VM.setGridDateTime(e.name);
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
    onCheckChange = (e, dataModel) => {
        if (this.VM) {
            const model = this.VM.Data;
            const gridInfo = model.GridInfo;
            dataModel = dataModel || model;
            dataModel[e.target.name] = e.target.checked;

            if (e.target.name === 'Overallrefresh') {
                for (const itm of model.GridInfo.Items) {
                    itm.IsSelected = model.Overallrefresh;
                }
                gridInfo.Items = gridInfo.Items.map((data) => {
                    if (data.IsSelected) {
                        return { ...data, Mode: "A" };
                    }
                    else {
                        return { ...data, Mode: "I" };
                    }
                });
            }
            else {
                //model.Overallrefresh = model.GridInfo.Items.length === model.GridInfo.Items.count(i => i.IsSelected);
                gridInfo.Items = gridInfo.Items.map((data) => {
                    if (data.IsSelected) {
                        return { ...data, Mode: "A" };
                    }
                    else {
                        return { ...data, Mode: "I" };
                    }
                }) || [];
            }
            this.updateUI();
        }
    };
    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.loadPage(gridInfo.Page, e.columnOptions);
    }
    onChangeDate = (e, datamodel) => {

        if (this.VM) {
            const model = this.VM.Data;
            datamodel = datamodel || model;
            datamodel[e.name] = e.value;

            console.log('OnDateChange', e.name, e.value);

            this.updateUI();
        }

    };

    onChangeTime = (e, datamodel) => {

        if (this.VM) {
            const model = this.VM.Data;
            datamodel = datamodel || model;
            datamodel[e.name] = e.value;

            console.log('OnTimeChange', e.name, e.value);

            this.updateUI();
        }

    };
    SetTime = (e) => {
        const model = this.VM.Data;
        let value = '';
        if (e.row.setTime) {
            value = e.row.setTime;
        }

        console.log('Onchange : ', e.row);
        return (
            <span>
                <cntrl.WKLTextbox style={{ width: "27px", height: "21px" }} name="setTime" placeholder="HH:MM" value={value} onChange={(ex) => this.onChangeTime(ex, e.row)} inputType={cntrl.WKLTextboxTypes.time24hr} maxLength={5}>
                </cntrl.WKLTextbox>
            </span>
        );


    };

    SetDateTime = (e) => {
        const model = this.VM.Data;
        let startDate = new Date();
        let value = '';
        if (e.row.setDate) {
            value = e.row.setDate;
            //value = new Date(e.row.setDate);
        }

        console.log('OnchangeDate : ', e.row);  //startDate={startDate} //value={e.row.Schld_dttm}  new Date(r.editFields[0].schedule_date)
        return (
            <span>
                <cntrl.WKLDatepicker style={{ width: "27px", height: "21px" }} name='setDate' value={value} ref={(el) => this.onRefChange(el, 'setDate')} placeholder="DD MMM YYYY" onChange={(ex) => this.onChangeDate(ex, e.row)} />
            </span>
        );


    };
    columnCheckBox = (e) => {
        return (<div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" style={{ width: "30px", height: "18px" }} role="switch" id="switchSizeLarge" name="IsSelected" checked={e.row.IsSelected === true} onChange={(ex) => this.onCheckChange(ex, e.row, e.dataSource)} />
        </div>)

    };
    onGridCellClick = (e, item) => {
        if (this.VM) {
            this.VM.setSelectedItem(e.row);
            this.updateUI();
        }
    }
    renderGrid(e, field) {
        const model = this.VM.Data;
        const gridInfo = this.VM.Data.GridInfo;
        gridInfo.Columns.forEach((e, i) => {
            if (i === 3) {
                e.onRender = (_e) => this.SetDateTime(_e);
            }
            if (i === 4) {
                e.onRender = (_e) => this.SetTime(_e);
            }

        })
        gridInfo.Columns[0].onRender = this.columnCheckBox;
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
                //onPageChange: this.onPageChange
            },
            rowStyle: [
                { className: 'inactive-row', condition: (p) => { return p['Status'] == "Inactive" } },
            ],
            onGridCellClick: this.onGridCellClick,
            onSortChange: this.onSortChange,
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
    }
    // onPageChange = (e) => {
    //     if (this.VM)
    //         this.VM.loadPage(e.value, e.columnOptions);
    // };
    render() {
        const owner = this;
        const model = this.VM.Data;
        const gridInfo = this.VM.Data.GridInfo;
        let disableEdit = true;
        let disableDeleteButton = true;
        let disableHeading = true;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
            disableEdit = false;

        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area vh-100 p-3">
                    <div className="col-md-12">
                        <div className="row mb-3">
                            <div className="col-md-3">
                                <label className="col-form-label pt-0" htmlFor="Grp_Name">Group Name</label>
                                <cntrl.WKLSelect name="Grp_Name" compareKey="ID" displayField="Text" placeholder="Select Group Name" allowClear={true} ref={(el) => this.onRefChange(el, 'Grp_Name')} selectedItem={model.SearchInput.Grp_Name} dataSource={model.Grp_NameList} onChange={this.onChange}>
                                </cntrl.WKLSelect>
                            </div>
                            <div className="col-md-3">
                                <label className="col-form-label pt-0" htmlFor="SSM_Name">SSM Name</label>
                                <cntrl.WKLSelect name="SSM_Name" compareKey="ID" displayField="Text" placeholder="Select SSM Name" allowClear={true} ref={(el) => this.onRefChange(el, 'SSM_Name')} selectedItem={model.SearchInput.SSM_Name} dataSource={model.SSM_NameList} onChange={this.onChange}>
                                </cntrl.WKLSelect>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button type="button" name="btn_search" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_search' })}><i className="fa fa-search"></i> </button>
                                <button type="button" name="btn_clear" hot-key="R" className="btn btn-sm btn-icon1 btn-primary " onClick={(e) => this.clickAction({ id: 'btn_clear' })}><i className="fa fa-refresh"></i> </button>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <div className="row" style={{ backgroundColor: "#e0f1f5",marginLeft:"0px",width:"100%"}} >
                                <div className="col-md-6 px-2" style={{width: "50%"}}>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" style={{ width: "30px", height: "18px" }} role="switch" id="switchSizeLarge" name="Overallrefresh" checked={model.Overallrefresh} onChange={this.onCheckChange} />
                                    </div>
                                </div>
                                <div className="col-md-3 p-0 px-1" style={{width: "30%"}}>
                                    <cntrl.WKLDatepicker  name='Overalldate' value={model.Overalldate} ref={(el) => this.onRefChange(el, 'Overalldate')} placeholder="DD MMM YYYY" onChange={this.onChangeOverall} />
                                </div>
                                <div className="col-md-3 p-0 px-1" style={{width: "20%"}}>
                                    <cntrl.WKLTextbox  name="Overalltime" placeholder="HH:MM" value={model.Overalltime} ref={(el) => this.onRefChange(el, 'Overalltime')} onChange={this.onChangeOverall} inputType={cntrl.WKLTextboxTypes.time24hr} maxLength={5}>
                                    </cntrl.WKLTextbox>
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className="col-md-12">
                                {this.renderGrid()}
                            </div>
                        </div>

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
                            {/*<button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_cancel' })}><i className="fa fa-refresh"></i> Clear</button>*/}
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>);
    }
}

