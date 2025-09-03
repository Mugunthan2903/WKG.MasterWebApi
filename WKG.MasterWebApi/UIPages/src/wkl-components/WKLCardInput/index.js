import React from 'react';
import PropTypes from 'prop-types';
import { Utils } from '../Utils';
import { WKLTextbox } from '../WKLTextbox';
import './index.css';

const CardTypes = [
    { card: 'AMEX', matchString: /^3[47][0-9]{13}$/, icon: 'amex.svg', description: 'Amex Card' },
    { card: 'MASTER', matchString: /5[1-5]\d{2}-?\d{4}-?\d{4}-?\d{4}$|^2(?:2(?:2[1-9]|[3-9]\d)|[3-6]\d\d|7(?:[01]\d|20))-?\d{4}-?\d{4}-?\d{4}$/, icon: 'mastercard.svg', description: 'Master Card' },
    { card: 'DINERS', matchString: /^3(?:0[0-5]|[68][0-9])[0-9]{11}|^54[0-9]{13}$/, icon: 'diners.svg', description: 'Diners Club Card' },
    { card: 'DISCOVER', matchString: /^65[4-9][0-9]{13}|64[4-9][0-9]{13}|6011[0-9]{12}|(622(?:12[6-9]|1[3-9][0-9]|[2-8][0-9][0-9]|9[01][0-9]|92[0-5])[0-9]{10})$/, icon: 'discover.svg', description: 'Discover Card' },
    { card: 'JCB', matchString: /(?:2131|1800|35\d{3})\d{11}/, icon: 'jcb.svg', description: 'JCB Card' },
    { card: 'MASTERO', matchString: /^(5018|5020|5038|5893|6304|6759|6761|6762|6763|6771)[0-9]{8,15}$/, icon: 'maestro.svg', description: 'Mastero Card' },
    { card: 'SOLO', matchString: /^(6334|6767)[0-9]{12}|(6334|6767)[0-9]{14}|(6334|6767)[0-9]{15}$/, icon: 'spotify.svg', description: 'Solo Card' },
    { card: 'SWITCH', matchString: /^(4903|4905|4911|4936|6333|6759)[0-9]{12}|(4903|4905|4911|4936|6333|6759)[0-9]{14}|(4903|4905|4911|4936|6333|6759)[0-9]{15}|564182[0-9]{10}|564182[0-9]{12}|564182[0-9]{13}|633110[0-9]{10}|633110[0-9]{12}|633110[0-9]{13}$/, icon: 'switch.svg', description: 'Switch Card' },
    { card: 'VISA', matchString: /^4[0-9]{12}(?:[0-9]{3}|[0-9]{6})?$/, icon: 'visa.svg', description: 'Visa Card' },
    { card: 'UPAY', matchString: /^(62[0-9]{14,17})$/, icon: 'unionpay.svg', description: 'Union Pay Card' },
];

export class WKLCardInput extends React.Component {
    static propTypes = {
        value: PropTypes.string,
        onChange: PropTypes.func,
        name: PropTypes.string,
        disabled: PropTypes.bool,
        // mandatory: PropTypes.bool,
        mask: PropTypes.bool,
        tabIndex: PropTypes.number
    }
    static defaultProps = {
        value: '',
        onChange: undefined,
        name: '',
        disabled: false,
        // mandatory: false,
        mask: false,
        tabIndex: 0
    }
    constructor(props) {
        super(props);
        this.inputbox = null;
        this.cardType = null;
        this.cardIcon = 'card-icon';
        this.handleInput(false);
        this.onChange = this.onChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        // this.onBlur = this.onBlur.bind(this);
        // this.onFocus = this.onFocus.bind(this);
    }
    getSnapshotBeforeUpdate(prevProps) {
        return { notifyRequired: (prevProps.value !== this.props.value || prevProps.mask !== this.props.mask) };
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (snapshot.notifyRequired) {
            this.handleInput(true);
        }
    }
    focus() {
        if (this.inputbox)
            this.inputbox.focus();
    }
    handleInput(updateState) {
        if (this.props.mask === true)
            this.displayValue = this.getMaskedText(this.props.value);
        else
            this.displayValue = this.getFormattedText(this.props.value);
        this.parseCard(this.props.value, updateState);
    }
    parseCard(val, updateState = true) {
        let cardType = null;
        let cardIcon = 'card-icon';
        val = val || '';
        val = val.replaceAll(' ', '');
        for (const itm of CardTypes) {
            if (itm.matchString.test(val)) {
                cardType = itm.card;
                cardIcon = `${itm.icon.replace(".svg", "")}-icon`;
                break;
            }
        }
        if (this.cardType !== cardType) {
            this.cardType = cardType;
            if (cardType)
                this.cardIcon = 'card-icon ' + cardIcon;
            else
                this.cardIcon = cardIcon;
            if (updateState === true)
                this.setState({});
        }
    }
    getFormattedText(val) {
        let maskedText = '';
        let index = 0;
        for (const c of val) {
            if (Utils.isDigit(c.charCodeAt(0))) {
                if (index === 4) {
                    index = 0;
                    maskedText += ' ';
                }
                maskedText += c;
                index++;
            }
        }
        return maskedText;
    }
    getMaskedText(val) {
        let maskedText = '';
        if (!Utils.isNullOrEmpty(val)) {
            let startIndex = 0;
            if (val.length > 4)
                startIndex = val.length - 4;
            maskedText = 'xxxx xxxx xxxx ' + val.substr(startIndex, 4);
        }
        return maskedText;
    }
    onChange(e) {
        this.parseCard(e.value);
        const args = {};
        args.name = this.props.name;
        args.value = e.value;
        args.type = this.card;
        this.displayValue = this.getFormattedText(e.value);
        args.maskedInput = this.displayValue;
        Utils.invoke(this.props.onChange, args);
    }
    onKeyPress(e) {
        if (!String.fromCharCode(e.charCode).match(/^([1-9]\d*|0)$/)) {
            e.preventDefault();
            return true;
        }
    }
    // onFocus(e) {
    //     this.displayValue = this.props.value || '';
    // }
    // onBlur(e) {
    //     let val = this.getFormattedText(this.props.value || '');
    //     if (this.displayValue !== val)
    //         this.setState({});
    // }
    setRef = (el) => {
        this.inputbox = el;
    };
    render() {
        let inputAttr = {};
        inputAttr.textAlign = 'center';
        inputAttr.inputType = 'textbox';
        inputAttr.mandatory = this.props.mandatory;
        inputAttr.style = this.props.style;
        inputAttr.allowClear = true;
        inputAttr.placeholder = 'XXXX-XXXX-XXXX-XXXX';

        inputAttr.iconClass = 'card-icon ' + this.cardIcon;
        inputAttr.name = this.props.name;
        inputAttr.maxLength = 19;
        inputAttr.ref = this.setRef;

        inputAttr.onChange = this.props.onChange;
        if (this.props.mask === true) {
            inputAttr.value = this.displayValue;
            inputAttr.readOnly = true;
            inputAttr.disabled = true;
        }
        else {
            inputAttr.readOnly = this.props.readOnly;
            inputAttr.disabled = this.props.disabled;
            inputAttr.value = this.displayValue;
            inputAttr.onChange = this.onChange;
            inputAttr.events = {
                onKeyPress: this.onKeyPress,
                // onFocus: this.onFocus,
                // onBlur: this.onBlur
            };
        }
        inputAttr.className = 'has-card-icon';
        inputAttr.inputClass = 'card-input';
        inputAttr.tabIndex = this.props.tabIndex;

        return (<WKLTextbox ref={el => this.textbox = el} {...inputAttr} />);
    }
}