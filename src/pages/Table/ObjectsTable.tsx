import React from 'react';
import {observer} from 'mobx-react';
import {compose} from 'recompose';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import {createStyles, Theme, WithStyles, withStyles} from "@material-ui/core"

import {objectTypeToColor, renderObjectValue} from '../../util/utils';
import {ActObject} from "../types";
import Button from "@material-ui/core/Button";

export type ColumnKind = 'objectType' | 'objectValue' | 'properties'

export type ObjectRow = {
    key: string,
    title: string
    isSelected: boolean,
    actObject: ActObject,
    properties: Array<{ k: string, v: string }>
}

export type SortOrder = {
    order: 'asc' | 'desc'
    orderBy: ColumnKind
}

const styles = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
        flexDirection: "column",
        height: "100%"
    },
    cell: {
        paddingLeft: theme.spacing.unit * 2
    },
    row: {
        cursor: 'pointer',
        height: theme.spacing.unit * 4
    },
    footer: {
        padding: "0 10px 4px 0",
        display: "flex",
        flexDirection: "row-reverse"
    },
    factType: {
        color: '#F84'
    }

});

const ObjectRowComp = ({key, actObject, title, properties, isSelected, onRowClick, classes}: IObjectRowComp) => (
    <TableRow
        key={key}
        hover
        selected={isSelected}
        classes={{root: classes.row}}
        onClick={() => onRowClick(actObject)}>
        <TableCell classes={{root: classes.cell}} padding='dense'>
            <span style={{color: objectTypeToColor(actObject.type.name)}}>{title}</span>
        </TableCell>
        <TableCell classes={{root: classes.cell}} padding='dense'>
            {renderObjectValue(actObject, 256)}
        </TableCell>
        <TableCell classes={{root: classes.cell}} padding='dense'>
            {
                properties.map(({k, v}: { k: string, v: string }, idx : number) => (
                    <div key={idx}><span className={classes.factType}>{`${k}: `}</span><span>{v}</span></div>)
                )
            }
        </TableCell>
    </TableRow>
);

interface IObjectRowComp extends ObjectRow, WithStyles<typeof styles> {
    onRowClick: (o: ActObject) => void,
}

export const ActObjectRow = compose<IObjectRowComp, Pick<IObjectRowComp, Exclude<keyof IObjectRowComp, 'classes'>>>(
    withStyles(styles),
    observer
)(ObjectRowComp);

const ObjectsTableComp = ({rows, columns, classes, sortOrder, onSortChange, onRowClick, onExportClick}: IObjectsTableComp) => (
    <div className={classes.root}>

        <div className={classes.footer}>
            <Button variant='outlined' size='small' onClick={onExportClick}>Export to CSV</Button>
        </div>

        <div style={{overflowY: "scroll"}}>
            <Table>
                <TableHead>
                    <TableRow classes={{root: classes.row}}>
                        {
                            columns.map(({label, kind}) => (
                                <TableCell key={kind} classes={{root: classes.cell}} padding='dense'>
                                    <TableSortLabel
                                        onClick={() => onSortChange(kind)}
                                        direction={sortOrder.order}
                                        active={sortOrder.orderBy === kind}>
                                        {label}
                                    </TableSortLabel>
                                </TableCell>))
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        rows.map(row => <ActObjectRow {...row} onRowClick={(object) => onRowClick(object)}/>)
                    }
                </TableBody>
            </Table>
        </div>
    </div>
);

interface IObjectsTableComp extends WithStyles<typeof styles> {
    rows: Array<ObjectRow>,
    columns: Array<{ label: string, kind: ColumnKind }>,
    sortOrder: SortOrder,
    onSortChange: (ck: ColumnKind) => void,
    onRowClick: (obj: ActObject) => void,
    onExportClick: () => void
}

export default compose<IObjectsTableComp, Pick<IObjectsTableComp, Exclude<keyof IObjectsTableComp, 'classes'>>>(
    withStyles(styles),
    observer
)(ObjectsTableComp);
