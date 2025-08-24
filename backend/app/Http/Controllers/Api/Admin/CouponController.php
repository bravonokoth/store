<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', Coupon::class);

        $validated = $request->validate([
            'code' => 'required|string|unique:coupons',
            'discount' => 'required|numeric|min:0|max:100',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $coupon = Coupon::create($validated);
        return response()->json(['message' => 'Coupon created', 'coupon' => $coupon], 201);
    }
}