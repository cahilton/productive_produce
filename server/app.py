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
recipe_cache  = TTLCache(maxsize=1000, ttl=3600)
freshness_data = dict()
custom_data = dict()
nutrition = dict()
food_db = dict()

modifiers = ['red', 'yellow', 'green', 'orange', 'blue', 'purple', 'white', 'black', 'cooked', 'raw', 'stuffed',
             'baked', 'blanched', 'hard boiled', 'boiled', 'boneless', 'bone in', 'bone-in', 'bagged', 'canned', 'frozen',
             'whole', 'small', 'large', 'medium', 'baby', 'fresh', 'ground', 'sliced', 'chopped', 'cut', 'packaged', 'deli']
replacer_words = ['cooked', 'raw', 'stuffed', 'baked', 'blanched', 'hard boiled', 'boiled', 'boneless', 'bone in', 'bone-in',
                  'whole', 'small', 'large', 'medium', 'baby', 'fresh', 'ground', 'sliced', 'chopped', 'cut', 'bagged', 'canned', 'frozen',
                   'packaged', 'deli']


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

        subtitle = r['Name_subtitle'].lower().strip()
        names = [name]

        if len(subtitle) > 0:
            alt_name_1 = subtitle + ' ' + name
            alt_name_2 = name + ' ' + subtitle
            names.append(alt_name_1)
            names.append(alt_name_2)
        s = name.split(',')
        if len(s) > 1:
            for _s in s:
                if _s not in modifiers:
                    names.append(_s)
        names = list(set(names))
        for n in names:
            freshness_data[n] = data
            if n[-1] == 's':
                sing_name = n[0:-1]
                freshness_data[sing_name] = data
            else:
                plural_name = n + 's'
                freshness_data[plural_name] = data

            for w in replacer_words:
                replaced = n.replace(w, '').strip().replace('  ', ' ')
                if replaced not in freshness_data:
                    freshness_data[replaced] = data

    global custom_data
    rows = csv.DictReader(open("./data/custom_info.csv"))
    for r in rows:
        name = r['Name'].lower()
        if len(name) == 0:
            continue
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

        names = [name]
        for n in names:
            custom_data[n] = r
            if n[-1] == 's':
                sing_name = n[0:-1]
                custom_data[sing_name] = r
            else:
                plural_name = n + 's'
                custom_data[plural_name] = r
            for w in replacer_words:
                replaced = n.replace(w, '').strip().replace('  ', ' ')
                if replaced not in custom_data:
                    custom_data[replaced] = r

    global nutrition
    rows = csv.DictReader(open("./data/NutritionalFacts.csv"))
    for r in rows:
        name = r['Food and Serving'].lower().split(',')[0]
        if len(name) == 0:
            continue
        names = [name]
        for n in names:
            nutrition[n] = r
            if n[-1] == 's':
                sing_name = n[0:-1]
                nutrition[sing_name] = r
            else:
                plural_name = n + 's'
                nutrition[plural_name] = r
            for w in replacer_words:
                replaced = n.replace(w, '').strip().replace('  ', ' ')
                if replaced not in nutrition:
                    nutrition[replaced] = r

    global food_db
    rows = csv.DictReader(open("./data/food_db.csv"))
    for r in rows:
        name = r['name'].lower().split(',')[0]
        if len(name) == 0:
            continue

        names = [name]
        for n in names:
            food_db[n] = r
            if n[-1] == 's':
                sing_name = n[0:-1]
                food_db[sing_name] = r
            else:
                plural_name = n + 's'
                food_db[plural_name] = r
            for w in replacer_words:
                replaced = n.replace(w, '').strip().replace('  ', ' ')
                if replaced not in food_db:
                    food_db[replaced] = r


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


def _fooddb_data(item: str):
    global food_db
    return _lookup(item, food_db)


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
    data['wiki'] = _fooddb_data(item)
    if len(data['custom'].keys()) == 0:
        data['custom']['Purchasing'] = ''
        data['custom']['Tips'] = ''
        if len(data['wiki'].keys()) > 0:
            desc = data['wiki']['description']
            data['custom']['Purchasing'] = desc
        if len(data['foodkeeper'].keys()) > 0:
            cook_data = data['foodkeeper']['cooking_methods']
            tip_data = data['foodkeeper']['cooking_tips']
            cook_tip = ''

            if len(tip_data.keys()) > 0:
                tip_str = tip_data['Tips']
                if len(tip_str) > 0:
                    cook_tip = tip_str

            if len(cook_data.keys()) > 0:
                if len(cook_tip) > 0:
                    cook_tip += '\n\n'
                cook_tip += '{}'.format(cook_data['Cooking_Method'])
                if len(cook_data['Timing_from']) > 0:
                    timing = ' for {} to {} {}'.format(cook_data['Timing_from'], cook_data['Timing_to'], cook_data['Timing_metric'])
                    cook_tip += timing
            data['custom']['Tips'] = cook_tip

    data['raw_nutrition'] =_nutrition_data(item)
    return json.dumps([data], indent=4)


@app.route("/recipe/<string:items>", methods=['GET'])
@cached(recipe_cache)
def get_recipe(items: str):
    response = requests.get(
        'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients?number=5&ranking=1&ignorePantry=false&ingredients={}'.format(items),
        headers=spoonacular_headers,
    )

    res = response.json()
    found = list()
    for r in res:
        response = requests.get("https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/{}/information".format(r['id']),
                                headers=spoonacular_headers,)
        data = response.json()
        data['image'] = r['image']
        data['title'] = r['title']
        data['missed'] = list()
        for m in r['missedIngredients']:
            data['missed'].append(m['name'])
        found.append(data)
    return json.dumps(found, indent=4)


@app.route("/foodkeeper/<string:item>", methods=['GET'])
def get_foodkeeper_data(item: str):
    return json.dumps(_foodkeeper_data(item), indent=4)


if __name__ == '__main__':
    load_csvs()
    app.run(host='0.0.0.0', port=5000, debug=True)
