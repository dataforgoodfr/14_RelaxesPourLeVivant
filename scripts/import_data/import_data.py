import argparse
import requests
from urllib.parse import quote
import os
from dotenv import load_dotenv

IMPORT_DATA_URL = "https://relaxespourlevivant.services.d4g.fr/_/imports/"

QUERY_PARAMS = {
  "audiences": {
    "ignore[]" : [
      'updated_at',
      'updated_by',
      'created_by',
      'jugement_ou_arret',
      'recit_d_audience',
      'I___Email_de_l_ajouteur',
      'I___Flag',
      'I___Lien_recit_d_audience',
      'I___Lien_illustration_MSDE',
    ]
  }
}

def import_data(table_name, file_location=None):
  url = IMPORT_DATA_URL + table_name

  if table_name in QUERY_PARAMS:
    query_params = QUERY_PARAMS[table_name]
    url += "?"
    for query_key in query_params:
      url += "&".join([f"{query_key}={quote(value)}" for value in query_params[query_key]])

  if not file_location:
    # By default files are in scripts/transform_data/exported_tables
    file_location = "scripts/transform_data/exported_tables/" + table_name + ".csv"

  files = [
    ('csv', (table_name + '.csv', open(
      file_location, 'rb'), 'text/csv'))
  ]

  payload = {}

  headers = {
    'Authorization': 'Bearer ' + os.getenv('AUTHORIZATION_TOKEN_NOCODB'),
    #'Content-Type': 'multipart/form-data', -> if not "missing boundaries"
    #'Accept': 'application/json'
  }

  response = requests.post(url, headers=headers, data=payload, files=files)

  print(response.text)
  print(response.status_code)
  print(response.reason)


if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument("--table")
  parser.add_argument("--file", default=None)
  args = parser.parse_args()

  # Load environment variables from .env file
  load_dotenv()
  import_data(table_name=args.table, file_location=args.file)
