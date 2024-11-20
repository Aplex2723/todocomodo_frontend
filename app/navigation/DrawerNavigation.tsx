// app/navigation/DrawerNavigation.tsx

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
} from 'react-native';
import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItem,
    createDrawerNavigator,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import Chat from '../screens/Chat';
import ApiKeyPage from '../screens/ApiKey';
import { AuthContext } from '../contexts/authContext'; // Adjust the path if necessary

type DrawerParamList = {
    Chat: undefined;
    ApiKeyPage: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
    return (
        <View style={styles.drawerContainer}>
            <DrawerContentScrollView {...props}>
                <DrawerItem
                    label='Chat'
                    labelStyle={styles.drawerItemLabel}
                    icon={() => <Ionicons name='chatbubble-outline' size={24} color='white' />}
                    onPress={() => props.navigation.navigate('Chat')}
                />
            </DrawerContentScrollView>

            <View style={styles.footerContainer}>
                <DrawerItem
                    label='Nuevo Chat'
                    labelStyle={styles.drawerItemLabel}
                    icon={() => <Ionicons name='key-outline' size={24} color='white' />}
                    onPress={() => props.navigation.navigate('ApiKeyPage')}
                />
            </View>
        </View>
    );
};

const DrawerNavigation = () => {
    const { logout } = useContext(AuthContext);

    // State for Configuration Modal
    const [isConfigModalVisible, setConfigModalVisible] = useState(false);
    // State for New Message Modal
    const [isNewMessageModalVisible, setNewMessageModalVisible] = useState(false);
    // State for Theme Switching
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    // Handlers to toggle modals
    const toggleConfigModal = () => {
        setConfigModalVisible(!isConfigModalVisible);
    };

    const toggleNewMessageModal = () => {
        setNewMessageModalVisible(!isNewMessageModalVisible);
    };

    // Handler to toggle theme
    const toggleTheme = () => {
        setIsDarkTheme(previousState => !previousState);
        // Add your theme switching logic here
    };

    // Handler for logout
    const handleLogout = async () => {
        await logout()
        
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Drawer.Navigator
                initialRouteName='Chat'
                drawerContent={CustomDrawerContent}
                screenOptions={({ navigation }) => ({
                    headerTintColor: '#fff',
                    headerStyle: {
                        backgroundColor: '#0D0D0D',
                    },
                    drawerType: 'front',
                    swipeEnabled: false,
                    headerLeft: () => (
                        <View>
                            {/* Configuration Button */}
                            <TouchableOpacity onPress={toggleConfigModal} style={styles.headerButton}>
                                <Ionicons name='cog-outline' size={24} color='white' />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerRight: () => (
                        <View style={styles.headerRightContainer}>
                            {/* New Message Button */}
                            <TouchableOpacity onPress={toggleNewMessageModal} style={styles.headerButton}>
                                <Ionicons name='add-circle-outline' size={24} color='white' />
                            </TouchableOpacity>
                        </View>
                    ),
                })}
            >
                <Drawer.Screen name='Chat' component={Chat} />
                <Drawer.Screen
                    name='ApiKeyPage'
                    component={ApiKeyPage}
                    options={{ headerTitle: "API Key" }}
                />
            </Drawer.Navigator>

            {/* Configuration Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isConfigModalVisible}
                onRequestClose={toggleConfigModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header Title */}
                        <Text style={styles.modalTitle}>Configuracion</Text>

                        {/* Two-Column Layout: Profile Icon and Username */}
                        <View style={styles.profileContainer}>
                            <Image
                                source={{ uri: 'https://example.com/profile-icon.png' }} // Replace with actual profile icon URL or local asset
                                style={styles.profileIcon}
                            />
                            <Text style={styles.usernameText}>Username</Text> {/* Replace 'Username' with actual username */}
                        </View>

                        {/* Separator */}
                        <View style={styles.separator} />

                        {/* Theme Switch */}
                        <View style={styles.themeContainer}>
                            <Text style={styles.themeText}>Tema</Text>
                            <Switch
                                value={isDarkTheme}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={isDarkTheme ? '#f5dd4b' : '#f4f3f4'}
                            />
                        </View>

                        {/* Separator */}
                        <View style={styles.separator} />

                        {/* Cerrar Sesion Button */}
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* New Message Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isNewMessageModalVisible}
                onRequestClose={toggleNewMessageModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Message</Text>
                        {/* Add your new message form or content here */}
                        <Text style={styles.modalText}>New message form goes here.</Text>
                        <TouchableOpacity onPress={toggleNewMessageModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
        backgroundColor: '#171717',
        padding: 8,
        paddingTop: 16,
    },
    drawerItemLabel: {
        color: '#fff',
    },
    footerContainer: {
        borderTopColor: '#ffffff33',
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
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
        backgroundColor: '#ccc',
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
    // Existing Modal Styles for consistency
    closeButton: {
        backgroundColor: '#2089dc',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    closeButtonText: {
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