<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'price',
        'discount_price', 'stock', 'sku', 'seo_title', 'seo_description', 'is_active'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function media()
    {
        return $this->morphMany(Media::class, 'model');
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class);
    }

    public function purchases()
{
    return $this->hasMany(Purchase::class);
}
    
}