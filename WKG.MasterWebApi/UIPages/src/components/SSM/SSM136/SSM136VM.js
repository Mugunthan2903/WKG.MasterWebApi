import { Utils, ApiManager, WKLMessageboxTypes, WKLWindowStyles, VMBase } from "../../../wkl-components";

export default class SSM136VM extends VMBase {
    constructor(props) {
        super(props);
        this._WebApi = 'SSM130';
        this.init();
    }
    init() {

        if (Object.keys(this.Data).length !== 0) {
            return
        };
        const model = this.Data;
        model.FormID = "SSM136";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false;
        model.DataCopy = null;
        model.DataCopyGrid = null;
        model.ImageDirectory = this.props.data.ImageDirectory;
        model.SupplierMapID = this.props.data.SuppMapID;
        model.Crrg_ID = this.props.data.Crrg_ID;
        model.SearchInput = {
            Fclty_Name_Srch: "",
            Status_Srch: true,
        };
        model.Input = { IsEdit: false };
        model.ImageNameExists = null;
        model.ImageUploadNameExists = {};
        model.AllSelected = true;
        model.GridInfo = {
            Items: [],
            Page: 1,
            TotalPage: 0,
            TotalCount: 0,
            SelectedItem: null,
            PageSize: 5,
            Columns: [
                { text: '', field: 'Text', width: '4%' },
                { text: 'Name', field: 'fclty_nam', width: '25%', sort: { enabled: true } },
                { text: 'Description', field: 'fclty_desc', width: '35%' },
                { text: 'Status', field: 'act_inact_ind', width: '10%' },
                //{ text: 'Image', field: 'img_nam', width: '11%' },
                { text: 'Image', field: 'img_nam', width: '26%' }
            ]
        };

        this.setTitle();
    }

    getMaxWindowHeight() {
        const model = this.Data;
        const gridFooter = document.querySelector(`.${model.FormID}`);
        const windowButtonArea = document.querySelector('.window-button-area');
        if (!gridFooter || !windowButtonArea) {
            return null;
        }
        const rectGridFooter = gridFooter.getBoundingClientRect();
        const rectWindowButtonArea = windowButtonArea.getBoundingClientRect();
        const distance = rectWindowButtonArea.top - rectGridFooter.bottom;
        return distance;
    }
    adjustPageSize() {
        const model = this.Data;
        var maxHeight = this.getMaxWindowHeight();
        var rowHeight = 35;
        var rowsPerPage = Math.floor(maxHeight / rowHeight);
        model.GridInfo.PageSize += rowsPerPage;
    }
    loadInitData(loading) {
        this.adjustPageSize();
        this.IniloadPage(1, "", loading);
    }

    IniloadPage(pageIndex, columnOptions = null, loading = true) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;
        const dataInfo = {
            PageNo: pageIndex,
            PageSize: gridInfo.PageSize
        }
        dataInfo.crrg_id = model.Crrg_ID;
        dataInfo.img_dir = model.ImageDirectory;
        dataInfo.fclty_nam = model.SearchInput.Fclty_Name_Srch;
        dataInfo.act_inact_ind = model.SearchInput.Status_Srch;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "fclty_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        if (loading) {
            model.Loading = true;
        }
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM136FacilitiesImageOnloadSrch`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (!Utils.isNullOrEmpty(r.ImageName)) {
                    model.ImageNameExists = r.ImageName.split(',');
                }
                if (r && r.Facilities) {
                    this.fillSearchResult(r || {}, selectedItem);
                }
            } catch (ex) {
                console.error("Error in SSM136 onload facilities image: ", ex);
            } finally {
                me.updateUI();
            }
        });
    }

    onBlurCheck(e, datamodel) {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.img_dir = model.ImageDirectory;
        this.updateUI();
        if (!Utils.isNullOrEmpty(e.value)) {
            Utils.ajax({ url: `${this._WebApi}/SSM136FacilitiesImageBlurSrch`, data: dataInfo, files: [] }, (r) => {
                try {
                    if (r && r.ImageName) {
                        if (!Utils.isNullOrEmpty(r.ImageName)) {
                            model.ImageNameExists = r.ImageName.split(',');
                        }
                        if (!Utils.isNullOrEmpty(model.ImageNameExists) && model.ImageNameExists.length !== 0) {
                            if (model.ImageNameExists.includes(e.value) || (Object.values(model.ImageUploadNameExists).length !== 0 && Object.values(model.ImageUploadNameExists).includes(e.value))) {
                                me.showAlert('Image already exists.');
                                datamodel.Image_Array = null;
                                datamodel.wkg_img_srl = null;
                                datamodel[e.name] = null;
                                datamodel.OldImg = "";
                                datamodel.ImageChanged = "YES";
                            }
                            else {
                                model.ImageUploadNameExists[datamodel.fclty_cd] = e.value;
                            }
                        }
                    }
                }
                catch (ex) {
                    console.error("Error in SSM136 blur search facilities image: ", ex);
                }
                finally {
                    me.updateUI();
                }
            });
        }
    }

    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Facilities.map(data => {
            let newData = { ...data };

            if (data.act_inact_ind === true) {
                newData.act_inact_ind = "Active"
                newData.IsSelected = true;
                newData.AllSelected = true;
            }
            else {
                newData.act_inact_ind = "Inactive"
                newData.IsSelected = false
            }
            if (data.crrg_prod_aval === true) {
                newData.crrg_prod_aval = "No"
            } else {
                newData.crrg_prod_aval = "Yes"
            }
            newData.ImageChanged = "NO";
            newData.OldImg = "";
            newData.Image_Array = null;
            return newData;

        }) || [];
        model.AllSelected = (gridInfo.Items.length === gridInfo.Items.count(i => i.IsSelected) && gridInfo.Items.length !== 0);
        gridInfo.Page = r.CurrentPage || 0;
        gridInfo.TotalPage = r.TotalPages || 0;
        gridInfo.TotalCount = r.TotalCount || 0;
        if (gridInfo.Items.length > 0) {
            if (selectedItem !== undefined && selectedItem !== null) {
                selectedItem = gridInfo.Items.find(i => i.ID === selectedItem.ID);
            }
            if (selectedItem === null) selectedItem = gridInfo.Items[0];
        }
        if (selectedItem != null) selectedItem.isSelected = true;
        gridInfo.SelectedItem = selectedItem;
        this.Data.DataCopyGrid = JSON.stringify(gridInfo.Items.map(e => ({ IsSelected: e.IsSelected, img_nam: e.img_nam })));
        this.Data.DataCopyGridarr = gridInfo.Items.map(e => ({ IsSelected: e.IsSelected, img_nam: e.img_nam }));
    }

    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
    }

    handleSearch(PageNo, columnOptions, loading) {
        const me = this;
        const model = this.Data;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected, img_nam: e.img_nam })))) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        this.IniloadPage(PageNo, columnOptions, loading);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            this.IniloadPage(PageNo, columnOptions, loading);
        }


    }

    handleSearchClear() {
        const me = this;
        const model = this.Data;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected, img_nam: e.img_nam })))) {
            this.showConfirmation("Unsaved changes exists. Save and proceed.", false, (e) => {
                try {
                    if (e == 0) {
                        me.doSave();
                    }
                    else {
                        this.doSearchClear(true);
                    }
                }
                catch (ex) {

                }
                finally { }
            });
        }
        else {
            this.doSearchClear(true);
        }

    }

    doSearchClear(clearAll = false) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        if (clearAll === true) {
            model.SearchInput.Fclty_Name_Srch = "";
            model.SearchInput.Status_Srch = true;
            this.setFocus("Fclty_Name_Srch");
        }
        gridInfo.Items = [];
        this.Data.DataCopyGrid = JSON.stringify(gridInfo.Items.map(e => ({ IsSelected: e.IsSelected, img_nam: e.img_nam })));
        gridInfo.SelectedItem = null;
        model.AllSelected = false;
        this.updateUI();
    }

    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected, img_nam: e.img_nam })))) {
            this.doSave(e);
        }
        else {
            me.showAlert("No changes has been made");
        }
    }


    doSave(e) {
        const me = this;
        const model = this.Data;
        var Selectedrow = model.GridInfo.Items
        const dataInfo = {};
        dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
        dataInfo.supp_map_id = model.SupplierMapID;
        dataInfo.img_dir = model.ImageDirectory;
        let ImageList = Selectedrow.filter((e, i) => e.img_nam !== model.DataCopyGridarr[i].img_nam);
        if (ImageList.length > 0) {
            ImageList = ImageList.filter(item => {
                if (item.Image_Array) return item.Image_Array;
            }).map(item => item.Image_Array).flat();
            console.log("ImageList : ", ImageList);
        }
        else {
            ImageList = null;
        }

        dataInfo.Selectedrow = Selectedrow.filter((e, i) => e.IsSelected !== model.DataCopyGridarr[i].IsSelected || e.img_nam !== model.DataCopyGridarr[i].img_nam);
        model.Loading = true;
        me.updateUI();
        console.log('dataInfo', dataInfo, ImageList);
        Utils.ajax({ url: `${this._WebApi}/SSM136FacilitiesImageSave`, data: dataInfo, files: ImageList || [] }, r => {
            try {
                model.Loading = false;
                r = r || {};
                if (r.IsSuccess === true) {
                    model.IsSaved = true;
                    me.handleSaveFollowup(e);
                }
                else {
                    if (r.ErrorNo === -3) {//Overlapping
                        me.handleModified(dataInfo, e);
                    }
                    else {
                        me.showAlert('Something went wrong (1)');
                    }
                }
            }
            catch (ex) {
                console.error("Error in SSM136 save facilities image: ", ex);
            }
            finally {
                me.updateUI();
            }
        });
    }
    handleSaveFollowup(e) {
        const me = this;
        const model = this.Data;
        let pageNo = model.GridInfo.Page;
        me.showAlert('Data saved successfully');

        this.IniloadPage(pageNo, "", true);
    }
    isGridChanged(e) {
        return JSON.stringify(e) !== this.Data.DataCopyGrid;
    }
    handleValueChange(followUpAction) {
        const model = this.Data;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected, img_nam: e.img_nam })))) {
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
        const me = this;
        const model = me.Data;
        model.Title = `${this.props.data.Title} / Facilities images`;
    }

    setFocus(Txtbxname) {
        if (this.ComponentRef);
        this.ComponentRef.setFocus(Txtbxname);
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
    openWindow(item, name, datamodel) {
        const model = this.Data;
        const me = this;
        if (item.page === "Image_Upload") {
            this.showWindow({
                url: 'SSM/SSM009', data: { Title: model.Title, Supp_ID: model.SupplierMapID, Prod_Name: item.pname, Imag_Dir: model.ImageDirectory }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
                    if (e) {
                        console.log("Image Select :", e);
                        console.log("Image datamodel :", datamodel);
                        datamodel.Image_Array = null;
                        datamodel.wkg_img_srl = e.img_srl;
                        datamodel[name] = e.img_nam;
                        datamodel.OldImg = "YES";
                        datamodel.ImageChanged = "YES";
                    }
                }
            });
        }
    }
}

