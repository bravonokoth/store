import React, { useState, useEffect, Fragment, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store/store';
import { clearCart, fetchCart, removeFromCart, updateCartItem } from '../../store/cartSlice';
import { orderAPI } from '../../services/api';
import { Check, MapPin, Package, Shield, Truck, Trash2, Plus, Minus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, Transition } from '@headlessui/react';
import validator from 'validator';
import axios from 'axios';

interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
}

export const Checkout: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [tempAddress, setTempAddress] = useState<Partial<Address>>({
    address: '',
    apartment: '',
    city: 'Nairobi',
    state: 'Nairobi',
    zipCode: '',
  });
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: 'Nairobi',
    state: 'Nairobi',
    zipCode: '',
  });
  const [billingAddress, setBillingAddress] = useState<Address>({ ...shippingAddress });
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, total, isLoading, error } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Debug function to log information
  const addDebugInfo = useCallback((info: string) => {
    console.log('DEBUG:', info);
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${info}`]);
  }, []);

  // Memoized calculations for better performance
  const orderCalculations = useMemo(() => {
    addDebugInfo(`Calculating totals - Cart total: ${total}, Items count: ${items.length}`);
    const tax = total * 0.08;
    const shipping = total > 1000 ? 0 : 50;
    const finalTotal = total + tax + shipping;
    
    addDebugInfo(`Final calculations - Tax: ${tax}, Shipping: ${shipping}, Total: ${finalTotal}`);
    return { tax, shipping, finalTotal };
  }, [total, items.length, addDebugInfo]);

  // Initialize session and fetch cart only once
  useEffect(() => {
    const initializeCheckout = async () => {
      addDebugInfo('Initializing checkout...');
      
      // Initialize session ID for guest users
      if (!isAuthenticated && !localStorage.getItem('sessionId')) {
        const sessionId = uuidv4();
        localStorage.setItem('sessionId', sessionId);
        addDebugInfo(`Created new session ID: ${sessionId}`);
      }

      // Fetch cart only if not already loading and not initialized
      if (!isLoading && !isInitialized) {
        addDebugInfo('Fetching cart data...');
        try {
          await dispatch(fetchCart());
          addDebugInfo('Cart fetch completed successfully');
          setIsInitialized(true);
        } catch (error) {
          addDebugInfo(`Cart fetch failed: ${error}`);
        }
      }
    };

    initializeCheckout();
  }, [isAuthenticated, dispatch, isLoading, isInitialized, addDebugInfo]);

  // Separate effect for user data population
  useEffect(() => {
    if (user && isInitialized) {
      addDebugInfo(`Populating user data: ${user.name}, ${user.email}`);
      const firstName = user.name?.split(' ')[0] || '';
      const lastName = user.name?.split(' ').slice(1).join(' ') || '';
      
      setShippingAddress(prev => ({
        ...prev,
        firstName,
        lastName,
        email: user.email,
        phone: user.phone || '',
      }));
      
      if (sameBillingAddress) {
        setBillingAddress(prev => ({
          ...prev,
          firstName,
          lastName,
          email: user.email,
          phone: user.phone || '',
        }));
      }
    }
  }, [user, sameBillingAddress, isInitialized, addDebugInfo]);

  // Separate effect for cart validation and redirect
  useEffect(() => {
    if (isInitialized && !isLoading) {
      addDebugInfo(`Cart check - Items: ${items.length}, Loading: ${isLoading}`);
      if (items.length === 0) {
        addDebugInfo('Cart is empty, redirecting...');
        navigate('/cart');
      }
    }
  }, [isInitialized, isLoading, items.length, navigate, addDebugInfo]);

  const handleAddNewAddress = useCallback(() => {
    console.log('Add New Address clicked');
    setIsModalOpen(true);
    setTempAddress({
      address: '',
      apartment: '',
      city: 'Nairobi',
      state: 'Nairobi',
      zipCode: '',
    });
  }, []);

  const handleModalSubmit = useCallback(() => {
    const updatedAddress = {
      address: tempAddress.address || '',
      apartment: tempAddress.apartment || '',
      city: 'Nairobi',
      state: 'Nairobi',
      zipCode: tempAddress.zipCode || '',
    };

    setShippingAddress(prev => ({ ...prev, ...updatedAddress }));
    
    if (sameBillingAddress) {
      setBillingAddress(prev => ({ ...prev, ...updatedAddress }));
    }
    
    setIsModalOpen(false);
    addDebugInfo('Address updated successfully');
  }, [tempAddress, sameBillingAddress, addDebugInfo]);

  const validateForm = useCallback((): boolean => {
    const shippingRequired = ['firstName', 'lastName', 'email', 'phone', 'address'];
    const isShippingValid =
      shippingRequired.every(field => shippingAddress[field as keyof Address]?.trim() !== '') &&
      validator.isEmail(shippingAddress.email) &&
      validator.isMobilePhone(shippingAddress.phone, 'any');
    
    const isValid = items.length > 0 && isShippingValid;
    addDebugInfo(`Form validation - Valid: ${isValid}, Items: ${items.length}, Shipping valid: ${isShippingValid}`);
    return isValid;
  }, [shippingAddress, items.length, addDebugInfo]);

  const handleRemoveItem = useCallback(async (id: string) => {
    addDebugInfo(`Removing item: ${id}`);
    try {
      await dispatch(removeFromCart(id)).unwrap();
      toast.success('Item removed from cart');
      addDebugInfo('Item removed successfully');
    } catch (err) {
      addDebugInfo(`Failed to remove item: ${err}`);
      toast.error('Failed to remove item');
    }
  }, [dispatch, addDebugInfo]);

  const handleUpdateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity < 1) return;
    addDebugInfo(`Updating quantity for ${id} to ${quantity}`);
    try {
      await dispatch(updateCartItem({ id, quantity })).unwrap();
      toast.success('Cart updated');
      addDebugInfo('Quantity updated successfully');
    } catch (err) {
      addDebugInfo(`Failed to update quantity: ${err}`);
      toast.error('Failed to update cart');
    }
  }, [dispatch, addDebugInfo]);

  const handlePaystackPayment = useCallback(async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    addDebugInfo(`Starting payment process - Total: ${orderCalculations.finalTotal}`);
    setIsProcessing(true);
    try {
      const orderData = {
        items,
        shippingAddress,
        billingAddress: sameBillingAddress ? shippingAddress : billingAddress,
        paymentInfo: null,
        total: orderCalculations.finalTotal,
        sessionId: isAuthenticated ? undefined : localStorage.getItem('sessionId') || undefined,
        paymentStatus: 'pending'
      };

      addDebugInfo('Creating order...');
      const orderResponse = await orderAPI.createOrder(orderData);
      const orderId = orderResponse.data.id;
      addDebugInfo(`Order created with ID: ${orderId}`);

      addDebugInfo('Initiating Paystack payment...');
      const paymentResponse = await axios.post("http://127.0.0.1:8000/api/payment/initiate", {
        email: shippingAddress.email,
        amount: Math.round(orderCalculations.finalTotal * 100),
        orderId,
        metadata: {
          orderId,
          customerId: isAuthenticated ? user?.id : localStorage.getItem('sessionId'),
          customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          phone: shippingAddress.phone
        }
      });

      if (paymentResponse.data.data.authorization_url) {
        addDebugInfo('Payment initiated successfully, redirecting...');
        if (!isAuthenticated) {
          localStorage.setItem('pendingOrderId', orderId);
        }
        
        dispatch(clearCart());
        if (!isAuthenticated) {
          localStorage.removeItem('sessionId');
          localStorage.removeItem('guest_cart');
        }
        
        window.location.href = paymentResponse.data.data.authorization_url;
      } else {
        addDebugInfo('Payment initialization failed - no authorization URL');
        toast.error('Failed to initialize payment');
      }
    } catch (error: any) {
      addDebugInfo(`Payment failed: ${error.message}`);
      console.error("Payment initiation failed:", error);
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setIsProcessing(false);
    }
  }, [validateForm, items, shippingAddress, billingAddress, sameBillingAddress, orderCalculations.finalTotal, isAuthenticated, user?.id, dispatch, addDebugInfo]);

  const handleInputChange = useCallback((
    target: 'shipping' | 'billing' | 'temp',
    field: string,
    value: string
  ) => {
    switch (target) {
      case 'shipping':
        setShippingAddress(prev => ({ ...prev, [field]: value }));
        if (sameBillingAddress) {
          setBillingAddress(prev => ({ ...prev, [field]: value }));
        }
        break;
      case 'billing':
        setBillingAddress(prev => ({ ...prev, [field]: value }));
        break;
      case 'temp':
        setTempAddress(prev => ({ ...prev, [field]: value }));
        break;
    }
  }, [sameBillingAddress]);

  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
          <div className="mt-4 text-left bg-white p-4 rounded-lg shadow max-w-md">
            <h4 className="font-semibold text-sm mb-2">Debug Info:</h4>
            <div className="text-xs space-y-1">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-gray-600">{info}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Error loading cart</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold mb-2">Debug Information:</h4>
          <div className="text-sm space-y-1">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-gray-600">{info}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center text-gray-900">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <button
          onClick={() => navigate('/products')}
          className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-xl"
        >
          Shop Now
        </button>
        <div className="mt-4 bg-white p-4 rounded-lg shadow max-w-md mx-auto">
          <h4 className="font-semibold mb-2">Debug Information:</h4>
          <div className="text-sm space-y-1">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-gray-600">{info}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Debug Panel */}
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="font-semibold text-sm mb-2 text-yellow-800">Debug Info:</h4>
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-yellow-700">{info}</div>
            ))}
          </div>
          <div className="mt-2 text-xs text-yellow-700">
            <strong>Cart Total:</strong> Ksh {total.toFixed(2)} | 
            <strong> Items:</strong> {items.length} | 
            <strong> Final Total:</strong> Ksh {orderCalculations.finalTotal.toFixed(2)}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Review */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" /> Cart Review ({items.length} items)
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.product.image || 'https://via.placeholder.com/150'}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-gray-900 font-medium truncate">{item.product.name}</h3>
                      <p className="text-xs text-gray-500">Ksh {item.product.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 bg-gray-200 rounded-full text-gray-900 hover:bg-gray-300"
                        disabled={isProcessing}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm text-gray-900 min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 bg-gray-200 rounded-full text-gray-900 hover:bg-gray-300"
                        disabled={isProcessing}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        Ksh {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-500"
                      title="Remove item"
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" /> Shipping Information
                </h2>
                <button
                  onClick={handleAddNewAddress}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg"
                >
                  Add New Address
                </button>
              </div>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleInputChange('shipping', 'firstName', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleInputChange('shipping', 'lastName', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
                  <input
                    type="text"
                    value={shippingAddress.address}
                    onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Apartment, Door, or Flat Number (optional)</label>
                  <input
                    type="text"
                    value={shippingAddress.apartment}
                    onChange={(e) => handleInputChange('shipping', 'apartment', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      value="Nairobi"
                      disabled
                      className="w-full bg-gray-200 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">County</label>
                    <input
                      type="text"
                      value="Nairobi"
                      disabled
                      className="w-full bg-gray-200 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Postal Code (optional)</label>
                  <input
                    type="text"
                    value={shippingAddress.zipCode}
                    onChange={(e) => handleInputChange('shipping', 'zipCode', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </form>
            </div>

            {/* Billing Address Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="sameBilling"
                  checked={sameBillingAddress}
                  onChange={(e) => setSameBillingAddress(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-50 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="sameBilling" className="text-sm text-gray-900">Billing address same as shipping</label>
              </div>
              {!sameBillingAddress && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Billing Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={billingAddress.firstName}
                        onChange={(e) => handleInputChange('billing', 'firstName', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={billingAddress.lastName}
                        onChange={(e) => handleInputChange('billing', 'lastName', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
                    <input
                      type="text"
                      value={billingAddress.address}
                      onChange={(e) => handleInputChange('billing', 'address', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Apartment, Door, or Flat Number (optional)</label>
                    <input
                      type="text"
                      value={billingAddress.apartment}
                      onChange={(e) => handleInputChange('billing', 'apartment', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                      <input
                        type="text"
                        value="Nairobi"
                        disabled
                        className="w-full bg-gray-200 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">County</label>
                      <input
                        type="text"
                        value="Nairobi"
                        disabled
                        className="w-full bg-gray-200 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Postal Code (optional)</label>
                    <input
                      type="text"
                      value={billingAddress.zipCode}
                      onChange={(e) => handleInputChange('billing', 'zipCode', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Peoceed To Payment</h3>
                    <p className="text-xs text-green-600 mt-1">
                      Your payment will be processed securely through Paystack. You'll be redirected to complete your payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePaystackPayment}
              disabled={isProcessing || !validateForm()}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-lg font-semibold transition-all duration-300"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Pay</span>
                  <span className="font-bold">Ksh {orderCalculations.finalTotal.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>

          {/* Order Summary Sidebar - THIS IS THE RIGHT SIDE SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={item.product.image || 'https://via.placeholder.com/150'}
                        alt={item.product.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-xs font-medium truncate">{item.product.name}</p>
                      <p className="text-gray-500 text-xs">Ksh {item.product.price.toFixed(2)} each</p>
                    </div>
                    <p className="text-gray-900 text-sm font-semibold">
                      Ksh {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-gray-200 pt-3">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>Ksh {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span className={orderCalculations.shipping === 0 ? 'text-green-600' : 'text-gray-600'}>
                    {orderCalculations.shipping === 0 ? 'Free' : `Ksh ${orderCalculations.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tax</span>
                  <span>Ksh {orderCalculations.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span>Ksh {orderCalculations.finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center space-x-2 text-green-600 text-sm">
                  <Shield className="h-4 w-4" />
                  <span>Secure Payment with Paystack</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600 text-sm">
                  <Truck className="h-4 w-4" />
                  <span>Free Shipping over Ksh 1000</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-600 text-sm">
                  <Check className="h-4 w-4" />
                  <span>30-Day Return Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Address Modal */}
        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-lg bg-white rounded-xl p-6 space-y-4 shadow-lg">
                    <Dialog.Title className="text-lg font-semibold text-gray-900">Add New Address</Dialog.Title>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
                        <input
                          type="text"
                          value={tempAddress.address || ''}
                          onChange={(e) => handleInputChange('temp', 'address', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Apartment, Door, or Flat Number (optional)</label>
                        <input
                          type="text"
                          value={tempAddress.apartment || ''}
                          onChange={(e) => handleInputChange('temp', 'apartment', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                          <input
                            type="text"
                            value="Nairobi"
                            disabled
                            className="w-full bg-gray-200 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">County</label>
                          <input
                            type="text"
                            value="Nairobi"
                            disabled
                            className="w-full bg-gray-200 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Postal Code (optional)</label>
                        <input
                          type="text"
                          value={tempAddress.zipCode || ''}
                          onChange={(e) => handleInputChange('temp', 'zipCode', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleModalSubmit}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:bg-gray-400"
                        disabled={!tempAddress.address}
                      >
                        Save Address
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};