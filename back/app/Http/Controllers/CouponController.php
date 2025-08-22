<?php

// app/Http/Controllers/CouponController.php
namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin|superadmin'])->only(['store']);
    }

    public function apply(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon || $coupon->isExpired()) {
            return response()->json(['message' => 'Invalid or expired coupon'], 400);
        }

        return response()->json(['discount' => $coupon->discount]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:coupons',
            'discount' => 'required|numeric|min:0',
            'expires_at' => 'nullable|date',
        ]);

        $coupon = Coupon::create($request->all());
        return response()->json($coupon, 201);
    }
}