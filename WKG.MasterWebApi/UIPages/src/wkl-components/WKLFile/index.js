import React from 'react';
import PropTypes from 'prop-types';
import { Utils } from '../Utils';
import './index.css';

export class WKLFile extends React.Component {
    static propTypes = {
        value: PropTypes.string,
        onChange: PropTypes.func,
        name: PropTypes.string,
        placeholder: PropTypes.string,
        disabled: PropTypes.bool,
        accept: PropTypes.string,
        tabIndex: PropTypes.number,
        isMultiFile: PropTypes.bool,
        downloadUrl: PropTypes.string,
        onDownloadUrlClick: PropTypes.func
    }
    static defaultProps = {
        value: undefined,
        onChange: undefined,
        name: '',
        accept: undefined,
        placeholder: 'Please Select',
        disabled: false,
        tabIndex: 0,
        isMultiFile: false,
        downloadUrl: undefined,
        onDownloadUrlClick: undefined
    }
    constructor(props) {
        super(props);
        this.ID = Utils.getUniqueID();
        this.fileInput = null;
        this.focus = this.focus.bind(this);
    }
    focus(open) {
        this.fileInput.focus();
        if (open) {
            this.fileInput.click();
        }
    }

    getSnapshotBeforeUpdate(prevProps) {
        return { notifyRequired: (prevProps.value !== this.props.value) };
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (snapshot.notifyRequired) {
            this.setState({});
        }
    }
    handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.disabled === true) {
            return;
        }
        if (this.fileInput)
            this.fileInput.click();
    };
    handleClear = (e) => {
        e.preventDefault();
        e.stopPropagation();
        Utils.invoke(this.props.onChange, { name: this.props.name, value: null, files: null });
    };
    onFileChange = () => {
        let files = this.fileInput.files || [];
        if (files.length > 0) {
            const fileNames = [];
            const fileList = [];
            for (const file of files) {
                fileNames.push(file.name);
                fileList.push(file);
            }
            Utils.invoke(this.props.onChange, { name: this.props.name, value: fileNames.join(", "), files: fileList });
            this.fileInput.value = "";
        }
        else
            Utils.invoke(this.props.onChange, { name: this.props.name, value: null, files: null });

        if (this.container)
            Utils.focusNext(this.container);
    }
    onKeyDown = (evt) => {
        if (evt.key === 'Enter' && this.container)
            Utils.focusNext(this.container);
    };
    onClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        Utils.invoke(this.props.onDownloadUrlClick, { name: this.props.name, value: this.props.value, downloadUrl: this.props.downloadUrl });
    };
    renderFileControl() {
        const attr = {};
        if (!Utils.isNullOrEmpty(this.props.accept))
            attr.accept = this.props.accept;
        if (this.props.isMultiFile === true)
            attr.multiple = 'multiple';

        return (<input onChange={this.onFileChange} title="" type="file" aria-hidden {...attr} ref={ref => this.fileInput = ref} style={{ display: 'none' }} />);
    }
    render() {
        let placeholder = this.props.placeholder || '';
        let selected = false;
        let displayTextClass = 'col d-inline-block text-truncate';
        if (Utils.isNullOrEmpty(this.props.value)) {
            displayTextClass = 'col text-muted d-inline-block text-truncate';
        }
        else {
            selected = true;
            if (Utils.isNullOrEmpty(this.props.downloadUrl))
                placeholder = (<a href="#" onClick={this.onClick} >{this.props.value}</a>);
            else {
                placeholder = (<a href="#" onClick={this.onClick} download={this.props.value}>{this.props.value}</a>);
            }
        }
        let fileControl = null;
        const attr = {};
        if (this.props.disabled === true) {
            attr.readonly = "readonly";
            selected = false;
        }
        else
            fileControl = this.renderFileControl();
        attr.onKeyDown = this.onKeyDown;

        return (
            <div className="form-control pe-1" {...attr} ref={el => this.container = el} cntrl-id={this.ID} tabIndex={this.props.tabIndex || 0}>
                <span className="d-flex" >
                    {fileControl}
                    <span className={displayTextClass} onClick={this.handleClick} wkl-tool-tip={this.props.value || ''}>{placeholder}</span>
                    {selected === true && <span className="col-auto wkl-file-picker-icon " onClick={this.handleClear}><i className="fa fa-times text-danger"></i></span>}
                    <span className="col-auto wkl-file-picker-icon " onClick={this.handleClick}><i className="fa fa-upload"></i></span>
                </span>
            </div >
        )
    }
}