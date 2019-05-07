import {compose} from 'recompose';

import React from "react";
import Paper from "@material-ui/core/Paper";
import QueryHistoryStore from "./QueryHistoryStore";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Switch from "@material-ui/core/Switch";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from '@material-ui/icons/Close';
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import {withStyles} from "@material-ui/core";
import {observer} from "mobx-react";
import {Query} from "../QueryHistory";


const styles = (theme: any) => ({
    listItem: {
        paddingLeft: theme.spacing.unit * 2
    },
    item: {},
    activeItem: {
        borderLeft: `2px solid ${theme.palette.primary.main}`
    },
    removeButton: {
        opacity: 0,
        '$item:hover &': {
            opacity: 1
        },
        transition: theme.transitions.create('opacity', {
            duration: theme.transitions.duration.shortest
        })
    },
    buttons: {
        padding: theme.spacing.unit * 2,
        paddingTop: theme.spacing.unit,
        paddingBottom: theme.spacing.unit
    },
    listItemText: {
        overflowX: 'hidden'
    }
});

const DataListItemText = ({query}: { query: Query }) => {
    return <span>{`${query.search.objectType}: ${query.search.objectValue}`}</span>;
};


const QueryHistory = ({store, classes}: { store: QueryHistoryStore, classes: any }) => (
    <Paper>
        <List dense>
            <ListItem dense disableGutters classes={{root: classes.listItem}}>
                <ListItemText primary='Merge previous'/>
                <ListItemSecondaryAction>
                    <Switch
                        onClick={() => store.flipMergePrevious()}
                        checked={store.mergePrevious}
                    />
                </ListItemSecondaryAction>
            </ListItem>
        </List>
        <Divider/>
        <List dense>

            {store.queries.map(query => (
                <ListItem
                    classes={{
                        root: classes.listItem,
                        container: `${
                            query.id === store.selectedQueryId ? classes.activeItem : ''
                            } ${classes.item}`
                    }}
                    button
                    disableGutters
                    dense
                    key={query.id}
                    onClick={() => store.setSelectedQuery(query)}>
                    <ListItemText
                        classes={{root: classes.listItemText}}
                        primary={<DataListItemText query={query}/>}
                        secondary={query.search.query}/>
                    <ListItemSecondaryAction>
                        <IconButton
                            onClick={() => store.removeQuery(query)}
                            classes={{root: classes.removeButton}}>
                            <CloseIcon/>
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
        </List>
        <Divider/>
        <div className={classes.buttons}>
            <Tooltip title='Export the whole search history as JSON'>
                <Button onClick={() => store.export()}>Export</Button>
            </Tooltip>

            <Tooltip title='Resolve direct facts between the current objects in the graph'>
                <Button onClick={() => store.resolveCurrentFacts()}>
                    RESOLVE FACTS
                </Button>
            </Tooltip>
            {/* <Button>Import</Button> */}
        </div>
    </Paper>
);


export default compose(
    // @ts-ignore
    withStyles(styles),
    // @ts-ignore
    observer)(QueryHistory);