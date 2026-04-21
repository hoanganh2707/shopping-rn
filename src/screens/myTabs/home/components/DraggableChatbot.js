import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon, Pressable } from '~/components';
import { SCREENS, SCREEN_WIDTH, SCREEN_HEIGHT } from '~/constants';
import { useTheme } from '~/config/ThemeContext';

const FAB_SIZE = 56;

export const DraggableChatbot = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - FAB_SIZE - 16, y: SCREEN_HEIGHT - FAB_SIZE - 150 })).current;

  // We track whether we're moving or just tapping
  const isMoving = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) => {
        // Trigger pan handling only if movement is beyond a certain threshold
        const isActuallyMoving = Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
        if (isActuallyMoving) isMoving.current = true;
        return isActuallyMoving;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();
        // Snap to edges safely, so it doesn't get lost off-screen
        let newX = pan.x._value;
        let newY = pan.y._value;

        // X boundaries
        if (newX < 0) newX = 16;
        if (newX > SCREEN_WIDTH - FAB_SIZE) newX = SCREEN_WIDTH - FAB_SIZE - 16;

        // Y boundaries
        if (newY < 50) newY = 50;
        if (newY > SCREEN_HEIGHT - FAB_SIZE - 100) newY = SCREEN_HEIGHT - FAB_SIZE - 100;

        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
          friction: 5,
        }).start();

        // Reset moving state after release
        setTimeout(() => {
           isMoving.current = false;
        }, 50);
      },
    })
  ).current;

  const handlePress = () => {
    if (!isMoving.current) {
      navigation.navigate(SCREENS.CHATBOT);
    }
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.fabContainer,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          backgroundColor: colors.primary,
          shadowColor: colors.shadow || '#000',
        }
      ]}
    >
      <Pressable onPress={handlePress} style={styles.button}>
        <Icon name="aliwangwang-o1" size={32} color="#fff" />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 9999, // ensures it sits above everything
  },
  button: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
