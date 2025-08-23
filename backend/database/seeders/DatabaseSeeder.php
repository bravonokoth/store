<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call other seeders here
        $this->call([
            RoleSeeder::class, // Call the RoleSeeder
            UserSeeder::class, // Call the newly provided UserSeeder
        ]);
    }
}