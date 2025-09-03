import React from 'react';
import SSM026VM from './SSM026VM';
import * as cntrl from '../../../wkl-components';
import WKLGoogleMapMarker from '../../WKLGoogleMapMarker';

export default class SSM026 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM026VM(props));
        this.inputRefs = {};
    }
    // called on load
    onLoad = () => {
        window.setTimeout(function () {
            // if (this.VM)
            //     this.VM.loadInitData(this.inputRefs.GoogleMap);
        }.bind(this), 100)
    }
    MapLoaded(me) {
        if (me.inputRefs.GoogleMap && me.VM.Data.loadInit) {
            me.VM.loadInitData(this.inputRefs.GoogleMap);
        }
    }
    // called on closing
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };
    onChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            if (e.name) {
                model[e.name] = e.value;
            }
            this.updateUI();
        }
    };
    onMarkerChange(e, me) {
        if (me) {
            const model = me.VM.Data;
            model.loc_lat = e.lat.toFixed(9);
            model.loc_lng = e.lng.toFixed(9);
            me.updateUI();
        }
    }
    onSearch(e, me) {
        const model = me.VM.Data;
        console.log(e)
        model.loc_lat = e.lat().toFixed(9);
        model.loc_lng = e.lng().toFixed(9);
        me.updateUI();
    }
    // handles all button clicks
    clickAction = (e) => {
        if (this.VM) {
            if (e) {
                let action = e.id;
                if (action === undefined && e.target) {
                    action = e.target.name || e.target.id || '';
                    e = undefined;
                }
                if (!action) {
                    return;
                }

                try {
                    if (e && e.stopPropagation) {
                        e.stopPropagation();
                        e.preventDefault();
                        e.nativeEvent.stopImmediatePropagation();
                    }

                } catch (ex) { }

                if (action == "btn_clear") {
                    const london = this.VM.Data.defaultLocation;
                    this.VM.handleClear();
                    this.inputRefs.GoogleMap.search({ location: london })
                }
                else if (action == "btn_set_location") {
                    this.VM.handleSetLocation();
                }
                else if (action == "btn_close") {
                    this.VM.doClose();
                }
                else if (action == "btn_search") {
                    if (this.inputRefs.GoogleMap)
                        this.VM.handleSearch(this.inputRefs.GoogleMap);
                }
            }
        }
    }
    // used to set focus for input controls based on name
    setFocus(name) {
        if (this.inputRefs && this.inputRefs[name] && this.inputRefs[name].focus) {
            try {
                this.inputRefs[name].focus(true);
            }
            catch {
                this.inputRefs[name].focus();
            }
        }
    }
    //function that adds ref of input controls to the inputRefs object based on name
    onRefChange(el, name) {
        this.inputRefs[name] = el;
    }
    // function the that renders form
    renderForm() {
        const model = this.VM.Data;

        return (<form>
            <div className="col-md-12">
                <div className="mb-2">
                    <div className='row'>
                        <div className='col-md-4'>
                            <label className="form-label">Location</label>
                            <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'location_S')} name="location_S" value={model.location_S} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase}>
                            </cntrl.WKLTextbox>
                        </div>
                        <div className='col-md-3'>
                            <label className="form-label">Post Code</label>
                            <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'post_code_S')} name="post_code_S" value={model.post_code_S} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.sentenceCase}>
                            </cntrl.WKLTextbox>
                        </div>
                        <div className='col-md-1 d-flex flex-row justify-content-end align-items-end pt-3'>
                            <button type="button" id="btn_search" hot-key="p" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_search' })}><i className="fa fa-search"></i> </button>
                            <button type="button" id="btn_clear" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_clear' })}><i className="fa fa-refresh"></i> </button>
                        </div>
                        <div className='col-md-2 border-start'>
                            <label className="form-label">Latitude</label>
                            <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'loc_lat')} name="loc_lat" value={model.loc_lat} onChange={this.onChange} prefix={6} suffix={9} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both}>
                            </cntrl.WKLTextbox>
                        </div>
                        <div className='col-md-2'>
                            <label className="form-label">Longitude</label>
                            <cntrl.WKLTextbox mandatory={true} ref={(el) => this.onRefChange(el, 'loc_lng')} name="loc_lng" value={model.loc_lng} onChange={this.onChange} prefix={6} suffix={9} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both}>
                            </cntrl.WKLTextbox>
                        </div>

                    </div>
                </div>
            </div>
        </form>);
    }
    render() {
        const me = this;
        const model = this.VM.Data;
        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;

        }
        return (
            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area p-3 vh-100" style={{ width: "70rem" }}>
                    <div className="container-fluid p-0 h-100">
                        <div className="row">
                            <div className="col-md-12">
                                {this.renderForm()}
                            </div>
                        </div>
                        <div className='row mt-4'>
                            <WKLGoogleMapMarker MapLoaded={() => this.MapLoaded(me)} onSearch={(e) => this.onSearch(e, me)} onChange={(e) => this.onMarkerChange(e, me)} apiKey={cntrl.Utils.ConfigInfo.GmapKey || ''} ref={(e) => this.onRefChange(e, 'GoogleMap')} />
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                        </div>
                        <div className="col">
                        </div>
                        <div className="col-auto">
                            <cntrl.WKLButtonWrapper id={'btn_set_location'} formID={model.FormID} onClick={this.clickAction}>
                                <button type="button" hot-key="S" className="btn btn-sm btn-save1 btn-primary me-1"><i className="fa fa-save"></i> Set Location</button>
                            </cntrl.WKLButtonWrapper>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>
        )
    }
}