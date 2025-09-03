import React from "react";
import PropTypes from 'prop-types';
import { WKLNumericTypes, WKLTextboxTypes } from '../WKLEnums';
import { Utils } from "../Utils";
import { TextboxUtil } from "./TextboxUtil";

class WKLTextboxWrapper extends React.Component {
    constructor(props) {
        super(props);
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
        events: PropTypes.object,
        onChange: PropTypes.func,
        formatOnBlur: PropTypes.bool
    };
    static defaultProps = {
        inputType: WKLTextboxTypes.textbox,
        numericType: 'both',
        prefix: 3,
        suffix: 2,
        events: undefined,
        onChange: undefined,
        maxLength: undefined,
        formatOnBlur: true
    };
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
    getValue(elment) {
        if (elment)
            return elment.value || elment.innerText;
        return null;
    }
    setValue(elment, val) {
        if (elment.value)
            elment.value = val;
        else if (elment.innerText)
            elment.innerText = val;
    }

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
        else if (this.props.inputType === WKLTextboxTypes.alphaNumeric) {
            testers.push(new RegExp('^[0-9a-zA-Z]+$'));
        }
        else if (this.props.inputType === WKLTextboxTypes.alphabets) {
            //testers.push(new RegExp('^[a-zA-Z]+([\s][a-zA-Z]+)*$'));
            testers.push(new RegExp(/^[a-zA-Z]+([\s][a-zA-Z]+)*$/));
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
    invokeEvent(callbackName, evt) {
        if (callbackName === "onChange") {
            Utils.invoke(this.props.onChange, {
                value: this.getValue(evt.target),
                name: this.props.name
            });
        }
        if (this.props.events) {
            Utils.invoke(this.props.events[callbackName], {
                value: this.getValue(evt.target),
                name: this.props.name
            });
        }
    }
    onChange = (evt) => {
        let val = this.getValue(evt.target)
        if (this.props.inputType === WKLTextboxTypes.alphaNumeric)
            val = val.toUpperCase();
        Utils.invoke(this.props.onChange, { name: this.props.name, value: val });
    };
    onBlur = (evt) => {
        if (evt.relatedTarget === undefined || evt.relatedTarget === null)
            return;
        let onChangeEvent = false;
        if (this.props.inputType === WKLTextboxTypes.numeric) {
            let value = this.getValue(evt.target);
            let val = value;
            if (this.props.formatOnBlur === true)
                val = value ? parseFloat(value).toFixed(this.props.suffix) : '';
            if (isNaN(val)) {
                value = '';
            }
            else
                value = val;

            if (this.getValue(evt.target) !== value)
                onChangeEvent = true
            this.setValue(evt.target, value);
        }
        else if (this.props.inputType === WKLTextboxTypes.time || this.props.inputType === WKLTextboxTypes.time24hr) {
            let text = this.getValue(evt.target);
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

                if (this.getValue(evt.target) !== text)
                    onChangeEvent = true
                this.setValue(evt.target, text);
            }
        }
        if (onChangeEvent === true)
            Utils.invoke(this.props.onChange, { name: this.props.name, value: this.getValue(evt.target) });
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
        this.handleChange(evt, "onKeyPress");
    };
    onInput = (evt) => { this.handleChange(evt, "onInput"); };
    handleChange = (evt, eventName) => {

        if (this.props.inputType === WKLTextboxTypes.titleCase) {
            TextboxUtil.titleCaseInput(evt);
        }
        else if (this.props.inputType === WKLTextboxTypes.sentenceCase) {
            TextboxUtil.sentenceCaseInput(evt);
        }
        else {

            let value = this.getValue(evt.target);
            if (value.length === 0)
                return;
            let testers = this.getRegExp();
            if (testers.length > 0) {
                var failedResults = testers.filter(i => i.test(value));
                if (failedResults.length === 0) {
                    this.setValue(evt.target, this.props.value);
                }
            }
        }
        this.invokeEvent('onChange', evt);
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
        events.onBlur = this.onBlur;
        events = { ...this.props.events, ...events };
        return events;
    }

    render() {
        const events = this.getEvents();
        return React.cloneElement(this.props.children, { ...events })
    }
}

export { WKLTextboxWrapper };