import {Chat} from '@livechat/widget/chat/chat';
import {Trans} from '@ui/i18n/trans';
import {Button} from '@ui/buttons/button';
import {ReactElement, ReactNode, useState} from 'react';
import {useUpdateChatStatus} from '@livechat/dashboard/chats-page/chat-feed/use-update-chat-status';
import {Link} from 'react-router-dom';
import {useIsArchivePage} from '@livechat/dashboard/chats-page/use-is-archive-page';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {DashboardChatFeedTextEditor} from '@livechat/dashboard/chats-page/chat-feed/dashboard-chat-feed-text-editor';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {parseAbsoluteToLocal} from '@internationalized/date';
import {getCurrentDateTime} from '@ui/i18n/use-current-date-time';
import {PickFromQueueButton} from '@livechat/dashboard/chats-page/chat-feed/pick-from-queue-button';

interface Props {
  chat: Chat;
}
export function DashboardChatFeedBottomBar({chat}: Props) {
  const isArchivePage = useIsArchivePage();

  // todo: check if should check for chat.group_id here
  if (!isArchivePage) {
    if (chat.status === 'queued') {
      return <PickFromQueueAction chat={chat} />;
    }
    if (!chat.assigned_to) {
      return (
        <AssignToMeChatAction
          title={<Trans message="This chat is unassigned." />}
          submitText={<Trans message="Pick from queue" />}
          chat={chat}
        />
      );
    }
  }

  if (isArchivePage) {
    if (chat.status === 'closed') {
      return <OpenArchivedChatAction chat={chat} />;
    } else {
      return <ViewActiveChat chat={chat} />;
    }
  }

  return (
    <FileUploadProvider>
      <DashboardChatFeedTextEditor chat={chat} />
    </FileUploadProvider>
  );
}

function OpenArchivedChatAction({chat}: Props) {
  const changeStatus = useUpdateChatStatus(chat.id);
  return (
    <ChatActionLayout>
      <div>
        <Trans message="This chat has been archived." />
      </div>
      <Button
        variant="flat"
        color="primary"
        disabled={changeStatus.isPending}
        onClick={() => {
          changeStatus.mutate({status: 'active'});
        }}
      >
        <Trans message="Open chat" />
      </Button>
    </ChatActionLayout>
  );
}

interface AssignToMeChatActionProps {
  chat: Chat;
  title: ReactElement;
  submitText: ReactElement;
}
function AssignToMeChatAction({
  chat,
  title,
  submitText,
}: AssignToMeChatActionProps) {
  const changeStatus = useUpdateChatStatus(chat.id);
  return (
    <ChatActionLayout>
      <div>{title}</div>
      <div>
        <Button
          className="mr-14"
          variant="outline"
          color="primary"
          disabled={changeStatus.isPending}
          onClick={() => {
            changeStatus.mutate({status: 'closed'});
          }}
        >
          <Trans message="Close" />
        </Button>
        <PickFromQueueButton chatId={chat.id}>{submitText}</PickFromQueueButton>
      </div>
    </ChatActionLayout>
  );
}

function PickFromQueueAction({chat}: Props) {
  const [ms] = useState<number>(() => {
    const startDate = parseAbsoluteToLocal(chat.created_at);
    const endDate = getCurrentDateTime();
    const diff = endDate.toDate().getTime() - startDate.toDate().getTime();
    return diff > 1000 ? diff : 1000;
  });

  return (
    <AssignToMeChatAction
      chat={chat}
      title={
        <Trans
          message="Visitor is waiting in queue for :minutes"
          values={{minutes: <FormattedDuration ms={ms} isLive verbose />}}
        />
      }
      submitText={<Trans message="Pick from queue" />}
    />
  );
}

function ViewActiveChat({chat}: Props) {
  return (
    <ChatActionLayout>
      <div>
        <Trans message="This is an ongoing chat." />
      </div>
      <Button
        variant="flat"
        color="primary"
        elementType={Link}
        to={`/dashboard/chats/${chat.id}`}
      >
        <Trans message="View chat" />
      </Button>
    </ChatActionLayout>
  );
}

interface ChatActionLayoutProps {
  children: ReactNode;
}
function ChatActionLayout({children}: ChatActionLayoutProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-14 border-t p-28">
      {children}
    </div>
  );
}
