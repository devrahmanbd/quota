import {useSettings} from '@ui/settings/use-settings';
import {Trans} from '@ui/i18n/trans';
import {SendIcon} from '@ui/icons/material/Send';
import {AvatarGroup} from '@ui/avatar/avatar-group';
import {Avatar} from '@ui/avatar/avatar';
import {Link} from 'react-router-dom';
import {cssPropsFromBgConfig} from '@common/background-selector/css-props-from-bg-config';
import React, {useMemo} from 'react';
import {HomeScreenCardLayout} from '@livechat/widget/home/home-screen-card-layout';
import {HomeScreenHcHard} from '@livechat/widget/home/home-screen-hc-hard';
import {useIsDarkMode} from '@ui/themes/use-is-dark-mode';
import {CustomMenuItem} from '@common/menus/custom-menu';
import {OpenInNewIcon} from '@ui/icons/material/OpenInNew';
import {AgentAvatarWithIndicator} from '@livechat/widget/chat/avatars/agent-avatar';
import {KeyboardArrowRightIcon} from '@ui/icons/material/KeyboardArrowRight';
import {BulletSeparatedItems} from '@common/ui/other/bullet-seprated-items';
import {FormattedRelativeTime} from '@ui/i18n/formatted-relative-time';
import {
  useMostRecentChat,
  UseMostRecentChatResponse,
} from '@livechat/widget/home/use-most-recent-chat';
import {useAllAgents} from '@livechat/widget/use-all-agents';
import {useTrans} from '@ui/i18n/use-trans';
import {getCurrentDateTime} from '@ui/i18n/use-current-date-time';

export function HomeScreen() {
  const {chatWidget} = useSettings();
  const {data} = useMostRecentChat();
  return (
    <div className="compact-scrollbar h-full min-h-0 overflow-y-auto overflow-x-hidden rounded-t-panel">
      <div className="relative isolate">
        <Background />
        <div className="relative z-20">
          <Greeting />
          <div className="space-y-16 px-16 pb-16">
            {data?.chat ? <ResumeChatCard data={data} /> : <NewChatCard />}
            <CustomLinksList />
            {chatWidget?.showHcCard && <HomeScreenHcHard />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Background() {
  const {chatWidget} = useSettings();
  const isDarkMode = useIsDarkMode();
  const cssProps = useMemo(() => {
    return cssPropsFromBgConfig(chatWidget?.background);
  }, [chatWidget]);

  if (isDarkMode) {
    return null;
  }

  return (
    <div className="absolute left-0 right-0 top-0 z-10 h-[320px] ">
      <div className="absolute h-full w-full" style={cssProps} />
      {chatWidget?.fadeBg && (
        <div className="widget-header-fade-gradient absolute h-full w-full" />
      )}
    </div>
  );
}

function TopBar() {
  const agents = useAllAgents();
  const {chatWidget} = useSettings();
  return (
    <div className="mb-100 flex items-center justify-between gap-12">
      {chatWidget?.logo && (
        <img
          className="max-h-36 max-w-full object-cover"
          src={chatWidget.logo}
          alt="logo"
        />
      )}
      {chatWidget?.showAvatars && (
        <AvatarGroup showMore={false}>
          {agents.map(agent => (
            <Avatar
              key={agent.id}
              src={agent.image}
              label={agent.name}
              fallback="initials"
            />
          ))}
        </AvatarGroup>
      )}
    </div>
  );
}

function Greeting() {
  const {chatWidget} = useSettings();
  // todo: based on specified user via widget config
  const greeting = chatWidget?.greetingAnonymous ?? chatWidget?.greeting;
  const name = 'user';

  return (
    <div className="p-30">
      <TopBar />
      <div
        className="leanding break-words text-[32px] font-bold leading-10"
        style={{
          color: !chatWidget?.fadeBg
            ? chatWidget?.background?.color
            : undefined,
        }}
      >
        {greeting && (
          <h1>
            <Trans message={greeting} values={{name}} />
          </h1>
        )}
        {chatWidget?.introduction && (
          <h2>
            <Trans message={chatWidget.introduction} />
          </h2>
        )}
      </div>
    </div>
  );
}

interface ResumeChatCardProps {
  data: UseMostRecentChatResponse;
}
function ResumeChatCard({data}: ResumeChatCardProps) {
  // todo: convert this into a query as well so can invalidate it easily when agent changes status using sockets event
  const {chatWidget} = useSettings();
  const {trans} = useTrans();
  const agents = useAllAgents();
  const chat = data.chat!;
  const agent = agents.find(a => a.id === chat.assigned_to) ?? agents[0];
  const lastMsg = data.messages?.data.filter(m => m.author != 'visitor')?.[0];
  const lastMsgText =
    lastMsg?.type === 'message'
      ? lastMsg.body
      : trans({message: chatWidget?.defaultMessage ?? ''});
  const lastMsgDate =
    lastMsg?.created_at ?? getCurrentDateTime().toAbsoluteString();

  return (
    <HomeScreenCardLayout>
      <div className="px-20 py-16 transition-button hover:bg-hover dark:bg-alt">
        <Link to={`/chats/${chat.id}`} className="block">
          <div className="mb-8 font-semibold">
            <Trans message="Recent message" />
          </div>
          <div className="flex items-center gap-8">
            <AgentAvatarWithIndicator user={agent} size="lg" showAwayIcon />
            <div className="min-w-0 flex-auto overflow-hidden">
              <BulletSeparatedItems className="text-xs text-muted">
                <div>{agent.name}</div>
                <div>
                  <FormattedRelativeTime date={lastMsgDate} style="narrow" />
                </div>
              </BulletSeparatedItems>
              <div className="text-sm">{lastMsgText}</div>
            </div>
            <KeyboardArrowRightIcon className="text-primary" size="sm" />
          </div>
        </Link>
      </div>
    </HomeScreenCardLayout>
  );
}

function NewChatCard() {
  const {chatWidget} = useSettings();
  return (
    <HomeScreenCardLayout>
      <div className="px-20 py-16 transition-button hover:bg-hover dark:bg-alt">
        <Link
          to="/chats/new"
          className="flex items-center justify-between gap-8"
        >
          <div>
            {chatWidget?.homeNewChatTitle && (
              <div className="font-semibold">
                <Trans message={chatWidget.homeNewChatTitle} />
              </div>
            )}
            {chatWidget?.homeNewChatSubtitle && (
              <div>
                <Trans message={chatWidget.homeNewChatSubtitle} />
              </div>
            )}
          </div>
          <SendIcon className="text-primary" />
        </Link>
      </div>
    </HomeScreenCardLayout>
  );
}

function CustomLinksList() {
  const {chatWidget} = useSettings();
  return (
    <div className="space-y-10 text-sm">
      {chatWidget?.homeLinks?.map(link => (
        <HomeScreenCardLayout
          key={link.id}
          className="flex cursor-pointer items-center justify-between gap-8 px-20 py-16 hover:bg-hover"
        >
          <CustomMenuItem item={link} />
          <OpenInNewIcon className="text-muted" size="sm" />
        </HomeScreenCardLayout>
      ))}
    </div>
  );
}
