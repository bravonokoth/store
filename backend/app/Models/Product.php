<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name', 'description', 'price', 'category_id', 'stock'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function media()
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}