/**
 * INSAF - Blocked Accounts Screen
 * 
 * Displays user's blocked accounts with option to unblock
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Text } from '../../components/common/Text';
import { getBlockedUsers, unblockUser } from '../../services/userPreferences.service';
import { LawyerProfile } from '../../services/lawyer.service';

export const BlockedAccountsScreen: React.FC = () => {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    const [blockedUsers, setBlockedUsers] = useState<LawyerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadBlockedUsers = async () => {
        if (!user?.uid) return;

        try {
            const data = await getBlockedUsers(user.uid);
            setBlockedUsers(data);
        } catch (error) {
            console.error('Error loading blocked users:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadBlockedUsers();
        }, [user?.uid])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadBlockedUsers();
    };

    const handleUnblock = (account: LawyerProfile) => {
        Alert.alert(
            'Unblock Account',
            `Are you sure you want to unblock ${account.fullName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    onPress: async () => {
                        if (!user?.uid) return;
                        try {
                            await unblockUser(user.uid, account.userId);
                            setBlockedUsers(prev => prev.filter(b => b.userId !== account.userId));
                            Alert.alert('Success', `${account.fullName} has been unblocked.`);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to unblock user');
                        }
                    },
                },
            ]
        );
    };

    const renderBlockedCard = ({ item }: { item: LawyerProfile }) => (
        <View style={[styles.card, { backgroundColor: theme.colors.surface.primary }]}>
            <View style={styles.cardContent}>
                <LinearGradient
                    colors={['#9CA3AF', '#D1D5DB']}
                    style={styles.avatar}
                >
                    <Ionicons name="person" size={24} color="#374151" />
                </LinearGradient>

                <View style={styles.userInfo}>
                    <Text variant="labelLarge" color="primary">{item.fullName}</Text>
                    <Text variant="bodySmall" color="tertiary">
                        {item.specializations?.join(', ') || 'User'}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.unblockButton, { backgroundColor: theme.colors.brand.primary }]}
                    onPress={() => handleUnblock(item)}
                >
                    <Text variant="labelSmall" style={{ color: '#FFFFFF' }}>Unblock</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={64} color={theme.colors.text.tertiary} />
            <Text variant="h3" color="secondary" style={styles.emptyTitle}>
                No Blocked Accounts
            </Text>
            <Text variant="bodyMedium" color="tertiary" style={styles.emptyText}>
                You haven't blocked anyone yet. Blocked users won't be able to contact you.
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background.primary }]}>
                <ActivityIndicator size="large" color={theme.colors.brand.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text variant="h3" color="primary">Blocked Accounts</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Info Banner */}
            <View style={[styles.infoBanner, { backgroundColor: `${theme.colors.brand.primary}15` }]}>
                <Ionicons name="information-circle" size={20} color={theme.colors.brand.primary} />
                <Text variant="bodySmall" color="secondary" style={styles.infoText}>
                    Blocked users cannot send you messages or consultation requests.
                </Text>
            </View>

            {/* Blocked List */}
            <FlatList
                data={blockedUsers}
                renderItem={renderBlockedCard}
                keyExtractor={(item) => item.userId}
                contentContainerStyle={[
                    styles.listContent,
                    blockedUsers.length === 0 && styles.emptyList
                ]}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.brand.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        padding: 12,
        borderRadius: 12,
        gap: 10,
    },
    infoText: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        gap: 12,
    },
    emptyList: {
        flex: 1,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        flex: 1,
        marginLeft: 14,
    },
    unblockButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        marginTop: 16,
        textAlign: 'center',
    },
    emptyText: {
        marginTop: 8,
        textAlign: 'center',
    },
});

export default BlockedAccountsScreen;
