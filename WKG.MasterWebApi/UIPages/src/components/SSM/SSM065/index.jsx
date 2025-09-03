import React from 'react';
import SSM065VM from './SSM065VM';
import * as cntrl from '../../../wkl-components';

export default class SSM065 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM065VM(props));
        this.VM.Data.indexThis = this;
        this.inputRefs = {};
    }
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
        const model = this.VM.Data;
        model.NotesArr = [{ note: "", sort_ordr: "", note_srl: "" }];
        model.rows = [{ note: this.VM.rendercell1(0), sort_ordr: this.VM.rendercell2(0), cell3: <button disabled={model.NotesArr[0].note_srl === ""} type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Delete"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={() => { this.VM.onDeleteclick(0) }}><i className="fas fa-trash" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button> }]
    }
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };
    onChange = (e) => {
        if (this.VM) {
            let model = this.Data.Input;
            let dataModel = this.Data;
            if (e.name)
                model[e.name] = e.value;
            else
                model[e.target.name] = e.target.value;
            this.VM.updateUI();

            if (e.name === "Language") {
                this.VM.onBlurSrch();
            }
        }
    }
    onCheckChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data.Input;
            model[e.target.name] = e.target.checked;
            this.updateUI();
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

                if (action == "btn_close") {
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
    render() {
        const model = this.VM.Data;
        const dataModel = this.VM.Data.Input;
        let disableModifiedBy = true;
        let disableLang = true;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
        }
        disableLang = dataModel.IsEdit;
        disableModifiedBy = !dataModel.IsEdit;

        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <cntrl.WKLBody>
                    <div className="window-content-area p-3 vh-100" style={{ width: "50rem" }}>
                        <div className="container-fluid h-100 p-0">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className='row'>
                                        <div className=" col-md-12">
                                            <div className='row'>
                                                <div className="col-md-5">
                                                    <label className="form-label" >Language<span className="text-danger text-mandatory">*</span></label>
                                                    <cntrl.WKLSelect name="Language" disabled={disableLang} compareKey="ID" displayField="Text" placeholder="Select Language" allowClear={true} ref={(el) => this.onRefChange(el, 'Language')} selectedItem={dataModel.Language} dataSource={model.LanguageList} onChange={this.onChange}>
                                                    </cntrl.WKLSelect>
                                                </div>
                                                <div className=" col-md-7">
                                                    <label className="form-label" >Product Name</label>
                                                    <div className='col-md-12'>
                                                        <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'Prod_Name')} name="Prod_Name" value={dataModel.Prod_Name} placeholder="Enter Product Name" onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
                                                        </cntrl.WKLTextbox>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className=" col-md-12 mt-2">
                                            <label className="form-label" >Info Head</label>
                                            <div className='col-md-12'>
                                                <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'info_Head')} name="info_Head" value={dataModel.info_Head} placeholder="Enter Info Head" onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={800}>
                                                </cntrl.WKLTextbox>
                                            </div>
                                        </div>
                                        <div className=" col-md-12 mt-2">
                                            <label className="form-label" >Info Description</label>
                                            <div className='col-md-12'>
                                                <textarea name={"info_Des"} style={{ resize: "none" }} ref={(el) => this.onRefChange(el, 'info_Des')} value={dataModel.info_Des} onChange={this.onChange} placeholder="Enter Info Description" className="form-control" rows="5" maxLength={4000}></textarea>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <table className="table" style={{ border:"1px solid lightgray" }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "70%" }}>Notes</th>
                                                        <th style={{ width: "25%" }}>Sort</th>
                                                        <th style={{ width: "5%" }} ></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {model.rows.map((row, index) => (
                                                        <tr  className="p-5" key={index}>
                                                            <td>{row.note}</td>
                                                            <td onFocus={(e) => this.VM.handleFocus(index, e)} className="sort_ordr">{row.sort_ordr}</td>
                                                            <td  style={{ textAlign: "left",padding:"10px" }}>{row.cell3}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="col-md-12 mt-4">
                                            <div className='row' hidden={disableModifiedBy}>
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