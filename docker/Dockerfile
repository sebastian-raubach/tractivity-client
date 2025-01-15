FROM node:22.11-alpine3.20 AS builder

ARG BRANCH=master

# Force docker to not cache the next line
ADD https://api.github.com/repos/sebastian-raubach/tractivity-client/git/refs/heads/main version.json
# Clone the tractivity server code and client code
RUN echo "Pulling GitHub branch: $BRANCH"
RUN apk add --no-cache git && \
    if [ "$BRANCH" = "master" ] ; then git clone -b "main" --single-branch --depth 1 https://github.com/sebastian-raubach/tractivity-server.git /opt/tractivity-server ; else git clone -b "$BRANCH" --single-branch --depth 1 https://github.com/sebastian-raubach/tractivity-server.git /opt/tractivity-server ; fi && \
    if [ "$BRANCH" = "master" ] ; then git clone -b "main" --single-branch --depth 1 https://github.com/sebastian-raubach/tractivity-client.git /opt/tractivity-client ; else git clone -b "$BRANCH" --single-branch --depth 1 https://github.com/sebastian-raubach/tractivity-client.git /opt/tractivity-client ; fi

# Build the client code
WORKDIR /opt/tractivity-client
RUN rm -f .env && \
    echo "VUE_APP_BASE_URL=./api/" > .env && \
    apk add --no-cache python3 build-base gcc wget && \
    npm i --legacy-peer-deps && \
    npm run build && \
    mkdir /opt/tractivity-server/client/ && \
    cp -a /opt/tractivity-client/dist/. /opt/tractivity-server/client/

# Download Gradle and build the server code
RUN apk add --no-cache openjdk21 && \
    wget https://services.gradle.org/distributions/gradle-8.8-bin.zip -P /tmp/ && \
    unzip /tmp/gradle-8.8-bin.zip -d /opt/ && \
    echo "data.directory.external=/data/tractivity" > /opt/tractivity-server/config.properties && \
    echo "project.name=tractivity" >> /opt/tractivity-server/gradle.properties && \
    /opt/gradle-8.8/bin/gradle -p /opt/tractivity-server war


FROM tomcat:10.1-jdk21

RUN mkdir -p /usr/local/tomcat/webapps && \
    rm -rf /usr/local/tomcat/webapps/ROOT

COPY --from=builder /opt/tractivity-server/build/libs/tractivity-*.war /usr/local/tomcat/webapps/ROOT.war

WORKDIR /usr/local/tomcat/
