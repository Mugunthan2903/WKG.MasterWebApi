import React from 'react';
import SMPL001VM from './SMPL001VM';
import * as cntrl from '../../../wkl-components';

const style = { width: '200px', maxWidth: '200px' };
const styleCC = { width: '400px', maxWidth: '400px' };

export default class Sample extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMPL001VM(props));
        this.inputRefs = { header: null, childs: {} };
    }
    onLoad = () => {
        if (this.VM) {
            this.VM.loadInitialData();
        }
    };
    onClosing = (e) => {
        if (this.VM)
            this.VM.doClose();
        return false;
    };
    setFocus = (name) => {
        if (this.inputRefs[name] && this.inputRefs[name].focus)
            this.inputRefs[name].focus();
    };
    onRefChange = (el, name) => {
        this.inputRefs[name] = el;
    };
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
    clickAction = (e, dataModel) => {
        if (this.VM) {
            if (e) {
                try {
                    const evt = e.event || e;
                    if (evt && evt.stopPropagation) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        evt.nativeEvent.stopImmediatePropagation();
                    }

                } catch (ex) { }
            }
            let name = e.id;
            if (name === undefined && e.target) {
                name = e.target.name || e.target.id || '';
                e = undefined;
            }

            if (name === 'btn_close') {
                this.VM.doClose();
            }
            else if (name === 'btn_alert') {
                this.VM.doShowMessageBox();
            }
            else if (name === 'btn_clear') {
                this.VM.clear();
            }
            else if (name === 'btn_confirmation') {
                this.VM.doShowConfirmationMessageBox();
            }
            else if (name === 'btn_open_window') {
                this.VM.openWindow();
            }
            else if (name === 'btn_add_tab') {
                this.VM.openTab();
            }
            else if (name === 'btn_show_report') {
                this.VM.openReportViewer();
            }
            else if (name === 'btn_close') {
                this.VM.doClose();
            }
        }
    };
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };
    selectRemoteSearch = (term) => {
        var dataInfo = { Text: term };
        return cntrl.Utils.search({ url: 'Sample/GetSearchDataAsync', data: dataInfo });
    }
    onGridCellClick = (e) => {
        const model = this.VM.Data;
        model.GridInfo.SelectedItem = e.row;
        this.updateUI();
    }
    onGridCellDoubleClick = (e) => {
        const model = this.VM.Data;
        model.GridInfo.SelectedItem = e.row;
        this.updateUI();
    }
    onPageChange = (e) => {

        this.VM.loadPage(e.value, e.columnOptions);
    }
    onSortChange = (e) => {
        const gridInfo = this.VM.Data.GridInfo;
        this.VM.loadPage(1, e.columnOptions);

    }

    columnCheckBox = (e) => {
        return (<input class="form-check-input" type="checkbox" name="IsSelected" checked={e.row.IsSelected === true} onChange={(ex) => this.onCheckChange(ex, e.row, e.dataSource)} />)
    };
    headerColumnCheckBox = () => {
        const model = this.VM.Data;
        return (<input class="form-check-input" type="checkbox" name="AllSelected" checked={model.AllSelected === true} onChange={(e) => this.onCheckChange(e)} />)
    };

    renderGrid() {
        const gridInfo = this.VM.Data.GridInfo;
        gridInfo.Columns[0].onRender = this.columnCheckBox;
        gridInfo.Columns[0].text = this.headerColumnCheckBox();
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
    render() {
        const model = this.VM.Data;
        let showLoading = false

        const tooltip = (<span>Tooltip React component</span>);
        let startDate = new Date("01 Jan 2024");
        let endDate = new Date("31 Dec 2024");


        return (<cntrl.WKLControl hideTitleBar={true} loading={model.Loading} title="Gateway payments"
            onClose={this.onClosing} context={this.props.context}>
            <div className="window-header col-auto">
                <span className="title">Control Sample</span>
            </div>
            <cntrl.WKLBody>
                <div className="window-content-area p-1">
                    <div className="container-fluid">
                        <form>
                            <div className='row'>
                                <button style={style} type="button" id="btn_alert" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_alert' })}><i className="fa fa-refresh"></i> Alert</button>
                                <button style={style} type="button" id="btn_confirmation" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_confirmation' })}><i className="fa fa-refresh"></i> Confirmation</button>

                                <button style={style} type="button" id="btn_clear" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_clear' })}><i className="fa fa-refresh"></i> Clear</button>
                                <button style={style} type="button" id="btn_open_window" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_open_window' })}><i className="fa fa-refresh"></i> Open Window</button>
                                <button style={style} type="button" id="btn_add_tab" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_add_tab' })}><i className="fa fa-refresh"></i> Add Tab</button>
                                <cntrl.WKLButtonWrapper formID="SMPL001" id="btn_user_access" onClick={this.clickAction}>
                                    <button style={style} type="button" id="btn_close" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" ><i className="fa fa-refresh"></i> User Access</button>
                                </cntrl.WKLButtonWrapper>
                                <button style={style} type="button" id="btn_show_report" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1 col-auto" onClick={(e) => this.clickAction({ id: 'btn_show_report' })}><i className="fa fa-refresh"></i> Show Report</button>
                            </div>
                            <div className='row'>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="Name">Name</label>
                                    <cntrl.WKLTextbox name="Name" value={model.Name} onChange={this.onChange} placeholder="Name" maxLength={50} inputType={cntrl.WKLTextboxTypes.textbox} />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="Name">Numeric</label>
                                    <cntrl.WKLTextbox name="Numeric" value={model.Numeric} onChange={this.onChange} placeholder="Numeric" prefix={3} suffix={2} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="AlphaNumeric">Alpha Numerc</label>
                                    <cntrl.WKLTextbox name="AlphaNumeric" value={model.AlphaNumeric} onChange={this.onChange} placeholder="AlphaNumeric" maxLength={10} inputType={cntrl.WKLTextboxTypes.alphaNumeric} />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="Alphabets">Alphabets</label>
                                    <cntrl.WKLTextbox name="Alphabets" value={model.Alphabets} onChange={this.onChange} placeholder="Alphabets" maxLength={10} inputType={cntrl.WKLTextboxTypes.alphabets} />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="Time">Time</label>
                                    <cntrl.WKLTextbox name="Time" value={model.Time} onChange={this.onChange} placeholder="Time" maxLength={10} inputType={cntrl.WKLTextboxTypes.time} />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="Time24hr">24 Time</label>
                                    <cntrl.WKLTextbox name="Time24hr" value={model.Time24hr} onChange={this.onChange} placeholder="Time24hr" maxLength={10} inputType={cntrl.WKLTextboxTypes.time24hr} />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="TitleCase">Title Case</label>
                                    <cntrl.WKLTextbox name="TitleCase" value={model.TitleCase} onChange={this.onChange} placeholder="Title Case" maxLength={20} inputType={cntrl.WKLTextboxTypes.titleCase} />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="SentenceCase">Sentence Case</label>
                                    <cntrl.WKLTextbox name="SentenceCase" value={model.SentenceCase} onChange={this.onChange} placeholder="Sentence Case" maxLength={20} inputType={cntrl.WKLTextboxTypes.sentenceCase} />
                                </div>
                            </div>
                            <div className='row'>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="SingleSelect">Single Select</label>
                                    <cntrl.WKLSelect name="SingleSelect" allowClear={true} selectedItem={model.SingleSelect} onChange={this.onChange} dataSource={model.SingleSelectList} placeholder="Please select " displayField="Text" compareKey="ID" />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="MultiSelects">Multi Selects</label>
                                    <cntrl.WKLSelect name="MultiSelects" allowClear={true} multiSelect={true} selectedItem={model.MultiSelects} onChange={this.onChange} dataSource={model.MultiSelectList} placeholder="Please select " displayField="Text" compareKey="ID" />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="RemoteSelect">Remote Select</label>
                                    <cntrl.WKLSelect minChar={3} name="RemoteSelect" allowClear={true} selectedItem={model.RemoteSelect} onChange={this.onChange} asyncSearch={this.selectRemoteSearch} placeholder="Please select " displayField="Text" compareKey="ID" />
                                </div>
                            </div>
                            <div className='row'>
                                <div className="col-auto" style={styleCC}>
                                    <label className="col-form-label" htmlFor="CreditCard">Credit Card</label>
                                    <cntrl.WKLCardInput name="CreditCard" value={model.CreditCard} onChange={this.onChange} placeholder="select Credit Card" />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="ColorPicker">Color Picker</label>
                                    <cntrl.WKLColorPicker name="ColorPicker" value={model.ColorPicker} onChange={this.onChange} placeholder="select color" />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="Name">Datepicker</label>
                                    <cntrl.WKLDatepicker startDate={startDate} endDate={endDate} name="Datepicker" value={model.Datepicker} onChange={this.onChange} placeholder="select Datepicker" />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="Name">File</label>
                                    <cntrl.WKLFile isMultiFile={true} name="File" value={model.File} onChange={this.onChange} placeholder="select File" />
                                </div>
                                <div className="col-auto" style={style}>
                                    <label className="col-form-label" htmlFor="DateFlipper">DateFlipper</label>
                                    <cntrl.WKLDateFlipper name="DateFlipper" start={model.DateFlipperStart} end={model.DateFlipperEnd} onChange={this.onChange} placeholder="select DateFlipper" />
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col'>
                                    <cntrl.WKLEditor height="300px" value={model.HtmlEditor} onChange={this.onChange} />
                                </div>
                                <div className='col'>
                                    {this.renderGrid()}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </cntrl.WKLBody>
            <div className="window-button-area col-auto">
                <div className="row">
                    <div className="col-md-5">

                    </div>
                    <div className="col border-start">

                    </div>
                    <div className="col-auto">
                        <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={this.clickAction}><i className="fa fa-close"></i> Close</button>
                    </div>
                </div>
            </div>
        </cntrl.WKLControl>);
    }
}