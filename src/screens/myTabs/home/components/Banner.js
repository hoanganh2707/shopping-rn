import React, { useEffect, useState, useRef } from 'react';
import { Image, StyleSheet, View, Dimensions, FlatList } from 'react-native';

import { SCREEN_WIDTH } from '~/constants';
import { bannerApi } from '~/apis';
import { useTheme } from '~/config/ThemeContext';

export const Banner = (props) => {
  const { gapHorizontal = 16, borderRadius = 16 } = props; // Increased border radius for premium look
  const { colors } = useTheme();
  
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef();

  const itemWidth = SCREEN_WIDTH - gapHorizontal * 2;
  const itemHeight = 130;  // Fixed, smaller height to avoid huge banners

  useEffect(() => {
    const fetchBanners = async () => {
      const res = await bannerApi.getAll();
      if (res?.data) {
        setBanners(res.data);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    // Auto-scroll logic
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 4000); // 4 seconds

    return () => clearInterval(timer);
  }, [currentIndex, banners.length]);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== currentIndex) {
      setCurrentIndex(roundIndex);
    }
  };

  if (banners.length === 0) return null;

  return (
    <View style={[styles.container, { marginHorizontal: gapHorizontal }]}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Image
            resizeMode='cover'
            style={{
              width: itemWidth,
              height: itemHeight,
              borderRadius: borderRadius,
            }}
            source={{ uri: item.image }}
          />
        )}
      />
      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === currentIndex ? colors.primary : 'rgba(255,255,255,0.5)' },
              i === currentIndex && styles.activeDot
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  pagination: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 14,
    height: 6,
    borderRadius: 3,
  },
});
