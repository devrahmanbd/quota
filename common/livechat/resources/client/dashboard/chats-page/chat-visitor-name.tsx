import {CompactChatVisitor} from '@livechat/widget/chat/chat';
import {Trans} from '@ui/i18n/trans';

interface Props {
  visitor?: CompactChatVisitor;
  user?: {name: string; image?: string};
  className?: string;
}
export function ChatVisitorName({visitor, className}: Props) {
  return (
    <div className={className}>
      {visitor?.name ?? <Trans message="Visitor" />}
    </div>
  );
}
