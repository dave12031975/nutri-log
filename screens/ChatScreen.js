import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { View, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatService } from '../utils/chatService';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Initialisiere mit Willkommensnachricht
    setMessages([
      {
        _id: 1,
        text: 'Hallo! Wie kann ich Ihnen heute helfen?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'AI Assistant',
          avatar: require('../assets/images/ai-avatar.png'),
        },
      },
    ]);

    // Lade Chat-Verlauf aus Supabase
    loadChatHistory();

    // Abonniere Echtzeit-Updates
    const unsubscribe = chatService.subscribeToMessages((newMessage) => {
      if (newMessage.user._id !== 1) { // Nur Nachrichten von anderen anzeigen
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, [newMessage])
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadChatHistory = async () => {
    const history = await chatService.loadMessages();
    if (history.length > 0) {
      setMessages(history);
    }
  };

  const onSend = useCallback(async (messages = []) => {
    // Füge Benutzernachricht hinzu
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages)
    );

    // Speichere in Supabase
    const userMessage = messages[0];
    await chatService.saveMessage(userMessage);

    // Zeige Tipp-Indikator
    setIsTyping(true);

    try {
      // Hole AI-Antwort
      const aiResponse = await chatService.getAIResponse(userMessage.text);
      
      const aiMessage = {
        _id: Math.random().toString(),
        text: aiResponse,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'AI Assistant',
          avatar: require('../assets/images/ai-avatar.png'),
        },
      };

      // Füge AI-Antwort hinzu
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [aiMessage])
      );

      // Speichere AI-Antwort in Supabase
      await chatService.saveMessage(aiMessage);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f0f0f0',
            borderRadius: 18,
            marginLeft: 0,
          },
          right: {
            backgroundColor: '#007AFF',
            borderRadius: 18,
            marginRight: 0,
          },
        }}
        textStyle={{
          left: {
            color: '#000',
            fontSize: 16,
          },
          right: {
            color: '#fff',
            fontSize: 16,
          },
        }}
        bottomContainerStyle={{
          left: {
            borderBottomLeftRadius: 18,
            borderBottomRightRadius: 18,
          },
          right: {
            borderBottomLeftRadius: 18,
            borderBottomRightRadius: 18,
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 6,
          paddingHorizontal: 8,
        }}
        primaryStyle={{
          borderRadius: 24,
          borderColor: '#e0e0e0',
          borderWidth: 1,
          paddingHorizontal: 12,
          minHeight: 40,
          justifyContent: 'center',
        }}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={{ marginRight: 10, marginBottom: 5 }}>
          <Ionicons name="send" size={24} color="#007AFF" />
        </View>
      </Send>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1,
          name: 'User',
        }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        placeholder="Nachricht eingeben..."
        alwaysShowSend
        scrollToBottom
        keyboardShouldPersistTaps="handled"
        isTyping={isTyping}
        renderFooter={() => 
          isTyping ? (
            <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : null
        }
      />
      {Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />}
    </View>
  );
}