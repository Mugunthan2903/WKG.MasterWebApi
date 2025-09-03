import React from 'react';
import PropTypes from 'prop-types';
import './index.css';

const cancellablePromise = promise => {
    let isCanceled = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
            value => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
            error => reject({ isCanceled, error }),
        );
    });

    return {
        promise: wrappedPromise,
        cancel: () => (isCanceled = true),
    };
};
const delay = n => new Promise(resolve => setTimeout(resolve, n));


export class WKLTreeview extends React.Component {
    static ID = 0;

    static propTypes = {
        name: PropTypes.string,
        isDraggable: PropTypes.bool,
        selectedItem: PropTypes.object,
        checkbox: PropTypes.bool,
        parent: PropTypes.object,
        items: PropTypes.array,
        onToggleStateChange: PropTypes.func,
        onCheckStateChange: PropTypes.func,
        onItemClick: PropTypes.func,
        onItemIconClick: PropTypes.func,
        onItemDoubleClick: PropTypes.func,
        onDragStart: PropTypes.func,
        onDragOver: PropTypes.func,
        onDrop: PropTypes.func,
        onNodeRender: PropTypes.func
    };
    static defaultProps = {
        name: '',
        isDraggable: false,
        selectedItem: null,
        checkbox: false,
        items: [],
        onToggleStateChange: undefined,
        onCheckStateChange: undefined,
        onItemClick: undefined,
        onItemIconClick: undefined,
        onItemDoubleClick: undefined,
        canDrag: undefined,
        onDragStart: undefined,
        onDragOver: undefined,
        onDrop: undefined,
        onNodeRender: undefined
    };

    constructor(props) {
        super(props);
        this.clickCount = 0;
    }

    static handleToggleStateChange(e) {
        e.item.isExpanded = !e.item.isExpanded;
    }
    static handleCheckStateChange(e) {
        const handler = (item) => {
            var itm = null;
            const itemList = item.items || [];
            for (var i = 0; i < itemList.length; i++) {
                itm = itemList[i]
                itm.isSelected = item.isSelected;
                handler(itm);
            }
        };
        e.item.isSelected = !e.item.isSelected;
        handler(e.item);
        if (e.parent !== undefined && e.parent != null && e.parent.items)
            e.parent.isSelected = e.parent.items.length === e.parent.items.count(i => i.isSelected);
    }

    toggleStateChange = (e) => {
        if (e)
            e.name = this.props.name;
        if (this.props.onToggleStateChange)
            this.props.onToggleStateChange(e);
    };
    checkStateChange = (e) => {
        if (e)
            e.name = this.props.name;
        if (this.props.onCheckStateChange)
            this.props.onCheckStateChange(e);
    };

    renderNodes(level) {
        return this.props.items.map((itm, i) => <WKLTreenode name={this.props.name} isDraggable={this.props.isDraggable} key={(WKLTreeview.ID++)} selectedItem={this.props.selectedItem} parent={this.props.parent} onItemIconClick={this.props.onItemIconClick} onItemClick={this.props.onItemClick} onItemDoubleClick={this.props.onItemDoubleClick} onCheckStateChange={this.checkStateChange} onToggleStateChange={this.toggleStateChange} item={itm} checkbox={this.props.checkbox} level={level}
            onDragStart={this.props.onDragStart}
            onDragOver={this.props.onDragOver}
            onDrop={this.props.onDrop}
            onNodeRender={this.props.onNodeRender}
        />);
    }
    render() {
        const level = (this.props.level || 0) + 1;
        if (level === 1) {
            return (<ul className="wittree">
                {this.renderNodes(level)}
            </ul>);
        }
        else {
            const styles = { display: 'block' };
            return (<ul style={styles}>
                {this.renderNodes(level)}
            </ul>);
        }
    }
}
export class WKLTreenode extends React.Component {
    static ID = 0;
    static propTypes = {
        name: PropTypes.string,
        isDraggable: PropTypes.bool,
        selectedItem: PropTypes.object,
        checkbox: PropTypes.bool,
        parent: PropTypes.object,
        item: PropTypes.shape({
            isSelected: PropTypes.bool,
            isExpanded: PropTypes.bool,
            text: PropTypes.string,
            toolTip: PropTypes.string,
            items: PropTypes.array
        }),
        onToggleStateChange: PropTypes.func,
        onCheckStateChange: PropTypes.func,
        onItemClick: PropTypes.func,
        onItemIconClick: PropTypes.func,
        onItemDoubleClick: PropTypes.func,

        onDragStart: PropTypes.func,
        onDragOver: PropTypes.func,
        onDrop: PropTypes.func,
        onNodeRender: PropTypes.func
    };
    static defaultProps = {
        name: '',
        isDraggable: false,
        checkbox: false,
        item: { isSelected: false, isExpanded: false, text: '', items: [] },
        onToggleStateChange: undefined,
        onCheckStateChange: undefined,
        onItemClick: undefined,
        onItemIconClick: undefined,
        onItemDoubleClick: undefined,
        onDragStart: undefined,
        onDragOver: undefined,
        onDrop: undefined,
        onNodeRender: undefined
    };

    componentWillUnmount() {
        // cancel all pending promises to avoid
        // side effects when the component is unmounted
        this.clearPendingPromises();
    }
    pendingPromises = [];

    appendPendingPromise = promise =>
        (this.pendingPromises = [...this.pendingPromises, promise]);

    removePendingPromise = promise =>
        (this.pendingPromises = this.pendingPromises.filter(p => p !== promise));

    clearPendingPromises = () => this.pendingPromises.map(p => p.cancel());

    handleClick = (evt) => {
        let eventType = evt.type;
        // create the cancelable promise and add it to
        // the pending promises queue
        const waitForClick = cancellablePromise(delay(250));
        this.appendPendingPromise(waitForClick);

        return waitForClick.promise
            .then(() => {
                // if the promise wasn't cancelled, we execute
                // the callback and remove it from the queue
                this.removePendingPromise(waitForClick);
                this.props.onItemClick({ name: this.props.name, item: this.props.item, parent: this.props.parent, type: eventType });
            })
            .catch(errorInfo => {
                // rethrow the error if the promise wasn't
                // rejected because of a cancelation
                this.removePendingPromise(waitForClick);
                if (!errorInfo.isCanceled) {
                    throw errorInfo.error;
                }
            });
    };


    componentCheckStateChange = (e) => {
        if (this.props.onCheckStateChange) {
            if (e.parent === undefined)
                e.parent = this.props.item;
            this.props.onCheckStateChange(e);
        }
    };
    componentDoubleClick = (evt) => {
        if (evt.target && evt.target.type === 'checkbox')
            return;
        /* if (this.props.onItemDoubleClick) {
             this.stopClick = true;
             this.props.onItemDoubleClick({ item: this.props.item, parent: this.props.parent, type: evt.type });
         }*/

        if (typeof this.props.onItemDoubleClick === 'function') {
            this.clearPendingPromises();
            this.props.onItemDoubleClick({ name: this.props.name, item: this.props.item, parent: this.props.parent, type: evt.type });
        }
    }
    componentClick = (evt) => {
        if (evt.target && evt.target.type === 'checkbox')
            return;

        if (typeof this.props.onItemClick === 'function') {
            if (typeof this.props.onItemDoubleClick === 'function')
                this.handleClick(evt);
            else {
                let eventType = evt.type;
                this.props.onItemClick({ name: this.props.name, item: this.props.item, parent: this.props.parent, type: eventType });
            }
        }
    };
    toggleStateChange = (evt) => {
        if (this.props.onToggleStateChange)
            this.props.onToggleStateChange({ name: this.props.name, item: this.props.item });
        evt.preventDefault();
        evt.stopPropagation();
    };
    checkStateChange = (evt) => {
        if (this.props.onCheckStateChange)
            this.props.onCheckStateChange({ name: this.props.name, item: this.props.item });
    };
    onItemIconClick = (evt) => {
        if (this.props.onItemIconClick)
            this.props.onItemIconClick({ name: this.props.name, item: this.props.item });
        evt.preventDefault();
        evt.stopPropagation();
    };
    onIconClick = (evt, itm, idx) => {
        if (itm.onClick)
            itm.onClick({ name: this.props.name, item: this.props.item, index: idx });
        evt.preventDefault();
        evt.stopPropagation();
    };

    invokeCallback = (callback, e) => {
        if (typeof callback === 'function')
            return callback(e);
        return null;
    };

    handleDragStart = (e) => {
        console.clear();
        const result = this.invokeCallback(this.props.onDragStart, { name: this.props.name, item: this.props.item, parent: this.props.parent, level: this.props.level });
        if (result !== undefined && result === false) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
    }
    handleDragOver = (e, index) => {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }
        console.log('handleDragOver');

        const result = this.invokeCallback(this.props.onDragOver, { name: this.props.name, item: this.props.item, parent: this.props.parent, level: this.props.level });
        if (result !== undefined && result === false) {
            e.dataTransfer.dropEffect = 'none';
            e.target.classList.remove('drag-over');
        }
        else
            e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
        return false;
    }
    handleDragEnter = (e) => {
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }
        console.log('handleDragEnter');
        e.target.classList.add('drag-over');
    }

    handleDragLeave = (e) => {
        console.log('handleDragLeave');
        e.target.classList.remove('drag-over');  // this / e.target is previous target element.
    }
    handleDrop = (e, index) => {
        // this / e.target is current target element.
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }
        e.target.classList.remove('drag-over');
        this.invokeCallback(this.props.onDrop, { name: this.props.name, item: this.props.item, parent: this.props.parent, level: this.props.level });
        return false;
    }
    handleDragEnd(e) {
        // this/e.target is the source node.

        // [].forEach.call(cols, function (col) {
        //   col.classList.remove('drag-over');
        // });
    }

    renderLevel() {
        const level = (this.props.level || 1) - 1;
        const indents = [];
        for (let i = 0; i < level; i++) {
            indents.push(<span key={(WKLTreenode.ID++)} className="wittree-indent"></span>);
        }
        if (level > 0) {
            const subItems = this.props.item.items || [];
            if (subItems.length === 0)
                indents.push(<span key={(WKLTreenode.ID++)} className="wittree-indent"></span>);
        }
        return indents;
    }
    renderIcon() {
        if (this.props.item.iconClass) {
            if (Array.isArray(this.props.item.iconClass)) {
                return this.props.item.iconClass.map((i, idx) => {
                    return (<i key={idx} onClick={(e) => this.onIconClick(e, i, idx)} className={i.class} />);
                });
            }
            else {
                return (
                    <>
                        <i onClick={this.onItemIconClick} className={this.props.item.iconClass} />
                    </>);
            }
        }
        return null;
    }
    renderCheckbox() {
        return <input className="form-check-input me-1" type="checkbox" checked={this.props.item.isSelected} onChange={this.checkStateChange} />;
    }
    renderSubitemIcon() {
        if (this.props.item.isExpanded)
            return <span className="wittree-hit wittree-expanded" onClick={this.toggleStateChange}></span>;
        else
            return <span className="wittree-hit wittree-collapsed" onClick={this.toggleStateChange}></span>;
    }
    renderSubitems() {

        const level = (this.props.level || 1);
        const attrs = {
            name: this.props.name,
            isDraggable: this.props.isDraggable,
            selectedItem: this.props.selectedItem,
            level: level,
            checkbox: this.props.checkbox,
            parent: this.props.item,
            items: this.props.item.items,
            onItemDoubleClick: this.props.onItemDoubleClick,
            onItemClick: this.props.onItemClick,
            onToggleStateChange: this.props.onToggleStateChange,
            onCheckStateChange: this.componentCheckStateChange,
            onNodeRender: this.props.onNodeRender,
            onDragStart: this.props.onDragStart,
            onDragOver: this.props.onDragOver,
            onDrop: this.props.onDrop
        };
        return <WKLTreeview {...attrs}></WKLTreeview>;
    }
    getText() {
        let text = null;
        if (typeof this.props.onNodeRender === 'function')
            text = this.props.onNodeRender({ name: this.props.name, item: this.props.item, parent: this.props.parent, level: this.props.level });
        else
            text = this.props.item.text || '';

        return text;
    }
    render() {
        const classNameList = ['wittree-title'];
        if (this.props.item.className)
            classNameList.push(this.props.item.className);

        if (this.props.selectedItem && this.props.selectedItem === this.props.item)
            classNameList.push('wittree-node-selected');

        let styles = null;
        if (this.props.item.styles)
            styles = this.props.item.styles;

        const subItems = this.props.item.items || [];
        const toolTip = this.props.item.toolTip || '';

        const attr = {};
        if (this.props.isDraggable === true) {
            attr.draggable = true;
            attr.onDragStart = (e) => this.handleDragStart(e);
            attr.onDragEnter = (e) => this.handleDragEnter(e);
            attr.onDragOver = (e) => this.handleDragOver(e);
            attr.onDragLeave = (e) => this.handleDragLeave(e);
            attr.onDrop = (e) => this.handleDrop(e);
            attr.onDragEnd = () => this.handleDragEnd();
        }
        return (<li>
            <div className="wittree-node" onClick={this.componentClick} onDoubleClick={this.componentDoubleClick} >
                <div {...attr} >
                    {this.renderLevel()}
                    {subItems.length > 0 && this.renderSubitemIcon()}
                    <label style={styles} className={classNameList.join(' ')} title={toolTip}>
                        {this.props.checkbox && this.renderCheckbox()}
                        {this.renderIcon()}
                        {this.getText()}
                    </label>
                </div>
            </div>
            {(subItems.length > 0 && this.props.item.isExpanded) && this.renderSubitems()}
        </li>);
    }
}

