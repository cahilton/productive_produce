# Productive Produce

Simple demo app for Georgia Tech Summer 2019, CS 6795 (Intro to Cognitive Science).

## Running Client
`cd client`

`yarn install`

`yarn start`

Runs on [http://localhost:3000](http://localhost:3000)

See [Heroku Deployment](https://productive-produce-client.herokuapp.com/).

*NOTE:* Make sure to install new dependencies with `yarn`.



## Running Server
`cd server`

Copy `.env.example` to `.env` and fill out keys.

`pip install -r requirements.txt`

`export FLASK_APP=app.py`

`flask run`

Runs on [http://localhost:5000](http://localhost:5000).

See [Heroku Deployment](https://productive-produce-api.herokuapp.com/).
