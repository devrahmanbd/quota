import {Chat} from '@livechat/widget/chat/chat';
import {Link} from 'react-router-dom';
import clsx from 'clsx';
import {VisitorAvatar} from '@livechat/widget/chat/avatars/visitor-avatar';
import {ChatVisitorName} from '@livechat/dashboard/chats-page/chat-visitor-name';
import {FormattedRelativeTime} from '@ui/i18n/formatted-relative-time';
import {useIsArchivePage} from '@livechat/dashboard/chats-page/use-is-archive-page';
import {Trans} from '@ui/i18n/trans';

interface Props {
  chat: Chat;
  isActive: boolean;
  className?: string;
}
export function ChatListItem({chat, isActive, className}: Props) {
  const isArchive = useIsArchivePage();
  return (
    <Link
      to={`../${chat.id}`}
      relative="path"
      className={clsx(
        'block cursor-pointer p-16 text-sm transition-bg-color hover:bg-hover',
        chat.status === 'closed' && !isArchive && 'opacity-60',
        isActive && 'bg-hover',
        className,
      )}
    >
      <div className="flex gap-8">
        {chat.visitor && <VisitorAvatar visitor={chat.visitor} size="sm" />}
        <div className="flex-auto">
          <div className="mb-6 flex items-start gap-8">
            <div className="font-semibold">
              <ChatVisitorName visitor={chat.visitor} />
            </div>
            <time className="ml-auto block text-xs text-muted">
              <FormattedRelativeTime date={chat.created_at} />
            </time>
          </div>
          <div className="text-[13px] text-muted">
            <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">
              {chat.last_message?.body}
            </div>
            {isArchive && chat.assignee && (
              <div className="mb-2">
                <Trans
                  message="Agent: :name"
                  values={{name: chat.assignee.name}}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
