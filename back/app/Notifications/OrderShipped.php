<?php

// app/Notifications/OrderShipped.php
namespace App\Notifications;

use App\Models\Order;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class OrderShipped extends Notification
{
    protected $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->line('Your order has been delivered.')
            ->line('Order ID: ' . $this->order->id)
            ->line('Tracking ID: ' . $this->order->tracking_id)
            ->action('Track Order', url('/track/' . $this->order->id));
    }
}