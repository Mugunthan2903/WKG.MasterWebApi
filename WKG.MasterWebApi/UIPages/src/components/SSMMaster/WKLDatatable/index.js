import React, { Component } from 'react';
import * as cntrl from '../../../wkl-components';
import './index.css';

class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1,
            sortColumn: '',
            sortDirection: 'asc',
            selectedRow: 0,
            windowHeight: window.innerHeight,
            searchQuery: ''
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize = () => {
        this.setState({ windowHeight: window.innerHeight });
    };

    onPageChange = (page) => {
        this.setState({ currentPage: page });
    };

    handleSort = (column) => {
        const { sortColumn, sortDirection } = this.state;

        // Toggle sort direction if the same column is clicked again
        if (sortColumn === column) {
            this.setState({ sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' });
        } else {
            // Set new sort column and direction
            this.setState({ sortColumn: column, sortDirection: 'asc' });
        }
    };

    handleRowClick = (index) => {
        this.setState({ selectedRow: index });
    };

    handleSearch = (event) => {
        this.setState({ searchQuery: event.target.value });
    };

    sortedData = () => {
        const { data } = this.props;
        const { sortColumn, sortDirection } = this.state;

        // Return sorted data based on the current sort column and direction
        return [...data].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    paginatedData = () => {
        const { pageSize } = this.props;
        const { currentPage, searchQuery } = this.state;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const filteredData = this.sortedData().filter(item =>
            Object.values(item).some(val =>
                typeof val === 'string' && val.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
        return filteredData.slice(startIndex, endIndex);
    };

    renderCelldata(data, column) {
        if (column === 'button' || column === 'textbox' || column === 'switch') {
            return data();
        } else {
            return data;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.props.data !== nextProps.data ||
            this.props.pageSize !== nextProps.pageSize ||
            this.state.currentPage !== nextState.currentPage ||
            this.state.sortColumn !== nextState.sortColumn ||
            this.state.sortDirection !== nextState.sortDirection ||
            this.state.selectedRow !== nextState.selectedRow ||
            this.state.searchQuery !== nextState.searchQuery
        );
    }

    render() {
        const { currentPage, sortColumn, sortDirection, searchQuery } = this.state;
        const { selectedRow } = this.state;
        const { columns, pageSize } = this.props;
        const { windowHeight } = this.state;
        let { totalPage } = this.state;
        totalPage = Math.ceil(this.props.data.length / pageSize);
        const tableHeight = windowHeight - 200;
        const totalWidth = 100; // Total width of the table (percentage)
        const numColumns = columns.length;
        const defaultColumnWidth = totalWidth / numColumns;

        return (
            <div className="table-container">
                <div className="table-container">
                    <div class="row" style={{ float: "right" }}>
                        <div class="col">
                            <input
                                type="text"
                                placeholder="Search Result"
                                className="form-control"
                                value={searchQuery}
                                onChange={this.handleSearch}
                                style={{ textTransform: "capitalize" }}
                            />
                        </div>

                    </div>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                {columns.map(column => {
                                    const width = column.width || `${defaultColumnWidth}%`;
                                    return (
                                        <th key={column.key} style={{ width, position: 'relative' }} onClick={() => this.handleSort(column.key)}>
                                            {column.title}
                                            {sortColumn === column.key && (
                                                <i className={`fa fa-sort-${sortDirection === 'asc' ? 'asc' : 'desc'}`} style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)' }}></i>
                                            )}
                                            {
                                                column.switch && <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" style={{ width: "30px", height: "18px" }} role="switch" id="switchSizeLarge" name="IsSelected" checked={true} />
                                                </div>
                                            }
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {this.paginatedData().map((item, index) => (

                                <tr
                                    key={index}
                                    className={index === selectedRow ? 'active' : ''}
                                    onClick={() => this.handleRowClick(index)}
                                >
                                    <td style={{ display: 'none' }}>{item.dynamicId}</td>
                                    {columns.map(column => (
                                        <td key={column.key}>{this.renderCelldata(item[column.key], column.key)}</td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td className="p-1" colSpan={columns.length} style={{ backgroundColor: "#008bb210", textAlign: "center" }}>
                                    <nav aria-label="Page navigation">
                                        <ul className="pagination mb-0" style={{ float: "right" }}>
                                            {/*<li className="page-item">
                                                <button className="page-link" onClick={() => this.onPageChange(1)} disabled={currentPage === 1}>
                                                    <span aria-hidden="true" className="icon">&laquo;</span>
                                                </button>
                                    </li>*/}
                                            <li className="page-item">
                                                <button className="page-link" onClick={() => this.onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                                                    <span aria-hidden="true" className="icon">&laquo;</span>
                                                </button>
                                            </li>
                                            <li className="page-item d-flex align-items-center justify-content-center">
                                                <span className="page-link pt-2 pb-1">{currentPage} / {totalPage}</span>
                                            </li>
                                            <li className="page-item">
                                                <button className="page-link" onClick={() => this.onPageChange(currentPage + 1)} disabled={currentPage === Math.ceil(this.props.data.length / this.props.pageSize)}>
                                                    <span aria-hidden="true" className="icon">&raquo;</span>
                                                </button>
                                            </li>
                                            {/*<li className="page-item">
                                                <button className="page-link" onClick={() => this.onPageChange(totalPage)} disabled={currentPage === totalPage}>
                                                    <span aria-hidden="true" className="icon">&raquo;</span>
                                                </button>
                                            </li>*/}
                                        </ul>
                                    </nav>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default DataTable;