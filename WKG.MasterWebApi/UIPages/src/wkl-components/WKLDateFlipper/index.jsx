import React, { Component } from 'react';
import moment from 'moment';
import './index.css'
import { WKLDatepicker } from '../WKLDatepicker';
import { Utils } from '../Utils';

const DateChangerBox = React.memo(props => {
    let typeDescription = "";
    switch (props.type || 'D') {
        case 'D': typeDescription = "Day"; break;
        case 'Y': typeDescription = "Year"; break;
        case 'Q': typeDescription = "3 Months"; break;
        case 'M': typeDescription = "Month"; break;
        default:
            typeDescription = "";
            break;
    }
    return <div className="col d-flex flex-row justify-content-between align-items-center shadow-sm border rounded" >
        <i className="text-primary fa fa-caret-left fa-3x pointer ms-1 me-1" onClick={e => props.handleChange(props.type, 'P')}></i>
        <div className="flex-grow-1 d-flex justify-content-center align-items-center pointer" onClick={e => props.handleChange(props.type, 'C', true)}>
            {typeDescription}
        </div>
        <i className="text-primary fa fa-caret-right fa-3x pointer ms-1 me-1" onClick={e => props.handleChange(props.type, 'N')}></i>
    </div>
});

class WKLDateFlipper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDay: this.props.today || moment().format('DD MMM YYYY'),
            changedDay: null,
            dateRange: { start: this.props.start, end: this.props.end },
            UIText: ''
        }
        this.doInit(this.state);
    }
    doInit({ dateRange }) {
        this.setState({ dateRange });
    }

    handleNP = (type, n, props, isDefault) => {
        let changer = 1;
        props.dateRange = props.dateRange || { start: props.currentDay, end: props.currentDay }
        let startDate = moment(props.dateRange.start, "DDMMMYYYY", false);
        if (isDefault) {
            startDate = moment(props.currentDay, "DDMMMYYYY", false);
            changer = 0;
        }
        if (n === "P") {
            changer = -1;
        }
        switch (type || 'D') {
            case 'D':
                if (!isDefault)
                    startDate.add(1 * changer, 'd');
                props.UIText = startDate.format("DD MMM YYYY");
                props.dateRange = {
                    start: startDate.format("DD MMM YYYY"),
                    end: startDate.format("DD MMM YYYY")
                };
                break;
            case 'M':
                if (!isDefault)
                    startDate = moment(startDate.add(1 * changer, 'month'), false);
                props.UIText = startDate.format("MMM YYYY");
                props.dateRange = {
                    start: startDate.format("01 MMM YYYY"),
                    end: moment(startDate).endOf('month').format("DD MMM YYYY")
                };
                break;
            case 'Q':
                let pQuarterStart = moment(startDate.format("01 MMM YYYY"), false);
                if (!isDefault)
                    pQuarterStart = moment(pQuarterStart).add(3 * changer, 'month');
                let quarter = this.getQuarterRange(pQuarterStart.format("Q"));

                let year = pQuarterStart.format("YYYY");
                props.dateRange = {
                    start: quarter.From + year,
                    end: quarter.To + year
                };
                props.UIText = moment(props.dateRange.start, false).format("MMM YYYY") + ' - ' + moment(props.dateRange.end, false).format("MMM YYYY");
                break;
            case 'Y':
                if (!isDefault)
                    startDate = startDate.add(1 * changer, 'y');
                props.UIText = startDate.format("YYYY");
                props.dateRange = {
                    start: "01 Jan " + startDate.format("YYYY"),
                    end: "31 Dec " + startDate.format("YYYY")
                };
                break;
            default:
                break;
        }
        return props;

    }
    getQuarterRange = (quarter) => {
        let val = null;
        switch (quarter) {
            case "1":
                val = { From: "01 Jan ", To: "31 Mar " };
                break;
            case "2":
                val = { From: "01 Apr ", To: "30 Jun " };
                break;
            case "3":
                val = { From: "01 Jul ", To: "30 Sep " };
                break;
            case "4":
                val = { From: "01 Oct ", To: "31 Dec " };
                break;
            default:
                break;
        }
        return val;
    }
    handleChange = (type, n, isDefault) => {
        let newState = this.handleNP(type, n, this.state, isDefault);
        this.setState(newState);
        if (this.props.onChange && typeof this.props.onChange === 'function') {
            let { dateRange } = newState;
            this.props.onChange({ ...dateRange, type });
        }
    }

    onDateChange = (prop, val) => {
        this.state.dateRange[prop] = Utils.getValidDateString(val);
        if (this.props.onChange && typeof this.props.onChange === 'function') {
            let { dateRange } = this.state;
            this.props.onChange({ ...dateRange, type: '' });
        }
        this.setState(this.state);
    };
    focus(focusTo) {
        if (!focusTo) {
            if (this.fromInput)
                this.fromInput.focus();
        }
        else {
            if (this.toInput)
                this.toInput.focus();
        }
    };
    render() {
        let { dateRange } = this.state;
        return <div className="d-flex flex-column align-items-center justify-content-between border rounded bg-light p-1" style={{ width: '500px' }}>
            <div className="d-flex flex-row align-items-center justify-content-center bg-white w-100">
                <DateChangerBox type="D" handleChange={this.handleChange}></DateChangerBox>
                <DateChangerBox type="M" handleChange={this.handleChange}></DateChangerBox>
                <DateChangerBox type="Q" handleChange={this.handleChange}></DateChangerBox>
                <DateChangerBox type="Y" handleChange={this.handleChange}></DateChangerBox>
            </div>
            <div className="d-flex flex-row align-items-center w-100">
                <div className="text-primary text-center p-1 w-100" style={{ minHeight: '26px' }}>{this.state.UIText || ' '}</div>
            </div>
            <div className="d-flex flex-row align-items-center w-100 mb-2">
                <div className="text-primary text-center p-1 w-100" >
                    <span className=" col  no-label ps-0" style={{ width: '140px', display: 'inline-block' }} >
                        <WKLDatepicker ref={e1 => { this.fromInput = e1 }} value={Utils.getValidDate(dateRange.start)}
                            className="form-control" onChange={(e) => { this.onDateChange("start", e.value); }}>
                        </WKLDatepicker>
                    </span>
                    <span className='col-auto px-2' >To</span>
                    <span className=" col  no-label ps-0" style={{ width: '140px', display: 'inline-block' }} >
                        <WKLDatepicker ref={e1 => { this.toInput = e1 }} value={Utils.getValidDate(dateRange.end)}
                            className="form-control" onChange={(e) => { this.onDateChange("end", e.value); }}>
                        </WKLDatepicker>
                    </span>
                </div>
            </div>
        </div>
    }
}

export { WKLDateFlipper }