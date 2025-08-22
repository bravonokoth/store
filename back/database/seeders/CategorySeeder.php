<?php

// database/seeders/CategorySeeder.php
namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        Category::create(['name' => 'Red Wine', 'type' => 'product']);
        Category::create(['name' => 'White Wine', 'type' => 'product']);
        Category::create(['name' => 'Spirits', 'type' => 'product']);
        Category::create(['name' => 'Wine News', 'type' => 'blog']);
        Category::create(['name' => 'Promotions', 'type' => 'blog']);
    }
}