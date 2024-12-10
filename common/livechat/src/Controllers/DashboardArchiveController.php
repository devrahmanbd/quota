<?php

namespace Livechat\Controllers;

use Common\Core\BaseController;
use Common\Database\Datasource\Datasource;
use Illuminate\Support\Str;
use Livechat\Models\Chat;

class DashboardArchiveController extends BaseController
{
    public function index()
    {
        $this->authorize('index', Chat::class);

        $builder = Chat::where('status', 'closed')->with([
            'lastMessage',
            'visitor' => fn($q) => $q->compact(),
        ]);

        $pagination = (new Datasource($builder, request()->all()))->paginate();

        $pagination->through(function ($chat) {
            if ($chat->last_message) {
                $chat->last_message->content = Str::limit(
                    $chat->last_message->content,
                    200,
                );
            }
            return $chat;
        });

        return $this->success([
            'pagination' => $pagination,
        ]);
    }
}
