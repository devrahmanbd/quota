<?php

namespace Livechat\Controllers;

use Common\Core\BaseController;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Livechat\Models\Chat;

class DashboardChatController extends BaseController
{
    public function index()
    {
        $this->authorize('index', Chat::class);

        $groupIds = Auth::user()
            ->groups()
            ->pluck('groups.id');

        $chats = Chat::where('status', '!=', Chat::STATUS_CLOSED)
            ->where(function ($q) use ($groupIds) {
                // where assigned to current user
                $q->where('assigned_to', auth()->id())->orWhere(function (
                    $q,
                ) use ($groupIds) {
                    // or where not assigned to specific agent and in user's group
                    $q->whereNull('assigned_to')->whereIn(
                        'group_id',
                        $groupIds,
                    );
                });
            })
            ->with(['lastMessage', 'visitor' => fn($q) => $q->compact()])
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->limit(30)
            ->get();

        $chats = $chats->map(fn(Chat $chat) => $chat->truncateLastMessage());

        $groupedChats = $chats->isNotEmpty()
            ? $chats->groupBy(function (Chat $chat) {
                if ($chat->assigned_to) {
                    return 'myChats';
                } else {
                    return 'queued';
                }
            })
            : null;

        $firstChatId =
            $groupedChats
                ?->first(fn(Collection $group) => $group->isNotEmpty())
                ?->first()->id ?? null;

        return $this->success([
            'groupedChats' => $groupedChats,
            'firstChatId' => $firstChatId,
        ]);
    }

    public function show(int $chatId)
    {
        $chat = Chat::with(['assignee'])->findOrFail($chatId);

        $this->authorize('show', $chat);

        $visitor = $chat->visitor;
        $visits = $visitor->getLatestVisits();

        return $this->success([
            'chat' => $chat,
            'visitor' => $visitor,
            'visits' => $visits,
        ]);
    }
}
