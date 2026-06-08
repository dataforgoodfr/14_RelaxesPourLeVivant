Import data to tables in PostgreSQL using import API

Import API : https://relaxespourlevivant.services.d4g.fr/_/imports/

Inputs
- Table : ``audiences``, `procedures`, or `presse_articles`
- Csv file

## How to run it

Create an .env file with
```aiignore
AUTHORIZATION_TOKEN_NOCODB=<token_from_nocodb>
```

Run  python script, for instance on ``audiences`` :
```
python3 scripts/import_data/import_data.py --table audiences --file "<file_location>/audiences.csv"
```
