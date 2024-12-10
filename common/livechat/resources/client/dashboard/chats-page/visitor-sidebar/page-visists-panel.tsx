import {Timeline, TimelineItem} from '@ui/timeline/timeline';
import {Tooltip} from '@ui/tooltip/tooltip';
import React, {memo, useEffect, useState} from 'react';
import {parseAbsoluteToLocal} from '@internationalized/date';
import {getCurrentDateTime} from '@ui/i18n/use-current-date-time';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {
  pageVisitsQueryKey,
  usePageVisits,
} from '@livechat/dashboard/chats-page/visitor-sidebar/use-page-visits';
import {ChatVisit} from '@livechat/widget/chat/chat';
import {echoStore} from '@livechat/widget/chat/broadcasting/echo-store';
import {queryClient} from '@common/http/query-client';
import {ProgressCircle} from '@ui/progress/progress-circle';
import {chatVisitorChannel} from '@livechat/websockets/chat-visitor-channel';

interface Props {
  initialData?: ChatVisit[];
  visitorId: number | string;
}
export function PageVisitsPanel({initialData, visitorId}: Props) {
  const {data} = usePageVisits(visitorId, initialData);

  useEffect(() => {
    return echoStore().listen({
      channel: chatVisitorChannel.name(visitorId),
      type: 'public',
      events: [chatVisitorChannel.events.visits.created],
      callback: () => {
        queryClient.invalidateQueries({
          queryKey: pageVisitsQueryKey(visitorId),
        });
      },
    });
  }, [visitorId]);

  if (!data) {
    return (
      <div className="flex justify-center">
        <ProgressCircle isIndeterminate size="xs" />
      </div>
    );
  }

  return (
    <Timeline>
      {data?.visits.map((visit, index) => (
        <TimelineItem isActive={index === 0} key={visit.id} className="w-max">
          <Tooltip label={visit.url} delay={300}>
            <div>
              <a href={visit.url} target="_blank" rel="noreferrer">
                {visit.title}
              </a>
              <div className="text-xs text-muted">
                <VisitDuration
                  start={visit.created_at}
                  end={visit.ended_at}
                  isLive={index === 0}
                />
              </div>
            </div>
          </Tooltip>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

interface VisitDurationProps {
  start: string;
  end?: string;
  isLive?: boolean;
}
const VisitDuration = memo(({start, end, isLive}: VisitDurationProps) => {
  const [ms] = useState<number>(() => {
    const startDate = parseAbsoluteToLocal(start);
    const endDate = end ? parseAbsoluteToLocal(end) : getCurrentDateTime();
    const diff = endDate.toDate().getTime() - startDate.toDate().getTime();
    return diff > 1000 ? diff : 1000;
  });
  return <FormattedDuration ms={ms} isLive={isLive} verbose />;
});
