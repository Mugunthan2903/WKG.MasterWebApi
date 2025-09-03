import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class HOME001VM extends VMBase {
    constructor(props) {
        super(props);
        this.setTitle();
        this.loadInitData();
    }
    loadInitData() {

        const model =this.Data;
        model.GridInfo = { Items: [ {
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
            
        Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 13 };
        model.GridInfo.Columns = [
            { text: 'Name', field: 'firstName', width: '70%' },
            { text: 'Status', field: 'status', width: '30%' }
        ];

    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        model.Title = `SSM Group`;
    }
    doClose() {
        this.close()
    }
}