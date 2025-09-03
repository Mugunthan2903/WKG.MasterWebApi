import React from 'react';
import { WKLOverlay } from '../../wkl-components';

export default class SplashScreen extends React.Component {
    render() {
        return (<WKLOverlay loading={true} loadingText="Connecting to server............." />);
    }
}


