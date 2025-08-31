<?php

namespace App\Policies;

use App\Models\CartItem;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CartItemPolicy
{
    use HandlesAuthorization;

  public function create(?User $user)
    {
        return true; // Allow guest or any authenticated user
    }

    public function view(User $user)
    {
        return $user->hasAnyRole(['client']);
    }
}