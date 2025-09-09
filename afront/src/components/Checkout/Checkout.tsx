import React, { useState, useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store/store';
import { clearCart, fetchCart, removeFromCart, updateCartItem } from '../../store/cartSlice';
import { orderAPI, addressAPI } from '../../services/api';
import { Check, CreditCard, MapPin, Package, Shield, Truck, Trash2, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, Transition } from '@headlessui/react';
import validator from 'validator';

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

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
}

const Checkout: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, total, isLoading, error } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Initialize session ID for guest users
    if (!isAuthenticated && !localStorage.getItem('sessionId')) {
      const sessionId = uuidv4();
      localStorage.setItem('sessionId', sessionId);
    }

    // Fetch cart only if not already loading
    if (!isLoading) {
      dispatch(fetchCart());
    }

    // Redirect to cart if empty
    if (!isLoading && items.length === 0) {
      navigate('/cart');
    }

    // Pre-fill user data if available
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone || '',
      }));
      if (sameBillingAddress) {
        setBillingAddress(prev => ({
          ...prev,
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: user.phone || '',
        }));
      }
    }
  }, [user, isAuthenticated, dispatch, navigate, isLoading]);

  const handleAddNewAddress = () => {
    console.log('Add New Address clicked');
    setIsModalOpen(true);
    setTempAddress({
      address: '',
      apartment: '',
      city: 'Nairobi',
      state: 'Nairobi',
      zipCode: '',
    });
  };

  const handleModalSubmit = () => {
    setShippingAddress(prev => ({
      ...prev,
      address: tempAddress.address || '',
      apartment: tempAddress.apartment || '',
      city: 'Nairobi',
      state: 'Nairobi',
      zipCode: tempAddress.zipCode || '',
    }));
    if (sameBillingAddress) {
      setBillingAddress(prev => ({
        ...prev,
        address: tempAddress.address || '',
        apartment: tempAddress.apartment || '',
        city: 'Nairobi',
        state: 'Nairobi',
        zipCode: tempAddress.zipCode || '',
      }));
    }
    setIsModalOpen(false);
  };

  const tax = total * 0.08;
  const shipping = total > 1000 ? 0 : 50;
  const finalTotal = total + tax + shipping;

  const validateForm = (): boolean => {
    const shippingRequired = ['firstName', 'lastName', 'email', 'phone', 'address'];
    const paymentRequired = ['cardNumber', 'expiryDate', 'cvv', 'nameOnCard'];
    const isShippingValid =
      shippingRequired.every(field => shippingAddress[field as keyof Address]?.trim() !== '') &&
      validator.isEmail(shippingAddress.email) &&
      validator.isMobilePhone(shippingAddress.phone, 'ke-KE');
    const isPaymentValid = paymentRequired.every(field => paymentInfo[field as keyof PaymentInfo]?.trim() !== '');
    return items.length > 0 && isShippingValid && isPaymentValid;
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await dispatch(removeFromCart(id)).unwrap();
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await dispatch(updateCartItem({ id, quantity })).unwrap();
      toast.success('Cart updated');
    } catch (err) {
      toast.error('Failed to update cart');
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    try {
      await orderAPI.createOrder({
        items,
        shippingAddress,
        billingAddress: sameBillingAddress ? shippingAddress : billingAddress,
        paymentInfo,
        total: finalTotal,
        sessionId: isAuthenticated ? undefined : localStorage.getItem('sessionId'),
      });
      dispatch(clearCart());
      if (!isAuthenticated) {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('guest_cart');
      }
      toast.success('Order placed successfully!');
      navigate(isAuthenticated ? '/dashboard' : '/order-confirmation');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/^(\d{2})(\d{2})$/, '$1/$2');
  };

  const handleInputChange = (
    target: 'shipping' | 'billing' | 'payment' | 'temp',
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
      case 'payment':
        if (field === 'cardNumber') {
          value = formatCardNumber(value);
        } else if (field === 'expiryDate') {
          value = formatExpiryDate(value);
        }
        setPaymentInfo(prev => ({ ...prev, [field]: value }));
        break;
      case 'temp':
        setTempAddress(prev => ({ ...prev, [field]: value }));
        break;
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8 text-gray-900">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-red-600">{error}</div>;
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Review */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" /> Cart Review
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
                      <p className="text-xs text-gray-500">Ksh {item.product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 bg-gray-200 rounded-full text-gray-900"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 bg-gray-200 rounded-full text-gray-900"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-500"
                      title="Remove item"
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

            {/* Payment Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" /> Payment Information
              </h2>
              <div className="mb-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border-2 border-purple-500">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-900 text-sm font-medium">Credit Card</span>
                </div>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name on Card *</label>
                  <input
                    type="text"
                    value={paymentInfo.nameOnCard}
                    onChange={(e) => handleInputChange('payment', 'nameOnCard', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Card Number *</label>
                  <input
                    type="text"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => handleInputChange('payment', 'cardNumber', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date *</label>
                    <input
                      type="text"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => handleInputChange('payment', 'expiryDate', e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">CVV *</label>
                    <input
                      type="text"
                      value={paymentInfo.cvv}
                      onChange={(e) => handleInputChange('payment', 'cvv', e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </form>
              <div className="mt-4">
                <div className="flex items-center space-x-2">
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
                  <div className="mt-4 space-y-4">
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
            </div>

            {/* Place Order Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={isProcessing}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-sm transition-all duration-300"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <Check className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          {/* Order Summary Sidebar */}
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
                  <span className={shipping === 0 ? 'text-green-600' : 'text-gray-600'}>
                    {shipping === 0 ? 'Free' : `Ksh ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tax</span>
                  <span>Ksh {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span>Ksh {finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center space-x-2 text-green-600 text-sm">
                  <Shield className="h-4 w-4" />
                  <span>Secure SSL Encryption</span>
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
                        className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleModalSubmit}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
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

export default Checkout;