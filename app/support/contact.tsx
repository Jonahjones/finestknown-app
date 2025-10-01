import { AppHeader } from '@/src/components/AppHeader';
import { Button, Card, Input } from '@/src/components/ui';
import { colors, spacing, typography } from '@/src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields before submitting.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Message Sent!',
        'Thank you for contacting us. We\'ll get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setName('');
              setEmail('');
              setSubject('');
              setMessage('');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    const phoneNumber = '+380937001218';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@finestknown.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Contact Us" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Contact Methods */}
          <Card elevation="e2" style={styles.contactCard}>
            <Text style={styles.cardTitle}>Get in Touch</Text>
            <Text style={styles.cardSubtitle}>
              We're here to help with your precious metals questions and orders.
            </Text>

            <View style={styles.contactMethods}>
              <TouchableOpacity style={styles.contactMethod} onPress={handleCall}>
                <View style={styles.contactIcon}>
                  <Ionicons name="call" size={24} color={colors.navy} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>+380 93 700 1218</Text>
                  <Text style={styles.contactHint}>Tap to call</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactMethod} onPress={handleEmail}>
                <View style={styles.contactIcon}>
                  <Ionicons name="mail" size={24} color={colors.navy} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>support@finestknown.com</Text>
                  <Text style={styles.contactHint}>Tap to email</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.contactMethod}>
                <View style={styles.contactIcon}>
                  <Ionicons name="time" size={24} color={colors.navy} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Business Hours</Text>
                  <Text style={styles.contactValue}>Mon-Fri: 9AM - 6PM EST</Text>
                  <Text style={styles.contactHint}>Saturday: 10AM - 4PM EST</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Contact Form */}
          <Card elevation="e2" style={styles.formCard}>
            <Text style={styles.cardTitle}>Send us a Message</Text>
            <Text style={styles.cardSubtitle}>
              Fill out the form below and we'll respond within 24 hours.
            </Text>

            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                icon="person"
              />

              <Input
                label="Email Address"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                icon="mail"
              />

              <Input
                label="Subject"
                placeholder="What can we help you with?"
                value={subject}
                onChangeText={setSubject}
                style={styles.input}
                icon="chatbubble"
              />

              <Input
                label="Message"
                placeholder="Tell us more about your inquiry..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                style={[styles.input, styles.messageInput]}
                textAlignVertical="top"
                icon="document-text"
              />

              <Button
                title={loading ? 'Sending...' : 'Send Message'}
                onPress={handleSubmit}
                loading={loading}
                variant="cta"
                size="large"
                style={styles.submitButton}
              />
            </View>
          </Card>

          {/* FAQ Section */}
          <Card elevation="e2" style={styles.faqCard}>
            <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What are your shipping times?</Text>
              <Text style={styles.faqAnswer}>
                Orders typically ship within 1-2 business days. Delivery takes 3-7 business days depending on location.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Do you authenticate all products?</Text>
              <Text style={styles.faqAnswer}>
                Yes, all our precious metals are authenticated and come with certificates of authenticity from recognized grading services.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
              <Text style={styles.faqAnswer}>
                We accept all major credit cards, bank transfers, and cryptocurrency payments for your convenience.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.l,
  },

  // Contact Methods Card
  contactCard: {
    marginBottom: spacing.l,
  },
  cardTitle: {
    fontSize: typography.title.size,
    lineHeight: typography.title.lineHeight,
    fontWeight: typography.title.weight,
    color: colors.text,
    marginBottom: spacing.s,
  },
  cardSubtitle: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    marginBottom: spacing.l,
  },
  contactMethods: {
    gap: spacing.l,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.platinum,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: 2,
  },
  contactHint: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Form Card
  formCard: {
    marginBottom: spacing.l,
  },
  form: {
    gap: spacing.m,
  },
  input: {
    marginBottom: spacing.s,
  },
  messageInput: {
    minHeight: 120,
  },
  submitButton: {
    marginTop: spacing.m,
  },

  // FAQ Card
  faqCard: {
    marginBottom: spacing.xxl,
  },
  faqItem: {
    marginBottom: spacing.l,
    paddingBottom: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
  },
  faqQuestion: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.s,
  },
  faqAnswer: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
  },
});
