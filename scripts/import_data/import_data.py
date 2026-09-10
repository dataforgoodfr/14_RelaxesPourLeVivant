import argparse
import requests
import os
from dotenv import load_dotenv

IMPORT_DATA_URL = "https://relaxespourlevivant.services.d4g.fr/_/imports/"

QUERY_PARAMS = {
  "audiences": {
    "ignore[]" : [
      'updated_at',
      'updated_by',
      'jugement_ou_arret',
      'recit_d_audience',
      'I___Nombre_de_t_moins',
      'I___Remarques_entre_nous_MSDE',
      'I___Heure_de_l_audience',
      'I___Lieu_de_l_audience',
      'I___R_cit_d_audience',
      'I___Illustration_MSDE__',
      'I___Date_d_origine_si_renvoi',
      'I___Avocats_de_la_d_fense',
      'I___T_moins_et_expertise',
      'I___Jugement_interne_motiv__sur_le_drive__',
      'I___Nom_du_procureur_e',
      'I___Expertise_des_t_moins',
      'I___Personnalit__juridique_des_parties_civiles',
      'I___Cat_gorie_temporelle',
      'I___Dur_e_de_l_audience',
      'I___Composition_du_tribunal',
      'I___Les_cas_redondant',
      'I___Personnalit__juridique_des_parties_civiles'
    ]
  }
}

def import_data(table_name, file_location=None):
  url = IMPORT_DATA_URL + table_name

  if table_name in QUERY_PARAMS:
    query_params = QUERY_PARAMS[table_name]
    url += "?"
    for query_key in query_params:
      url += "&".join([f"{query_key}={value}" for value in query_params[query_key]])
  print(url)

  if not file_location:
    file_location = table_name + ".csv"

  files = [
    ('csv', (table_name + '.csv', open(
      file_location, 'rb'), 'text/csv'))
  ]

  payload = {}

  headers = {
    'Authorization': 'Bearer ' + os.getenv('AUTHORIZATION_TOKEN_NOCODB'),
    #'Content-Type': 'multipart/form-data', -> if not "missing boundaries"
    'Accept': 'application/json'
  }

  response = requests.request("POST", url, headers=headers, data=payload, files=files)

  print(response.text)

if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument("--table")
  parser.add_argument("--file", default=None)
  args = parser.parse_args()

  # Load environment variables from .env file
  load_dotenv()
  import_data(table_name=args.table, file_location=args.file)
