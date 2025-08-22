<?php

// database/migrations/2025_08_22_000004_create_orders_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrdersTable extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('subtotal', 8, 2);
            $table->decimal('shipping_cost', 8, 2)->default(0);
            $table->decimal('total', 8, 2);
            $table->string('status')->default('pending'); // pending, processing, shipped, delivered, cancelled
            $table->string('payment_method'); // card, cod
            $table->string('tracking_id')->nullable();
            $table->string('shipping_status')->nullable(); // processing, shipped, delivered
            $table->json('shipping_address');
            $table->foreignId('coupon_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
}