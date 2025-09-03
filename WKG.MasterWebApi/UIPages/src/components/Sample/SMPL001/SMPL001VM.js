import * as cntrl from '../../../wkl-components';


export default class SMPL001VM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this.init();
    }

    init() {
        const model = this.Data;
        if (Object.keys(model).length !== 0)
            return;

        model.Loading = true;



        model.Name = '';
        model.Numeric = 0;
        model.AlphaNumeric = '';
        model.Alphabets = '';
        model.Time = '';
        model.Time24hr = '';
        model.TitleCase = '';
        model.SentenceCase = '';

        model.SingleSelect = null;
        model.SingleSelectList = [{ ID: 'SLT1', Text: 'Single 1' }, { ID: 'SLT2', Text: 'Single 2' }, { ID: 'SLT3', Text: 'Single 3' }];


        model.MultiSelects = null;
        model.MultiSelectList = [{ ID: 'SLT1', Text: 'Multi select 1' }, { ID: 'SLT2', Text: 'Multi select 2' }, { ID: 'SLT3', Text: 'Multi select 3' }];
        model.RemoteSelect = null;

        model.CreditCard = '';
        model.ColorPicker = '';
        model.Datepicker = null;
        model.File = null;
        model.SelectedGridItem = null;


        model.DateFlipperStart = new Date("01 Jan 2024");
        model.DateFlipperEnd = new Date("31 Dec 2024");

        model.HtmlEditor = '';

        model.AllSelected = false;

        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 10 };

        model.GridInfo.Columns = [
            { text: '', field: 'Text', width: '25px' },
            { text: 'Name', field: 'Name', width: '59%', sort: { enabled: true } },
            { text: 'Age', field: 'Age', width: '30%' }
        ];;


        if (this.props.data && this.props.data.InputData) {
            alert(this.props.data.InputData);
        }
    }
    setSelectedItem(item) {
        this.Data.SelectedGridItem = item;
    }
    loadInitialData() {
        this.loadPage(1);
    }
    loadPage(pageIndex, columnOptions = null) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageNo = pageIndex;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.NameAsc = null;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "Name" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.NameAsc = itm.sort === 'asc';
                }
            }
        }
        model.Loading = true;
        model.AllSelected = false;
        this.updateUI();
        cntrl.Utils.ajax({ url: `Sample/GetPageDataAsync`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                me.fillSearchResult(r || {}, selectedItem);
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }
    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items || [];
        gridInfo.Page = r.CurrentPage || 0;
        gridInfo.TotalPage = r.TotalPages || 0;
        gridInfo.TotalCount = r.TotalCount || 0;
        if (gridInfo.Items.length > 0) {
            if (selectedItem !== undefined && selectedItem !== null) {
                selectedItem = gridInfo.Items.first(i => i.ID == selectedItem.ID);
            }
            if (selectedItem === null)
                selectedItem = gridInfo.Items[0];
        }

        if (selectedItem != null)
            selectedItem.isSelected = true;
        gridInfo.SelectedItem = selectedItem;
    }
    showAlert(errorMsg, name) {
        if (typeof errorMsg === 'number')
            errorMsg = cntrl.Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,//Please enter the rate name
            messageboxType: cntrl.WKLMessageboxTypes.question
        };
        if (name) {
            opt.onClose = (_e) => {
                //me.setFocus(name, index, subIndex);
            }
        }
        this.showMessageBox(opt);
    }
    doClose() {
        this.close({ Saved: true, Msg: 'Closing message' });
    }

    /* */
    doShowMessageBox() {
        this.showAlert('Hello world!');
    }
    doShowConfirmationMessageBox() {
        this.showMessageBox({
            text: 'Please choose option',
            buttons: [{ text: 'Alert 1' }, { text: 'Alert 2' }, { text: 'Alert 3' }],
            messageboxType: cntrl.WKLMessageboxTypes.question,
            onClose: (_e) => {
                try {
                    alert(`Selected is ${_e}`);
                } catch (ex) { }
                finally {
                }
            }
        });
    }

    clear() {
        const model = this.Data;
        model.SingleSelect = { ID: 'SLT2', Text: 'select 2' };
        //model.MultiSelects = [{ ID: 'SLT2', Text: 'Multi select 2' }];

        model.MultiSelects = model.MultiSelectList.where(i => i.ID === 'SLT2');

        for (const itm of model.MultiSelects) {
            itm.isSelected = false;
        }
        this.updateUI();
    }
    openWindow() {
        this.showWindow({
            url: 'Sample/SMST002',
            data: { InputData: 'Window Welcome' },
            windowStyle: cntrl.WKLWindowStyles.slideLeft, onClose: (e) => {
                if (e)
                    alert(`On window close Data: ${JSON.stringify(e)}`);

            }
        });
    }
    openTab() {
        this.addTab({
            title: 'Tab tooltip', text: 'Tab Caption', key: 'Sample2', url: 'Sample/SMPL001', data: { InputData: 'Window Welcome' },
            onClose: (e) => {
                if (e)
                    alert(`On tab close Data: ${JSON.stringify(e)}`);

            }, isClosable: true/*, destroyOnHide: false, closeAndOpen: false*/
        });
    }

    openReportViewer() {
        const opt = {
            className: `SampleBO`,
            flag: 'DATA',
            data: null,
            //reportWindowType: isPDF === true ? cntrl.ReportWindowTypes.Download : cntrl.ReportWindowTypes.MainTab,
            reportWindowType: cntrl.ReportWindowTypes.MainTab,
            // reportMode: isPDF === true ? cntrl.ReportModes.PDF : cntrl.ReportModes.View,
            reportMode: cntrl.ReportModes.View,
            isAttachment: false,
            title: "Sample Report",
            key: 'SampleBO',
            owner: this,
            onClose: () => { }
        };
        cntrl.ReportApi.rdlcReport(opt);
    }
}