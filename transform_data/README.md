# Transform raw data 

Python script to transform raw data to clean data that will be imported to nocoDB 

- **Input** : CSV file, containing the columns needed and more, filled by MSDE volunteers. One row by "_audience_"
- **Output** : 3 csv files, corresponding to the nocoDB databases. These files can be imported using the import module to nocoDB
  - `audiences.csv`
  - `procedures.csv`
  - `presse_articles.csv`

The script also check values format and print information about all the data not being in the right format

## How to run it

Install Python

Install requirements (for instance using `pip`)
```
pip install -r transform_data/requirements.txt
```

Load the raw data on csv format (with separator = "," !) and run the script with the location of the file
```
python transform_data/main.py --file <location_of_the_file>/MSDE_DATA_origin.csv 
```

**Debug mode** : if you want to have more information displayed you can use the parameter ``--debug``

The output CSV files will be stored in a folder ``exported_tables``

## What is done ?
### Data extraction

In the input csv, there is a line with the name of the final table : "Audiences" or "Procedures". All the columns having "Audiences" will be put in ``audiences.csv``, same for "Procedures" in `procedures.csv`

### Transformation made

- Basic cleaning on all cells : remove "?", replace NA or N/A by None, ...
- Remove lines with no id ``reference_procedure``
- Transform text to boolean, for boolean columns
- Extract the number from the text, for columns of type number
- Extract date from the text, for columns of type date. In this case only keep the first date in the text.
- For press articles, put the name of the web domain as the name of the article
- Fill empty procedures titles by "Action " + name of the collectif, because title is mandatory in the database
- For multi select columns using ";", replace by ","

### Values checked

- Select / multi select columns
  - In [check_values.py](check_values.py) the known values by columns being of type "select" (or "multi select") are listed. All the values not in this list will be kept, but a warning message will be displayed. You can add new known values


## How to add a new check or a new cleaning
### Add a new value to check

Todo

### Add a new cleaning on a column

#### For all cells

Update function ``basic_cleaning`` applied on all cells

#### For a column from ``audiences.csv``
First check in ``MAPPING_CLEANING_BY_COLUMNS_AUDIENCES``in [extract_audiences.py](extract_audiences.py) if the column already have a cleaning function.

If true, update the cleaning function, else add a cleaning function on the column in ``MAPPING_CLEANING_BY_COLUMNS_AUDIENCES``

#### For a column from ``procedures.csv``
Same as for audiences but in [extract_procedures.py](extract_procedures.py)
