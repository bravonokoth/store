<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
    'api/*',
    'api/auth/register',
    'api/auth/login',
    'api/auth/logout',
    'api/admin/categories', // Exempt category creation
        'api/admin/categories/*', // Exempt category updates
        'api/admin/products', // Add other admin POST routes as needed
        'api/admin/products/*',
        'api/admin/coupons',
        'api/admin/banners',
        'api/admin/media',
];
}
