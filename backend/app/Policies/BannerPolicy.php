<?php

namespace App\Policies;

use App\Models\Banner;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class BannerPolicy
{
    use HandlesAuthorization;

    public function create(User $user)
    {
        return $user->hasAnyRole(['admin', 'super-admin']);
    }
}