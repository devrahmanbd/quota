import {opacityAnimation} from '@ui/animation/opacity-animation';
import {Trans} from '@ui/i18n/trans';
import React from 'react';
import {WidgetScreenHeader} from '@livechat/widget/widget-screen-header';
import {AnimatePresence, m} from 'framer-motion';
import {Button} from '@ui/buttons/button';
import {Link} from 'react-router-dom';
import {SendIcon} from '@ui/icons/material/Send';
import {useWidgetConversations} from '@livechat/widget/conversations/use-widget-conversations';
import {ProgressCircle} from '@ui/progress/progress-circle';
import {Chat} from '@livechat/widget/chat/chat';
import {VisitorAvatar} from '@livechat/widget/chat/avatars/visitor-avatar';
import {AgentAvatar} from '@livechat/widget/chat/avatars/agent-avatar';
import {ChatVisitorName} from '@livechat/dashboard/chats-page/chat-visitor-name';
import {KeyboardArrowRightIcon} from '@ui/icons/material/KeyboardArrowRight';
import {BulletSeparatedItems} from '@common/ui/other/bullet-seprated-items';
import {FormattedRelativeTime} from '@ui/i18n/formatted-relative-time';
import {useAllAgents} from '@livechat/widget/use-all-agents';
import {getCurrentDateTime} from '@ui/i18n/use-current-date-time';
import {useTrans} from '@ui/i18n/use-trans';
import {useSettings} from '@ui/settings/use-settings';

export function ConversationsScreen() {
  const {data} = useWidgetConversations();
  return (
    <div className="relative flex min-h-0 flex-auto flex-col">
      <WidgetScreenHeader label={<Trans message="Conversations" />} />
      <AnimatePresence initial={false} mode="wait">
        {data?.conversations ? (
          <ConversationList items={data.conversations} />
        ) : (
          <LoadingIndicator />
        )}
      </AnimatePresence>
      <Button
        variant="flat"
        color="primary"
        elementType={Link}
        to="/chats/new"
        endIcon={<SendIcon />}
        className="absolute bottom-12 left-0 right-0 mx-auto max-w-max"
      >
        <Trans message="New conversation" />
      </Button>
    </div>
  );
}

interface ConversationListProps {
  items: Chat[];
}
function ConversationList({items}: ConversationListProps) {
  const agents = useAllAgents();
  const {trans} = useTrans();
  const {chatWidget} = useSettings();
  return (
    <m.div
      {...opacityAnimation}
      key="coversations"
      className="compact-scrollbar flex-auto overflow-y-auto"
    >
      {items.map(conversation => {
        const msg = conversation.last_message!;
        const isFromVisitor = msg.author === 'visitor';
        const agent = conversation.assignee ?? agents[0];
        const user = msg.type !== 'event' ? msg.user : agent;

        const msgText =
          msg?.type === 'message'
            ? msg.body
            : trans({message: chatWidget?.defaultMessage ?? ''});
        const msgDate =
          msg?.created_at ?? getCurrentDateTime().toAbsoluteString();

        return (
          <Link
            to={`/chats/${conversation.id}`}
            state={{prevPath: '/chats'}}
            key={conversation.id}
            className="flex items-center gap-8 border-b border-divider-lighter px-20 py-16 transition-button hover:bg-hover"
          >
            {isFromVisitor ? (
              <VisitorAvatar
                size="lg"
                visitor={conversation.visitor}
                user={user}
              />
            ) : (
              <AgentAvatar size="lg" user={user!} />
            )}
            <div className="flex-auto text-sm">
              <BulletSeparatedItems className="text-muted">
                <div>
                  {isFromVisitor ? (
                    <ChatVisitorName
                      visitor={conversation.visitor}
                      user={user}
                    />
                  ) : (
                    agent.name
                  )}
                </div>
                <div>
                  <FormattedRelativeTime date={msgDate} style="narrow" />
                </div>
              </BulletSeparatedItems>
              <div>{msgText}</div>
            </div>
            <KeyboardArrowRightIcon className="text-primary" size="sm" />
          </Link>
        );
      })}
    </m.div>
  );
}

function LoadingIndicator() {
  return (
    <m.div
      key="loading"
      {...opacityAnimation}
      className="flex flex-auto items-center justify-center"
    >
      <ProgressCircle isIndeterminate />
    </m.div>
  );
}
