<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index()
    {
        return Coupon::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:coupons',
            'discount' => 'required|numeric|min:0|max:100',
            'expires_at' => 'nullable|date',
        ]);
        return Coupon::create($validated);
    }

    public function show(Coupon $coupon)
    {
        return $coupon;
    }

    public function update(Request $request, Coupon $coupon)
    {
        $validated = $request->validate([
            'code' => 'string|unique:coupons,code,' . $coupon->id,
            'discount' => 'numeric|min:0|max:100',
            'expires_at' => 'nullable|date',
        ]);
        $coupon->update($validated);
        return $coupon;
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();
        return response()->json(['message' => 'Coupon deleted']);
    }
}