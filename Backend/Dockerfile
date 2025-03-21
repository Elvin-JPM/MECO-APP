# Use Node.js as the base image
FROM node:18-bullseye

ENV TZ=America/Tegucigalpa
RUN apt-get update && apt-get install -y tzdata && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Install system dependencies
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
    python3-pip \
    python3-venv \
    unixodbc \
    unixodbc-dev \
    odbcinst \
    curl \
    gnupg \
    libaio1 \
    # Ensure unzip is installed
    unzip \  
    && rm -rf /var/lib/apt/lists/*

# Install SQL Server ODBC Driver
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && apt-get install -y unixodbc-dev \
    && odbcinst -q -d -n

# Copy Oracle Instant Client files
COPY ./oracle-client /opt/oracle-client

# Install Oracle Instant Client (Basic Light Package)
RUN cd /opt/oracle-client \
    # Use -o to overwrite files
    && unzip -o instantclient-basiclite-linux.x64-21.17.0.0.0dbru.zip \  
    # Use -o to overwrite files
    && unzip -o instantclient-odbc-linux.x64-21.17.0.0.0dbru.zip \       
    && rm -f *.zip \
    # Remove existing symlink
    && rm -f /opt/oracle-client/instantclient_21_17/libclntsh.so \      
    # Remove existing symlink
    && rm -f /opt/oracle-client/instantclient_21_17/libocci.so \         
    && ln -s /opt/oracle-client/instantclient_21_17/libclntsh.so.21.1 /opt/oracle-client/instantclient_21_17/libclntsh.so \
    && ln -s /opt/oracle-client/instantclient_21_17/libocci.so.21.1 /opt/oracle-client/instantclient_21_17/libocci.so \
    && echo "/opt/oracle-client/instantclient_21_17" > /etc/ld.so.conf.d/oracle-instantclient.conf \
    && ldconfig

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

# Copy remaining backend code
COPY ./Backend ./
COPY ./Data_Loading /app/Data_Loading

# Install Python dependencies
RUN pip3 install --no-cache-dir -r /app/Data_Loading/requirements.txt

# Expose ports
EXPOSE 3000

# Start the server
CMD ["node", "app.js"]