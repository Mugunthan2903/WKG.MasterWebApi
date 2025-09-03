
import React, { useEffect, useRef } from "react";
import plugins from './src/plugins';
import suneditor from "./src/suneditor";
import getLanguage from "./lang";
import { events, uploadBeforeEvents } from "./events";
import * as PropTypes from 'prop-types';
import './src/assets/css/suneditor.css';
import './src/assets/css/suneditor-contents.css';

import { customFormatting } from "./buttonList";

const WKLEditor = (props) => {
    const {
        name,
        lang,
        setOptions,
        placeholder,
        width = "100%",
        height = "100%",
        defaultValue,
        value,
        setDefaultStyle,
        getSunEditorInstance,
        appendContents,
        setAllPlugins = true,
        disable = false,
        readOnly = false,
        hide = false,
        hideToolbar = false,
        disableToolbar = false,
        onChange,
        autoFocus,
        onBlur,
        onLoad,
    } = props;


    const txtArea = useRef(null);
    const editor = useRef(null);
    const initialEffect = useRef(true);

    useEffect(() => {
        const options = {
            ...WKLEditor.defaultProps.setOptions,
            ...setOptions,
            lang: lang ? getLanguage(lang) : setOptions.lang,
            width: width ?? setOptions.width,
            placeholder: placeholder ?? setOptions.placeholder,
            plugins: setOptions.plugins ?? (setAllPlugins ? plugins : undefined),
            height: height ?? setOptions.height,
            value: defaultValue ?? setOptions.value,
            defaultStyle: setDefaultStyle ?? setOptions.defaultStyle,
        };


        if (name && options.value && txtArea.current)
            txtArea.current.value = options.value;

        editor.current = suneditor.create(txtArea.current, options);

        if (getSunEditorInstance) getSunEditorInstance(editor.current);

        editor.current.onload = (_, reload) => {
            if (reload) {
                if (onLoad)
                    return onLoad(reload);
                return null;
            }

            if (value) {
                editor.current?.setContents(value);
                editor.current?.core.focusEdge(null);
            }
            if (appendContents) editor.current?.appendContents(appendContents);
            if (editor.current?.util.isIE)
                editor.current?.core._createDefaultRange();
            if (disable) editor.current?.disable();
            if (readOnly) editor.current?.readOnly(true);
            if (hide) editor.current?.hide();
            if (hideToolbar) editor.current?.toolbar.hide();
            if (disableToolbar) editor.current?.toolbar.disable();

            if (autoFocus === false)
                editor.current?.core.context.element.wysiwyg.blur();
            else if (autoFocus)
                editor.current?.core.context.element.wysiwyg.focus();

            if (onLoad)
                return onLoad(reload);
            return null;
        };

        editor.current.onChange = (content) => {
            if (name && txtArea.current) txtArea.current.value = content;
            if (onChange) onChange({ name: props.name, value: content });
        };

        if (onBlur) {
            editor.current.onBlur = (e) =>
                onBlur(e, editor.current?.getContents(true));
        }

        uploadBeforeEvents.forEach((event) => {
            const func = props[event];

            if (editor.current && func)
                editor.current[event] = (files, info, _, uploadHandler) => func(files, info, uploadHandler);
        });

        events.forEach((event) => {
            const func = props[event];
            if (func && editor.current) {
                editor.current[event] = func;
            }
        });

        return () => {
            if (editor.current) editor.current.destroy();
            editor.current = null;
        };
    }, []);

    useEffect(() => {
        if (initialEffect.current) return;
        editor.current?.setOptions({
            lang: getLanguage(lang),
        });
    }, [lang]);

    useEffect(() => {
        if (initialEffect.current) return;
        editor.current?.setOptions({
            placeholder,
            height,
            width,
        });
    }, [placeholder, height, width]);

    useEffect(() => {
        if (setDefaultStyle && !initialEffect.current)
            editor.current?.setDefaultStyle(setDefaultStyle);
    }, [setDefaultStyle]);

    useEffect(() => {
        if (
            !initialEffect.current &&
            value !== undefined &&
            !editor.current?.core.hasFocus
        ) {
            editor.current?.setContents(value);
        }
    }, [value]);

    useEffect(() => {
        if (
            !initialEffect.current &&
            appendContents !== undefined &&
            !editor.current?.core.hasFocus
        ) {
            editor.current?.appendContents(appendContents);
            editor.current?.core.focusEdge(null);
        }
    }, [appendContents]);

    useEffect(() => {
        if (initialEffect.current) return;
        editor.current?.readOnly(readOnly);

        if (hideToolbar) editor.current?.toolbar.hide();
        else editor.current?.toolbar.show();

        if (disableToolbar) editor.current?.toolbar.disable();
        else editor.current?.toolbar.enable();

        if (disable) editor.current?.disable();
        else editor.current?.enable();

        if (hide) editor.current?.hide();
        else editor.current?.show();
    }, [disable, hideToolbar, disableToolbar, hide, readOnly]);

    useEffect(() => {
        initialEffect.current = false;
    }, []);

    return (<textarea style={{ visibility: "hidden" }} ref={txtArea} {...{ name }} ></textarea>);
};
const Lang = {
    en: "en", da: "da", de: "de", es: "es", fr: "fr", ja: "ja", ko: "ko", pt_br: "pt_br", nl: "nl", ru: "ru",
    it: "it", zh_cn: "zh_cn", ro: "ro", pl: "pl", ckb: "ckb", lv: "lv", se: "se", ua: "ua", he: "he", it: "it"
};

WKLEditor.defaultProps = {
    /**
     * @description on data change
     * @param {String} content - html content
     */
    onChange: PropTypes.func,
    /**
     * @description on user
     * @param {InputEvent} event - InputEvent
     */
    onInput: PropTypes.func,
    /**
     * @description 
     * @param {UIEvent} event - UIEvent
     */
    onScroll: PropTypes.func,
    /**
     * @description 
     * @param {ClipboardEvent} event - ClipboardEvent
     * @param {ClipboardEvent["clipboardData"]} clipboardData - ClipboardEvent["clipboardData"]
     * @returns {boolean} boolean
     */
    onCopy: PropTypes.func,
    /**
    * @description 
    * @param {MouseEvent} event - MouseEvent
    */
    onClick: PropTypes.func,
    /**
     * @description 
     * @param {MouseEvent} event - MouseEvent
     */
    onMouseDown: PropTypes.func,
    /**
     * @description 
     * @param {KeyboardEvent} event - KeyboardEvent
     */
    onKeyUp: PropTypes.func,
    /**
     * @description 
     * @param {KeyboardEvent} event - KeyboardEvent
     */
    onKeyDown: PropTypes.func,
    /**
     * @description 
     * @param {FocusEvent} event - FocusEvent
     */
    onFocus: PropTypes.func,
    /**
     * @description 
     * @param {FocusEvent} event - FocusEvent
     * @param {string} editorContents - string
     */
    onBlur: PropTypes.func,
    /**
    * @description 
    * @param {string} contents - string
    */
    onSave: PropTypes.func,
    /**
    * @description 
    * @param {Array} buttonList - Array
    */
    onSetToolbarButtons: PropTypes.func,
    /**
    * @description 
    * @param {boolean} reload - boolean
    */
    onLoad: PropTypes.func,
    /**
     * @description 
     * @param {DragEvent} event - DragEvent
     * @param {string} cleanData - string
     * @param {boolean} maxCharCount - boolean
     * @returns {boolean | Array | void} boolean | Array<any> | void
     */
    onDrop: PropTypes.func,
    /**
     * @description 
     * @param {ClipboardEvent} event - ClipboardEvent
     * @param {string} cleanData - string
     * @param {boolean} maxCharCount - boolean
     */
    onPaste: PropTypes.func,
    /**
     * @description 
     * @param {HTMLImageElement} targetImgElement - HTMLImageElement
     * @param {number} index - number
     * @param {"create" | "update" | "delete"} state - "create" | "update" | "delete"
     * @param {UploadInfo<HTMLImageElement>} videoInfo - UploadInfo<HTMLImageElement>{index: number;  name: string;  size: number;  select: (...args: any) => any;  delete: (...args: any) => any;  element: E;  src: string;}
     * @param {number} remainingFilesCount - number
     */
    onImageUpload: PropTypes.func,
    /**
     * @description 
     * @param {HTMLVideoElement} targetImgElement - HTMLVideoElement
     * @param {number} index - number
     * @param {"create" | "update" | "delete"} state - "create" | "update" | "delete"
     * @param {UploadInfo<HTMLVideoElement>} videoInfo - UploadInfo<HTMLVideoElement>{index: number;  name: string;  size: number;  select: (...args: any) => any;  delete: (...args: any) => any;  element: E;  src: string;}
     * @param {number} remainingFilesCount - number
     */
    onVideoUpload: PropTypes.func,
    /**
     * @description 
     * @param {HTMLAudioElement} targetImgElement - HTMLAudioElement
     * @param {number} index - number
     * @param {"create" | "update" | "delete"} state - "create" | "update" | "delete"
     * @param {UploadInfo<HTMLAudioElement>} videoInfo - UploadInfo<HTMLAudioElement>{index: number;  name: string;  size: number;  select: (...args: any) => any;  delete: (...args: any) => any;  element: E;  src: string;}
     * @param {number} remainingFilesCount - number
     */
    onAudioUpload: PropTypes.func,
    /**
    * @description 
    * @param {Array} files - Array<File>
    * @param {object} info - object
    * @param {UploadBeforeHandler} uploadHandler - UploadBeforeHandler
    * @returns {UploadBeforeReturn} UploadBeforeReturn
    */
    onImageUploadBefore: PropTypes.func,
    /**
    * @description 
    * @param {Array} files - Array<File>
    * @param {object} info - object
    * @param {UploadBeforeHandler} uploadHandler - UploadBeforeHandler
    * @returns {UploadBeforeReturn} UploadBeforeReturn
    */
    onVideoUploadBefore: PropTypes.func,
    /**
    * @description 
    * @param {Array} files - Array<File>
    * @param {object} info - object
    * @param {UploadBeforeHandler} uploadHandler - UploadBeforeHandler
    * @returns {UploadBeforeReturn} UploadBeforeReturn
    */
    onAudioUploadBefore: PropTypes.func,
    /**
    * @description 
    * @param {string} errorMessage - string
    * @param {Any} result - Any
    */
    onImageUploadError: PropTypes.func,
    /**
    * @description 
    * @param {string} errorMessage - string
    * @param {Any} result - Any
    */
    onVideoUploadError: PropTypes.func,
    /**
    * @description 
    * @param {string} errorMessage - string
    * @param {Any} result - Any
    */
    onAudioUploadError: PropTypes.func,
    /**
    * @description 
    * @param {boolean} isCodeView - boolean
    */
    toggleCodeView: PropTypes.func,
    /**
    * @description 
    * @param {boolean} isFullScreen - boolean
    */
    toggleFullScreen: PropTypes.func,
    /**
     * @description 
     * @param {Element} toolbar - Element
     * @param {any} context - any
     */
    showInline: PropTypes.func,
    /**
     * @description 
     * @param {string} name - string
     * @param {Array} controllers - Array
     */
    showController: PropTypes.func,
    /**
    * @description 
    * @param {XMLHttpRequest} xmlHttpRequest - XMLHttpRequest
    * @param {object} info - object {isUpdate: boolean; linkValue: any;element: Element;align: any;linkNewWindow: any;[key: string]: any;  }
    */
    imageUploadHandler: PropTypes.func,
    /**
    * @description 
    * @param {number} height - number
    * @param {number} prevHeight - number
    */
    onResizeEditor: PropTypes.func,

    defaultValue: PropTypes.string,
    autoFocus: PropTypes.bool,
    setAllPlugins: PropTypes.bool,

    /**
    * @description 
    * @param {SunEditorCore} sunEditor - SunEdit
    */
    getSunEditorInstance: PropTypes.func,
    setDefaultStyle: PropTypes.string,
    placeholder: PropTypes.string,
    lang: PropTypes.oneOf(Object.keys(Lang)),
    width: PropTypes.string,
    height: PropTypes.string,
    value: PropTypes.string,
    name: PropTypes.string,
    appendContents: PropTypes.string,
    hideToolbar: PropTypes.bool,
    disableToolbar: PropTypes.bool,
    disable: PropTypes.bool,
    readOnly: PropTypes.bool,
    hide: PropTypes.bool
};
WKLEditor.defaultProps = {
    setOptions: {
        resizingBar: false,
        display: 'block',
        width: '100%',
        height: 'auto',
        popupDisplay: 'full',
        charCounter: false,
        charCounterLabel: 'Characters :',
        font : ['FigtreeBoldItalic', 'FigtreeItalic', 'FigtreeLight', 'FigtreeRegular', 'FigtreeSemiBold', 'Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia', 'tahoma', 'Trebuchet MS', 'Verdana'],
        //imageGalleryUrl: 'https://etyswjpn79.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo',
        //imageGalleryUrl: [{ "src": "http://suneditor.com/docs/cat.jpg", "name": "Tabby", "alt": "Tabby", "tag": "Cat" }, { "src": "http://suneditor.com/docs/cat1.jpg", "name": "Cat paw", "alt": "Cat paw", "tag": "Cat" }, { "src": "http://suneditor.com/docs/cat2.jpg", "name": "Cat", "alt": "Cat", "tag": "Cat" }, { "src": "http://suneditor.com/docs/dog.jpg", "name": "Dog", "alt": "Dog", "tag": "Dog" }, { "src": "http://suneditor.com/docs/welsh Corgi.jpg", "name": "Welsh Corgi", "alt": "Welsh Corgi", "tag": "Dog" }, { "src": "http://suneditor.com/docs/retriever.jpg", "name": "Retriever", "alt": "Retriever", "tag": "Dog" }, { "src": "http://suneditor.com/docs/tiger1.jpg", "name": "Tiger-1", "alt": "Tiger", "tag": "Tiger" }, { "src": "http://suneditor.com/docs/tiger2.jpg", "name": "Tiger-2", "alt": "Tiger", "tag": "Tiger" }, { "src": "http://suneditor.com/docs/tiger3.jpg", "name": "Tiger-3", "alt": "Tiger", "tag": "Tiger" }, { "src": "http://suneditor.com/docs/white-eagle.jpg", "name": "White eagle", "alt": "Bird-White eagle", "tag": "Bird" }, { "src": "http://suneditor.com/docs/ara.jpg", "name": "Ara", "alt": "Bird-Ara", "tag": "Bird" }, { "src": "http://suneditor.com/docs/dove.jpg", "name": "Dove", "alt": "Bird-Dove", "tag": "Bird" }, { "src": "http://suneditor.com/docs/big-whale.jpg", "name": "Big whale", "alt": "Big whale", "tag": "Whale" }, { "src": "http://suneditor.com/docs/sea-whale.jpg", "name": "Whale of the sea", "alt": "Whale of the sea", "tag": "Whale" }, { "src": "http://suneditor.com/docs/blue-whale.jpg", "name": "Blue whale", "alt": "Blue whale", "tag": "Whale" }], "r2": [{ "src": "http://suneditor.com/docs/cat.jpg", "name": "Tabby", "alt": "Tabby", "tag": ["Cat", "Dog"] }, { "src": "http://suneditor.com/docs/cat1.jpg", "name": "Cat paw", "alt": "Cat paw", "tag": "Cat, Tiger" }, { "src": "http://suneditor.com/docs/cat2.jpg", "name": "Cat", "alt": "Cat", "tag": "Cat" }, { "src": "http://suneditor.com/docs/dog.jpg", "name": "Dog", "alt": "Dog", "tag": "Dog" }, { "src": "http://suneditor.com/docs/welsh Corgi.jpg", "name": "Welsh Corgi", "alt": "Welsh Corgi", "tag": "Dog" }, { "src": "http://suneditor.com/docs/retriever.jpg", "name": "Retriever", "alt": "Retriever", "tag": "Dog" }, { "src": "http://suneditor.com/docs/tiger1.jpg", "name": "Tiger-1", "alt": "Tiger", "tag": "Tiger" }, { "src": "http://suneditor.com/docs/tiger2.jpg", "name": "Tiger-2", "alt": "Tiger", "tag": "Tiger" }, { "src": "http://suneditor.com/docs/tiger3.jpg", "name": "Tiger-3", "alt": "Tiger", "tag": "Tiger" }, { "src": "http://suneditor.com/docs/white-eagle.jpg", "name": "White eagle", "alt": "Bird-White eagle", "tag": "Bird" }, { "src": "http://suneditor.com/docs/ara.jpg", "name": "Ara", "alt": "Bird-Ara", "tag": "Bird" }, { "src": "http://suneditor.com/docs/dove.jpg", "name": "Dove", "alt": "Bird-Dove", "tag": "Bird" }, { "src": "http://suneditor.com/docs/big-whale.jpg", "name": "Big whale", "alt": "Big whale", "tag": "Whale" }, { "src": "http://suneditor.com/docs/sea-whale.jpg", "name": "Whale of the sea", "alt": "Whale of the sea", "tag": "Whale" }, { "src": "http://suneditor.com/docs/blue-whale.jpg", "name": "Blue whale", "alt": "Blue whale", "tag": "Whale" }],
        buttonList: customFormatting,
        placeholder: '',//Start typing something...
        /*templates: [
            {
                name: 'Template-1',
                html: '<div style="color:red;">HTML source1</div>',
                isInsert: false
            },
            {
                name: 'Template-2',
                html: '<p>HTML source2</p>',
                isInsert: true
            }
        ],*/
        attributesWhitelist: { all: 'style' },
        //linkRel: ['external']
        linkNoPrefix: true
        //codeMirror: CodeMirror,
        //katex: katex
    }
}
export default WKLEditor;