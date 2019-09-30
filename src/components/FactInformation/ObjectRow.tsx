import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, TableCell, TableRow, Theme } from '@material-ui/core';

import { objectTypeToColor, renderObjectValue } from '../../util/utils';
import { ActObject } from '../../pages/types';

const useStyles = makeStyles((theme: Theme) => ({
  cell: {
    paddingLeft: theme.spacing(2)
  },
  cellValue: {
    wordBreak: 'break-word'
  },
  row: {
    cursor: 'pointer',
    height: theme.spacing(4)
  }
}));

const ObjectRowComp = ({ onRowClick, object }: IOBjectRowComp) => {
  const classes = useStyles();
  return (
    <TableRow key={object.id} hover classes={{ root: classes.row }} onClick={() => onRowClick(object)}>
      <TableCell classes={{ root: classes.cell }} size="small">
        <span style={{ color: objectTypeToColor(object.type.name) }}>{object.type.name}</span>
      </TableCell>
      <TableCell classes={{ root: `${classes.cell} ${classes.cellValue}` }} size="small">
        {renderObjectValue(object, 256)}
      </TableCell>
    </TableRow>
  );
};

interface IOBjectRowComp {
  object: ActObject;
  onRowClick: (o: ActObject) => void;
}

export const ObjectRow = observer(ObjectRowComp);
