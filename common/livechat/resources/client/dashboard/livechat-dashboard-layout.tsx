import {DashboardLayout} from '@common/ui/dashboard-layout/dashboard-layout';
import {DashboardNavbar} from '@common/ui/dashboard-layout/dashboard-navbar';
import {DashboardSidenav} from '@common/ui/dashboard-layout/dashboard-sidenav';
import {DashboardContent} from '@common/ui/dashboard-layout/dashboard-content';
import {Outlet} from 'react-router-dom';
import {LivechatDashboardSidebar} from '@livechat/dashboard/livechat-dashboard-sidebar';
import {useEffect} from 'react';
import {echoStore} from '@livechat/widget/chat/broadcasting/echo-store';
import {queryClient} from '@common/http/query-client';
import {helpdeskChannel} from '@common/help-desk/websockets/helpdesk-channel';

export function LivechatDashboardLayout() {
  useEffect(() => {
    return echoStore().listen({
      channel: helpdeskChannel.name,
      events: [
        helpdeskChannel.events.conversations.created,
        helpdeskChannel.events.conversations.assigned,
        helpdeskChannel.events.conversations.statusChanged,
        helpdeskChannel.events.agents.updated,
      ],
      type: 'presence',
      callback: e => {
        console.log('event dash', e);
        if (e.event.includes('conversations')) {
          queryClient.invalidateQueries({queryKey: ['dashboard', 'chats']});
        } else if (e.event.includes('agents')) {
          queryClient.invalidateQueries({queryKey: ['helpdesk', 'agents']});
        }
      },
    });
  }, []);

  return (
    <DashboardLayout name="dashboard" leftSidenavCanBeCompact>
      <DashboardNavbar size="sm" menuPosition="dashboard-navbar" />
      <DashboardSidenav position="left" size="sm">
        <LivechatDashboardSidebar />
      </DashboardSidenav>
      <DashboardContent stableScrollbar={true}>
        <div className="bg dark:bg-alt">
          <Outlet />
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
}
