import React from 'react';
import { SketchPicker } from 'react-color';
import PropTypes from 'prop-types';
import { Utils } from '../Utils';
import { WKLDropDown } from '../WKLDropDown';
import './index.css';

export class WKLColorPicker extends React.Component {
    static propTypes = {
        value: PropTypes.string,
        onChange: PropTypes.func,
        name: PropTypes.string,
        placeholder: PropTypes.string,
        openOnFocus: PropTypes.bool,
        disabled: PropTypes.bool,
        tabIndex: PropTypes.number
    }
    static defaultProps = {
        value: '#FFF',
        onChange: undefined,
        name: '',
        placeholder: 'Please Select',
        disabled: false,
        openOnFocus: false,
        tabIndex: 0
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
    onBlur = (e) => {
        if (this.IsInDropdown === true)
            return;
        console.log(`onBlur - Closing: ${this.state.isOpen}`);
        this.setState({ isOpen: false });
        this.IsInDropdown = false;
    };
    focus(openMenu = false) {
        try {

            console.log('-------focus-------');
            if (this.container)
                this.container.focus();
            if (openMenu === true) {
                window.setTimeout(() => {
                    this.setState({ isOpen: true });
                }, 100);
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
    _skip = false;
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
    handleClick = (evt) => {
        try {
            if (evt && evt.stopPropagation) {
                evt.stopPropagation();
                evt.preventDefault();
                evt.nativeEvent.stopImmediatePropagation();
            }
        }
        catch { }
        console.log('-------handleClick-------');
        if (this.props.disabled === true) {
            return;
        }
        console.log(`handleClick - isOpen: ${this.state.isOpen}`);
        if (this._skip === true)
            return;
        this.setState({ isOpen: !this.state.isOpen });
    };
    handleClose = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (this.IsInDropdown !== true) {
            this.setState({ isOpen: false });
            this.IsInDropdown = false;
        }
    };
    handleManualClose = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.setState({ isOpen: false })
        this.IsInDropdown = false;
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
    handleMouseUp = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    renderDropdown() {
        let selectedColor = "#008bb2";
        const WKLCOLOR = ['#00A6D3', '#0057CD', '#05A6D4','#3B0D88','#933ED6','#C32324','#F8F9FD','#D63E96','#FF8054','#FFFFFF','#000000','#00C9FF','#D8D8D8',"#00000029",'#121212'];
        if (!Utils.isNullOrEmpty(this.props.value)) {
            selectedColor = this.props.value;
        }
        const dropDownAttr = { parent: this.container, onClose: this.handleClose, autoWidth: false };
        return (<WKLDropDown {...dropDownAttr}>
            <div cntrl-id={this.ID} onDoubleClick={this.handleManualClose} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} onKeyDown={this._keyUpEventHandler} >
                <SketchPicker color={selectedColor} onChange={this.handleChange} presetColors={WKLCOLOR}/>
            </div>
        </WKLDropDown>);
    }


    render() {
        let placeholder = this.props.value || this.props.placeholder || '';
        let selected = false;
        let color = null;
        let displayTextClass = 'col d-inline-block text-truncate';
        if (Utils.isNullOrEmpty(this.props.value)) {
            displayTextClass = 'col text-muted d-inline-block text-truncate';
        }
        else {
            selected = true;
            color = this.props.value;
        }
        const attr = {};
        const attr1 = {};
        const attr2 = {};
        if (this.props.disabled === true) {
            attr.readonly = "readonly";
            selected = false;
        }
        else {
            if (this.props.openOnFocus === true)
                attr.onFocus = this.onFocus;

            attr1.onClick = this.handleClick;
            attr2.onClick = this.handleClear;
            if (this.state.isOpen === true)
                attr.onBlur = this.onBlur;
        }
        return (
            <div className="form-control pe-1" {...attr} ref={el => this.container = el} cntrl-id={this.ID} tabIndex={this.props.tabIndex || 0} onKeyDown={this._keyUpEventHandler} >
                <span className="d-flex">
                    {color && <span className="col-auto pe-1" ><i className="fa fa-square mr5" style={{ color: color }}></i></span>}
                    <span className={displayTextClass} {...attr1} >{placeholder}</span>
                    {selected === true && <span className="col-auto wkl-color-picker-icon " {...attr2}> <i className="fa fa-times text-danger"></i></span>}
                    <span className="col-auto wkl-color-picker-icon" {...attr1} ><i className="fas fa-palette"></i></span>
                </span>
                {(this.state.isOpen) && this.renderDropdown()}
            </div >
        )
    }
}