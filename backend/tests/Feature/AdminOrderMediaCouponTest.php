<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrderMediaCouponTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed');

        $this->admin = User::whereEmail('admin@example.com')->first();
    }

    public function test_admin_can_create_order_media_coupon()
    {
        // Create category and product for order and media
        $category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
            'description' => 'A test category',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Test Product',
            'slug' => 'test-product',
            'description' => 'A test product',
            'price' => 99.99,
            'stock' => 10,
            'sku' => 'TEST123',
            'is_active' => true,
        ]);

        // Step 1: Admin creates an order
        $orderData = [
            'user_id' => $this->admin->id,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ];

        $orderResponse = $this->actingAs($this->admin, 'sanctum')
                             ->postJson('/api/admin/orders', $orderData);

        $orderResponse->assertStatus(201)
                      ->assertJsonFragment(['message' => 'Order created']);

        $orderId = $orderResponse->json('order.id');

        // Step 2: Admin creates media for the product
        $mediaData = [
            'model_type' => 'App\Models\Product',
            'model_id' => $product->id,
            'path' => 'images/test-product.jpg',
            'type' => 'image',
        ];

        $mediaResponse = $this->actingAs($this->admin, 'sanctum')
                             ->postJson('/api/admin/media', $mediaData);

        $mediaResponse->assertStatus(201)
                      ->assertJsonFragment(['message' => 'Media created']);

        // Step 3: Admin creates a coupon
        $couponData = [
            'code' => 'SAVE10',
            'discount' => 10.00,
            'expires_at' => now()->addDays(30)->toDateString(),
            'is_active' => true,
        ];

        $couponResponse = $this->actingAs($this->admin, 'sanctum')
                              ->postJson('/api/admin/coupons', $couponData);

        $couponResponse->assertStatus(201)
                       ->assertJsonFragment(['message' => 'Coupon created']);
    }
}