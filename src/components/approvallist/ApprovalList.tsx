import { observer } from 'mobx-react';
import { useContext } from 'react';

import { StoreContext } from '../../stores/StoreContextProvider';

import { ApprovalEntry } from './ApprovalEntry';
import { ApprovalHeader } from './ApprovalHeader';

export const ApprovalList = observer(() => {
  const { uiStore } = useContext(StoreContext);

  const approvals = uiStore.filteredApprovals;
  return (
    <>
      <ApprovalHeader />
      {approvals?.map((approval) => (
        <ApprovalEntry key={approval.id} approval={approval} />
      ))}
    </>
  );
});
