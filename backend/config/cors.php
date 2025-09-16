<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*', 'storage/categories/*', 'storage/products/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173', 'https://store-one-olive.vercel.app'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // Changed to true for Sanctum
];
