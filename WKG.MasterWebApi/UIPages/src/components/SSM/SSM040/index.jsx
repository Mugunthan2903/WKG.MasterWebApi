import React from 'react';
import SSM040VM from './SSM040VM';
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

export default class SSM040 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM040VM(props));
        this.inputRefs = {};

    }
    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
    }

    onChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            if (e.name)
                model[e.name] = e.value;
            else if (e.target && e.target.name)
                model[e.target.name] = e.target.value;
            this.updateUI();
            this.VM.handleSearch();
        }
    };

    onChangeLang = (e, item) => {
        if (this.VM) {
            const model = this.VM.Data;
            if (e.target && e.target.innerText) {
                model.TypeCodes = item;
                model.TypeCodeText = e.target.innerText;
            }
            this.updateUI();
            this.VM.handleSearch();
        }
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

                if (action === "btn_search") {
                    this.VM.handleSearch();
                }
                else if (action == "btn_clear") {
                    this.VM.handleSearchClear();
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
                else if (action === "btn_layer_ok") {
                    this.VM.handleLayerClose(action);
                }
            }
        }
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
    handleOpenLayer = (e, datamodel) => {
        if (this.VM) {
            const model = this.VM.Data;
            if (model.TypeCodes.html_data) {
                model.ShowHtmlEditor = true;
                model.HtmlLayerObject.event = e;
                model.HtmlLayerObject.item = datamodel || {};
            }
            else {
                model.ShowLayer = true;
                model.EditLayerObject.event = e;
                model.EditLayerObject.item = datamodel || {};
            }
            this.updateUI();
        }
    }

    addRow = (field, e) => {
        const model = this.VM.Data;
        let DataCopyGrid = JSON.parse(model.DataCopy);
        DataCopyGrid = DataCopyGrid.map((item) => item.data_srl == "" ? ({ ...item, last: false }) : item);

        if (!cntrl.Utils.isNullOrEmpty(model.TypeCodes)) {
            if (model.TypeCodes.attr) {
                let NewObj = {};
                model.GridInfo.Columns.forEach(element => {
                    if (element.text === "Type Code") {
                        NewObj[element.field] = model.TypeCodes.ID;
                    }
                    else {
                        NewObj[element.field] = '';
                    }
                });
                NewObj.last = true;
                model.GridInfo.Items.push(NewObj);
                DataCopyGrid.push(NewObj);
            }
            model.DataCopy = JSON.stringify(DataCopyGrid);
        }
    }
    handleFocus = (e, field, index) => {
        const model = this.VM.Data;
        const DataCopy = model.DataCopyfilter;
        if (e.row.data_srl == "" && index === 2 && e.row.last == true) {
            e.row.last = false;
            this.addRow(field, e);
        }
        this.updateUI();
    };
    onChangegridtext = (e, datamodel) => {

        if (this.VM) {
            const model = this.VM.Data;
            datamodel = datamodel || model;
            datamodel[e.name] = e.value;

            this.updateUI();
        }
    };
    Textboxview = (e, field, index) => {
        const model = this.VM.Data;
        const disabletext = model.TypeCodes?.multiline;
        return (<cntrl.WKLTextbox name={field} disabled={disabletext} events={{ onBlur: () => this.handleFocus(e, field, index) }} style={Textstyle} id={e.row.data_srl} maxLength={1000} displayField="Text" ref={(el) => this.onRefChange(el, `${field}`)} value={e.row[field]} onChange={(ex) => this.onChangegridtext(ex, e.row)}>
        </cntrl.WKLTextbox>);

    };
    hyperLinkView = (e, field) => {
        const model = this.VM.Data;
        return (<a href="#" style={{ cursor: "pointer" }} onClick={(ex) => this.handleOpenLayer(ex, e.row)}>{e.row[field]}</a>);
    };
    onFilterChange = (col) => {
        const model = this.VM.Data;
        const DataCopy = model.DataCopyfilter;
        const gridInfo = model.GridInfo;
        const columns = gridInfo.Columns;
        let filterdDataSource = DataCopy || [];
        columns.forEach(colObj => {
            if (!cntrl.Utils.isNullOrEmpty(colObj.term) && colObj.term.length > 0) {
                let filterType = '~';
                if (colObj.filterType)
                    filterType = colObj.filterType;
                switch (filterType) {
                    case '~':
                        switch (colObj.dataType || 'string') {
                            case 'string': filterdDataSource = filterdDataSource.
                                where(row => row[colObj.field]?.toString().toLowerCase().includes(colObj.term.toString().toLowerCase()));
                                break;
                            default: filterdDataSource = filterdDataSource.
                                where(row => row[colObj.field]?.toString().toLowerCase().includes(colObj.term.toString().toLowerCase())); break;
                        }
                        break;
                }
            }
        });
        gridInfo.Items = filterdDataSource;
        model.DataCopy = JSON.stringify(filterdDataSource);
        this.VM.updateUI();
    }

    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }

    renderGrid(e, field) {
        const model = this.VM.Data;
        const gridInfo = this.VM.Data.GridInfo;
        if (gridInfo.Columns?.length > 0) {
            gridInfo.Columns.forEach((e, i) => {
                if (e.field === 'data_srl' || e.field === 'data_typ_cd') {
                    if (e.field === 'data_srl' && model.TypeCodes && (model.TypeCodes.multiline || model.TypeCodes.html_data )) {
                        e.onRender = (_e) => this.hyperLinkView(_e, e.field);
                    }
                }
                else if (e.field === "data_cd" && model.TypeCodes?.ID === "DSTRBSNINF") {

                }
                else {
                    e.onRender = (_e) => this.Textboxview(_e, e.field, i);

                }
            })
        }

        const attr =
        {
            cachedSource: null,
            showFilter: true,
            externalFilter: true,
            footerClass: model.FormID,
            rowHeight: 35,
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
            onFilterChange: this.onFilterChange,
            colResize: true
        };
        return (<cntrl.WKLGrid {...attr} />);
    }
    onChangeLayer = (e, datamodel) => {

        if (this.VM) {
            const model = this.VM.Data;
            datamodel = datamodel || model;
            if (e.target && e.target.name) {
                datamodel[e.target.name] = e.target.value;
            }
            this.updateUI();
        }
    };
    renderLayer(e, datamodel) {
        const model = this.VM.Data;
        const dataModel = datamodel || {};
        const columns = model.GridInfo.Columns || [];
        return (
            <div className="row p-3 col-md-12">
                {columns.map(element => {
                    if (element.field === "data_srl") {
                        return (
                            <div className='col-md-12 p-1'>
                                <cntrl.WKLLabel className="form-label" text={'ID'}></cntrl.WKLLabel>
                                <textarea className="form-control" disabled={true} name={element.field} maxlength="1000" style={{ resize: "none" }} ref={(el) => this.onRefChange(el, `${element.field}`)} value={dataModel[element.field]} rows="1" ></textarea>
                            </div>
                        );
                    }
                    else if (element.field !== "data_srl" && element.field !== "data_typ_cd") {
                        return (
                            <div className='col-md-12 p-1'>
                                <cntrl.WKLLabel className="form-label" text={element.text}></cntrl.WKLLabel>
                                <textarea className="form-control" name={element.field} style={{ resize: "none" }} maxlength="1000" ref={(el) => this.onRefChange(el, `${element.field}`)} value={dataModel[element.field]} onChange={(ex) => this.onChangeLayer(ex, dataModel)} rows="5" ></textarea>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        )
    }

    onChangeEditor = (e, datamodel) => {
        if (this.VM) {
            const model = this.VM.Data;
            datamodel = datamodel || model;
            if (e && e.name) {
                datamodel[e.name] = e.value;
            }
            this.updateUI();
        }
    };

    renderHtmlEditor(e, dataModel) {
        const model = this.VM.Data;
        const columns = model.GridInfo.Columns || [];
        if (model.EditorColorList && model.EditorColorList.length > 0)
            editorOptions.colorList = [...model.EditorColorList, [''], ...model.DefaultColorList];
        else
            editorOptions.colorList = [model.DefaultColorList];

        const Tabs = [];
        let eng_data = { title: "en_GB", content: null };
        let html = [];
        columns.forEach((col) => {
            let temp = {};
            if (col.field !== "data_srl" && col.field !== "data_typ_cd") {
                if (col.field === "data_cd" && model.TypeCodes.ID === "DSTRBSNINF")
                    return;
                if (col.field === "data_cd" && model.TypeCodes.ID === "DSTRBSNEXT") {
                    html.push(
                        <div key={col.field} className="col-md-12 mb-3 mt-3">
                            <cntrl.WKLLabel className="form-label" text={col.text} />
                            <cntrl.WKLTextbox
                                name={col.field}
                                value={dataModel[col.field]}
                                onChange={(ex) => this.onChangeEditor(ex, dataModel)}
                                inputType={cntrl.WKLTextboxTypes.sentenceCase}
                                maxLength={100}
                            />
                        </div>
                    );
                } else if (col.field === "en_GB") {
                    html.push(
                        <div key={col.field} className="col-md-12">
                            <cntrl.WKLLabel className="form-label" text={col.text}></cntrl.WKLLabel>
                            <cntrl.WKLEditor
                                name={col.field}
                                height={`${model.TypeCodes.ID === "DSTRBSNEXT" ? '200' : '250'}`}
                                width="auto"
                                value={dataModel[col.field]}
                                setOptions={editorOptions}
                                onChange={(ex) => this.onChangeEditor(ex, dataModel)}
                            />
                        </div>
                    );
                } else {
                    temp.title = col.text;
                    temp.content = (
                        <div key={col.field} className="row mt-3">
                            <div className="col">
                                <cntrl.WKLLabel className="form-label" text={col.text}></cntrl.WKLLabel>
                                <cntrl.WKLEditor
                                    name={col.field}
                                    height="250"
                                    width="auto"
                                    value={dataModel[col.field]}
                                    setOptions={editorOptions}
                                    onChange={(ex) => this.onChangeEditor(ex, dataModel)}
                                />
                            </div>
                        </div>
                    );
                    Tabs.push(temp);
                }
            }
        });

        if (html.length > 0) {
            eng_data.content = <div className="row">{html}</div>;
        }
        Tabs.unshift(eng_data);

        return (
            <div className="row col-md-12" >
                <cntrl.WKGTab tabs={Tabs} />
            </div>
        );
    };

    render() {
        const owner = this;
        const model = this.VM.Data;
        const gridInfo = this.VM.Data.GridInfo;
        const layerdata = this.VM.Data.EditLayerObject;
        const htmldata = this.VM.Data.HtmlLayerObject;
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
                    <div className="window-content-area vh-100 p-3">
                        <div className="row mb-3">
                            {/* <div className="col-md-3">
                                    <label className="col-form-label pt-0" htmlFor="Grp_NameSrch">Language Type</label>
                                    <cntrl.WKLSelect name="TypeCodes" compareKey="ID" isMultiCol={true} displayField="Text" placeholder="Select Type" allowClear={false} ref={(el) => this.onRefChange(el, 'TypeCodes')} selectedItem={model.TypeCodes} dataSource={model.TypeCodesList} onChange={this.onChange}>
                                    </cntrl.WKLSelect>
                                </div> */}
                            <div className="col-md-3">
                                <label className="col-form-label pt-0" htmlFor="Grp_NameSrch">Language Type</label>
                                <cntrl.WKLCombobox name="TypeCodes" placeholder="Select Language Type" ref={(el) => this.onRefChange(el, 'TypeCodes')} value={model.TypeCodeText} showBorder={true} openOnFocus={false} >
                                    <div style={{
                                        backgroundColor: "rgb(255, 255, 255)",
                                        height: "300px",
                                        border: "1px solid rgb(216, 213, 213)",
                                        overflowY: "auto",
                                        overflowX: "hidden",
                                        padding: "10px"
                                    }}>
                                        {(model.TypeCodeComboList && model.TypeCodeComboList.length > 0) && model.TypeCodeComboList.map((item, index) => {
                                            const Items = item.Items;
                                            const temp = model.GroupList[item.Key];

                                            if (!temp) return null;

                                            const heading = temp?.Item1 || null;
                                            return (
                                                <div key={index}>
                                                    <h6 onClick={(_e) => _e.stopPropagation()}><strong>{heading}</strong></h6>
                                                    {
                                                        (Items && Items.length > 0) && Items.map((item2, jindex) => (
                                                            <p key={jindex}
                                                                className="ms-2"
                                                                style={{
                                                                    color: `${model.TypeCodes?.ID === item2.ID ? "#ffff" : "inherit"}`,
                                                                    backgroundColor: `${model.TypeCodes?.ID === item2.ID ? "#008bb280" : "inherit"}`,
                                                                    padding: "0px",
                                                                    cursor: "pointer",
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.backgroundColor = "#9fd3e2";
                                                                    e.target.style.color = "#fff";
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.backgroundColor = model.TypeCodes?.ID === item2.ID ? "#008bb280" : "inherit";
                                                                    e.target.style.color = model.TypeCodes?.ID === item2.ID ? "#fff" : "inherit";
                                                                }}
                                                                onClick={(_e) => this.onChangeLang(_e, item2)}>
                                                                {item2.Text}
                                                            </p>
                                                        ))
                                                    }
                                                </div>
                                            );
                                        })}
                                    </div>
                                </cntrl.WKLCombobox>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button type="button" name="btn_search" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_search' })}><i className="fa fa-search"></i> </button>
                                <button type="button" name="btn_clear" hot-key="R" className="btn btn-sm btn-icon1 btn-primary " onClick={(e) => this.clickAction({ id: 'btn_clear' })}><i className="fa fa-refresh"></i> </button>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-3 mb-3" hidden={model.CarriageDisable}>
                                <label className="col-form-label pt-0" hidden={model.CarriageDisable} htmlFor="Grp_NameSrch">Distribusion Carriage</label>
                                <cntrl.WKLSelect name="CarriageTypes" hidden={model.CarriageDisable} compareKey="ID" displayField="Text" placeholder="Select Distribusion Carriage" allowClear={false} ref={(el) => this.onRefChange(el, 'CarriageTypes')} selectedItem={model.CarriageTypes} dataSource={model.CarriageTypesList} onChange={this.onChange}>
                                </cntrl.WKLSelect>
                            </div>
                        </div>
                        {model.ShowHtmlEditor ? this.renderHtmlEditor(htmldata.event, htmldata.item) : (model.ShowLayer ? this.renderLayer(layerdata.event, layerdata.item) : this.renderGrid())}
                    </div>
                </cntrl.WKLBody >
                <div className="window-button-area">
                    <div className="row">
                        <div className="col ">
                        </div>
                        {(model.ShowLayer || model.ShowHtmlEditor) ?
                            <div className="col-auto">
                                <button id={'btn_layer_ok'} type="button" hot-key="S" onClick={(e) => this.clickAction({ id: 'btn_layer_ok' })} style={{ fontSize: "14px" }} className="btn btn-sm btn-save1 btn-primary me-1 px-5 py-2"><i className="fa fa-check px-1"></i>OK</button>
                            </div> :
                            <div className="col-auto">
                                <cntrl.WKLButtonWrapper id={'btn_save'} formID={model.FormID} onClick={(e) => this.clickAction({ id: 'btn_new' })}>
                                    <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Save</button>
                                </cntrl.WKLButtonWrapper>
                                <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                            </div>
                        }
                    </div>
                </div>

            </cntrl.WKLControl >);
    }
}

