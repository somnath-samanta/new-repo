const screen = Dimensions.get("window");
const screenWidth = screen.width;
const screenheight = screen.height;
import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";

const LoginAnimation = () => {
  const scale = useSharedValue(1); // Start at normal size

  useEffect(() => {
    // Create a continuous bouncing effect
    scale.value = withRepeat(
      withTiming(1.2, {
        duration: 500, // Time for each bounce (scale up)
        easing: Easing.out(Easing.ease), // Smooth easing
      }),
      -1, // Infinite repeat
      true // Reverse the animation (scale down after scaling up)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* <Text>Welcome to </Text> */}
      <Animated.Image
        source={require("../../Modules/Login/Public/images/logo.png")} // Update with your logo path
        style={[styles.logo, animatedStyle]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
   //flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dff7f8", // Customize as needed
    width:screenWidth,
    height:screenheight,
    position:'absolute',
    left:0,
    top:0,
    zIndex:999,
    margin:0,
    padding:0,
    //marginTop:30,
  },
  logo: {
    width: 150,
    height: 150,
    objectFit:'contain',
  },
});

export default LoginAnimation;
