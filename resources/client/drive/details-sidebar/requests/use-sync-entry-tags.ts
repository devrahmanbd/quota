import {BackendResponse} from '@common/http/backend-response/backend-response';
import {useMutation} from '@tanstack/react-query';
import {apiClient} from '@common/http/query-client';
import {showHttpErrorToast} from '@common/http/show-http-error-toast';
import {message} from '@ui/i18n/message';
import {DriveEntry} from '@app/drive/files/drive-entry';
import {invalidateEntryQueries} from '@app/drive/drive-query-keys';
import {ChipValue} from '@ui/forms/input-field/chip-field/chip-field';

interface Response extends BackendResponse {
  //
}

interface Payload {
  entry: DriveEntry;
  tags: ChipValue[];
}

export function useSyncEntryTags() {
  return useMutation({
    mutationFn: (props: Payload) => createComment(props),
    onSuccess: () => {
      invalidateEntryQueries();
    },
    onError: err => showHttpErrorToast(err, message('Failed to save tags.')),
  });
}

function createComment({entry, tags}: Payload): Promise<Response> {
  return apiClient
    .post(`file-entries/${entry.id}/sync-tags`, {
      tags: tags.map(tag => tag.name),
    })
    .then(r => r.data);
}
