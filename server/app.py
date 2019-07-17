import csv
import json
import os

import requests
from cachetools import cached, TTLCache
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
CORS(app)

spoonacular_api_key = os.getenv('SPOONACULAR_API_KEY')
walmart_api_key = os.getenv('WALMART_API_KEY')

spoonacular_headers = {
    "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
    "X-RapidAPI-Key": spoonacular_api_key
}

cache = TTLCache(maxsize=1000, ttl=3600)
freshness_data = dict()
custom_data = dict()
nutrition = dict()


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
        else:
            plural_name = name + 's'
            freshness_data[plural_name] = freshness_data[name]

    global custom_data
    rows = csv.DictReader(open("./data/custom_info.csv"))
    for r in rows:
        name = r['Name'].lower()
        if len(name) == 0:
            continue
        custom_data[name] = r
        if name == 'baby carrots':
            custom_data['carrots'] = r
            custom_data['carrot'] = r
        if name == 'bagged greens':
            custom_data['greens'] = r
            custom_data['bagged salad'] = r
            custom_data['salad mix'] = r
            custom_data['salad greens'] = r
        if name == 'bagged lettuce':
            custom_data['lettuce'] = r
        if name == 'blueberries':
            custom_data['blueberry'] = r
        if name == 'tomatoes':
            custom_data['tomato'] = r
        if name[-1] == 's':
            sing_name = name[0:-1]
            custom_data[sing_name] = custom_data[name]
        else:
            plural_name = name + 's'
            custom_data[plural_name] = custom_data[name]

    global nutrition
    rows = csv.DictReader(open("./data/NutritionalFacts.csv"))
    for r in rows:
        name = r['Food and Serving'].lower().split(',')[0]
        if len(name) == 0:
            continue
        nutrition[name] = r
        if name[-1] == 's':
            sing_name = name[0:-1]
            nutrition[sing_name] = nutrition[name]
        else:
            plural_name = name + 's'
            nutrition[plural_name] = nutrition[name]


def _lookup(item: str, _dict):
    lookup = item.lower().strip()
    if len(_dict.keys()) == 0:
        load_csvs()
    if lookup in _dict:
        return _dict[lookup]
    lookup_2 = lookup + 's'
    if lookup_2 in _dict:
        return _dict[lookup_2]
    lookup_split = lookup.split(' ')
    for lookup_3 in lookup_split:
        if lookup_3 in _dict:
            return _dict[lookup_3]
    return {}


def _foodkeeper_data(item: str):
    global freshness_data
    return _lookup(item, freshness_data)


def _custom_data(item: str):
    global custom_data
    return _lookup(item, custom_data)


def _nutrition_data(item: str):
    global nutrition
    return _lookup(item, nutrition)


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

    res = response.json()

    if len(res) > 0:
        data = res[0]
        item = data['name']
    else:
        data = dict()
        data['name'] = item
    data['foodkeeper'] = _foodkeeper_data(item)
    data['custom'] = _custom_data(item)
    data['raw_nutrition'] =_nutrition_data(item)
    return json.dumps([data], indent=4)


@app.route("/foodkeeper/<string:item>", methods=['GET'])
def get_foodkeeper_data(item: str):
    return json.dumps(_foodkeeper_data(item), indent=4)


if __name__ == '__main__':
    load_csvs()
    app.run(host='0.0.0.0', port=5000, debug=True)
