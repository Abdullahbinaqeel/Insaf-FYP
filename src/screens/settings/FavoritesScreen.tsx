/**
 * INSAF - Favorites Screen
 * 
 * Displays user's favorite lawyers with option to un-favorite
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { getFavorites, removeFavorite } from '../../services/userPreferences.service';
import { LawyerProfile } from '../../services/lawyer.service';

export const FavoritesScreen: React.FC = () => {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    const [favorites, setFavorites] = useState<LawyerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadFavorites = async () => {
        if (!user?.uid) return;

        try {
            const data = await getFavorites(user.uid);
            setFavorites(data);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [user?.uid])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadFavorites();
    };

    const handleUnfavorite = (lawyer: LawyerProfile) => {
        Alert.alert(
            'Remove from Favorites',
            `Remove ${lawyer.fullName} from your favorites?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        if (!user?.uid) return;
                        try {
                            await removeFavorite(user.uid, lawyer.userId);
                            setFavorites(prev => prev.filter(f => f.userId !== lawyer.userId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove from favorites');
                        }
                    },
                },
            ]
        );
    };

    const handleLawyerPress = (lawyer: LawyerProfile) => {
        navigation.navigate('LawyerDetail', { lawyerId: lawyer.userId });
    };

    const renderLawyerCard = ({ item }: { item: LawyerProfile }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface.primary }]}
            onPress={() => handleLawyerPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                <LinearGradient
                    colors={['#d4af37', '#f4d03f']}
                    style={styles.avatar}
                >
                    <Ionicons name="person" size={24} color="#1a365d" />
                </LinearGradient>

                <View style={styles.lawyerInfo}>
                    <Text variant="labelLarge" color="primary">{item.fullName}</Text>
                    <Text variant="bodySmall" color="secondary" numberOfLines={1}>
                        {item.specializations?.join(', ') || 'Lawyer'}
                    </Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#d4af37" />
                        <Text variant="caption" color="tertiary" style={{ marginLeft: 4 }}>
                            {item.ratingAverage?.toFixed(1) || '0.0'} • {item.experienceYears || 0} yrs exp
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.unfavoriteButton, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleUnfavorite(item)}
                >
                    <Ionicons name="heart-dislike" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={theme.colors.text.tertiary} />
            <Text variant="h3" color="secondary" style={styles.emptyTitle}>
                No Favorites Yet
            </Text>
            <Text variant="bodyMedium" color="tertiary" style={styles.emptyText}>
                When you favorite lawyers, they'll appear here for quick access.
            </Text>
            <TouchableOpacity
                style={[styles.browseButton, { backgroundColor: theme.colors.brand.primary }]}
                onPress={() => navigation.navigate('Lawyers')}
            >
                <Text variant="labelMedium" style={{ color: '#FFFFFF' }}>Browse Lawyers</Text>
            </TouchableOpacity>
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
                <Text variant="h3" color="primary">Favorite Lawyers</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Favorites List */}
            <FlatList
                data={favorites}
                renderItem={renderLawyerCard}
                keyExtractor={(item) => item.userId}
                contentContainerStyle={[
                    styles.listContent,
                    favorites.length === 0 && styles.emptyList
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
    lawyerInfo: {
        flex: 1,
        marginLeft: 14,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    unfavoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
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
    browseButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 24,
    },
});

export default FavoritesScreen;
