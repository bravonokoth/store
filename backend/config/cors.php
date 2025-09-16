<?php

return [
  'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*', 'storage/categories/*', 'storage/products/*'],
  'allowed_methods' => ['*'],
  'allowed_origins' => ['http://localhost:5173', 'https://store-one-olive.vercel.app', 'https://fa13d254efe6.ngrok-free.app'],
  'allowed_origins_patterns' => [],
  'allowed_headers' => ['Content-Type', 'Authorization', 'X-XSRF-TOKEN', 'ngrok-skip-browser-warning'],
  'exposed_headers' => [],
  'max_age' => 0,
  'supports_credentials' => true,
];
