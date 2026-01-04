/**
 * INSAF - Case Detail Screen
 *
 * Detailed view of a case with timeline and bids
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { Text } from '../../components/common/Text';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { getCaseById, Case } from '../../services/case.service';
import { getBidsForCase, Bid } from '../../services/bid.service';
import { getUserProfile } from '../../services/auth.service';

type CaseDetailRouteProp = RouteProp<{ CaseDetail: { caseId: string } }, 'CaseDetail'>;

const { width } = Dimensions.get('window');

const getStatusColor = (status: string) => {
  switch (status) {
    case 'POSTED': return '#4CAF50';
    case 'BIDDING': return '#2196F3';
    case 'COMPLETED': return '#9C27B0';
    case 'IN_PROGRESS': return '#FF9800';
    case 'ASSIGNED': return '#009688';
    case 'DRAFT': return '#757575';
    default: return '#757575';
  }
};

export const CaseDetailScreen: React.FC = () => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<CaseDetailRouteProp>();
  const { user } = useAuth();
  const { caseId } = route.params;

  const [activeTab, setActiveTab] = useState('overview');
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [lawyer, setLawyer] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const fetchedCase = await getCaseById(caseId);
        setCaseData(fetchedCase);

        if (fetchedCase) {
          // If case is assigned, fetch lawyer details
          if (fetchedCase.lawyerId) {
            const lawyerProfile = await getUserProfile(fetchedCase.lawyerId);
            setLawyer(lawyerProfile);
          }
        }

        // Fetch bids (only count is needed for lawyer view usually, but we fetch to check ownership)
        const fetchedBids = await getBidsForCase(caseId);
        setBids(fetchedBids);

      } catch (error) {
        console.error('Error loading case detail:', error);
        Alert.alert('Error', 'Failed to load case details');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      loadData();
    }
  }, [caseId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.brand.primary} />
      </View>
    );
  }

  if (!caseData) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <Text>Case not found</Text>
      </View>
    );
  }

  const isAssigned = caseData.status === 'ASSIGNED' || caseData.status === 'IN_PROGRESS' || caseData.status === 'COMPLETED';
  const isOwner = user?.uid === caseData.clientId;

  // Lawyer view logic:
  // If user is NOT the owner (i.e., a lawyer viewing available cases), they should NOT see detailed bids of others.
  // They should only see their own bid if they made one.
  const myBid = !isOwner ? bids.find(b => b.lawyerId === user?.uid) : null;
  const showBidsTab = isOwner || myBid;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={theme.colors.gradient.primary as [string, string]}
          style={[styles.header, { paddingTop: insets.top }]}
        >
          {/* Navigation */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.navActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Case Info */}
          <View style={styles.caseInfo}>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(caseData.status)}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(caseData.status) }]} />
              <Text variant="caption" style={{ color: getStatusColor(caseData.status) }}>
                {caseData.status.replace('_', ' ')}
              </Text>
            </View>
            <Text variant="h2" style={styles.caseTitle} numberOfLines={2}>
              {caseData.title}
            </Text>
            <Text variant="bodySmall" style={styles.caseNumber}>
              Case #{caseData.caseNumber}
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="briefcase-outline" size={18} color="rgba(255,255,255,0.7)" />
              <Text variant="caption" style={styles.statLabel}>{caseData.areaOfLaw.replace('_', ' ')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="cash-outline" size={18} color="rgba(255,255,255,0.7)" />
              <Text variant="caption" style={styles.statLabel}>
                {(caseData.budgetMin || 0).toLocaleString()} - {(caseData.budgetMax || 0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.statDivider} />
            {/* Show Bid Count for Lawyers */}
            <View style={styles.statItem}>
              <Ionicons name="hand-left-outline" size={18} color="rgba(255,255,255,0.7)" />
              <Text variant="caption" style={styles.statLabel}>{bids.length} Bids</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['overview', 'timeline'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { borderBottomColor: theme.colors.brand.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                variant="labelMedium"
                style={{ color: activeTab === tab ? theme.colors.brand.primary : theme.colors.text.secondary }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
          {/* Only show Bids tab if owner or has bid */}
          {(showBidsTab) && (
            <TouchableOpacity
              key="bids"
              style={[
                styles.tab,
                activeTab === 'bids' && { borderBottomColor: theme.colors.brand.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab('bids')}
            >
              <Text
                variant="labelMedium"
                style={{ color: activeTab === 'bids' ? theme.colors.brand.primary : theme.colors.text.secondary }}
              >
                Bids
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'overview' && (
            <>
              {/* Description */}
              <View>
                <Text variant="h4" color="primary" style={styles.sectionTitle}>Description</Text>
                <Card style={styles.descriptionCard}>
                  <Text variant="bodyMedium" color="secondary" style={styles.descriptionText}>
                    {caseData.description}
                  </Text>
                </Card>
              </View>

              {/* Assigned Lawyer - Only show if assigned and user is allowed to see (Owner or the assigned lawyer) */}
              {isAssigned && lawyer && (isOwner || user?.uid === caseData.lawyerId) && (
                <View>
                  <Text variant="h4" color="primary" style={styles.sectionTitle}>Assigned Lawyer</Text>
                  <Card style={styles.lawyerCard}>
                    <View style={styles.lawyerRow}>
                      <LinearGradient
                        colors={['#1a365d', '#2d4a7c']}
                        style={styles.lawyerAvatar}
                      >
                        <Ionicons name="person" size={24} color="#d4af37" />
                      </LinearGradient>
                      <View style={styles.lawyerInfo}>
                        <Text variant="labelLarge" color="primary">{lawyer.displayName}</Text>
                        <Text variant="caption" color="secondary">{lawyer.email}</Text>
                      </View>
                      <TouchableOpacity>
                        <Ionicons name="chatbubble-outline" size={22} color={theme.colors.brand.primary} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                </View>
              )}

              {/* Show Bid Button for Lawyers if not assigned and no bid yet */}
              {!isOwner && !isAssigned && !myBid && (
                <View style={{ marginTop: 24 }}>
                  <Button
                    title="Submit A Bid"
                    variant="gradient"
                    onPress={() => (navigation as any).navigate('SubmitBid', { caseId: caseData.id })}
                  />
                </View>
              )}
            </>
          )}

          {activeTab === 'bids' && (
            <View>
              <Text variant="h4" color="primary" style={styles.sectionTitle}>
                {isOwner ? `Received Bids (${bids.length})` : 'My Bid'}
              </Text>
              {/* If Owner: Show all bids. If Lawyer: Show only myBid */}
              {(isOwner ? bids : (myBid ? [myBid] : [])).map((bid) => (
                <Card key={bid.id} style={styles.bidCard}>
                  <View style={styles.bidHeader}>
                    <LinearGradient
                      colors={['#1a365d', '#2d4a7c']}
                      style={styles.bidAvatar}
                    >
                      <Ionicons name="person" size={20} color="#d4af37" />
                    </LinearGradient>
                    <View style={styles.bidInfo}>
                      {/* Lawyer Name is visible to Owner */}
                      <Text variant="labelLarge" color="primary">{isOwner ? 'Lawyer Bid' : 'My Proposal'}</Text>
                      <Text variant="caption" color="secondary">
                        {new Date(bid.createdAt.toDate()).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodySmall" color="secondary" style={styles.bidProposal}>
                    {bid.proposalText}
                  </Text>
                  <View style={styles.bidFooter}>
                    <View>
                      <Text variant="caption" color="tertiary">Bid Amount</Text>
                      <Text variant="h4" color="brand">Rs. {(bid.proposedFee || 0).toLocaleString()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="caption" color="tertiary">Delivery</Text>
                      <Text variant="labelMedium" color="primary">{bid.estimatedTimeline}</Text>
                    </View>
                  </View>
                  {isOwner && (
                    <View style={styles.bidActions}>
                      <Button
                        title="View Profile"
                        variant="outline"
                        size="sm"
                        style={{ flex: 1, marginRight: 8 }}
                        onPress={() => Alert.alert('View Profile', 'Navigate to lawyer profile')}
                      />
                      <Button
                        title="Accept Bid"
                        variant="gradient"
                        size="sm"
                        style={{ flex: 1 }}
                        onPress={() => Alert.alert('Accept Bid', 'Implement accept bid logic')}
                      />
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}

          {activeTab === 'timeline' && (
            <View>
              <Text>Timeline implementation dependent on real data structure</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingBottom: 24,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caseInfo: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  caseTitle: {
    color: '#FFFFFF',
  },
  caseNumber: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.9)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'space-around'
  },
  tab: {
    paddingVertical: 16,
    alignItems: 'center',
    paddingHorizontal: 12
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    marginTop: 8,
  },
  descriptionCard: {
    padding: 16,
  },
  descriptionText: {
    lineHeight: 22,
  },
  lawyerCard: {
    padding: 16,
  },
  lawyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lawyerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lawyerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bidCard: {
    padding: 16,
    marginBottom: 12,
  },
  bidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bidAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bidProposal: {
    marginBottom: 12,
    lineHeight: 20,
  },
  bidFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    marginBottom: 12,
  },
  bidActions: {
    flexDirection: 'row',
  },
});

export default CaseDetailScreen;
