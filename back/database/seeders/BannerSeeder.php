<?php

// database/seeders/BannerSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Banner;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        Banner::create([
            'title' => 'Welcome Banner',
            'image_url' => 'https://example.com/images/welcome.jpg',
            'link' => '/shop',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Banner::create([
            'title' => 'Sale Banner',
            'image_url' => 'https://example.com/images/sale.jpg',
            'link' => '/sale',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}