// function isWritable(obj, key) {
//     const desc =
//         Object.getOwnPropertyDescriptor(obj, key)
//         || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), key)
//         || {}
//     return Boolean(desc.writable)
// }

import { Utils } from "./Utils";

class WKLStateStore {
    constructor() {
        this._store = null;
        this._stateID = 0;
    }
    _getState(states, id) {
        let state = null;
        for (let i = 0; i < states.length; i++) {
            state = states[i];
            if (state.id === id)
                return state;
            else if (state.children.length !== 0) {
                let child = this._getState(state.children, id);
                if (child != null)
                    return child;
            }
        }
        return null;
    }
    _getStateEntry(parentID, id) {
        if (this._store == null) {
            this._store = { children: [], id: id, state: {} };
            return this._store;
        }
        let parentState = null;
        if (this._store.id === parentID)
            parentState = this._store;
        if (parentState === null)
            parentState = this._getState(this._store.children, parentID);
        if (parentState != null) {
            return parentState.children.first(s => s.id === id);
        }
        return null;
    }
    updateState(parentID, id, state) {
        const witStateEntry = this._getStateEntry(parentID, id);
        if (witStateEntry !== null)
            witStateEntry.state = state;
    }
    getStateByID(parentID, id) {
        console.log(`getStateByID : ${parentID} - ${id}`);
        if (this._store == null) {
            this._store = { children: [], id: parentID, state: {}, internalState: {} };
        }
        let parentState = null;
        if (this._store.id === parentID)
            parentState = this._store;
        if (parentState == null)
            parentState = this._getState(this._store.children, parentID);
        if (parentState != null) {
            let witState = parentState.children.first(s => s.id === id);
            if (witState == null) {
                witState = { children: [], id: id, state: {}, internalState: {} };
                parentState.children.push(witState);
            }
            return witState;
        }
        return null;
    }
    removeStateByID(stateID) {
        let parentState = this._getParentState(this._store, stateID);
        if (parentState != null) {
            let child = parentState.children.first(s => s.id === stateID);
            if (child != null) {
                parentState.children.remove(child);
                this._removeChildState(child);
                Utils.cleanObject(child);
            }
        }
    }
    _removeChildState(parent) {
        const states = parent.children;
        const count = states.length;
        let state = null;
        for (let i = 0; i < count; i++) {
            state = states.pop();
            if (state.children.length !== 0) {
                this._removeChildState(state);
            }
            Utils.cleanObject(state);
        }
        parent.children = undefined;
    }
    _getParentState(parent, id) {
        const states = parent.children;
        let state = null;
        for (let i = 0; i < states.length; i++) {
            state = states[i];
            if (state.id === id)
                return parent;
            else if (state.children.length !== 0) {
                let childParent = this._getParentState(state, id);
                if (childParent != null)
                    return childParent;
            }
        }
        return null;
    }
}

const WKLStateManager = new WKLStateStore();
export { WKLStateManager };