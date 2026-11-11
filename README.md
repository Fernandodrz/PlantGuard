# PlantGuard
Proyecto equipo Bytec

***
## DESCRIPCIÓN
PlantGuard es un sistema de riego automático inteligente basado en IoT e inteligencia artificial básica. Utiliza un microcontrolador ESP32 conectado a sensores que miden la humedad del suelo, la temperatura y la humedad ambiental, para conocer en todo momento el estado de la planta y del agua. Con esos datos, el sistema decide cuándo activar una mini bomba de agua, y el usuario puede monitorear y controlar todo desde un dashboard o aplicación.

## OBJETIVO
Desarrollar un sistema de riego automatizado y configurable que mantenga las plantas con la humedad adecuada, evitando tanto la falta como el exceso de agua, mediante el monitoreo en tiempo real de sensores, el control remoto del riego y una lógica de decisión inteligente que optimice cuándo y cuánto regar.

## FUNCIONALIDADES
- [ ] Configuración inicial del dispositivo: conexión del ESP32 a la red WiFi y verificación del funcionamiento de los sensores.
- [x] Monitoreo en tiempo real (simulado en el navegador): visualización de la humedad del suelo, la temperatura y la humedad ambiental.
- [x] Configuración de umbrales de riego (simulado en el navegador): el usuario define el nivel mínimo de humedad que activa el riego.
- [x] Riego automático (simulado en el navegador): la bomba se activa cuando la humedad está por debajo del umbral, con duración limitada y tiempo de espera entre riegos para evitar el sobre-riego.
- [x] Control manual del riego (simulado en el navegador): encendido y apagado de la bomba desde la aplicación, con indicación de su estado actual.
- [x] Dashboard de monitoreo (simulado en el navegador): panel visual con datos de sensores, estado del riego y configuración, con indicadores de color según la humedad.
- [x] Alertas y notificaciones (simulado en el navegador): avisos por humedad crítica, activación del riego o posible fallo del sistema (push o bot de Telegram).
- [x] Historial de datos y riegos (simulado en el navegador): consulta de lecturas de humedad, temperatura y eventos de riego.
- [ ] Lógica de decisión inteligente (IA básica): reglas que combinan humedad del suelo, temperatura y humedad ambiental, con un modelo de predicción simple opcional.
- [ ] Robustez y ahorro de energía: reconexión automática a WiFi, manejo de errores de sensores y optimización del envío de datos.
## DEVELOP TEAM 
* Alonso Ramirez Erika Quetzalli
* Alarcon Vazquez David Ricardo
* Delgado Pineda Sergio Alberto
* Duran Rodriguez Fernando Daniel
* González Martínez Luis Enrique
* Manjarrez Vazquez Alfredo de Jesús

 ## PILA TECNOLOGICA
 - [ ] Hardware: ESP32, sensor capacitivo de humedad de suelo, DHT11/DHT22, módulo relé 5V, mini bomba de agua.
 - [ ] Firmware: 	Arduino IDE / PlatformIO (C++).
 - [ ] Plataforma IoT: Blynk, ThingSpeak o Firebase (plan gratuito).
 - [ ] IA básica: Reglas inteligentes y, opcionalmente, scikit-learn / Edge Impulse.
 - [ ] Notificaciones: Notificaciones push de Blynk o Telegram Bot.

## SIMULACIÓN (Nivel 1)
La versión web funciona sin ESP32 ni servidor: `js/sim.js` genera lecturas de humedad del suelo, temperatura y humedad ambiental cada 3 s, controla la bomba (manual y automática con umbral, duración y espera mínima), guarda el historial en `localStorage` y lanza alertas en pantalla. El historial se grafica con Chart.js. El **modo demo** (pantalla Umbrales) convierte los minutos de espera en segundos.
El asistente de chat responde con reglas usando los datos simulados; con `api/chat.js` desplegado en Vercel (variable `GEMINI_API_KEY`) responde con IA.

Cada planta tiene su propia simulación: sensores (humedad del suelo, temperatura y humedad ambiente), bomba, umbrales, espera entre riegos, historial y alertas. Todas siguen funcionando en segundo plano aunque no sea la planta activa.
