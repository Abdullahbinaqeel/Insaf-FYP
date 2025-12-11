/**
 * INSAF - Forgot Password Screen
 *
 * Password reset flow using email
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { Text } from '../../components/common/Text';
import { Button, IconButton } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { AuthStackParamList } from '../../navigation/types';
import { resetPassword } from '../../services/auth.service';
import { validateEmail } from '../../utils/validations';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
    const navigation = useNavigation<ForgotPasswordNavigationProp>();
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();

    // Form state
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [error, setError] = useState<string | undefined>();

    // Animation values
    const backButtonOpacity = useRef(new Animated.Value(0)).current;
    const iconOpacity = useRef(new Animated.Value(0)).current;
    const iconTranslateY = useRef(new Animated.Value(20)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(20)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const subtitleTranslateY = useRef(new Animated.Value(20)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Stop animations before resetting
        backButtonOpacity.stopAnimation();
        iconOpacity.stopAnimation();
        iconTranslateY.stopAnimation();
        titleOpacity.stopAnimation();
        titleTranslateY.stopAnimation();
        subtitleOpacity.stopAnimation();
        subtitleTranslateY.stopAnimation();
        contentOpacity.stopAnimation();
        contentTranslateY.stopAnimation();

        // Reset values
        backButtonOpacity.setValue(0);
        iconOpacity.setValue(0);
        iconTranslateY.setValue(20);
        titleOpacity.setValue(0);
        titleTranslateY.setValue(20);
        subtitleOpacity.setValue(0);
        subtitleTranslateY.setValue(20);
        contentOpacity.setValue(0);
        contentTranslateY.setValue(20);

        // Animate elements in sequence
        Animated.sequence([
            Animated.delay(200),
            Animated.timing(backButtonOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.sequence([
            Animated.delay(300),
            Animated.parallel([
                Animated.timing(iconOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(iconTranslateY, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        Animated.sequence([
            Animated.delay(400),
            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(titleTranslateY, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        Animated.sequence([
            Animated.delay(500),
            Animated.parallel([
                Animated.timing(subtitleOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(subtitleTranslateY, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        Animated.sequence([
            Animated.delay(600),
            Animated.parallel([
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(contentTranslateY, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [isEmailSent]);

    // Handle password reset
    const handleResetPassword = async () => {
        // Validate email
        const emailError = validateEmail(email.trim());
        if (emailError) {
            setError(emailError);
            return;
        }

        setIsLoading(true);
        setError(undefined);

        try {
            await resetPassword(email.trim());
            setIsEmailSent(true);
        } catch (err: any) {
            let errorMessage = 'Failed to send reset email. Please try again.';

            if (err.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address.';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = 'Too many requests. Please try again later.';
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle back to login
    const handleBackToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* Header Background */}
            <LinearGradient
                colors={theme.colors.gradient.primary as [string, string]}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Back Button */}
                <Animated.View
                    style={[
                        styles.backButton,
                        { top: insets.top + 8, opacity: backButtonOpacity },
                    ]}
                >
                    <IconButton
                        icon="arrow-back"
                        variant="ghost"
                        size="md"
                        onPress={() => navigation.goBack()}
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    />
                </Animated.View>

                {/* Header Content */}
                <View style={[styles.headerContent, { paddingTop: insets.top + 60 }]}>
                    <Animated.View
                        style={{
                            opacity: iconOpacity,
                            transform: [{ translateY: iconTranslateY }],
                        }}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={isEmailSent ? 'mail-open-outline' : 'key-outline'}
                                size={32}
                                color="#FFFFFF"
                            />
                        </View>
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: titleOpacity,
                            transform: [{ translateY: titleTranslateY }],
                        }}
                    >
                        <Text variant="h1" style={styles.headerTitle}>
                            {isEmailSent ? 'Check Your Email' : 'Forgot Password?'}
                        </Text>
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: subtitleOpacity,
                            transform: [{ translateY: subtitleTranslateY }],
                        }}
                    >
                        <Text variant="bodyMedium" style={styles.headerSubtitle}>
                            {isEmailSent
                                ? 'We sent a password reset link to your email'
                                : "Enter your email and we'll send you a reset link"}
                        </Text>
                    </Animated.View>
                </View>

                {/* Curved Bottom */}
                <View style={[styles.curvedBottom, { backgroundColor: theme.colors.background.primary }]} />
            </LinearGradient>

            {/* Form Section */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formContainer}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View
                        style={{
                            opacity: contentOpacity,
                            transform: [{ translateY: contentTranslateY }],
                        }}
                    >
                        {isEmailSent ? (
                            // Success State
                            <View style={styles.successContainer}>
                                <View style={[styles.successIconContainer, { backgroundColor: `${theme.colors.status.success}20` }]}>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={64}
                                        color={theme.colors.status.success}
                                    />
                                </View>

                                <Text variant="bodyLarge" color="secondary" style={styles.successText}>
                                    We've sent a password reset link to:
                                </Text>

                                <Text variant="h4" style={styles.emailText}>
                                    {email}
                                </Text>

                                <Text variant="bodySmall" color="tertiary" style={styles.instructionText}>
                                    Click the link in the email to reset your password. If you don't see it, check your spam folder.
                                </Text>

                                <Button
                                    title="Back to Login"
                                    variant="gradient"
                                    size="lg"
                                    fullWidth
                                    onPress={handleBackToLogin}
                                    style={styles.button}
                                />

                                <Button
                                    title="Resend Email"
                                    variant="outline"
                                    size="lg"
                                    fullWidth
                                    loading={isLoading}
                                    onPress={handleResetPassword}
                                    style={styles.resendButton}
                                />
                            </View>
                        ) : (
                            // Email Input State
                            <>
                                <Input
                                    label="Email"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (error) setError(undefined);
                                    }}
                                    error={error}
                                    leftIcon="mail-outline"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />

                                <Button
                                    title="Send Reset Link"
                                    variant="gradient"
                                    size="lg"
                                    fullWidth
                                    loading={isLoading}
                                    onPress={handleResetPassword}
                                    style={styles.button}
                                />

                                <Button
                                    title="Back to Login"
                                    variant="ghost"
                                    size="lg"
                                    fullWidth
                                    onPress={handleBackToLogin}
                                    style={styles.backToLoginButton}
                                />
                            </>
                        )}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        height: 280,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
    },
    headerContent: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    curvedBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    formContainer: {
        flex: 1,
        marginTop: -20,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    button: {
        marginTop: 24,
    },
    backToLoginButton: {
        marginTop: 12,
    },
    successContainer: {
        alignItems: 'center',
    },
    successIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successText: {
        textAlign: 'center',
        marginBottom: 8,
    },
    emailText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    instructionText: {
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    resendButton: {
        marginTop: 12,
    },
});

export default ForgotPasswordScreen;
