import React from 'react';
import SMST024VM from './SMST024VM';
import * as cntrl from '../../../wkl-components';

class SMST024 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SMST024VM(props));
        this.inputRefs = { header: null, childs: {} };
        this.map = null;
        this.marker = null;
        this.apiKey = "AIzaSyDA1WUzWvY-QG_eFB8_Zm8raNugilrAGEY";
        this.londonCoordinates = { lat: 51.5074, lng: -0.1278 };
    }
    onLoad = () => {
        window.setTimeout(function () {
            // if (this.VM)
            // this.VM.loadInitData();
        }.bind(this), 100)
    }
    onChange = (e) => {
        if (this.VM) {
            const model = this.VM.Data;
            if (e.name)
                model[e.name] = e.value;
            else if (e.target && e.target.name)
                model[e.target.name] = e.target.value;

            this.updateUI();
        }
    };
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    }

    setFocus = (name) => {
        if (this.inputRefs[name] && this.inputRefs[name].focus) {
            this.inputRefs[name].focus();
        }
    }

    onRefChange = (el, name) => {
        this.inputRefs[name] = el;
    }

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
                if (action === "btn_close") {
                    this.VM.doClose(e);
                }

                else if (action == "btn_cancel") {
                    this.VM.handleSearchClear();
                }

            }
        }
    }
    componentDidMount() {
        this.loadScript();
    }

    initMap = () => {
        const me = this;
        this.map = new window.google.maps.Map(document.getElementById('map'), {
            center: this.londonCoordinates,
            zoom: 10
        });

        this.marker = new window.google.maps.Marker({
            position: this.londonCoordinates,
            map: this.map,
            draggable: true
        });

        window.google.maps.event.addListener(this.marker, 'dragend', (event) => {
            const model = this.VM.Data;
            // document.getElementById('latitude').value = event.latLng.lat();
            // document.getElementById('longitude').value = event.latLng.lng();
            model.SMST024_latitude = event.latLng.lat();
            model.SMST024_longitude = event.latLng.lng();
            console.log(event.latLng.lat(), "Lattud e");
            console.log(event.latLng.lng(), "lng");
            me.updateUI();

        });

        this.isMapInitialized = true;
    }

    setMarker = () => {
        const model = this.VM.Data;
        const waitForMapInitialization = () => {
            if (!this.isMapInitialized) {
                setTimeout(waitForMapInitialization, 100);
            } else {
                this.setMarker(); // Call the setMarker function once the map is initialized
            }
        };

        if (!this.isMapInitialized) {
            // Map not initialized yet, wait for initialization
            waitForMapInitialization();
            return;
        }

        // Now you can safely interact with the map
        const latitude = parseFloat(model.SMST024_latitude);
        const longitude = parseFloat(model.SMST024_longitude);
        const newPosition = { lat: latitude, lng: longitude };
        this.map.setCenter(newPosition);
        this.marker.setPosition(newPosition);
    };

    loadScript = () => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&callback=initMap`;
        script.onload = this.initMap; // Call initMap after script has loaded
        document.body.appendChild(script);
    }

    render() {
        const model = this.VM.Data;
        let title = 'Latitude & Longitude Selection';
        let showloading = false;


        return (

            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="window-content-area w-100 vh-100 p-3" style={{ width: "50rem" }}>
                    <div className="container-fluid h-100 p-0">
                        <div className="row h-100">
                            <div className="row col-md-12">
                                <div className='col-md-6'>
                                    <div className="mb-2">
                                        <label className="form-label" >Latitude</label>
                                        <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'SMST024_latitude')} id="latitude" name="SMST024_latitude" allowClear={true} value={model.SMST024_latitude} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} prefix={65} suffix={59}>
                                        </cntrl.WKLTextbox>
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className="mb-2">
                                        <label className="form-label" >Longitude</label>
                                        <cntrl.WKLTextbox ref={(el) => this.onRefChange(el, 'SMST024_longitude')} id="longitude" name="SMST024_longitude" allowClear={true} value={model.SMST024_longitude} onChange={this.onChange} inputType={cntrl.WKLTextboxTypes.numeric} numericType={cntrl.WKLNumericTypes.both} prefix={86} suffix={29}>
                                        </cntrl.WKLTextbox>
                                    </div>
                                </div>
                                <div className='col-md-4 m-auto'>
                                </div>
                            </div>

                            <div id="map" style={{ width: '100%', height: '400px' }}></div>
                        </div>
                    </div>
                </div>
                <div className="window-button-area">
                    <div className="row" style={{ justifyContent: "end" }}>
                        <div className="col-auto">
                            <button type="button" id="btn_new1" hot-key="N" className="btn btn-sm btn-add1 btn-primary me-1" onClick={this.setMarker} ><i className="fa fa-save"></i> Set Location</button>
                            <button type="button" id="btn_cancel" hot-key="L" className="btn btn-sm btn-clear1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_cancel' })}><i className="fa fa-refresh"></i> Clear</button>
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>

                    </div>
                </div>
            </cntrl.WKLControl>

        );
    }
}

export default SMST024;