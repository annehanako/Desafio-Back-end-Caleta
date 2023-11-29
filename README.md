# Desafio-Back-end-Caleta
Desafio referente a vaga de back-end na empresa Caleta


## Run application with Node:
    * npm -i
    * npm index.js
    Server will be open at localhost:3000
    more information at http://localhost:3000/docs

## Testing the API with Jest:
    * npx jest

## Execute application with docker:
* //Build the container:
* docker build --no-cache -t caleta-challenge .

* docker run caleta-challenge -p 3000:3000
* // start docker server at localhost:3000

* docker pull annehanako/caleta-challenge
https://hub.docker.com/r/annehanako/caleta-challenge
