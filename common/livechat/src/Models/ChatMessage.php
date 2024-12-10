<?php

namespace Livechat\Models;

use Helpdesk\Models\ConversationItem;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends ConversationItem
{
    const MODEL_TYPE = 'chatMessage';

    public static function getModelTypeAttribute(): string
    {
        return self::MODEL_TYPE;
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    protected function body(): Attribute
    {
        return Attribute::make(
            get: function (string $value) {
                if ($this->type === 'event') {
                    return json_decode($value, true);
                }
                return $value;
            },
            set: function ($value) {
                if (is_array($value)) {
                    return json_encode($value);
                }
                return $value;
            },
        );
    }
}
