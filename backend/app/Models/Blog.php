<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $fillable = ['title', 'content', 'blog_category_id', 'user_id'];

    public function blogCategory()
    {
        return $this->belongsTo(BlogCategory::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}