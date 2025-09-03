import $ from 'jquery';
import { Utils } from "./Utils";
import { ReportModes, ReportWindowTypes, WKLWindowStyles } from '../WKLEnums';

const showInBrowserTab = (options) => {
    const postDataList = options.postDataList || [];
    const url = options.url;

    let formElement = `<form method='post' target='_blank' action='${url}' style="top:-3333333333px;" ></form>`;
    let printRequestForm = $(formElement);
    for (const info of postDataList) {
        const cntrl = $(`<input name='${info.Key}' type='hidden' />  `);
        if (info.Value) {
            if (typeof info.Value === 'string' || info.Value instanceof String)
                cntrl.val(info.Value);
            else
                cntrl.val(JSON.stringify(info.Value));
        }
        printRequestForm.append(cntrl);
    }

    window.setTimeout(() => {
        $('body').append(printRequestForm);
        printRequestForm.submit();
        printRequestForm.remove();
        printRequestForm = null;
    }, 100);
}

const getRequestConfig = (postDataList, isJSONResponse = false) => {
    let config = {};
    config.method = 'POST';
    config.async = true;
    config.crossDomain = true;
    config.processData = false;
    config.contentType = false;
    config.mimeType = "multipart/form-data";
    var formData = new FormData();
    postDataList = postDataList || [];
    for (const info of postDataList) {
        if (info.Value) {
            if (typeof info.Value === 'string' || info.Value instanceof String)
                formData.append(info.Key, info.Value);
            else
                formData.append(info.Key, JSON.stringify(info.Value));
        }
    }
    config.headers = {};
    if (isJSONResponse === true)
        config.headers = { 'Accept': 'application/json;charset=utf8' };

    config.body = formData;
    return config;
};

const downloadFile = (options, callback) => {
    const config = getRequestConfig(options.postDataList, false);
    fetch(options.url, config)
        .then(res => {
            if (res.ok)
                return res.blob();
        }).then((blobby) => {
            try {
                const isAttachment = options.isAttachment || false;
                let anchor = null;
                let downfileName = 'no-file-name';
                if (isAttachment === true) {
                    anchor = document.createElement("a");
                    document.body.appendChild(anchor);

                    if (!Utils.isNullOrEmpty(options.fileName))
                        downfileName = options.fileName;
                }
                if (isAttachment === true) {
                    let objectUrl = window.URL.createObjectURL(blobby);
                    anchor.href = objectUrl;
                    anchor.download = downfileName;
                    anchor.click();
                    window.URL.revokeObjectURL(objectUrl);
                }
                else {
                    var file = blobby;
                    var fileURL = URL.createObjectURL(file);
                    if (Utils.isNullOrEmpty(options.target))
                        window.open(fileURL, "_blank", 'fullscreen=yes');
                    else {
                        callback({ downloaded: true, url: fileURL });
                    }
                }
                callback({ downloaded: true });
                return;
            } catch (ex) {
                callback({ downloaded: false });
            }
        })
        .catch((er) => {
            callback({ downloaded: false });
        });
};

class reportApi {

    downloadFile({ className, flag, data = null, isAttachment = true, fileName = '' }, callback) {
        const settings = {
            ClassName: className || '',
            Flag: flag || '',
            Parameters: null
        };
        if (data) {
            if (typeof data === 'string' || data instanceof String)
                settings.Parameters = data;
            else
                settings.Parameters = JSON.stringify(data);
        }

        const postDataList = [];
        postDataList.push({ Key: 'model', Value: JSON.stringify(settings) });

        let url = Utils.getApiConfig().ReportUrl;
        const options = { url, postDataList, isAttachment, fileName };
        downloadFile(options, callback);
    }

    ajax({ className, flag, data = null }, callback) {
        const settings = {
            ClassName: className || '',
            Flag: flag || '',
            Parameters: null
        };
        if (data) {
            if (typeof data === 'string' || data instanceof String)
                settings.Parameters = data;
            else
                settings.Parameters = JSON.stringify(data);
        }

        const postDataList = [];
        postDataList.push({ Key: 'model', Value: JSON.stringify(settings) });

        const config = getRequestConfig(postDataList, true);

        let url = Utils.getApiConfig().ReportUrl;
        fetch(url, config)
            .then((res) => {
                if (res.ok) {
                    if (res.headers.get("content-type").indexOf("application/json") !== -1)
                        return res.json();
                    else
                        return res.text();
                }
            })
            .then(result => {
                callback(result);
            })
            .catch(error => { callback(null); });
    }


    /**
     * Creates an instance of the element for the specified tag.
     * @param reportMode. WKLEnums.ReportModes
     * @param reportWindowType  WKLEnums.ReportWindowTypes
     * @param owner
     * @param data
     * 
     */
    rdlcReport({ className, flag, data, rdlcViewerHeight = null, reportWindowType = ReportWindowTypes.View, reportMode = ReportModes.View, title = 'Report', downloadFileName = null, key = 'REPORT', owner = null, onClose }) {

        const settings = {
            ClassName: className || '',
            ReportHeight: rdlcViewerHeight || 0.0,
            Flag: flag || '',
            Parameters: null,
            ReportMode: reportMode,
            HidePrint: false
        };
        if (reportWindowType === ReportWindowTypes.Download) {
            settings.IsInline = false;
        }
        else if (reportMode !== ReportModes.View) {
            settings.IsInline = true;

        }
        if (data) {
            if (typeof data === 'string' || data instanceof String)
                settings.Parameters = data;
            else
                settings.Parameters = JSON.stringify(data);
        }

        const postDataList = [];
        postDataList.push({ Key: 'model', Value: JSON.stringify(settings) });
        let url = Utils.getApiConfig().ReportUrl;

        if (reportWindowType == ReportWindowTypes.Download) {
            const options = {};
            options.url = url;
            options.postDataList = postDataList;
            options.isAttachment = true;
            options.fileName = downloadFileName || '';
            downloadFile(options, (e) => {
                onClose(e);
            });
        }
        else {
            if (reportWindowType === ReportWindowTypes.BroswerTab) {
                const options = { url: url, postDataList };
                showInBrowserTab(options);
            }
            else {
                const x = {
                    url: Utils.getReportControlUrl(),
                    text: title,
                    key: key,
                    isClosable: true,
                    closeAndOpen: true,
                    data: { PostDataList: postDataList, Title: title }
                };
                if (reportWindowType === ReportWindowTypes.MainTab)
                    owner.addTab(x, true);
                else if (reportWindowType === ReportWindowTypes.Tab)
                    owner.addTab(x, false);
                else {
                    x.windowStyle = WKLWindowStyles.slideLeft;
                    owner.showWindow(x);
                }
            }
        }
    }
}
const ReportApi = new reportApi();
export { ReportApi };