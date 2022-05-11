FROM public.ecr.aws/lambda/nodejs:14

COPY . ./

RUN npm install

CMD ["src/app.lambdaHandler"]

EXPOSE 3000