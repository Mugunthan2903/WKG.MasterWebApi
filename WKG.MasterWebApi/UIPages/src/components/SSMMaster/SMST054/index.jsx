import React, { Component } from 'react';
import DataTable from '../WKLDatatable';
import SMST054VM from './SMST054VM';
import * as cntrl from "../../../wkl-components";

export default class SMST054 extends cntrl.WKLComponent {

    constructor(props) {
        super(props, new SMST054VM(props));
        this.inputRefs = {};
    }

    onLoad = () => {
        window.setTimeout(function () {
            if (this.VM)
                this.VM.loadInitData();
        }.bind(this), 100)
    }
    renderbtn(id, name) {
        return (<button onClick={this.onClickbtn} id={id}>{name}</button>)
    }
    columnbtn = (id, name) => {
        const pid = id;
        const pname = name;
        return (<div>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_search" title={"Edit"} data-bs-toggle="tooltip" data-bs-placement="left" hot-key="H" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ pname, pid, id: 'btn_Edit_grid' })}><i className="fas fa-edit" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
            <button type="button" style={{ width: "27px", height: "21px" }} name="btn_Exp" hot-key="H" title={"Exception"} data-bs-toggle="tooltip" data-bs-placement="left" className="btn btn-sm btn-icon1 btn-primary me-1" onClick={(e) => this.clickAction({ pname, pid, id: 'btn_Exp_grid' })}><i className="fas fa-bug" style={{ fontSize: "10px", verticalAlign: "super" }}></i> </button>
        </div>)
    };
    onClickbtn = (e) => {
        e.stopPropagation();
        alert("this is a btn");
    }
    renderTextbox() {
        return (<cntrl.WKLTextbox name="Text_Box" placeholder="Enter Text Box" maxLength={50}>
        </cntrl.WKLTextbox>);
    }
    renderTextbox() {
        return (<input type='hidden' name="Text_Box" placeholder="Enter Text Box" maxLength={50}>
        </input>);
    }
    renderDataTable() {
        const model = this.VM.Data;
        const attr =
        {
            data: model.DataTable,
            columns: model.Columns,
            pageSize: 10,
        };
        return (<DataTable{...attr} />);

    }
    render() {
        let showloading = "";
        if (this.VM) {
            const model = this.VM.Data;
            showloading = model.Loading;
        }

        return (
            <cntrl.WKLControl wrapperClass="modal-xl-12" loading={showloading} title={"Tui Product City Details"}
                showToaster={this.VM.Data.ShowToast} toasterConfig={this.VM.Data.ToastConfig} onClose={this.onClosing} context={this.props.context}>
                <div className="container">
                    {this.renderDataTable()}
                    {/* <DataTable data={model.DataTable} columns={model.Columns} pageSize={20} /> */}
                </div>
            </cntrl.WKLControl>
        );
    }
}
