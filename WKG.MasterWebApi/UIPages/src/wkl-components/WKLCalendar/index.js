import * as React from 'react';
import * as PropTypes from 'prop-types';
import moment from 'moment';
import './index.css';

export class WKLCalendar extends React.Component {
    static blockedDates = [];
    static specialDays = [];

    static weeks = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    static months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    static propTypes = {
        /**
    * @description name of the control
    * @param {String} name
    */
        name: PropTypes.string,
        displayFrom: PropTypes.number,
        displayTo: PropTypes.number,
        value: PropTypes.object,
        today: PropTypes.object,
        showToday: PropTypes.bool,
        // showWeek: PropTypes.bool,
        // weekNumberHeader: PropTypes.string,
        firstDay: PropTypes.number,
        style: PropTypes.object,
        border: PropTypes.bool,
        onChange: PropTypes.func,
        // onMonthChanged: PropTypes.func,
        // onYearChanged: PropTypes.func,
        startDate: PropTypes.object,
        endDate: PropTypes.object,
        blockedDates: PropTypes.array
    };
    static defaultProps = {
        name: '',
        value: null,
        today: new Date(),
        showToday: true,
        // showWeek: false,
        // weekNumberHeader: 'WK',
        firstDay: 0,
        style: {
            width: '250px',
            height: '250px'
        },
        displayFrom: 1,
        displayTo: 3,
        border: true,
        onChange: undefined,
        // onMonthChanged: undefined,
        // onYearChanged: undefined,
        blockedDates: undefined,
        startDate: undefined,
        endDate: undefined
    };

    constructor(props) {
        super(props);

        let year = this.props.today.getFullYear();
        let month = this.props.today.getMonth() + 1;
        let selectedDate = undefined;
        let day = this.props.today.getDate();
        if (props.value && props.value != null) {
            year = this.props.value.getFullYear();
            month = this.props.value.getMonth() + 1;
            day = this.props.value.getDate();
            selectedDate = props.value;
        }
        if (props.startDate && props.startDate != null) {
            year = this.props.startDate.getFullYear();
            month = this.props.startDate.getMonth() + 1;
            day = this.props.startDate.getDate();
        }

        let displayFrom = 1;
        let displayTo = 3;
        if (this.props.displayFrom > this.props.displayTo || this.props.displayFrom < 1 || this.props.displayFrom > 3
            || this.props.displayTo < 1 || this.props.displayTo > 3) {
        }
        else {
            displayFrom = this.props.displayFrom
            displayTo = this.props.displayTo;
        }
        let mode = 'DAY';
        switch (displayFrom) {
            case 2:
                mode = 'MONTH';
                break;
            case 3:
                mode = 'YEAR';
                break;
            default:
        }
        this.state = { prevYear: null, startDate: props.startDate, endDate: props.endDate, displayFrom: displayFrom, displayTo: displayTo, year: year, month: month, day: day, selectedDate: selectedDate, mode: mode };
    }

    static getDerivedStateFromProps(props, state) {
        // Re-run the filter whenever the list array or filter text change.
        // Note we need to store prevPropsList and prevFilterText to detect changes.


        if (props.value && props.value != null) {
            const selectedDate = props.value;
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth() + 1;
            const day = selectedDate.getDate();
            if (props.value !== state.selectedDate)
                return { year, month, day, selectedDate };
            else
                return state;
        }

        if (props.startDate && props.startDate != null && props.startDate !== state.startDate) {
            const year = props.startDate.getFullYear();
            const month = props.startDate.getMonth() + 1;
            const day = props.startDate.getDate();
            return { year, month, day };
        }

        /*if (props.selectedDate != state.selectedDate) {
            if (props.selectedDate) {
                const selectedDate = props.selectedDate;
                const year = selectedDate.getFullYear();
                const month = selectedDate.getMonth() + 1;
                const day = selectedDate.getDate();
                return { year, month, day, selectedDate };
            }
        }*/
        return state;
    }
    getDateInfo(selectedDate) {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;
        const day = selectedDate.getDate();
        return { year, month, day, selectedDate };
    }
    dayMove(mode) {
        let val = 0;
        switch (mode) {
            case "RIGHT":
                val = 1;
                break;
            case "LEFT":
                val = -1;
                break;
            case "UP":
                val = -7;
                break;
            case "DOWN":
                val = 7;
                break;
            case "ENTER":
                const dt = new Date(this.state.year, this.state.month - 1, this.state.day);
                this.invokeDatechanged(dt);
                return;
                break;
            default:
                break;
        }
        const dt = new Date(this.state.year, this.state.month - 1, (this.state.day + val));
        const year = dt.getFullYear();
        const month = dt.getMonth() + 1;
        const day = dt.getDate();
        this.setState({ year: year, month: month, day: day });
    };
    moveTo = (mode) => {
        if (this.state.mode === 'DAY')
            this.dayMove(mode);
    };
    handleNextPrev = (mode) => {
        if (this.state.mode === 'YEAR') {
            switch (mode) {
                case "NM":
                    mode = "NY";
                    break;
                case "PM":
                    mode = "PY";
                    break;
                case "NY":
                    mode = "NPY";
                    break;
                case "PY":
                    mode = "PPY";
                    break;
                default:
                    break;
            }
        }
        switch (mode) {
            case "NY":
                this.setState({
                    year: (this.state.year + 1),
                    prevYear: null
                });
                break;
            case "PY":
                this.setState({
                    year: (this.state.year - 1),
                    prevYear: null
                });
                break;
            case "NPY":
                this.setState({
                    year: (this.state.year + 30),
                    prevYear: null
                });
                break;
            case "PPY":
                this.setState({
                    year: (this.state.year - 30),
                    prevYear: null
                });
                break;
            case "NM":
                {
                    let month = this.state.month + 1;
                    let year = this.state.year;
                    if (month > 12) {
                        month = 1;
                        year += 1;
                    }
                    this.setState({
                        year: year,
                        month: month,
                        prevYear: null
                    });
                }
                break;
            case "PM":
                {
                    let month = this.state.month - 1;
                    let year = this.state.year;
                    if (month < 1) {
                        month = 12;
                        year -= 1;
                    }
                    this.setState({
                        year: year,
                        month: month,
                        prevYear: null
                    });
                }
                break;
            default:
                break;
        }
    };

    invokeDatechanged(dt) {
        let dateInfo = this.getDateInfo(dt);
        this.setState(dateInfo);
        if (this.props.onChange)
            this.props.onChange({ eventName: 'DATE-CHANGED', value: dt, date: dt, name: this.props.name });
    };

    containerCallback = (e) => {
        const eventName = e.eventName;
        if (eventName === 'YEAR-SELECTED') {
            let state = {};
            if (e.year !== this.state.year) {
                if (this.state.displayFrom === 3 && !(this.state.prevYear))
                    state.prevYear = this.state.year;
                state.year = e.year;
            }
            if (this.state.displayFrom <= 2)
                state.mode = 'MONTH';

            if (state.year || state.mode) {
                this.setState(state);

                if (this.state.displayFrom === 3) {
                    let dt = new Date(e.year, 0, 1);
                    this.invokeDatechanged(dt);
                }

                // if (this.props.onYearChanged && state.year)
                //     this.props.onYearChanged({ eventName: 'YEAR-CHANGED', value: this.state.year, year: this.state.year, name: this.props.name });
            }
        }
        else if (eventName === 'MONTH-SELECTED') {
            let state = { prevYear: null };
            if (e.month !== this.state.month)
                state.month = e.month;
            if (this.state.displayFrom <= 1)
                state.mode = 'DAY';
            this.setState(state);

            if (this.state.displayFrom === 2 || this.state.displayTo === 2) {
                let dt = new Date(this.state.year, e.month - 1, 1);
                this.invokeDatechanged(dt);
            }

            // if (this.props.onMonthChanged)
            //     this.props.onMonthChanged({ eventName: 'MONTH-CHANGED', value: this.state.month, year: this.state.year, month: this.state.month, name: this.props.name });
        }
        else if (eventName === 'DAY-SELECTED') {
            this.setState({ prevYear: null });
            this.invokeDatechanged(e.date);
        }
    };

    onTodaySelect = (e) => {
        try {
            if (e && e.stopPropagation) {
                e.stopPropagation();
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
            }

        } catch (ex) { } this.invokeDatechanged(this.props.today);
    };
    onMonthMode = (e) => {
        try {
            if (e && e.stopPropagation) {
                e.stopPropagation();
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
            }

        } catch (ex) { }
        this.setState({ mode: 'MONTH' });
    };
    onYearMode = (e) => {
        try {
            if (e && e.stopPropagation) {
                e.stopPropagation();
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
            }

        } catch (ex) { }
        this.setState({ mode: 'YEAR' });
    };

    renderDayPanel() {
        const attr = {};
        attr.year = this.state.year;
        attr.month = this.state.month;
        attr.focusedDay = this.state.day;
        attr.selectedDate = this.state.selectedDate;
        attr.today = this.props.today;
        attr.firstDay = this.props.firstDay;
        attr.showWeek = this.props.showWeek;
        attr.today = this.props.today;
        attr.startDate = this.props.startDate;
        attr.endDate = this.props.endDate;
        attr.weekNumberHeader = this.props.weekNumberHeader;
        attr.parentCallback = this.containerCallback;
        let blockedDates = WKLCalendar.blockedDates || [];
        if (this.props.blockedDates !== undefined)
            blockedDates = this.props.blockedDates;
        attr.blockedDates = blockedDates;//.where(d => d.getMonth() == attr.month && d.getFullYear() == attr.year);
        attr.specialDays = WKLCalendar.specialDays || [];


        return (<WKLDayPanel {...attr} />);
    };
    renderMonthPanel() {
        const attr = {};
        attr.month = this.state.month;
        attr.parentCallback = this.containerCallback;

        return (<WKLMonthPanel {...attr} />);
    };
    renderYearPanel() {
        const attr = {};
        if (this.props.displayFrom === 3) {
            attr.year = this.state.prevYear || this.state.year;
            attr.selectedYear = this.state.year;
        }
        else {
            attr.year = this.state.year;
            attr.selectedYear = this.state.year;
        }
        attr.parentCallback = this.containerCallback;

        return (<WKLYearPanel {...attr} />);
    };
    renderShowToday() {
        const today = moment(this.props.today).format('ddd, DD MMM');
        const disabled = (this.props.blockedDates || []).any(dy => (dy.getFullYear() === this.props.today.getFullYear() && dy.getMonth() === this.props.today.getMonth() && dy.getDate() === this.props.today.getDate()));
        let attr = {};
        if (!disabled)
            attr.onClick = this.onTodaySelect;
        return (<div className="wc-top-area">
            <span className="text-info pointer" {...attr}>
                {today}
            </span>
        </div>);
    };

    render() {
        let classList = ['wit-calendar-wrapper no-icon'];
        if (this.props.children)
            classList = ['wit-calendar-wrapper'];
        let month = '';
        let year = '';
        let titleComponents = [];
        if (this.state.mode === 'DAY') {
            month = WKLCalendar.months[this.state.month - 1];
            year = this.state.year;
            titleComponents.push(<div key="cldr_mnth_1"><span className="pointer wc-cell" onClick={this.onMonthMode}>{month}</span><span className="pointer wc-cell" onClick={this.onYearMode}> {year}</span></div>);
            titleComponents.push(<span key="cldr_mnth_2" className='wc-dy-area-prev-next'><i className="fa fa-angle-left p-1 pointer wc-cell" onClick={(e) => this.handleNextPrev('PM')}></i><i className="fa fa-angle-right p-1 pointer wc-cell" onClick={(e) => this.handleNextPrev('NM')}></i></span>);
        }
        else if (this.state.mode === 'MONTH') {
            year = this.state.year;
            titleComponents.push(<span key="cldr_mnth_1"><span className="pointer wc-cell" onClick={this.onYearMode}>{year}</span></span>);
            titleComponents.push(<span key="cldr_mnth_2" className='wc-dy-area-prev-next'><i className="fa fa-angle-left p-1 pointer wc-cell" onClick={(e) => this.handleNextPrev('PY')}></i><i className="fa fa-angle-right p-1 pointer wc-cell" onClick={(e) => this.handleNextPrev('NY')}></i></span>);
        }
        else {
            year = this.state.year;
            titleComponents.push(<span key="cldr_mnth_1">{year}</span>);
            titleComponents.push(<span key="cldr_mnth_2" className='wc-dy-area-prev-next'><i className="fa fa-angle-left p-1 pointer wc-cell" onClick={(e) => this.handleNextPrev('PY')}></i><i className="fa fa-angle-right p-1 pointer wc-cell" onClick={(e) => this.handleNextPrev('NY')}></i></span>);
        }
        return (<div className={classList.join(' ')}>
            {this.props.showToday && this.renderShowToday()}

            <div className="wc-content-area">
                <div className="wc-calendar-area">
                    <div className="wc-dy-area mt-2 mb-2">
                        {titleComponents}
                    </div>
                    <div className="wc-dm-area">
                        {this.state.mode === 'DAY' && this.renderDayPanel()}
                        {this.state.mode === 'MONTH' && this.renderMonthPanel()}
                        {this.state.mode === 'YEAR' && this.renderYearPanel()}
                    </div>
                </div>
                <div className="wc-icon-area">
                    <div className="border-gradient">
                    </div>
                    {this.props.children}
                </div>
            </div>
        </div>);
    };
};
class WKLYearPanel extends React.Component {
    static propTypes = {
        year: PropTypes.number.isRequired,
        parentCallback: PropTypes.func.isRequired
    };
    static defaultProps = {
        parentCallback: undefined
    };

    containerCallback = (e) => {
        if (this.props.parentCallback)
            this.props.parentCallback(e);
    };

    renderYears() {
        const years = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
        return years.map((yr) => {
            let attr = { year: (this.props.year + yr) };
            if (this.props.selectedYear === attr.year)
                attr.isSelected = true;

            attr.parentCallback = this.containerCallback;
            return <WKLYearCell key={yr} {...attr} />;
        });
    }
    render() {
        let classList = ['wc-yr-view'];
        return (<div className={classList.join(' ')}>{this.renderYears()}</div>);
    };
}
class WKLYearCell extends React.Component {
    static propTypes = {
        year: PropTypes.number,
        isSelected: PropTypes.bool,
        disabled: PropTypes.bool,
        parentCallback: PropTypes.func.isRequired
    };
    static defaultProps =
        {
            isSelected: false,
            disabled: false,
            parentCallback: undefined
        };

    handleClick = (e) => {
        try {
            if (e && e.stopPropagation) {
                e.stopPropagation();
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
            }

        } catch (ex) { }
        if (this.props.parentCallback) {
            this.props.parentCallback({ eventName: 'YEAR-SELECTED', year: this.props.year });
        }
    };

    render() {
        let events = {};

        let classList = [];
        if (this.props.isSelected)
            classList.push('selected active');
        if (this.props.disabled) {
            classList.push('disabled');
        }
        else
            events.onClick = this.handleClick;

        return (<span className={classList.join(' ')} {...events}>{this.props.year}</span>);
    };
}
class WKLMonthPanel extends React.Component {
    static propTypes = {
        month: PropTypes.number.isRequired,
        parentCallback: PropTypes.func.isRequired
    };
    static defaultProps = {
        parentCallback: undefined
    };

    containerCallback = (e) => {
        if (this.props.parentCallback)
            this.props.parentCallback(e);
    };

    renderMonths() {
        return WKLCalendar.months.map((mn, i) => {
            let attr = { month: i };
            if (i === (this.props.month - 1))
                attr.isSelected = true;

            attr.parentCallback = this.containerCallback;
            return <WKLMonthCell key={mn} {...attr} />;
        });
    }
    render() {
        let classList = ['wc-mt-view'];
        return (<div className={classList.join(' ')}>{this.renderMonths()}</div>);
    };
}
class WKLMonthCell extends React.Component {
    static propTypes = {
        month: PropTypes.number,
        isSelected: PropTypes.bool,
        disabled: PropTypes.bool,
        parentCallback: PropTypes.func.isRequired
    };
    static defaultProps =
        {
            isSelected: false,
            disabled: false,
            parentCallback: undefined
        };

    handleClick = (e) => {
        try {
            if (e && e.stopPropagation) {
                e.stopPropagation();
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
            }

        } catch (ex) { }
        if (this.props.parentCallback) {
            this.props.parentCallback({ eventName: 'MONTH-SELECTED', month: (this.props.month + 1) });
        }
    };

    render() {
        let events = {};

        let classList = [];
        if (this.props.isSelected)
            classList.push('selected active');
        if (this.props.disabled) {
            classList.push('disabled');
        }
        else
            events.onClick = this.handleClick;

        const monthName = WKLCalendar.months[this.props.month];
        return (<span className={classList.join(' ')} {...events}>{monthName}</span>);
    };
}
class WKLDayPanel extends React.Component {
    static propTypes = {
        year: PropTypes.number.isRequired,
        month: PropTypes.number.isRequired,
        focusedDay: PropTypes.number,
        selectedDate: PropTypes.object,
        today: PropTypes.object.isRequired,
        firstDay: PropTypes.number,
        showWeek: PropTypes.bool,
        weekNumberHeader: PropTypes.string,
        parentCallback: PropTypes.func.isRequired
    };
    static defaultProps = {
        selectedDate: null,
        focusedDay: undefined,
        firstDay: 0,
        showWeek: false,
        parentCallback: undefined
    };

    containerCallback = (e) => {
        if (this.props.parentCallback)
            this.props.parentCallback(e);
    };

    getWeekNumber(date) {
        var dateTime = new Date(date.getTime());
        dateTime.setDate(dateTime.getDate() + 4 - (dateTime.getDay() || 7));
        var newDateTime = dateTime.getTime();
        dateTime.setMonth(0);
        dateTime.setDate(1);
        return Math.floor(Math.round((newDateTime - dateTime) / 86400000) / 7) + 1;
    }
    getWeeks(year, month) {
        var dates = [];
        var lastDay = new Date(year, month, 0).getDate();
        for (var i = 1; i <= lastDay; i++) {
            dates.push([year, month, i]);
        }
        var weeks = [], week = [];
        var startDate = -1;
        while (dates.length > 0) {
            let date = dates.shift();
            week.push(date);
            var day = new Date(date[0], date[1] - 1, date[2]).getDay();
            if (startDate === day) {
                day = 0;
            } else {
                if (day === (this.props.firstDay === 0 ? 7 : this.props.firstDay) - 1) {
                    weeks.push(week);
                    week = [];
                }
            }
            startDate = day;
        }
        if (week.length) {
            weeks.push(week);
        }
        var firstWeek = weeks[0];
        if (firstWeek.length < 7) {
            while (firstWeek.length < 7) {
                var firstDay = firstWeek[0];
                let date = new Date(firstDay[0], firstDay[1] - 1, firstDay[2] - 1);
                firstWeek.unshift([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
            }
        } else {
            let firstDay = firstWeek[0];
            let week = [];
            for (let i = 1; i <= 7; i++) {
                var date = new Date(firstDay[0], firstDay[1] - 1, firstDay[2] - i);
                week.unshift([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
            }
            weeks.unshift(week);
        }
        var lastWeek = weeks[weeks.length - 1];
        while (lastWeek.length < 7) {
            let lastDay = lastWeek[lastWeek.length - 1];
            let date = new Date(lastDay[0], lastDay[1] - 1, lastDay[2] + 1);
            lastWeek.push([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
        }
        if (weeks.length < 6) {
            let lastDay = lastWeek[lastWeek.length - 1];
            let week = [];
            for (let i = 1; i <= 7; i++) {
                let date = new Date(lastDay[0], lastDay[1] - 1, lastDay[2] + i);
                week.push([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
            }
            weeks.push(week);
        }
        return weeks;
    };
    renderWeekDays(week, firstDay, lastDay) {
        const dayComponents = week.map((d, i) => {
            let attr = { date: new Date(d[0], d[1] - 1, d[2]), parentCallback: this.containerCallback };
            attr.otherMonth = (this.props.year !== d[0] || this.props.month !== d[1]);
            if (this.props.selectedDate && this.props.selectedDate != null)
                attr.selectedDay = (this.props.selectedDate.getFullYear() === d[0] && (this.props.selectedDate.getMonth() + 1) === d[1] && this.props.selectedDate.getDate() === d[2]);

            if (i === firstDay) {
                attr.saturday = true;
            } else {
                if (i === lastDay) {
                    attr.sunday = true;
                }
            }
            if (i === 0) {
                attr.firstColumn = true;
            } else {
                if (i === week.length - 1) {
                    attr.lastColumn = true;
                }
            }

            attr.disabled = this.props.blockedDates.any(dy => (dy.getFullYear() === d[0] && (dy.getMonth() + 1) === d[1] && dy.getDate() === d[2]));

            var isAfter = true;
            if (this.props.startDate && this.props.startDate instanceof Date) {
                isAfter = moment(attr.date).isSameOrAfter(this.props.startDate);
            }

            var isBefore = true;
            if (this.props.endDate && this.props.endDate instanceof Date) {
                isBefore = moment(attr.date).isSameOrBefore(this.props.endDate);
            }
            if ((!isBefore) || (!isAfter))
                attr.disabled = true;

            if (!attr.disabled && this.props.focusedDay && !attr.otherMonth) {
                attr.isFocused = d[2] === this.props.focusedDay;
            }

            attr.today = (this.props.today.getFullYear() === d[0] && (this.props.today.getMonth() + 1) === d[1] && this.props.today.getDate() === d[2]);
            attr.parentCallback = this.containerCallback;
            const dayKey = `wkday_${i}`;
            return (<WKLDayCell key={dayKey} {...attr} />);
        });
        return dayComponents;
    }
    renderWeeks() {
        var firstDay = 6 - this.props.firstDay;
        var lastDay = firstDay + 1;
        if (firstDay >= 7) {
            firstDay -= 7;
        }
        if (lastDay >= 7) {
            lastDay -= 7;
        }

        var weeks = this.getWeeks(this.props.year, this.props.month);
        const dateComponents = weeks.map((wk, i) => {
            let components = [];
            /* if (this.props.showWeek) {
                 const weekNo = this.getWeekNumber(new Date(wk[0][0], parseInt(wk[0][1]) - 1, wk[0][2]));
                 components.push(<div className="witcalendar-week center">{weekNo}</div>);
             }*/
            const clist = this.renderWeekDays(wk, firstDay, lastDay);
            return components.concat(clist);
        });
        return dateComponents;
    }

    render() {
        let weekHeadersComponent = [];
        for (let i = this.props.firstDay; i < WKLCalendar.weeks.length; i++) {
            weekHeadersComponent.push(<span key={'wk-' + i} >{WKLCalendar.weeks[i]}</span>);
        }
        for (let i = 0; i < this.props.firstDay; i++) {
            weekHeadersComponent.push(<span key={'wk-' + i}>{WKLCalendar.weeks[i]}</span>);
        }

        return (<div className="wc-dy-view ">
            <div className="wc-wk-header">{weekHeadersComponent}</div>
            <div className="wc-dy-list">{this.renderWeeks()}</div>
        </div>);
    };
}
class WKLDayCell extends React.Component {
    static propTypes = {
        isFocused: PropTypes.bool,
        date: PropTypes.object.isRequired,
        otherMonth: PropTypes.bool,
        selectedDay: PropTypes.bool,
        today: PropTypes.bool,
        saturday: PropTypes.bool,
        sunday: PropTypes.bool,
        firstColumn: PropTypes.bool,
        lastColumn: PropTypes.bool,
        disabled: PropTypes.bool,
        parentCallback: PropTypes.func.isRequired
    };
    static defaultProps =
        {
            otherMonth: false,
            selectedDay: false,
            today: false,
            saturday: false,
            sunday: false,
            firstColumn: false,
            lastColumn: false,
            disabled: false,
            parentCallback: undefined
        };

    handleClick = (e) => {
        try {
            if (e && e.stopPropagation) {
                e.stopPropagation();
                e.preventDefault();
                e.nativeEvent.stopImmediatePropagation();
            }

        } catch (ex) { }
        if (this.props.parentCallback) {
            this.props.parentCallback({ eventName: 'DAY-SELECTED', date: this.props.date });
        }
    };

    render() {
        let classList = [];
        if (this.props.otherMonth)
            classList.push('ot-m');
        if (this.props.today)
            classList.push('today');
        if (this.props.selectedDay)
            classList.push('selected active');

        if (this.props.saturday)
            classList.push('weekend');
        if (this.props.sunday)
            classList.push('weekend');

        /*if (this.props.firstColumn)
            classList.push('witcalendar-first');
        if (this.props.lastColumn)
            classList.push('witcalendar-last');*/

        let events = {};
        if (this.props.disabled)
            classList.push('disabled');
        else {
            events.onClick = this.handleClick;
            //events.onMouseDown = this.handleClick;
        }

        /*if (this.props.isFocused)
            classList.push('witcalendar-hover');*/

        let title = "";// moment(this.props.date).format('MMMM Do YYYY');

        var specialDay = WKLCalendar.specialDays.first(sd => sd.Day.getTime() === this.props.date.getTime());
        if (specialDay != null) {
            title = specialDay.title || title;
            classList.push(specialDay.class);
        }

        let day = this.props.date.getDate();
        return (<span title={title} className={classList.join(' ')} {...events}>{day}</span>);
    };
}