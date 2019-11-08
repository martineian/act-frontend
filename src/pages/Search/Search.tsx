import React from 'react';
import { observer } from 'mobx-react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';

import SearchByObjectType from './SearchByObjectType';
import SearchSimple from './SearchSimple';
import SearchStore from './SearchStore';

const useStyles = makeStyles((theme: Theme) => ({
  toggle: {
    display: 'flex',
    flexDirection: 'row-reverse'
  }
}));

const Search = ({ store }: ISearch) => {
  const classes = useStyles();

  return (
    <div>
      <div className={classes.toggle}>
        <Link component="button" color="primary" variant="button" onClick={() => store.toggleSelection()}>
          {store.isSimpleSearch ? 'Advanced' : 'Simple'}
        </Link>
      </div>
      {store.isSimpleSearch ? (
        <SearchSimple {...store.searchSimpleStore.prepared} />
      ) : (
        <SearchByObjectType store={store.searchByObjectTypeStore} />
      )}
    </div>
  );
};

interface ISearch {
  store: SearchStore;
}

export default observer(Search);
