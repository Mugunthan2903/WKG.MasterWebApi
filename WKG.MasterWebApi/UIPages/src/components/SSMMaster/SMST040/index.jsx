import React from 'react';
import SMST040VM from './SMST040VM';
import * as cntrl from '../../../wkl-components';
import WKLGoogleMapMarker from '../../WKLGoogleMapMarker';


export default class SMST040 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST040VM(props));
        this.inputRefs = {};
        //this.containerRef = React.createRef();
    }
    // called on load
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
    }
    // updateContainerHeight = () => {
    //     const container = this.containerRef.current;
    //     container.style.height = window.innerHeight - 54 + 'px';
    // }

    // componentDidMount() {
    //     this.updateContainerHeight();
    //     window.addEventListener('resize', this.updateContainerHeight);
    // }

    // componentWillUnmount() {
    //     window.removeEventListener('resize', this.updateContainerHeight);
    // }

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
    //function that adds ref of input controls to the inputRefs object based on name
    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }
    onEditclick = (e, item) => {
        if (this.VM) {
            this.VM.openWindow();
        }
    }
    onnewclick = (e, item) => {
        if (this.VM) {
            this.VM.openWindow1();
        }
    }
    onhomeclick = (e, item) => {
        if (this.VM) {
            this.VM.openWindow2();
        }
    }
    columnButton = (e) => {
        return (<span>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Exception"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={this.onEditclick}><i className="fas fa-edit" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
        </span>)
    };
    renderGrid2() {
        const gridInfo = this.VM.Data.GridInfo1;
        gridInfo.Columns[2].onRender = this.columnButton;
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


    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
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

console.log(cntrl.Utils.ConfigInfo);

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
                    <div className="window-content-area p-3">
                        <div className='row'>
                            <div className='col-md-12'>
                                <div className='row'>
                                    <div className="col-md-5" style={{position:"sticky",top:"0px"}}>
                                        <div className="row mb-3">
                                            <div className="col-md-7">
                                                <label className="col-form-label pt-0" htmlFor="SentenceCase">Name</label>
                                                <cntrl.WKLTextbox name="SentenceCase" value={model.SentenceCase} onChange={this.onChange} placeholder="Name" maxLength={20} inputType={cntrl.WKLTextboxTypes.sentenceCase} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="col-form-label pt-0" htmlFor="SentenceCase">Status</label>
                                                <div className="col-md-3">
                                                    <input className="form-check-input ms-2" type="checkbox" name="IsSelected" checked={model.IsSelected} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                </div>
                                            </div>
                                            <div className="col-md-2 d-flex align-items-end">
                                                <button type="button" name="btn_search" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1"><i className="fa fa-search"></i> </button>
                                                <button type="button" name="btn_clear" hot-key="R" className="btn btn-sm btn-icon1 btn-primary "><i className="fa fa-refresh"></i> </button>
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <div className="col-md-12">
                                                {this.renderGrid()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='col-md-7 border-start'>
                                        <div className="col-md-12 p-0">
                                            <div className="row mb-3">
                                                <div className="col-md-8">
                                                    <label className="col-form-label pt-0" htmlFor="SentenceCase">Name</label>
                                                    <cntrl.WKLTextbox name="SentenceCase" value={model.SentenceCase} onChange={this.onChange} placeholder="Name" maxLength={20} inputType={cntrl.WKLTextboxTypes.sentenceCase} />
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="SentenceCase">Language Codes</label>
                                                    <cntrl.WKLSelect name="MultiSelects" allowClear={true} multiSelect={true} placeholder=" Select Language Codes " displayField="Text" compareKey="ID" />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="SentenceCase">Default Language</label>
                                                    <cntrl.WKLSelect name="MultiSelects" allowClear={true} multiSelect={true} placeholder=" Select Default Language" displayField="Text" compareKey="ID" />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label pt-0" htmlFor="SentenceCase">Status</label>
                                                    <div className="col-md-4">
                                                        <input className="form-check-input ms-2" type="checkbox" name="IsSelected" checked={model.IsSelected} onChange={this.onCheckChange} style={{ width: "20px", height: "20px" }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="SentenceCase">SSM Home Page</label>
                                                    <cntrl.WKLSelect name="MultiSelects" allowClear={true} multiSelect={true} placeholder="Select SSM Home Page" displayField="Text" compareKey="ID" />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="SentenceCase">End Point</label>
                                                    <cntrl.WKLSelect name="MultiSelects" allowClear={true} multiSelect={true} placeholder=" Select Default Language" displayField="Text" compareKey="ID" />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="SentenceCase">Refresh time </label>
                                                    <cntrl.WKLTextbox name="Time24hr" value={""} onChange={this.onChange} placeholder="HH:MM" maxLength={10} inputType={cntrl.WKLTextboxTypes.time24hr} />
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="SentenceCase">SSM Airport</label>
                                                    <cntrl.WKLSelect name="MultiSelects" allowClear={true} multiSelect={true} placeholder=" Select SSM Airport" displayField="Text" compareKey="ID" />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="SentenceCase">Deafult Airport </label>
                                                    <cntrl.WKLSelect name="MultiSelects" allowClear={true} multiSelect={true} placeholder=" Select Deafult Airport" displayField="Text" compareKey="ID" />
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="SentenceCase">Journey type</label>
                                                    <cntrl.WKLSelect name="MultiSelects" allowClear={true} multiSelect={true} placeholder="Select Journey type" displayField="Text" compareKey="ID" />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="SentenceCase">Car Type </label>
                                                    <cntrl.WKLSelect name="MultiSelects" allowClear={true} multiSelect={true} placeholder=" Select Car Type " displayField="Text" compareKey="ID" />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="col-form-label" htmlFor="SentenceCase">Uber All Cars </label>
                                                    <cntrl.WKLSelect name="MultiSelects" allowClear={true} multiSelect={true} placeholder=" Select Uber All Cars" displayField="Text" compareKey="ID" />
                                                </div>
                                            </div>
                                            
                                            <div className='row mb-3'>
                                            <div class="wkl-window-header p-2 mb-3"> <h5 class="mb-0">SSM</h5></div>
                                                <div className="col-md-12">
                                                    {this.renderGrid2()}
                                                </div>
                                            </div>
                                            <div className='d-flex mt-4 mb-2' style={{ justifyContent: "end" }}>
                                                <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={this.onnewclick}><i className="fa fa-add"></i> Add New SSM</button>
                                                <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={this.onhomeclick}><i className="fa fa-home"></i> Home Page config</button>
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
                            <button type="button" id="btn_new1" hot-key="N" className="btn btn-sm btn-add1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_new1' })} ><i className="fa fa-plus"></i> New</button>
                            <button type="button" id="btn_edit1" disabled={disableEdit} hot-key="M" className="btn btn-sm btn-edit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_edit1' })}> <i className="fa fa-edit"></i> Modify</button>
                            {/* <button type="button" id="btn_audit" hot-key="A" className="btn btn-sm btn-audit1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_audit' })}><i className="fa fa-history"></i> </button> */}
                        </div>
                        <div className="col border-start">
                            {/* <cntrl.WKLButtonWrapper id="btn_delete" hidden={true} formID={model.FormID} onClick={this.clickAction}>
          <button type="button" hidden={true} hot-key="X" className="btn btn-sm btn-delete1 btn-primary me-1"><i className="fa fa-trash"></i> Delete</button>
      </cntrl.WKLButtonWrapper> */}
                        </div>
                        <div className="col-auto">
                            {/* <button type="button" id={model.Input.IsEdit ? "btn_edit" : "btn_save"} hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1" onClick={(e) => this.clickAction({ id: model.Input.IsEdit ? "btn_edit" : "btn_save" })}><i className="fa fa-save"></i> Save</button> */}
                            <cntrl.WKLButtonWrapper id={'btn_save'} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                            </cntrl.WKLButtonWrapper>
                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_cancel' })}><i className="fa fa-refresh"></i> Clear</button>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
                <div>
                <WKLGoogleMapMarker apiKey={ cntrl.Utils.ConfigInfo.GmapKey||''} ref={(e) => this.onRefChange(e, 'GoogleMap')}  />

                </div>
            </cntrl.WKLControl>

        )
    }
}