<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Create roles
        $superAdminRole = Role::create(['name' => 'super_admin']);
        $adminRole = Role::create(['name' => 'admin']);
        $userRole = Role::create(['name' => 'user']);

        // Create permissions
        $permissions = [
            'manage_users', 'manage_products', 'manage_orders', 'manage_coupons',
            'manage_blogs', 'manage_media', 'view_analytics', 'manage_roles'
        ];

        foreach ($permissions as $perm) {
            Permission::create(['name' => $perm]);
        }

        // Attach permissions to roles
        $superAdminRole->permissions()->attach(Permission::all());
        $adminRole->permissions()->attach(
            Permission::whereIn('name', [
                'manage_products', 'manage_orders', 'manage_coupons',
                'manage_blogs', 'manage_media', 'view_analytics'
            ])->get()
        );
        $userRole->permissions()->attach([]); // basic user has no special permissions
    }
}
