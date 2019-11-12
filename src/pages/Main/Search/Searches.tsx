import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import WarnIcon from '@material-ui/icons/Warning';

import ObjectTable, { IObjectTableComp } from '../../../components/ObjectTable';
import MultiSelect, { IMultiSelect } from '../../../components/MultiSelect';

const useStyles = makeStyles((theme: Theme) => ({
  warning: {
    textAlign: 'center',
    padding: theme.spacing(10)
  },
  fillFlex: {
    flex: '1 0 auto'
  },
  root: {
    overflowY: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  header: {
    marginLeft: theme.spacing(8),
    padding: '16px 10px 18px 0',
    display: 'flex',
    justifyContent: 'space-between'
  },
  footer: {
    padding: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'row-reverse'
  },
  tableContainer: { overflowY: 'auto', flex: '1 1 auto' },
  titleContainer: { display: 'flex', alignItems: 'center' },
  objectTypeFilter: { paddingTop: theme.spacing(2) + 'px' },
  progress: { padding: theme.spacing(1) },
  selectButton: {
    padding: `${theme.spacing(1)}px 0`
  },
  errorRetry: {
    paddingTop: theme.spacing(2)
  },
  warningContainer: {
    display: 'flex',
    color: theme.palette.secondary.dark
  }
}));

const useHistoryStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    zIndex: 900
  },
  popperRoot: {
    maxWidth: '350px',
    minWidth: '300px',
    overflowY: 'auto',
    maxHeight: '60vh'
  },
  ellipsisText: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  labelSecondary: {
    paddingLeft: theme.spacing(1)
  },
  spacedOut: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}));

const HistoryComp = ({ historyItems }: { historyItems: Array<SearchHistoryItem> }) => {
  const classes = useHistoryStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div
      className={classes.root}
      ref={node => {
        setAnchorEl(node);
      }}>
      <Tooltip title="Show search history">
        <span>
          <ClickAwayListener onClickAway={() => setHistoryOpen(false)}>
            <Button variant="outlined" onClick={() => setHistoryOpen(!historyOpen)}>
              {`Search History (${historyItems.length})`}
            </Button>
          </ClickAwayListener>
        </span>
      </Tooltip>

      <Popper disablePortal={true} container={anchorEl} open={historyOpen} anchorEl={anchorEl} placement="left-start">
        <Paper classes={{ root: classes.popperRoot }}>
          <List dense>
            {historyItems.map((item: any) => {
              return (
                <ListItem button onClick={item.onClick} key={item.label}>
                  <ListItemText>
                    <div className={classes.spacedOut}>
                      <div className={classes.ellipsisText}>{item.label}</div>
                      <div className={classes.labelSecondary}>{item.labelSecondary}</div>
                    </div>
                  </ListItemText>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Popper>
    </div>
  );
};

const CenteredWarningComp = ({ classes, title, subTitle }: { classes: any; title: string; subTitle: string }) => {
  return (
    <div className={classes.warning}>
      <Typography variant="h5">{title}</Typography>
      <Typography variant="subtitle1">{subTitle}</Typography>
    </div>
  );
};

const SearchErrorComp = ({ classes, title, subTitle, onRetryClick }: ISearchError & { classes: any }) => {
  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.titleContainer}>
          <Typography variant="h6">{title}</Typography>
          <WarnIcon color="error" />
        </div>

        <Typography variant="subtitle1" color={'error'}>
          {subTitle}
        </Typography>

        <div className={classes.errorRetry}>
          <Tooltip title={'Retry the current search'}>
            <Button variant="outlined" size="small" onClick={onRetryClick}>
              Retry
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

const SearchesComp = ({ searchResult, searchError }: ISearchesComp) => {
  const classes = useStyles();

  if (searchError) {
    return <SearchErrorComp {...searchError} classes={classes} />;
  }

  if (!searchResult) {
    return (
      <CenteredWarningComp
        classes={classes}
        title="You have no simple searches"
        subTitle="Try to run a simple search from the search box"
      />
    );
  }

  const {
    isLoading,
    title,
    subTitle,
    isResultEmpty,
    resultTable,
    warningText,
    onAddSelectedObjects,
    objectTypeFilter
  } = searchResult;

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div>
          <div className={classes.titleContainer}>
            <Typography variant="h6">{title}</Typography>
            {isLoading && <CircularProgress className={classes.progress} size={20} />}
          </div>
          <Typography variant="body1">{subTitle}</Typography>
          {warningText && (
            <div className={classes.warningContainer}>
              <WarnIcon color="secondary" />
              <Typography variant="subtitle1">{warningText}</Typography>
            </div>
          )}
          {!isLoading && !isResultEmpty && (
            <div className={classes.objectTypeFilter}>
              <MultiSelect {...objectTypeFilter} />
            </div>
          )}
        </div>
        <HistoryComp historyItems={searchResult.historyItems} />
      </div>
      {!isLoading && isResultEmpty && (
        <div className={classes.fillFlex}>
          <CenteredWarningComp classes={classes} title="There were no result" subTitle="Try to refine your search" />
        </div>
      )}
      {!isLoading && !isResultEmpty && (
        <div className={classes.tableContainer}>
          <ObjectTable {...resultTable} />
        </div>
      )}
      <div className={classes.footer}>
        <div className={classes.selectButton}>
          <Tooltip title="Add to working history">
            <Button size="small" color="secondary" variant="contained" onClick={onAddSelectedObjects}>
              Add selected objects
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

interface ISearchError {
  title: string;
  subTitle: string;
  onRetryClick: () => void;
}

interface SearchHistoryItem {
  label: string;
  labelSecondary: string;
  onClick: () => void;
}

interface ISearchesComp {
  searchError?: ISearchError;
  searchResult?: {
    title: string;
    subTitle: string;
    isLoading: boolean;
    warningText?: string;
    onAddSelectedObjects: () => void;
    historyItems: Array<SearchHistoryItem>;
    objectTypeFilter: IMultiSelect;
    isResultEmpty: boolean;
    resultTable: IObjectTableComp;
  };
}
export default observer(SearchesComp);