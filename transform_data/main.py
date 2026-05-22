import argparse
import pandas
import os
import re
from export_data_functions import load_data, extract_columns
from extract_audiences import extract_audiences
from extract_procedures import extract_procedures
from tables_columns import PROCEDURES_COLUMNS, AUDIENCES_COLUMNS


def get_url_name(url: str) -> str:
    """ Get the url domain name"""
    match = re.search(r'https?://(?:www\.)?([^/\.]+)', url)
    return match.group(1).capitalize() if match else "Article de presse"


def get_articles(df: pandas.DataFrame, table_name: str, column_name: str) -> pandas.DataFrame:
    # Split the list of urls by rows
    df_articles = df[[column_name, "id"]].explode(column_name).reset_index(drop=True)

    df_articles.columns = ["url", table_name + "_id"]
    df_articles = df_articles[df_articles['url'].notna()]
    df_articles["titre"] = df_articles["url"].apply(get_url_name)
    return df_articles

def export_csv(df: pandas.DataFrame, name: str):
    """ Export dataframe to csv """
    df.to_csv("./exported_tables/" + name + ".csv", index=False, encoding="utf-8-sig", sep=";")
    print(f"File '{name}' exported to csv : {df.shape[0]} rows, {df.shape[1]} columns")


def load_transform_and_save_data(filename: str, debug_mode: bool = False):
    """
        Load raw data from the input csv filename
        Extract, format, and save clean data into 3 csv, saved in directory "exported_tables"
        - audiences.csv
        - procedures.csv
        - presse_articles.csv
    """
    if debug_mode:
        print("* Debug mode *")

    raw_data = load_data(filename)
    print(f"{len(raw_data)} rows in file, and {len(raw_data.columns)} columns")

    if not os.path.exists("./exported_tables"):
        os.makedirs("./exported_tables")

    # Extract, format, and save data for the 3 tables
    # Table Audiences
    if debug_mode:
        print("\nRunning on 'Audiences' ...")
    df_audiences = extract_audiences(raw_data, debug_mode=debug_mode)
    audiences_to_export = extract_columns(
        df_audiences,
        columns_to_rename=AUDIENCES_COLUMNS
    )
    export_csv(audiences_to_export, name="audiences")

    # Table Procedures
    if debug_mode:
        print("\nRunning on 'Procedures' ...")
    df_procedures = extract_procedures(raw_data, debug_mode=debug_mode)
    procedures_to_export = extract_columns(
        df_procedures,
        columns_to_rename=PROCEDURES_COLUMNS
    )
    export_csv(procedures_to_export, name="procedures")

    # Table presse_articles
    # the articles are coming from audiences and procedures and are then concatenated
    if debug_mode:
        print("\nRunning on presse articles ...")
    procedures_articles = get_articles(
        df_procedures,
        table_name="procedure",
        column_name="La presse parle des faits"
    )
    audiences_articles = get_articles(
        df_audiences,
        table_name="audience",
        column_name="La presse parle du procès"
    )
    # Concat 2 datasets in one with columns : url, procedure_id, audience_id, name
    presse_articles = pandas.concat(
        [procedures_articles, audiences_articles],
        ignore_index=True
    ).fillna("")
    export_csv(presse_articles, name="presse_articles")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Main script to export data")
    parser.add_argument("--file")
    parser.add_argument("--debug", action="store_true", default=False)
    args = parser.parse_args()
    load_transform_and_save_data(filename=args.file, debug_mode=args.debug)