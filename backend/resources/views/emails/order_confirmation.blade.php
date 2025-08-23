<!DOCTYPE html>

<html>
<head>
    <title>Order Confirmation</title>
</head>
<body>   

<h1>Order Confirmation</h1>
<p>Thank you for your order #{{ $order->id }}!</p>
<p>Total: ${{ $order->total }}</p>
</body>

</html>

