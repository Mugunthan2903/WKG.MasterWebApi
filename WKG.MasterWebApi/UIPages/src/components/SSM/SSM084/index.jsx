import React from 'react';
import SSM084VM from './SSM084VM';
import * as cntrl from '../../../wkl-components';

class SSM084 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM084VM(props));
        this.inputRefs = { header: null, childs: {} };
    }
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
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
    onChangeImg = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            if (e.name) {
                model.Image_Array = e.files;
                model.WKLImage_Url = null;
                model[e.name] = e.value;
            }
            this.VM.onBlurCheck(e.value);
            console.log("Image ", model.Image_Array, model[e.name])
            this.updateUI();
        }
    };
    onCheckChange = (e) => {
        if (this.VM) {
            let model = this.VM.Data.Input;
            model[e.target.name] = e.target.checked;
            this.updateUI();
        }
    };
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    }

    setFocus = (name) => {
        if (this.inputRefs[name] && this.inputRefs[name].focus) {
            this.inputRefs[name].focus();
        }
    }

    onRefChange = (el, name) => {
        this.inputRefs[name] = el;
    }

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
                if (action === "btn_close") {
                    this.VM.doClose(e);
                }
                else if (action == "btn_cancel") {
                    this.VM.handleSearchClear();
                }
                else if (action == "sec2_New") {
                    this.VM.openWindow("sec2_New");
                }
                else if (action == "btn_sec") {
                    this.updateUI();
                }
                else if (action == "btn_save" || action == "btn_edit") {
                    this.VM.handleSave();
                }
                else if (action === "btn_remove") {
                    this.VM.handleDelete();
                }
                else if (action === "btn_Addimg_lp") {
                    this.VM.openWindow("btn_Addimg_lp");
                }
            }
        }
    }
    onGridCellClick = (e, item) => {
        if (this.VM) {
            this.VM.setSelectedItem(e.row);
            this.updateUI();
        }
    }

    onPageChange = (e, type, val) => {
        if (this.VM) {
            this.VM.loadPage(e.value, e.columnOptions);
        }
    }
    onEditclick = (e) => {
        if (this.VM) {
            this.VM.onEditclick(e);
        }
    }
    columnEditButton = (e) => {
        return (<span>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Edit"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={() => { this.onEditclick(e.row) }}><i className="fas fa-edit" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
        </span>)
    };
    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
        gridInfo.Columns[2].onRender = this.columnEditButton;
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
            //onGridCellDoubleClick: this.onGridCellDoubleClick,
            //onSortChange: this.onSortChange,
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
    }

    render() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;
        let title = "";
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
        }



        return (

            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area w-100 vh-100 p-3" style={{ width: "55rem" }}>
                    <div className="container-fluid h-100 p-0">
                        <div className='row'>
                            <div class="accordion" id="accordionExample" style={{ width: "53rem" }}>
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingTwo">
                                        <button onClick={(e) => this.clickAction({ id: 'btn_sec' })} data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo" class="wkl-window-header accordion-button p-2" type="button" style={{ background: "#eef2f7" }}>
                                            Name
                                        </button>
                                    </h2>
                                    <div id="collapseTwo" class="accordion-collapse collapse show" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                        <div class="accordion-body p-2">
                                            <div className='row'>
                                                <div className="col-md-12 mb-3 px-3">
                                                    <div className='d-flex' style={{ justifyContent: "end", paddingTop: "10px" }}>
                                                        <button type="button" id="btn_add_new" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'sec2_New' })}><i className="fa fa-add"></i> Add New</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-md-12'>
                                                {this.renderGrid()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingThree">
                                        <button onClick={(e) => this.clickAction({ id: 'btn_sec' })} class="wkl-window-header accordion-button p-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree" style={{ background: "#eef2f7" }}>
                                            Image
                                        </button>
                                    </h2>
                                    <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                                        <div class="accordion-body p-2">
                                            <div className='row'>
                                                <div className="col-md-6" >
                                                    <label className="col-form-label" >WKL</label>
                                                    <div className="col-md-12 d-flex justify-content-between">
                                                        <div className="col-md-10">
                                                            <cntrl.WKLFile isMultiFile={false} accept='image/*' name="WKLImage_Upload" value={model.WKLImage_Upload} onChange={this.onChangeImg} placeholder="Select Image" />
                                                        </div>
                                                        <div className="col-md-2 px-2">
                                                            <button style={{ height: "33px" }} type="button" id="btn_Addimg_lp" hot-key="L" className="btn btn-sm btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_Addimg_lp' })}><i className="fa fa-image"></i> </button>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 border mt-1" style={{ height: "160px" }}>
                                                        {model.WKLImage_Url == "" ?
                                                            <img src="" style={{ height: "160px", width: "100%" }}></img> : <img src={model.WKLImage_Url} style={{ height: "160px", width: "100%", objectFit: 'cover' }}></img>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row" style={{ justifyContent: "end" }}>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={this.VM.Data.IsEdit ? 'btn_edit' : 'btn_save'} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            </cntrl.WKLButtonWrapper>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>

                    </div>
                </div>
            </cntrl.WKLControl>

        );
    }
}

export default SSM084;