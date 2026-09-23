# PlantGuard
Proyecto equipo Bytec

***
## DESCRIPCCIÓN
PlantGuard es un sistema de riego automático inteligente basado en IoT e inteligencia artificial básica. Utiliza un microcontrolador ESP32 conectado a sensores que miden la humedad del suelo, la temperatura y la humedad ambiental, para conocer en todo momento el estado de la planta y del agua. Con esos datos, el sistema decide cuándo activar una mini bomba de agua, y el usuario puede monitorear y controlar todo desde un dashboard o aplicación.

## OBJETIVO
Desarrollar un sistema de riego automatizado y configurable que mantenga las plantas con la humedad adecuada, evitando tanto la falta como el exceso de agua, mediante el monitoreo en tiempo real de sensores, el control remoto del riego y una lógica de decisión inteligente que optimice cuándo y cuánto regar.

## FUNCIONALIDADES
- [ ] Configuración inicial del dispositivo: conexión del ESP32 a la red WiFi y verificación del funcionamiento de los sensores.
- [ ] Monitoreo en tiempo real: visualización de la humedad del suelo, la temperatura y la humedad ambiental.
- [ ] Configuración de umbrales de riego: el usuario define el nivel mínimo de humedad que activa el riego.
- [ ] Riego automático: la bomba se activa cuando la humedad está por debajo del umbral, con duración limitada y tiempo de espera entre riegos para evitar el sobre-riego.
- [ ] Control manual del riego: encendido y apagado de la bomba desde la aplicación, con indicación de su estado actual.
- [ ] Dashboard de monitoreo: panel visual con datos de sensores, estado del riego y configuración, con indicadores de color según la humedad.
- [ ] Alertas y notificaciones: avisos por humedad crítica, activación del riego o posible fallo del sistema (push o bot de Telegram).
- [ ] Historial de datos y riegos: consulta de lecturas de humedad, temperatura y eventos de riego.
- [ ] Lógica de decisión inteligente (IA básica): reglas que combinan humedad del suelo, temperatura y humedad ambiental, con un modelo de predicción simple opcional.
- [ ] Robustez y ahorro de energía: reconexión automática a WiFi, manejo de errores de sensores y optimización del envío de datos.

## CRONOGRAMA 
El desarrollo de PlantGuard está planeado en 3 sprints, del 18 de septiembre al 2 de noviembre de 2026.

**Sprint 1 (18 de septiembre al 2 de octubre):** se realiza la configuración inicial del dispositivo (HU01), la configuración de umbrales de riego (HU03) y el riego automático (HU04).

**Sprint 2 (3 al 17 de octubre):** se trabaja el monitoreo de sensores en tiempo real (HU02), el control manual del riego (HU05), el dashboard de monitoreo (HU06) y la gestión de energía y robustez (HU10).

**Sprint 3 (18 de octubre al 2 de noviembre):** se desarrollan las alertas y notificaciones (HU07), el historial de datos y riegos (HU08) y la lógica de decisión inteligente con IA básica (HU09).

## DEVELOP TEAM 
* Alonso Ramirez Erika Quetzalli
* Alarcon Vazquez David Ricardo
* Delgado Pineda Sergio Alberto
* Duran Rodriguez Fernando Daniel
* Gonzales Martinez Luis Enrrique
* Manjarrez Vazquez Alfredo de Jesús

 ## PILA TECNOLOGICA
 - [ ] Hardware: ESP32, sensor capacitivo de humedad de suelo, DHT11/DHT22, módulo relé 5V, mini bomba de agua.
 - [ ] Firmware: 	Arduino IDE / PlatformIO (C++).
 - [ ] Plataforma IoT: Blynk, ThingSpeak o Firebase (plan gratuito).
 - [ ] IA básica: Reglas inteligentes y, opcionalmente, scikit-learn / Edge Impulse.
 - [ ] Notificaciones: Notificaciones push de Blynk o Telegram Bot.
-