import React from 'react';
import PropTypes from 'prop-types';
import { WKLTextbox } from '../WKLTextbox';
import { WKLDropDown } from '../WKLDropDown';
import moment from 'moment';
import { Utils } from '../Utils';
import $ from 'jquery';
import { WKLCalendar } from '../WKLCalendar';

export class WKLDatepicker extends React.Component {
    static ID = 0;
    static FORMAT = 'DD MMM YYYY';
    static propTypes = {
        id: PropTypes.string,
        name: PropTypes.string,
        value: PropTypes.object,
        // mandatory: PropTypes.bool,
        style: PropTypes.object,
        allowClear: PropTypes.bool,
        placeholder: PropTypes.string,
        readOnly: PropTypes.bool,
        disabled: PropTypes.bool,
        openOnFocus: PropTypes.bool,
        keyNavigation: PropTypes.bool,
        startDate: PropTypes.object,
        endDate: PropTypes.object,
        onChange: PropTypes.func,
        blockedDates: PropTypes.array
    };
    static defaultProps = {
        name: undefined,
        value: null,
        // mandatory: false,
        style: { width: '100%' },
        allowClear: true,
        placeHolder: '',
        readOnly: false,
        disabled: false,
        openOnFocus: false,
        keyNavigation: true,
        startDate: undefined,
        endDate: undefined,
        onChange: undefined,
        blockedDates: undefined
    };

    constructor(props) {
        super(props);
        this.IsCalendar = false;
        this.container = null;
        this.state = {
            isOpen: false,
            id: WKLDatepicker.ID++
        };
        this._value = '';
        this.handleInput(true);
    }
    _skip = false;
    focus(openMenu = false) {
        try {
            if (this.textbox)
                this.textbox.focus();
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
    };

    getSnapshotBeforeUpdate(prevProps) {
        //return { notifyRequired: (prevProps.value !== this.props.value), selectableRangeChanged: (prevProps.startDate !== this.props.startDate || prevProps.endDate !== this.props.endDate) };
        return { notifyRequired: (prevProps.value !== this.props.value /*|| prevProps.startDate !== this.props.startDate || prevProps.endDate !== this.props.endDate*/) };
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (snapshot.notifyRequired || snapshot.selectableRangeChanged)// Check if it's a new user, you can also use some unique property, like the ID  (this.props.user.id !== prevProps.user.id)
        {
            this.handleInput(false, snapshot.valueChanged);
        }
    }
    handleInput(isFromConstructor = false) {
        let val = '';
        if (!Utils.isNullOrEmpty(this.props.value)) {
            let dt = null;
            if (this.props.value instanceof Date)
                dt = this.props.value;
            else {
                let dt1 = moment(this.props.value, WKLDatepicker.FORMAT);
                if (dt1.isValid())
                    dt = dt1.toDate();
            }

            if (this.isvalidDate(dt)) {
                if (isFromConstructor === false)
                    this.setState({});
            }
            else {
                Utils.invoke(this.props.onChange, { name: this.props.name, value: null });
            }
            val = moment(this.props.value).format(WKLDatepicker.FORMAT);
        }
        if (this._value != val) {
            if (isFromConstructor === false) {
                this._value = val;
            }
            else {
                this._value = val;
            }
            this.setState({});
        }
    }
    invokeDatechanged(dt) {
        if (this.props.onChange)
            this.props.onChange({ eventName: 'DATE-CHANGED', value: dt, date: dt, name: this.props.name });
    };
    getControlValue() {
        let dt = null;
        if (!Utils.isNullOrEmpty(this.props.value)) {
            if (this.props.value instanceof Date)
                dt = this.props.value;
            else {
                dt = Utils.dateParse(this.props.value);
            }
        }
        return dt;
    }
    moveTo(mode) {
        if (this.calendarRef) {
            this.calendarRef.moveTo(mode);
        }
        else {
            let dt = this.getControlValue();
            if (dt) {
                var days = +1;
                if (mode === 'DOWN')
                    days = -1;
                dt = moment(dt).add(days, 'd').toDate();
                if (this.isvalidDate(dt))
                    this.invokeDatechanged(dt);
            }
        }
    };
    handleEscape(evt) {
        if (this.calendarRef) {
            if (this.state.isOpen !== false) {
                try {
                    if (evt && evt.stopPropagation) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        evt.nativeEvent.stopImmediatePropagation();
                    }
                }
                catch { }

                this.setState({ isOpen: false });
                console.log('dp - handleEscape');
                return false;
            }
        }
    };
    handleOnEnterKey(evt) {
        var text = evt.target.value;
        var witState = { oldValue: (this.props.value || null), newValue: null, valueChanged: false };
        const val = $.trim(text);
        if (val.length === 0) {
            if (this.state.isOpen === true)
                this.moveTo('ENTER');
        }
        else {
            var dt = Utils.dateParse(val);
            if (dt != null) {
                if (!this.isvalidDate(dt))
                    dt = null;
            }
            witState.newValue = dt;

            var dt1 = '';
            if (witState.oldValue)
                dt1 = moment(witState.oldValue).format(WKLDatepicker.FORMAT);
            var dt2 = '';
            if (witState.newValue)
                dt2 = moment(witState.newValue).format(WKLDatepicker.FORMAT);

            if (dt2 === dt1) {
                if (this.state.isOpen === true)
                    this.moveTo('ENTER');
            }
            else {
                this.setState({ isOpen: false });
                this.invokeDatechanged(witState.newValue);
            }
        }
    };
    isvalidDate(dt) {
        let isvalid = !(this.props.blockedDates || []).any(dy => (dy.getFullYear() === dt.getFullYear() && dy.getMonth() === dt.getMonth() && dy.getDate() === dt.getDate()));
        var isAfter = true;
        if (this.props.startDate && this.props.startDate instanceof Date) {
            isAfter = moment(dt).isSameOrAfter(this.props.startDate);
        }

        var isBefore = true;
        if (this.props.endDate && this.props.endDate instanceof Date) {
            isBefore = moment(dt).isSameOrBefore(this.props.endDate);
        }
        if ((!isBefore) || (!isAfter))
            isvalid = false;
        return isvalid;
    }
    componentCallback = (e) => {
        if (e.eventName === 'DROP_DOWN-MOUSE_UP') {
            const evt = e.event;
            var datepickers = $(evt.target).closest('.wkl-dropdown-popup,.witdatepicker');
            if (datepickers.length === 0 || $(datepickers[0]).attr('cntrl-id') !== this.state.id.toString()) {
                if (this.state.isOpen !== false)
                    this.setState({ isOpen: false });
            }
        }
    };
    onClear = () => {
        this.invokeDatechanged(null);
    };
    onKeyDown = (evt) => {
        switch (evt.keyCode) {
            case 9://tab
                this.IsCalendar = false;
                break;
            case 27://up
                return this.handleEscape(evt);
                break;
            case 38://up
                this.moveTo('UP');
                break;
            case 40://down
                this.moveTo('DOWN');
                break;
            case 37://left
                this.moveTo('LEFT');
                break;
            case 39://right
                this.moveTo('RIGHT');
                break;
            case 13://enter
                return this.handleOnEnterKey(evt);
                break;
            default:
                break;

        }
    };
    onFocus = (e) => {
        // this.handleIconClick();
        if (this.props.disabled === true) {
            return;
        }
        this._skip = true;
        this.setState({ isOpen: true });
        window.setTimeout(() => {
            this._skip = false;
        }, 1000);
    };
    onContainerBlur = (e) => {
        if (this.IsCalendar === true)
            return;
        this.setState({ isOpen: false });
    }
    onBlur = (e) => {
        if (this.IsCalendar === true)
            return;

        var state = { selectedDate: null, isOpen: false };
        if (e && e.value) {
            const val = (e.value || '').trim();
            if (val.length > 0) {
                var dt = Utils.dateParse(val);
                if (dt != null) {
                    if (!this.isvalidDate(dt))
                        dt = null;
                }
                state.selectedDate = dt;
            }
        }
        var dt1 = this.props.value || null;
        if (dt1)
            dt1 = dt1.valueOf();
        var dt2 = state.selectedDate || null;
        if (dt2)
            dt2 = dt2.valueOf();

        let upd = false;
        if (this.state.isOpen !== state.isOpen) {
            upd = true;
            this.setState({ isOpen: state.isOpen });
        }

        if (dt2 !== dt1)
            this.invokeDatechanged(state.selectedDate);
        else {
            if (state.selectedDate === null) {
                this._value = '';
                if (upd === false)
                    this.setState({});
            }
        }
    };
    onDateChanged = (e) => {
        if (this.state.isOpen !== false) {
            this.setState({ isOpen: false });
        }
        this.invokeDatechanged(e.date);
    };
    handleIconClick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (this.props.disabled === true) {
            return;
        }
        if (this._skip === true)
            return;
        if (this.state.isOpen !== true)
            this.setState({ isOpen: true });
    };
    handleMouseEnter = () => {
        this.IsCalendar = true;
    };
    handleMouseLeave = () => {
        this.IsCalendar = false;
    };

    renderCalendar() {
        let inputAttr = {};
        inputAttr.name = this.props.name;
        inputAttr.startDate = this.props.startDate;
        inputAttr.endDate = this.props.endDate;
        inputAttr.value = this.props.value;
        inputAttr.onChange = this.onDateChanged;
        const dropDownAttr = { parent: this.container, onClose: this.componentCallback };
        return (<WKLDropDown {...dropDownAttr}>
            <div cntrl-id={this.state.id} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} className="wkl-dropdown-popup">
                <WKLCalendar ref={el => this.calendarRef = el} {...inputAttr} />
            </div>
        </WKLDropDown>);
    }

    render() {
        let inputAttr = {};
        inputAttr.textAlign = 'center';
        inputAttr.inputType = 'textbox';
        inputAttr.mandatory = this.props.mandatory;
        inputAttr.style = this.props.style;
        inputAttr.allowClear = this.props.allowClear;
        inputAttr.placeholder = this.props.placeholder;
        inputAttr.readOnly = this.props.readOnly;
        inputAttr.disabled = this.props.disabled;
        inputAttr.iconClass = 'fa fa-calendar';
        inputAttr.value = this._value;
        if (this.props.id)
            inputAttr.id = this.props.id;
        if (this.props.name)
            inputAttr.name = this.props.name;

        inputAttr.events = {};
        const attr = {};
        let canEdit = false;
        if (!inputAttr.disabled && !inputAttr.readOnly) {
            canEdit = true;

            inputAttr.events.onBlur = this.onBlur;
            inputAttr.events.onClick = this.handleIconClick;

            if (this.props.openOnFocus)
                inputAttr.events.onFocus = this.onFocus;

            if (this.props.keyNavigation)
                inputAttr.events.onKeyDown = this.onKeyDown;

            if (!this.props.disabled)
                inputAttr.onClear = this.onClear;

            inputAttr.iconClick = this.handleIconClick;

            inputAttr.onChange = (e) => {
                this.invokeDatechanged(null);
                this._value = e.value;
            }
            attr.onBlur = this.onContainerBlur;
        }

        return (<div ref={el => this.container = el} cntrl-id={this.state.id} className="witdatepicker" {...attr}>
            <WKLTextbox ref={el => this.textbox = el} {...inputAttr} />
            {(canEdit && this.state.isOpen) && this.renderCalendar()}
        </div>);
    };
};