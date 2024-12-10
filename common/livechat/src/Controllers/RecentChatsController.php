<?php

namespace Livechat\Controllers;

use Common\Core\BaseController;
use Illuminate\Support\Str;
use Livechat\Models\Chat;
use Livechat\Models\ChatVisitor;

class RecentChatsController extends BaseController
{
    public function __invoke(int $visitorId)
    {
        $this->authorize('index', Chat::class);

        $chats = ChatVisitor::findOrFail($visitorId)
            ->chats()
            ->with([
                'lastMessage' => fn($q) => $q->where('type', 'message'),
            ])
            ->get()
            ->map(function (Chat $chat) {
                if ($chat->lastMessage?->body) {
                    $chat->lastMessage->body = strip_tags(
                        $chat->lastMessage->body,
                    );
                    $chat->lastMessage->body = str_replace(
                        "\n",
                        ' ',
                        $chat->lastMessage->body,
                    );
                    $chat->lastMessage->body = Str::limit(
                        $chat->lastMessage->body,
                        120,
                    );
                }
                return $chat;
            });

        return $this->success([
            'chats' => $chats,
        ]);
    }
}
