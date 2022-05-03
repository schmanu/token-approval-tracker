import { Button } from '@gnosis.pm/safe-react-components';
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
        <ApprovalEntry approval={approval} />
      ))}
      <Button
        variant={uiStore.selectedApprovals.length === 0 ? 'bordered' : 'contained'}
        disabled={uiStore.selectedApprovals.length === 0}
        style={{ marginTop: 16 }}
        size="lg"
        onClick={() => setApprovalDialogOpen(true)}
      >
        Edit Approvals
      </Button>
      {approvalDialogOpen && (
        // Larger objects are better moved outside of components.
        <div style={{ position: 'absolute', top: '0px', height: '100%', width: '100%' }}>
          <ApprovalDialog onCancel={() => setApprovalDialogOpen(false)} />
        </div>
      )}
    </>
  );
});
