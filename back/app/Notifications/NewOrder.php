<?php

// app/Notifications/NewOrder.php
namespace App\Notifications;

use App\Models\Order;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class NewOrder extends Notification
{
    protected $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->line('A new order has been placed.')
            ->line('Order ID: ' . $this->order->id)
            ->action('View Order', url('/admin/orders/' . $this->order->id));
    }

    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'message' => 'New order placed: #' . $this->order->id,
        ];
    }
}