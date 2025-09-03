import * as cntrl from '../../../wkl-components';
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SSM064VM extends cntrl.VMBase {
    constructor(props) {
        super(props);

        this._WebApi = 'SSM060';
        this.init();

    }

    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM064";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.imageCopy = null;
        model.LP_Prod_Type = {};
        model.ImageDirectory = this.props.data.ImageDirectory;
        model.SuppMapID = this.props.data.SuppMapID;
        model.ovrd_srl = "";
        model.Image_Array = null;
        model.ImageNameExists = null;
        model.WKLImage_Upload = null;
        model.WKLImage_Url = null;
        model.WKLImage_SNO = null;
        model.WKLImage_SNO_Old = null;
        model.Input = {};
        model.SearchInput = {};
        model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 8 };
        model.GridInfo.Columns = [
            { text: 'Language', field: 'lang_nam', width: '20%' },
            { text: 'Name', field: 'lp_prod_nam', width: '70%' },
            { text: '', field: '', width: '10%' }


        ];
        this.newMode();
    }

    newMode() {
        const model = this.Data;
        model.supp_map_id = "";
        model.Prod_ID = "";
        model.Modifiedon = null;
        model.Modifiedby = "";
        model.IsEdit = false;

        this.setFocus('');
        this.setTitle();
        var dataCopyEx = this.getData();
        this.Data.DataCopy = JSON.stringify(dataCopyEx);
        this.updateUI();
    }
    getData() {
        const model = this.Data;
        const dataInfo = {};
        dataInfo.prod_id = model.Prod_ID;
        dataInfo.supp_map_id = model.SuppMapID;
        dataInfo.img_nam = model.WKLImage_Upload || "";
        dataInfo.img_url = model.WKLImage_Url;
        dataInfo.img_srl = model.WKLImage_SNO || "";
        dataInfo.img_srl_old = model.WKLImage_SNO_Old || "";
        dataInfo.img_dir = model.ImageDirectory;

        return dataInfo;
    }
    isImageChanged() {
        const model = this.Data;
        return model.imageCopy !== model.WKLImage_Upload;
    }

    loadInitData() {
        this.loadPage(1);
    }

    loadPage(pageIndex, loader = true, loadData = true) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {};
        dataInfo.img_dir = model.ImageDirectory;
        dataInfo.PageSize = gridInfo.PageSize;
        dataInfo.PageNo = pageIndex;
        dataInfo.sortType = true;
        if (loader) {
            model.Loading = true;
        }
        this.updateUI();
        cntrl.Utils.ajax({ url: `${this._WebApi}/SSM064OnLoadData`, data: dataInfo, files: [] }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    if(loadData){
                        model.LP_Prod_Type = r.LP_Prod_Type;
                    }
                    if (r.Image.length !== 0 && loadData) {
                        //model.Prod_ID = r.Image[0].prod_id;
                        model.supp_map_id = r.Image[0].supp_map_id;
                        model.WKLImage_Upload = r.Image[0].img_nam;
                        model.WKLImage_Url = r.Image[0].img_url;
                        model.WKLImage_SNO = r.Image[0].img_srl;
                        model.IsEdit = true;

                        var dataCopyEx = me.getData();
                        me.Data.imageCopy = r.Image[0].img_nam;
                        me.Data.DataCopy = JSON.stringify(dataCopyEx);
                    }
                    model.Prod_ID = r.lp_prod_id;
                    if (!Utils.isNullOrEmpty(r.ImageName)) {
                        model.ImageNameExists = r.ImageName.split(',');
                    }
                    me.fillSearchResult(r || {}, selectedItem);
                }
            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                me.updateUI();
            }
        });
    };

    onBlurCheck(name) {
        const model = this.Data;
        const me = this;
        if (!Utils.isNullOrEmpty(model.ImageNameExists)) {
            if (model.ImageNameExists.includes(name)) {
                me.showAlert('Image already exists.');
                model.WKLImage_Upload = "";
            }
            this.updateUI();
        }

    }

    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.EditGrid || [];
        gridInfo.Page = r.CurrentPage || 0;
        gridInfo.TotalPage = r.TotalPages || 0;
        gridInfo.TotalCount = r.TotalRecords || 0;
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

    setSelectedItem(selectedItem) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
    }

    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isImageChanged()) {
            this.doSave(e);
        }
        else {
            me.showAlert("No changes has been made.", '');
        }
    }
    doSave(e) {
        const me = this;
        const model = this.Data;
        const dataInfo = this.getData();
        if (this.isImageChanged()) {
            dataInfo.ImageChanged = "YES";
        }
        else {
            dataInfo.ImageChanged = "NO";
        }
        if (!Utils.isNullOrEmpty(model.WKLImage_Url)) {
            dataInfo.OldImg = "YES";
        }
        else {
            dataInfo.OldImg = "NO";
        }
        dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
        dataInfo.Mode = model.IsEdit ? "UPDATE" : "INSERT";
        dataInfo.ovrd_srl = model.ovrd_srl;
        model.Loading = true;
        me.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM064SaveImageData`, data: dataInfo, files: model.Image_Array || [] }, r => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess === true) {
                    model.IsSaved = true;
                    me.handleSaveFollowup(e);
                }
                else {
                    me.showAlert('Something went wrong');
                }
            }
            catch (ex) { }
            finally {
                me.updateUI();
            }
        });
    }
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        me.showAlert('Data saved successfully', '');
        me.close();
    }

    // handleDelete(e) {
    //     const me = this;
    //     const model = this.Data;
    //     if (!model.IsEdit) {
    //         return;
    //     }
    //     const dataInfo = {};
    //     dataInfo.img_srl = model.WKLImage_SNO;
    //     dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
    //     model.Loading = true;
    //     me.updateUI();
    //     Utils.ajax({ url: `${this._WebApi}/SSM064RemoveImage`, data: dataInfo, files: '' || [] }, r => {
    //         try {
    //             model.Loading = false;
    //             r = r || {};
    //             if (r.IsSuccess === true) {
    //                 model.IsSaved = true;
    //                 me.handleDeleteFollowup(e);
    //             }
    //             else {
    //                 me.showAlert('Something went wrong');
    //             }
    //         }
    //         catch (ex) { }
    //         finally {
    //             me.updateUI();
    //         }
    //     });
    // }
    // handleDeleteFollowup(e) {
    //     const me = this;
    //     const model = this.Data;
    //     model.Image_Array = null;
    //     model.WKLImage_Upload = null;
    //     model.WKLImage_Url = null;
    //     model.WKLImage_SNO = null;
    //     model.imageCopy = null;
    //     var dataCopyEx = this.getData();
    //     this.Data.DataCopy = JSON.stringify(dataCopyEx);
    //     me.showAlert('Image removed successfully', '');

    // }
    handleValueChange(followUpAction) {
        const model = this.Data;
        if (this.isImageChanged()) {
            const me = this;
            this.showConfirmation("Do you want to Discard the changes?", false, (e) => {
                try {
                    if (e == 0) {
                        me.close();
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            Utils.invoke(followUpAction);
        }
    }

    doClose() {
        this.handleValueChange(() => this.close());

    }
    setTitle() {
        const model = this.Data;
        model.Title = `London Pass Info`;

    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    showAlert(errorMsg, name) {
        if (typeof errorMsg === 'number')
            errorMsg = Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,
            messageboxType: WKLMessageboxTypes.question
        };
        if (name) {
            opt.onClose = (_e) => {
                me.setFocus(name);
            }
        }
        this.showMessageBox(opt);
    }
    showConfirmation(msgNo, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
        let text = '';
        if (typeof msgNo === 'number') {
            text = Utils.getMessage(msgNo)
        }
        else {
            text = msgNo;
        }
        this.showMessageBox({
            text: text,
            buttons: options,
            messageboxType: WKLMessageboxTypes.question,
            onClose: callback
        });
    }
    onEditclick(item) {
        const model = this.Data;
        this.openWindow("sec2_Edit", item);
    }
    openWindow(type, InputObj) {
        const model = this.Data;
        let IsEdit = '';
        let Url = '';
        if (type == "sec2_New") {

            Url = 'SSM/SSM065';
            IsEdit = false;
            this.showWindow({
                url: Url, data: { Title: model.Title, IsEdit: IsEdit, InputData: InputObj, }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    this.loadPage(1, false, false);
                }
            });
        }
        else if (type == "sec2_Edit") {
            Url = 'SSM/SSM065';
            IsEdit = true;
            this.showWindow({
                url: Url, data: { Title: model.Title, IsEdit: IsEdit, InputData: InputObj }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    this.loadPage(1, false, false);
                }
            });
        }
        else if (type == "btn_Addimg_lp") {
            Url = 'SSM/SSM009';
            IsEdit = true;
            let lp_prod_typ = model.LP_Prod_Type.LondonPass;
            this.showWindow({
                url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_Name: model.Title, Prod_ID: model.Prod_ID, Supp_ID: model.SuppMapID, LP_Prod_Typ: lp_prod_typ, Imag_Dir: model.ImageDirectory }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e) {
                        model.WKLImage_SNO_Old = e.img_srl;
                        model.WKLImage_Upload = e.img_nam;
                        model.WKLImage_Url = e.img_url;
                    }
                }
            });
        }
    }
}
