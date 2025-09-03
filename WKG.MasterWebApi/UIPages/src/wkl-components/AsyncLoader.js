// import React, { Suspense } from 'react';
// /* object should same aotherwise it will reload container. Check tab, Mdi Container, Window */
// const AsyncLoader = React.memo(({url, id, data, context, childRef}) => {
//     console.log('AsyncLoader');
//     var DynamicComponent = React.lazy(() => import(`../components/${url}`));
//     return (<Suspense fallback={<div>Loading...</div>}>
//         <DynamicComponent key={id} id={id} data={data} context={context} ref={(e) => { if(childRef) childRef(e)}} />
//     </Suspense>);
// });

// export {AsyncLoader};

import React, { Suspense } from 'react';
import { WKLOverlay } from '.';
import { ErrorBoundary } from './ErrorBoundary';

export class AsyncLoader extends React.Component {
    constructor(props) {
        super(props);
        try {
            this.DynamicComponent = React.lazy(() => import(`../components/${props.url}`));
        }
        catch (ex) { }
    }
    shouldComponentUpdate(nextProps) {
        return false;
    }
    render() {
        let { url, childRef, ...attr } = this.props;
        return (<ErrorBoundary>
            <Suspense fallback={<WKLOverlay loading={true}></WKLOverlay>}>
                <this.DynamicComponent {...attr} ref={(e) => childRef(e)} />
            </Suspense>
        </ErrorBoundary>);
    }
}

/*
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { WKLOverlay } from '.';
import { ErrorBoundary } from './ErrorBoundary';
export const AsyncLoader = (props) => {
    const container = useRef(null);
    const [s, setState] = useState({ refresh: false });
    useEffect(() => {
        container.current = React.lazy(() => import(`../components/${props.url}`));
        setState(!s.refresh);
    }, ['']);

    let { url, childRef, ...attr } = props;
    return (<ErrorBoundary>
        <Suspense fallback={<WKLOverlay loading={true}></WKLOverlay>}>
            {container.current && <container.current  {...attr} ref={(e) => childRef(e)} />}
        </Suspense>
    </ErrorBoundary>);
};*/