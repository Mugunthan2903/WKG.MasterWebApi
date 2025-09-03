import { click } from "@testing-library/user-event/dist/click";
import { Utils, ApiManager, WKLMessageboxTypes, VMBase, WKLWindowStyles } from "../../../wkl-components";
import { data } from "jquery";

export default class SSM009VM extends VMBase {
    constructor(props) {
        super(props);
        console.log(props)
        this.init();
        this._WebApi = 'SSM009';
    }
    init() {
        if (Object.keys(this.Data).length != 0)
            return;
        this._saving = false;
        const model = this.Data;
        model.FormID = "SSM009";
        model.ImageDiv = "";

        this.setTitle();
        this.updateUI();
    }
    loadInitData() {
        this.loadPage();
    }
    loadPage() {
        const me = this;
        const model = this.Data;
        const dataInfo = {};
        dataInfo.img_dir = this.props.data.Imag_Dir;
        dataInfo.prod_id = this.props.data.Prod_ID;
        dataInfo.supp_map_id = this.props.data.Supp_ID;
        dataInfo.lp_prod_typ = this.props.data.LP_Prod_Typ;
        model.Loading = true;
        this.updateUI();
        Utils.ajax({ url: `${this._WebApi}/SSM009OnloadImageAsync`, data: dataInfo }, (r) => {
            try {
                model.Loading = false;
                if (r) {
                    model.ImageDiv = r;
                    this.loadFTPImages(model.ImageDiv);
                }
            }
            catch (ex) {
                console.log(ex);
            }
            finally {
                me.updateUI();
            }
        });
    }
    async loadFTPImages(images) {
        const me = this;
        const model = this.Data;
        images.forEach((item) => {
            if (item.img_url) {
                Utils.ajax({ url: `${this._WebApi}/SSM009DownloadFileAsync`, data: { img_nam: item.img_nam, img_Ftp_url: item.img_url } }, (r) => {
                    item.img_Ftp_url = r || "";
                    const container = document.getElementById(item.img_dir + item.img_srl);
                    if (container && item.img_Ftp_url) {
                        container.innerHTML = "";
                        let contentHTML = item.is_video
                            ? `<video controls style="width: 100%; height: 150px; object-fit: cover;">
                               <source src="${item.img_Ftp_url}" type="video/mp4">
                               </video>`
                            : `<img src="${item.img_Ftp_url}" class="card-img-top" style="width: 100%; height: 150px; object-fit: cover;" />`;
                        container.innerHTML = contentHTML;
                    }
                    //me.updateUI();
                });
            }
        });
    }

    doClose(e) {
        const model = this.Data;
        this.close(e);
    }

    setTitle() {
        const model = this.Data;
        model.Title = `Select Image / ${this.props.data.Prod_Name}`;
    }
}
