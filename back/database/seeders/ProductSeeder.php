<?php

// database/seeders/ProductSeeder.php
namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run()
    {
        Product::create([
            'name' => 'Merlot 2023',
            'description' => 'A rich red wine with notes of cherry and plum.',
            'price' => 29.99,
            'category_id' => 1,
            'stock' => 100,
        ]);
        Product::create([
            'name' => 'Chardonnay 2022',
            'description' => 'Crisp white wine with citrus flavors.',
            'price' => 24.99,
            'category_id' => 2,
            'stock' => 80,
        ]);
    }
}