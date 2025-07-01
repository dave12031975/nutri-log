import { supabase } from './supabase';

export const chatService = {
  // Speichere Nachricht in Supabase
  async saveMessage(message) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          id: message._id,
          text: message.text,
          user_id: message.user._id,
          user_name: message.user.name,
          user_avatar: message.user.avatar,
          created_at: message.createdAt,
        }]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  },

  // Lade Chat-Verlauf
  async loadMessages() {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data?.map(msg => ({
        _id: msg.id,
        text: msg.text,
        createdAt: new Date(msg.created_at),
        user: {
          _id: msg.user_id,
          name: msg.user_name,
          avatar: msg.user_avatar,
        },
      })) || [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  },

  // Simuliere AI-Antwort (später durch echten AI-Service ersetzen)
  async getAIResponse(userMessage) {
    const responses = [
      "Das ist eine interessante Frage! Lass mich darüber nachdenken...",
      "Ich verstehe. Können Sie mir mehr Details dazu geben?",
      "Basierend auf Ihrer Anfrage würde ich folgendes vorschlagen...",
      "Das klingt nach einer guten Idee! Haben Sie schon überlegt, wie Sie das umsetzen möchten?",
      "Interessant! Aus meiner Perspektive gibt es mehrere Möglichkeiten...",
    ];

    // Simuliere Denkzeit
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    return responses[Math.floor(Math.random() * responses.length)];
  },

  // Echtzeit-Updates abonnieren
  subscribeToMessages(callback) {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new;
          callback({
            _id: msg.id,
            text: msg.text,
            createdAt: new Date(msg.created_at),
            user: {
              _id: msg.user_id,
              name: msg.user_name,
              avatar: msg.user_avatar,
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  },
};