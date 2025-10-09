import React, { useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store/store';
import { fetchCart, clearCart, updateCartItem, removeFromCart } from '../../store/cartSlice';
import { checkoutAPI, orderAPI, addressAPI } from '../../services/api';
import { Check, MapPin, Package, Shield, Truck, Trash2, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, Transition } from '@headlessui/react';
import validator from 'validator';
import debounce from 'lodash.debounce';

// Update the Address interface to match the backend API and api.ts
interface Address {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  line1: string;
  line2?: string; // Made optional to match api.ts
  city: string;
  state: string;
  postal_code?: string; // Made optional to match api.ts
  country?: string; // Made optional to match api.ts
  type?: 'shipping' | 'billing';
}

export const Checkout: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [tempAddress, setTempAddress] = useState<Partial<Address>>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    line1: '',
    line2: '',
    city: 'Nairobi',
    state: 'Nairobi',
    postal_code: '',
    country: 'Kenya',
  });
  const [shippingAddress, setShippingAddress] = useState<Address>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    line1: '',
    line2: '',
    city: 'Nairobi',
    state: 'Nairobi',
    postal_code: '',
    country: 'Kenya',
  });
  const [billingAddress, setBillingAddress] = useState<Address>({ ...shippingAddress });
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items: cartItems, total, isLoading, error } = useSelector((state: RootState) => state.cart);

  const addDebugInfo = useCallback((info: string) => {
    console.log('DEBUG:', info);
    setDebugInfo((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${info}`]);
  }, []);

  const orderCalculations = useMemo(() => {
    addDebugInfo(`Calculating totals - Cart total: ${total}, Items count: ${cartItems.length}`);
    const tax = total * 0.08;
    const shipping = total > 1000 ? 0 : 50;
    const finalTotal = total + tax + shipping;
    addDebugInfo(`Final calculations - Tax: ${tax}, Shipping: ${shipping}, Total: ${finalTotal}`);
    return { tax, shipping, finalTotal };
  }, [total, cartItems.length, addDebugInfo]);

  const validateForm = useCallback(() => {
    const isValidEmail = validator.isEmail(shippingAddress.email);
    const isValidPhone = validator.isMobilePhone(shippingAddress.phone_number, 'any');
    const isValid =
      shippingAddress.first_name &&
      shippingAddress.last_name &&
      isValidEmail &&
      isValidPhone &&
      shippingAddress.line1 &&
      shippingAddress.city &&
      shippingAddress.state &&
      (!sameBillingAddress
        ? billingAddress.first_name &&
          billingAddress.last_name &&
          validator.isEmail(billingAddress.email) &&
          validator.isMobilePhone(billingAddress.phone_number, 'any') &&
          billingAddress.line1 &&
          billingAddress.city &&
          billingAddress.state
        : true);
    addDebugInfo(`Form validation: ${isValid}`);
    return isValid;
  }, [shippingAddress, billingAddress, sameBillingAddress, addDebugInfo]);

  useEffect(() => {
    const initializeCheckout = async () => {
      // Ensure sessionId is always a string for guest users
      let sessionId: string = isAuthenticated ? '' : (localStorage.getItem('sessionId') || uuidv4());
      if (!isAuthenticated && !localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', sessionId);
        addDebugInfo(`Created new session ID: ${sessionId}`);
      }

      if (!isInitialized) {
        addDebugInfo('Fetching checkout data...');
        try {
          // Pass sessionId only for guest users
          await dispatch(fetchCart({ sessionId: isAuthenticated ? undefined : sessionId })).unwrap();
          const response = await checkoutAPI.getCheckoutData(isAuthenticated ? undefined : sessionId);
          addDebugInfo(`Checkout API response: ${JSON.stringify(response.data)}`);
          const { addresses } = response.data;
          if (addresses.length > 0) {
            const defaultAddress = addresses.find((addr: any) => addr.type === 'shipping') || addresses[0];
            setShippingAddress({
              first_name: defaultAddress.first_name || user?.name?.split(' ')[0] || '',
              last_name: defaultAddress.last_name || user?.name?.split(' ')[1] || '',
              email: defaultAddress.email || user?.email || '',
              phone_number: defaultAddress.phone_number || user?.phone || '',
              line1: defaultAddress.line1 || '',
              line2: defaultAddress.line2 || '',
              city: defaultAddress.city || 'Nairobi',
              state: defaultAddress.state || 'Nairobi',
              postal_code: defaultAddress.postal_code || '',
              country: defaultAddress.country || 'Kenya',
            });
            if (sameBillingAddress) {
              setBillingAddress({
                first_name: defaultAddress.first_name || user?.name?.split(' ')[0] || '',
                last_name: defaultAddress.last_name || user?.name?.split(' ')[1] || '',
                email: defaultAddress.email || user?.email || '',
                phone_number: defaultAddress.phone_number || user?.phone || '',
                line1: defaultAddress.line1 || '',
                line2: defaultAddress.line2 || '',
                city: defaultAddress.city || 'Nairobi',
                state: defaultAddress.state || 'Nairobi',
                postal_code: defaultAddress.postal_code || '',
                country: defaultAddress.country || 'Kenya',
              });
            }
          }
          addDebugInfo('Checkout data fetched successfully');
          setIsInitialized(true);
        } catch (err: any) {
          addDebugInfo(`Checkout data fetch failed: ${err.message}`);
          if (err.message?.includes('Cart is empty')) {
            toast.error('Your cart is empty. Please add items to proceed.');
            navigate('/products');
          } else {
            toast.error(err.message || 'Failed to load checkout data');
          }
        }
      }
    };

    initializeCheckout();
  }, [isAuthenticated, user, sameBillingAddress, isInitialized, addDebugInfo, dispatch, navigate]);

  useEffect(() => {
    if (isInitialized && cartItems.length === 0 && !isLoading && !error) {
      addDebugInfo('Cart is empty, redirecting...');
      toast.error('Your cart is empty. Please add items to proceed.');
      navigate('/products');
    }
  }, [isInitialized, cartItems.length, isLoading, error, navigate, addDebugInfo]);

  const handleRemoveItem = useCallback(
    debounce(async (id: string) => {
      addDebugInfo(`Removing item: ${id}`);
      try {
        const sessionId = isAuthenticated ? undefined : localStorage.getItem('sessionId') || uuidv4();
        await dispatch(removeFromCart({ id, sessionId })).unwrap();
        toast.success('Item removed from cart');
        addDebugInfo('Item removed successfully');
      } catch (err: any) {
        addDebugInfo(`Failed to remove item: ${err.message}`);
        toast.error(err.message?.includes('Insufficient stock') ? 'Out of stock' : 'Failed to remove item');
      }
    }, 500),
    [dispatch, isAuthenticated, addDebugInfo]
  );

  const handleUpdateQuantity = useCallback(
    debounce(async (id: string, quantity: number) => {
      if (quantity < 1) return;
      addDebugInfo(`Updating quantity for ${id} to ${quantity}`);
      try {
        const sessionId = isAuthenticated ? undefined : localStorage.getItem('sessionId') || uuidv4();
        await dispatch(updateCartItem({ id, quantity, sessionId })).unwrap();
        toast.success('Cart updated');
        addDebugInfo('Quantity updated successfully');
      } catch (err: any) {
        addDebugInfo(`Failed to update quantity: ${err.message}`);
        toast.error(err.message?.includes('Insufficient stock') ? 'Out of stock' : 'Failed to update cart');
      }
    }, 500),
    [dispatch, isAuthenticated, addDebugInfo]
  );

  const handleModalSubmit = useCallback(async () => {
    if (!tempAddress.first_name || !tempAddress.last_name || !tempAddress.email || !tempAddress.phone_number || !tempAddress.line1) {
      toast.error('Please fill in all required address fields');
      return;
    }
    if (!validator.isEmail(tempAddress.email)) {
      toast.error('Please enter a valid email');
      return;
    }
    if (!validator.isMobilePhone(tempAddress.phone_number, 'any')) {
      toast.error('Please enter a valid phone number');
      return;
    }

    const updatedAddress: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code?: string;
      country?: string;
      type: 'shipping' | 'billing';
      sessionId?: string;
    } = {
      first_name: tempAddress.first_name,
      last_name: tempAddress.last_name,
      email: tempAddress.email,
      phone_number: tempAddress.phone_number,
      line1: tempAddress.line1 || '',
      line2: tempAddress.line2 || undefined,
      city: tempAddress.city || 'Nairobi',
      state: tempAddress.state || 'Nairobi',
      postal_code: tempAddress.postal_code || undefined,
      country: 'Kenya',
      type: sameBillingAddress ? 'shipping' : 'billing',
      sessionId: isAuthenticated ? undefined : localStorage.getItem('sessionId') || uuidv4(),
    };

    try {
      addDebugInfo(`Sending address: ${JSON.stringify(updatedAddress)}`);
      await addressAPI.createAddress(updatedAddress);
      setShippingAddress({
        first_name: updatedAddress.first_name,
        last_name: updatedAddress.last_name,
        email: updatedAddress.email,
        phone_number: updatedAddress.phone_number,
        line1: updatedAddress.line1,
        line2: updatedAddress.line2 || '',
        city: updatedAddress.city,
        state: updatedAddress.state,
        postal_code: updatedAddress.postal_code || '',
        country: updatedAddress.country || 'Kenya',
      });
      if (sameBillingAddress) {
        setBillingAddress({
          first_name: updatedAddress.first_name,
          last_name: updatedAddress.last_name,
          email: updatedAddress.email,
          phone_number: updatedAddress.phone_number,
          line1: updatedAddress.line1,
          line2: updatedAddress.line2 || '',
          city: updatedAddress.city,
          state: updatedAddress.state,
          postal_code: updatedAddress.postal_code || '',
          country: updatedAddress.country || 'Kenya',
        });
      }
      setIsModalOpen(false);
      addDebugInfo('Address saved successfully');
      toast.success('Address saved');
    } catch (err: any) {
      addDebugInfo(`Failed to save address: ${err.message}`);
      toast.error('Failed to save address');
    }
  }, [tempAddress, sameBillingAddress, isAuthenticated, addDebugInfo]);

  const handlePaystackPayment = useCallback(async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    addDebugInfo(`Starting payment process - Total: ${orderCalculations.finalTotal}`);
    setIsProcessing(true);
    try {
      const orderData = {
        shippingAddress: {
          first_name: shippingAddress.first_name,
          last_name: shippingAddress.last_name,
          email: shippingAddress.email,
          phone_number: shippingAddress.phone_number,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 || undefined,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postal_code || undefined,
          country: 'Kenya',
        },
        billingAddress: sameBillingAddress
          ? {
              first_name: shippingAddress.first_name,
              last_name: shippingAddress.last_name,
              email: shippingAddress.email,
              phone_number: shippingAddress.phone_number,
              line1: shippingAddress.line1,
              line2: shippingAddress.line2 || undefined,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postal_code || undefined,
              country: 'Kenya',
            }
          : {
              first_name: billingAddress.first_name,
              last_name: billingAddress.last_name,
              email: billingAddress.email,
              phone_number: billingAddress.phone_number,
              line1: billingAddress.line1,
              line2: billingAddress.line2 || undefined,
              city: billingAddress.city,
              state: billingAddress.state,
              postal_code: billingAddress.postal_code || undefined,
              country: 'Kenya',
            },
        total: orderCalculations.finalTotal,
        sessionId: isAuthenticated ? undefined : localStorage.getItem('sessionId') || uuidv4(),
      };

      addDebugInfo('Creating order...');
      const response = await orderAPI.createOrder(orderData);
      const orderId = response.data.order.id;
      addDebugInfo(`Order created with ID: ${orderId}`);

      if (response.data.authorization_url) {
        addDebugInfo('Payment initiated successfully, redirecting...');
        if (!isAuthenticated) {
          localStorage.setItem('pendingOrderId', orderId);
        }
        await dispatch(clearCart({ sessionId: isAuthenticated ? undefined : localStorage.getItem('sessionId') || uuidv4() })).unwrap();
        if (!isAuthenticated) {
          localStorage.removeItem('sessionId');
        }
        window.location.href = response.data.authorization_url;
      } else {
        addDebugInfo('Payment initialization failed - no authorization URL');
        toast.error('Failed to initialize payment');
      }
    } catch (error: any) {
      addDebugInfo(`Payment failed: ${error.message}`);
      toast.error(error.message?.includes('Total mismatch') ? 'Cart total mismatch' : error.message || 'Failed to initialize payment');
    } finally {
      setIsProcessing(false);
    }
  }, [
    validateForm,
    shippingAddress,
    billingAddress,
    sameBillingAddress,
    orderCalculations.finalTotal,
    isAuthenticated,
    dispatch,
    addDebugInfo,
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
      {isLoading && <div className="text-center">Loading...</div>}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Shipping Address */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="mr-2" /> Shipping Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={shippingAddress.first_name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, first_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={shippingAddress.last_name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, last_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={shippingAddress.email}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={shippingAddress.phone_number}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone_number: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={shippingAddress.line1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apartment, suite, etc. (optional)</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={shippingAddress.line2 || ''}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Postal Code (optional)</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={shippingAddress.postal_code || ''}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                />
              </div>
            </div>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={() => {
                setTempAddress(shippingAddress);
                setIsModalOpen(true);
              }}
            >
              Save Address
            </button>
          </div>

          {/* Billing Address */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="mr-2" /> Billing Address
            </h2>
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={sameBillingAddress}
                onChange={(e) => setSameBillingAddress(e.target.checked)}
                className="mr-2"
              />
              Same as shipping address
            </label>
            {!sameBillingAddress && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={billingAddress.first_name}
                    onChange={(e) => setBillingAddress({ ...billingAddress, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={billingAddress.last_name}
                    onChange={(e) => setBillingAddress({ ...billingAddress, last_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={billingAddress.email}
                    onChange={(e) => setBillingAddress({ ...billingAddress, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={billingAddress.phone_number}
                    onChange={(e) => setBillingAddress({ ...billingAddress, phone_number: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={billingAddress.line1}
                    onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apartment, suite, etc. (optional)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={billingAddress.line2 || ''}
                    onChange={(e) => setBillingAddress({ ...billingAddress, line2: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={billingAddress.state}
                    onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code (optional)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={billingAddress.postal_code || ''}
                    onChange={(e) => setBillingAddress({ ...billingAddress, postal_code: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="mr-2" /> Order Items
            </h2>
            {cartItems.length === 0 && !isLoading && (
              <p className="text-gray-500">Your cart is empty.</p>
            )}
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center border-b py-4">
                <img
                  src={item.product.image || 'https://via.placeholder.com/100'}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{item.product.name}</h3>
                  <p className="text-gray-600">KSh {item.product.price.toFixed(2)}</p>
                  <div className="flex items-center mt-2">
                    <button
                      className="p-1 bg-gray-200 rounded"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      className="p-1 bg-gray-200 rounded"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      className="ml-4 text-red-600"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-lg font-medium">KSh {(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Check className="mr-2" /> Order Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>KSh {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>KSh {orderCalculations.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>KSh {orderCalculations.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>KSh {orderCalculations.finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              className={`mt-6 w-full bg-green-600 text-white py-3 rounded-md flex items-center justify-center ${
                isProcessing || !validateForm() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
              }`}
              onClick={handlePaystackPayment}
              disabled={isProcessing || cartItems.length === 0 || !validateForm()}
            >
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <Truck className="mr-2" /> Proceed to Payment
                </>
              )}
            </button>
            {debugInfo.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                <p className="font-semibold">Debug Info:</p>
                {debugInfo.map((info, index) => (
                  <p key={index}>{info}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Add New Address
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={tempAddress.first_name || ''}
                          onChange={(e) => setTempAddress({ ...tempAddress, first_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={tempAddress.last_name || ''}
                          onChange={(e) => setTempAddress({ ...tempAddress, last_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={tempAddress.email || ''}
                          onChange={(e) => setTempAddress({ ...tempAddress, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={tempAddress.phone_number || ''}
                          onChange={(e) => setTempAddress({ ...tempAddress, phone_number: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={tempAddress.line1 || ''}
                          onChange={(e) => setTempAddress({ ...tempAddress, line1: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Apartment, suite, etc. (optional)</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={tempAddress.line2 || ''}
                          onChange={(e) => setTempAddress({ ...tempAddress, line2: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={tempAddress.city || 'Nairobi'}
                          onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={tempAddress.state || 'Nairobi'}
                          onChange={(e) => setTempAddress({ ...tempAddress, state: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Postal Code (optional)</label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={tempAddress.postal_code || ''}
                          onChange={(e) => setTempAddress({ ...tempAddress, postal_code: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      onClick={handleModalSubmit}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="ml-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};