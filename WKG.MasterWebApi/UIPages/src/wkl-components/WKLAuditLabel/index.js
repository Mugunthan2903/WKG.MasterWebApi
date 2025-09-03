
import moment from "moment";
import { useEffect } from "react";
import './index.css';

export const WKLAuditLabel = (props) => {
    useEffect(() => {

    }, [props.modifiedBy, props.modifiedOn, props.createdBy, props.createdOn]);

    let text = '';
    if (props.modifiedBy && props.modifiedOn)
        text = `Last modifiied by ${props.modifiedBy || ''} on ${moment(props.modifiedOn).format('DD-MMM-YYYY HH:mm') || ''}`;
    else if (props.modifiedBy)
        text += `Last modifiied by ${props.modifiedBy || ''}`;
    else if (props.modifiedOn)
        text += `Last modifiied on ${moment(props.modifiedOn).format('DD-MMM-YYYY HH:mm')} || ''}`;

    return (<span className="w-100 wkl-audit-label d-inline-flex flex-row justify-content-center align-items-center text-muted f1s-6">{text}</span>);
};

WKLAuditLabel.defaultProps = {
    modifiedBy: "",
    modifiedOn: null,
    createdBy: "",
    createdOn: null
};