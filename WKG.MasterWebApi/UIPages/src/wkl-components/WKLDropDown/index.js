import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { DOMUtil } from '../Utils';
import './index.css';

const appRoot = document.getElementById('root');

//https://alligator.io/react/using-new-portal-feature-in-react/
//https://reactjs.org/docs/portals.html
export class WKLDropDown extends React.Component {
    static propTypes = {
        parent: PropTypes.object,
        isRightAlign: PropTypes.bool,
        isBottomAlign: PropTypes.bool,
        onClose: PropTypes.func,
        left: PropTypes.number,
        top: PropTypes.number,
        autoWidth: PropTypes.bool
    };
    static defaultProps = {
        parent: undefined,
        isBottomAlign: true,
        isRightAlign: false,
        parentCallback: undefined,
        left: undefined,
        top: undefined,
        autoWidth: true
    };
    constructor(props) {
        super(props);
        this.state = { left: '0px', top: '0px' };
        this.inputRef = null;
    }
    componentDidMount() {
        if (this.props.onClose)
            $(document).on('click.witdropdown', this.onMouseUp);

    };
    componentWillUnmount() {
        if (this.props.onClose)
            $(document).off('click.witdropdown', this.onMouseUp);
    };

    onMouseUp = (evt) => {
        if (evt.defaultPrevented)
            return;
        if (this.props.onClose)
            this.props.onClose({ eventName: 'DROP_DOWN-MOUSE_UP', event: evt });
    };

    getLocation() {
        let location = { left: '0px', top: '0px' };
        if (this.inputRef) {
            const child = this.inputRef;
            const parentNode = this.props.parent;
            if (parentNode) {
                const left = DOMUtil.getPopupLeft(parentNode, child, this.props.isRightAlign);
                const top = DOMUtil.getPopupTop(parentNode, child, this.props.isBottomAlign);
                location = { left: left + 'px', top: top + 'px' };
            }
        }
        return location;
    }

    setRef = (el) => {
        this.inputRef = el;
        if (el) {
            var loc = this.getLocation();
            this.setState({ left: loc.left, top: loc.top });
        }
    }

    renderChildren() {
        const attr = {};
        attr.style = { left: this.state.left, top: this.state.top, position: 'absolute', zIndex: 1102 };
        if (this.props.left)
            attr.style = { left: this.props.left, top: this.props.top, position: 'absolute', zIndex: 1102, backgroundColor: 'White' };

        if (this.props.autoWidth === false && this.props.parent) {
            const dom = this.props.parent.getBoundingClientRect();
            attr.style.width = `${dom.width}px`;
        }

        attr.ref = this.setRef;
        const children = this.props.children;
        return React.Children.map(children, child =>
            React.cloneElement(child, attr));
    };

    render() {
        return ReactDOM.createPortal(
            this.renderChildren(),
            appRoot
        );
    }
};