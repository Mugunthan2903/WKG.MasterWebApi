import * as cntrl from './../../../wkl-components';
import GNM002VM from './GNM002VM';

export default class GNM002 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new GNM002VM(props));
        this.inputRefs = {};
    }
    onLoad = () => {
        this.VM?.initDataLoad();
    }
    onClosing = () => {
        //return false;
    }

    render() {
        const model = this.VM.Data;
        return (<cntrl.WKLControl wrapperClass="modal-xl" loading={model.IsLoading} title={"title"}
            showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
            <div className="window-content-area p-3">
                <div className="container-fluid p-0">
                    <div className="row">
                        <div className="mb-2">
                            <label className="form-label" >GL Account<span className='text-danger'>*</span></label>
                            <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'SearchText')} name="Text" value="" onChange={this.onSearchChange} inputType={cntrl.WKLTextboxTypes.sentenceCase} maxLength={100}>
                            </cntrl.WKLTextbox>  
                            {/* dataModel.Text */}
                        </div>
                    </div>
                </div>
            </div>

            <div className="window-button-area">
                <div className="row">

                </div>
            </div>
        </cntrl.WKLControl>);
    }
}