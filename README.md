Sistema de Onboarding de Colaboradores

Aplicación fullstack diseñada para gestionar el onboarding de nuevos colaboradores, incluyendo creación de asignaciones, seguimiento del estado y envío de alertas automáticas por correo electrónico.


Tecnologías Utilizadas
Frontend (React + Vite)

React.js

Vite

Context API

CSS modular

Despliegue en Vercel

Backend (Node.js + Express)

Node.js

Express

JWT para autenticación

node-cron para alertas automáticas

Arquitectura de servicios y controladores

Despliegue en Railway

Base de Datos

PostgreSQL alojado en Railway

Notificaciones

Resend (API para envío de correos reales)


▶Cómo Ejecutar el Proyecto Localmente
1 Clonar el repositorio
git clone https://github.com/karen23232/onboarding.git

2️ Ejecutar el Frontend

En una terminal:

cd frontend
npm install
npm run start

3️ Ejecutar el Backend

En otra terminal:

cd backend
npm install
npm run start


La API se ejecutará en:
 http://localhost:5000/


⚠️ IMPORTANTE:

El frontend y backend deben ejecutarse al mismo tiempo.

Variables de Entorno
Backend (.env)
DATABASE_URL=postgres://...
JWT_SECRET=tu_secreto
RESEND_API_KEY=tu_apikey
PORT=5000

Frontend (.env)
VITE_API_URL=http://localhost:5000/api



Base de Datos

El script SQL para crear las tablas se encuentra en:
👉 backend/src/config/init.sql

Allí puedes revisar y ejecutar la estructura completa de la base de datos.



Despliegue en Producción
Frontend — Vercel

✔ Dominio:
https://onboarding-kappa-nine.vercel.app

Backend — Railway

✔ API:
https://tu-api.up.railway.app

Base de Datos — Railway

✔ PostgreSQL gestionado automáticamente

Correos — Resend

✔ Entrega verificada: Delivered / Queued
✔ API Key configurada directamente en Railway