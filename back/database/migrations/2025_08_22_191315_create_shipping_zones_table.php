<?php

// database/migrations/2025_08_22_000009_create_shipping_zones_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShippingZonesTable extends Migration
{
    public function up()
    {
        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('locations');
            $table->decimal('rate', 8, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('shipping_zones');
    }
}
