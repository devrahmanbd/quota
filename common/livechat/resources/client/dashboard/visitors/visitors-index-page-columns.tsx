import {ColumnConfig} from '@common/datatable/column-config';
import {Chat, ChatVisitor} from '@livechat/widget/chat/chat';
import {Trans} from '@ui/i18n/trans';
import {NameWithAvatarPlaceholder} from '@common/datatable/column-templates/name-with-avatar';
import {VisitorAvatar} from '@livechat/widget/chat/avatars/visitor-avatar';
import {ChatVisitorName} from '@livechat/dashboard/chats-page/chat-visitor-name';
import {
  useIsVisitorOnline,
  useOnlineVisitorIds,
} from '@livechat/dashboard/visitors/use-online-visitor-ids';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {AgentAvatar} from '@livechat/widget/chat/avatars/agent-avatar';
import React, {ReactNode} from 'react';
import {OnlineStatusCircle} from '@ui/badge/online-status-circle';
import {Button} from '@ui/buttons/button';
import {PickFromQueueButton} from '@livechat/dashboard/chats-page/chat-feed/pick-from-queue-button';
import {Link} from 'react-router-dom';
import {useAuth} from '@common/auth/use-auth';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useCreateChat} from '@livechat/widget/chat/use-create-chat';
import {createPlaceholderChatMessage} from '@livechat/widget/chat/use-submit-chat-message';
import {useTrans} from '@ui/i18n/use-trans';
import {useSettings} from '@ui/settings/use-settings';

interface IndexPageVisitor extends ChatVisitor {
  status: Chat['status'] | null;
  assigned_to: Chat['assigned_to'];
  assignee?: Chat['assignee'];
  time_on_all_pages?: number;
  active_chat_id: number | null;
}

export const visitorsIndexPageColumns: ColumnConfig<IndexPageVisitor>[] = [
  {
    key: 'name',
    allowsSorting: true,
    visibleInMode: 'all',
    sortingKey: 'user_identifier',
    header: () => <Trans message="Name" />,
    body: (visitor, row) =>
      row.isPlaceholder ? (
        // todo: update this
        <NameWithAvatarPlaceholder showDescription className="max-w-100" />
      ) : (
        <div className="flex items-center gap-12">
          <VisitorAvatar visitor={visitor} />
          <ChatVisitorName visitor={visitor} />
        </div>
      ),
  },
  {
    key: 'email',
    allowsSorting: true,
    header: () => <Trans message="Email" />,
    // todo: add skeleton
    body: visitor => <div>{visitor.email ?? visitor.user?.email ?? '-'}</div>,
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    body: visitor => <ActionsColumn visitor={visitor} />,
  },
  {
    key: 'status',
    allowsSorting: true,
    header: () => <Trans message="Status" />,
    body: visitor => <VisitorStatusColumn visitor={visitor} />,
  },
  {
    key: 'chattingWith',
    allowsSorting: true,
    sortingKey: 'assigned_to',
    header: () => <Trans message="Chatting with" />,
    body: visitor => <ChattingWithColumn visitor={visitor} />,
  },
  {
    key: 'timeOnAllPages',
    allowsSorting: true,
    sortingKey: 'time_on_all_pages',
    header: () => <Trans message="Time on all pages" />,
    // todo: add skeleton
    body: visitor => <TimeOnAllPagesColumn visitor={visitor} />,
  },
];

interface ColumnProps {
  visitor: IndexPageVisitor;
}
function TimeOnAllPagesColumn({visitor}: ColumnProps) {
  const onlineVisitors = useOnlineVisitorIds();
  return (
    <FormattedDuration
      ms={visitor.time_on_all_pages}
      isLive={onlineVisitors.includes(visitor.id)}
      verbose
    />
  );
}

function ActionsColumn({visitor}: ColumnProps) {
  const isVisitorOnline = useIsVisitorOnline(visitor.id);
  if (!isVisitorOnline || !visitor.active_chat_id) {
    return '-';
  }

  switch (visitor.status) {
    case 'queued':
      return <PickFromQueueButton chatId={visitor.active_chat_id} size="xs" />;
    case 'unassigned':
      return (
        <PickFromQueueButton chatId={visitor.active_chat_id} size="xs">
          <Trans message="Assign to me" />
        </PickFromQueueButton>
      );
    case 'active':
    case 'idle':
      return (
        <Button
          variant="outline"
          size="xs"
          elementType={Link}
          to={`/dashboard/chats/${visitor.active_chat_id}`}
        >
          <Trans message="View chat" />
        </Button>
      );
  }

  return <StartChatButton />;
}

function StartChatButton() {
  const createChat = useCreateChat();
  const {user} = useAuth();
  const navigate = useNavigate();
  const {trans} = useTrans();
  const {chatWidget} = useSettings();
  return (
    <Button
      variant="outline"
      size="xs"
      disabled={createChat.isPending}
      onClick={() => {
        createChat.mutate(
          {
            agentId: user!.id,
            messages: [
              createPlaceholderChatMessage({
                body: trans({message: chatWidget?.defaultMessage ?? ''}),
                author: 'agent',
              }),
            ],
          },
          {onSuccess: r => navigate(`/dashboard/chats/${r.chat.id}`)},
        );
      }}
    >
      <Trans message="Start chat" />
    </Button>
  );
}

function VisitorStatusColumn({visitor}: ColumnProps) {
  const isVisitorOnline = useIsVisitorOnline(visitor.id);

  // add check for chatting (can load active chat from backend), waiting for chat (queued) and other stuff from livechat

  // browsing, queued, chatting, waiting for reply

  if (!isVisitorOnline) {
    return (
      <StatusMessage color="bg-chip">
        <Trans message="Left website" />
      </StatusMessage>
    );
  }

  switch (visitor.status) {
    case 'queued':
      return (
        <StatusMessage color="bg-danger">
          <Trans message="Queued" />
        </StatusMessage>
      );
    case 'active':
    case 'idle':
      return (
        <StatusMessage color="bg-positive">
          <Trans message="Chatting" />
        </StatusMessage>
      );
    case 'unassigned':
      return (
        <StatusMessage color="bg-danger">
          <Trans message="Waiting for reply" />
        </StatusMessage>
      );
  }

  return (
    <StatusMessage color="bg-positive">
      <Trans message="Browsing" />
    </StatusMessage>
  );
}

function ChattingWithColumn({visitor}: ColumnProps) {
  const isChatActive = visitor.status === 'active' || visitor.status === 'idle';
  if (!visitor?.assignee || !isChatActive) {
    return '-';
  }

  return (
    <div className="flex items-center gap-6">
      <AgentAvatar user={visitor.assignee} size="sm" />
      <div>{visitor.assignee.name}</div>
    </div>
  );
}

interface StatusMessageProps {
  color: string;
  children: ReactNode;
}
const StatusMessage = ({color, children}: StatusMessageProps) => (
  <div className="flex items-center gap-6">
    <OnlineStatusCircle color={color} />
    {children}
  </div>
);
