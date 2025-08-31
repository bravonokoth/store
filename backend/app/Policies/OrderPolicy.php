<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrderPolicy
{
    use HandlesAuthorization;

    public function create(?User $user)
    {
        return true; // Allow guest or any authenticated user
    }

    public function view(User $user)
    {
        return $user->hasAnyRole(['admin', 'super-admin']);
    }
}