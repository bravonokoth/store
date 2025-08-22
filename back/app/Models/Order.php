<?php

// app/Models/Order.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'subtotal', 'shipping_cost', 'total', 'status',
        'payment_method', 'tracking_id', 'shipping_status', 'shipping_address', 'coupon_id',
    ];

    protected $casts = [
        'shipping_address' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }
}