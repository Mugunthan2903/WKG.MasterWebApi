import * as cntrl from "../../../wkl-components";
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SMST054VM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SSM020';
        this.init();
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SMSTDT";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.Input = {};
        model.SearchInput = {};
        model.AllSelected = false;
        model.DataTable = [];
        model.Columns = [
            { key: 'switch', title: '', width: '5%', switch: true },
            { key: 'textbox', title: 'City Name', width: '35%' },
            { key: 'tui_cntry_nam', title: 'Country Name', width: '30%' },
            //{ key: 'act_inact_ind', title: 'Status', width: '20%' },
            { key: 'act_inact_ind', title: 'Status', width: '0%' },
            { key: 'button', title: 'Button', width: '15%' },



            
            // { key: 'textbox', title: 'tui_city_aval', width: '20%' },
        ]

    }
    loadInitData() {
        this.loadPage(1);
    }
    columnbtn = (id, name) => {
        const pid = id;
        const pname = name;
        return (<div>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_search" title={"Edit"} data-bs-toggle="tooltip" data-bs-placement="left" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ pname, pid, id: 'btn_Edit_grid' })}><i className="fas fa-edit" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Exception"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ pname, pid, id: 'btn_Exp_grid' })}><i className="fas fa-bug" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
        </div>)
    };
    columntextbox = (index, data) => {
        return (<div>
            <cntrl.WKLTextbox mandatory={true} name={"tui_city_nam"} value={data.tui_city_nam} onChange={(e) => this.onChangeTxt(e, index, data)} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
            </cntrl.WKLTextbox>

            {/* <input type='text' id={''} name={data.tui_city_aval} value={data.tui_city_aval} onChange={(e) => this.onChange(data)}></input> */}
        </div>)
    };
    columnswitch = (data) => {
        return (<div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" style={{ width: "30px", height: "18px" }} role="switch" id="switchSizeLarge" name="IsSelected" checked={true} />
        </div>)
    };
    onChangeTxt = (e, index, val) => {

        const model = this.Data.DataTable;
        const Info = val || model;

        val[e.name] = e.value;
        //model.DataTable = Info;
        this.updateUI();

    }


    loadPage(pageIndex, columnOptions = null) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.tui_city_nam = "";
        dataInfo.act_inact_ind = '0';
        dataInfo.tui_city_aval = "1";
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM020GetTuiProductsAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                model.DataTable = r.Items.map((data, index) => {
                    if (data.act_inact_ind === "True") {
                        data.act_inact_ind = "Active"
                    }
                    else {
                        data.act_inact_ind = "Inactive"
                    }
                    data.textbox = () => this.columntextbox(index, data);

                    return { ...data, switch: () => this.columnswitch(), button: () => this.columnbtn() };

                });
            }
            catch (ex) {
                console.log(ex);
            }
            finally {

                me.updateUI();
            }
        });
    }
}