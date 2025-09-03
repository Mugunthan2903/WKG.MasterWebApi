import React from 'react';
import SSM161VM from './SSM161VM';
import * as cntrl from '../../../wkl-components';

const Textstyle = { width: '100%', height: '200px' };

const customFormatting = [
    ["undo", "redo"],
    ['font', 'fontSize'],
    ['paragraphStyle', 'blockquote'],
    ["bold", "underline", "italic", "strike", 'fontColor', 'hiliteColor', 'align', 'list'],
    ["outdent", "indent"],
    ['table', 'link'],
    ["removeFormat"],
    ['preview'],
];

const editorOptions = {
    charCounter: true,
    resizingBar: true,
    buttonList: customFormatting,
    defaultStyle: 'font-family: FigtreeRegular',
};

export default class SSM161 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM161VM(props));
        this.inputRefs = { header: null, childs: {} };
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
    }

    setFocus = (name) => {
        if (this.inputRefs[name] && this.inputRefs[name].focus) {
            this.inputRefs[name].focus();
        }
    }

    onRefChange(el, name) {
        this.inputRefs[name] = el;
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
                else if (action == "btn_new" || action == "btn_edit") {
                    this.VM.handleSave(e);
                }
            }
        }
    }
    onChangeEditor = (e, datamodel) => {
        console.log("onChangeEditor :", e, datamodel);
        if (this.VM) {
            const model = this.VM.Data;
            datamodel = datamodel || model;
            if (e && e.name) {
                datamodel.trm_desc = e.value;
                //datamodel[e.name] = e.value;
            }
            this.updateUI();
        }
    };

    renderHtmlEditor() {
        const model = this.VM.Data;
        const dataModel = model.GridInfo.Items;
        const columns = model.GridInfo.Columns || [];
        if (model.EditorColorList && model.EditorColorList.length > 0)
            editorOptions.colorList = [...model.EditorColorList, [''], ...model.DefaultColorList];
        else
            editorOptions.colorList = [model.DefaultColorList];

        const Tabs = [];
        columns.forEach((col) => {
            let temp = {};
            temp.title = col;
            let langItem = dataModel.find(i => i.lang_cd == col);
            temp.content = (
                <div key={col} className="row mt-3">
                    <div className="col">
                        <cntrl.WKLLabel className="form-label" text={col}></cntrl.WKLLabel>
                        <cntrl.WKLEditor
                            name={col}
                            height="400"
                            width="auto"
                            value={langItem?.trm_desc}
                            setOptions={editorOptions}
                            onChange={(ex) => this.onChangeEditor(ex, langItem)}
                        />
                    </div>
                </div>
            );
            Tabs.push(temp);
        });
        return (
            <div className="row col-md-12" >
                <cntrl.WKGTab tabs={Tabs} />
            </div>
        );
    };

    render() {
        const owner = this;
        const model = this.VM.Data;
        const dataModel = this.VM.Data.SearchInput;
        const htmldata = this.VM.Data.HtmlLayerObject;
        let showloading = false;
        let title = '';
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
        }

        return (
            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area vh-100 p-3">
                    <div className="container-fluid p-0">
                        <div className="row">
                            <div className="col-md-12">

                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col">
                                {model?.GridInfo?.Items && this.renderHtmlEditor()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
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

        );
    }
}