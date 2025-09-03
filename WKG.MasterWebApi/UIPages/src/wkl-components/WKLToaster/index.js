
import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types';
import { WKLMessageboxTypes } from '../WKLEnums';
import { Utils } from '../Utils';
import styles from './index.module.css'

const Icon = ({ type }) => {

    let title = {
        icon: '',
        className: ''
    };
    if (type === WKLMessageboxTypes.error) {
        title.icon = 'error';
        title.className = 'text-danger';
    } else if (type === WKLMessageboxTypes.info) {
        title.icon = 'info';
        title.className = 'text-info';
    } else if (type === WKLMessageboxTypes.question) {
        title.icon = 'help';
        title.className = 'text-black';
    } else if (type === WKLMessageboxTypes.warning) {
        title.icon = 'warning';
        title.className = 'text-warning';
    }
    return <span className={["material-icons pe-2", title.className].join(" ")}>{title.icon}</span>
}
const ToasterBody = (props) => {
    const bodyElement = <div className={["toast-body", styles.toastBody].join(" ")}>{props.message}</div>;
    if (props.showTitle) {
        return bodyElement;
    }
    else {
        return <div class="d-flex">
            {bodyElement}
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    }
}
const WKLToaster = (props) => {
    const toasterRef = useRef(null);
    const autoHideTimer = useRef(null);
    // const toasterRefCallBack = useCallback(node => {
    //     if (node !== null) {
    //         toasterRef = node;
    //         toasterRef.addEventListener('hidden.bs.toast', handleClose);
    //     }
    // }, []);
    useEffect(() => {
        let toasterRefElemnt = null;
        if (toasterRef.current) {
            toasterRefElemnt = toasterRef.current;
            toasterRefElemnt.addEventListener('hidden.bs.toast', handleClose);
        }
        handleCustomEvents();
        return () => {
            if (toasterRefElemnt) {
                toasterRefElemnt.removeEventListener('hidden.bs.toast', handleClose, true);
            }
        }
    }, [])
    const clearTimer = () => {
        if (autoHideTimer.current) {
            window.clearTimeout(autoHideTimer.current);
        }
    }
    const handleCustomEvents = () => {
        if (props.autoHide) {
            clearTimer();
            autoHideTimer.current = window.setTimeout(handleClose, props.autoHideInterval * 1000);
        }
    }
    const handleClose = (e) => {
        clearTimer();
        Utils.invoke(props.onClose, e);
    }

    return <div ref={toasterRef} className="toast-container position-absolute top-0 end-0 p-3" style={{ zIndex: '2000' }}>
        <div className={["toast show", !props.showTitle ? "align-items-center" : ''].join(" ")} role="alert" aria-live="assertive" aria-atomic="true"  >
            {props.showTitle && <div className="toast-header">
                <Icon type={props.toasterType} />
                <strong className="me-auto">{props.title}</strong>
                <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close" />
            </div>}
            <ToasterBody {...props}></ToasterBody>
        </div>
    </div>
}
export { WKLToaster };
WKLToaster.propTypes = {
    title: PropTypes.string,
    showTitle: PropTypes.bool,
    onClose: PropTypes.func,
    message: PropTypes.any,
    autoHide: PropTypes.bool,
    toasterType: PropTypes.string,
    autoHideInterval: PropTypes.number
}
WKLToaster.defaultProps = {
    autoHide: true,
    toasterType: WKLMessageboxTypes.info,
    showTitle: true,
    autoHideInterval: 2
};