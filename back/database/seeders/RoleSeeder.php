<?php


// database/seeders/RoleSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run()
    {
        Role::create(['name' => 'superadmin']);
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'client']);

        $permissions = [
            'manage-users', 'manage-products', 'manage-orders', 'manage-reviews',
            'manage-posts', 'manage-coupons', 'manage-shipping', 'manage-banners',
            'view-analytics',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        $superadmin = Role::findByName('superadmin');
        $superadmin->syncPermissions($permissions);

        $admin = Role::findByName('admin');
        $admin->syncPermissions([
            'manage-products', 'manage-orders', 'manage-reviews',
            'manage-posts', 'manage-coupons', 'manage-shipping', 'manage-banners',
            'view-analytics',
        ]);
    }
}