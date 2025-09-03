import React from 'react';
import SSM140VM from './SSM140VM';
import * as cntrl from '../../../wkl-components';

export default class SSM140 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM140VM(props));
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
    onChangeSearch = (e) => {
        const model = this.VM.Data.SearchInput;
        if (e.name)
            model[e.name] = e.value;
        else if (e.target && e.target.name)
            model[e.target.name] = e.target.value;
        this.VM.doSearchClear(false);
    }
    onChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data.Input;
            if (e.name)
                model[e.name] = e.value;
            else if (e.target && e.target.name)
                model[e.target.name] = e.target.value;
            if (e.name === "Distribusion_Dflt_Stn" && e.value !== null) {
                this.VM.onBlurSearch();
            }
            this.updateUI();
        }
    };
    onChangeImg = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            const dataModel = this.VM.Data.Input;
            if (e.name) {
                model.Image_Array = e.files;
                dataModel.Image_SNO = null;
                dataModel[e.name] = e.value;
            }
            this.VM.onBlurCheck(e.value);
            this.updateUI();
        }
    };
    selectDistributionDfltStnSrch = (term) => {
        const model = this.VM.Data;
        var dataInfo = { Text: term, GrpID: model.Grp_ID, ConnectStn: model.ConnectedStn };
        return cntrl.Utils.search({ url: 'TypeSearch/DistribusionStationTypeAndSrch', data: dataInfo });
    }
    onCheckChange = (e) => {
        if (this.VM) {
            let model;
            if (e.target.name === "SSM_Dflt_StnSrch") {
                model = this.VM.Data.SearchInput;
            } else {
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
                    this.VM.handleSearch(1);
                }
                else if (action === "btn_new1") {
                    this.VM.handleDataChange();
                }
                else if (action == "btn_clear") {
                    this.VM.handleSearchClear();
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
                    this.VM.handleSave(e);
                }
                else if (action == "btn_cancel") {
                    this.VM.handleDataChange();
                }
                else if (action === "btn_Addimage_Distrbtn") {
                    this.VM.openWindow("btn_Addimage_Distrbtn");
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

        this.VM.loadPage(e.value, e.columnOptions);
    }
    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.loadPage(gridInfo.Page, e.columnOptions);
    }
    columnCheckBox = (e) => {
        return (<input class="form-check-input" type="checkbox" name="IsSelected" checked={e.row.IsSelected === true} onChange={(ex) => this.onCheckChange(ex, e.row, e.dataSource)} />)
    };
    headerColumnCheckBox = () => {
        const model = this.VM.Data;
        return (<input class="form-check-input" type="checkbox" name="AllSelected" checked={model.AllSelected === true} onChange={(e) => this.onCheckChange(e)} />)
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
    renderForm() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;

        return (<form>
            <div className="col-md-12 d-flex justify-content-between">
                <div className="col-md-9 mb-2">
                    <label className="col-form-label" >Departure City/Area/Station Direction Image</label>
                    <div className="col-md-12 d-flex justify-content-between">
                        <div className="col-md-10">
                            <cntrl.WKLFile isMultiFile={false} accept='image/*' name="Distribusion_Loc_Img" value={dataModel.Distribusion_Loc_Img} onChange={this.onChangeImg} placeholder="Select Departure City/Area/Station Direction Image" />
                        </div>
                        <div className="col-md-2 px-2">
                            <button style={{ height: "33px" }} type="button" id="btn_Addimage_Distrbtn" hot-key="L" className="btn btn-sm btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Addimage_Distrbtn' })}><i className="fa fa-image"></i> </button>
                        </div>
                    </div>
                </div>
                <div className="ms-3 col-md-3 mt-3 justify-content-center">
                    <label className="form-label" htmlFor='SSM_Dflt_Stn'>Default</label>
                    <div className="col-md-4">
                        <input className="form-check-input ms-2" type="checkbox" id="SSM_Dflt_Stn" name="SSM_Dflt_Stn" checked={dataModel.SSM_Dflt_Stn} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                    </div>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="col-form-label" >Time to bus stop (minutes)</label>
                    <cntrl.WKLTextbox IsEdit={true} mandatory={true} ref={(el) => this.onRefChange(el, 'TimToBusStp')} name="TimToBusStp" value={dataModel.TimToBusStp} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} prefix={2} suffix={0}>
                    </cntrl.WKLTextbox>
                </div>
                <div className="col-md-6">
                    <label className="col-form-label">Sort</label>
                    <cntrl.WKLTextbox name="Sort_Order" ref={(el) => this.onRefChange(el, 'Sort_Order')} value={dataModel.Sort_Order} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} prefix={4} suffix={0} onChange={this.onChange} >
                    </cntrl.WKLTextbox>
                </div>
            </div>
            <div className="mb-2" >
                <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn">Departure City/Area/Station Name<span className="text-danger text-mandatory">*</span></label>
                <cntrl.WKLSelect minChar={3} name="Distribusion_Dflt_Stn" ref={(el) => this.onRefChange(el, 'Distribusion_Dflt_Stn')} allowClear={true} selectedItem={dataModel.Distribusion_Dflt_Stn} onChange={this.onChange} asyncSearch={this.selectDistributionDfltStnSrch} placeholder="Select Departure City/Area/Station Name" displayField="Text" compareKey="ID" />
            </div>
            {dataModel?.Distribusion_Dflt_Stn?.type === model.DstrbnLocType?.City &&

                <div className="col-md-12" >
                    <div className="mt-3" style={{ backgroundColor: "#eef2f7", border: "1px solid #dee2e6", color: "rgba(33, 37, 41, 0.75)" }}>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>City Name : </strong>{dataModel.Distribusion_Dflt_Stn?.name}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>City Latitude : </strong>{dataModel.Distribusion_Dflt_Stn?.latitude}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>City Longitude : </strong>{dataModel.Distribusion_Dflt_Stn?.longitude}</label>
                        </div>
                    </div>
                </div>}
            {dataModel?.Distribusion_Dflt_Stn?.type === model.DstrbnLocType?.Area &&

                <div className="col-md-12" >
                    <div className="mt-3" style={{ backgroundColor: "#eef2f7", border: "1px solid #dee2e6", color: "rgba(33, 37, 41, 0.75)" }}>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Area Name : </strong>{dataModel.Distribusion_Dflt_Stn?.name}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Area City : </strong>{dataModel.Distribusion_Dflt_Stn?.city}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Area IATA : </strong>{dataModel.Distribusion_Dflt_Stn?.iata}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Area Latitude : </strong>{dataModel.Distribusion_Dflt_Stn?.latitude}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Area Longitude : </strong>{dataModel.Distribusion_Dflt_Stn?.longitude}</label>
                        </div>
                    </div>
                </div>}
            {dataModel?.Distribusion_Dflt_Stn?.type === model.DstrbnLocType?.Station &&
                <div className="col-md-12" >
                    <div className="mt-3" style={{ backgroundColor: "#eef2f7", border: "1px solid #dee2e6", color: "rgba(33, 37, 41, 0.75)" }}>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Station Name : </strong>{dataModel.Distribusion_Dflt_Stn?.name}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Station Type : </strong>{dataModel.Distribusion_Dflt_Stn?.stationtype}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Station City : </strong>{dataModel.Distribusion_Dflt_Stn?.city}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Station Area : </strong>{dataModel.Distribusion_Dflt_Stn?.area}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Station Address : </strong>{dataModel.Distribusion_Dflt_Stn?.address}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Station Post : </strong>{dataModel.Distribusion_Dflt_Stn?.post}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Station Latitude : </strong>{dataModel.Distribusion_Dflt_Stn?.latitude}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Station Longitude : </strong>{dataModel.Distribusion_Dflt_Stn?.longitude}</label>
                        </div>
                        <div className="mx-2 mb-2">
                            <label className="col-form-label" htmlFor="Distribusion_Dflt_Stn"><strong>Station Description : </strong>{dataModel.Distribusion_Dflt_Stn?.stnDesc}</label>
                        </div>
                    </div>
                </div>
            }


            {dataModel.IsEdit && dataModel.mod_dttm !== "" && (
                <div className="mb-2 mt-3">
                    <div className="col-md-12">
                        <cntrl.WKLAuditLabel modifiedOn={dataModel.mod_dttm} modifiedBy={dataModel.mod_by_usr_cd} />
                    </div>
                </div>)
            }
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
                <cntrl.WKLBody>
                    <div className="window-content-area p-3 vh-100">
                        <div className="container-fluid p-0 h-100">
                            <div className="row h-100">
                                <div className="col-md-7">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <label className="form-label" >Departure City/Area/Station Name</label>
                                                <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'Station_NameSrch')} placeholder="Enter Departure City/Area/Station Name" name="Station_NameSrch" value={dataModel.Station_NameSrch} onChange={this.onChangeSearch} inputType={cntrl.WKLTextboxTypes.textbox} maxLength={100}>
                                                </cntrl.WKLTextbox>
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
                                <div className="col-md-5 border-start">
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
                        <div className="col border-start">
                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={this.VM.Data.Input.IsEdit ? 'btn_edit' : 'btn_save'} formID={model.FormID} onClick={this.clickAction}>
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