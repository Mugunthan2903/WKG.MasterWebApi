import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";


export default class SMST040VM extends VMBase {
  constructor(props) {
    super(props);
    this.setTitle();
    this.loadInitData();
    
  }
  loadInitData() {

    const model = this.Data;
    model.GridInfo = {
      Items: [{
        "id": 1,
        "firstName": "London Group",
        "lastName": "Doe",
        "age": 20,
        "gender": "Male",
        "status": "Active",
        "major": "Computer Science",
        "city": "New York"
      },
      {
        "id": 2,
        "firstName": "London Group",
        "lastName": "Smith",
        "age": 22,
        "gender": "Female",
        "status": "InActive",
        "major": "Mathematics",
        "city": "Los Angeles"
      },
      {
        "id": 3,
        "firstName": "London Group",
        "lastName": "Johnson",
        "age": 21,
        "gender": "Male",
        "status": "InActive",
        "major": "Physics",
        "city": "Chicago"
      },
      {
        "id": 4,
        "firstName": "Heathrow Group",
        "lastName": "Davis",
        "age": 19,
        "gender": "Female",
        "status": "Active",
        "major": "Chemistry",
        "city": "Houston"
      },
      {
        "id": 5,
        "firstName": "Heathrow Group",
        "lastName": "Brown",
        "age": 23,
        "gender": "Male",
        "status": "InActive",
        "major": "Biology",
        "city": "San Francisco"
      },],

      Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 12
    };
    model.GridInfo.Columns = [
      { text: 'Name', field: 'firstName', width: '70%' },
      { text: 'Status', field: 'status', width: '30%' }
    ];

    model.GridInfo1 = {
      Items: [{
        "id": 1,
        "firstName": "WIT001",
        "lastName": "BHRC",
        "age": 20,
        "gender": "Male",
        "status": "Active",
        "major": "Computer Science",
        "city": "New York"
      },
      {
        "id": 2,
        "firstName": "WIT002",
        "lastName": "Maters",
        "age": 22,
        "gender": "Female",
        "status": "InActive",
        "major": "Mathematics",
        "city": "Los Angeles"
      },
      {
        "id": 3,
        "firstName": "London Group",
        "lastName": "Posmaters",
        "age": 21,
        "gender": "Male",
        "status": "InActive",
        "major": "Physics",
        "city": "Chicago"
      },
      {
        "id": 4,
        "firstName": "Heathrow Group",
        "lastName": "SSM",
        "age": 19,
        "gender": "Female",
        "status": "Active",
        "major": "Chemistry",
        "city": "Houston"
      },
      {
        "id": 5,
        "firstName": "Heathrow Group",
        "lastName": "PMS",
        "age": 23,
        "gender": "Male",
        "status": "InActive",
        "major": "Biology",
        "city": "San Francisco"
      },],

      Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5
    };
    model.GridInfo1.Columns = [
      { text: 'ID', field: 'age', width: '35%' },
      { text: 'Name', field: 'lastName', width: '55%' },
      { text: '', field: '', width: '10%' }
    ];

  }
  setFocus(name) {
    if (this.ComponentRef)
      this.ComponentRef.setFocus(name);
  }
  setTitle() {
    const model = this.Data;
    model.Title = `SMST040`;
  }
  doClose() {
    this.close()
  }
  openWindow(type) {
    const model = this.Data;
    this.showWindow({
      url: 'SSMMaster/SMST041', data: { Title: '', SSMName: '', }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

      }
    });
  }
  openWindow1(type) {
    const model = this.Data;
    this.showWindow({
      url: 'SSMMaster/SMST041', data: { Title: '', SSMName: '', }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

      }
    });
  }
  openWindow2(type) {
    const model = this.Data;
    this.showWindow({
      url: 'SSMMaster/SMST050', data: { Title: '', SSMName: '', }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

      }
    });
  }
}