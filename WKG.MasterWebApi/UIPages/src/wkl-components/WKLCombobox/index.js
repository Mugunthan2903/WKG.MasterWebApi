import React from 'react';
import PropTypes from 'prop-types';
import { Utils } from '../Utils';
import { WKLDropDown } from '../WKLDropDown';
import './index.css';

export class WKLCombobox extends React.Component {
    static propTypes = {
        value: PropTypes.string,
        // onClose: PropTypes.func,
        name: PropTypes.string,
        placeholder: PropTypes.string,
        openOnFocus: PropTypes.bool,
        disabled: PropTypes.bool,
        tabIndex: PropTypes.number,
        showBorder: PropTypes.bool
    }
    static defaultProps = {
        value: '',
        name: '',
        placeholder: 'Please Select',
        disabled: false,
        openOnFocus: true,
        tabIndex: 0,
        showBorder: false
    }
    constructor(props) {
        super(props);
        this.state = { isOpen: false };
        this.ID = Utils.getUniqueID();
        this.IsInDropdown = false;
    }
    getSnapshotBeforeUpdate(prevProps) {
        return { notifyRequired: (prevProps.value !== this.props.value) };
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (snapshot.notifyRequired) {
            this.setState({});
        }
    }
    _skip = false;
    focus(openMenu = false) {
        try {
            if (this.container)
                this.container.focus();
            if (openMenu === true) {
                if (this.props.disabled === true) {
                    return;
                }
                window.setTimeout(() => {
                    this.setState({ isOpen: true });

                }, 100);
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
    onBlur = (e) => {
        if (this.IsInDropdown === true)
            return;
        this.setState({ isOpen: false });
    };
    onFocus = (e) => {
        console.log('-------onFocus-------');
        if (this.props.disabled === true) {
            return;
        }
        this._skip = true;
        this.setState({ isOpen: true });
        window.setTimeout(() => {
            this._skip = false;
        }, 1000);
    };
    handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.disabled === true) {
            return;
        }
        if (this._skip === true)
            return;
        this.setState({ isOpen: !this.state.isOpen });
    };

    handleClose = () => {
        this.setState({ isOpen: false })
    };

    handleClear = (e) => {
        e.preventDefault();
        e.stopPropagation();
        Utils.invoke(this.props.onChange, { name: this.props.name, value: null });
    };
    handleChange = (color) => {
        Utils.invoke(this.props.onChange, { name: this.props.name, value: color.hex });
        if (this.container)
            Utils.focusNext(this.container);
    };
    handleMouseEnter = () => {
        this.IsInDropdown = true;
    };
    handleMouseLeave = () => {
        this.IsInDropdown = false;
    };
    _keyUpEventHandler = (evt) => {
        if (evt.key === 'Escape') {
            try {
                if (evt && evt.stopPropagation) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    evt.nativeEvent.stopImmediatePropagation();
                }
            }
            catch { }
            this.handleClose(evt);
        }
    };

    renderDropdown() {
        const dropDownAttr = { parent: this.container, onClose: this.handleClose, autoWidth: false };

        let cls = 'wkl-dropdown-popup';
        if (this.props.showBorder === true)
            cls += 'wkl-dropdown-popup-border';

        return (<WKLDropDown {...dropDownAttr}>
            <div cntrl-id={this.ID} className={cls} onKeyDown={this._keyUpEventHandler} onClick={this.handleClose} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                {this.props.children}
            </div>
        </WKLDropDown>);
    }


    render() {
        let placeholder = '';
        let displayTextClass = 'col d-inline-block text-truncate';
        if (Utils.isNullOrEmpty(this.props.value)) {
            displayTextClass = 'col text-muted d-inline-block text-truncate';
            placeholder = this.props.placeholder || ''
        }
        else {
            placeholder = this.props.value;
        }
        const attr = {};
        if (this.props.disabled === true) {
            attr.readonly = "readonly";
        }
        else {
            if (this.props.openOnFocus === true)
                attr.onFocus = this.onFocus;
            attr.onBlur = this.onBlur;
        }
        return (
            <div className="form-control pe-1" {...attr} ref={el => this.container = el} cntrl-id={this.ID} tabIndex={this.props.tabIndex || 0} onKeyDown={this._keyUpEventHandler}>
                <span className="d-flex" >
                    <span className={displayTextClass} onClick={this.handleClick}>{placeholder}</span>
                    <span className="col-auto wkl-combobox-icon " onClick={this.handleClick}><i className="fas fa-caret-down"></i></span>
                </span>
                {(this.state.isOpen) && this.renderDropdown()}
            </div >
        )
    }
}