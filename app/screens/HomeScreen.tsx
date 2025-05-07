import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigation } from '@react-navigation/native';
import { colors, textColors } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigatorParamList } from '../navigation/types/navigation';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { getProductUserHistory } from '../services/api/productApi';
import { setIsNewProduct } from '../store/slices/ocrSlice';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabNavigatorParamList, 'Home'>,
  StackNavigationProp<TabNavigatorParamList>
>;

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [history, setHistory] = useState<any[]>([]);

  const handleNewProduct = () => {
    dispatch(setIsNewProduct(true));
    navigation.navigate('Inventory', { screen: 'Camera' });
  };

  const handleExistingProduct = () => {
    dispatch(setIsNewProduct(false));
    navigation.navigate('Inventory', { screen: 'Camera' });
  };

  const fetchHistory = async () => {
    const history = await getProductUserHistory();
    const sortedHistory = history.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const recentHistory = sortedHistory.slice(0, 5);
    setHistory(recentHistory);
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={32} color={colors.primary} style={styles.userIcon} />
        <Text style={styles.greeting}>
          Welcome, {user?.username || 'User'}!
        </Text>
      </View>
      
      <Divider style={styles.divider} />

      <View style={styles.cardWrapper}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash-outline" size={24} color={colors.white} />
            <Text style={styles.cardHeaderText}>Quick Actions</Text>
          </View>
          <Card.Content style={styles.cardContent}>
            <Button 
              mode="contained" 
              onPress={handleExistingProduct}
              style={styles.button}
              icon="barcode-scan"
              buttonColor={colors.primary}
            >
              Scan Existing Product
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Inventory', { 
                screen: 'ProductList',
                params: {}
              })}
              style={styles.button}
              icon="view-list"
              textColor={colors.primary}
            >
              View Inventory
            </Button>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.cardWrapper}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="stats-chart-outline" size={24} color={colors.white} />
            <Text style={styles.cardHeaderText}>Inventory Summary</Text>
          </View>
          <Card.Content style={styles.cardContent}>
            <View style={styles.summaryItem}>
              <Ionicons name="cube-outline" size={24} color={colors.primary} />
              <Text style={styles.summaryText}>Your inventory overview will appear here.</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.cardWrapper}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={24} color={colors.white} />
            <Text style={styles.cardHeaderText}>Recent Activity</Text>
          </View>
          <Card.Content style={styles.cardContent}>
            {history.map((item, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityDot} />
                <Text style={styles.activityText}>{item.action}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userIcon: {
    marginRight: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  divider: {
    backgroundColor: colors.primary,
    opacity: 0.2,
    height: 1,
    marginBottom: 20,
  },
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  card: {
    elevation: 4,
  },
  cardHeader: {
    backgroundColor: colors.primary,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  cardContent: {
    padding: 16,
    backgroundColor: colors.white,
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    marginLeft: 12,
    color: textColors.primary,
  },
  activityItem: {
    flexDirection: 'row', 
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  activityText: {
    color: textColors.primary,
    flex: 1,
    flexWrap: 'wrap',
  },
});

export default HomeScreen; 