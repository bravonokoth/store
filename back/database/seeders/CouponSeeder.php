<?php

// database/seeders/CouponSeeder.php
namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run()
    {
        Coupon::create([
            'code' => 'SAVE10',
            'discount' => 10.00,
            'expires_at' => now()->addMonth(),
        ]);
    }
}