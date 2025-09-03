import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import * as cntrl from '../../../wkl-components';

export default class SSM026VM extends VMBase {
    constructor(props) {
        super(props);

        this.init();
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        const model = this.Data;
        model.FormID = "SSM026";
        model.Title = '';
        model.Loading = false
        model.DataCopy = null;
        model.loadInit = true;
        model.location_S = '';
        model.post_code_S = '';
        model.loc_lat = this.props.data.lat;
        model.loc_lng = this.props.data.lng;
        model.defaultLocation = {
            lat: "41.355423",
            lng: "-72.102760"
        }
        this.setTitle();
    }
    loadInitData(GoogleMap) {
        const model = this.Data;
        if (GoogleMap) {
            if (!Utils.isNullOrEmpty(model.loc_lat) && !Utils.isNullOrEmpty(model.loc_lng)) {
                model.loadInit = false;
                GoogleMap.search({ location: { lat: model.loc_lat, lng: model.loc_lng } });
            }
        }
    }
    handleSearch(GoogleMap) {
        const model = this.Data;
        if (GoogleMap) {
            const dataInfo = {
                address: model.location_S,
                zipCode: model.post_code_S
            };
            GoogleMap.search(dataInfo);
        }
    }
    handleClear() {
        const model = this.Data;
        model.loc_lat = "";
        model.loc_lng = "";

        this.updateUI();
    }
    handleSetLocation() {
        const model = this.Data;
        if (model.loc_lat === "") {
            this.showAlert('Please Enter Latitude', 'loc_lat');
        } else if (model.loc_lng === "") {
            this.showAlert('Please Enter Longitude', 'loc_lng');
        } else {
            this.close({
                lat: model.loc_lat,
                lng: model.loc_lng
            });
        }
    }
    isValueChanged() {
        var dataCopyEx = this.getData();
        return JSON.stringify(dataCopyEx) !== this.Data.DataCopy;
    }
    setFocus(name) {
        if (this.ComponentRef)
            this.ComponentRef.setFocus(name);
    }
    showConfirmation(msg, isThreeOption, callback) {
        let options = [{ text: 'Yes' }, { text: 'No' }];
        if (isThreeOption)
            options = [{ text: 'Yes' }, { text: 'No' }, { text: 'Cancel' }];

        this.showMessageBox({
            text: msg,
            buttons: options,
            messageboxType: WKLMessageboxTypes.info,
            onClose: callback
        });
    }
    getData() {
        const model = this.Data.Input;
        const dataInfo = {};
        return dataInfo;
    }
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
    setTitle() {
        const model = this.Data;
        model.Title = `Set Location`;
    }
    doClose() {
        this.close();

    }
}