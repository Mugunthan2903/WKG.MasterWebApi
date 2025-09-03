import { WKLStateManager } from './WKLStateManager';
import { Utils } from '.';

export class VMBase {
    constructor(props) {
        this.Data = {};
        this.props = props;
        if (props && props.context !== undefined) {
            const hosstate = WKLStateManager.getStateByID(props.context.parentID, props.context.id);
            this.Data = hosstate.state;
            this._____data = hosstate.internalState;
        }
    }
    register(componentRef) {
        this.ComponentRef = componentRef;

    }
    updateUI() {
        if (this.ComponentRef != null)
            this.ComponentRef.updateUI();
    }
    destroy() {
        if (this.props && this.props.context)
            WKLStateManager.removeStateByID(this.props.context.id);
        this.props = null;
        this.Data = null;
        this._____data = null;
        this.ComponentRef = null;
        const me = this;
        let timeoutID = null;
        timeoutID = window.setTimeout(() => {
            Utils.cleanObject(me, true);
            clearTimeout(this.timeoutID);
        }, 50);
    }
    /**
     * @description It shows alert box in the form. onClose event argument contains the selected option index. -1 index means nothing selected, else index should be greater than -1
     * @param {object} options - object {messageboxType: string; text: any; buttons: object array,onClose: (e) => {}  }
     */
    showMessageBox(options) {
        if (this.ComponentRef)
            this.ComponentRef.showMessageBox(options);
    }
    /**
   * @description 
   * @param {object} options - object {url: string; data: any; windowStyle: (WKLWindowStyles),onClose: (e) => {}  }
   */
    showWindow(options) {
        if (this.ComponentRef)
            this.ComponentRef.showWindow(options);
    }
    /**
  * @description 
  * @param {object} options - object {title:string, text:string , key: string, url: string, data: any, onClose: (e) => {}, destroyOnHide: boolean, isClosable: boolean, closeAndOpen: boolean  }
  */
    addTab(options, addToMainTab = false) {
        if (this.ComponentRef)
            this.ComponentRef.addTab(options, addToMainTab);
    }
    /**
* @description result passing to the calling form for the further process.
* @param {object} result - object 
*/
    close(result) {
        if (this.ComponentRef)
            this.ComponentRef.close(result);
    }
    /**
* @description 
* @param {object} result - object 
*/
    closeTab(result) {
        if (this.ComponentRef)
            this.ComponentRef.closeTab(result);
    }
    /**
* @description 
* @param {object} result - object{text: string, title: string}
*/
    updateTabInfo(result) {
        if (this.ComponentRef)
            this.ComponentRef.updateTabInfo(result);
    }
}