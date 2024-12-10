import {CompactChatVisitor} from '@livechat/widget/chat/chat';
import {useTrans} from '@ui/i18n/use-trans';
import {Avatar, AvatarProps} from '@ui/avatar/avatar';

interface Props {
  visitor?: CompactChatVisitor;
  user?: {name: string; image?: string};
  size?: AvatarProps['size'];
  className?: string;
}
export function VisitorAvatar({visitor, user, className, size}: Props) {
  const {trans} = useTrans();
  const label = user?.name ?? visitor?.email ?? trans({message: 'visitor'});
  return (
    <Avatar
      circle
      fallback="initials"
      label={label}
      src={user?.image}
      className={className}
      size={size}
    />
  );
}
