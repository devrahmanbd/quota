import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {Trans} from '@ui/i18n/trans';
import React from 'react';
import {useDeleteGroup} from '@livechat/dashboard/groups/requests/use-delete-group';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';

interface Props {
  groupId: number;
  onDeleted?: () => void;
}
export function DeleteGroupDialog({groupId, onDeleted}: Props) {
  const deleteGroup = useDeleteGroup();
  const {close} = useDialogContext();
  return (
    <ConfirmationDialog
      title={<Trans message="Delete Group" />}
      body={<Trans message="Are you sure you want to delete this group?" />}
      confirm={<Trans message="Delete" />}
      onConfirm={() =>
        deleteGroup.mutate(
          {groupId},
          {
            onSuccess: () => {
              onDeleted?.();
              close();
            },
          },
        )
      }
      isLoading={deleteGroup.isPending}
      isDanger
    />
  );
}
