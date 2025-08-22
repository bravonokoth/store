<?php

// app/Models/Banner.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Banner extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'title', 'image_url', 'link',
    ];
}