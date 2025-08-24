<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Media;
use App\Models\Order;
use App\Models\Product;
use App\Policies\CategoryPolicy;
use App\Policies\CouponPolicy;
use App\Policies\MediaPolicy;
use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Category::class => CategoryPolicy::class,
        Product::class => ProductPolicy::class,
        Order::class => OrderPolicy::class,
        Media::class => MediaPolicy::class,
        Coupon::class => CouponPolicy::class,
    ];

    public function boot()
    {
        $this->registerPolicies();
    }
}