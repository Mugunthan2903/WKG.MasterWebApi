import React, { useEffect, useRef, useImperativeHandle } from 'react';
import * as cntrl from '../../wkl-components';
import { Loader } from '@googlemaps/js-api-loader';
import MarkerImage from './1.png';

/**
    * @description properties & events of the control
    * -----------------Prop---------------------
    * @param { Object } defaultLocation - object {lat: numeric; lng: numeric}
    * @param { String } apiKey - google map api key
    * @param { String } name - name of the control
    * @param {func} onChange - object {name: string; lat: numeric; lng: numeric, address: string, data: google object}
    * @param {func} onSearchError - object {location: object {lat: numeric; lng: numeric}; address: string; zipCode: string; country: string}
    * @description Methods of the control
    * -------------------------------------------------------------
    * * @param {func} search - object {name: string; message: string}
    */
const WKLGoogleMapMarker = React.forwardRef((props, ref) => {
    const googleNS = useRef();
    const googleMarker = useRef();
    const googleMaps = useRef();
    const googleGeCoder = useRef();
    const googleMapContainer = useRef();


    // function onSearchResult(e, status) {
    //     const r = e || [];
    //     if (status === 'OK' && r.length > 0) {
    //         const result = r.first();
    //         googleMaps.current.fitBounds(result.geometry.viewport);
    //         initMarker(result.geometry.location);
    //     }
    //     else {
    //         if (props.onSearchError)
    //             props.onSearchError({ name: props.name, message: '' });
    //     }
    // }
    // new function for returning lat and lng 
    function onSearchResult(e, status) {
        const r = e || [];
        if (status === 'OK' && r.length > 0) {
            const result = r.first();
            googleMaps.current.fitBounds(result.geometry.viewport);
            if (props.onSearch) {
                props.onSearch(result.geometry.location)
            }
            initMarker(result.geometry.location);
        }
        else {
            if (props.onSearchError)
                props.onSearchError({ name: props.name, message: '' });
        }
    }

    useImperativeHandle(ref, () => ({
        search: (e) => {
            const addressList = [];

            let option = null;
            if (!cntrl.Utils.isNullOrEmpty(e.location)) {
                option = { location: { lat: +e.location.lat, lng: +e.location.lng } };
            }
            else {
                if (!cntrl.Utils.isNullOrEmpty(e.address))
                    addressList.push(e.address);
                if (!cntrl.Utils.isNullOrEmpty(e.zipCode))
                    addressList.push(e.zipCode);
                if (!cntrl.Utils.isNullOrEmpty(e.country))
                    addressList.push(e.country);

                if (addressList.length > 0) {
                    option = { partialmatch: true };
                    option.address = addressList.join(' ');
                }
            }


            googleGeCoder.current.geocode(option, onSearchResult);
        }
    }));

    function invokeOnChange(e) {
        if (props.onChange) {
            e = e || {};
            e.name = props.name || '';
            props.onChange(e);
        }
    }
    function createMarker(location) {
        // if (googleMarker.current) {
        //     googleNS.current.maps.event.removeListener(googleMarker.current, 'dragend', onDrageEnd);
        // }
        googleMarker.current = new googleNS.current.maps.Marker({
            position: location,
            map: googleMaps.current,
            draggable: true,
            icon: MarkerImage,
            zoom: 16,
            center: location
        });
    }
    function onDrageEnd() {
        let pos = this.getPosition();
        let jsonData = pos.toJSON();
        console.log(jsonData);

        googleGeCoder.current.geocode({ latLng: pos }, (e, stat) => {
            const r = e || [];
            if (r.length > 0) {
                let address = r.first();
                console.log(address);
                invokeOnChange({ lat: jsonData.lat, lng: jsonData.lng, address: address.formatted_address, data: address });
            }
            else {
                invokeOnChange({ lat: jsonData.lat, lng: jsonData.lng, address: null, data: null });
            }

        });
    }
    // function initMarker(location) {

    //     createMarker(location);
    //     /*  googleNS.current.maps.event.addListener(marker, 'drag', function () {
    //           console.log(this.getPosition());
    //       });*/

    //     googleNS.current.maps.event.addListener(googleMarker.current, 'dragend', onDrageEnd);

    // }
    // new function without creating new marker
    function initMarker(location) {

        if (googleMarker.current) {
            // Update position of existing marker
            googleMarker.current.setPosition(location);
        } else {
            // Create a new marker if it doesn't exist
            createMarker(location); // Call the original createMarker function
        }
        /*  googleNS.current.maps.event.addListener(marker, 'drag', function () {
              console.log(this.getPosition());
          });*/

        googleNS.current.maps.event.addListener(googleMarker.current, 'dragend', onDrageEnd);

    }


    useEffect(() => {

        const loader = new Loader({
            apiKey: props.apiKey,
            version: "weekly"/*,
            ...additionalOptions,*/
        });

        loader.load().then(async (google) => {
            googleNS.current = google;

            const { Map } = await google.maps.importLibrary("maps");

            let defaultLocation = { lat: 51.509750000, lng: -0.127611100 };//london
            if (props.defaultLocation) {
                defaultLocation = { ...props.defaultLocation };
            }

            const options = {
                mapTypeControl: true,
                navigationControl: false,
                scrollwheel: true,
                scaleControl: false,
                draggable: true,
                panControl: false,
                zoomControl: true,
                zoom: 16,
                center: defaultLocation,
                overviewMapControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.DEFAULT
                },
                streetViewControl: false
            };

            const geocoder = new google.maps.Geocoder();
            googleGeCoder.current = geocoder;
            if (props.MapLoaded && typeof props.MapLoaded === "function") {
                props.MapLoaded();
            }
            googleMaps.current = new Map(googleMapContainer.current, options);
            googleMaps.current.setOptions({ styles: [{ "featureType": "poi.business", "elementType": "labels", "stylers": [{ "visibility": "off" }] }] });
            initMarker(defaultLocation);
        });

    }, []);

    function onContainerInit(e) {
        googleMapContainer.current = e;

    }

    return (<div ref={onContainerInit} style={{ width: '100%', height: "430px" }}>

    </div>);
});

export default WKLGoogleMapMarker;