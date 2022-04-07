import { observer } from 'mobx-react';
import { ReactElement, useContext } from 'react';

import { StoreContext } from '../stores/StoreContextProvider';

interface StoreLoaderProps {
  loading: ReactElement;
  children: ReactElement;
}

export const StoreLoader: React.FC<StoreLoaderProps> = observer((props) => {
  const { transactionStore, tokenStore } = useContext(StoreContext);
  return transactionStore.isTransactionDataLoading || tokenStore.isTokenDataLoading ? props.loading : props.children;
});
