<?php

// app/Models/Coupon.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'discount', 'expires_at',
    ];

    protected $dates = ['expires_at'];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}