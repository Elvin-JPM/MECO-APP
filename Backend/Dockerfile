# Use Node.js as the base image
FROM node:18-bullseye

WORKDIR /app

# Install required dependencies
RUN apt-get update && apt-get install -y \
    wget \
    build-essential \
    libssl-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libffi-dev \
    zlib1g-dev \
    python3-dev \
    make \
    && rm -rf /var/lib/apt/lists/*

# Download and install Python 3.13.2 from source
RUN wget https://www.python.org/ftp/python/3.13.2/Python-3.13.2.tgz && \
    tar -xf Python-3.13.2.tgz && \
    cd Python-3.13.2 && \
    ./configure --enable-optimizations && \
    make -j4 && \
    make altinstall && \
    cd .. && \
    rm -rf Python-3.13.2 Python-3.13.2.tgz

# Set Python 3.13 as default
RUN ln -sf /usr/local/bin/python3.13 /usr/bin/python3 && \
    ln -sf /usr/local/bin/pip3.13 /usr/bin/pip3

# Copy backend files
COPY ./Backend/package*.json ./

# Set up NPM registry and install dependencies
RUN npm config set registry https://registry.npmmirror.com && \
    npm cache clean --force && \
    npm install --fetch-timeout=600000

# Remove existing node_modules and reinstall to avoid architecture-specific issues
RUN rm -rf node_modules
RUN npm install --fetch-timeout=600000

# Copy remaining backend code
COPY ./Backend ./
COPY ./Data_Loading /app/Data_Loading

# Install Python dependencies
RUN pip3 install --no-cache-dir -r /app/Data_Loading/requirements.txt

# Expose ports
EXPOSE 3000

# Start the server
CMD ["node", "app.js"]
