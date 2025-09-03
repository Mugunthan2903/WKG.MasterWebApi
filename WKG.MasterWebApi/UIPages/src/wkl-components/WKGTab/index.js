import React from "react";
import PropTypes from "prop-types";

const WKGTab = ({ tabs }) => {
    if (!tabs || tabs.length === 0) return null;

    return (
        <>
            <ul className="nav nav-tabs" id="myTab" role="tablist">
                {tabs.map((tab, index) => (
                    <li className="nav-item" role="presentation" key={index}>
                        <button
                            className={`nav-link ${index === 0 ? "active" : ""}`}
                            id={`tab-${index}`}
                            data-bs-toggle="tab"
                            data-bs-target={`#tab-content-${index}`}
                            type="button"
                            role="tab"
                            aria-controls={`tab-content-${index}`}
                            aria-selected={index === 0 ? "true" : "false"}
                        >
                            {tab.title}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="tab-content" id="myTabContent">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        className={`tab-pane fade ${index === 0 ? "show active" : ""}`}
                        id={`tab-content-${index}`}
                        role="tabpanel"
                        aria-labelledby={`tab-${index}`}
                    >
                        {tab.content}
                    </div>
                ))}
            </div>
        </>
    );
};

WKGTab.propTypes = {
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            content: PropTypes.node.isRequired,
        })
    ).isRequired,
};

export { WKGTab };
