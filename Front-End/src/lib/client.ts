// Lista global de callbacks para simular o broadcast entre instâncias do canal
const globalListeners: { roomName: string; callback: (payload: any) => void }[] = [];

export function createClient() {
  return {
    channel(roomName: string) {
      return {
        // Simula o registro do evento de broadcast
        on(type: 'broadcast', config: { event: string }, callback: (data: { payload: any }) => void) {
          if (type === 'broadcast' && config.event === 'message') {
            globalListeners.push({
              roomName,
              callback: (payload) => callback({ payload }),
            });
          }
          // Retorna o próprio objeto para permitir o "chaining" (.on().subscribe())
          return this;
        },

        // Simula a inscrição no canal
        subscribe() {
          console.log(`[Supabase Mock] Inscrito na sala: ${roomName}`);
          return this;
        },

        // Simula o envio de uma mensagem para todos os listeners da mesma sala
        async send(payload: { type: string; event: string; payload: any }) {
          console.log(`[Supabase Mock] Enviando mensagem para ${roomName}:`, payload.payload);
          
          // Dispara o callback para todos os outros clientes na mesma sala
          // (Filtra para não duplicar na própria tela, já que seu hook faz setMessages localmente)
          globalListeners.forEach((listener) => {
            if (listener.roomName === roomName) {
              // Simulando um delay de rede de 100ms
              setTimeout(() => listener.callback(payload.payload), 100);
            }
          });
        },
      };
    },


    // Simula a remoção do canal para evitar vazamento de memória
    removeChannel(channel: any) {
      console.log(`[Supabase Mock] Canal removido.`);
      console.log(`[Supabase Mock] Lista de listeners antes da remoção:`, globalListeners);
    },
  };
}