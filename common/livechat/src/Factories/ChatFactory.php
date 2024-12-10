<?php

namespace Livechat\Factories;

use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;
use Livechat\Models\Chat;
use Livechat\Models\ChatVisitor;

class ChatFactory extends Factory
{
    protected $model = Chat::class;

    public function active(): Factory
    {
        $period = CarbonPeriod::create(now()->subMinutes(50), now());
        $date = Arr::random($period->toArray());
        return $this->state(
            fn(array $attributes) => [
                'status' => Chat::STATUS_ACTIVE,
                'created_at' => $date,
                'updated_at' => $date,
                'visitor_id' => ChatVisitor::factory([
                    'is_crawler' => false,
                    'last_active_at' => $date,
                ]),
            ],
        );
    }

    public function idle(): Factory
    {
        $period = CarbonPeriod::create(now()->subHours(2), now());
        $date = Arr::random($period->toArray());
        return $this->state(
            fn(array $attributes) => [
                'status' => Chat::STATUS_IDLE,
                'created_at' => $date,
                'updated_at' => $date,
                'visitor_id' => ChatVisitor::factory([
                    'is_crawler' => false,
                    'last_active_at' => $date,
                ]),
            ],
        );
    }

    public function queued(): Factory
    {
        $period = CarbonPeriod::create(now()->subHours(3), now());
        $date = Arr::random($period->toArray());
        return $this->state(
            fn(array $attributes) => [
                'status' => Chat::STATUS_QUEUED,
                'created_at' => $date,
                'updated_at' => $date,
                'visitor_id' => ChatVisitor::factory([
                    'is_crawler' => false,
                    'last_active_at' => $date,
                ]),
            ],
        );
    }

    public function unassigned(): Factory
    {
        $period = CarbonPeriod::create(now()->subHours(8), now());
        $date = Arr::random($period->toArray());
        return $this->state(
            fn(array $attributes) => [
                'status' => Chat::STATUS_UNASSIGNED,
                'created_at' => $date,
                'updated_at' => $date,
                'visitor_id' => ChatVisitor::factory([
                    'is_crawler' => false,
                    'last_active_at' => $date,
                ]),
            ],
        );
    }

    public function closed(): Factory
    {
        $period = CarbonPeriod::create(now()->subMonth(), now());
        $date = Arr::random($period->toArray());
        return $this->state(
            fn(array $attributes) => [
                'status' => Chat::STATUS_CLOSED,
                'created_at' => $date,
                'updated_at' => $date,
                'visitor_id' => ChatVisitor::factory([
                    'is_crawler' => false,
                    'last_active_at' => $date,
                ]),
            ],
        );
    }

    public function definition(): array
    {
        return [
            'status' => Chat::STATUS_CLOSED,
            'type' => Chat::MODEL_TYPE,
        ];
    }
}
