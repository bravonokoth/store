<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class BlogCategory extends Model
{
    protected $fillable = ['name'];

    public function blogs()
    {
        return $this->hasMany(Blog::class);
    }
}