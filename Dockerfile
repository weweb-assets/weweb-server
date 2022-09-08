#=============== BUILD ================
FROM node:16

WORKDIR /usr/app/weweb-server
COPY . .

RUN npm install --quiet

#============ EXPOSE PORTS ============
EXPOSE 80


#============= START CMD ==============
CMD npm run start