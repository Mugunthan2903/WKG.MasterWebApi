import React from 'react';
import SSM018VM from './SSM018VM';
import * as cntrl from '../../../wkl-components';

export default class SSM018 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM018VM(props));
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
            model[e.name] = e.value;
            this.VM.updateUI();
        }
    }
    onChangeImg = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            const dataModel = this.VM.Data.Input;
            if (e.name) {
                model.Image_Array = e.files;
                model.Image_SNO = null;
                model.Image_Url = null;
                model[e.name] = e.value;
                model.DisableTypeEdit = false;
                dataModel.Upload_Type = false;
            }
            this.VM.onBlurCheck(e.value);
            this.updateUI();
            console.log("Model : ", model);
        }
    };
    onRadioChange = (e) => {
        if (this.VM) {
            let model = '';
            model = this.VM.Data.Input;
            model[e.target.name] = e.target.value === 'Y';
            if (!model.Upload_Type) {
                model.ImagePlaySeconds = "";
                model.Upload_manually = true;
            }
            this.VM.updateUI();
        }
    };
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
                else if (action == "btn_new" || action == "btn_edit") {
                    this.VM.handleSave(e);
                }
                else if (action == "btn_clear") {
                    this.VM.handleSearchClear();
                }
                else if (action == "btn_cancel") {
                    this.VM.handleDataChange()
                }
                else if (action == "btn_Addimage_banner") {
                    this.VM.openWindow("btn_Addimage_banner");
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
    renderForm() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;
        let disabledradio = model.DisableTypeEdit;

        return (<form>
            <div className="mb-2">
                <label className="col-form-label" >Banner<span className="text-danger text-mandatory">*</span></label>
                <div className="col-md-12 d-flex justify-content-between">
                    <div className="col-md-10">
                        <cntrl.WKLFile isMultiFile={false} accept='image/*,video/*' name="Image_Upload" value={model.Image_Upload} onChange={this.onChangeImg} placeholder="Select Banner" />
                    </div>
                    <div className="col-md-2 px-2">
                        <button style={{ height: "33px" }} type="button" id="btn_Addimage_banner" hot-key="L" className="btn btn-sm btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Addimage_banner' })}><i className="fa fa-image"></i> </button>
                    </div>
                </div>
            </div>
            <div className="mb-2">
                <label className="form-label" >Type</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" disabled={disabledradio} id="Type_video" radioGroup="Upload_Type" name="Upload_Type" checked={dataModel.Upload_Type} onChange={this.onRadioChange} value={'Y'} />
                        <label className="form-check-label" htmlFor="Type_video">Video</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" disabled={disabledradio} id="Type_image" radioGroup="Upload_Type" name="Upload_Type" checked={dataModel.Upload_Type === false} onChange={this.onRadioChange} value={'N'} />
                        <label className="form-check-label" htmlFor="Type_image">Image</label>
                    </div>
                </div>
            </div>
            {dataModel.Upload_Type && <div className="mb-2">
                <label className="form-label" >Upload Manually</label>
                <div className="form-control border-0 ps-0">
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" disabled={disabledradio} id="Upload_manually_Y" radioGroup="Upload_manually" name="Upload_manually" checked={dataModel.Upload_manually} onChange={this.onRadioChange} value={'Y'} />
                        <label className="form-check-label" htmlFor="Upload_manually_Y">Yes</label>
                    </div>
                    <div className="form-check  form-check-inline">
                        <input type="radio" className="form-check-input" disabled={disabledradio} id="Upload_manually_N" radioGroup="Upload_manually" name="Upload_manually" checked={dataModel.Upload_manually === false} onChange={this.onRadioChange} value={'N'} />
                        <label className="form-check-label" htmlFor="Upload_manually_N">No</label>
                    </div>
                </div>
            </div>}
            {!dataModel.Upload_Type && <div className="mb-2">
                <label className="col-form-label pt-0" htmlFor="ImagePlaySeconds">Image Play time In seconds<span className="text-danger text-mandatory">*</span></label>
                <div className='col-md-12'>
                    <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'ImagePlaySeconds')} name="ImagePlaySeconds" value={dataModel.ImagePlaySeconds} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} prefix={4} suffix={0} maxLength={200}>
                    </cntrl.WKLTextbox>
                </div>
            </div>}
            <div className='mb-2'>
                <label className="form-label" >Sort </label>
                <cntrl.WKLTextbox name="Sort_order" value={dataModel.Sort_order} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.positive} prefix={4} suffix={0} />
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
        </form >);
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
                <div className="window-content-area p-3 vh-100">
                    <div className="container-fluid h-100 p-0">
                        <div className="row h-100">
                            <div className="col-md-7">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-2">
                                            <label className="col-form-label pt-0" htmlFor="BannerSrch">Banner</label>
                                            <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'BannerSrch')} name="BannerSrch" value={model.SearchInput.BannerSrch} onChange={this.onChangeSrch} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={400}>
                                            </cntrl.WKLTextbox>
                                        </div>
                                    </div>
                                    <div className="col-md-3 mb-2">
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
                            <div className="col-md-5 border-start">
                                {this.renderForm()}
                            </div>
                        </div>
                    </div>
                </div>
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