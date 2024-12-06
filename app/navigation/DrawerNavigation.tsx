// DrawerNavigation.tsx

import React, { useState, useContext } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Text,
    SafeAreaView,
    Switch,
    Image,
    Alert,
    TouchableWithoutFeedback,
} from 'react-native';
import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItem,
    createDrawerNavigator,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import ChatPage from '../screens/Chat'; 
import ApiKeyPage from '../screens/ApiKey';
import { AuthContext } from '../contexts/authContext'; 
import { useApi } from '../hooks/useApi'; 
import { ThemeContext } from '../../App'; // Import the ThemeContext

type DrawerParamList = {
    Chat: undefined;
    ApiKeyPage: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
    const { colors } = useContext(ThemeContext);
    return (
        <View style={[styles.drawerContainer, { backgroundColor: colors.background }]}>
            <DrawerContentScrollView {...props}>
                <DrawerItem
                    label='Chat'
                    labelStyle={[styles.drawerItemLabel, { color: colors.text }]}
                    icon={() => <Ionicons name='chatbubble-outline' size={24} color={colors.text} />}
                    onPress={() => props.navigation.navigate('Chat')}
                />
            </DrawerContentScrollView>

            <View style={styles.footerContainer}>
                <DrawerItem
                    label='Nuevo Chat'
                    labelStyle={[styles.drawerItemLabel, { color: colors.text }]}
                    icon={() => <Ionicons name='key-outline' size={24} color={colors.text} />}
                    onPress={() => props.navigation.navigate('ApiKeyPage')}
                />
            </View>
        </View>
    );
};

const DrawerNavigation = () => {
    const { logout } = useContext(AuthContext);
    const { messages, getCompletion, resetChat, properties, setLicenceKey, saveLicenceKey, licenceKey, licenceKeyLoaded } = useApi();
    const [isConfigModalVisible, setConfigModalVisible] = useState(false);
    const [isNewMessageModalVisible, setNewMessageModalVisible] = useState(false);

    const { isDarkTheme, toggleTheme, colors } = useContext(ThemeContext);

    const toggleConfigModal = () => {
        setConfigModalVisible(!isConfigModalVisible);
    };

    const toggleNewMessageModal = () => {
        setNewMessageModalVisible(!isNewMessageModalVisible);
    };

    // Handler para cerrar sesión
    const handleLogout = async () => {
        await logout();
    };

    const handleConfirmResetChat = async () => {
        setNewMessageModalVisible(false);
        await resetChat();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Drawer.Navigator
                initialRouteName='Chat'
                drawerContent={CustomDrawerContent}
                screenOptions={({ navigation }) => ({
                    headerTintColor: colors.text,
                    headerStyle: {
                        backgroundColor: colors.headerBackground,
                    },
                    drawerType: 'front',
                    swipeEnabled: false,
                    headerLeft: () => (
                        <View>
                            <TouchableOpacity onPress={toggleConfigModal} style={styles.headerButton}>
                                <Ionicons name='cog-outline' size={34} color={colors.orageColor1} />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerRight: () => (
                        <View style={styles.headerRightContainer}>
                            <TouchableOpacity onPress={toggleNewMessageModal} style={styles.headerButton}>
                                <Ionicons name='add-circle-outline' size={34} color={colors.orageColor1} />
                            </TouchableOpacity>
                        </View>
                    ),
                })}
            >
                <Drawer.Screen name='Chat'>
                    {props => (
                        <ChatPage
                            {...props}
                            messages={messages}
                            getCompletion={getCompletion}
                            properties={properties}
                            setLicenceKey={setLicenceKey}
                            saveLicenceKey={saveLicenceKey}
                            licenceKey={licenceKey}
                            licenceKeyLoaded={licenceKeyLoaded}
                        />
                    )}
                </Drawer.Screen>
                <Drawer.Screen
                    name='ApiKeyPage'
                    component={ApiKeyPage}
                    options={{ headerTitle: "API Key" }}
                />
            </Drawer.Navigator>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isConfigModalVisible}
                onRequestClose={toggleConfigModal}
            >
                <TouchableWithoutFeedback onPress={toggleConfigModal}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.modalContent, { backgroundColor: colors.modalContentBackground }]}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Configuración</Text>

                                <View style={styles.profileContainer}>
                                    <Image
                                        source={{ uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }}
                                        style={styles.profileIcon}
                                    />
                                    <Text style={[styles.usernameText, { color: colors.text }]}>Uziel</Text>
                                </View>

                                <View style={[styles.separator, { backgroundColor: colors.border }]} />
                                <View style={styles.themeContainer}>
                                    <Text style={[styles.themeText, { color: colors.text }]}>Tema</Text>
                                    <Switch
                                        value={isDarkTheme}
                                        onValueChange={toggleTheme}
                                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                                        thumbColor={isDarkTheme ? '#f5dd4b' : '#f4f3f4'}
                                    />
                                </View>

                                <View style={[styles.separator, { backgroundColor: colors.border }]} />

                                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                                    <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isNewMessageModalVisible}
                onRequestClose={toggleNewMessageModal}
            >
                <TouchableWithoutFeedback onPress={toggleNewMessageModal}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.modalContent, { backgroundColor: colors.modalContentBackground }]}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Confirmación</Text>
                                <Text style={[styles.modalText, { color: colors.text }]}>¿Desea iniciar un nuevo chat?</Text>

                                <View style={styles.confirmButtonsContainer}>
                                    <TouchableOpacity onPress={handleConfirmResetChat} style={styles.confirmButton}>
                                        <Text style={styles.confirmButtonText}>Sí</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={toggleNewMessageModal} style={styles.confirmButton}>
                                        <Text style={styles.confirmButtonText}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
        padding: 8,
        paddingTop: 16,
    },
    drawerItemLabel: {
        // color is handled dynamically
    },
    footerContainer: {
        borderTopWidth: 1,
        marginBottom: 20,
        paddingTop: 10,
    },
    headerButton: {
        marginHorizontal: 10,
    },
    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    usernameText: {
        fontSize: 18,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        marginVertical: 10,
    },
    themeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    themeText: {
        fontSize: 18,
    },
    logoutButton: {
        backgroundColor: '#ff4d4d',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    confirmButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
    },
    confirmButton: {
        backgroundColor: '#FF6101',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginHorizontal: 10,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default DrawerNavigation;