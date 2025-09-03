import React from 'react';
import PropTypes from 'prop-types';
import { Utils } from '../Utils';
import { WKLContext } from '../WKLComponent';

class WKLButtonWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    static propTypes = {
        id: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
        formID: PropTypes.string.isRequired
    };
    showWindow(options) {
        if (this.context && this.context.addWindow) {
            this.context.addWindow(options);
        }
    }
    onClick(e) {
        e.preventDefault();
        if (this.props.onClick) {
            Utils.invokeAction({
                formID: this.props.formID,
                controlID: this.props.id,
                owner: this,
                callback: (e) => {
                    Utils.invoke(this.props.onClick, { event: e, id: this.props.id, userID: e.userID });
                }
            });
        }
    };

    render() {
        return React.Children.map(this.props.children, (child, index) => React.cloneElement(child, { key: index, onClick: this.onClick }));
    }
}
WKLButtonWrapper.contextType = WKLContext;
export { WKLButtonWrapper };