import { Fragment } from "react";

import { Container, Row, Col } from "react-bootstrap";

import SubmitionInput from "../../submitioninput/submitioninput";

const DatatableRow = ({ row, rowIdx, columns, setSelectedRow, rows, setRows, inputFields,
    onClickRowField, onClickRow, selectRow, modifyRowsSort, colDisplay }) => {

    return (
        <Fragment>
            <tr
                className={(onClickRow ? 'hoverableRow' : '')}
                onClick={() => {
                    if (onClickRow) {
                        onClickRow(row);
                    }
                    if (selectRow) {
                        setSelectedRow(row.id);
                    }
                }}
            >
                {modifyRowsSort ? (
                    <td className="datatableValue">
                        <Container fluid>
                            <Row>
                                <Col>
                                    <i
                                        className="bi bi-caret-up-fill"
                                        onClick={() => {
                                            if (rowIdx === 0) {
                                                return;
                                            }
                                            const current = rows[rowIdx];
                                            const prev = rows[rowIdx - 1];
                                            const rowsCopy = [...rows];
                                            rowsCopy[rowIdx - 1] = current;
                                            rowsCopy[rowIdx] = prev;
                                            setRows(rowsCopy);
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <i
                                        className="bi bi-caret-down-fill"
                                        onClick={() => {
                                            if (rowIdx === rows.length - 1) {
                                                return;
                                            }
                                            const current = rows[rowIdx];
                                            const next = rows[rowIdx + 1];
                                            const rowsCopy = [...rows];
                                            rowsCopy[rowIdx] = next;
                                            rowsCopy[rowIdx + 1] = current;
                                            setRows(rowsCopy);
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <i
                                        className="bi bi-x"
                                        onClick={() =>{
                                            setRows(rows.filter((_row, idx) => idx !== rowIdx));
                                        }}
                                    />
                                </Col>
                            </Row>
                        </Container>
                    </td>
                ) : null}
                {columns.map(col => (
                    <Fragment key={`${row.id}-${col.field}`}>
                        {inputFields && col.field in inputFields ? (
                            <td
                                className={"breakWordCell" + (onClickRowField && col.field in onClickRowField ? ' hoverableRow' : '')}
                                style={{padding: '0px 0px 0px 0px'}}
                            >
                                <SubmitionInput
                                    defaultValue={row[col.field]}
                                    submitionConfig={inputFields[col.field](row)}
                                />
                            </td>
                        ) : (
                            <td
                                key={`${row.id}-${col.field}`}
                                className={"breakWordCell" + (onClickRowField && col.field in onClickRowField ? ' hoverableRow' : '')}
                                onClick={() => {
                                    if (onClickRowField && col.field in onClickRowField) {
                                        onClickRowField[col.field](row);
                                    }
                                }}
                            >
                                {// If this field has a custom display, show it. Otherwise, just display the value
                                col.field in colDisplay ? colDisplay[col.field](row) : row[col.field]}
                            </td>
                        )}
                    </Fragment>
                ))}
            </tr>
        </Fragment>
    );
};



export default DatatableRow;