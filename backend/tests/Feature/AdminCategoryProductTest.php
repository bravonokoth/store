<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCategoryProductTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed');

        $this->admin = User::whereEmail('admin@example.com')->first();
    }

    public function test_admin_can_create_category_and_product()
    {
        $categoryData = [
            'name' => 'Test Category',
            'slug' => 'test-category',
            'description' => 'A test category',
        ];

        $categoryResponse = $this->actingAs($this->admin, 'sanctum')
                                ->postJson('/api/admin/categories', $categoryData);

        $categoryResponse->assertStatus(201)
                        ->assertJsonFragment(['message' => 'Category created']);

        $categoryId = $categoryResponse->json('category.id');

        $productData = [
            'category_id' => $categoryId,
            'name' => 'Test Product',
            'slug' => 'test-product',
            'description' => 'A test product',
            'price' => 99.99,
            'stock' => 10,
            'sku' => 'TEST123',
            'is_active' => true,
        ];

        $productResponse = $this->actingAs($this->admin, 'sanctum')
                                ->postJson('/api/admin/products', $productData);

        $productResponse->assertStatus(201)
                        ->assertJsonFragment(['message' => 'Product created'])
                        ->assertJsonFragment(['category_id' => $categoryId]);
    }
}