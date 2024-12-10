<?php

namespace Livechat\Controllers;

use App\Models\User;
use Common\Core\BaseController;
use Common\Database\Datasource\Datasource;
use Illuminate\Support\Facades\DB;
use Livechat\Models\Chat;
use Livechat\Models\ChatVisitor;

class ChatVisitorsController extends BaseController
{
    public function index()
    {
        $this->authorize('index', User::class);

        DB::enableQueryLog();

        $s = [
            Chat::STATUS_ACTIVE,
            Chat::STATUS_IDLE,
            Chat::STATUS_QUEUED,
            Chat::STATUS_UNASSIGNED,
            Chat::STATUS_CLOSED,
        ];

        // todo: for tabs counts can count conversations table directly, no need for joins
        // todo: finish up demo seeder, agents, groups, assigned_to, group_id etc, visits etc
        // todo: will need to materialize visit count and time on all pages

        $params = request()->all();
        $params['paginate'] = 'simple';
        if (!isset($params['orderBy'])) {
            $params['orderBy'] = 'last_active_at';
            $params['orderDir'] = 'desc';
        }

        $builder = ChatVisitor::query()
            //->whereBetween('last_active_at', [now()->subHour(), now()])
            ->with(['user', 'assignee'])
            ->select(
                'chat_visitors.*',
                'conversations.status as status',
                'conversations.assigned_to as assigned_to',
                'conversations.group_id as group_id',
                'conversations.id as active_chat_id',
                DB::raw(
                    'SUM(TIMESTAMPDIFF(SECOND, chat_visits.created_at, IFNULL(chat_visits.ended_at, NOW())) * 1000) as time_on_all_pages',
                ),
                DB::raw('COUNT(chat_visits.id) as total_visits'),
            )
            ->where('is_crawler', false)
            // join with conversations that are not closed
            ->leftJoin('conversations', function ($join) use ($s) {
                $prefix = DB::getTablePrefix();
                $join
                    ->on('conversations.visitor_id', '=', 'chat_visitors.id')
                    ->where('conversations.status', '!=', 'closed')
                    ->orderByRaw(
                        "FIELD(status, '$s[0]', '$s[1]', '$s[2]', '$s[3]', '$s[4]') asc, {$prefix}conversations.updated_at desc",
                    );
            })
            ->leftJoin(
                'chat_visits',
                'chat_visitors.id',
                '=',
                'chat_visits.visitor_id',
            )
            ->groupBy('chat_visitors.id')
            ->groupBy('conversations.id');

        $datasource = new Datasource(
            $builder,
            $params,
            qualifySortColumns: false,
        );

        $pagination = $datasource->paginate();

        $pagination->setCollection(
            $pagination
                ->getCollection()
                ->makeUsersCompactWithEmail()
                ->reverse()
                ->values(),
        );

        return $this->success(['pagination' => $pagination]);
    }

    public function show(int $id)
    {
        $this->authorize('index', User::class);

        $visitor = ChatVisitor::findOrFail($id);
        $visits = $visitor->getLatestVisits();

        return $this->success(['visitor' => $visitor, 'visits' => $visits]);
    }
}
