import React, {Fragment, useContext} from 'react';
import {Trans} from '@ui/i18n/trans';
import visitorsSvg from '@livechat/dashboard/visitors/real-time-analytics.svg';
import {DataTablePage} from '@common/datatable/page/data-table-page';
import {DataTableEmptyStateMessage} from '@common/datatable/page/data-table-emty-state-message';
import {visitorsIndexPageColumns} from '@livechat/dashboard/visitors/visitors-index-page-columns';
import {useVisitorIndexPageFilters} from '@livechat/dashboard/visitors/visitors-index-page-filters';
import {ChatVisitor} from '@livechat/widget/chat/chat';
import {AnimatePresence, m} from 'framer-motion';
import {VisitorSidebarHeader} from '@livechat/dashboard/chats-page/visitor-sidebar/chat-general-details';
import {Accordion} from '@ui/accordion/accordion';
import {TechnologyPanel} from '@livechat/dashboard/chats-page/visitor-sidebar/technology-panel';
import {useLocalStorage} from '@ui/utils/hooks/local-storage';
import {SidebarAccordionItem} from '@livechat/dashboard/chats-page/visitor-sidebar/dashboard-chat-info-sidebar';
import {PageVisitsPanel} from '@livechat/dashboard/chats-page/visitor-sidebar/page-visists-panel';
import {RecentChatsPanel} from '@livechat/dashboard/chats-page/visitor-sidebar/recent-chats-panel';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useSearchParams} from 'react-router-dom';
import {DataTableContext} from '@common/datatable/page/data-table-context';
import {useNumberSearchParam} from '@common/ui/navigation/use-number-search-param';
import {IconButton} from '@ui/buttons/icon-button';
import {CloseIcon} from '@ui/icons/material/Close';

// todo: show queued time next tue queued and maybe unnassigned status (can copy from chat page footer)
// todo: can use inline filter functionality from Quota search page for filters

export function VisitorsIndexPage() {
  const [, setSearchParams] = useSearchParams();
  const {filters, isFiltersLoading} = useVisitorIndexPageFilters();
  return (
    <Fragment>
      <DataTablePage
        className="min-w-0 grow"
        enableSelection={false}
        endpoint="lc/visitors"
        skeletonsWhileLoading={1}
        title={<Trans message="Traffic" />}
        columns={visitorsIndexPageColumns}
        filters={filters}
        filtersLoading={isFiltersLoading}
        cellHeight="h-60"
        border="border-none"
        onRowAction={visitor => {
          setSearchParams({visitorId: visitor.id.toString()});
        }}
        emptyStateMessage={
          <DataTableEmptyStateMessage
            image={visitorsSvg}
            title={<Trans message="There was no traffic recently" />}
            filteringTitle={<Trans message="No matching visitors" />}
          />
        }
      >
        <SelectedVisitorSidebar />
      </DataTablePage>
    </Fragment>
  );
}

function SelectedVisitorSidebar() {
  const {query} = useContext(DataTableContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const visitors = query.data?.pagination.data as ChatVisitor[] | null;
  const selectedVisitorId = useNumberSearchParam('visitorId');
  const selectedVisitor = selectedVisitorId
    ? visitors?.find(v => v.id === selectedVisitorId)
    : null;

  const navigate = useNavigate();
  const [expandedItems, setExpendedItems] = useLocalStorage(
    'dash.visitors.info',
    [0],
  );

  const content = selectedVisitor ? (
    <m.aside
      initial={{x: '100%', opacity: 0}}
      animate={{x: 0, opacity: 1}}
      exit={{x: '100%', opacity: 0}}
      transition={{type: 'tween', duration: 0.14, origin: 1}}
      className="fixed right-0 top-54 z-10 h-[calc(100%-54px)] w-440 max-w-full border-l bg shadow-xl"
    >
      <IconButton
        className="absolute right-4 top-4"
        onClick={() => {
          searchParams.delete('visitorId');
          setSearchParams(searchParams);
        }}
      >
        <CloseIcon />
      </IconButton>
      <div className="p-20">
        <VisitorSidebarHeader visitor={selectedVisitor} />
      </div>
      <Accordion
        expandedValues={expandedItems}
        onExpandedChange={values => setExpendedItems(values as number[])}
        mode="multiple"
        key="details-accordion"
      >
        <SidebarAccordionItem label={<Trans message="Visited pages" />}>
          <PageVisitsPanel visitorId={selectedVisitor.id} />
        </SidebarAccordionItem>
        <SidebarAccordionItem label={<Trans message="Technology" />}>
          <TechnologyPanel visitor={selectedVisitor} />
        </SidebarAccordionItem>
        <SidebarAccordionItem label={<Trans message="Recent chats" />}>
          <RecentChatsPanel
            visitorId={selectedVisitor.id}
            onChatSelected={chat => {
              navigate(`/dashboard/chats/${chat.id}`);
            }}
          />
        </SidebarAccordionItem>
      </Accordion>
    </m.aside>
  ) : null;

  return <AnimatePresence initial={false}>{content}</AnimatePresence>;
}
