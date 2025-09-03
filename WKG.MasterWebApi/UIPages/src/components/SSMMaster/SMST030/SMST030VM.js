import * as cntrl from "../../../wkl-components";

export default class SMST030VM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SMST030';
        this.init();
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SMST030";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {};
        model.SearchInput = {};
        model.AllSelected = false;
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 10 };
        model.GridInfo.Columns = [
            { text: '', field: 'Text', width: '10%' },
            { text: 'SSMName', field: 'ssm_nam', width: '49%', sort: { enabled: true } },
            { text: 'Status', field: 'act_inact_ind', width: '40%' }
        ];

        this.newMode();
    }
    newMode() {
        const model = this.Data;
        model.Input.ID = 0;
        model.Input.SSM_Id_F = '';
        model.Input.SSM_Name_F = '';
        model.Input.groupName_F = null;
        model.Input.Refresh_Type_F = 1;
        model.Input.Schedule_Date_F = null;
        model.Input.Api_end_pt_F = null;
        model.Input.IsActiveF = true;
        model.Input.IsEdit = false;
        this.setFocus('SSM_Id_F');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();

    }
    loadInitData() {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.PageNo = 1;
        model.Loading = true;
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                model.groupNamesList = r.GroupFields.map(e => ({ ID: e.pos_grp_id, Text: e.pos_grp_nam }));
                model.endptList = r.EndPointFields.map((e, i) => ({ ID: i, Text: e.end_pnt_nam }));
                me.fillSearchResult(r.InputFields || {}, selectedItem);
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
        this.setFocus("SSM_Id_F");
    }
    openConfigWindow(id) {
        const model = this.Data;
        let urlbtn = "";
        let title = "";
        if (id === "btn_evnt_typ") {
            urlbtn = "SSMMaster/SMST031";
            title = "SMST031";
        } else {
            urlbtn = "SSMMaster/SMST032";
            title = "SMST032";
        }
        this.showWindow({
            url: urlbtn,
            data: { Title: title },
            windowStyle: cntrl.WKLWindowStyles.slideLeft, onClose: (e) => { }
        });
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        if (model.Input.IsEdit)
            model.Title = `${this.props.data.Title} / Edit / ${model.Input.groupName_F.Text}`;
        else
            model.Title = `${this.props.data.Title} / New`;
    }
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        dataInfo.SSM_Id_F = model.SSM_Id_F;
        dataInfo.SSM_Name_F = model.SSM_Name_F;
        dataInfo.groupName_F = model.groupName_F;
        dataInfo.Refresh_Type_F = model.Refresh_Type_F;
        dataInfo.Schedule_Date_F = model.Schedule_Date_F === null ? null : model.Schedule_Date_F.setHours(0, 0, 0, 0);
        dataInfo.Api_end_pt_F = model.Api_end_pt_F;
        dataInfo.IsActiveF = model.IsActiveF;
        return dataInfo;
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    doClose() {
        const me = this;
        if (this.isValueChanged()) {
            let options = [{ text: 'Yes' }, { text: 'No' }];
            this.showMessageBox({
                text: "Do you want to Discard the changes?",
                buttons: options,
                messageboxType: cntrl.WKLMessageboxTypes.info,
                onClose: (_e) => {
                    if (_e === 0) {
                        me.close();
                    }
                }
            });
        }
        else {
            this.close()
        }
    }
}