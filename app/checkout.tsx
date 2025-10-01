import { clearCart, listCartItems } from '@/src/api/cart';
import { requestCheckout } from '@/src/api/checkout';
import { borderRadius, colors, spacing, typography } from '@/src/design/tokens';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PaymentForm {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface BillingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutScreen() {
  const queryClient = useQueryClient();
  
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const [billingForm, setBillingForm] = useState<BillingForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: listCartItems,
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price_snapshot_cents * item.qty), 0);
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const shipping = subtotal > 10000 ? 0 : 999; // Free shipping over $100
  const total = subtotal + tax + shipping;

  // Process order mutation
  const processOrder = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      
      // Validate forms
      if (!validateForms()) {
        throw new Error('Please fill in all required fields');
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order
      const orderResult = await requestCheckout();
      
      // Clear cart
      await clearCart();
      
      return orderResult;
    },
    onSuccess: (result) => {
      setIsProcessing(false);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      Alert.alert(
        "🎉 Order Confirmed!",
        `Your order has been placed successfully!\n\nOrder ID: ${result.order_id}\nTotal: $${(total / 100).toFixed(2)}\n\nYou'll receive a confirmation email shortly.`,
        [
          {
            text: "View Order",
            onPress: () => router.push(`/account/orders/${result.order_id}`)
          },
          {
            text: "Continue Shopping",
            onPress: () => router.replace('/(tabs)/catalog')
          }
        ]
      );
    },
    onError: (error) => {
      setIsProcessing(false);
      Alert.alert("Payment Failed", error.message || "Unable to process your order. Please try again.");
    }
  });

  const validateForms = () => {
    const requiredPaymentFields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
    const requiredBillingFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
    
    for (const field of requiredPaymentFields) {
      if (!paymentForm[field as keyof PaymentForm].trim()) {
        Alert.alert("Missing Information", `Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    for (const field of requiredBillingFields) {
      if (!billingForm[field as keyof BillingForm].trim()) {
        Alert.alert("Missing Information", `Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingForm.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some items to proceed with checkout</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.replace('/(tabs)/catalog')}
          >
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cartItems.map((item) => (
              <View key={item.product_id} style={styles.orderItem}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.products?.title || 'Product'} × {item.qty}
                </Text>
                <Text style={styles.itemPrice}>
                  ${((item.price_snapshot_cents * item.qty) / 100).toFixed(2)}
                </Text>
              </View>
            ))}
            
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>${(subtotal / 100).toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping:</Text>
                <Text style={styles.totalValue}>
                  {shipping === 0 ? 'FREE' : `$${(shipping / 100).toFixed(2)}`}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax:</Text>
                <Text style={styles.totalValue}>${(tax / 100).toFixed(2)}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.totalRow}>
                <Text style={styles.grandTotalLabel}>Total:</Text>
                <Text style={styles.grandTotalValue}>${(total / 100).toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Billing Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing Information</Text>
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="First Name *"
                value={billingForm.firstName}
                onChangeText={(text) => setBillingForm(prev => ({ ...prev, firstName: text }))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Last Name *"
                value={billingForm.lastName}
                onChangeText={(text) => setBillingForm(prev => ({ ...prev, lastName: text }))}
              />
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Email Address *"
              value={billingForm.email}
              onChangeText={(text) => setBillingForm(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={billingForm.phone}
              onChangeText={(text) => setBillingForm(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Street Address *"
              value={billingForm.address}
              onChangeText={(text) => setBillingForm(prev => ({ ...prev, address: text }))}
            />
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="City *"
                value={billingForm.city}
                onChangeText={(text) => setBillingForm(prev => ({ ...prev, city: text }))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="State *"
                value={billingForm.state}
                onChangeText={(text) => setBillingForm(prev => ({ ...prev, state: text }))}
              />
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="ZIP Code *"
              value={billingForm.zipCode}
              onChangeText={(text) => setBillingForm(prev => ({ ...prev, zipCode: text }))}
              keyboardType="numeric"
            />
          </View>

          {/* Payment Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Cardholder Name *"
              value={paymentForm.cardholderName}
              onChangeText={(text) => setPaymentForm(prev => ({ ...prev, cardholderName: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Card Number *"
              value={paymentForm.cardNumber}
              onChangeText={(text) => {
                const formatted = formatCardNumber(text);
                if (formatted.replace(/\s/g, '').length <= 16) {
                  setPaymentForm(prev => ({ ...prev, cardNumber: formatted }));
                }
              }}
              keyboardType="numeric"
            />
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM/YY *"
                value={paymentForm.expiryDate}
                onChangeText={(text) => {
                  const formatted = formatExpiryDate(text);
                  if (formatted.length <= 5) {
                    setPaymentForm(prev => ({ ...prev, expiryDate: formatted }));
                  }
                }}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV *"
                value={paymentForm.cvv}
                onChangeText={(text) => {
                  if (text.length <= 4) {
                    setPaymentForm(prev => ({ ...prev, cvv: text }));
                  }
                }}
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
          </View>
        </ScrollView>

        {/* Place Order Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.placeOrderButton, { opacity: isProcessing ? 0.7 : 1 }]}
            onPress={() => processOrder.mutate()}
            disabled={isProcessing}
          >
            <Text style={styles.placeOrderButtonText}>
              {isProcessing ? 'Processing...' : `Place Order - $${(total / 100).toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate + '20',
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.navy,
  },
  backButton: {
    fontSize: typography.sizes.base,
    color: colors.navy,
    fontWeight: typography.weights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  itemName: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.navy,
    marginRight: spacing.md,
  },
  itemPrice: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
  },
  totalsContainer: {
    marginTop: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.sizes.base,
    color: colors.slate,
  },
  totalValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.navy,
  },
  separator: {
    height: 1,
    backgroundColor: colors.slate + '20',
    marginVertical: spacing.sm,
  },
  grandTotalLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.navy,
  },
  grandTotalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.navy,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.slate + '40',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.slate + '20',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  placeOrderButton: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: typography.sizes.base,
    color: colors.slate,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.sizes.base,
    color: colors.slate,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  shopButton: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  shopButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});
