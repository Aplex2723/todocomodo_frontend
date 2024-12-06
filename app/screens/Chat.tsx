// app/screens/ChatPage.tsx

import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  LayoutAnimation,
  Image,
  Modal,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Role, Message, Property } from '../hooks/useApi'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import userImage from '../../assets/user.png';
import aiImage from '../../assets/LogoPng/Original.png';
import Markdown from 'react-native-markdown-display';
import { WebView } from 'react-native-webview';
import { ThemeContext } from '../../App'; // Import the ThemeContext

type ChatPageProps = {
  messages: Message[];
  getCompletion: (prompt: string) => Promise<void>;
  properties: Property[];
  licenceKey: string; 
  setLicenceKey: (val: string) => void;
  saveLicenceKey: (key: string) => Promise<void>;
  licenceKeyLoaded: boolean;
};

const ChatPage: React.FC<ChatPageProps> = ({
  messages, getCompletion, properties, licenceKey,
  setLicenceKey, saveLicenceKey, licenceKeyLoaded
}) => {

  const { colors } = useContext(ThemeContext);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showLicenceModal, setShowLicenceModal] = useState(false);
  const [tempLicenceKey, setTempLicenceKey] = useState('');

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (licenceKeyLoaded && !licenceKey) {
      setShowLicenceModal(true);
    } else {
      setShowLicenceModal(false);
    }
  }, [licenceKey, licenceKeyLoaded]);

  const handleSendMessage = async () => {
    if (text.trim().length > 0) {
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

  const validateLicenceKeyFormat = (key: string) => {
    const pattern = /^[A-Za-z0-9_\-]{43}$/;
    return pattern.test(key);
  };

  const handleLicenceKeySubmit = async () => {
    if (validateLicenceKeyFormat(tempLicenceKey)) {
      setLicenceKey(tempLicenceKey);
      await saveLicenceKey(tempLicenceKey);
      setShowLicenceModal(false);
    } else {
      alert('Formato de la clave de licencia no válido. Por favor, revisa e intenta de nuevo.');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.role === Role.User;

    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage
            ? [styles.userMessageContainer, { backgroundColor: colors.messageUserBackground }]
            : [styles.aiMessageContainer, { backgroundColor: colors.messageAiBackground }]
        ]}
      >
        {isUserMessage ? (
          <>
            <View style={{ flex: 1 }}>
              <Markdown
                style={{
                  body: { color: colors.text, fontSize: 15 },
                  listItem: { marginBottom: 5 }
                }}
              >
                {item.content}
              </Markdown>
            </View>
            <Image source={userImage} style={styles.imageUser} />
          </>
        ) : (
          <>
            <Image source={aiImage} style={styles.imageAI} />
            <View style={{ flex: 1 }}>
              <Markdown
                style={{
                  body: { color: colors.text, fontSize: 15 },
                  listItem: { marginBottom: 5 }
                }}
              >
                {item.content}
              </Markdown>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderProperty = ({ item }: { item: Property }) => {
    const amenities = item.amenities
      .split(',')
      .map((amenity, index) => (
        <Text key={index} style={[styles.amenityText, { color: colors.propertyDesc }]}>
          • {amenity.trim().charAt(0).toUpperCase() + amenity.trim().slice(1)}
        </Text>
      ));

    return (
      <View style={[styles.propertyContainer, { backgroundColor: colors.messageAiBackground, borderColor: colors.propertyBorder }]}>
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
            <Text style={[styles.propertyName, { color: colors.propertyName }]}>{item.property_name}</Text>
            <Text style={[styles.propertyPrice, { color: colors.propertyPrice }]}>
              Precio: {item.price} {item.currency}
            </Text>
          </View>
        </View>

        <Text style={[styles.propertyAddress, { color: colors.propertyDesc }]}>{item.location}</Text>

        <View style={styles.amenitiesContainer}>
          {amenities}
        </View>
        <View style={styles.mapContainer}>
          <WebView
            originWhitelist={['*']}
            source={{
              html: `
                <html>
                  <body style="margin:0;padding:0;">
                    <iframe 
                      width="600" 
                      height="450" 
                      frameborder="0" 
                      style="border:0;width:100%;height:100%;" 
                      src="${item.google_map_location}" 
                      allowfullscreen>
                    </iframe>
                  </body>
                </html>
              `
            }}
            style={styles.map}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {selectedImage && (
        <Modal
          visible={isImageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.modalContentBackground }]}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <Pressable
                onPress={() => setImageModalVisible(false)}
                style={[styles.closeButton, { backgroundColor: colors.closeButtonBackground }]}
              >
                <Text style={[styles.closeButtonText, { color: colors.closeButtonText }]}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      <Modal
        visible={showLicenceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalContentBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Ingrese su Clave de Licencia</Text>
            <TextInput
              style={[styles.textInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBackground }]}
              placeholder="Clave de licencia"
              placeholderTextColor={colors.placeholderText}
              value={tempLicenceKey}
              onChangeText={setTempLicenceKey}
            />
            <Pressable style={[styles.closeButton, { backgroundColor: colors.closeButtonBackground }]} onPress={handleLicenceKeySubmit}>
              <Text style={[styles.closeButtonText, { color: colors.closeButtonText }]}>Confirmar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {messages.length === 0 && (
        <View style={[styles.emptyChatContainer, { backgroundColor: colors.background }]}>
          <Image 
            source={require('../../assets/LogoPng/DarkChroma.png')}
            style={styles.emptyChatImage}
            resizeMode="contain"
          />
          <Text style={[styles.emptyChatText, { color: colors.placeholderText }]}>
            Escribe algo para iniciar una conversacion
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        ListFooterComponent={
          loading ? <ActivityIndicator style={styles.footerIndicator} color={colors.orageColor1} /> : null
        }
      />
      {showProperties && (
        <View style={[styles.sectionHeaderContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeader, { color: colors.sectionHeader }]}>Propiedades Recomendadas</Text>
        </View>
      )}

      {showProperties && (
        <FlatList
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item, index) => index.toString()}
        />
      )}

      <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <Pressable
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setShowProperties(!showProperties);
          }}
          style={styles.mapButton}
        >
          <Ionicons name="map" size={24} color={colors.mapIconColor} /> 
        </Pressable>
        <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.inputBackground }]}>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            value={text}
            onChangeText={setText}
            placeholder="Escribe un mensaje"
            placeholderTextColor={colors.placeholderText}
            editable={!loading}
            multiline
          />
        </View>
        <Pressable
          style={[styles.sendButton, { backgroundColor: colors.sendButtonBackground, borderColor: colors.border }]}
          onPress={handleSendMessage}
          disabled={loading}
        >
          <Ionicons name="send" size={24} color={colors.sendIconColor} /> 
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeaderContainer: {
    padding: 10,
    borderBottomWidth: 1,
  },
  mapButton: {
    padding: 10,
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  textInput: {
    fontSize: 16,
  },
  sendButton: {
    borderRadius: 99,
    padding: 12,
    marginLeft: 8,
    alignSelf: 'flex-end',
    borderWidth: 2,
  },
  messageContainer: {
    gap: 12,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    padding: 10,
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
  },
  imageUser: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  imageAI: {
    width: 40,
    height: 40,
  },
  messageText: {
    fontSize: 16,
    flex: 1,
    flexWrap: 'wrap',
    alignSelf: 'center',
  },
  footerIndicator: {
    marginTop: 25,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
  },
  propertyContainer: {
    padding: 15,
    borderBottomWidth: 1,
  },
  propertyHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  propertyPrice: {
    fontSize: 16,
  },
  propertyAddress: {
    fontSize: 14,
    marginBottom: 5,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  amenityText: {
    fontSize: 14,
    marginRight: 10,
  },
  propertyImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  propertyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
  },
  emptyChatContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChatImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyChatText: {
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ChatPage;