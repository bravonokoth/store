<?php

// app/Models/ShippingZone.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingZone extends Model
{
    protected $fillable = [
        'name', 'locations', 'rate',
    ];

    protected $casts = [
        'locations' => 'array',
    ];
}