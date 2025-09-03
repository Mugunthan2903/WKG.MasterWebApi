import React from 'react';
import ReportViewerVM from './ReportViewerVM';
import * as cntrl from '../../../wkl-components';
import './index.css';

export default class ReportViewer extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new ReportViewerVM(props));
    }
    onClosing = (e) => {
        if (this.VM)
            this.VM.doClose();
        return false;
    };
    render() {

        let model = this.VM.Data || {};

        let cls = 'wkl-report-viewer-A4 wkl-report-viewer-center shadow';
        if (model.IsLandscape === true)
            cls = 'wkl-report-viewer-A4-landscape wkl-report-viewer-center shadow';

        return (
            <cntrl.WKLControl className="w-100" hideTitleBar={true}
                title={model.Title}
                onClose={this.onClosing}
                context={this.props.context} >
                <div className="col container-fluid wkl-report-viewer">
                    <div className={cls} >
                        <cntrl.WKLIFrame url={model.Url} postDataList={model.PostDataList} mode="tab" ></cntrl.WKLIFrame>
                    </div>
                </div>
            </cntrl.WKLControl>);
    }
}
