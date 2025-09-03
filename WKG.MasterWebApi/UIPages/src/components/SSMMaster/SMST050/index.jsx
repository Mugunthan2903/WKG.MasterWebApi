import React from 'react';
import SMST050VM from './SMST050VM';
import * as cntrl from '../../../wkl-components';

export default class SMST050 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST050VM(props));
        this.inputRefs = {};
    }
    // called on load
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
    }
    // called on closing
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };
    // handles all button clicks
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
                if (action == "btn_close") {
                    this.VM.doClose(e);
                }
            }
        }
    }
    // used to set focus for input controls based on name
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
    onChange = (e) => {
        if (this.VM) {
            console.log(e);
            const model = this.VM.Data;
            if (e.name === 'DateFlipper') {
                model.DateFlipperStart = e.start;
                model.DateFlipperEnd = e.end;
            }
            else
                model[e.name] = e.value;
            this.updateUI();
        }
    };
    //function that adds ref of input controls to the inputRefs object based on name
    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }
    onEditclick = (e, item) => {
        //if (this.VM) {
        // this.VM.openWindow();
        //}
    }
    SMSTO51click = () => {
        this.VM.openWindow("1");
    }
    SMSTO52click = () => {
        this.VM.openWindow("2");
    }
    SMSTO53click = () => {
        this.VM.openWindow("3");
    }
    columnButton = (e) => {
        return (<span><button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Exception"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={this.onEditclick}><i className="fas fa-edit" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button></span>)
    };
    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
        gridInfo.Columns[3].onRender = this.columnButton;
        const attr =
        {
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
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
    }
    render() {
        const model = this.VM.Data;
        let disableEdit = true;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;

        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <cntrl.WKLBody>
                    <div className="window-content-area p-3 vh-100" style={{ width: "60rem" }}>
                        <div className='row'>
                            <div class="accordion" id="accordionExample">
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingOne">
                                        <button class="wkl-window-header accordion-button p-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne" style={{background:"#eef2f7"}}>
                                        Section 1
                                        </button>
                                    </h2>
                                    <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                        <div class="accordion-body">
                                            <div className='row'>
                                                <div className="col-md-4 px-3">
                                                    <label className="col-form-label" htmlFor="SentenceCase">Header Text </label>
                                                    <cntrl.WKLTextbox name="SentenceCase" value={model.SentenceCase} onChange={this.onChange} placeholder="Header Text One" maxLength={20} inputType={cntrl.WKLTextboxTypes.sentenceCase} />
                                                </div>
                                                <div className="col-md-4 px-3">
                                                    <label className="col-form-label" htmlFor="SentenceCase">Content Text</label>
                                                    <cntrl.WKLTextbox name="SentenceCase" value={model.SentenceCase} onChange={this.onChange} placeholder="Header Text Two" maxLength={20} inputType={cntrl.WKLTextboxTypes.sentenceCase} />
                                                </div>
                                                <div className="col-md-4 px-3" >
                                                    <label className="col-form-label" htmlFor="Name">Image</label>
                                                    <cntrl.WKLFile isMultiFile={true} name="File" value={model.File} onChange={this.onChange} placeholder="select File" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingTwo">
                                        <button class="wkl-window-header accordion-button p-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo" style={{background:"#eef2f7"}}>
                                        Section 2
                                        </button>
                                    </h2>
                                    <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                        <div class="accordion-body">
                                            <div className='p-0'>
                                                <div className='row'>
                                                    <div className="col-md-6  mb-3 px-3">
                                                        <label className="col-form-label" htmlFor="SentenceCase">Header Text</label>
                                                        <cntrl.WKLTextbox name="SentenceCase" value={model.SentenceCase} onChange={this.onChange} placeholder="Header Text One" maxLength={20} inputType={cntrl.WKLTextboxTypes.sentenceCase} />
                                                    </div>
                                                    <div className="col-md-6  mt-3 px-3">
                                                        <div className='d-flex mt-2' style={{ justifyContent: "end", paddingTop: "10px" }}>
                                                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={this.SMSTO51click}><i className="fa fa-add"></i> Add New</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {this.renderGrid()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingThree">
                                        <button class="wkl-window-header accordion-button p-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree" style={{background:"#eef2f7"}}>
                                            Section 3
                                        </button>
                                    </h2>
                                    <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                                        <div class="accordion-body">
                                            <div className=' p-0'>
                                                <div className='row'>
                                                    <div className="col-md-6  mb-3 px-3">
                                                        <label className="col-form-label" htmlFor="SentenceCase">Header Text</label>
                                                        <cntrl.WKLTextbox name="SentenceCase" value={model.SentenceCase} onChange={this.onChange} placeholder="Header Text One" maxLength={20} inputType={cntrl.WKLTextboxTypes.sentenceCase} />
                                                    </div>
                                                    <div className="col-md-6  mt-3 px-3">
                                                        <div className='d-flex mt-2' style={{ justifyContent: "end", paddingTop: "10px" }}>
                                                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={this.SMSTO52click}><i className="fa fa-add"></i> Add New</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {this.renderGrid()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingFour">
                                        <button class="wkl-window-header accordion-button p-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour" style={{background:"#eef2f7"}}>
                                        Section 4
                                        </button>
                                    </h2>
                                    <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                                        <div class="accordion-body">
                                            <div className=' p-0'>
                                                <div className='row'>
                                                    <div className="col-md-6  mb-3 px-3">
                                                        <label className="col-form-label" htmlFor="SentenceCase">Header Text</label>
                                                        <cntrl.WKLTextbox name="SentenceCase" value={model.SentenceCase} onChange={this.onChange} placeholder="Header Text One" maxLength={20} inputType={cntrl.WKLTextboxTypes.sentenceCase} />
                                                    </div>
                                                    <div className="col-md-6  mt-3 px-3">
                                                        <div className='d-flex mt-2' style={{ justifyContent: "end", paddingTop: "10px" }}>
                                                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={this.SMSTO53click}><i className="fa fa-add"></i> Add New</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {this.renderGrid()}
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
                        <div className="col-md-5">
                        </div>
                        <div className="col border-start">
                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={'btn_save'} formID={model.FormID} onClick={this.clickAction}>
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