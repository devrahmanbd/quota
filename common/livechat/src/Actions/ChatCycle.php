<?php

namespace Livechat\Actions;

use Common\Websockets\API\WebsocketAPI;
use Helpdesk\Events\ConversationStatusChanged;
use Helpdesk\Websockets\HelpDeskChannel;
use Illuminate\Support\Collection;
use Livechat\Models\Chat;

class ChatCycle
{
    protected Collection $onlineUsers;
    protected Collection $allAgents;
    protected Collection $onlineAgents;
    protected Collection $agentsAcceptingChats;

    public function __construct()
    {
        $this->onlineUsers = app(WebsocketAPI::class)->getActiveUsersInChannel(
            HelpDeskChannel::NAME,
        );
        $this->allAgents = (new AgentsLoader())->getAllAgents();
        $this->onlineAgents = $this->allAgents->filter(
            fn($agent) => $this->onlineUsers->contains($agent['id']),
        );
        $this->agentsAcceptingChats = $this->onlineAgents->filter(
            fn($agent) => $agent['acceptsChats'],
        );
    }

    public function run(): void
    {
        $affectedChats = Chat::where('status', '!=', Chat::STATUS_CLOSED)
            ->with(['lastMessage', 'group'])
            ->limit(50)
            ->get()
            ->filter(function (Chat $chat) {
                // visitor left chat, close chat and create event
                if (
                    $chat->status !== Chat::STATUS_UNASSIGNED &&
                    !$this->onlineUsers->contains($chat->visitor_id)
                ) {
                    $chat->update(['status' => Chat::STATUS_CLOSED]);
                    $chat->createEvent(Chat::EVENT_VISITOR_LEFT_CHAT, [
                        'status' => $chat->status,
                    ]);
                    return true;
                }

                if ($this->handleQueuedChat($chat)) {
                    return true;
                }

                if ($this->handleUnassignedChat($chat)) {
                    return true;
                }

                return $this->handleActiveChat($chat);
            });

        if ($affectedChats->isNotEmpty()) {
            (new DistributeActiveChatsToAvailableAgents())->execute();
            event(new ConversationStatusChanged($affectedChats->unique('id')));
        }
    }

    protected function handleQueuedChat(Chat $chat): bool
    {
        // if all agents are offline, mark chat as unassigned
        if (
            $chat->status === Chat::STATUS_QUEUED &&
            $this->onlineAgents->isEmpty()
        ) {
            $chat->update([
                'status' => Chat::STATUS_UNASSIGNED,
                'assigned_to' => null,
            ]);
            return true;
        }

        return false;
    }

    protected function handleUnassignedChat(Chat $chat): bool
    {
        // if there are any agents online, mark chat as queued
        if (
            $chat->status === Chat::STATUS_UNASSIGNED &&
            $this->onlineAgents->isNotEmpty()
        ) {
            $chat->update([
                'status' => Chat::STATUS_QUEUED,
                'assigned_to' => null,
            ]);
            return true;
        }

        return false;
    }

    /**
     * Specified chat can be active, idle or queued status.
     */
    protected function handleActiveChat(Chat $chat): bool
    {
        // first handle the case where agent for active chat is offline
        if (
            $chat->assigned_to === null ||
            !$this->onlineAgents->contains('id', $chat->assigned_to)
        ) {
            // assign chat to first available agent when auto assignment is enabled
            if (
                $chat->group?->chat_assignment_mode === 'auto' &&
                $this->agentsAcceptingChats->isNotEmpty()
            ) {
                $oldAgent = $this->allAgents->firstWhere(
                    'id',
                    $chat->assigned_to,
                );
                $newAgent = $this->allAgents->firstWhere(
                    'id',
                    $this->agentsAcceptingChats->first()['id'],
                );
                $chat->update([
                    'status' => Chat::STATUS_ACTIVE,
                    'assigned_to' => $newAgent['id'],
                ]);
                $chat->createEvent(Chat::EVENT_AGENT_LEFT_CHAT, [
                    'oldAgent' => $oldAgent['name'] ?? null,
                    'newAgent' => $newAgent['name'],
                ]);
                // if no agents available or assignment mode is manual, put chat back in queue
            } else {
                $chat->update(['status' => Chat::STATUS_QUEUED]);
                $chat->createEvent(Chat::EVENT_AGENT_LEFT_CHAT, [
                    'status' => $chat->status,
                    'oldAgent' => $oldAgent['name'] ?? null,
                ]);
            }
            return true;
        }

        if (!$chat->lastMessage) {
            return false;
        }

        // if there has been no activity for a while, mark chat as idle
        if (
            $chat->status === Chat::STATUS_ACTIVE &&
            $chat->lastMessage->created_at->diffInMinutes(now()) >
                settings('lc.timeout.inactive')
        ) {
            $chat->update(['status' => Chat::STATUS_IDLE]);
            $chat->createEvent(Chat::EVENT_VISITOR_IDLE);
            return true;
        }

        // if chat has been idle for a while, mark chat as closed
        if (
            $chat->status === Chat::STATUS_IDLE &&
            $chat->lastMessage->created_at->diffInMinutes(now()) >
                settings('lc.timeout.archive')
        ) {
            $chat->update(['status' => Chat::STATUS_CLOSED]);
            $chat->createEvent(Chat::EVENT_CLOSED_INACTIVITY);
            return true;
        }

        return false;
    }
}
