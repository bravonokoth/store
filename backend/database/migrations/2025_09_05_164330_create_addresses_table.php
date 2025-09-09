<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('session_id')->nullable(); // for guest checkout
            $table->string('type')->default('shipping'); // shipping or billing
            $table->string('line1');
            $table->string('line2')->nullable();
            $table->string('city');
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country');
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('session_id')->nullable()->after('user_id');
            $table->foreignId('shipping_address_id')->nullable()->constrained('addresses')->onDelete('set null');
            $table->foreignId('billing_address_id')->nullable()->constrained('addresses')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('shipping_address_id');
            $table->dropConstrainedForeignId('billing_address_id');
            $table->dropColumn('session_id');
        });

        Schema::dropIfExists('addresses');
    }
};
