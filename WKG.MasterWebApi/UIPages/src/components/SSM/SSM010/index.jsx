import React from 'react';
import SSM010VM from './SSM010VM';
import * as cntrl from '../../../wkl-components';

export default class SSM010 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM010VM(props));
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
    onChangeSrch = (e) => {
        if (this.VM) {
            let model = this.Data.SearchInput;
            model[e.name] = e.value;
            this.VM.doSearchClear(false);
            this.VM.updateUI();
        }
    }
    onBlurSSM = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            model.SSMHeading = model.Input.Grp_Name;
        }
        this.updateUI();
    }
    onChange = (e) => {
        if (this.VM) {
            let model = this.Data.Input;
            if (Array.isArray(e.value) && e.value.length === 0) {
                model[e.name] = null;
            } else {
                model[e.name] = e.value;
            }
            if (e.name === 'SSMAirports') {
                this.VM.setDefaultAiportList(true);
            }
            if (e.name === "Home_screen") {
                this.VM.onBlurSrch(e.name, e.value);
            }
            if (e.name === "Enabled_apis") {
                this.VM.handleDistribusion();
            }

            this.VM.updateUI();
        }
    }
    selectTourCitySearch = (term) => {
        var dataInfo = { Text: term };
        return cntrl.Utils.search({ url: 'TypeSearch/RPSCityTypeAndSearch', data: dataInfo });
    }

    onCheckChange = (e) => {
        if (this.VM) {
            let model = '';
            if (e.target.name === "StatusSrch" || e.target.name === "StatusSrchSSM") {
                model = this.VM.Data.SearchInput;
            }
            else {
                model = this.VM.Data.Input;
            }
            model[e.target.name] = e.target.checked;
            this.VM.updateUI();
            if (e.target.name === "StatusSrchSSM") {
                this.VM.gridloadSSM(1, '', true);
            }
        }
    };
    onRadioChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data.Input;
            if (e.target && e.target.name) {
                model[e.target.name] = e.target.value;
            }

            this.VM.updateUI();
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
                    this.VM.handleSearch();
                }
                else if (action == "btn_clear") {
                    this.VM.handleSearchClear();
                }
                else if (action == "btn_new1") { //new 
                    this.VM.handleDataChange();
                }
                else if (action == "btn_edit1") { //modify
                    if (this.VM.Data.GridInfoGrp.SelectedItem)
                        this.VM.handleDataChange(this.VM.Data.GridInfoGrp.SelectedItem, "GRP");
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
                else if (action == "btn_home") {
                    this.VM.openWindow("home");
                }
                else if (action === "btn_destination") {
                    this.VM.openWindow("destination");
                }
                else if (action == "btn_ssm") {
                    this.VM.openWindow("ssm");
                }
                else if (action == "btn_ssm_new") {
                    this.VM.openWindow("ssm_new");
                }
                else if (action == "btn_manage_ssm") {
                    this.VM.openWindow("manage_ssm")
                }
                else if (action == "btn_copy") {
                    this.VM.openWindow("copy_data")
                }
                else if (action == "btn_transfer") {
                    this.VM.openWindow("transfer")
                }
                else if (action === "btn_banner") {
                    this.VM.openWindow("banner")
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
    onGridCellClickGrp = (e, item) => {
        if (this.VM) {
            this.VM.setSelectedItem(e.row, "GRP");
            console.log("Settitle", e)
            this.updateUI();
        }
    }
    onGridCellDoubleClickGrp = (e, item) => {
        if (this.VM) {
            this.VM.handleDataChange(e.row, "GRP");
        }
    }
    onSortChangeGrp = (e) => {
        const gridInfo = this.VM.Data.GridInfoGrp;
        this.VM.loadPage(gridInfo.Page, e.columnOptions);
    }
    onPageChangeGrp = (e) => {
        if (this.VM)
            this.VM.loadPage(e.value, e.columnOptions, "GRP");
    };

    renderGridGrp() {
        const gridInfo = this.VM.Data.GridInfoGrp;
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
                onPageChange: this.onPageChangeGrp
            },
            rowStyle: [
                { className: 'inactive-row', condition: (p) => { return p['Status'] == "Inactive" } },
            ],
            onGridCellClick: this.onGridCellClickGrp,
            onGridCellDoubleClick: this.onGridCellDoubleClickGrp,
            onSortChange: this.onSortChangeGrp,
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
    }
    onEditclick = (type, e) => {
        if (this.VM) {
            this.VM.onEditclick(type, e);
        }
    }
    ManageSSM = (type, e) => {
        if (this.VM) {
            this.VM.ManageSSM(type, e);
        }
    }
    columnEditButton = (e) => {
        return (<span>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Edit"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={() => { this.onEditclick("ssm_edit", e.row) }}><i className="fas fa-edit" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Generate Config"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={() => { this.ManageSSM("manage_ssm", e.row) }}><i className="fa-solid fa-thumbtack" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Additional Config"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={() => { this.ManageSSM("save_ssm", e.row) }}><i className="fa-solid fa-save" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Distribusion Default"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={() => { this.onEditclick("btn_Distribusion", e.row) }}><i className="fas fa-location" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
        </span>)
    };
    onGridCellClickSSM = (e, item) => {
        if (this.VM) {
            this.VM.setSelectedItem(e.row, "SSM");
            console.log("Settitle", e)
            this.updateUI();
        }
    }
    onPageChangeSSM = (e) => {
        if (this.VM)
            this.VM.gridloadSSM(e.value, e.columnOptions);
    };
    onSortChangeSSM = (e) => {
        const gridInfo = this.VM.Data.GridInfoSSM;
        this.VM.gridloadSSM(gridInfo.Page, e.columnOptions);
    }

    renderGridSSM() {
        const gridInfo = this.VM.Data.GridInfoSSM;
        gridInfo.Columns[3].onRender = this.columnEditButton;
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
                onPageChange: this.onPageChangeSSM
            },
            rowStyle: [
                { className: 'inactive-row', condition: (p) => { return p['Status'] == "Inactive" } },
            ],
            onGridCellClick: this.onGridCellClickSSM,
            onSortChange: this.onSortChangeSSM,
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
    }

    render() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;
        let disableEdit = true;
        let disableHomePage = true;
        let smmEdit = true;
        let title = '';
        let disableModifiedBy = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = this.VM.Data.Title;
        }
        if (model.GridInfoGrp.SelectedItem)
            disableEdit = false;
        if (dataModel.Home_screen?.ID === model.HomeScreenTypes?.Standard || dataModel.Home_screen?.ID === model.HomeScreenTypes?.HomeScreen2 || dataModel.Home_screen?.ID === model.HomeScreenTypes?.Tenerife) {
            disableHomePage = false;
        }
        console.log('EDIT', dataModel.IsEdit)
        smmEdit = dataModel.IsEdit;
        disableModifiedBy = !dataModel.IsEdit;

        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <cntrl.WKLBody>
                    <div className="window-content-area p-3 vh-100">
                        <div className='row'>
                            <div className='col-md-12'>
                                <div className='row'>
                                    <div className="col-md-5">
                                        <div className="row mb-3">
                                            <div className="col-md-7">
                                                <label className="col-form-label pt-0" htmlFor="Grp_NameSrch">Group Name / SSM Id / SSM Name</label>
                                                <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Grp_NameSrch')} name="Grp_NameSrch" value={model.SearchInput.Grp_NameSrch} onChange={this.onChangeSrch} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={200}>
                                                </cntrl.WKLTextbox>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="col-form-label pt-0" htmlFor="StatusSrch">Status</label>
                                                <div className="col-md-3">
                                                    <input className="form-check-input ms-2" type="checkbox" name="StatusSrch" checked={model.SearchInput.StatusSrch} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                </div>
                                            </div>
                                            <div className="col-md-2 d-flex align-items-end">
                                                <button type="button" name="btn_search" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_search' })}><i className="fa fa-search"></i> </button>
                                                <button type="button" name="btn_clear" hot-key="R" className="btn btn-sm btn-icon1 btn-primary " onClick={(e) => this.clickAction({ id: 'btn_clear' })}><i className="fa fa-refresh"></i> </button>
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <div className="col-md-12">
                                                {this.renderGridGrp()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-md-7 border-start'>
                                        <div className="col-md-12 p-0">
                                            <div className="row mb-3">
                                                <div className="col-md-4">
                                                    <label className="col-form-label pt-0" htmlFor="Grp_Name">Group Name<span className="text-danger text-mandatory">*</span></label>
                                                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Grp_Name')} name="Grp_Name" value={dataModel.Grp_Name} onChange={this.onChange} events={{ onBlur: () => this.onBlurSSM() }} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={50}>
                                                    </cntrl.WKLTextbox>
                                                </div>
                                                <div className="col-md-1"></div>
                                                <div className="col-md-3">
                                                    <label className="col-form-label pt-0" htmlFor="Pos_code">Pos Name<span className="text-danger text-mandatory">*</span></label>
                                                    <cntrl.WKLSelect name="Pos_code" compareKey="ID" displayField="Text" placeholder="Select Pos Name" allowClear={true} ref={(el) => this.onRefChange(el, 'Pos_code')} selectedItem={dataModel.Pos_code} dataSource={model.PosconfigList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-md-3">
                                                    <label className="col-form-label pt-0" htmlFor="UberSupplier">Uber Supplier</label>
                                                    <cntrl.WKLSelect name="UberSupplier" compareKey="ID" displayField="Text" placeholder="Select Uber Supplier" allowClear={false} ref={(el) => this.onRefChange(el, 'UberSupplier')} selectedItem={dataModel.UberSupplier} dataSource={model.UberSupplierList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="col-form-label pt-0" htmlFor="Uberallcars">Uber All Cars</label>
                                                    <div className="col-md-4">
                                                        <input className="form-check-input ms-2" type="checkbox" name="Uberallcars" checked={dataModel.Uberallcars} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="col-form-label pt-0" htmlFor="UberPricing">Uber Pricing</label>
                                                    <cntrl.WKLSelect name="UberPricing" compareKey="ID" displayField="Text" placeholder="Select Uber Pricing" allowClear={false} ref={(el) => this.onRefChange(el, 'UberPricing')} selectedItem={dataModel.UberPricing} dataSource={model.UberPricingList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="LangCodes">Languages</label>
                                                    <cntrl.WKLSelect name="LangCodes" compareKey="ID" displayField="Text" placeholder="Select Languages" multiSelect={true} allowClear={true} ref={(el) => this.onRefChange(el, 'LangCodes')} selectedItem={dataModel.LangCodes} dataSource={model.LangCodesList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="DefatLangCode">Default Language</label>
                                                    <cntrl.WKLSelect name="DefatLangCode" compareKey="ID" displayField="Text" placeholder="Select Default Language" allowClear={true} ref={(el) => this.onRefChange(el, 'DefatLangCode')} selectedItem={dataModel.DefatLangCode} dataSource={model.DefatLangCodeList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="RefreshTime">SSM Refresh Time</label>
                                                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'RefreshTime')} name="RefreshTime" placeholder="HH:MM" value={dataModel.RefreshTime} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.time24hr} maxLength={5}>
                                                    </cntrl.WKLTextbox>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="Home_screen">Home Screen</label>
                                                    <cntrl.WKLSelect name="Home_screen" compareKey="ID" displayField="Text" placeholder="Select Home Screen" allowClear={false} ref={(el) => this.onRefChange(el, 'Home_screen')} selectedItem={dataModel.Home_screen} dataSource={model.Home_screenList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="HomePage">Home Page Sections</label>
                                                    <cntrl.WKLSelect name="HomePage" disabled={disableHomePage} compareKey="ID" displayField="Text" placeholder="Select Home Page Sections" allowClear={true} multiSelect={true} ref={(el) => this.onRefChange(el, 'HomePage')} selectedItem={dataModel.HomePage} dataSource={model.HomePageList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="EndPoint">End Point<span className="text-danger text-mandatory">*</span></label>
                                                    <cntrl.WKLSelect name="EndPoint" compareKey="ID" displayField="Text" placeholder="Select End Point" allowClear={true} ref={(el) => this.onRefChange(el, 'EndPoint')} selectedItem={dataModel.EndPoint} dataSource={model.EndPointList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                {/* <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="Tui_cities">Allow Tour Cities</label>
                                                    <cntrl.WKLSelect name="Tui_cities" multiSelect={true} compareKey="ID" displayField="Text" placeholder="Select Allow Tour Cities" allowClear={true} ref={(el) => this.onRefChange(el, 'Tui_cities')} selectedItem={dataModel.Tui_cities} dataSource={model.Tui_citiesList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div> */}
                                                <div className="col-md-4" >
                                                    <label className="col-form-label" htmlFor="Tui_cities">Allow Tour Cities</label>
                                                    <cntrl.WKLSelect minChar={3} multiSelect={true} name="Tui_cities" ref={(el) => this.onRefChange(el, 'Tui_cities')} allowClear={true} selectedItem={dataModel.Tui_cities} onChange={this.onChange} asyncSearch={this.selectTourCitySearch} placeholder="Select Allow Tour Cities" displayField="Text" compareKey="ID" />
                                                </div>
                                                <div className="col-md-8">
                                                    <label className="col-form-label" htmlFor="SSMAirports">Flight Info Airports </label>
                                                    <cntrl.WKLSelect name="SSMAirports" compareKey="ID" displayField="Text" placeholder="Select Flight Info Airports" multiSelect={true} allowClear={true} ref={(el) => this.onRefChange(el, 'SSMAirports')} selectedItem={dataModel.SSMAirports} dataSource={model.SSMAirportsList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>

                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="Journey_tpy">Flight Info Default Journey Type</label>
                                                    <cntrl.WKLSelect name="Journey_tpy" compareKey="ID" displayField="Text" placeholder="Select Flight Info Default Journey Type" allowClear={true} ref={(el) => this.onRefChange(el, 'Journey_tpy')} selectedItem={dataModel.Journey_tpy} dataSource={model.Journey_tpyList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-8">
                                                    <label className="col-form-label" htmlFor="DfltAirport">Flight Info Default Airport </label>
                                                    <cntrl.WKLSelect name="DfltAirport" compareKey="ID" displayField="Text" placeholder="Select Flight Info Default Airport" allowClear={true} ref={(el) => this.onRefChange(el, 'DfltAirport')} selectedItem={dataModel.DfltAirport} dataSource={model.DfltAirportList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="Cartpy">Transfer Type </label>
                                                    <cntrl.WKLSelect name="Cartpy" compareKey="ID" displayField="Text" placeholder="Select Transfer Type" allowClear={true} ref={(el) => this.onRefChange(el, 'Cartpy')} selectedItem={dataModel.Cartpy} dataSource={model.CartpyList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="Enabled_apis">Enabled Apis</label>
                                                    <cntrl.WKLSelect name="Enabled_apis" multiSelect={true} compareKey="ID" displayField="Text" placeholder="Select Enabled Apis" allowClear={true} ref={(el) => this.onRefChange(el, 'Enabled_apis')} selectedItem={dataModel.Enabled_apis} dataSource={model.Enabled_apisList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="Country_code">Gmap Location Country & Currency<span className="text-danger text-mandatory">*</span></label>
                                                    <cntrl.WKLSelect name="Country_code" compareKey="ID" displayField="Text" placeholder="Select Country" allowClear={true} ref={(el) => this.onRefChange(el, 'Country_code')} selectedItem={dataModel.Country_code} dataSource={model.CountryCodeList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="Payment_typ">Payment<span className="text-danger text-mandatory">*</span></label>
                                                    <cntrl.WKLSelect name="Payment_typ" compareKey="ID" displayField="Text" placeholder="Select Payment" allowClear={true} ref={(el) => this.onRefChange(el, 'Payment_typ')} selectedItem={dataModel.Payment_typ} dataSource={model.PaymentTypList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="Distibusion_Cntry">Distribusion Location Country</label>
                                                    <cntrl.WKLSelect name="Distibusion_Cntry" disabled={model.disableDistribusion} multiSelect={true} compareKey="ID" displayField="Text" placeholder="Select Distribusion Location Country" allowClear={true} ref={(el) => this.onRefChange(el, 'Distibusion_Cntry')} selectedItem={dataModel.Distibusion_Cntry} dataSource={model.DistibusionCntryList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="DstrbsnConnStn ">Distribusion Connected Stations</label>
                                                    <div className="col-md-3">
                                                        <input className="form-check-input ms-2" disabled={model.disableDistribusion} type="checkbox" name="DstrbsnConnStn" checked={dataModel.DstrbsnConnStn} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="Distibusion_Crrg">Distribusion Carriages</label>
                                                    <cntrl.WKLSelect name="Distibusion_Crrg" disabled={model.disableDistribusion} multiSelect={true} compareKey="ID" displayField="Text" placeholder="Select Distribusion Carriages" allowClear={true} ref={(el) => this.onRefChange(el, 'Distibusion_Crrg')} selectedItem={dataModel.Distibusion_Crrg} dataSource={model.DistibusionCrrgList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="Trms_cndtn">Terms & Condition</label>
                                                    <cntrl.WKLSelect name="Trms_cndtn" multiSelect={true} compareKey="ID" displayField="Text" placeholder="Select Terms & Condition" allowClear={true} ref={(el) => this.onRefChange(el, 'Trms_cndtn')} selectedItem={dataModel.Trms_cndtn} dataSource={model.Trms_cndtnList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="col-form-label" htmlFor="Status">Status</label>
                                                    <div className="col-md-4">
                                                        <input className="form-check-input ms-2" type="checkbox" name="Status" checked={dataModel.Status} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='row mb-3'>
                                                <div class="wkl-window-header p-2 mb-3"> <h5 class="mb-0">Ssm Linked to {model.SSMHeading}</h5></div>
                                                <div className='d-flex mb-3' style={{ justifyContent: "space-between" }}>
                                                    <div className="ms-3">
                                                        <label className="col-form-label pt-0" htmlFor="StatusSrchSSM">Status</label>
                                                        <div className="col-md-3">
                                                            <input className="form-check-input ms-2" type="checkbox" name="StatusSrchSSM" disabled={!dataModel.IsEdit} checked={model.SearchInput.StatusSrchSSM} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                        </div>
                                                    </div>
                                                    <div className='mt-2' style={{ justifyContent: "center" }}>
                                                        <button type="button" id="btn_ssm_new" hot-key="L" disabled={!dataModel.IsEdit} className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_ssm_new' })}><i className="fa fa-add"></i> Add New SSM</button>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    {this.renderGridSSM()}
                                                </div>
                                            </div>
                                            <div className='row mt-4' hidden={disableModifiedBy}>
                                                <div className='col'>
                                                    <cntrl.WKLAuditLabel hidden={disableModifiedBy} modifiedOn={dataModel.ModifiedOn} modifiedBy={dataModel.ModifiedBy} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </cntrl.WKLBody>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-4">
                            <button type="button" id="btn_new1" hot-key="N" className="btn btn-sm btn-add1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_new1' })} ><i className="fa fa-plus"></i> New</button>
                            <button type="button" id="btn_edit1" disabled={disableEdit} hot-key="M" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_edit1' })}> <i className="fa fa-edit"></i> Modify</button>
                        </div>
                        <div className="col">
                            <button type="button" id="btn_copy" hot-key="P" disabled={!dataModel.IsEdit} className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_copy' })}><i className="fas fa-copy"></i> Copy</button>
                        </div>
                        <div className="col-md-5 mx-0">
                            <button type="button" id="btn_banner" hot-key="P" disabled={!dataModel.IsEdit} className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_banner' })}><i className="fas fa-image"></i> Banner Config</button>
                            <button type="button" id="btn_transfer" hot-key="P" disabled={!dataModel.IsEdit} className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_transfer' })}><i className="fas fa-exchange-alt"></i> Transfer Config</button>
                            <button type="button" id="btn_destination" hot-key="P" disabled={!dataModel.IsEdit} className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_destination' })}><i className="fas fa-map-marker"></i> Popular Destination</button>
                            <button type="button" id="btn_home" hot-key="H" disabled={!dataModel.IsEdit} className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_home' })}> <i className="fa fa-home"> </i> Home Page config</button>
                        </div>
                        <div className="col-md-auto">
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