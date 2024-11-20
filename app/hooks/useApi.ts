import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { OpenAI } from 'openai';
import { useLicenceContext  } from '../contexts/apiKeyContext';
import axios, { AxiosResponse } from 'axios';
import { BASE_URL } from '../config'; 
import { getItem } from '../utils/storage';

// Enum for message roles
export enum Role {
    User = 'user',
    Assistant = 'assistant',
}

// Interface for messages
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
    images: string[];  // Adjusted to array of strings
    location: string;
    parking_space: string;
    price: string;
    property_name: string;
    property_type: string;
    status: string;
    url: string;
}


// Main hook for API interaction
export const useApi = () => {
    const parsePropertyMetadata = (metadata: any) => {
        // Check if metadata exists and is an array
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
                images: JSON.parse(item.images),  // Parsing images from JSON string
                location: item.location || '',
                parking_space: item.parking_space || '',
                price: item.price || '',
                property_name: item.property_name || '',
                property_type: item.property_type || '',
                status: item.status || '',
                url: item.url || '',
            }));

            // Update state with parsed properties
            setProperties(parsedProperties);
            console.log(`Setting: ${parsedProperties}`)
        } else {
            Alert.alert('Data Error', 'Unexpected response structure from API.');
            console.log("Unexpected response structure from API.")
        }
    }

    // State to store all chat messages
    const [messages, setMessages] = useState<Message[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    // Function to fetch chat history from the API
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
                // Map over the data to convert it into an array of Message objects
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

                // Update messages state with the chat history
                setMessages(chatHistory);

                const lastChatEntry = data[data.length - 1];
                console.log(lastChatEntry)
                if (lastChatEntry && lastChatEntry.metadata) {
                    console.log(lastChatEntry.metadata)
                    parsePropertyMetadata(JSON.parse(lastChatEntry.metadata));
                } else {
                    console.log("not found")
                }

            } else {
                Alert.alert('Data Error', 'Unexpected response structure from API.');
                console.log("Unexpected response structure from API.");
            }
        } catch (error) {
            // Handle any errors that occur during the request
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            Alert.alert('Error', errorMessage);
            console.log(errorMessage);
        }
    };

    // Fetching chat history when the component mounts
    useEffect(() => {
        fetchChatHistory();
    }, []);

    // Function to get a completion from OpenAI
    const getCompletion = async (prompt: string) => {

        // Create a new user message with the prompt
        const userMessage: Message = {
            content: prompt,
            role: Role.User,
        };

        // Update messages state with the new user message
        const chatHistory = [...messages, userMessage];
        setMessages(chatHistory);

        try {
            const jwt = await getItem('token')
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`, // If needed
              };

            if (!prompt || typeof prompt !== 'string') {
            throw new Error('Prompt is invalid');
            }
            
            const dataToSend = {
                "message": prompt
            }

            const response: AxiosResponse = await axios.post(`${BASE_URL}/chat`, dataToSend, { headers });
            const data = response.data;
            const aiResponse = response.data.response || 'An error occurred';
            console.log(response.data)

            // Create a new AI message with the AI's response
            const aiMessage: Message = {
                content: aiResponse,
                role: Role.Assistant,
            };

            // Update messages state with the new AI message
            setMessages((prevMessages) => [...prevMessages, aiMessage]);

            parsePropertyMetadata(data.metadata)

        } catch (error) {
            // Handle any errors that occur during the completion request
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';

            // Create a new AI message with the error message
            const aiMessage: Message = {
                content: errorMessage,
                role: Role.Assistant,
            };

            // Update messages state with the new AI message
            setMessages((prevMessages) => [...prevMessages, aiMessage]);
        }
    };


    return {
        messages,
        getCompletion,
        properties,
    };
};