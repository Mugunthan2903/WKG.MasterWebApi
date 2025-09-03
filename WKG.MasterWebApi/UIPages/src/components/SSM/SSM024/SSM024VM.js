import * as cntrl from '../../../wkl-components';
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";

export default class SSM024VM extends cntrl.VMBase {
  constructor(props) {
    super(props);

    this._WebApi = 'SSM020';
    this.init();

  }

  init() {
    if (Object.keys(this.Data).length != 0)
      return;
    const model = this.Data;
    model.FormID = "SSM024";
    model.Title = '';
    model.Loading = false;
    model.DefaultBookFeeType = {
      Percentage:"",
      Fixed:""
    };
    model.DataCopy = null;
    model.imageCopy = null;
    model.ImageNameExists = null;
    model.ovrd_srl = "";
    model.Image_Array = null;
    model.WKLImage_Upload = null;
    model.WKLImage_Url = null;
    model.WKLImage_SNO = null;
    model.City_Name = this.props.data.City_Name;
    model.SuppMapID = this.props.data.SuppMapID;
    model.ImageDirectory = this.props.data.ImageDirectory;
    model.Input = {
      Prod_ID: this.props.data.Prod_ID,
      Prod_Name: this.props.data.Prod_Name,
      supp_map_id: "",
      Tui_ctgry_ID: null,
      Featured_Prod: true,
      Sort: "",
      Latitude: '',
      Longitude: '',
      Booking_fee: '',
      BookFeeTyp: model.DefaultBookFeeType.Percentage,

      Image_SNO: "",
      Image_path: "",
      Image_Name: "",
      Modifiedon: null,
      Modifiedby: "",
      IsEdit: false,
    };

    model.SearchInput = {
    };
    model.Tui_ctgry_IDList = [];
    model.Tui_ctgry_IDListAll = [];
    model.GridInfo = { Items: [], Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 8 };
    model.GridInfo.Columns = [
      { text: 'Language', field: 'lang_nam', width: '20%' },
      { text: 'Name', field: 'tui_prod_nam', width: '70%' },
      { text: '', field: '', width: '10%' }


    ];
    this.newMode();
  }



  newMode() {

    console.log("Props", this.props)
    const model = this.Data;
    const dataModel = this.Data.Input;
    model.ovrd_srl = "";
    dataModel.supp_map_id = "";
    dataModel.Prod_ID = this.props.data.Prod_ID;
    dataModel.Prod_Name = this.props.data.Prod_Name;
    dataModel.Tui_ctgry_ID = null;
    dataModel.Featured_Prod = true;
    dataModel.Sort = "";
    dataModel.Latitude = '';
    dataModel.Longitude = '';
    dataModel.Booking_fee = '';
    dataModel.BookFeeTyp = model.DefaultBookFeeType.Percentage;

    dataModel.Image_SNO = "";
    dataModel.Image_path = "";
    dataModel.Image_Name = "";

    dataModel.Modifiedon = null;
    dataModel.Modifiedby = "";
    dataModel.IsEdit = false;

    this.setFocus('');
    this.setTitle();
    var dataCopyEx = this.getData();
    this.Data.DataCopy = JSON.stringify(dataCopyEx);
    this.updateUI();
  }
  getData() {
    const model = this.Data.Input;
    const dataModel = this.Data;
    const dataInfo = {
      supp_map_id: dataModel.SuppMapID,
      prod_id: model.Prod_ID,
      prod_featrd: model.Featured_Prod ? 1 : 0,
      sort_ordr: model.Sort,
      latitude: model.Latitude,
      longitude: model.Longitude,
      img_nam: this.Data.WKLImage_Upload || "",
      img_dir: dataModel.ImageDirectory,
      img_srl: this.Data.WKLImage_SNO || "",

    };
    if (!Utils.isNullOrEmpty(model.Booking_fee)) {
      dataInfo.bkng_fee = model.Booking_fee;
      dataInfo.bkng_fee_typ = model.BookFeeTyp;
    }
    else {
      dataInfo.bkng_fee = "";
      dataInfo.bkng_fee_typ = "";
    }
    if (!Utils.isNullOrEmpty(model.Tui_ctgry_ID)) {
      dataInfo.tui_ctgry_ids = model.Tui_ctgry_ID.map(item => item.ID).join(',');
    }
    return dataInfo;
  }
  isValueChanged() {
    var dataCopyEx = this.getData();
    return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
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
    dataInfo.tui_prod_id = model.Input.Prod_ID;
    dataInfo.PageSize = gridInfo.PageSize;
    dataInfo.PageNo = pageIndex;
    dataInfo.tui_ctgry_nam = "";
    dataInfo.img_dir = model.ImageDirectory;
    dataInfo.supp_map_id = model.SuppMapID;
    dataInfo.sortType = true;
    if (loader) {
      model.Loading = true;
    }
    model.AllSelected = false;
    this.updateUI();
    cntrl.Utils.ajax({ url: `${this._WebApi}/SSM023_Combobinding`, data: dataInfo, files: [] }, (r) => {
      try {
        model.Loading = false;
        if (r) {
          model.Tui_ctgry_IDList = r.Exc_cmb_tui_cat.filter(data => data.act_inact_ind === true && data.tui_ctgry_aval === true).map((data) => ({ ID: data.tui_ctgry_id, Text: data.tui_ctgry_nam }));
          model.Tui_ctgry_IDListAll = r.Exc_cmb_tui_cat.map((data) => ({ ID: data.tui_ctgry_id, Text: data.tui_ctgry_nam }));
          if(loadData){
            model.DefaultBookFeeType = r.BookingFeeType;
            model.Input.BookFeeTyp = model.DefaultBookFeeType.Percentage;
          }         
          if (r.GetOvrride.length !== 0 && loadData) {
            model.ovrd_srl = r.GetOvrride[0].ovrd_srl;
            model.Input.supp_map_id = r.GetOvrride[0].supp_map_id;
            // model.Input.Prod_Name = r.GetOvrride[0].tui_prod_nam;
            me.setTuiCatgry(r.GetOvrride[0].tui_ctgry_ids);
            model.Input.Featured_Prod = r.GetOvrride[0].prod_featrd.toUpperCase() == "TRUE" ? true : false;
            model.Input.Sort = r.GetOvrride[0].sort_ordr;
            model.Input.Latitude = r.GetOvrride[0].latitude;
            if (!Utils.isNullOrEmpty(r.GetOvrride[0].bkng_fee_typ)) {
              model.Input.BookFeeTyp = r.GetOvrride[0].bkng_fee_typ;
            }
            else {
              model.Input.BookFeeTyp = model.DefaultBookFeeType.Percentage;
            }
            model.Input.Booking_fee = r.GetOvrride[0].bkng_fee;
            model.Input.Longitude = r.GetOvrride[0].longitude;
            model.WKLImage_Upload = r.GetOvrride[0].img_nam;
            model.WKLImage_Url = r.GetOvrride[0].img_url;
            model.WKLImage_SNO = r.GetOvrride[0].img_srl;
            model.Input.IsEdit = true;

            var dataCopyEx = me.getData();
            me.Data.imageCopy = r.GetOvrride[0].img_nam;
            me.Data.DataCopy = JSON.stringify(dataCopyEx);
          }
          if (r.GetOvrride.length === 0 && loadData) {
            me.setTuiCatgry(r.dtl_tui_ctgry_ids);
            var dataCopyEx1 = me.getData();
            me.Data.DataCopy = JSON.stringify(dataCopyEx1);
          }
          if (r.GetImagedata.length != 0) {
            model.Input.Image_path = r.GetImagedata[0].img_path;
          }
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

  setTuiCatgry(value) {
    const model = this.Data;
    model.Input.Tui_ctgry_ID = [];
    if (value !== null && value !== '') {
      value = value.split(',');
      value.forEach((id) => { model.Input.Tui_ctgry_ID.push(model.Tui_ctgry_IDListAll.find(i => i.ID === id)) });
      model.Input.Tui_ctgry_ID = model.Input.Tui_ctgry_ID.filter(ctgry => ctgry !== undefined);
      model.Input.Tui_ctgry_ID = model.Input.Tui_ctgry_ID.length === 0 ? null : model.Input.Tui_ctgry_ID;
    }
    else {
      model.Input.Tui_ctgry_ID = null;
    }
    for (const itm of model.Tui_ctgry_IDList) {
      itm.isSelected = false;
    }


    this.updateUI();
  }

  onBlurCheck(name) {
    const model = this.Data;
    const me = this;
    if (!Utils.isNullOrEmpty(model.ImageNameExists)) {
      if (model.ImageNameExists.includes(name)) {
        me.showAlert('Image already exists.');
        model.WKLImage_Upload = "";
        model.Image_Array = null;
      }
    }
    this.updateUI();
  }

  fillSearchResult(r, selectedItem = null) {
    const model = this.Data;
    const gridInfo = model.GridInfo;
    gridInfo.Items = r.ExpLanggrid || [];
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
  setSelectedItem(selectedItem, loadData = false) {
    const model = this.Data;
    model.GridInfo.SelectedItem = selectedItem;
    model.GridInfo.SelectedItem.isSelected = true;
  }
  handleSave(e) {
    const me = this;
    const model = this.Data;
    if (this.isValueChanged()) {
      this.doSave(e);
    }
    else {

      me.showAlert("No changes has been made.", 'Booking_fee');

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
    if (!Utils.isNullOrEmpty(model.WKLImage_SNO)) {
      dataInfo.OldImg = "YES";
    }
    else {
      dataInfo.OldImg = "NO";
    }
    dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
    dataInfo.Savedata = model.Input.IsEdit ? "UPDATE" : "INSERT";
    dataInfo.ovrd_srl = model.ovrd_srl;
    model.Loading = true;
    me.updateUI();
    Utils.ajax({ url: `${this._WebApi}/SSM024SaveDataSectionEdit`, data: dataInfo, files: model.Image_Array || [] }, r => {
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
    let pageNo = model.GridInfo.Page;
    me.showAlert('Data saved successfully', '');
    me.close();
  }

  // handleDelete(e) {

  //   const me = this;
  //   const model = this.Data;
  //   if (!model.Input.IsEdit) {
  //     return;
  //   }
  //   const dataInfo = {};
  //   dataInfo.prod_id = model.Input.Prod_ID;
  //   dataInfo.img_srl = model.WKLImage_SNO;
  //   dataInfo.mod_by_usr_cd = ApiManager.getUser().ID;
  //   dataInfo.ovrd_srl = model.ovrd_srl;
  //   model.Loading = true;
  //   me.updateUI();
  //   Utils.ajax({ url: `${this._WebApi}/SSM024RemoveImage`, data: dataInfo, files: '' || [] }, r => {
  //     try {
  //       model.Loading = false;
  //       r = r || {};
  //       if (r.IsSuccess === true) {
  //         model.IsSaved = true;
  //         me.handleDeleteFollowup(e);
  //       }
  //       else {
  //         me.showAlert('Something went wrong');
  //       }
  //     }
  //     catch (ex) { }
  //     finally {
  //       me.updateUI();
  //     }
  //   });
  // }
  // handleDeleteFollowup(e) {
  //   const me = this;
  //   const model = this.Data;
  //   model.Image_Array = null;
  //   model.WKLImage_Upload = null;
  //   model.WKLImage_Url = null;
  //   model.WKLImage_SNO = null;
  //   model.imageCopy = null;
  //   var dataCopyEx = this.getData();
  //   this.Data.DataCopy = JSON.stringify(dataCopyEx);
  //   me.showAlert('Image removed successfully', '');

  // }
  handleValueChange(followUpAction) {
    const model = this.Data;
    if (this.isValueChanged()) {
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
    const dataModel = this.Data.Input;
    model.Title = `Tui Product / Edit / ${model.City_Name} / ${dataModel.Prod_Name}`;

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
    const model = this.Data.Input;
    console.log("Props EDIT CLICK ".item);

    this.openWindow("sec2_Edit", item);
  }
  openWindow(type, InputObj) {
    const model = this.Data;
    let Prod_ID = this.props.data.Prod_ID;
    let Prod_Name = this.props.data.Prod_Name;
    let IsEdit = '';
    let Url = '';
    if (type == "btn_Lat_click") {
      Url = 'SSM/SSM026';
      this.showWindow({
        url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, Prod_Name: Prod_Name, InputData: InputObj, lat: model.Input.Latitude, lng: model.Input.Longitude }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

          console.log('Langtitude', e)
          if (e) {
            model.Input.Latitude = e.lat;
            model.Input.Longitude = e.lng;
          }

        }
      });
    }
    else if (type == "sec2_New") {
      Url = 'SSM/SSM025';
      IsEdit = false;
      this.showWindow({
        url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, Prod_Name: Prod_Name, InputData: InputObj, SuppMapID: model.SuppMapID, lat: model.Input.Latitude, lng: model.Input.Longitude }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
          this.loadPage(1, false, false);
        }
      });
    }
    else if (type == "sec2_Edit") {
      Url = 'SSM/SSM025';
      IsEdit = true;
      this.showWindow({
        url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, Prod_Name: Prod_Name, InputData: InputObj, SuppMapID: model.SuppMapID, lat: model.Input.Latitude, lng: model.Input.Longitude }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
          this.loadPage(1, false, false);
        }
      });
    }
    else if (type == "btn_Addimg_tui") {
      Url = 'SSM/SSM009';
      IsEdit = true;
      this.showWindow({
        url: Url, data: { Title: this.props.data.Title, IsEdit: IsEdit, Prod_ID: Prod_ID, Supp_ID: model.SuppMapID, Prod_Name: Prod_Name, Imag_Dir: model.ImageDirectory }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {
          if (e) {
            model.WKLImage_SNO = e.img_srl;
            model.WKLImage_Upload = e.img_nam;
            model.WKLImage_Url = e.img_url;
          }
        }
      });
    }
  }
}
