import { ApiManager, Msgs } from "../Core";
import moment from 'moment';
import $ from 'jquery';
import { WKLWindowStyles } from "../WKLEnums";

const DIGIT_ARRAY = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
const CHAR_CODE_ZERO = "0".charCodeAt(0);
const CHAR_CODE_NINE = "9".charCodeAt(0);
const CHAR_CODE_a = "a".charCodeAt(0);
const CHAR_CODE_z = "z".charCodeAt(0);
const CHAR_CODE_A = "A".charCodeAt(0);
const CHAR_CODE_Z = "Z".charCodeAt(0);
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_EX = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const luhnChk = (ccNum) => {
    let
        len = ccNum.length,
        bit = 1,
        sum = 0,
        val;

    while (len) {
        val = parseInt(ccNum.charAt(--len), 10);
        sum += ((bit ^= 1) ? DIGIT_ARRAY[val] : val);
    }

    return sum && sum % 10 === 0;
};

const isWritable = (obj, key) => {
    const desc =
        Object.getOwnPropertyDescriptor(obj, key)
        || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), key)
        || {}
    return Boolean(desc.writable)
};

const getDayPart = (day) => {
    if (day.length > 0) {
        day = parseInt(day, 10);
        if (isNaN(day) || !isFinite(day))
            day = 0;
        else if (day < 0 || day > 31)
            day = -1;
    }
    return day;
};
const getMonthPart = (monthText, month) => {
    if (monthText.length > 0) {
        monthText = monthText.toLowerCase();
        month = MONTHS.indexOfEx(m => {
            return m.startsWith(monthText);
        });
        if (month > -1)
            month += 1;
        if (isNaN(month) || !isFinite(month) || month > 12)
            month = 0;
        else if (month < 0 || month > 12)
            month = -1;
    }
    else if (month.length > 0) {
        month = parseInt(month, 10);
        if (isNaN(month) || !isFinite(month))
            month = 0;
        else if (month < 0 || month > 12)
            month = -1;
    }
    return month;
};
const getYearPart = (year) => {
    if (year.length > 0) {
        if (year.length === 2)
            year = '20' + year;
        if (year.length === 3)
            year = '2' + year;
        year = parseInt(year, 10);
        if (isNaN(year) || !isFinite(year))
            year = 0;
        else if (year < 1900 || year > 2100)
            year = -1;
    }
    return year;
};
const getDateParts = (val) => {
    let day = '';
    let month = '';
    let monthText = '';
    let year = '';

    let data = '';
    let vldt = 'D';
    for (let c of val) {
        if (c === '/' || c === '-' || c === '.' || c === ' ') {
            if (data.length > 0) {
                if (vldt === 'D') {
                    day = data;
                    data = '';
                    vldt = 'M'
                }
                else if (vldt === 'M') {
                    month = data;
                    data = '';
                    vldt = 'Y'
                }
                else {
                    year = data;
                }
                continue;
            }
        }
        else
            data += c;

        if (Utils.isDigit(c.charCodeAt(0))) {
            if (vldt === 'D') {
                day = data;
                if (data.length === 2) {
                    data = '';
                    vldt = 'M'
                }
            }
            else if (vldt === 'M') {
                month = data;
                if (data.length === 1) {
                    if (parseInt(data, 10) > 1) {
                        data = '';
                        vldt = 'Y'
                    }
                }
                else if (data.length === 2) {
                    if (parseInt(data, 10) <= 12) {
                        data = '';
                    }
                    else {
                        month = data[0];
                        data = c;
                        year = c;
                    }
                    vldt = 'Y'
                }
            }
            else
                year = data;
        }
        else if (Utils.isAlphabet(c.charCodeAt(0))) {
            monthText += c;
            vldt = 'Y';
            data = '';
        }
    }
    day = getDayPart(day);
    month = getMonthPart(monthText, month);
    year = getYearPart(year);
    return [day, month, year];
};

// const getKeyboardFocusableElements = (element = document) => {
//     return [...element.querySelectorAll(
//         'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
//     )]
//         .filter(el => !el.hasAttribute('disabled') && !el.getAttribute("aria-hidden"));
// }


const resolutionAdjust = () => {
    if (window.devicePixelRatio < 1) {
        let val = (1 + (window.devicePixelRatio / 100.00));
        $('body')[0].style.zoom = val;
    }
    else if (window.devicePixelRatio > 1) {
        let val = .9 / (1 + (window.devicePixelRatio / 100.00));
        $('body')[0].style.zoom = val;
    }
};

class utils {

    static DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    static MONTHS_EX = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    static MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

    _errors = [];
    _languageInfo = null;
    _uniqueID = 0;
    _formAccessInfo = null;
    _authorizationUrl = null;
    _reportControlUrl = null;
    AppInfo = {};

    adjustUIBasedOnResolution() {
        console.log('-------adjustUIBasedOnResolution----------');
        resolutionAdjust();
        try {
            document.removeEventListener('resize', resolutionAdjust);
        }
        catch { }
        document.addEventListener('resize', resolutionAdjust);
    }
    canOpenFullScreen() {

        return document.fullscreenEnabled;
    }
    isFullScreen() {
        if (document.fullscreenElement)
            return true;
        else
            return false;
    }
    fullScreenUI() {
        if (this.canOpenFullScreen()) {
            if (document.fullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { /* Safari */
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE11 */
                    document.msExitFullscreen();
                }
            }
            else {
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) { /* Safari */
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) { /* IE11 */
                    elem.msRequestFullscreen();
                }
                // elem.requestFullscreen({ navigationUI: "show" })
                //     .then(function () {
                //         console.log('Full screen');
                //     })
                //     .catch(function (error) {
                //         console.log('Full screen error');
                //     });
            }
        }
    }
    setUserAccess(formAccessInfo) {
        this._formAccessInfo = formAccessInfo || {};
    }
    setUserAccessUrl(formUrl) {
        this._authorizationUrl = formUrl || null;
    }
    setReportControlUrl(reportControlUrl) {
        this._reportControlUrl = reportControlUrl || null;
    }
    getReportControlUrl() {
        return this._reportControlUrl;
    }
    getUserInfo() {
        return ApiManager.getUser();
    }
    getExtraInfo() {
        return JSON.parse(JSON.stringify(this._formAccessInfo));
    }
    getApiConfig() {
        return ApiManager.getApiConfig();
    }
    getUniqueID() {
        return `WKL_${this._uniqueID++}`;
    }
    isValidCreditCard(cardNumber) {
        /* var luhnChk = (function (arr) {
             return function (ccNum) {
                 var
                     len = ccNum.length,
                     bit = 1,
                     sum = 0,
                     val;
 
                 while (len) {
                     val = parseInt(ccNum.charAt(--len), 10);
                     sum += (bit ^= 1) ? arr[val] : val;
                 }
 
                 return sum && sum % 10 === 0;
             };
         }());*/
        return luhnChk(cardNumber);
    }
    setLanguageInfo(languageInfo) {
        this._languageInfo = languageInfo || null;
        ApiManager.notify(Msgs.LanguageChanged);
    }
    getLanguageText(name) {
        if (name && this._languageInfo && this._languageInfo.Names) {
            return this._languageInfo.Names[name] || name;
        }
        return name;
    };
    setMessages(errors) {
        this._errors = errors || [];
    };
    getMessage(errNo) {
        if (errNo > 0) {
            var err = this._errors.first(s => s.ID === errNo);
            if (err != null)
                return err.Text;
        }
        return null;
    };
    replaceAll(text, search, replacement) {
        return text.replace(new RegExp(search, 'g'), replacement);
    };
    isNullOrEmpty(v) {
        if (v === undefined || v === null)
            return true;
        else if (typeof (v) === 'string')
            return v.trim().length === 0;
        else
            return false;
    };
    isFunction(v) {
        return typeof v === 'function';
    };
    isNumber(value) {
        return typeof value === 'number';
    };
    isObject(value) {
        return value !== null && typeof value === 'object';
    }
    getJSONCopy(object) {
        let copy = null;
        if (!this.isNullOrEmpty(object))
            copy = JSON.parse(JSON.stringify(object));
        return copy;
    }
    getValidDate(v) {
        if (this.isNullOrEmpty(v) || new Date(v) < new Date("2 3 1900"))
            return undefined;
        else {
            return new Date(v);
        }
    };
    getValidDateString(v) {
        if (v instanceof String || typeof (v) == "string")
            v = this.getValidDate(v);

        if (this.isNullOrEmpty(v))
            return undefined;
        else
            return this.dateFormat(v, 'dd MMM yyyy');
    };
    dateFormat(date, f = 'dd MMM yyyy') {
        if (!date.valueOf()) return '';
        var d = date;
        return f.replace(/(yyyy|yy|mmmm|mmm|mm|dddd|ddd|dd|hh|nn|ss|tt)/gi,
            function (v) {
                const h = d.getHours();
                //switch (v.toLowerCase()) {
                switch (v) {
                    case 'yyyy': return d.getFullYear();
                    case 'yy': return d.getFullYear().toString().substr(2, 2);
                    case 'MMMM': return MONTHS_EX[d.getMonth()];
                    case 'MMM': return MONTHS_EX[d.getMonth()].substr(0, 3);
                    case 'MM': return (d.getMonth() + 1).toString().padStart(2, '0');
                    case 'DDDD': return DAYS[d.getDay()];
                    case 'DDD': return DAYS[d.getDay()].substr(0, 3);
                    case 'dd': return d.getDate().toString().padStart(2, '0');
                    case 'hh': return ((h % 12) ? h : 12).toString().padStart(2, '0');
                    case 'HH': return h.toString().padStart(2, '0');
                    case 'mm': return d.getMinutes().toString().padStart(2, '0');
                    case 'ss': return d.getSeconds().toString().padStart(2, '0');
                    case 'tt': return d.getHours() < 12 ? 'AM' : 'PM';
                    default:
                        break;
                }
            }
        );
    }
    getDateFormated(v) {
        if (v instanceof String || typeof (v) == "string")
            v = this.getValidDate(v);

        if (this.isNullOrEmpty(v))
            return undefined;
        else
            return moment(v).format('DD MMM YYYY');
    };
    isAlphabet(n) {
        return (n >= CHAR_CODE_a && n <= CHAR_CODE_z) || (n >= CHAR_CODE_A && n <= CHAR_CODE_Z);
    };
    isDigit(n) {
        return (n >= CHAR_CODE_ZERO && n <= CHAR_CODE_NINE);
    };
    isEmail(text) {
        //const reg = new RegExp('^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$');
        //const reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //const reg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/igm;
        const pattern = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        const reg = new RegExp(pattern, "igm");
        ////const reg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/igm;
        return reg.test(text);
    };
    isPhone(text) {
        const pattern = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        const reg = new RegExp(pattern);
        return reg.test(text);
    };
    isIPAddress(text) {
        const pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const reg = new RegExp(pattern);
        return reg.test(text);
    };
    openElementInPrintView(elment, classname = '') {
        if (elment) {
            classname = classname || '';
            var headerHtml = document.getElementsByTagName('head')[0].innerHTML;
            var elementHtml = elment.innerHTML;
            let url = `href="${window.location.protocol}${window.location.host}/`;
            headerHtml = headerHtml.replaceAll('href="./', url);
            const htmlContent = `<!DOCTYPE html>
                    <html lang="en">
                    <head>${headerHtml}
                    </head>
                    <body class="m-0 p-0">
                    <div id="root" class="container-fluid vh-100 m-0 p-0 ${classname}">${elementHtml}
                    </body>
                    </html>`;
            const w = this.openHtmlInWindow(htmlContent);
            w.window.print();
        }
    }
    /**
     * htmlContent = html element
     * downfileName = download filename. Extension should be xls
     */
    downloadAsExcel(elment, downfileName) {
        if (elment) {
            var excelTemplate = '<html> ' +
                '<head> ' +
                '<meta http-equiv="content-type" content="text/plain; charset=UTF-8"/> ' +
                '</head> ' +
                '<body> ' +
                elment.outerHTML +
                '</body> ' +
                '</html>';
            var blob = new Blob([excelTemplate], { type: 'text/html' });
            let objectUrl = window.URL.createObjectURL(blob);
            this.downloadFileByUrl(objectUrl, downfileName);
            window.URL.revokeObjectURL(objectUrl);
        }
    };
    downloadFileByUrl(url, fileName) {
        let anchor = document.createElement("a");
        document.body.appendChild(anchor);
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.setTimeout(() => { anchor.remove(); }, 100);
    }
    openHtmlInWindow(htmlContent) {
        const winUrl = URL.createObjectURL(
            new Blob([htmlContent], { type: "text/html" })
        );
        const win = window.open(
            winUrl,
            "WKL Print View",
            `width=800,height=400,screenX=200,screenY=200`
        );
        return win;
    };
    downloadHtmlTableToExcel(elment, className = '', downfileName = '') {
        if (elment) {
            className = className || '';
            var tableHtml = elment.outerHTML;
            var div = document.createElement("div");
            div.innerHTML = tableHtml;
            const tableElemnt = div.firstChild;

            var styleHandler = new Styles();

            let styles = styleHandler.getUserStyles(elment);
            for (let property in styles) {
                tableElemnt.style[property] = styles[property];
            }

            let rowSrc = null;
            let rowTrgt = null;
            let cellSrc = null;
            let cellTrgt = null;
            for (let rIdx = 0; rIdx < elment.rows.length; rIdx++) {
                rowSrc = elment.rows[rIdx];
                rowTrgt = tableElemnt.rows[rIdx];

                let styles = styleHandler.getUserStyles(rowSrc);
                for (let property in styles) {
                    rowTrgt.style[property] = styles[property];
                }

                for (let cIdx = 0; cIdx < rowSrc.cells.length; cIdx++) {

                    cellSrc = rowSrc.cells[cIdx];
                    cellTrgt = rowTrgt.cells[cIdx];

                    let styles = styleHandler.getUserStyles(cellSrc);
                    for (let property in styles) {
                        cellTrgt.style[property] = styles[property];
                    }
                }
            }
            styleHandler.cleanObject();
            tableHtml = tableElemnt.outerHTML;

            //let location = 'data:application/vnd.ms-excel;base64,';
            const excelTemplate = `<!DOCTYPE html>
                <html lang="en">
                <head><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head>
                <body>
                ${tableHtml}
                </body>
                </html>`;

            if (this.isNullOrEmpty(downfileName))
                downfileName = 'no-name.xls';

            var blob = new Blob([excelTemplate], { type: 'text/html' });
            let objectUrl = window.URL.createObjectURL(blob);
            this.downloadFileByUrl(objectUrl, downfileName);
            window.URL.revokeObjectURL(objectUrl);
        }
    }
    downloadFile(options, callback) {
        ApiManager.downloadFile(options, callback);
    };
    loginAjax(data, callback) {
        ApiManager.signIn({ data }, callback);
    };
    ajax(options, callback) {
        ApiManager.fetchData(options, callback);
    };
    search(options) {
        return new Promise((resolve, reject) => {
            Utils.ajax(options, resolve);
        });
    }
    dateParse(val) {
        let [day, month, year] = getDateParts(val);
        let dt = null;
        if (day === -1 || year === -1 || month === -1)
            return null;

        if (day > 0 || year > 0 || month > 0) {
            if (day === 0 || day === '')
                day = 1;
            if (month === 0)
                month = new Date().getMonth() + 1;
            else if (year === 0)
                year = new Date().getFullYear();
            let mnt = moment(`${day}-${month}-${year}`, 'DD-MM-YYYY');
            if (mnt.isValid())
                dt = mnt.toDate();
        }
        return dt;
    }
    addReadOnlyProperty(obj, name, val) {
        Object.defineProperty(obj, name, {
            value: val,
            writable: false,
            enumerable: true,
            configurable: true
        });
        return obj;
    };
    invoke(callback, args) {
        if (callback && typeof callback === 'function') {
            return callback(args);
        }
    };
    ___canInvoke({ formID, controlID, owner, callback }) {
        if (Utils.isNullOrEmpty(formID) || Utils.isNullOrEmpty(controlID) || owner === null || owner === undefined || callback === null || callback === undefined)
            return false;
        else
            return true;
    }
    ___onAuthenticationReqiured({ formID, controlID }) {
        try {
            let form = this._formAccessInfo.AccessibleForms.first(f => f.ID === formID);
            if (form != null) {
                let cntrl = form.Controls.first(c => c.ID === controlID);
                if (cntrl != null) {
                    return false;
                }
            }
        }
        catch { }
        return true;
    }
    invokeAction({ formID, controlID, owner, callback }) {
        const user = this.getUserInfo();
        //console.log('-------------invokeAction------------');
        //if (this._formAccessInfo) {
        //    if (this.___canInvoke({ formID, controlID, owner, callback }) && this.___onAuthenticationReqiured({ formID, controlID })) {
        //        const dataInfo = {
        //            FormID: formID,
        //            ControlID: controlID
        //        };
        //        owner.showWindow({
        //            url: this._authorizationUrl,
        //            windowStyle: WKLWindowStyles.top,
        //            data: dataInfo,
        //            onClose: (e) => {
        //                e = e || {};
        //                if (e.IsValid === true) {
        //                    Utils.invoke(callback, { userID: e.UserID || user?.ID });
        //                }
        //            }
        //        });
        //    }
        //    return;
        //}
        Utils.invoke(callback, { userID: user?.ID });
    };
    cleanObject(objectToClean, deepClean = false) {
        if (objectToClean) {
            Object.keys(objectToClean).forEach((param) => {
                try {
                    if (objectToClean[param]) {
                        if (deepClean === true) {
                            if ((objectToClean[param]).toString() === "[object Object]") {
                                this.cleanObject(objectToClean[param]);
                            }
                        }
                        if (isWritable(objectToClean, param))
                            objectToClean[param] = undefined;
                    }
                } catch { }
            });
        }
    };

    getKeyboardFocusableElements(element = document) {
        return [...element.querySelectorAll(
            '.wit-dd-wraper, a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
        )]
            .filter(el => !el.hasAttribute('disabled') && !el.getAttribute("aria-hidden"));
    }
    focusNext(nextSibling, isControl = true) {
        try {
            if (nextSibling) {
                let parent = nextSibling;
                if (isControl === true)
                    parent = nextSibling.closest('.wkl-window-body');
                const controls = this.getKeyboardFocusableElements(parent);
                if (controls.length > 0) {
                    let index = controls.indexOf(nextSibling);
                    let control = null;
                    if (index > -1 && (index + 1) < controls.length) {
                        control = controls[index + 1];
                    }
                    if (control == null)
                        control = controls[0];
                    window.setTimeout(() => {
                        control.focus();
                    });
                }
            }
        }
        catch { }
    };
}



const Utils = new utils();
export { Utils };
class Styles {
    constructor() {
        this.blankIframe = null;
        this.nodeStyles = [];
    }
    cleanObject() {
        if (this.blankIframe) {
            this.blankIframe.remove();
            this.blankIframe = null;
        }
        if (this.nodeStyles) {
            for (let property of this.nodeStyles) {
                property.value = null
            }
        }
        this.nodeStyles = null;
    }
    // Returns a dummy iframe with no styles or content
    // This allows us to get default styles from the browser for an element
    getStylesIframe() {
        if (this.blankIframe) {
            return this.blankIframe;
        }

        this.blankIframe = document.createElement('iframe');
        this.blankIframe.width = "0px";
        this.blankIframe.height = "0px";
        document.body.appendChild(this.blankIframe);
        return this.blankIframe;
    }

    // Turns a CSSStyleDeclaration into a regular object, as all values become "" after a node is removed
    getStylesObject(node, parentWindow) {
        const styles = parentWindow.getComputedStyle(node);
        let stylesObject = {};

        for (let i = 0; i < styles.length; i++) {
            const property = styles[i];
            stylesObject[property] = styles[property];
        }

        return stylesObject;
    }

    // Returns a styles object with the browser's default styles for the provided node
    getDefaultStyles(node) {
        let defaultStyles = null;
        if (!(defaultStyles)) {
            const iframe = this.getStylesIframe();
            const iframeDocument = iframe.contentDocument;
            const targetElement = iframeDocument.createElement(node.tagName);

            iframeDocument.body.appendChild(targetElement);
            defaultStyles = this.getStylesObject(targetElement, iframe.contentWindow);

            targetElement.remove();
        }

        return defaultStyles;
    }

    // Returns a styles object with only the styles applied by the user's CSS that differ from the browser's default styles
    getUserStyles(node) {
        const defaultStyles = this.getDefaultStyles(node);
        const styles = this.getStylesObject(node, window);
        let userStyles = {};

        for (let property in defaultStyles) {
            if (styles[property] != defaultStyles[property]) {
                let val = styles[property];
                if (val)
                    userStyles[property] = val;
            }
        }

        return userStyles;
    }
};
