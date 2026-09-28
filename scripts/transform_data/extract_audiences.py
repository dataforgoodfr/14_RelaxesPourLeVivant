import pandas
from cleaning_functions import (
    clean_data_by_columns,
    txt_to_boolean,
    uppercase,
    extract_date,
    extract_number,
    clean_multi_select,
    replace_value,
    extract_urls,
    extract_MSDE_id
)
from export_data_functions import extract_columns_by_table
from check_values import check_audiences


MAPPING_CLEANING_BY_COLUMNS_AUDIENCES = {
    "publiee": txt_to_boolean,
    "Ville de l'audience": uppercase,
    "Date de l'audience": extract_date,
    "Nombre de prévenu·es": extract_number,
    "Date de décision": extract_date,
    "Mots-clés": clean_multi_select,
    "Score de la gravité": extract_number,
    "Appel d'une des parties": txt_to_boolean,
    "Dommages et intérêts": txt_to_boolean,
    "Fondement de la relaxe":
        lambda value: replace_value(value, dict_to_replace={
            "Motivation non donnée": "",
        }),
    "Chefs de prévention Catégorie": clean_multi_select,
    "Chefs de prévention Sous catégorie": clean_multi_select,
    "La presse parle du procès" : extract_urls,
    "Illustration MSDE": lambda x: extract_urls(x)[0] if extract_urls(x) else None,
    "Récit d’audience": lambda x: extract_urls(x)[0] if extract_urls(x) else extract_MSDE_id(x),
    "Type d'action pour l'analyse": lambda x: clean_multi_select(x, to_replace = ["/"]),
    "Les cas redondants": lambda x: clean_multi_select(x, to_replace = ["/"])
}


def extract_audiences(
    raw_data: pandas.DataFrame,
    debug_mode: bool = False
) -> pandas.DataFrame:
    """ Extract columns needed for table "Audiences" from raw_data and clean them """
    raw_audiences = extract_columns_by_table(
        raw_data,
        table_name="Audience",
        debug_mode=debug_mode
    )

    df_audiences = clean_data_by_columns(
        raw_audiences,
        mapping_cleaning_by_columns=MAPPING_CLEANING_BY_COLUMNS_AUDIENCES
    )

    check_audiences(df_audiences)

    return df_audiences
