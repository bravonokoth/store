<?php

// database/seeders/ShippingZoneSeeder.php
namespace Database\Seeders;

use App\Models\ShippingZone;
use Illuminate\Database\Seeder;

class ShippingZoneSeeder extends Seeder
{
    public function run()
    {
        ShippingZone::create([
            'name' => 'North America',
            'locations' => ['US', 'CA'],
            'rate' => 10.00,
        ]);
        ShippingZone::create([
            'name' => 'Europe',
            'locations' => ['UK', 'FR', 'DE'],
            'rate' => 15.00,
        ]);
    }
}