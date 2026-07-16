Import data to tables in PostgreSQL using import API

Import API : https://relaxespourlevivant.services.d4g.fr/_/imports/

Inputs : Csv files for tables
  - ``audiences``
  - `procedures`
  - `presse_articles`

## How to run it

Create an .env file with
```aiignore
AUTHORIZATION_TOKEN_NOCODB=<token_from_nocodb>
```

Run  python script, for instance on ``audiences`` :
```
python3 scripts/import_data/import_data.py --table audiences
```
By default it will take the file in ``scripts/transform_data/exported_tables``. If the file is elsewhere you can give the precise location to the python script :
```
--file <file_location>
```

python3 scripts/import_data/import_data.py --table audiences --file /Users/adele/Downloads/audiences.csv
