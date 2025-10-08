<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->header('Origin');
        $allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://store-one-olive.vercel.app'
        ];
        
        $allowOrigin = in_array($origin, $allowedOrigins) ? $origin : 'https://store-one-olive.vercel.app';
        
        return $next($request)
            ->header('Access-Control-Allow-Origin', $allowOrigin)
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN, ngrok-skip-browser-warning')
            ->header('Access-Control-Allow-Credentials', 'true');
    }
}