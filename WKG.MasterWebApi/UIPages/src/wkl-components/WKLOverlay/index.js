import React from 'react';
import './index.css';

const WKLLoading = (props) => {
    const { text } = props;
    return (<div className="wkl-loader">
        {/* <div className="wkl-spinner-grow">
            <span className="wkl-sr-only"></span>
        </div> */}
        <img src="assets/images/loader.png" alt="" width="80px"></img>
        <span className="wkl-loading-text">{text}</span>
    </div>);
};

const WKLOverlay = (props) => {
    let { loading, loadingText } = props;
    if (loading === true)
        loading = true;
    loadingText = loadingText || 'Loading';
    return (<div className="wkl-overlay">
        {loading === true && <WKLLoading text={loadingText} />}
    </div>);
};

export { WKLOverlay };