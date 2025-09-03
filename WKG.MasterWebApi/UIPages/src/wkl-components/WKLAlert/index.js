import { useContext, useEffect, useRef } from 'react';
import { WKLBody, WKLContext } from '..';
import { Utils } from '../Utils';
import { WKLMessageboxTypes } from '../WKLEnums';
import './index.css';


//https://getbootstrap.com/docs/5.0/components/alerts/
// const InfoSvg = (props) => {
//     let ht = props.height || 24;
//     let wd = props.height || 24;

//     return (<svg fill="currentColor" viewBox="0 0 16 16" width={ht} height={wd}>
//         <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
//     </svg>);
// };
// const SuccessSvg = (props) => {
//     let ht = props.height || 24;
//     let wd = props.height || 24;

//     return (<svg fill="currentColor" viewBox="0 0 16 16" width={ht} height={wd}>
//         <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
//     </svg>);
// };
// const WarningSvg = (props) => {
//     let ht = props.height || 24;
//     let wd = props.height || 24;

//     return (<svg fill="currentColor" viewBox="0 0 16 16" width={ht} height={wd}>
//         <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
//     </svg >);
// };
// const ConfirmSvg = (props) => {
//     let ht = props.height || 24;
//     let wd = props.height || 24;

//     return (<svg vfill="currentColor" viewBox="0 0 16 16" width={ht} height={wd}
//     >
//         <g>
//             <path d="M502.29,788.199h-47c-33.1,0-60,26.9-60,60v64.9c0,33.1,26.9,60,60,60h47c33.101,0,60-26.9,60-60v-64.9
//        C562.29,815,535.391,788.199,502.29,788.199z"/>
//             <path d="M170.89,285.8l86.7,10.8c27.5,3.4,53.6-12.4,63.5-38.3c12.5-32.7,29.9-58.5,52.2-77.3c31.601-26.6,70.9-40,117.9-40
//        c48.7,0,87.5,12.8,116.3,38.3c28.8,25.6,43.1,56.2,43.1,92.1c0,25.8-8.1,49.4-24.3,70.8c-10.5,13.6-42.8,42.2-96.7,85.9
//        c-54,43.7-89.899,83.099-107.899,118.099c-18.4,35.801-24.8,75.5-26.4,115.301c-1.399,34.1,25.8,62.5,60,62.5h49
//        c31.2,0,57-23.9,59.8-54.9c2-22.299,5.7-39.199,11.301-50.699c9.399-19.701,33.699-45.701,72.699-78.1
//        C723.59,477.8,772.79,428.4,795.891,392c23-36.3,34.6-74.8,34.6-115.5c0-73.5-31.3-138-94-193.4c-62.6-55.4-147-83.1-253-83.1
//        c-100.8,0-182.1,27.3-244.1,82c-52.8,46.6-84.9,101.8-96.2,165.5C139.69,266.1,152.39,283.5,170.89,285.8z"/></g>
//     </svg>);
// };


export function WKLAlert(props) {
    const context = useContext(WKLContext);
    let defaultButtonIndex = props.defaultButtonIndex || 0;
    const inputEl = useRef(null);
    useEffect(() => {
        if (inputEl.current)
            inputEl.current.focus();
    }, []);

    function onClick(e, item, index) {
        //Utils.invoke(props.onClose, { item, index });
        Utils.invoke(props.onClose, index);
    }

    function keyUpEventHandler(e) {
        if (e.key === 'Escape') {
            console.log('key up msg---------------');
            e.preventDefault();
            e.stopPropagation();
            Utils.invoke(props.onClose, { item: null, index: -1 });
        }
    };

    let title = 'Alert';
    let icon = 'Alert';
    let className = 'text-dark';
    let messageboxType = props.messageboxType || WKLMessageboxTypes.info;

    if (messageboxType === WKLMessageboxTypes.error) {
        icon = 'error';
        className = 'text-danger';
    } else if (messageboxType === WKLMessageboxTypes.info) {
        icon = 'notification_important';
        className = 'text-info';
    } else if (messageboxType === WKLMessageboxTypes.question) {
        icon = 'help';
        className = 'text-primary';
    } else if (messageboxType === WKLMessageboxTypes.warning) {
        icon = 'warning';
        className = 'text-warning';
    }
    icon = 'error';
    className = 'text-danger';
    return (<div className="wkl-control wkl-window top wkl-dialog-hoster" tabIndex={-1} onKeyDown={keyUpEventHandler}>
        <div className="wkl-dialog shadow-3 border-light border border-primary-light rounded m-3 mx-h-90">
            <div className="wkl-alert-container d-flex flex-column overflow-hidden" >
                <div className='col-auto d-flex flex-row p-2 ps-3 pe-3 align-items-center'>
                    <div className='flex-grow-1 d-flex  align-items-center'>
                        <span className={["material-icons", className].join(" ")}>
                            {icon}
                        </span>
                    </div>
                    <div className='fw-bold'>
                        {title}
                    </div>
                </div>
                <WKLBody>
                    <div className='col d-flex flex-column p-4 align-items-center'>
                        <p >{props.text || ''}</p>
                    </div>
                </WKLBody>
                <div className='col-auto d-flex flex-row align-items-center justify-content-center p-3 wkl-alert-footer'>
                    {props.buttons.map((b, idx) => {
                        const attr = {};
                        let cls = 'btn btn-sm btn-primary m-1';
                        if (defaultButtonIndex == idx) {
                            cls = 'btn btn-sm btn-outline-primary m-1';
                            attr.ref = inputEl;
                        }
                        return (<button {...attr} key={`btn_${idx}`} style={{ minWidth: '50px' }} className={cls} onClick={(e,) => onClick(e, b, idx)} >{b.text || 'not defined!'}</button>);
                    })}
                </div>
            </div>
        </div>
    </div>);
}