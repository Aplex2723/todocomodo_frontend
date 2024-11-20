// app/screens/SplashScreen.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  return (
    <View style={styles.container}>
      <Video
        source={require('../../assets/intro.mp4')} // Update the path to your video file
        style={styles.video}
        resizeMode="contain"
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            onFinish();
          }
        }}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Set your desired background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '80%', // Adjust as needed
    height: '80%', // Adjust as needed
  },
});