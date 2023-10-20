import { useState, useEffect, useMemo, useRef } from "react";
import useOutsideClickEvent from '../../customhooks/useOutsideClickEvent';

import { Table } from "react-bootstrap";
import { Container, Row, Col } from "react-bootstrap";
import { Form } from "react-bootstrap";

import IndexList from "../indexlist/indexlist";
import DatatableRow from "./datatablerow/datatablerow";

import { generalCaseInsensitiveSort } from "../../utils/arrayUtils";
import { linkToA } from "../../utils/displayutils";
import { uniques, sum } from "../../utils/arrayUtils";

import pageText from './datatable-text.json'
import './datatable.css';
import SearchBar from "../searchbar/SearchBar";



// Text value from a link
const textFromLink = strWithLink => strWithLink !== null ? strWithLink.split('#')[0] : null;

const CHUNK_SIZE = 50;



const DataTable = ({ name, columns, rows, customColDisplay, colWidthWeights = null, defaultSortedCol = null, customColSort, onClickRow = null,
    linkCols: linkColsProp, inputFields = [], disableSort = false, modifyRowsSort = false, setRows,
    onClickRowField, scroll = true, customWidth }) => {

    // linkCols could be an array
    const linkCols = useMemo(() => Array.isArray(linkColsProp) ? Object.fromEntries(linkColsProp.map(linkCol => [linkCol, null])) : linkColsProp, [linkColsProp]);
    
    // The rows that will be displayed on the page (sorted)
    const [displayedRows, setDisplayedRows] = useState([]);

    // All of the rows, sorted
    const [sortedRows, setSortedRows] = useState([]);

    // The chuck of rows shown on page
    const [chunks, setChunks] = useState(1);
    const [selectedChunk, setSelectedChunk] = useState(1);

    // Sorting the displayed rows by a sort by property
    const [sortBy, setSortBy] = useState(defaultSortedCol !== null ? defaultSortedCol : columns[0].field);

    // The column its filter is shown at the moment
    const [shownColumnFilterBar, setShownColumnFilterBar] = useState(null);

    // If select row is true - the row that has been selected
    const [selectedRow, setSelectedRow] = useState(null);



    // The filter arrays for each column
    const [columnFilters, setColumnFilters] = useState(Object.fromEntries(columns.map(col => [col.field, []])));

    // The options for the filters of the column - all the values without duplicates
    const filterOptions = Object.fromEntries(columns.map(col => [col.field,
        uniques(rows
            // Temporary solution to uneeded filter options
            .filter(row => row.year ? row.year === 'תשפד' : true)
            .map(row => linkCols && col.field in linkCols && row[col.field] ? row[col.field].split('#')[0] : row[col.field]))]));

    const changeColFilters = colName => val => {
        if (columnFilters[colName].some(fltr => fltr === val)) {
            setColumnFilters({...columnFilters, [colName]: columnFilters[colName].filter(fltr => fltr !== val)});
        }
        else {
            setColumnFilters({...columnFilters, [colName]: columnFilters[colName].concat(val)});
        }
    };

    // A specific filter searched in the filter box
    const [searchedFilter, setSearchedFilter] = useState(null);



    // Custom displays for specific columns
    const colDisplay = useMemo(() => {
        let colDisplay;
        if (customColDisplay !== null && customColDisplay !== undefined) {
            colDisplay = {...customColDisplay};
        }
        else {
            colDisplay = {};
        }

        // All link columns will display the text part which link to the url part
        if (linkCols) {
            for (const linkCol of Object.keys(linkCols)) {
                colDisplay[linkCol] = row => linkToA(row[linkCol]);
            }
        }

        return colDisplay;
    }, [customColDisplay, linkCols]);

    // Custom sorting function for specific columns
    const colSort = useMemo(() => {
        let colSort;
        if (customColSort !== null && customColSort !== undefined) {
            colSort = {...customColSort};
        }
        else {
            colSort = {};
        }

        if (linkCols) {
            // All link columns will be sorted by the text part alone
            for (const linkCol of Object.keys(linkCols)) {
                colSort[linkCol] = generalCaseInsensitiveSort(row => textFromLink(row[linkCol]));
            }
        }

        return colSort;
    }, [customColSort, linkCols]);



    // Sorting the rows, and saving the results in sortedRows
    useEffect(() => {
        let sr;
        if (disableSort) {
            sr = rows;
        }
        else {
            const sortFunction = sortBy in colSort ? colSort[sortBy] : generalCaseInsensitiveSort(row => row[sortBy]);
            sr = [...rows];
            sr.sort(sortFunction);
        }
        setSortedRows(sr);
    }, [rows, disableSort, sortBy, colSort]);

    // Filtering the rows, and updating overall values
    useEffect(() => {
        const filteredSortedRows = sortedRows.filter(row => Object.entries(columnFilters)
            .every(([col, filterArray]) => filterArray.length > 0 ?
            (row[col] ? (linkCols && col in linkCols ? filterArray.some(filter => filter === row[col].split('#')[0]) : filterArray.some(filter => filter === row[col])) : false)
            : true));
        setDisplayedRows(filteredSortedRows);
    }, [rows, sortedRows, columnFilters, linkCols]);

    // Getting the relevant chuck out of the displayed rows
    useEffect(() => {
        let chunks = Math.ceil(displayedRows.length / CHUNK_SIZE);
        setChunks(chunks);

        setSelectedChunk(1);
    }, [displayedRows]);

    const chunkChangeHandler = idx => () => {setSelectedChunk(idx);};



    // The widths of each column in the table - Equal to the column weight over the sum of the weights.
    let colWidths = null;
    if (colWidthWeights !== null) {
        const widthsSum = sum(Object.values(colWidthWeights));
        colWidths = Object.fromEntries(Object.entries(colWidthWeights)
            .map(([colField, weight]) => [colField, (100.0 * weight) / widthsSum]));
    }



    // Clicking outside a filter bar closes it
    const filterBoxRef = useRef(null);
    const filterColumnHeaderRef = useRef(null);
    useOutsideClickEvent([filterBoxRef, filterColumnHeaderRef], () => {
        setShownColumnFilterBar(null);
    });



    // The way filters will be shown in the filter box
    const filterDisplay = (val, col) => {
        if (val) {
            if (linkCols && col.field in linkCols) {
                return val.split('#')[0];
            } else if (col.field in colDisplay) {
                return colDisplay[col.field]({[col.field]: val} /* fix this */);
            } else {
                return val;
            }
        } else {
            return pageText.emptyFilter;
        }
    };



    const wrapperOverflowProp = {};
    const tableOverflowProps = {};
    if (scroll) {
        wrapperOverflowProp.style = {
            overflowX: 'auto',
            overflowY: 'auto',
            width: '100%',
            maxHeight: '90vh'
        };
    }
    if (customWidth) {
        tableOverflowProps.style = {width: customWidth};
    }



    // Horizontal scroll of the table wrapper should be on top
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (wrapperRef.current) {
            // Code that moves the scroll bar to the top
        }
    }, [wrapperRef]);



    return (
        <>
        {chunks !== 1 ? (
            <IndexList
                start={1}
                end={chunks + 1}
                selected={selectedChunk}
                selectedChangeHandler={chunkChangeHandler}
            />
        ) : null}

        <div
            id="datatableWrapper"
            {...wrapperOverflowProp}
            ref={wrapperRef}
        >

        <Table
            bordered
            className="datatableTable"
            {...tableOverflowProps}
        >
            <thead>
                <tr>
                    {
                        modifyRowsSort ? (
                            <th
                                style={colWidths !== null ? {width: `${1 / (sum(Object.values(colWidthWeights)) + 1)}}%`} : {width : `${1 / columns.length + 1}%`}}
                                className="datatableHeaderItem"
                            />
                        )
                        : null
                    }
                    {columns.map(col => (
                        <th
                            key={col.field}
                            onClick={() => {if (!disableSort) {setSortBy(col.field);}}}
                            style={colWidths !== null ? {width: `${colWidths[col.field]}%`} : {width : `${100.0 / columns.length}%`}}
                            className="datatableHeaderItem"
                        >
                            <Container fluid>
                                <Row>
                                    <Col>
                                        <i hidden={disableSort || col.field !== sortBy} className="bi bi-caret-up-fill sortCaret"/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        {col.header}
                                    </Col>
                                    <Col
                                        className="filterCaret"
                                        ref={filterColumnHeaderRef}
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSearchedFilter(null);
                                            setShownColumnFilterBar(col.field !== shownColumnFilterBar ? col.field : null);
                                        }}
                                    >
                                        <i
                                            className="bi bi-caret-down-fill"
                                        />
                                    </Col>
                                </Row>
                                {shownColumnFilterBar === col.field ? (
                                    <div
                                        className="datatableFilterBox scrollBox"
                                        ref={filterBoxRef}
                                        onClick={e => {e.preventDefault(); e.stopPropagation();}}
                                    >
                                        <SearchBar
                                            barName="searchFilter"
                                            setter={setSearchedFilter}
                                            options={filterOptions[col.field].filter(fltr => fltr)}
                                            noneSelectedValue={null}
                                        />
                                        <Form className="filterBoxForm">
                                            <Form.Group controlId="filterChecks">
                                                <Form.Check
                                                    inline
                                                    type="radio"
                                                    label={pageText.everything}
                                                    name="colFilterChecks"
                                                    id="everythingColFilterCheck"
                                                    onClick={() => {setColumnFilters({...columnFilters, [col.field]: []});}}
                                                    checked={columnFilters[col.field].length === 0}
                                                    readOnly
                                                />
                                                {(searchedFilter ? filterOptions[col.field].filter(fltr => fltr === searchedFilter) : filterOptions[col.field])
                                                .sort(generalCaseInsensitiveSort(val => filterDisplay(val, col)))
                                                .map((val, idx) => (
                                                    <Form.Check
                                                        key={idx}
                                                        inline
                                                        type="checkbox"
                                                        label={filterDisplay(val, col)}
                                                        name="colFilterChecks"
                                                        id={`${col.field in colDisplay ? colDisplay[col.field]({[col.field]: val}) : val}colFilterCheck`}
                                                        onClick={() => {changeColFilters(col.field)(val);}}
                                                        checked={columnFilters[col.field].some(fltr => fltr === val)}
                                                        readOnly
                                                    />
                                                ))}
                                            </Form.Group>
                                        </Form>
                                    </div>
                                ) : null}
                            </Container>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {// If the rows aren't empty, display every row. Otherwise, display an empty row (with custom css)
                displayedRows.length > 0 ?
                displayedRows
                .slice((selectedChunk - 1) * CHUNK_SIZE, selectedChunk * CHUNK_SIZE)
                .map((row, rowIdx) => (
                    <DatatableRow
                        key={row.id}
                        row={row}
                        rowIdx={rowIdx}
                        columns={columns}
                        selectedRow={selectedRow}
                        setSelectedRow={setSelectedRow}
                        rows={rows}
                        setRows={setRows}
                        linkCols={linkCols}
                        inputFields={inputFields}
                        onClickRowField={onClickRowField}
                        onClickRow={onClickRow}
                        modifyRowsSort={modifyRowsSort}
                        colDisplay={colDisplay}
                    />
                ))
                :
                (<tr className="emptyRow">
                    {columns.map(col => (
                                <td key={`mstbl-${name}-emptyrow-field=${col.field}`} />
                            ))}
                </tr>)}
            </tbody>
        </Table>
        </div>
        </>
    );
};

export default DataTable;