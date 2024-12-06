// app/hooks/useApi.tsx

import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import axios, { AxiosResponse } from 'axios';
import { BASE_URL } from '../config'; 
import { getItem } from '../utils/storage';

export enum Role {
    User = 'user',
    Assistant = 'assistant',
}

export interface Message {
    content: string;
    role: Role;
}

export interface Property {
    amenities: string;
    area_m2: string;
    bathrooms: string;
    bedrooms: string;
    broker_contact_1: string;
    broker_contact_2: string | null;
    broker_contact_3: string | null;
    broker_name: string;
    currency: string;
    google_map_location: string;
    half_bathrooms: string;
    images: string[];
    location: string;
    parking_space: string;
    price: string;
    property_name: string;
    property_type: string;
    status: string;
    url: string;
}

export const useApi = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [licenceKey, setLicenceKey] = useState<string>('');
    const [licenceKeyLoaded, setLicenceKeyLoaded] = useState(false);

    const parsePropertyMetadata = (metadata: any) => {
        if (metadata && Array.isArray(metadata)) {
            const parsedProperties: Property[] = metadata.map((item: any) => ({
                amenities: item.amenities || '',
                area_m2: item.area_m2 || '',
                bathrooms: item.bathrooms || '',
                bedrooms: item.bedrooms || '',
                broker_contact_1: item.broker_contact_1 || '',
                broker_contact_2: item.broker_contact_2 !== 'nan' ? item.broker_contact_2 : null,
                broker_contact_3: item.broker_contact_3 !== 'nan' ? item.broker_contact_3 : null,
                broker_name: item.broker_name || '',
                currency: item.currency || '',
                google_map_location: `https://www.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed`,
                half_bathrooms: item.half_bathrooms || '',
                images: JSON.parse(item.images),
                location: item.location || '',
                parking_space: item.parking_space || '',
                price: item.price || '',
                property_name: item.property_name || '',
                property_type: item.property_type || '',
                status: item.status || '',
                url: item.url || '',
            }));

            setProperties(parsedProperties);
            console.log(`Setting: ${parsedProperties}`);
        } else {
            Alert.alert('Error de Datos', 'Estructura de respuesta inesperada desde la API.');
            console.log("Estructura de respuesta inesperada desde la API.");
        }
    };

    const fetchChatHistory = async () => {
        try {
            const jwt = await getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            };

            const response: AxiosResponse = await axios.get(`${BASE_URL}/get_chat_history`, { headers });
            const data = response.data;
            if (data && Array.isArray(data)) {
                const chatHistory: Message[] = data.map((item: any) => {
                    const userMessage: Message = {
                        content: item.user_message,
                        role: Role.User,
                    };

                    const assistantMessage: Message = {
                        content: item.bot_response,
                        role: Role.Assistant,
                    };

                    return [userMessage, assistantMessage];
                }).flat();

                setMessages(chatHistory);

                console.log(chatHistory)

                const lastChatEntry = data[data.length - 1];
                console.log(`Last chat entry: ${lastChatEntry}`);
                if (lastChatEntry && lastChatEntry.metadata) {
                    console.log(lastChatEntry.metadata);
                    parsePropertyMetadata(JSON.parse(lastChatEntry.metadata));
                } else {
                    console.log("No se encontró metadata");
                }

            } else {
                Alert.alert('Error de Datos', 'Estructura de respuesta inesperada desde la API.');
                console.log("Estructura de respuesta inesperada desde la API.");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error';
            Alert.alert('Error', errorMessage);
            console.log(errorMessage);
        }
    };

    const getCompletion = async (prompt: string) => {
        const userMessage: Message = {
            content: prompt,
            role: Role.User,
        };

        const chatHistory = [...messages, userMessage];
        setMessages(chatHistory);

        try {
            const jwt = await getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            };

            if (!prompt || typeof prompt !== 'string') {
                throw new Error('El prompt es inválido');
            }
            
            const dataToSend = {
                "message": prompt
            };

            const response: AxiosResponse = await axios.post(`${BASE_URL}/chat`, dataToSend, { headers });
            const data = response.data;
            const aiResponse = response.data.response || 'Ocurrió un error';
            console.log(response.data);

            const aiMessage: Message = {
                content: aiResponse,
                role: Role.Assistant,
            };

            setMessages((prevMessages) => [...prevMessages, aiMessage]);

            parsePropertyMetadata(data.metadata);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error';

            const aiMessage: Message = {
                content: errorMessage,
                role: Role.Assistant,
            };

            setMessages((prevMessages) => [...prevMessages, aiMessage]);
        }
    };

    const resetChat = async () => {
        try {
            const jwt = await getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            };

            const response: AxiosResponse = await axios.post(`${BASE_URL}/reset-chat`, {}, { headers });
            if (response.status === 200) {
                Alert.alert('Éxito', 'El chat ha sido reiniciado correctamente.');
                setMessages([]);
                setProperties([]);
            } else {
                Alert.alert('Error', 'No se pudo reiniciar el chat. Por favor, intenta nuevamente.');
                console.log('Error al reiniciar el chat:', response.data);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error';
            Alert.alert('Error', `No se pudo reiniciar el chat: ${errorMessage}`);
            console.log(errorMessage);
        }
    };

    const fetchLicenceKey = async () => {
        try {
            const jwt = await getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            };
    
            const response: AxiosResponse = await axios.get(`${BASE_URL}/get_licence_key`, { headers });
            const data = response.data;
            if (data && typeof data.licence_key === 'string') {
                setLicenceKey(data.licence_key);
            } else {
                setLicenceKey('');
            }
        } catch (error) {
            console.log('Error fetching licence key', error);
            setLicenceKey('');
        } finally {
            // Set licenceKeyLoaded to true after fetching
            setLicenceKeyLoaded(true);
        }
    };    

    const saveLicenceKey = async (key: string) => {
        try {
            const jwt = await getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            };
            const body = { licence_key: key };
            await axios.post(`${BASE_URL}/save_licence_key`, body, { headers });
        } catch (error) {
            console.log('Error saving licence key:', error);
        }
    };

    useEffect(() => {
        // Fetch licence key first
        fetchLicenceKey();
        // Then fetch chat history
        fetchChatHistory();
    }, []);

    return {
        messages,
        getCompletion,
        properties,
        resetChat,
        licenceKey, 
        setLicenceKey, 
        saveLicenceKey,
        licenceKeyLoaded
    };
};