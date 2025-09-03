import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { ApiManager, Msgs } from "./Core";
import { Utils } from "./Utils";

export const WKLLabel = (props) => {
    const [state, setState] = useState({ data: false });
    const input = useRef({});

    useEffect(() => {
        input.current = ApiManager.subscribe((e) => {
            if (e.action === Msgs.LanguageChanged) {
                setState({ data: !state.data });
            }
        }, Msgs.LanguageChanged);

        return () => {
            if (input.current) {
                ApiManager.unsubscribe(input.current);
            }
        };
    }, [props.text]);

    return Utils.getLanguageText(props.text || '');
};