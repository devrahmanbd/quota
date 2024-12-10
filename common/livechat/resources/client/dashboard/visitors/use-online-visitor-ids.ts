import {useEchoStore} from '@livechat/widget/chat/broadcasting/echo-store';
import {helpdeskChannel} from '@common/help-desk/websockets/helpdesk-channel';

export function useIsVisitorOnline(visitorId: number | string): boolean {
  return !!useEchoStore(
    s =>
      s.presence[helpdeskChannel.name]?.find(u => `${u.id}` === `${visitorId}`),
  );
}

export function useOnlineVisitorIds(): (number | string)[] {
  return useEchoStore(s => {
    return (s.presence[helpdeskChannel.name] ?? [])
      .filter(user => !user.isAgent)
      .map(user => user.id);
  });
}
