import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from "../../../wkl-components";

export default class SMST050VM extends VMBase {
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
                "firstName": "Activities",
                "lastName": "Doe",
                "age": 20,
                "gender": "Male",
                "status": "Active",
                "major": "Computer Science",
                "city": "New York"
            },
            {
                "id": 2,
                "firstName": "Theatre",
                "lastName": "Smith",
                "age": 22,
                "gender": "Female",
                "status": "Inactive",
                "major": "Mathematics",
                "city": "Los Angeles"
            },
            {
                "id": 3,
                "firstName": "Tours",
                "lastName": "Johnson",
                "age": 21,
                "gender": "Male",
                "status": "Active",
                "major": "Physics",
                "city": "Chicago"
            },
            {
                "id": 4,
                "firstName": "Tours",
                "lastName": "Davis",
                "age": 19,
                "gender": "Female",
                "status": "Active",
                "major": "Chemistry",
                "city": "Houston"
            },
            {
                "id": 5,
                "firstName": "E-Shuttle",
                "lastName": "Brown",
                "age": 23,
                "gender": "Male",
                "status": "Inactive",
                "major": "Biology",
                "city": "San Francisco"
            }]
            , Page: 1, TotalPage: 0, TotalCount: 0, SelectedItem: null, PageSize: 5
        };
        model.GridInfo.Columns = [
            { text: 'Name', field: 'firstName', width: '30%' },
            { text: 'Sort Order', field: 'id', width: '30%' },
            { text: 'Status', field: 'status', width: '30%' },
            { text: '', field: 'status', width: '10%' },
        ];
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    setTitle() {
        const model = this.Data;
        model.Title = `SMST050`;
    }
    doClose() {
        this.close()
    }
    openWindow(type) {
        const model = this.Data;
        if (type == "1") {


            this.showWindow({
                url: 'SSMMaster/SMST051', data: { Title: '', SSMName: '', }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

                }
            });
        }
        else if (type == "2") {


            this.showWindow({
                url: 'SSMMaster/SMST052', data: { Title: '', SSMName: '', }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

                }
            });
        }
        else if(type == "3") {


            this.showWindow({
                url: 'SSMMaster/SMST053', data: { Title: '', SSMName: '', }, windowStyle: WKLWindowStyles.slideLeft, onClose: (e) => {

                }
            });
        }
    }
}