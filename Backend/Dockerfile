# usando una imagen base de Node.js que incluye un SO basado en debian
FROM node:14buster

# Instalar Python3 and pip en caso de que no este disponible
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

# copia los paquetes de Node.js e instalar las dependencias
COPY package*.json ./
RUN npm install

# copiar el codigo backend y Data Loading

COPY . .

# Instalar dependencias de python desde Data Loading/requirements.txt
RUN pip3 install --no-cache-dir -r "Data Loading/requirements.txt"

# Exponer el puerto en el que node.js escuchara:
EXPOSE 3000

# Iniciar la applicacion de node js
CMD [ "npm", "start" ]