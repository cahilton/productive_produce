import os
import csv
import json
import requests
from dotenv import load_dotenv
from flask import Flask, request
from cachetools import cached, TTLCache

load_dotenv()
app = Flask(__name__)

spoonacular_api_key = os.getenv('SPOONACULAR_API_KEY')
walmart_api_key = os.getenv('WALMART_API_KEY')

spoonacular_headers = {
    "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
    "X-RapidAPI-Key": spoonacular_api_key
}

cache = TTLCache(maxsize=1000, ttl=3600)
freshness_data = dict()


def load_csvs():
    print('loadup csvs')
    global freshness_data
    cooking_methods = dict()
    cooking_tips = dict()
    food_keeper_rows = csv.DictReader(open("./data/foodkeeper_cooking_methods.csv"))
    for r in food_keeper_rows:
        r['id'] = r['\ufeffID']
        cooking_methods[r['id']] = r
    food_keeper_rows = csv.DictReader(open("./data/foodkeeper_cooking_tips.csv"))
    for r in food_keeper_rows:
        r['id'] = r['\ufeffID']
        cooking_tips[r['id']] = r

    food_keeper_rows = csv.DictReader(open("./data/foodkeeper_product.csv"))
    for r in food_keeper_rows:
        name = r['Name'].lower()
        if len(name) == 0:
            continue
        r['id'] = r['\ufeffID']
        data = dict(r)
        if r['id'] in cooking_methods:
            data['cooking_methods'] = cooking_methods[r['id']]
        else:
            data['cooking_methods'] = dict()
        if r['id'] in cooking_tips:
            data['cooking_tips'] = cooking_tips[r['id']]
        else:
            data['cooking_tips'] = dict()
        freshness_data[name] = data
        subtitle = r['Name_subtitle'].lower().strip()
        if len(subtitle) > 0:
            alt_name_1 = subtitle + ' ' + name
            alt_name_2 = name + ' ' + subtitle
            freshness_data[alt_name_1] = freshness_data[name]
            freshness_data[alt_name_2] = freshness_data[name]
        if name[-1] == 's':
            sing_name = name[0:-1]
            freshness_data[sing_name] = freshness_data[name]


@app.route("/", methods=['POST', 'GET'])
def main():
    if request.method == 'GET':
        return 'Welcome to the Productive Produce app.'


@app.route("/random", methods=['GET'])
def random_fact():
    response = requests.get('https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/trivia/random',
                            headers=spoonacular_headers)
    return response.json()['text']


@app.route("/info/<string:item>", methods=['GET'])
@cached(cache)
def get_basic_info(item: str):
    response = requests.post(
        'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/parseIngredients?includeNutrition=true',
        headers=spoonacular_headers,
        data={
            "ingredientList": item,
            "servings": 1
        })
    return response.text


@app.route("/foodkeeper/<string:item>", methods=['GET'])
def get_foodkeeper_data(item: str):
    lookup = item.lower().strip()
    global freshness_data
    if len(freshness_data.keys()) == 0:
        load_csvs()
    if lookup in freshness_data:
        return json.dumps(freshness_data[lookup], indent=4)
    lookup_2 = lookup + 's'
    if lookup_2 in freshness_data:
        return json.dumps(freshness_data[lookup_2], indent=4)
    lookup_split = lookup.split(' ')
    for lookup_3 in lookup_split:
        if lookup_3 in freshness_data:
            return json.dumps(freshness_data[lookup_3], indent=4)
    return "{}"


if __name__ == '__main__':
    load_csvs()
    app.run(host='0.0.0.0', port=5000, debug=True)
