<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Database\Seeders\RoleSeeder;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    /** @test */
    public function client_can_register_login_and_get_profile()
    {
        // 1. Register
        $registerResponse = $this->postJson('/api/auth/register', [
            'name' => 'Test Client',
            'email' => 'client@example.com',
            'password' => 'password1',
            'password_confirmation' => 'password1',
        ]);

        $registerResponse->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email'],
                'message'
            ]);

        $this->assertDatabaseHas('users', ['email' => 'client@example.com']);

        // 2. Login
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'client@example.com',
            'password' => 'password1',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'role'
            ]);

        $token = $loginResponse->json('access_token');
        $this->assertNotEmpty($token);

        // 3. Profile
        $profileResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/profile');

        $profileResponse->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'email',
                'roles'
            ])
            ->assertJson([
                'email' => 'client@example.com',
            ]);
    }
}
