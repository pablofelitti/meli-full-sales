# meli-full-sales

Lambda that checks for publications in mercado libre argentina with possible error en prices

## Installation

### To run locally with nodejs

`npm install`

`npm run start:local`

### To build and run the lambda locally:

`sam build`

`sam local invoke`

## Deployment

Need to run 

`sam build`

`sam deploy`

## TODO list

- [ ] Speed up Lambda cold start by initializing stuff outside handler
- [ ] Reduce application logic by enhancing queries
- [ ] Enable endpoint to blacklist items
- [ ] Enable UI to get all the information in the database and be able to modify it
