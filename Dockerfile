FROM node:18
ENV NODE_ENV=production PORT=3000
WORKDIR /usr/src/cardjitsu
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "npm", "start" ]