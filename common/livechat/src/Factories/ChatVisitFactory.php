<?php

namespace Livechat\Factories;

use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;
use Livechat\Models\ChatVisit;

class ChatVisitFactory extends Factory
{
    protected $model = ChatVisit::class;

    public function definition(): array
    {
        $data = $this->getData();

        $period = CarbonPeriod::create(now()->subHours(24), now());
        $date = Arr::random($period->toArray());

        return [
            'url' => $data['url'],
            'title' => $data['title'],
            'referrer' => $data['referrer'],
            'created_at' => $date,
            'ended_at' => $date->addSeconds(
                $this->faker->numberBetween(8, 300),
            ),
        ];
    }

    protected function getData(): array
    {
        $data = [
            [
                'url' => url('about'),
                'title' => 'About Us',
                'referrer' => url('/') . 'login',
            ],
            [
                'url' => url('contact'),
                'title' => 'Contact Us',
                'referrer' => url('/') . 'register',
            ],
            [
                'url' => url('pricing'),
                'title' => 'Pricing',
                'referrer' => url('/') . 'about',
            ],
            [
                'url' => url('features'),
                'title' => 'Features',
                'referrer' => url('/') . 'pricing',
            ],
            [
                'url' => url('blog'),
                'title' => 'Blog',
                'referrer' => url('/') . 'features',
            ],
            [
                'url' => url('faq'),
                'title' => 'FAQ',
                'referrer' => url('/') . 'blog',
            ],
            [
                'url' => url('terms'),
                'title' => 'Terms of Service',
                'referrer' => url('/') . 'faq',
            ],
            [
                'url' => url('privacy'),
                'title' => 'Privacy Policy',
                'referrer' => url('/') . 'terms',
            ],
            [
                'url' => url('login'),
                'title' => 'Login',
                'referrer' => url('/') . 'privacy',
            ],
            [
                'url' => url('register'),
                'title' => 'Register',
                'referrer' => url('/') . 'login',
            ],
        ];

        return $data[array_rand($data)];
    }
}
