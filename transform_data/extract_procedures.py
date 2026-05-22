import pandas
from cleaning_functions import (
    clean_data_by_columns,
    fill_empty_titles,
    clean_multi_select,
    extract_date
)
from export_data_functions import extract_columns_by_table
from check_values import check_procedures


# Cleaning functions applied to each column from "Procedures"
MAPPING_CLEANING_BY_COLUMNS_PROCEDURES = {
    "Collectif d'action ou lutte": clean_multi_select,
    "Date des faits": extract_date,
    # Publiee is always true for procedures, this information is used in the "audiences" level
    "publiee": lambda x: True,
}


def get_first_valid_value(serie: pandas.Series) -> object:
    """ Get the first value not null and not containing 'cf 1ere instance'."""
    for val in serie:
        if pandas.isna(val):
            continue
        if isinstance(val, str) and "cf 1ere instance" in val.lower():
            continue
        return val
    return None


def extract_procedures(
        raw_data: pandas.DataFrame,
        debug_mode: bool = False
) -> pandas.DataFrame:
    """ Extract the columns needed for table "Procedures" and put them int the correct format
        - Keep the columns tag as "table = procedure" in the input csv
        - one row by "procedure", keeping the correct values
        - Cleaning values for come columns (extract date, convert to boolean, ...)
    """
    raw_procedures = extract_columns_by_table(
        raw_data,
        table_name="procédure",
        debug_mode=debug_mode
    )

    if "Référence procédure" not in raw_procedures.columns:
        raise ValueError("WARNING 'Référence procédure' not in procedures tables")

    # Keep one row by "procédure", and keep the first valid value for each column
    deduplicated_procedures = (
        raw_procedures
        .groupby("Référence procédure", sort=False, dropna=False)
        .agg(get_first_valid_value)
        .reset_index()
    )

    # Apply cleaning functions by column
    df_procedures = clean_data_by_columns(
        deduplicated_procedures,
        mapping_cleaning_by_columns=MAPPING_CLEANING_BY_COLUMNS_PROCEDURES
    )

    # Make sure column title is filled as it is NOT NULL in the database
    df_procedures = fill_empty_titles(df_procedures)

    check_procedures(df_procedures)
    return df_procedures
