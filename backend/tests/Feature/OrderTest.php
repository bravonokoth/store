<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Product;
use App\Models\Category;
use App\Models\Cart;
use App\Models\Coupon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'user']);
    }

    public function test_user_can_place_order_with_coupon()
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('name', 'user')->first());
        $category = Category::create(['name' => 'Electronics']);
        $product = Product::create([
            'name' => 'Smartphone',
            'price' => 100,
            'category_id' => $category->id,
            'stock' => 10,
        ]);
        Cart::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
        $coupon = Coupon::create([
            'code' => 'SAVE10',
            'discount' => 10,
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/orders', [
            'coupon_code' => 'SAVE10',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'total' => 180, // 200 * (1 - 10/100)
        ]);
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 8, // 10 - 2
        ]);
        $this->assertDatabaseCount('carts', 0);
    }

    public function test_order_fails_with_invalid_coupon()
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('name', 'user')->first());
        $category = Category::create(['name' => 'Electronics']);
        $product = Product::create([
            'name' => 'Smartphone',
            'price' => 100,
            'category_id' => $category->id,
            'stock' => 10,
        ]);
        Cart::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/orders', [
            'coupon_code' => 'INVALID',
        ]);

        $response->assertStatus(400)
                 ->assertJson(['message' => 'Invalid or expired coupon']);
    }
}