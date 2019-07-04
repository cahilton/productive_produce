import json
from random import randint

from flask import Flask, request, Response

app = Flask(__name__)


@app.route("/", methods=['POST', 'GET'])
def main():
    if request.method == 'GET':
        return 'Welcome to the Productive Produce app.'


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
