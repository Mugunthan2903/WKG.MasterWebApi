import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from '../../../wkl-components';

export default class SMST002VM extends VMBase {
  constructor(props) {
    super(props);

    this.init();
    this._WebApi = 'SMST002';
  }
  //initializing model object
  init() {
    if (Object.keys(this.Data).length != 0)
      return;
    const model = this.Data;
    model.FormID = "SMST002";
    model.Title = '';
    model.Loading = false
    model.DataCopy = null;
    model.Input = {
      SMST002_lang_code_form: "",
      SMST002_lang_name_form: "",
      SMST002_tui_lang_code_form: "",
      IsActiveF: true,
      Modifiedby: "",
      Modifiedon: "",
      recordExists: false,
    };
    model.SearchInput = {
      languageName: '',
      IsActiveS: true,
      // prevSort: true
    };
    model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 12 };
    model.GridInfo.Columns = [
      // { text: 'selectall', field: 'selectall', width: '5%' },
      { text: 'Code', field: 'lang_cd', width: '25%' },
      { text: 'Name', field: 'lang_nam', width: '30%', sort: { enabled: true } },
      { text: 'Tui Code', field: 'tui_lang_cd', width: '30%' },
      { text: 'Status', field: 'act_inact_ind', width: '15%' }
    ];

    this.newMode(true);
  }
  //used to set focus on input controls
  setFocus(name) {
    if (this.ComponentRef)
      this.ComponentRef.setFocus(name);
  }
  //show alert messages
  showAlert(errorMsg, name, msgType = WKLMessageboxTypes.error) {
    console.log('show alert');
    if (typeof errorMsg === 'number') {
      console.log('show alert');
      errorMsg = Utils.getMessage(errorMsg);
    }

    const opts = {
      text: errorMsg,
      messageboxType: msgType
    };
    if (name) {
      opts.onClose = (_e) => {
        this.setFocus(name);
      }
    }
    this.showMessageBox(opts);
  }
  //called when new entry is needed , empty's form field
  newMode(setFocus = true) {
    const model = this.Data;
    model.Input.ID = 0;
    model.Input.SMST002_lang_code_form = '';
    model.Input.SMST002_lang_name_form = '';
    model.Input.SMST002_tui_lang_code_form = '';
    model.Input.IsActiveF = true;
    // model.SearchInput.languageName = "";
    // model.SearchInput.IsActiveS = true;
    model.Input.IsEdit = false;
    this.setTitle();
    var dataCopyEx = this.getData();
    this.Data.DataCopy = JSON.stringify(dataCopyEx);
    this.updateUI();
    if (setFocus)
      this.setFocus('SMST002_lang_code_form');
  }
  //called when page on load
  loadInitData() {
    this.loadPage(1);
    this.setFocus('SMST002_lang_code_form');
  }
  //clearing search fields
  handleSearchClear() {
    const me = this;
    me.doSearchClear(true);
  }
  doSearchClear(clearAll = false) {
    const model = this.Data;
    const gridInfo = model.GridInfo;
    // model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 10 };
    if (clearAll === true) {
      model.SearchInput.languageName = '';
      model.SearchInput.IsActiveS = true;
      this.setTitle();
    }
    gridInfo.Items = [];
    gridInfo.SelectedItem = null;
    gridInfo.Page = 1;
    gridInfo.TotalPage = 1;
    gridInfo.TotalCount = 0;
    if (clearAll === true)
      this.setFocus('languageName');
    this.updateUI();
  }
  //handles search button
  handleSearch(pageIndex) {
    this.loadPage(pageIndex);
  }
  loadPage(pageIndex, columnOptions = null) {
    const me = this;
    const model = this.Data;
    const gridInfo = model.GridInfo;
    const selectedItem = gridInfo.SelectedItem;
    const dataInfo = {};
    dataInfo.PageNo = pageIndex;
    dataInfo.PageSize = gridInfo.PageSize;
    dataInfo.lang_name = model.SearchInput.languageName;
    dataInfo.act_inact_ind = model.SearchInput.IsActiveS ? "true" : "false";
    dataInfo.TuiAsc = true;
    // dataInfo.TuiAsc = model.SearchInput.prevSort;
    columnOptions = columnOptions || [];
    if (columnOptions.length > 0) {
      for (const itm of columnOptions) {
        if (itm.field === "lang_nam" && !cntrl.Utils.isNullOrEmpty(itm.sort)) {
          dataInfo.TuiAsc = itm.sort === 'asc';
          // model.SearchInput.prevSort = itm.sort === 'asc';
        }
      }
    }
    model.Loading = true;
    model.AllSelected = false;
    this.updateUI();
    cntrl.Utils.ajax({ url: `${this._WebApi}/SMST002GetSearchDataAsync`, data: dataInfo, files: [] }, (r) => {
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
    gridInfo.Items = r.Items.map(e => {
      if (e.act_inact_ind) {
        return { ...e, act_inact_ind: "Active" }
      } else {
        return { ...e, act_inact_ind: "Inactive" }
      }
    }) || [];
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
  //setting selected item when clicking on grid
  setSelectedItem(selectedItem, loadData = false) {
    const model = this.Data;
    model.GridInfo.SelectedItem = selectedItem;
    model.GridInfo.SelectedItem.isSelected = true;
    if (loadData === true)
      this.loadSelectedData(selectedItem.lang_cd);
  }
  handleDataChange(selectedItem) {
    const me = this;
    const model = this.Data;
    if (selectedItem) {
      if (selectedItem.lang_cd === model.Input.SMST002_lang_code_form) {
        me.setFocus('SMST002_lang_name_form');
        return;
      }
      else {
        if (this.isValueChanged()) {
          let options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
          this.showMessageBox({
            text: "Do you want to save the current data ?",
            buttons: options,
            messageboxType: WKLMessageboxTypes.info,
            onClose: (_e) => {
              if (_e === 0) {
                me.handleSave(6, () => me.setSelectedItem(selectedItem, true));
              } else if (_e === 1) {
                me.setSelectedItem(selectedItem, true);
                me.setFocus('SMST002_lang_code_form');
              }
            }
          });
        }
        else {
          this.setSelectedItem(selectedItem, true);
        }
      }
    }
    else {
      if (this.isValueChanged()) {
        let options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];
        this.showMessageBox({
          text: "Do you want to save the current data ?",
          buttons: options,
          messageboxType: WKLMessageboxTypes.info,
          onClose: (_e) => {
            if (_e === 0) {
              me.Data.Input.IsEdit = true;
              me.handleSave(1);
              this.setFocus('SMST002_lang_code_form');
            } else if (_e === 1) {
              me.newMode(true);
              this.setFocus('SMST002_lang_code_form');
            }
          }
        });
      } else {
        me.newMode(true);
      }
    }
  }
  // called for setting title
  setTitle() {
    const model = this.Data;
    if (model.Input.IsEdit)
      model.Title = `${this.props.data.Title} / Edit / ${model.Input.SMST002_lang_name_form}`;
    else
      model.Title = `${this.props.data.Title} / New`;
  }
  //called when grid row double click
  loadSelectedData(lang_cd) {
    const me = this;
    const model = this.Data.Input;
    me.Data.Loading = true;
    Utils.ajax({ url: `${this._WebApi}/SMST002ModifyDataAsync`, data: { lang_cd } }, (r) => {
      model.SMST002_lang_code_form = r.lang_cd;
      model.SMST002_lang_name_form = r.lang_nam;
      model.SMST002_tui_lang_code_form = r.tui_lang_cd || "";
      model.IsActiveF = r.act_inact_ind;
      model.Modifiedby = r.mod_by_usr_cd;
      model.Modifiedon = r.mod_dttm;
      model.IsEdit = true;
      me.Data.Loading = false;
      me.setTitle();
      let dataCopyEx = me.getData();
      me.Data.DataCopy = JSON.stringify(dataCopyEx);
      me.setFocus('SMST002_lang_name_form');
      me.updateUI();
    });
    this.updateUI();
  }
  //collects form data and returns it
  getData() {
    const model = this.Data.Input;
    const dataInfo = {};
    dataInfo.ID = model.ID;
    dataInfo.SMST002_lang_code_form = model.SMST002_lang_code_form;
    dataInfo.SMST002_lang_name_form = model.SMST002_lang_name_form;
    dataInfo.SMST002_tui_lang_code_form = model.SMST002_tui_lang_code_form;
    dataInfo.IsActiveF = model.IsActiveF;
    return dataInfo;
  }
  // validates if the required fields are empty
  isvalidSave(e) {
    const model = this.Data.Input;
    if (Utils.isNullOrEmpty(model.SMST002_lang_code_form)) {
      this.showAlert(32, 'Language Code');
      return false;
    }
    if (Utils.isNullOrEmpty(model.SMST002_lang_name_form)) {
      this.showAlert(103, 'Language Name');
      return false;
    }
    return true;
  }
  // used to show confirmation window
  showConfirmation(msgNo, isThreeOption, callback) {
    let options = [{ text: 'Yes' }, { text: 'No' }];
    if (isThreeOption)
      options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];

    this.showMessageBox({
      text: Utils.getMessage(msgNo),
      buttons: options,
      messageboxType: WKLMessageboxTypes.info,
      onClose: callback
    });
  }
  //used to show toaster window
  showToaster(msgNo = 4, callback) {
    const me = this;
    this.Data.ShowToast = true;
    this.Data.ToastConfig = {
      onClose: () => {
        me.Data.ShowToast = false;
        try {
          Utils.invoke(callback);
        }
        catch (ex) { }
        finally {
          me.updateUI();
        }
      },
      title: 'Confirmation',
      message: Utils.getMessage(msgNo),
      toasterType: 'info',
    };
    this.updateUI();
  }
  // handles save functionality
  handleSave(e, callback) {
    const model = this.Data.Input;
    const me = this;
    if (model.recordExists) {
      return;
    }
    if (model.SMST002_lang_code_form === "" || model.SMST002_lang_name_form === "" || model.IsActiveF === "") {
      const opts = {
        text: "",
        messageboxType: WKLMessageboxTypes.info,
        onClose: (_e) => {
          if (me.Data.Input.SMST002_lang_code_form === "") {
            if (_e === 10) return;
            if (e === 1) me.Data.Input.IsEdit = true;
            this.setFocus("SMST002_lang_code_form");
            me.updateUI();
          } else if (model.SMST002_lang_name_form === "") {
            if (_e === 10) return;
            if (e === 1) me.Data.Input.IsEdit = true;
            this.setFocus("SMST002_lang_name_form");
            me.updateUI();
          }
        }
      };
      if (model.SMST002_lang_code_form === "" && model.SMST002_lang_name_form === "") {
        opts.text = "Please Enter Required Fields";
      } else if (model.SMST002_lang_code_form === "") {
        opts.text = "Please Enter Code";
      } else if (model.SMST002_lang_name_form === "") {
        opts.text = "Please Enter Name";
      }
      this.showMessageBox(opts);
      return;
    }
    if (!this.isValueChanged()) {
      const opts = {
        text: "No changes has been made.",
        messageboxType: WKLMessageboxTypes.info,
        onClose: (_e) => {
          if (me.Data.Input.IsEdit)
            me.setFocus("SMST002_lang_name_form");
          else
            me.setFocus("SMST002_lang_code_form");
        }
      };
      this.showMessageBox(opts);
      return;
    }
    const dataInfo = {
      lang_cd: model.SMST002_lang_code_form,
      lang_nam: model.SMST002_lang_name_form,
      tui_lang_cd: model.SMST002_tui_lang_code_form,
      act_inact_ind: model.IsActiveF,
      isEdit: model.IsEdit,
      mod_by_usr_cd: ApiManager.getUser().ID,
    }
    Utils.ajax({ url: `${this._WebApi}/SMST002GetSaveDataAsync`, data: dataInfo }, (r) => {
      if (r.IsSuccess) {
        const opts = {
          text: "Data Saved Successfully",
          messageboxType: WKLMessageboxTypes.info,
          onClose: (_e) => {
            me.loadPage(me.Data.GridInfo.Page);
            if (e === 5) return;
            me.newMode(true);
            if (callback) callback()
            me.setFocus("SMST002_lang_code_form");
          }
        };
        this.showMessageBox(opts);

      } else {
        const opts = {
          text: "Something went Wrong",
          messageboxType: WKLMessageboxTypes.info,
          onClose: (_e) => {
          }
        };
        this.showMessageBox(opts);
      }
    });
  }
  // function that checks if the form data is changed
  isValueChanged() {
    var dataCopyEx = this.getData();
    return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
  }
  checkPrimary() {
    const me = this;
    const model = this.Data.Input;
    const dataInfo = {
      lang_cd: model.SMST002_lang_code_form
    };
    Utils.ajax({ url: `${this._WebApi}/SMST002CheckPrimaryAsync`, data: dataInfo }, (r) => {
      if (r.isPrimaryExist) {
        model.recordExists = true;
        const options = [{ text: 'Yes' }, { text: 'No' }];
        this.showMessageBox({
          text: "Record already exists. Do you want to retrieve?",
          buttons: options,
          messageboxType: WKLMessageboxTypes.info,
          onClose: (_e) => {
            if (_e === 0) {
              model.IsEdit = true;
              model.SMST002_lang_code_form = r.editFields[0].lang_cd;
              model.SMST002_lang_name_form = r.editFields[0].lang_nam;
              model.SMST002_tui_lang_code_form = r.editFields[0].tui_lang_cd;
              model.IsActiveF = r.editFields[0].act_inact_ind;
              model.Modifiedby = r.editFields[0].mod_by_usr_cd;
              model.Modifiedon = r.editFields[0].mod_dttm;
              model.recordExists = false;
              me.setFocus("SMST002_lang_name_form");
              me.setTitle();
              me.updateUI();
              var dataCopyEx = this.getData();
              me.Data.DataCopy = JSON.stringify(dataCopyEx);
            } else {
              // model.SMST002_lang_code_form = "";
              me.setFocus("SMST002_lang_code_form");
            }
          }
        });

      }
    });
  }
  // handles close 
  doClose() {
    const me = this;
    if (this.isValueChanged()) {
      let options = [{ text: 'Yes' }, { text: 'No' }];
      this.showMessageBox({
        text: "Do you want to Discard the changes?",
        buttons: options,
        messageboxType: WKLMessageboxTypes.info,
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