<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Banner;
use App\Models\Inventory;
use App\Models\Purchase;
use App\Models\Media;
use App\Models\Order;
use App\Models\Product;
use App\Models\Notification;
use App\Policies\CategoryPolicy;
use App\Policies\CouponPolicy;
use App\Policies\InventoryPolicy;
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
        Inventory::class => InventoryPolicy::class,
        Purchase::class => PurchasePolicy::class,
        Banner::class => BannerPolicy::class,
        CartItem::class => CartItemPolicy::class,
        Notification::class => NotificationPolicy::class,
    ];

    public function boot()
    {
        $this->registerPolicies();
    }
}