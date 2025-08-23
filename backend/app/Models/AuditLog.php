<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = ['user_id', 'action', 'model_type', 'model_id', 'changes'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}