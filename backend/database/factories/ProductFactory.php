<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition()
    {
        $name = $this->faker->word;
        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name),
            'description' => $this->faker->paragraph,
            'price' => $this->faker->randomFloat(2, 10, 1000),
            'discount_price' => $this->faker->optional()->randomFloat(2, 5, 900),
            'stock' => $this->faker->numberBetween(0, 100),
            'sku' => $this->faker->unique()->uuid,
            'seo_title' => $this->faker->sentence,
            'seo_description' => $this->faker->sentence,
            'is_active' => $this->faker->boolean(80),
        ];
    }
}