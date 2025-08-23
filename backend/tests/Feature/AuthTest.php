<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase, WithoutMiddleware;

    public function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'user']);
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'super_admin']);
    }

    public function test_user_can_register_as_client()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['user', 'token'])
                 ->assertJsonFragment(['name' => 'John Doe']);

        $user = User::where('email', 'john@example.com')->first();
        $this->assertTrue($user->hasRole('user'));
    }

    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
        ]);
        $user->roles()->attach(Role::where('name', 'user')->first());

        $response = $this->postJson('/api/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['user', 'token']);
    }

    public function test_super_admin_can_access_users()
    {
        $superAdmin = User::factory()->create();
        $superAdmin->roles()->attach(Role::where('name', 'super_admin')->first());

        $response = $this->actingAs($superAdmin, 'sanctum')->getJson('/api/users');

        $response->assertStatus(200);
    }

    public function test_client_cannot_access_users()
    {
        $client = User::factory()->create();
        $userRole = Role::where('name', 'user')->first();
        $client->roles()->attach($userRole);

        // Debug: Verify role assignment
        $this->assertTrue($client->hasRole('user'), 'User role not assigned');
        $this->assertFalse($client->hasRole('super_admin'), 'User should not have super_admin role');

        $response = $this->actingAs($client, 'sanctum')->getJson('/api/users');

        // Debug: Log response content
        \Log::info('Response for client accessing users: ', $response->json());

        $response->assertStatus(403)
                 ->assertJson(['message' => 'Unauthorized']);
    }
}