# Usamos una imagen oficial de Node.js
FROM node:18

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código
COPY . .

# Expone el puerto que usas en tu .env
EXPOSE 5000

# Comando para correr la app (modo producción)
CMD ["npm", "start"]
