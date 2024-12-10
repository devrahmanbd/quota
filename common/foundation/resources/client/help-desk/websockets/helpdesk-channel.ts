export const helpdeskChannel = {
  name: 'helpdesk',
  events: {
    conversations: {
      created: '.conversations.created',
      assigned: '.conversations.assigned',
      statusChanged: '.conversations.statusChanged',
    },
    agents: {
      updated: '.agents.updated',
    },
  },
};
