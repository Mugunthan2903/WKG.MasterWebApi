import React from 'react';
import SSM009VM from './SSM009VM';
import * as cntrl from '../../../wkl-components';

export default class SSM009 extends cntrl.WKLComponent {
    constructor(props) {
        super(props, new SSM009VM(props));
        this.inputRefs = {};
    }

    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
    }
    onClosing = () => {
        this.clickAction({ id: 'btn_close' });
        return false;
    };



    clickAction = (e) => {
        if (this.VM) {
            console.log('clickAction');
            if (e) {
                let action = e.id;
                if (action === undefined && e.target) {
                    action = e.target.name || e.target.id || '';
                    e = undefined;
                }
                if (!action) {
                    return;
                }

                try {
                    if (e && e.stopPropagation) {
                        e.stopPropagation();
                        e.preventDefault();
                        e.nativeEvent.stopImmediatePropagation();
                    }

                } catch (ex) { }

                if (action == "btn_close") {
                    this.VM.doClose();
                }
            }
        }
    }
    onImageSelect = (data) => {
        const model = this.VM.Data;
        const dataInfo = {};
        this.VM.doClose(data);

    }
    handleSubstring = (imgname) => {
        let result = " ";
        let imglen = 20;
        try {
            if (imgname && imgname.length >= imglen) {
                result = imgname.substring(0, imglen) + "...";
            } else {
                result = imgname;
            }
        }
        catch (ex) { }
        return result;
    }

    render() {
        const owner = this;
        const dataModel = this.VM.Data.Input;
        const model = this.VM.Data;

        let title = '';
        let showloading = false;
        if (this.VM && this.VM.Data) {
            showloading = model.Loading;
            title = model.Title;
        }

        return (
            <cntrl.WKLControl wrapperClass="modal-xl" loading={showloading} title={title}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <cntrl.WKLBody>
                    <div className="window-content-area vh-100 p-3" style={{ width: "50rem" }}>
                        <div className="container-fluid h-100 p-0">
                            <div className="row">
                                <div className="col-md-12 p-2">
                                    <div className='row'>
                                        {model.ImageDiv &&
                                            model.ImageDiv.map((data, index) => {
                                                return (
                                                    <div className="col-md-3 p-2 mb-3" key={index}>
                                                        <div className="card" style={{ cursor: "pointer" }} onClick={(e) => this.onImageSelect(data)}>
                                                            <div id={data.img_dir + data.img_srl} style={{ height: "150px" }} >
                                                                {data.img_Ftp_url ? (
                                                                    data.is_video ?
                                                                        (<video controls style={{ width: "100%", height: "150px", objectFit: "cover" }}>
                                                                            <source src={data.img_Ftp_url} type="video/mp4" />
                                                                        </video>) :
                                                                        <img src={data.img_Ftp_url} className="card-img-top" style={{ width: "100%", height: "150px", objectFit: "cover" }} />
                                                                ) : null}
                                                            </div>
                                                            <div className="card-body text-center p-2">
                                                                <p className="card-text">{this.handleSubstring(data.img_nam)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </cntrl.WKLBody>
                <div className="window-button-area">
                    <div className="row">
                        <div className="col-md-5">
                        </div>
                        <div className="col border-start">
                        </div>
                        <div className="col-auto">
                            <button type="button" id="btn_close" hot-key="C" className="btn btn-sm btn-close1 btn-primary me-1" onClick={(e) => this.clickAction({ id: 'btn_close' })}><i className="fa fa-close"></i> Close</button>
                        </div>
                    </div>
                </div>
            </cntrl.WKLControl>
        )
    }
}
