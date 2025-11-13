import React, { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export default function PullToRefresh({ children, onRefresh, colors = ['#2196F3', '#4CAF50'] }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={colors}
          tintColor={colors[0]}
          progressBackgroundColor="#FFF"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
