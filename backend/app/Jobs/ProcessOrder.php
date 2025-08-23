<?php

namespace App\Jobs;
use App\Models\Order;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ProcessOrder implements ShouldQueue
{
    use Dispatchable, Queueable;

    protected $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function handle()
    {
        $this->order->update(['status' => 'processed']);
        $this->order->user->notify(new OrderStatusUpdated($this->order));
    }
}