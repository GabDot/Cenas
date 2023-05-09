import React, { useRef,useEffect } from 'react';
import { Animated, View } from 'react-native';

const SlideInFromSide = ({ children }) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    console.log('useEffect called');
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ translateX: slideAnim }],
      }}
    >
        {console.log('SlideInFromSide rendered')}
      {children}
    </Animated.View>
  );
};

export default SlideInFromSide;