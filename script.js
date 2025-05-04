// script.js - Lógica de JavaScript para ÉticaIA

// --- Esperar a que el DOM esté completamente cargado ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Constantes y Estado Global (Cuestionario) ---
    const questionnaireContainer = document.querySelector('.questionnaire-container');
    const evaluationSection = document.getElementById('evaluacion');
    const resultsSection = document.getElementById('resultados');
    const currentQuestionNumberSpan = document.getElementById('current-question-number');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const selectedSectorNameSpan = document.getElementById('selected-sector-name');
    const riskLevelBar = document.getElementById('risk-level-bar');
    const riskLevelLabel = document.getElementById('risk-level-label');
    const opportunityLevelBar = document.getElementById('opportunity-level-bar');
    const opportunityLevelLabel = document.getElementById('opportunity-level-label');
    const recommendedServicesContainer = document.getElementById('recommended-services-container');
    const contactForm = document.getElementById('contact-form'); // Referencia al formulario

    let currentQuestionIndex = 0;
    let selectedSector = '';
    let answers = {}; // Almacenará { questionId: value }

    // Definición de las preguntas del cuestionario
    const questions = [
        { id: 'risk1', text: '¿Qué tipo de datos utiliza o utilizaría su sistema de IA?', type: 'risk', options: [ { text: 'Datos públicos y abiertos sin información personal', value: 1 }, { text: 'Datos agregados con información demográfica general', value: 2 }, { text: 'Datos con información personal pero no sensible', value: 3 }, { text: 'Datos con información personal sensible (salud, finanzas, etc.)', value: 4 }, { text: 'Datos biométricos o de categorías especiales', value: 5 } ] },
        { id: 'risk2', text: '¿Qué nivel de autonomía tendría el sistema de IA en la toma de decisiones?', type: 'risk', options: [ { text: 'Solo asistencia informativa, decisión humana final', value: 1 }, { text: 'Recomendaciones con supervisión humana constante', value: 2 }, { text: 'Decisiones automatizadas con posibilidad de intervención humana', value: 3 }, { text: 'Decisiones automatizadas con supervisión humana periódica', value: 4 }, { text: 'Decisiones completamente automatizadas sin supervisión humana', value: 5 } ] },
        { id: 'risk3', text: '¿Qué impacto potencial podrían tener las decisiones del sistema de IA?', type: 'risk', options: [ { text: 'Impacto mínimo, sin consecuencias significativas', value: 1 }, { text: 'Impacto bajo, afecta experiencias pero no derechos', value: 2 }, { text: 'Impacto moderado, puede afectar oportunidades', value: 3 }, { text: 'Impacto alto, afecta acceso a servicios esenciales', value: 4 }, { text: 'Impacto crítico, puede afectar derechos fundamentales', value: 5 } ] },
        { id: 'opportunity1', text: '¿Qué nivel de mejora en eficiencia espera obtener con la implementación de IA?', type: 'opportunity', options: [ { text: 'Mejora mínima (menos del 10%)', value: 1 }, { text: 'Mejora baja (10-25%)', value: 2 }, { text: 'Mejora moderada (25-50%)', value: 3 }, { text: 'Mejora alta (50-100%)', value: 4 }, { text: 'Mejora transformadora (más del 100%)', value: 5 } ] },
        { id: 'opportunity2', text: '¿Qué nivel de innovación representaría la IA en su sector específico?', type: 'opportunity', options: [ { text: 'Tecnología ya común en el sector', value: 1 }, { text: 'Mejora incremental sobre soluciones existentes', value: 2 }, { text: 'Aplicación novedosa de tecnologías probadas', value: 3 }, { text: 'Innovación significativa en el sector', value: 4 }, { text: 'Transformación disruptiva del sector', value: 5 } ] },
        { id: 'opportunity3', text: '¿Qué impacto tendría la IA en la experiencia de sus clientes o usuarios?', type: 'opportunity', options: [ { text: 'Impacto mínimo, apenas perceptible', value: 1 }, { text: 'Mejora leve en algunos aspectos', value: 2 }, { text: 'Mejora notable en la experiencia general', value: 3 }, { text: 'Transformación significativa de la experiencia', value: 4 }, { text: 'Creación de experiencias completamente nuevas', value: 5 } ] }
    ];
    // Actualizar el contador total de preguntas si el elemento existe
    if (totalQuestionsSpan) {
        totalQuestionsSpan.textContent = questions.length;
    }

    // Definición de los servicios ofrecidos
    const allServices = [
        { id: 'diag', name: 'Diagnóstico de Riesgos Éticos', desc: 'Evaluación exhaustiva de riesgos éticos con recomendaciones específicas.', riskThreshold: 3, opportunityThreshold: 0 },
        { id: 'estr', name: 'Diseño de Estrategias Éticas', desc: 'Desarrollo de estrategias personalizadas para integrar principios éticos.', riskThreshold: 2, opportunityThreshold: 3 },
        { id: 'anal', name: 'Análisis Ético de la IA', desc: 'Evaluación integral de sistemas existentes o en desarrollo.', riskThreshold: 4, opportunityThreshold: 0 },
        { id: 'capa', name: 'Capacitación en Ética para IA', desc: 'Programas de formación para su equipo sobre principios éticos.', riskThreshold: 0, opportunityThreshold: 0 }
    ];


    // --- Funciones del Cuestionario ---

    // Muestra la pregunta actual en el contenedor
    function renderQuestion(index) {
        if (!questionnaireContainer || !currentQuestionNumberSpan || index < 0 || index >= questions.length) return;

        const question = questions[index];
        currentQuestionIndex = index;
        currentQuestionNumberSpan.textContent = index + 1;

        // Generar HTML para las opciones de respuesta
        let optionsHtml = question.options.map(option =>
            `<button class="option-btn" data-value="${option.value}">${option.text}</button>`
        ).join('');

        // Generar HTML para los botones de navegación (Anterior/Siguiente/Finalizar)
        let navigationHtml;
        if (index === questions.length - 1) { // Última pregunta
            navigationHtml = `
                <div class="navigation-buttons">
                    <button class="btn btn-secondary prev-btn" ${index === 0 ? 'disabled' : ''}>Anterior</button>
                    <button class="btn btn-primary finish-btn" ${!answers[question.id] ? 'disabled' : ''}>Finalizar</button>
                </div>`;
        } else { // Preguntas intermedias
            navigationHtml = `
                <div class="navigation-buttons">
                    <button class="btn btn-secondary prev-btn" ${index === 0 ? 'disabled' : ''}>Anterior</button>
                    <button class="btn btn-primary next-btn" ${!answers[question.id] ? 'disabled' : ''}>Siguiente</button>
                </div>`;
        }

        // Actualizar el contenido HTML del contenedor del cuestionario
        questionnaireContainer.innerHTML = `
            <div class="question-card active" data-question="${question.id}">
                <h3 class="text-xl font-semibold mb-6">${question.text}</h3>
                <div class="options-container">${optionsHtml}</div>
                ${navigationHtml}
            </div>`;

        // Resaltar la opción previamente seleccionada si existe
        if (answers[question.id]) {
            const selectedBtn = questionnaireContainer.querySelector(`.option-btn[data-value="${answers[question.id]}"]`);
            if (selectedBtn) selectedBtn.classList.add('selected');
        }

        // Añadir listeners a los botones recién creados
        addQuestionListeners();
    }

    // Añade los event listeners a los botones de opción y navegación
    function addQuestionListeners() {
        if (!questionnaireContainer) return;
        questionnaireContainer.querySelectorAll('.option-btn').forEach(btn => btn.addEventListener('click', handleOptionSelect));
        const nextBtn = questionnaireContainer.querySelector('.next-btn');
        const prevBtn = questionnaireContainer.querySelector('.prev-btn');
        const finishBtn = questionnaireContainer.querySelector('.finish-btn');
        if (nextBtn) nextBtn.addEventListener('click', handleNextQuestion);
        if (prevBtn) prevBtn.addEventListener('click', handlePrevQuestion);
        if (finishBtn) finishBtn.addEventListener('click', handleFinishQuestionnaire);
    }

    // Maneja la selección de una opción de respuesta
    function handleOptionSelect(event) {
        const selectedValue = event.target.dataset.value;
        const questionId = questions[currentQuestionIndex].id;
        answers[questionId] = parseInt(selectedValue); // Guardar respuesta

        // Actualizar estilos de botones
        if (!questionnaireContainer) return;
        questionnaireContainer.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.classList.add('selected');

        // Habilitar botón de Siguiente/Finalizar
        const nextBtn = questionnaireContainer.querySelector('.next-btn');
        const finishBtn = questionnaireContainer.querySelector('.finish-btn');
        if (nextBtn) nextBtn.disabled = false;
        if (finishBtn) finishBtn.disabled = false;
    }

    // Navega a la siguiente pregunta
    function handleNextQuestion() {
        if (currentQuestionIndex < questions.length - 1) {
            renderQuestion(currentQuestionIndex + 1);
        }
    }

    // Navega a la pregunta anterior
     function handlePrevQuestion() {
        if (currentQuestionIndex > 0) {
            renderQuestion(currentQuestionIndex - 1);
        }
    }

    // Finaliza el cuestionario, calcula y muestra resultados
    function handleFinishQuestionnaire() {
        const riskScore = calculateScore('risk');
        const opportunityScore = calculateScore('opportunity');
        displayResults(riskScore, opportunityScore);
        if (evaluationSection) evaluationSection.classList.add('hidden');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Calcula el puntaje normalizado (0-100) para un tipo ('risk' u 'opportunity')
    function calculateScore(type) {
        let totalScore = 0, count = 0;
        questions.forEach(q => { if (q.type === type && answers[q.id]) { totalScore += answers[q.id]; count++; } });
        if (count === 0) return 0;
        const maxPossible = count * 5, minPossible = count * 1;
        const percentage = ((totalScore - minPossible) / (maxPossible - minPossible)) * 100;
        return Math.round(percentage);
    }

    // Muestra los puntajes y las recomendaciones
    function displayResults(riskScore, opportunityScore) {
        if (!riskLevelBar || !opportunityLevelBar || !riskLevelLabel || !opportunityLevelLabel) return;
        riskLevelBar.style.width = `${riskScore}%`;
        opportunityLevelBar.style.width = `${opportunityScore}%`;
        riskLevelLabel.textContent = getLevelLabel(riskScore);
        opportunityLevelLabel.textContent = getLevelLabel(opportunityScore);
        renderRecommendedServices(riskScore, opportunityScore);
    }

    // Devuelve una etiqueta textual para el nivel de puntaje
     function getLevelLabel(score) {
        if (score < 25) return `Bajo (${score}%)`; if (score < 50) return `Moderado (${score}%)`; if (score < 75) return `Alto (${score}%)`; return `Muy Alto (${score}%)`;
    }

    // Muestra los servicios recomendados basados en los puntajes
    function renderRecommendedServices(riskScore, opportunityScore) {
        if (!recommendedServicesContainer) return;
        recommendedServicesContainer.innerHTML = '';
        let recommended = [];
        // Lógica de recomendación
        if (riskScore >= 75) { recommended.push(allServices.find(s => s.id === 'anal')); recommended.push(allServices.find(s => s.id === 'diag')); }
        else if (riskScore >= 50) { recommended.push(allServices.find(s => s.id === 'diag')); recommended.push(allServices.find(s => s.id === 'estr')); }
        else if (riskScore >= 25) { recommended.push(allServices.find(s => s.id === 'estr')); }
        if (opportunityScore >= 50) { if (!recommended.some(s => s && s.id === 'estr')) recommended.push(allServices.find(s => s.id === 'estr')); }
        if (riskScore >= 25 || opportunityScore >= 50) { if (!recommended.some(s => s && s.id === 'capa')) recommended.push(allServices.find(s => s.id === 'capa')); }
        recommended = [...new Set(recommended.filter(s => s))]; // Filtrar y eliminar duplicados

        // Mostrar mensaje si no hay recomendaciones o renderizar las tarjetas
        if (recommended.length === 0) {
             recommendedServicesContainer.innerHTML = '<p class="text-gray-600 md:col-span-2 lg:col-span-3 text-center">No se requieren servicios específicos basados en esta evaluación inicial, pero siempre recomendamos buenas prácticas.</p>';
             return;
        }
        recommended.forEach(service => {
            const serviceEl = document.createElement('div'); serviceEl.className = 'bg-white p-6 rounded-lg shadow-md';
            serviceEl.innerHTML = `<h4 class="text-lg font-semibold mb-2 text-blue-600">${service.name}</h4><p class="text-gray-600 text-sm">${service.desc}</p><a href="#contacto" class="text-blue-500 hover:underline text-sm mt-3 inline-block">Solicitar más info</a>`;
            recommendedServicesContainer.appendChild(serviceEl);
        });
    }


    // --- Inicialización y Event Listeners Globales ---

    // Listener para botones "Evaluar mi negocio" en tarjetas de sector
    document.querySelectorAll('.evaluate-sector-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const card = event.target.closest('.sector-card');
            if (!card) return;
            selectedSector = card.dataset.sector;
            const sectorNameElement = card.querySelector('h3');
            const sectorName = sectorNameElement ? sectorNameElement.textContent : 'Desconocido';
            if (selectedSectorNameSpan) selectedSectorNameSpan.textContent = sectorName;
            currentQuestionIndex = 0; answers = {};
            if (resultsSection) resultsSection.style.display = 'none';
            if (evaluationSection && questionnaireContainer) {
                 evaluationSection.classList.remove('hidden');
                 renderQuestion(0);
                 evaluationSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Toggle para el menú móvil
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
        menuBtn.addEventListener('click', () => {
          mobileMenu.classList.toggle('hidden');
          const icon = menuBtn.querySelector('i');
          if (icon) { icon.classList.toggle('fa-bars'); icon.classList.toggle('fa-times'); }
        });
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                const icon = menuBtn.querySelector('i');
                if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
            });
        });
    }

    // Establecer el año actual en el pie de página
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    // Scrollspy para resaltar enlace de navegación activo
    const sections = document.querySelectorAll('main section[id]');
    const headerNavLinks = document.querySelectorAll('header nav a[href^="#"]');
    const mobileNavLinks = document.querySelectorAll('#mobile-menu a[href^="#"]');
    if (sections.length > 0 && headerNavLinks.length > 0) {
        const observerOptions = { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 };
        const observerCallback = (entries) => {
            let activeSectionId = null;
            entries.forEach(entry => { if (entry.isIntersecting) activeSectionId = entry.target.id; });
            if (!activeSectionId) {
                 let closestSection = null, minDistance = Infinity;
                 sections.forEach(section => {
                     if (section.offsetParent !== null) {
                         const rect = section.getBoundingClientRect();
                         if (rect.top <= window.innerHeight / 2) {
                             const distance = Math.abs(rect.top);
                             if (distance < minDistance) { minDistance = distance; closestSection = section; }
                         }
                     }
                 });
                 activeSectionId = closestSection ? closestSection.id : 'inicio';
            }
            headerNavLinks.forEach(link => { link.classList.remove('active'); if (link.getAttribute('href') === `#${activeSectionId}`) link.classList.add('active'); });
            mobileNavLinks.forEach(link => { link.classList.remove('active', 'bg-blue-100', 'text-blue-700'); if (link.getAttribute('href') === `#${activeSectionId}`) link.classList.add('active', 'bg-blue-100', 'text-blue-700'); });
        };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach(section => { if (!section.classList.contains('hidden') && section.id !== 'resultados') observer.observe(section); });
         if (evaluationSection) {
             const evaluationObserver = new MutationObserver(mutations => { mutations.forEach(mutation => { if (mutation.attributeName === 'class') { const isHidden = evaluationSection.classList.contains('hidden'); if (!isHidden) observer.observe(evaluationSection); else observer.unobserve(evaluationSection); } }); });
             evaluationObserver.observe(evaluationSection, { attributes: true });
         }
         if (resultsSection) {
             const resultsObserver = new MutationObserver(mutations => { mutations.forEach(mutation => { if (mutation.attributeName === 'style') { const isHidden = resultsSection.style.display === 'none'; if (!isHidden) observer.observe(resultsSection); else observer.unobserve(resultsSection); } }); });
             resultsObserver.observe(resultsSection, { attributes: true });
         }
         setTimeout(() => {
            observerCallback(observer.takeRecords());
             if (window.scrollY < 100 && sections.length > 0 && sections[0].id === 'inicio') {
                 headerNavLinks.forEach(link => link.classList.remove('active')); mobileNavLinks.forEach(link => link.classList.remove('active', 'bg-blue-100', 'text-blue-700'));
                 document.querySelector('header nav a[href="#inicio"]')?.classList.add('active'); document.querySelector('#mobile-menu a[href="#inicio"]')?.classList.add('active', 'bg-blue-100', 'text-blue-700');
             }
        }, 100);
    }


    // --- Funcionalidad del Chat (Llamada a Supabase Edge Function) ---
    const chatWidget = document.getElementById('chat-widget');
    const chatHeader = document.getElementById('chat-header');
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatInputField = document.getElementById('chat-input-field');
    const chatSendBtn = document.getElementById('chat-send-btn');

    // *** URL de tu Edge Function Desplegada (¡INSERTADA!) ***
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
                        // Considera añadir la API Key anónima de Supabase si tu función lo requiere
                        // 'apikey': 'TU_SUPABASE_ANON_KEY', // Obtener de la configuración de API de tu proyecto Supabase
                        // 'Authorization': `Bearer TU_SUPABASE_ANON_KEY` // Otra forma común
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

