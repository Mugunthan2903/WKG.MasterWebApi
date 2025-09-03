import React from 'react';
import SMST015VM from './SMST015VM';
import * as cntrl from '../../../wkl-components';


export default class SMST015 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST015VM(props));
        this.inputRefs = {};
    }

    //Set value in onload
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
    }
    //handle close 
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };

    //Select box search
    onSearchChange = (e) => {
        if (this.VM) {
            let model = this.Data.SearchInput;
            model[e.name] = e.value;
            this.VM.doSearchClear(false);
            this.VM.updateUI();
        }
    };

    onChange = (e) => {
        if (this.VM) {
            let model = this.Data.Input;
            model[e.name] = e.value;
            this.VM.updateUI();
            if (e.name === 'SMST015_SSMAirports') {
                this.VM.setDefaultAiportList(true);
            }
        }
    };
    onChangeSSMID = (e) => {
        if (this.VM) {
            let model = this.Data.Input;
            model[e.name] = e.value;
            this.VM.onBlurSrch();
            this.VM.updateUI();
        }
    };
    //handle radio Change for 
    onRadioChangeStatus = (e) => {
        if (this.VM) {
            let model = '';
            if (e.target.name == 'SMST015_StatusSrch') {
                model = this.VM.Data.SearchInput;

            } else {
                model = this.VM.Data.Input
            }
            model[e.target.name] = e.target.value === "A";
            this.VM.updateUI();
        }
    };
    onRadioChangeInput = (e) => {
        if (this.VM) {
            let model = '';
            model = this.VM.Data.Input;
            model[e.target.name] = e.target.value;
            this.VM.updateUI();
        }
    };
    //handle set focus
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
    //handle click action
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
                    this.VM.handleDataChange()
                }
                else if (action === 'btn_open_Heading_window') {
                    this.VM.openWindow("Heading");
                }
                else if (action === 'btn_open_Slide_window') {
                    this.VM.openWindow("Slide");
                }
                else if (action === 'btn_open_Todo_window') {
                    this.VM.openWindow("Todo");
                }
            }
        }
    }
    //handle grid click
    onGridCellClick = (e, item) => {
        if (this.VM) {
            this.VM.setSelectedItem(e.row);
            this.updateUI();
        }
    }
    //handle grid Double click
    onGridCellDoubleClick = (e, item) => {
        if (this.VM) {
            this.VM.handleDataChange(e.row);
        }
    }
    //handle page change
    onPageChange = (e) => {
        if (this.VM)
            this.VM.loadPage(e.value, e.columnOptions);
    };
    //handle set focus
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
    //set teh name for focus
    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }
    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.loadPage(gridInfo.Page, e.columnOptions);

    }
    onCheckChange = (e, dataModel) => {
        if (this.VM) {
            const model = this.VM.Data;
            dataModel = dataModel || model;
            dataModel[e.target.name] = e.target.checked;

            if (e.target.name === 'AllSelected') {
                for (const itm of model.GridInfo.Items) {
                    itm.IsSelected = model.AllSelected;
                }
            }
            else {
                model.AllSelected = model.GridInfo.Items.length === model.GridInfo.Items.count(i => i.IsSelected);
            }
            this.updateUI();
        }
    };
    columnCheckBox = (e) => {
        return (<input class="form-check-input" type="checkbox" name="IsSelected" checked={e.row.IsSelected === true} onChange={(ex) => this.onCheckChange(ex, e.row, e.dataSource)} />)
    };
    headerColumnCheckBox = () => {
        const model = this.VM.Data;
        return (<input class="form-check-input" type="checkbox" name="AllSelected" checked={model.AllSelected === true} onChange={(e) => this.onCheckChange(e)} />)
    };

    //render the grid
    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
        // gridInfo.Columns[0].onRender = this.columnCheckBox;
        // gridInfo.Columns[0].text = this.headerColumnCheckBox();
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

    renderForm1() {

        const dataModel = this.VM.Data.Input;
        const model = this.VM.Data;
        let disableModifiedBy = '';
        let disableSSMName = '';
        disableModifiedBy = !model.Input.IsEdit;
        disableSSMName = model.Input.IsEdit;

        return (<form>
            <div className="mb-2">
                <label className="form-label" htmlFor="SMST015_SSMID">SSM Name<span className="text-danger text-mandatory">*</span></label>
                <div className='col-md-11'>
                    <cntrl.WKLSelect name="SMST015_SSMID" disabled={disableSSMName} compareKey="ID" displayField="Text" placeholder="Select SSM Name" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST015_SSMID')} selectedItem={dataModel.SMST015_SSMID} dataSource={model.SMST015_SSMIDList} onChange={this.onChangeSSMID}>
                    </cntrl.WKLSelect>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >SSM Airports</label>
                <div className='col-md-11'>
                    <cntrl.WKLSelect name="SMST015_SSMAirports" compareKey="ID" displayField="Text" placeholder="Select SSM aiports" multiSelect={true} allowClear={true} ref={(el) => this.onRefChange(el, 'SMST015_SSMAirports')} selectedItem={dataModel.SMST015_SSMAirports} dataSource={model.SMST015_SSMAirportsList} onChange={this.onChange}>
                    </cntrl.WKLSelect>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >Default Airport</label>
                <div className='col-md-11'>
                    <cntrl.WKLSelect name="SMST015_DfltAirport" compareKey="ID" displayField="Text" placeholder="Select Default airport" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST015_DfltAirport')} selectedItem={dataModel.SMST015_DfltAirport} dataSource={model.SMST015_DfltAirportList} onChange={this.onChange}>
                    </cntrl.WKLSelect>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >Default Journey Type</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_DfltJourney_tpyA" radioGroup="SMST015_DfltJourney_tpy" name="SMST015_DfltJourney_tpy" checked={dataModel.SMST015_DfltJourney_tpy === "A"} onChange={this.onRadioChangeInput} value="A" />
                        <label className="form-check-label" htmlFor="SMST015_DfltJourney_tpyA">Arrival</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_DfltJourney_tpyD" radioGroup="SMST015_DfltJourney_tpy" name="SMST015_DfltJourney_tpy" checked={dataModel.SMST015_DfltJourney_tpy === "D"} onChange={this.onRadioChangeInput} value="D" />
                        <label className="form-check-label" htmlFor="SMST015_DfltJourney_tpyD">Departure</label>
                    </div>
                </div>
            </div>
            <div className="col-md-11">
                <div className="mb-2">
                    <label className="form-label" >SSM Location Name<span className="text-danger text-mandatory">*</span></label>
                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SMST015_SSM_loc_name')} name="SMST015_SSM_loc_name" value={dataModel.SMST015_SSM_loc_name} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={200}>
                    </cntrl.WKLTextbox>
                </div>
            </div>
            <div className="col-md-11">
                <div className="mb-2">
                    <label className="form-label" >SSM Location Latitude<span className="text-danger text-mandatory">*</span></label>
                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SMST015_SSM_loc_lat')} name="SMST015_SSM_loc_lat" value={dataModel.SMST015_SSM_loc_lat} prefix={6} suffix={9} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} maxLength={9}>
                    </cntrl.WKLTextbox>
                </div>
            </div>
            <div className="col-md-11">
                <div className="mb-2">
                    <label className="form-label" >SSM Location Longitude<span className="text-danger text-mandatory">*</span></label>
                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SMST015_SSM_loc_lon')} name="SMST015_SSM_loc_lon" value={dataModel.SMST015_SSM_loc_lon} prefix={6} suffix={9} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} maxLength={9}>
                    </cntrl.WKLTextbox>
                </div>
            </div>
            <div className="col-md-11">
                <div className="mb-2">
                    <label className="form-label" >SSM Location Postcode<span className="text-danger text-mandatory">*</span></label>
                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SMST015_SSM_loc_pstcode')} name="SMST015_SSM_loc_pstcode" value={dataModel.SMST015_SSM_loc_pstcode} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={15}>
                    </cntrl.WKLTextbox>
                </div>
            </div>
            <div className="col-md-11">
                <div className="mb-2">
                    <label className="form-label" >SSM Location Short Name</label>
                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SMST015_SSM_loc_shtname')} name="SMST015_SSM_loc_shtname" value={dataModel.SMST015_SSM_loc_shtname} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={50}>
                    </cntrl.WKLTextbox>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >Email Required</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_Email_reqY" radioGroup="SMST015_Email_req" name="SMST015_Email_req" checked={dataModel.SMST015_Email_req === "Y"} onChange={this.onRadioChangeInput} value="Y" />
                        <label className="form-check-label" htmlFor="SMST015_Email_reqY">Yes</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_Email_reqN" radioGroup="SMST015_Email_req" name="SMST015_Email_req" checked={dataModel.SMST015_Email_req === "N"} onChange={this.onRadioChangeInput} value="N" />
                        <label className="form-check-label" htmlFor="SMST015_Email_reqN">No</label>
                    </div>
                </div>
            </div>
            <div className='row mt-4' hidden={disableModifiedBy}>
                <div className='col'>
                    <cntrl.WKLAuditLabel hidden={disableModifiedBy} modifiedOn={dataModel.ModifiedOn} modifiedBy={dataModel.ModifiedBy} />
                </div>
            </div>
        </form >);
    }

    renderForm2() {
        const dataModel = this.VM.Data.Input;
        const model = this.VM.Data;

        let disableModifiedBy = '';
        disableModifiedBy = !model.Input.IsEdit;

        return (<form>
            <div className="mb-2">
                <label className="form-label" >To Do</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_To_DoY" radioGroup="SMST015_To_Do" name="SMST015_To_Do" checked={dataModel.SMST015_To_Do} onChange={this.onRadioChangeStatus} value="A" />
                        <label className="form-check-label" htmlFor="SMST015_To_DoY">Yes</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_To_DoN" radioGroup="SMST015_To_Do" name="SMST015_To_Do" checked={dataModel.SMST015_To_Do === false} onChange={this.onRadioChangeStatus} value="I" />
                        <label className="form-check-label" htmlFor="SMST015_To_DoN">No</label>
                    </div>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >Slide</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_SlideY" radioGroup="SMST015_Slide" name="SMST015_Slide" checked={dataModel.SMST015_Slide} onChange={this.onRadioChangeStatus} value="A" />
                        <label className="form-check-label" htmlFor="SMST015_SlideY">Yes</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_SlideN" radioGroup="SMST015_Slide" name="SMST015_Slide" checked={dataModel.SMST015_Slide === false} onChange={this.onRadioChangeStatus} value="I" />
                        <label className="form-check-label" htmlFor="SMST015_SlideN">No</label>
                    </div>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >Concierge Help</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_ConHelpY" radioGroup="SMST015_ConHelp" name="SMST015_ConHelp" checked={dataModel.SMST015_ConHelp} onChange={this.onRadioChangeStatus} value="A" />
                        <label className="form-check-label" htmlFor="SMST015_ConHelpY">Yes</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_ConHelpN" radioGroup="SMST015_ConHelp" name="SMST015_ConHelp" checked={dataModel.SMST015_ConHelp === false} onChange={this.onRadioChangeStatus} value="I" />
                        <label className="form-check-label" htmlFor="SMST015_ConHelpN">No</label>
                    </div>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >Concierge Flight</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_ConFlightY" radioGroup="SMST015_ConFlight" name="SMST015_ConFlight" checked={dataModel.SMST015_ConFlight} onChange={this.onRadioChangeStatus} value="A" />
                        <label className="form-check-label" htmlFor="SMST015_ConFlightY">Yes</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_ConFlightN" radioGroup="SMST015_ConFlight" name="SMST015_ConFlight" checked={dataModel.SMST015_ConFlight === false} onChange={this.onRadioChangeStatus} value="I" />
                        <label className="form-check-label" htmlFor="SMST015_ConFlightN">No</label>
                    </div>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >Concierge Cancel</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_ConCanclY" radioGroup="SMST015_ConCancl" name="SMST015_ConCancl" checked={dataModel.SMST015_ConCancl} onChange={this.onRadioChangeStatus} value="A" />
                        <label className="form-check-label" htmlFor="SMST015_ConCanclY">Yes</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_ConCanclN" radioGroup="SMST015_ConCancl" name="SMST015_ConCancl" checked={dataModel.SMST015_ConCancl === false} onChange={this.onRadioChangeStatus} value="I" />
                        <label className="form-check-label" htmlFor="SMST015_ConCanclN">No</label>
                    </div>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >Car Type<span className="text-danger text-mandatory">*</span></label>
                <div className="form-control border-0 px-0">
                    <div className="form-check  form-check-inline" style={{ marginRight: "9px" }}>
                        <input type="radio" className="form-check-input" id="SMST015_CartpyB" radioGroup="SMST015_Cartpy" name="SMST015_Cartpy" checked={dataModel.SMST015_Cartpy === "B"} onChange={this.onRadioChangeInput} value="B" />
                        <label className="form-check-label" htmlFor="SMST015_CartpyB">Hybrid</label>
                    </div>
                    <div className="form-check  form-check-inline" style={{ marginRight: "9px" }}>
                        <input type="radio" className="form-check-input" id="SMST015_CartpyE" radioGroup="SMST015_Cartpy" name="SMST015_Cartpy" checked={dataModel.SMST015_Cartpy === "E"} onChange={this.onRadioChangeInput} value="E" />
                        <label className="form-check-label" htmlFor="SMST015_CartpyE">Eshuttle</label>
                    </div>
                    <div className="form-check  form-check-inline" style={{ marginRight: "9px" }}>
                        <input type="radio" className="form-check-input" id="SMST015_CartpyU" radioGroup="SMST015_Cartpy" name="SMST015_Cartpy" checked={dataModel.SMST015_Cartpy === "U"} onChange={this.onRadioChangeInput} value="U" />
                        <label className="form-check-label" htmlFor="SMST015_CartpyU">Uber</label>
                    </div>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >Uber All Cars</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_UberallcarsA" radioGroup="SMST015_Uberallcars" name="SMST015_Uberallcars" checked={dataModel.SMST015_Uberallcars} onChange={this.onRadioChangeStatus} value="A" />
                        <label className="form-check-label" htmlFor="SMST015_UberallcarsA">Active</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_UberallcarsI" radioGroup="SMST015_Uberallcars" name="SMST015_Uberallcars" checked={dataModel.SMST015_Uberallcars === false} onChange={this.onRadioChangeStatus} value="I" />
                        <label className="form-check-label" htmlFor="SMST015_UberallcarsI">Inactive</label>
                    </div>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label" >Uber Booking Fee</label>
                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SMST015_Uber_Book_Fee')} name="SMST015_Uber_Book_Fee" prefix={6} suffix={2} value={dataModel.SMST015_Uber_Book_Fee} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} maxLength={9}>
                    </cntrl.WKLTextbox>
                </div>
            </div>
            <div className="col-md-12">
                <div className="mb-2">
                    <label className="form-label" >Wkl Booking Fee</label>
                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SMST015_Wkl_Book_Fee')} name="SMST015_Wkl_Book_Fee" prefix={6} suffix={2} value={dataModel.SMST015_Wkl_Book_Fee} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} maxLength={9}>
                    </cntrl.WKLTextbox>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >Status</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_StatusA" radioGroup="SMST015_Status" name="SMST015_Status" checked={dataModel.SMST015_Status} onChange={this.onRadioChangeStatus} value="A" />
                        <label className="form-check-label" htmlFor="SMST015_StatusA">Active</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" id="SMST015_StatusI" radioGroup="SMST015_Status" name="SMST015_Status" checked={dataModel.SMST015_Status === false} onChange={this.onRadioChangeStatus} value="I" />
                        <label className="form-check-label" htmlFor="SMST015_StatusI">Inactive</label>
                    </div>
                </div>
            </div>
        </form>
        )
    }

    render() {

        const owner = this;

        const model = this.VM.Data;
        const dataModel = this.VM.Data.SearchInput;

        let disableEdit = true;

        let disableDeleteButton = true;
        let disableHeading = true;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
            disableDeleteButton = !model.Input.IsEdit;

            disableHeading = !model.Input.IsEdit;

            if (model.GridInfo.SelectedItem)
                disableEdit = false;

        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area vh-100 p-3" style={{ overflow: "overlay" }}>
                    <div className="container-fluid p-0">
                        <div className="row">
                            <div className="col-md-5">
                                <div className="row">
                                    <div className="col-md-5">
                                        <div className="mb-2">
                                            <label className="form-label" htmlFor="SMST015_SSMIDSrch">SSM Name</label>
                                            <div className='col-md-12'>
                                                <cntrl.WKLSelect name="SMST015_SSMIDSrch" compareKey="ID" displayField="Text" placeholder="Select SSM Name" allowClear={true} ref={(el) => this.onRefChange(el, 'SMST015_SSMIDSrch')} selectedItem={dataModel.SMST015_SSMIDSrch} dataSource={model.SMST015_SSMIDListSrch} onChange={this.onSearchChange}>
                                                </cntrl.WKLSelect>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-5 mb-2">
                                        <label className="form-label col-md-2" >Status</label>
                                        <div className="form-control border-0 ps-0">
                                            <div className="form-check  form-check-inline">
                                                <input type="radio" className="form-check-input" id="SMST015_StatusSrchA" radioGroup="SMST015_StatusSrch" name="SMST015_StatusSrch" checked={dataModel.SMST015_StatusSrch} onChange={this.onRadioChangeStatus} value="A" />
                                                <label className="form-check-label" htmlFor="SMST015_StatusSrchA">Active</label>
                                            </div>
                                            <div className="form-check  form-check-inline">
                                                <input type="radio" className="form-check-input" id="SMST015_StatusSrchI" radioGroup="SMST015_StatusSrch" name="SMST015_StatusSrch" checked={dataModel.SMST015_StatusSrch === false} onChange={this.onRadioChangeStatus} value="I" />
                                                <label className="form-check-label" htmlFor="SMST015_StatusSrchI">Inactive</label>
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
                                <div className="row mt-2">
                                    <div className="col">
                                        {this.renderGrid()}
                                    </div>
                                </div>
                            </div>
                            <div className="row col-md-6 border-start mx-0">
                                <div className="col-md-7 p-0">
                                    {this.renderForm1()}
                                </div>
                                <div className="col-md-5">
                                    {this.renderForm2()}
                                </div>

                            </div>
                            <div className="col-md-1 border-start" >
                                <div className='row'>
                                    <div className='col text-center'>
                                        <button type="button" id="btn_open_Heading_window" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" disabled={disableHeading} onClick={(e) => this.clickAction({ id: 'btn_open_Heading_window', })}>Heading</button>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col text-center mt-2'>
                                        <button type="button" id="btn_open_Slide_window" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" disabled={disableHeading} onClick={(e) => this.clickAction({ id: 'btn_open_Slide_window' })}>Slide Config</button>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col text-center mt-2'>
                                        <button type="button" id="btn_open_Todo_window" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" disabled={disableHeading} onClick={(e) => this.clickAction({ id: 'btn_open_Todo_window' })}>Todo Config</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                            <button type="button" id="btn_new1" hot-key="N" className="btn btn-sm btn-add1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_new1' })} ><i className="fa fa-plus"></i> New</button>
                            <button type="button" id="btn_edit1" disabled={disableEdit} hot-key="M" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_edit1' })}> <i className="fa fa-edit"></i> Modify</button>
                            <button type="button" id="btn_audit" hidden={true} hot-key="A" className="btn btn-sm btn-audit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_audit' })}><i className="fa fa-history"></i> </button>
                        </div>
                        <div className="col border-start">
                            <cntrl.WKLButtonWrapper id="btn_delete" hidden={true} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hidden={true} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
                            </cntrl.WKLButtonWrapper>
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