<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'admin']);
    }

    public function test_admin_can_create_product_with_category()
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('name', 'admin')->first());
        $category = Category::create(['name' => 'Electronics']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/products', [
            'name' => 'Smartphone',
            'description' => 'A new smartphone',
            'price' => 599.99,
            'category_id' => $category->id,
            'stock' => 100,
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'Smartphone']);

        $this->assertDatabaseHas('products', [
            'name' => 'Smartphone',
            'category_id' => $category->id,
        ]);
    }

    public function test_product_creation_fails_without_category()
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('name', 'admin')->first());

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/products', [
            'name' => 'Smartphone',
            'description' => 'A new smartphone',
            'price' => 599.99,
            'stock' => 100,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors('category_id');
    }
}