<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminInventoryTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');
        $this->admin = User::whereEmail('admin@example.com')->first();
    }

    public function test_admin_can_create_inventory()
    {
        $category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category-' . time(),
            'description' => 'A test category',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Test Product',
            'slug' => 'test-product-' . time(),
            'description' => 'A test product',
            'price' => 99.99,
            'stock' => 10,
            'sku' => 'TEST' . time(),
            'is_active' => true,
        ]);

        $inventoryData = [
            'product_id' => $product->id,
            'quantity' => 5,
            'type' => 'restock',
            'notes' => 'Restocked product',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
                        ->postJson('/api/admin/inventory', $inventoryData);

        $response->assertStatus(201)
                 ->assertJsonFragment(['message' => 'Inventory created']);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 15, // 10 + 5
        ]);
    }
}