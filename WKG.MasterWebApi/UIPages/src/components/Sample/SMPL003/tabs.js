import React, { useState } from 'react';

function DynamicTabs() {
    const [tabs, setTabs] = useState([
        { id: 'home', label: 'Product Config', content: 'Content for Product Config' },
        { id: 'profile', label: 'Pos', content: 'Content for Pos' },
        { id: 'contact', label: 'Config', content: 'Content for Config' }
    ]);
    const [activeTab, setActiveTab] = useState('home');

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    return (
        <div className="container mt-5">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
                {tabs.map(tab => (
                    <li className="nav-item" role="presentation" key={tab.id}>
                        <button
                            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab.id)}
                            id={`${tab.id}-tab`}
                            data-bs-toggle="tab"
                            data-bs-target={`#${tab.id}`}
                            type="button"
                            role="tab"
                            aria-controls={tab.id}
                            aria-selected={activeTab === tab.id}
                        >
                            {tab.label}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="tab-content" id="myTabContent">
                {tabs.map(tab => (
                    <div
                        className={`tab-pane fade ${activeTab === tab.id ? 'show active' : ''}`}
                        id={tab.id}
                        role="tabpanel"
                        aria-labelledby={`${tab.id}-tab`}
                        key={tab.id}
                    >
                        <h3>{tab.label}</h3>
                        <p>{tab.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DynamicTabs;