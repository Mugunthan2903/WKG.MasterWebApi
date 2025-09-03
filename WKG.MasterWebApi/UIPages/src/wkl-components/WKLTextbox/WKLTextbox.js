import React from "react";
import PropTypes from 'prop-types';
import { WKLNumericTypes, WKLTextboxTypes } from '../WKLEnums';
import { Utils } from "../Utils";
import { TextboxUtil } from "./TextboxUtil";
import './index.css';

class WKLTextbox extends React.Component {
    constructor(props) {
        super(props);
        this.textInput = null;
        this.focus = this.focus.bind(this);
        this.handleInput(true);

    }
    static propTypes = {
        name: PropTypes.string,
        value: PropTypes.string,
        inputType: PropTypes.oneOf(Object.keys(WKLTextboxTypes)),
        prefix: PropTypes.number,
        suffix: PropTypes.number,
        numericType: PropTypes.oneOf(Object.keys(WKLNumericTypes)),
        maxLength: PropTypes.number,
        mandatory: PropTypes.bool,
        allowClear: PropTypes.bool,
        placeholder: PropTypes.string,
        readOnly: PropTypes.bool,
        disabled: PropTypes.bool,
        events: PropTypes.object,
        onChange: PropTypes.func,
        formatOnBlur: PropTypes.bool,
        className: PropTypes.string,
        inputClass: PropTypes.string,
        iconClass: PropTypes.string,
        iconClick: PropTypes.func,
        tabIndex: PropTypes.number
    };
    static defaultProps = {
        name: '',
        inputType: WKLTextboxTypes.textbox,
        numericType: 'both',
        prefix: 3,
        suffix: 2,
        value: '',
        mandatory: false,
        allowClear: true,
        placeholder: '',
        disabled: false,
        readOnly: false,
        events: undefined,
        onChange: undefined,
        maxLength: undefined,
        isDatePicker: false,
        formatOnBlur: true,
        className: undefined,
        iconClass: undefined,
        iconClick: undefined,
        tabIndex: undefined
    };


    getRegExp() {
        let testers = [];
        if (this.props.inputType === WKLTextboxTypes.numeric) {
            var prefix = this.props.prefix;
            var suffix = this.props.suffix;
            var neg = "";
            if (this.props.numericType === 'both')
                neg = '(-)?';
            else if (this.props.numericType === 'negative')
                neg = '-';
            if (prefix !== 0 || suffix !== 0) {
                if (suffix <= 0) {
                    testers.push(new RegExp('^' + neg + '[0-9]{0,' + prefix + '}$'));
                }
                else {
                    testers.push(new RegExp('^' + neg + '[0-9]{0,' + prefix + '}\\.[0-9]{0,' + suffix + '}$|^' + neg + '[0-9]{0,' + prefix + '}\\.$|^' + neg + '[0-9]{0,' + prefix + '}$'));
                }
            }
        }
        else if (this.props.inputType === WKLTextboxTypes.alphabets) {
            testers.push(new RegExp(/^[a-zA-Z]+([\s][a-zA-Z]+)*$/));
        }
        else if (this.props.inputType === WKLTextboxTypes.alphaNumeric) {
            testers.push(new RegExp('^[0-9a-zA-Z]+$'));
        }
        else if (this.props.inputType === WKLTextboxTypes.time) {
            testers.push(new RegExp('^([0-9]|[0-1][0-2])(:([0-5]|[0-5][0-9])?)?$'));
            testers.push(new RegExp('^([0-9]|[0-1][0-2])(.([0-5]|[0-5][0-9])?)?$'));
            //testers.push(new RegExp(CommonRegex.Time12));
        }
        else if (this.props.inputType === WKLTextboxTypes.time24hr) {
            testers.push(new RegExp('^([0-9]|[0-1][0-9]|[2][0-3])(:([0-5]|[0-5][0-9])?)?$'));
            testers.push(new RegExp('^([0-9]|[0-1][0-9]|[2][0-3])(.([0-5]|[0-5][0-9])?)?$'));
            //testers.push(CommonRegex.Time24);
        }
        return testers;
    };

    getSnapshotBeforeUpdate(prevProps) {
        return { notifyRequired: (prevProps.value !== this.props.value) };
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (snapshot.notifyRequired)// Check if it's a new user, you can also use some unique property, like the ID  (this.props.user.id !== prevProps.user.id)
        {
            this.handleInput();
        }
    }
    handleInput(isFromConstructor = false) {
        if (this._isValid(this.props.value || '')) {
            if (isFromConstructor === false)
                this.setState({});
        }
        else
            Utils.invoke(this.props.onChange, { name: this.props.name, value: "" });
    }
    _isValid(value) {
        if (this.props.inputType === WKLTextboxTypes.titleCase) {
            return true;
        }
        else if (this.props.inputType === WKLTextboxTypes.sentenceCase) {
            return true;
        }
        else {
            if (value.length === 0)
                return true;
            let testers = this.getRegExp();
            if (testers.length > 0) {
                var failedResults = testers.filter(i => i.test(value));
                if (failedResults.length === 0) {
                    return false;
                }
            }
        }
        return true;
    }
    focus(select = false) {
        if (this.textInput) {
            this.textInput.focus();

            if (select === true)
                this.textInput.select();
        }
    }
    invokeEvent(callbackName, evt) {
        if (callbackName === "onChange") {
            Utils.invoke(this.props.onChange, {
                value: evt.target.value,
                name: this.props.name,
                target: (evt?.target || this.textInput)
            });
        }
        if (callbackName === "onClear") {
            Utils.invoke(this.props.onClear, {
                value: '',
                name: this.props.name,
                target: (evt?.target || this.textInput)
            });
        }
        else if (this.props.events) {
            Utils.invoke(this.props.events[callbackName], {
                value: evt.target.value,
                name: this.props.name,
                target: (evt?.target || this.textInput)
            });
        }
    }
    _clearText = () => {
        this.invokeEvent('onClear');
        Utils.invoke(this.props.onChange, { name: this.props.name, value: '' });
        this.focus();
    }
    onChange = (evt) => {
        let val = evt.target.value;
        if (this.props.inputType === WKLTextboxTypes.alphaNumeric)
            val = val.toUpperCase();
        if (val !== this.props.value)
            Utils.invoke(this.props.onChange, { name: this.props.name, value: val });
    };
    onBlur = (evt) => {
        if (evt.relatedTarget === undefined || evt.relatedTarget === null)
            return;
        let onChangeEvent = false;
        if (this.props.inputType === WKLTextboxTypes.numeric) {
            let value = evt.target.value;
            let val = value;
            if (this.props.formatOnBlur === true)
                val = value ? parseFloat(value).toFixed(this.props.suffix) : '';
            if (isNaN(val)) {
                value = '';
            }
            else
                value = val;

            if (evt.target.value !== value)
                onChangeEvent = true
            evt.target.value = value;
        }
        else if (this.props.inputType === WKLTextboxTypes.time || this.props.inputType === WKLTextboxTypes.time24hr) {
            let text = evt.target.value;
            if (text.length !== 0) {
                var splitChar = text.indexOf(":") > -1 ? ':' : text.indexOf(".") > -1 ? '.' : ' ';
                if (splitChar === ' ') {
                    if (text.length > 4)
                        text = text.substr(0, 4);
                    if (text.length === 1)
                        text = text.padStart(2, '0');
                    text = text.padEnd(4, '0');
                }
                else {
                    var data = text.split(splitChar);
                    text = data[0].padStart(2, '0');
                    text = text.substr(text.length - 2);
                    text += data[1].padEnd(2, '0').substr(0, 2);
                }
                var hr = +(text.substr(0, 2));
                var min = +(text.substr(2, 2));

                if (hr < 24 && min < 60)
                    text = text.substr(0, 2) + ":" + text.substr(2);
                else
                    text = "";

                if (evt.target.value !== text)
                    onChangeEvent = true
                evt.target.value = text;
            }
        }
        if (onChangeEvent === true)
            Utils.invoke(this.props.onChange, { name: this.props.name, value: evt.target.value, target: evt.target });
        this.invokeEvent('onBlur', evt);
    };
    onPaste = (evt) => {
        var items = evt.clipboardData.items;
        if (items[0].kind === 'string') {
            var clipboardData = evt.clipboardData || window.clipboardData;
            var pastedData = clipboardData.getData('Text');
            var val = null;
            if (this.props.inputType === WKLTextboxTypes.titleCase)
                val = TextboxUtil.titleCasePasteInput(evt, pastedData);
            else if (this.props.inputType === WKLTextboxTypes.sentenceCase)
                val = TextboxUtil.sentenceCasePasteInput(evt, pastedData);
            if (val != null) {
                this.onChange(evt);
            }
        }
    }
    onKeyPress = (evt) => {
        if (this.props.inputType === WKLTextboxTypes.titleCase) {
            TextboxUtil.titleCaseInput(evt);
            this.invokeEvent('onChange', evt);
        }
        else if (this.props.inputType === WKLTextboxTypes.sentenceCase) {
            TextboxUtil.sentenceCaseInput(evt);
            this.invokeEvent('onChange', evt);
        }
        else if (this.props.inputType === WKLTextboxTypes.numeric || this.props.inputType === WKLTextboxTypes.alphabets || this.props.inputType === WKLTextboxTypes.alphaNumeric || this.props.inputType === WKLTextboxTypes.time || this.props.inputType === WKLTextboxTypes.time24hr) {
            let value = evt.target.value;
            if (value.length === 0)
                return;
            let testers = this.getRegExp();
            if (testers.length > 0) {
                var failedResults = testers.filter(i => i.test(value));
                if (failedResults.length === 0) {
                    evt.target.value = this.props.value;
                }
            }
        }
        if (evt.key === 'Enter' && this.textInput) {
            Utils.focusNext(this.textInput);
        }
    };
    onKeyDown = (evt) => {
        if (this.props.events)
            Utils.invoke(this.props.events.onKeyDown, evt);
        if (evt.key === 'Enter' && this.textInput) {
            Utils.focusNext(this.textInput);
        }
    };
    onInput = (evt) => { this.handleChange(evt, "onInput"); };
    handleChange = (evt, eventName) => {
        try {
            if (evt && evt.stopPropagation) {
                evt.stopPropagation();
                evt.preventDefault();
                evt.nativeEvent.stopImmediatePropagation();
            }

        } catch (ex) { }
        if (this.props.inputType === WKLTextboxTypes.titleCase) {
            TextboxUtil.titleCaseInput(evt);
        }
        else if (this.props.inputType === WKLTextboxTypes.sentenceCase) {
            TextboxUtil.sentenceCaseInput(evt);
        }
        else {

            let value = evt.target.value;
            if (value.length === 0)
                return;
            let testers = this.getRegExp();
            if (testers.length > 0) {
                var failedResults = testers.filter(i => i.test(value));
                if (failedResults.length === 0) {
                    evt.target.value = this.props.value;
                }
            }
        }
        //this.invokeEvent('onChange', evt);
    };

    getEvents() {
        let events = { onChange: this.onChange };

        if (this.props.inputType === WKLTextboxTypes.titleCase || this.props.inputType === WKLTextboxTypes.sentenceCase) {
            events.onKeyPress = this.onKeyPress;
            events.onPaste = this.onPaste;
        }
        if (this.props.inputType === WKLTextboxTypes.numeric || this.props.inputType === WKLTextboxTypes.alphabets || this.props.inputType === WKLTextboxTypes.alphaNumeric || this.props.inputType === WKLTextboxTypes.time || this.props.inputType === WKLTextboxTypes.time24hr) {
            events.onInput = this.onInput;
        }
        //events.onKeyDown = this.onKeyDown;
        events.onBlur = this.onBlur;
        events = { ...this.props.events, ...events };
        return events;
    }
    render() {

        let attr = { type: "text" };
        if (this.props.inputType === WKLTextboxTypes.password)
            attr.type = "password";

        if (this.props.name)
            attr.name = this.props.name;

        if (this.props.tabIndex)
            attr.tabIndex = this.props.tabIndex;

        if (this.props.maxLength)
            attr.maxLength = this.props.maxLength || 0;

        const textClassList = ['form-control'];
        if (this.props.inputType === WKLTextboxTypes.numeric) {
            if (this.props.suffix && this.props.suffix > 0) {
                textClassList.push('text-end');
                attr.maxLength = this.props.prefix + this.props.suffix + 1 + ((this.props.numericType === 'negative' || this.props.numericType === 'both') ? 1 : 0);
            }
            else {
                textClassList.push('text-center');
                attr.maxLength = this.props.prefix || 0;
            }
        }
        else if (this.props.inputType === WKLTextboxTypes.alphaNumeric)
            textClassList.push('text-uppercase');

        let allowClear = false;
        if (this.props.allowClear === true) {
            allowClear = true;
            if (this.props.disabled === true || this.props.readOnly === true)
                allowClear = false;
        }
        if (this.props.disabled === true || this.props.readOnly === true) {
            if (this.props.readOnly)
                attr.readOnly = true;
            else
                attr.disabled = true;
        }

        let clearElmnt = null;
        if (allowClear === true) {
            if (!Utils.isNullOrEmpty(this.props.value))
                clearElmnt = (<span className="form-control-icon fa fa-times text-danger" onClick={this._clearText}></span>);
        }
        let iconElemnt = null;
        if (!Utils.isNullOrEmpty(this.props.iconClass)) {
            const iconAttr = {};
            if (this.props.disabled === true || this.props.readOnly === true) {
            }
            else
                iconAttr.onClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    Utils.invoke(this.props.iconClick, e);
                };

            iconElemnt = (<span className={`form-control-icon ${this.props.iconClass}`} {...iconAttr}></span>);
        }

        const events = this.getEvents();

        if (this.props.inputClass) {
            textClassList.push(this.props.inputClass);
        }

        let clsOuter = '';
        let iconElements = null;
        if (iconElemnt || clearElmnt) {
            if (clearElmnt)
                clsOuter += ' has-clear';
            if (iconElemnt)
                clsOuter += ' has-icon';

            if (this.props.className)
                clsOuter += (' ' + this.props.className);

            iconElements = (<span className="form-control-icons">
                {clearElmnt}
                {iconElemnt}
            </span>);
        }

        return (<div className={clsOuter}>
            <input ref={el => this.textInput = el} className={textClassList.join(' ')} autoComplete="off" placeholder={this.props.placeholder || ''} value={this.props.value} {...attr} {...events} />
            {iconElements}
        </div>);
    }
}
export { WKLTextbox };