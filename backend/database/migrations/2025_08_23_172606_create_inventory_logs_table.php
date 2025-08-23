<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInventoryLogsTable extends Migration
{
    public function up()
    {
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('action')->comment('e.g., sale, purchase, adjustment');
            $table->integer('quantity_change')->comment('Positive for addition, negative for reduction');
            $table->integer('new_stock')->unsigned();

            // Explicitly define morphs with comments
            $table->unsignedBigInteger('source_id')->comment('ID of related model (Order, Purchase, etc.)');
            $table->string('source_type')->comment('Type of related model (Order, Purchase, etc.)');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory_logs');
    }
}
