import { Utils, ApiManager, WKLMessageboxTypes, WKLWindowStyles, VMBase } from "../../../wkl-components";

export default class SSM137VM extends VMBase {
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
        model.FormID = "SSM137";
        model.IsSaved = false;
        model.Title = '';
        model.Loading = false;
        model.DataCopy = null;
        model.DataCopyGrid = JSON.stringify([]);
        model.DataCopyGridarr = JSON.stringify([]);
        model.Cntry_cdList = [];
        model.DBSuppID = "";
        model.DBImgdir = "";
        model.SearchInput = {
            LocationName: "",
            Status_Srch: true,
            Delist_Srch: false,
            City_Srch: true,
            Area_Srch: true,
            Statn_Srch: true,
            Cntry_cd: null,

        };
        model.Input = { IsEdit: false };
        model.AllSelected = true;
        model.GridInfo = {
            Items: [],
            Page: 1,
            TotalPage: 0,
            TotalCount: 0,
            SelectedItem: null,
            PageSize: 5,
            Columns: [
                { text: '', field: 'Text', width: '5%' },
                { text: 'Location Name', field: 'stn_nam', width: '30%', sort: { enabled: true } },
                { text: 'Type', field: 'stn_typ', width: '10%' },
                { text: 'Status', field: 'act_inact_ind', width: '7%' },
                // { text: 'Delisted', field: 'stn_aval', width: '10%' },
                { text: 'Latitude', field: 'stn_lat', width: '11%' },
                { text: 'Longitude', field: 'stn_long', width: '11%' },
                { text: 'Address', field: 'stn_addr', width: '17%' },
                { text: 'Postcode', field: 'stn_post', width: '11%' },
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
        var rowHeight = 27;
        var rowsPerPage = Math.floor(maxHeight / rowHeight);
        model.GridInfo.PageSize += rowsPerPage;
    }
    loadInitData(loading) {
        this.adjustPageSize();
      //  this.IniloadPage(1, "", loading);
        this.ContrySearch();
        this.updateUI();
    }

    ContrySearch(){
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const dataInfo = {}
        model.Loading = true;
        
        this.updateUI();
        
        Utils.ajax({ url: `${this._WebApi}/SSM137OnloadCntrySearch`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                        if (r.Items)
                         model.Cntry_cdList = r.Items.map((data) => ({ ID: data.Cntry_Cd, Text: data.Cntry_desc }));
                }
            } catch (ex) {
                console.error("Error in SSM137 SSM137OnloadCntrySearch : ", ex);
            } finally {
                me.updateUI();
            }
        });
    }


    
    IniloadPage(pageIndex, columnOptions = null, loading = true) {
        const me = this;
        const model = this.Data;
        const gridInfo = model.GridInfo;
        const selectedItem = gridInfo.SelectedItem;

        if (model.SearchInput.Status_Srch) {
            if (model.SearchInput.LocationName == "" || model.SearchInput.LocationName.length <= 2 ) {
                this.showAlert('To proceed, Please enter a minimum of three characters in the City/Area/Station search.');
                return false; 

            }
        }

        const dataInfo = {
            PageNo: pageIndex,
            PageSize: gridInfo.PageSize
        }
        dataInfo.Loc_nam = model.SearchInput.LocationName;
        dataInfo.act_inact_ind = model.SearchInput.Status_Srch;
        dataInfo.City_Srch = model.SearchInput.City_Srch;
        dataInfo.Area_Srch = model.SearchInput.Area_Srch;
        dataInfo.Statn_Srch = model.SearchInput.Statn_Srch;
        dataInfo.Loc_prod_aval = !model.SearchInput.Delist_Srch;
        dataInfo.Cntry = model.SearchInput?.Cntry_cd?.map(item => item.ID).join(',') || null;
        dataInfo.SortTyp = true;
        columnOptions = columnOptions || [];
        if (columnOptions.length > 0) {
            for (const itm of columnOptions) {
                if (itm.field === "stn_nam" && !Utils.isNullOrEmpty(itm.sort)) {
                    dataInfo.SortTyp = itm.sort === 'asc';
                }
            }
        }
        if (loading) {
            model.Loading = true;
        }
        this.updateUI();
        console.log('dataInfo', dataInfo);
        Utils.ajax({ url: `${this._WebApi}/SSM137OnloadSearch`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                        if (r.Items)
                        this.fillSearchResult(r || {}, selectedItem);
                }
            } catch (ex) {
                console.error("Error in SSM137 onload : ", ex);
            } finally {
                me.updateUI();
            }
        });
    }

    fillSearchResult(r, selectedItem = null) {
        const model = this.Data;
        const gridInfo = model.GridInfo;
        gridInfo.Items = r.Items.map(data => {
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
            if (data.Loc_prod_aval === true) {
                newData.Loc_prod_aval = "No"
            } else {
                newData.Loc_prod_aval = "Yes"
            }
           
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
        this.Data.DataCopyGrid = JSON.stringify(gridInfo.Items.map(e => ({ IsSelected: e.IsSelected, })));
        this.Data.DataCopyGridarr = gridInfo.Items.map(e => ({ IsSelected: e.IsSelected,}));
    }

    setSelectedItem(selectedItem, loadData = false) {
        const model = this.Data;
        model.GridInfo.SelectedItem = selectedItem;
        model.GridInfo.SelectedItem.isSelected = true;
    }

    handleSearch(PageNo, columnOptions, loading) {
        const me = this;
        const model = this.Data;
        console.log(model.GridInfo.Items)
       console.log(model.DataCopyGrid)
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected, })))) {
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
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected, })))) {
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
            model.SearchInput.LocationName = "";
            model.SearchInput.Status_Srch = true;
            model.SearchInput.Delist_Srch = false;
            model.SearchInput.City_Srch = true;
            model.SearchInput.Area_Srch = true;
            model.SearchInput.Statn_Srch = true;
            model.SearchInput.Cntry_cd = null;
            this.setFocus("LocationName");
        }
        gridInfo.Items = [];
        this.Data.DataCopyGrid = JSON.stringify(gridInfo.Items.map(e => ({ IsSelected: e.IsSelected, })));
        gridInfo.SelectedItem = null;
        model.AllSelected = false;
        this.updateUI();
    }

    handleSave(e) {
        const me = this;
        const model = this.Data;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected, })))) {
            this.doSave(e);
        }
        else {
            me.showAlert("No changes has been made");
        }
    }


    doSave(e) {
        const me = this;
        const model = this.Data;
        var Selectedrow = model.GridInfo.Items;
        const dataInfo = {};
        dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
        dataInfo.Selectedrow = Selectedrow.filter((e, i) => e.IsSelected !== model.DataCopyGridarr[i].IsSelected );
        model.Loading = true;
        me.updateUI();
        console.log('dataInfo', dataInfo);
        Utils.ajax({ url: `${this._WebApi}/SSM137LocationSaveGrid`, data: dataInfo }, r => {
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
                console.error("Error in SSM137 Save : ", ex);
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
        me.showAlert('Data saved successfully' ,()=> this.IniloadPage(pageNo, "", true));

     }
    isGridChanged(e) {
        return JSON.stringify(e) !== this.Data.DataCopyGrid;
    }
    handleValueChange(followUpAction) {
        const model = this.Data;
        if (this.isGridChanged(model.GridInfo.Items.map(e => ({ IsSelected: e.IsSelected,})))) {
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
        model.Title = `${this.props.data.Title} / Distribusion Location`;
    }

    setFocus(Txtbxname) {
        if (this.ComponentRef);
        this.ComponentRef.setFocus(Txtbxname);
    }

  showAlert(errorMsg, callback) {
        if (typeof errorMsg === 'number')
            errorMsg = Utils.getMessage(errorMsg);

        const me = this;
        const opt = {
            text: errorMsg,
            messageboxType: WKLMessageboxTypes.question,
            onClose: callback
        };
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
    
}

