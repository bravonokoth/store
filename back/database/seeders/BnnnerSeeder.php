<?php

// database/seeders/BannerSeeder.php
namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run()
    {
        Banner::create([
            'title' => 'Summer Wine Sale',
            'image_url' => 'banners/summer_sale.jpg',
            'link' => '/products',
        ]);
    }
}