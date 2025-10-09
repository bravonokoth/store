import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../store/cartSlice';
import { Trash2, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

const CartPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, total, itemCount, isLoading, error } = useSelector((state: RootState) => state.cart);
  const sessionId = localStorage.getItem('sessionId') || undefined;

  useEffect(() => {
    dispatch(fetchCart({ sessionId }));
  }, [dispatch, sessionId]);

  const handleUpdateQuantity = useCallback(
    debounce(async (id: string, quantity: number) => {
      if (quantity < 1) return;
      try {
        await dispatch(updateCartItem({ id, quantity, sessionId })).unwrap();
        toast.success('Cart updated');
      } catch (err: any) {
        toast.error(err.message || 'Failed to update cart');
      }
    }, 500),
    [dispatch, sessionId]
  );

  const handleRemoveItem = useCallback(
    debounce(async (id: string) => {
      try {
        await dispatch(removeFromCart({ id, sessionId })).unwrap();
        toast.success('Item removed');
      } catch (err: any) {
        toast.error(err.message || 'Failed to remove item');
      }
    }, 500),
    [dispatch, sessionId]
  );

  const handleClearCart = useCallback(async () => {
    try {
      await dispatch(clearCart({ sessionId })).unwrap();
      toast.success('Cart cleared');
    } catch (err: any) {
      toast.error(err.message || 'Failed to clear cart');
    }
  }, [dispatch, sessionId]);

  if (isLoading) {
    return <div className="container mx-auto py-8 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-red-400">{error}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <button
          onClick={() => navigate('/products')}
          className="bg-gradient-to-r from-purple-600 to-red-600 text-white font-semibold py-3 px-8 rounded-xl"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-8">Your Cart ({itemCount} items)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg mb-4">
                  <img
                    src={item.product.image || 'https://via.placeholder.com/150'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{item.product.name}</h3>
                    <p className="text-gray-400">Ksh {item.product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-2 bg-gray-700 rounded-full text-white"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-white">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-2 bg-gray-700 rounded-full text-white"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleClearCart}
                className="text-red-400 hover:text-red-300 font-semibold"
              >
                Clear Cart
              </button>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>Ksh {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span className={total > 1000 ? 'text-green-400' : 'text-gray-300'}>
                    {total > 1000 ? 'Free' : 'Ksh 50.00'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>Ksh {(total * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white border-t border-gray-700 pt-3">
                  <span>Total</span>
                  <span>Ksh {(total + total * 0.08 + (total > 1000 ? 0 : 50)).toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-semibold py-3 rounded-xl"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;