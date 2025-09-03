import React from 'react';
import SSM120VM from './SSM120VM';
import * as cntrl from '../../../wkl-components';
import { fontSize } from '../../../wkl-components/WKLEditor/src/plugins';

export default class SSM120 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM120VM(props));
        this.inputRefs = {};
    }
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData(true);
        }.bind(this), 100)
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

    onPageChange = (e) => {
        if (this.VM)
            this.VM.handleSearch(e.value, e.columnOptions, false);
    };

    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }

    onRadioChangeStatus = (e) => {
        if (this.VM) {
            let model = '';
            model = this.VM.Data.SearchInput;
            model[e.target.name] = e.target.value === "A";
            this.VM.updateUI();
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

            }
        }
    }

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
    SrtordTxtbox = (e, datamodel) => {
        if (this.VM) {
            const model = this.VM.Data;
            datamodel = datamodel || model;
            if (e.value !== "") {
                datamodel[e.name] = e.value;
            }
            else {
                datamodel[e.name] = null;
            }
            this.updateUI();
        }

    };
    SetSortorder = (e) => {
        const model = this.VM.Data;
        let value = '';
        if (e.row.sort_ordr) {
            value = e.row.sort_ordr;
        }
        return (
            <span>
                <cntrl.WKLTextbox style={{ width: "27px", height: "21px" }} name="sort_ordr" placeholder="" value={value} onChange={(ex) => this.SrtordTxtbox(ex, e.row)} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} prefix={4} suffix={0}>
                </cntrl.WKLTextbox>
            </span>
        );
    };
    onCheckgridChange = (e, datamodel) => {
        if (this.VM) {
            const model = this.VM.Data;
            datamodel = datamodel || model;
            //datamodel[e.name] = e.value;
            datamodel[e.target.name] = e.target.checked;
            this.updateUI();
        }

    };
    Setcheckbox = (e) => {
        const model = this.VM.Data;
        let value = '';
        if (e.row.prod_featrd) {
            value = e.row.prod_featrd;

        }
        return (
            <span>
                <input className="form-check-input" type="checkbox" name="prod_featrd" checked={value} onChange={(ex) => this.onCheckgridChange(ex, e.row)} style={{ width: "20px", height: "20px" }} />
            </span>
        );
    };
    setCityChange = (e, datamodel) => {
        if (this.VM) {
            const model = this.VM.Data;
            console.log("MOdel : ", model);
            datamodel = datamodel || model;
            if (e.value === null || (Array.isArray(e.value) && e.value.length === 0)) {
                datamodel[e.name] = null;
                datamodel['wkg_city_cds'] = null;
            }
            else {
                datamodel[e.name] = e.value;
                datamodel['wkg_city_cds'] = e.value?.map(item => item.ID).join(',');
            }
            this.updateUI();
        }
    }
    setCityMultipleSearch = (e) => {
        const model = this.VM.Data;
        let value = '';
        if (e.row.wkg_city_cd === null) {

            value = e.row.wkg_city_nams || null;
            return (
                <cntrl.WKLSelect minChar={3} multiSelect={true} name="wkg_city_nams" ref={(el) => this.onRefChange(el, 'wkg_city_nams')} allowClear={true} selectedItem={value} onChange={(ex) => this.setCityChange(ex, e.row)} asyncSearch={this.selectTourCitySearch} displayField="Text" compareKey="ID" />
            );
        }
        else {
            return (
                <span>{e.row.city_desc}</span>
            );
        }
    };
    onGridCellClick = (e, item) => {
        if (this.VM) {
            this.VM.setSelectedItem(e.row);
            this.updateUI();
        }
    }

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
            if (e.target.name === "StatusSrch" || e.target.name === "Prd_aval") {
                model = this.VM.Data.SearchInput;
            }
            else {
                model = this.VM.Data.Input;
            }
            model[e.target.name] = e.target.checked;
            this.updateUI();
        }
    };
    selectTourCitySearch = (term) => {
        var dataInfo = { Text: term };
        return cntrl.Utils.search({ url: 'TypeSearch/RPSCityTypeAndSearch', data: dataInfo });
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
            }
            this.updateUI();
        }
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

    renderGrid() {
        const model = this.VM.Data;
        const gridInfo = this.VM.Data.GridInfo;
        gridInfo.Columns.forEach((e, i) => {
            if (i === 3) {
                e.onRender = (_e) => this.setCityMultipleSearch(_e);
            }
            if (i === 4) {
                e.onRender = (_e) => this.Setcheckbox(_e);
            }
            if (i === 5) {
                e.onRender = (_e) => this.SetSortorder(_e);
            }
        })
        gridInfo.Columns[0].onRender = this.columnCheckBox;
        gridInfo.Columns[0].text = this.headerColumnCheckBox();
        const attr =
        {
            footerClass: model.FormID,
            externalSort: true,
            rowHeight: 35,
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
            onSortChange: this.onSortChange,
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
    }

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
                                        <label className="form-label" >Supplier</label>
                                        <cntrl.WKLSelect name="Supplier_Srch" compareKey="ID" displayField="Text" placeholder="Select Supplier" allowClear={true} ref={(el) => this.onRefChange(el, 'Supplier_Srch')} selectedItem={dataModel.Supplier_Srch} dataSource={model.Supplier_Srch_List} onChange={this.onSearchChange}>
                                        </cntrl.WKLSelect>
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="form-label" >Name</label>
                                        <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Pord_Name')} name="Pord_Name" value={dataModel.Pord_Name} onChange={this.onSearchChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
                                        </cntrl.WKLTextbox>
                                    </div>
                                    <div className="col-md-3 mb-2">
                                        <label className="form-label" >City Name</label>
                                        <cntrl.WKLSelect name="City_srch" multiSelect={true} compareKey="ID" displayField="Text" placeholder="Select City Name" allowClear={true} ref={(el) => this.onRefChange(el, 'City_srch')} selectedItem={dataModel.City_srch} onChange={this.onSearchChange} asyncSearch={this.selectTourCitySearch}>
                                        </cntrl.WKLSelect>
                                    </div>
                                    <div className="col-md-1 mb-2">
                                        <label className="form-label" >Status</label>
                                        <div className="col-md-1 mt-2">
                                            <input className="form-check-input" type="checkbox" name="StatusSrch" checked={dataModel.StatusSrch} onChange={this.onCheckChangeSrch} style={{ width: "20px", height: "20px" }} />
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
                            {/* <button type="button" id="btn_open_windowcity" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_open_windowcity' })}>City</button>
                            <button type="button" id="btn_open_windowcategory" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_open_windowCategory' })}>Filter Types</button> */}
                        </div>
                        <div className="col border-start">
                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_new'} formID={model.FormID} onClick={(e) => this.clickAction({ id: this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_new' })}>
                                <button type="button" formID={model.FormID} hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            </cntrl.WKLButtonWrapper>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>
        )
    }
}