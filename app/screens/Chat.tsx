// app/screens/ChatPage.tsx

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
  Image,
  Modal,
  TouchableOpacity
} from 'react-native';
import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Role, Message, useApi, Property } from '../hooks/useApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import userImage from '../../assets/user.png';
import aiImage from '../../assets/LogoPng/Original.png';
import { Dimensions } from 'react-native';
import { colors } from '../utils/colors'
import Markdown from 'react-native-markdown-display';

// Get screen width
const screenWidth = Dimensions.get('window').width;
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ChatPage = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { getCompletion, messages, properties } = useApi();
  const flatListRef = useRef<FlatList>(null);

  // Handle sending a user message
  const handleSendMessage = async () => {
    if (text.trim().length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      const messageContent = text.trim();
      setText('');
      setLoading(true);
      await getCompletion(messageContent);
      setLoading(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Render a single message in the chat
  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.role === Role.User;

    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage
            ? styles.userMessageContainer
            : styles.aiMessageContainer,
        ]}
      >
        <Image
          source={isUserMessage ? userImage : aiImage}
          style={isUserMessage ? styles.imageUser : styles.imageAI }
        />
      <View style={{ flex: 1 }}>
        <Markdown
          style={{
            body: {
              color: colors.text, // Matches your custom colors
              fontSize: 16,
            },
            listItem: {
              marginVertical: 5
            }
          }}
        >
          {item.content}
        </Markdown>
      </View>
      </View>
    );
  };

  const renderProperty = ({ item }: { item: Property }) => {
    const amenities = item.amenities
      .split(',')
      .map((amenity, index) => (
        <Text key={index} style={styles.amenityText}>
          • {amenity.trim().charAt(0).toUpperCase()+amenity.trim().slice(1)}
        </Text>
      ));
  
    return (
      <View style={styles.propertyContainer}>
        <View style={styles.propertyHeader}>
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(item.images[0]);
              setImageModalVisible(true);
            }}
          >
            <Image
              source={{ uri: item.images[0] }}
              style={styles.propertyImage}
            />
          </TouchableOpacity>
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyName}>{item.property_name}</Text>
            <Text style={styles.propertyPrice}>
              Precio: {item.price} {item.currency}
            </Text>
          </View>
        </View>
  
        <Text style={styles.propertyAddress}>{item.location}</Text>
  
        <View style={styles.amenitiesContainer}>
          {amenities}
        </View>
  
        <View style={styles.mapContainer}>
        <iframe
          src={item.google_map_location}
          style={styles.map}
          loading="lazy"
        ></iframe>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {selectedImage && (
        <Modal
          visible={isImageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <Pressable
                onPress={() => setImageModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={
          loading ? <ActivityIndicator style={styles.footerIndicator} /> : null
        }
      />
      {showProperties && (
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>Lista de propiedades</Text>
        </View>
      )}

      {/* Property Listings */}
      {showProperties && (
        <FlatList
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
      <View style={styles.inputContainer}>
        <Pressable
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setShowProperties(!showProperties);
          }}
          style={styles.mapButton}
        >
          <Ionicons name="map" size={24} color={colors.mapIconColor} /> {/* Updated */}
        </Pressable>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Message"
            placeholderTextColor={colors.placeholderText} // Updated
            editable={!loading}
            multiline
          />
        </View>
        <Pressable
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={loading}
        >
          <Ionicons name="send" size={24} color={colors.sendIconColor} /> {/* Updated */}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Updated
  },
  sectionHeaderContainer: {
    padding: 10,
    backgroundColor: colors.background, 
    borderBottomWidth: 1,
    borderColor: colors.border, 
  },
  header: {
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: colors.headerBackground, // Optional: If you have a header
  },
  mapButton: {
    padding: 10,
    borderRadius: 8, // Optional: Rounded corners for better aesthetics
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: colors.inputBackground, // Updated
    borderTopWidth: 1,
    borderColor: colors.border, // Updated
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border, // Updated
    borderRadius: 16,
    minHeight: 40,
    backgroundColor: colors.inputBackground, // Updated
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  textInput: {
    color: colors.text, // Updated
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: colors.sendButtonBackground, // Updated
    borderRadius: 99,
    padding: 12,
    marginLeft: 8,
    alignSelf: 'flex-end',
    borderWidth: 2,
    borderColor: colors.border, // Updated
  },
  messageContainer: {
    marginTop: 15,
    gap: 12,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  userMessageContainer: {
    backgroundColor: colors.messageUserBackground, // Updated
    borderRadius: 10, // Optional: Rounded corners
    alignSelf: 'flex-end', // Align user messages to the right
    maxWidth: '80%',
    flexDirection: 'row-reverse',
    padding: 10,
  },
  aiMessageContainer: {
    backgroundColor: colors.messageAiBackground, // Updated
    borderRadius: 10, // Optional: Rounded corners
    alignSelf: 'flex-start', // Align AI messages to the left
    maxWidth: '80%',
    padding: 10,
  },
  imageUser: {
    width: 40,
    height: 40,
    borderRadius: 20, // Make images circular
  },
  imageAI: {
    width: 40,
    height: 40,
  },
  messageText: {
    fontSize: 16,
    flex: 1,
    flexWrap: 'wrap',
    color: colors.text, // Updated
    alignSelf: 'center',
  },
  footerIndicator: {
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
    color: colors.sectionHeader, // Updated
    backgroundColor: colors.background, // Optional: Header background
  },
  propertyContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: colors.propertyBorder,
    backgroundColor: colors.messageAiBackground,
  },
  propertyHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.propertyName,
    marginBottom: 5,
  },
  propertyPrice: {
    fontSize: 16,
    color: colors.propertyPrice,
  },
  propertyAddress: {
    fontSize: 14,
    color: colors.propertyDesc,
    marginBottom: 5,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  amenityText: {
    fontSize: 14,
    color: colors.propertyDesc,
    marginRight: 10,
  },
  propertyDesc: {
    fontSize: 14,
    marginBottom: 5,
    color: colors.propertyDesc, // Updated
  },
  propertyImage: {
    width: 200, // Adjust width as needed
    height: 200, // Adjust height as needed
    borderRadius: 10,
    marginRight: 10,
  },
  propertyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  mapContainer: {
    width: '100%', // Full width
    height: 200, // Adjust height as needed
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay, // Updated
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '50%',
    backgroundColor: colors.modalContentBackground, // White background
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text, // Updated
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text, // Updated
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: colors.closeButtonBackground, // Updated to use color variable
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  closeButtonText: {
    color: colors.closeButtonText, // Updated
    fontSize: 16,
  },
});

export default ChatPage;