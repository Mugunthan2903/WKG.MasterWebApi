import React from 'react';
import { Utils } from '../Utils';
import $ from 'jquery';
import './index.css';
import { useEffect, useState } from 'react';
const frameStyle = { width: '1024px' };


const WKLIFrame = (props) => {
    const [state, setState] = useState({ id: Utils.getUniqueID() });
    let { mode, postDataList, url, onClose } = props;
    postDataList = postDataList || [];

    useEffect(() => {
        if (!Utils.isNullOrEmpty(url) && postDataList.length > 0) {
            let formElement = `<form method='post' target='${state.id}' action='${url}' style="top:-3333333333px;" ></form>`;
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
    }, []);

    const attr = {};
    attr.id = state.id;
    attr.name = state.id;
    attr.style = { width: '100%', height: '100%', border: 'none', backgroundColor: '#FFF' };
    if (!Utils.isNullOrEmpty(url) && postDataList.length <= 0)
        attr.src = url;
    else {
        let loaderHtml = `<style>
            .wkl-loader img {
  transform: perspective(500px) rotateY(-42deg);
  -webkit-transform: perspective(500px) rotateY(-42deg);
  -moz-transform: perspective(500px) rotateY(-42deg);
  -ms-transform: perspective(500px) rotateY(-42deg);
  -o-transform: perspective(500px) rotateY(-42deg);
  animation-name: rotate-windows;
  animation-iteration-count: infinite;
  animation-duration: 3s;
  animation-fill-mode: forwards;
}
@keyframes rotate-windows {
  0% {
    transform: perspective(500px) rotateY(-42deg);
    -webkit-transform: perspective(500px) rotateY(-42deg);
    -moz-transform: perspective(500px) rotateY(-42deg);
    -ms-transform: perspective(500px) rotateY(-42deg);
    -o-transform: perspective(500px) rotateY(-42deg);
  }

  50% {
    transform: perspective(500px) rotateY(0deg);
    -webkit-transform: perspective(500px) rotateY(0deg);
    -moz-transform: perspective(500px) rotateY(0deg);
    -ms-transform: perspective(500px) rotateY(0deg);
    -o-transform: perspective(500px) rotateY(0deg);
  }

  100% {
    transform: perspective(500px) rotateY(-42deg);
    -webkit-transform: perspective(500px) rotateY(-42deg);
    -moz-transform: perspective(500px) rotateY(-42deg);
    -ms-transform: perspective(500px) rotateY(-42deg);
    -o-transform: perspective(500px) rotateY(-42deg);
  }
}
</style>
        <div style="display: grid;align-items: center;justify-content: center;align-content: center;justify-items: center;height: -webkit-fill-available;">         
                              <div class="wkl-loader">
                                      <img async src="${window.location.origin}/assets/images/loader.png" ></img>
                              </div>
                               <span style=" padding-top: 10px;font-weight: 700;">Loading.......</span>
                  </div>`;

        var html = `<body>${loaderHtml}</body>`;
        attr.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
    }
    if (mode && mode === "tab") {
        return (<div className="wkl-frame-tab" >
            <div onClick={e => { e.preventDefault(); e.stopPropagation(); }} className="card-body h-100 w-100">
                <iframe {...attr} title="TAB-FRAME"></iframe>
            </div>
        </div >);
    }
    else {
        return (<div className="wkl-frame-layer">
            <div onClick={e => {
                if (onClose) {
                    onClose({ event: e });
                }
            }} className="wkl-frame-closer text-white bg-white pointer">
                <span className="fa fa-times text-danger"></span>
            </div>
            <div onClick={e => { e.preventDefault(); e.stopPropagation(); }} className="card-body h-100" style={frameStyle}  >
                <iframe {...attr} title="CONTAINER-FRAME"></iframe>
            </div >
        </div >);
    }
};
export { WKLIFrame };
