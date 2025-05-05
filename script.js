// script.js - Lógica de JavaScript para ÉticaIA

// --- Esperar a que el DOM esté completamente cargado ---
document.addEventListener('DOMContentLoaded', () => {

    // ... [todo tu código anterior sin cambios] ...

    // --- Funcionalidad del Chat (Llamada a Supabase Edge Function) ---
    const chatWidget = document.getElementById('chat-widget');
    const chatHeader = document.getElementById('chat-header');
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatInputField = document.getElementById('chat-input-field');
    const chatSendBtn = document.getElementById('chat-send-btn');

    // *** URL de tu Edge Function Desplegada (¡CORREGIDA!) ***
    const EDGE_FUNCTION_URL = 'https://dilwyaaktqzvmgfhlsqn.supabase.co/functions/v1/abacus-chat-proxy';

    if (chatWidget && chatHeader && chatToggleBtn && chatMessages && chatInputField && chatSendBtn) {
        // Evento para abrir/cerrar el chat
        chatHeader.addEventListener('click', () => {
            chatWidget.classList.toggle('closed');
             const icon = chatToggleBtn.querySelector('i');
             if (icon) {
                icon.classList.toggle('fa-chevron-up');
                icon.classList.toggle('fa-chevron-down');
             }
        });

        // Función para añadir un mensaje al chat
        function addChatMessage(message, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', sender); // Aplica clase 'user' o 'assistant'
            messageDiv.textContent = message;
            if(chatMessages) {
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll automático
            } else {
                console.error("Elemento chatMessages no encontrado al añadir mensaje.");
            }
        }

        // Función para enviar el mensaje y obtener respuesta
        async function sendMessage() {
            if (!chatInputField || !chatSendBtn || !chatMessages) {
                console.error("Elementos del chat no encontrados para enviar mensaje.");
                return;
            }

            const messageText = chatInputField.value.trim();
            if (messageText === '') return; // No enviar mensajes vacíos

            // Verificar si la URL de la función parece válida (simple verificación)
             if (!EDGE_FUNCTION_URL || !EDGE_FUNCTION_URL.startsWith('https://') || EDGE_FUNCTION_URL.includes('TU_SUPABASE_EDGE_FUNCTION_URL')) {
                 console.error("La URL de la Edge Function no está configurada correctamente en script.js.");
                 addChatMessage("Error: El chat no está configurado correctamente (URL inválida). Contacta al administrador.", "assistant");
                 return; // Detener ejecución si la URL no es válida
            }


            addChatMessage(messageText, 'user'); // Mostrar mensaje del usuario
            chatInputField.value = ''; // Limpiar campo de entrada
            chatSendBtn.disabled = true; // Deshabilitar botón mientras se procesa

            // Mostrar mensaje temporal "pensando..."
            const thinkingMessage = document.createElement('div');
            thinkingMessage.classList.add('message', 'assistant', 'italic', 'text-gray-500');
            thinkingMessage.textContent = 'Sócrates está pensando...';
            chatMessages.appendChild(thinkingMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                // Llamar a la Supabase Edge Function usando fetch
                console.log(`Enviando mensaje a: ${EDGE_FUNCTION_URL}`); // Log para depuración
                const response = await fetch(EDGE_FUNCTION_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // --- AQUÍ VA EL TOKEN DE AUTORIZACIÓN ---
                        'Authorization': 'Bearer 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'
                    },
                    // Enviar el mensaje del usuario en el cuerpo JSON
                    body: JSON.stringify({ message: messageText /*, sessionId: tu_id_de_sesion_si_lo_usas */ })
                });

                 // Eliminar el mensaje "pensando..."
                 if (chatMessages.contains(thinkingMessage)) {
                    chatMessages.removeChild(thinkingMessage);
                 }

                // Procesar la respuesta
                if (!response.ok) {
                    // Si hay un error HTTP (4xx, 5xx)
                    const errorData = await response.json().catch(() => ({ error: `Error ${response.status} ${response.statusText}` }));
                    console.error('Error desde Edge Function:', response.status, errorData);
                    addChatMessage(`Error ${response.status}: ${errorData.error || 'No se pudo conectar con el asistente.'}`, 'assistant');
                } else {
                    // Si la respuesta es exitosa (2xx)
                    const data = await response.json();
                    console.log("Respuesta recibida del backend:", data); // Log para depuración
                    // Mostrar la respuesta del agente (asumiendo que viene en data.reply)
                    addChatMessage(data.reply || 'No se recibió una respuesta válida.', 'assistant');
                }

            } catch (error) {
                 // Eliminar el mensaje "pensando..." si aún existe por un error de red
                 if (chatMessages.contains(thinkingMessage)) {
                     chatMessages.removeChild(thinkingMessage);
                 }
                console.error('Error de red o al llamar a la Edge Function:', error);
                addChatMessage('Error de conexión con el asistente. Por favor, revisa la consola del navegador (F12).', 'assistant');
            } finally {
                 chatSendBtn.disabled = false; // Rehabilitar el botón de enviar
                 chatInputField.focus(); // Poner el foco de nuevo en el campo de entrada
            }
        }

        // Añadir listeners para enviar mensaje con botón o Enter
        chatSendBtn.addEventListener('click', sendMessage);
        chatInputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

    } // Fin del if (elementos del chat existen)

    // --- Manejo del Formulario de Contacto (con mailto:) ---
    // No se necesita JS para mailto:, el navegador lo gestiona.

}); // Fin del DOMContentLoaded
