# Stage 1: Builder stage
FROM node:18-bullseye AS builder

# Set timezone and base dependencies
ENV TZ=America/Tegucigalpa
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tzdata \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget \
    build-essential \
    libssl-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libffi-dev \
    zlib1g-dev \
    unixodbc \
    unixodbc-dev \
    odbcinst \
    curl \
    gnupg \
    libaio1 \
    iputils-ping \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Configure ping
RUN chmod +s /bin/ping

# Install SQL Server ODBC Driver
RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /etc/apt/trusted.gpg.d/microsoft.gpg && \
    echo "deb [arch=amd64] https://packages.microsoft.com/debian/11/prod bullseye main" > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 unixodbc-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Oracle Client
COPY ./oracle-client /opt/oracle-client
RUN cd /opt/oracle-client && \
    unzip -oq instantclient-basiclite-linux.x64-21.17.0.0.0dbru.zip && \
    unzip -oq instantclient-odbc-linux.x64-21.17.0.0.0dbru.zip && \
    rm -f *.zip && \
    cd instantclient_21_17 && \
    ln -sf libclntsh.so.21.1 libclntsh.so && \
    ln -sf libocci.so.21.1 libocci.so && \
    echo "/opt/oracle-client/instantclient_21_17" > /etc/ld.so.conf.d/oracle.conf && \
    ldconfig

# Install Python 3.13 from source (with optimizations)
RUN wget https://www.python.org/ftp/python/3.13.2/Python-3.13.2.tgz && \
    tar -xf Python-3.13.2.tgz && \
    cd Python-3.13.2 && \
    ./configure --enable-optimizations --with-ensurepip=install && \
    make -j$(nproc) && \
    make altinstall && \
    cd .. && \
    rm -rf Python-3.13.2 Python-3.13.2.tgz && \
    ln -sf /usr/local/bin/python3.13 /usr/bin/python3 && \
    ln -sf /usr/local/bin/pip3.13 /usr/bin/pip3

# Install Node.js dependencies
COPY ./Backend/package*.json ./
RUN npm config set registry https://registry.npmmirror.com && \
    npm cache clean --force && \
    npm install --production --fetch-timeout=600000

# Install Python dependencies
COPY ./Data_Loading/requirements.txt /app/Data_Loading/requirements.txt
RUN pip3 install --no-cache-dir -r /app/Data_Loading/requirements.txt

# ----------------------------
# Stage 2: Runtime stage
FROM node:18-slim

ENV TZ=America/Tegucigalpa
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    tzdata \
    libaio1 \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

# Set ping permissions
RUN chmod +s /bin/ping

# Copy Oracle Client
COPY --from=builder /opt/oracle-client /opt/oracle-client
COPY --from=builder /etc/odbcinst.ini /etc/odbcinst.ini
COPY --from=builder /etc/ld.so.conf.d/oracle.conf /etc/ld.so.conf.d/oracle.conf
RUN ldconfig

# Copy Python
COPY --from=builder /usr/local/bin/python3.13 /usr/local/bin/python3.13
COPY --from=builder /usr/local/bin/pip3.13 /usr/local/bin/pip3.13
COPY --from=builder /usr/local/lib/python3.13 /usr/local/lib/python3.13
RUN ln -sf /usr/local/bin/python3.13 /usr/bin/python3 && \
    ln -sf /usr/local/bin/pip3.13 /usr/bin/pip3

WORKDIR /app

# Copy application files
COPY --from=builder /app/node_modules ./node_modules
COPY ./Backend ./
COPY ./Data_Loading /app/Data_Loading

# Configure permissions
RUN chmod 600 /app/Data_Loading/.env && \
    chown -R node:node /app

USER node
EXPOSE 3000
CMD ["node", "app.js"]