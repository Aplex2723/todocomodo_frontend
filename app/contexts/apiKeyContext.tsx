import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface LicenceKeyContextType {
    licenceKey: string;
    setLicenceKey: (key: string) => void;
}

// Create API key context
const LicenceKeyContext = createContext<LicenceKeyContextType | undefined>(undefined);

// API key context provider component
export const ApiKeyContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [licenceKey, setApiKeyState] = useState<string>('');

    // Load API key from storage on component mount
    useEffect(() => {
        const loadLicenceKey = async () => {
            const key = await AsyncStorage.getItem('licenceKey');
            setLicenceKey(key || '');
        };

        loadLicenceKey();
    }, []);

    // Function to update the API key state and save it to storage
    const setLicenceKey = async (key: string) => {
        setApiKeyState(key);
        await AsyncStorage.setItem('licenceKey', key);
    };


    return (
        <LicenceKeyContext.Provider value={{ licenceKey, setLicenceKey }}>
            {children}
        </LicenceKeyContext.Provider>
    );
};

// Custom hook to use the API key context
export const useLicenceContext = (): LicenceKeyContextType => {

    const context = useContext(LicenceKeyContext);

    if (!context) {
        throw new Error('useApiKeyContext must be used within an ApiKeyContextProvider');
    }

    return context;
};