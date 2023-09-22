import { Button } from '@mui/material';
import { observer } from 'mobx-react';
import { useContext, useState } from 'react';

import { StoreContext } from '../../stores/StoreContextProvider';
import { ApprovalDialog } from '../ApprovalDialog';

import { ApprovalEntry } from './ApprovalEntry';
import { ApprovalHeader } from './ApprovalHeader';

export const ApprovalList = observer(() => {
  const { uiStore } = useContext(StoreContext);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

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
