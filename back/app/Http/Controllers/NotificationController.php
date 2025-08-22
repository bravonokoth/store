<?php

// app/Http/Controllers/NotificationController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin|superadmin']);
    }

    public function index(Request $request)
    {
        return response()->json($request->user()->notifications);
    }
}