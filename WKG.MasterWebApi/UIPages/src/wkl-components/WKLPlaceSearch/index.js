import React from 'react';
import PropTypes from 'prop-types';
import { WKLTextbox } from '../WKLTextbox';
import { Loader } from '@googlemaps/js-api-loader';

/* eslint-disable */
export class WKLPlaceSearch extends React.Component {
    constructor(props) {
        super(props);
        this.autocomplete = null;
        this.placeListner = null;
    }

    componentDidMount() {
        window.setTimeout(() => { this.initPlaceSearch() }, 100);
    }
    componentWillUnmount() {
        try {

            if (this.autocomplete) {
                //this.autocomplete.removeListener(this.placeListner);
                this.placeListner = null;
                //google.maps.event.clearInstanceListeners(this.autocomplete);
                this.autocomplete = null;
            }
        }
        catch (ex) { }
    }
    static propTypes = {
        name: PropTypes.string,
        style: PropTypes.object,
        allowClear: PropTypes.bool,
        placeHolder: PropTypes.string,
        readOnly: PropTypes.bool,
        disabled: PropTypes.bool,
        onChange: PropTypes.func,
        isCitySearch: PropTypes.bool,
        apiKey: PropTypes.string.isRequired
    };
    static defaultProps = {
        name: '',
        style: { width: '100%' },
        allowClear: true,
        placeHolder: '',
        readOnly: false,
        disabled: false,
        onChange: undefined,
        isCitySearch: false,
        apiKey: ''
    };
    initPlaceSearch() {
        var options = {
            componentRestrictions: { country: this.props.country_Cd || 'GB' }, libraries: ["places"]
        };
        //if (!this.props.isCitySearch)
        //options = {componentRestrictions: { country: 'uk'},libraries: ["places"],region: "GB"}


        const loader = new Loader({
            apiKey: this.props.apiKey,
            version: "weekly"/*,
            ...additionalOptions,*/
        });

        loader.load().then(async (google) => {

            const { Autocomplete } = await google.maps.importLibrary("places");
            this.autocomplete = new Autocomplete((this.inputPlaceSearch.textInput), options);
            this.placeListner = this.autocomplete.addListener('place_changed', () => {
                this.getAddress();
            });
        });
    }

    focus = () => {
        try {
            this.inputPlaceSearch.focus();
        }
        catch (ex) { }
    }
    getAddress = () => {
        var place = this.autocomplete.getPlace();
        if (place) {
            let lat = place.geometry.location.lat();
            let lng = place.geometry.location.lng();
            let response = {
                Address: place.formatted_address,
                placeName: place.name + ", " + place.formatted_address,
                geocode: { lat: lat, lng: lng },
                country: {},
                province: {},
                city: {},

                //postalcode changed mk
                postalCode: ''
            }
            place.address_components.map((item, index) => {

                if (item.types.includes("country")) {
                    response.country = {
                        code: item.short_name,
                        name: item.long_name
                    }
                }
                if (item.types.includes("administrative_area_level_1")) {
                    response.province = {
                        code: item.short_name,
                        name: item.long_name
                    }
                }
                if (item.types.includes("locality")) {
                    response.city = {
                        code: item.short_name,
                        name: item.long_name
                    }
                }
                //postalcode changed mk
                if (item.types.includes("postal_code")) {
                    response.postalCode = item.long_name;
                }
            })
            if (this.props.onChange) {
                this.props.onChange({ name: this.props.name, value: response, response: place });
            }
        }
    }
    onClearChange = () => {
        if (this.props.onChange) {
            this.props.onChange({ name: this.props.name, value: null, response: null });
        }
    }
    render() {
        let inputAttr = {};
        inputAttr.textAlign = 'left';
        inputAttr.inputType = 'textbox';
        inputAttr.name = this.props.name;
        inputAttr.mandatory = this.props.mandatory;
        inputAttr.style = this.props.style;
        inputAttr.allowClear = this.props.allowClear;
        inputAttr.placeHolder = this.props.placeHolder;
        inputAttr.readOnly = this.props.readOnly;
        inputAttr.disabled = this.props.disabled;
        inputAttr.value = this.props.value;

        return (<WKLTextbox ref={el => this.inputPlaceSearch = el} onChange={this.props.onChange} {...inputAttr} onClear={this.onClearChange} />);
    }
}
