<?php

namespace Livechat\Models;

use Helpdesk\Models\Conversation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Livechat\Factories\ChatFactory;

class Chat extends Conversation
{
    use HasFactory;

    const MODEL_TYPE = 'chat';

    // agent is actively chatting with visitor
    const STATUS_ACTIVE = 'active';
    // agent is chatting with visitor, but visitor is not responding for some time
    const STATUS_IDLE = 'idle';
    // chat is closed and archived
    const STATUS_CLOSED = 'closed';
    // all agents are busy or auto assigning is disabled, waiting for agent to pick chat from queue
    const STATUS_QUEUED = 'queued';
    // chat was started while no agents were online or from different channel then chat widget
    const STATUS_UNASSIGNED = 'unassigned';

    const EVENT_VISITOR_STARTED_CHAT = 'visitor.startedChat';
    const EVENT_CLOSED_INACTIVITY = 'closed.inactivity';
    const EVENT_CLOSED_BY_AGENT = 'closed.byAgent';
    const EVENT_VISITOR_IDLE = 'visitor.idle';
    const EVENT_VISITOR_LEFT_CHAT = 'visitor.leftChat';
    const EVENT_AGENT_LEFT_CHAT = 'agent.leftChat';
    const EVENT_AGENT_REASSIGNED = 'agent.reassigned';

    protected $hidden = ['last_message_id', 'subject', 'received_at_email'];

    protected $attributes = [
        'type' => self::MODEL_TYPE,
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function lastMessage(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class, 'last_item_id')->where(
            'type',
            'message',
        );
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(ChatVisitor::class, 'visitor_id');
    }

    public function visits(): HasMany
    {
        return $this->hasMany(ChatVisit::class);
    }

    public function truncateLastMessage(): static
    {
        if (
            $this->exists() &&
            $this->relationLoaded('lastMessage') &&
            $this->last_message
        ) {
            $this->last_message->content = Str::limit(
                $this->last_message->content,
                200,
            );
        }
        return $this;
    }

    public function createEvent(string $name, array $data = []): ChatMessage
    {
        $data['name'] = $name;
        return $this->createMessage([
            'type' => 'event',
            'body' => $data,
            'author' => 'system',
        ]);
    }

    public function createMessage(array $data): ChatMessage
    {
        $message = $this->messages()->create([
            'body' => $data['body'],
            'type' => $data['type'] ?? 'message',
            'author' => $data['author'] ?? 'visitor',
            // todo: set user id for initial message to the agent that new chat is assigned to
            'user_id' => $data['userId'] ?? Auth::id(),
        ]);

        if (isset($data['fileEntryIds'])) {
            $message->attachments()->attach($data['fileEntryIds']);
        }

        return $message;
    }

    protected static function newFactory(): Factory
    {
        return ChatFactory::new();
    }

    public static function getModelTypeAttribute(): string
    {
        return self::MODEL_TYPE;
    }
}
