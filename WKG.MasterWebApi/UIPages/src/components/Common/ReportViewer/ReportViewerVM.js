
import * as cntrl from '../../../wkl-components';

export default class ReportViewerVM extends cntrl.VMBase {
    constructor(props) {
        super(props);
        const model = this.Data;
        if (Object.keys(model).length !== 0)
            return;

        model.Title = 'Report';
        model.Url = cntrl.Utils.getApiConfig().ReportUrl;
        model.PostDataList = [];
        model.IsLandscape = false;

        if (this.props.data) {
            model.Title = this.props.data.Title || '';
            model.IsLandscape = this.props.data.IsLandscape === true;
            model.PostDataList = this.props.data.PostDataList || [];
        }
    }

    doClose() {
        this.close({});
    }
}
