const WKLBody = (props) => {
    let cls = `d-flex flex-column flex-nowrap overflow-hidden overflow-y-auto ${props.className || ''}`;
    return (<div className={cls}>
        {props.children}
    </div>);
};

export { WKLBody };