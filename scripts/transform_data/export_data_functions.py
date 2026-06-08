""" Functions used ot export and parse data from raw csv """

import pandas
from cleaning_functions import clean_basic


def get_row_index_from_name(data: pandas.DataFrame, row_name: str) -> int:
    """ Get the index of the row where the first column value is row_name"""
    first_col = data.iloc[:, 0]
    header_row_mask = first_col == row_name
    matches = data[header_row_mask].index

    if len(matches) == 0:
        raise ValueError(f"'{row_name}' not found. First column contains: {data.iloc[:, 0].unique()}")

    return matches[0]


def remove_empty_rows_for_column(df: pandas.DataFrame, column_name: str):
    return df[df[column_name].notna() & (df[column_name] != '')]


def choose_data(df: pandas.DataFrame) -> pandas.DataFrame:
    """ Rules applied to keep only the correct data """
    # Column reference_procedure is mandatory
    df = remove_empty_rows_for_column(df, column_name="Référence procédure")
    return df


def load_data(file_name: str) -> pandas.DataFrame:
    """
        Load data from csv file,
    """
    raw_data = pandas.read_csv(
        file_name,
        sep=",",
        encoding="utf-8-sig",
        header=None,
        # skip row 0 that contain issues
        skiprows=1,
        engine="python"
    )

    # Get the names of the columns from the line containing "Equivalence champ"
    header_row_index = get_row_index_from_name(raw_data, "Equivalence champ")
    raw_data.columns = raw_data.iloc[header_row_index]

    # Remove all empty lines
    raw_data = raw_data.dropna(how="all").reset_index(drop=True)

    raw_data = raw_data.replace({float('nan'): None})

    # Apply basic cleaning on all cells
    raw_data = raw_data.map(clean_basic)

    # Only keep the lines having the right format
    raw_data = choose_data(raw_data)
    return raw_data


def extract_id_nb(id_str: str) -> int:
    """ Extract number from internal audience id having format like A0025"""
    return int(id_str[1:])


def extract_columns_by_table(
        data: pandas.DataFrame,
        table_name: str,
        debug_mode: bool = False
) -> pandas.DataFrame:
    """ Only keep the columns having "Equivalence table" == table_name """

    # Get table name for each column, from the row "Equivalence table"
    row_index = get_row_index_from_name(data, "Equivalence table")
    equiv_table_row = data.iloc[row_index]

    # Only keep columns where the table name contains table_name
    cols_to_keep = [
        col for col, name in zip(data.columns, equiv_table_row)
        if isinstance(name, str) and table_name.lower() in name.lower() and not pandas.isna(col)
    ]

    # Remove first lines that are internal comments, first real row begins after the "ID" row
    first_row_index = get_row_index_from_name(data, "ID") + 1
    if first_row_index > 10:
      raise ValueError(f"Issue first valid row from csv is the {first_row_index} th, "
                       f"please check csv (it should be around the 5th row)")
    if debug_mode:
        print(f"Keep data from first_row_index {first_row_index}")
    data = data[first_row_index:]

    # Keep internal ID for debugging
    data = data.rename(columns={'Equivalence champ': 'Internal ID'})
    cols_to_keep.append("Internal ID")
    data = data[cols_to_keep]

    if debug_mode:
        print(f"Columns kept from csv : {cols_to_keep}")

    # Remove completely empty lines
    data = data.dropna(how="all").reset_index(drop=True)

    # Insert increasing id column
    data["id"] = data["Internal ID"].apply(extract_id_nb)
    return data


def extract_columns(df: pandas.DataFrame, columns_to_rename: dict) -> pandas.DataFrame:
    """ Only keep the columns listed and rename them from a dataframe """
    df = df.rename(columns=columns_to_rename)
    columns_to_keep = list(columns_to_rename.values())

    for col in columns_to_keep:
        col_issues = [col for col in columns_to_keep if col not in df.columns]
        if col_issues:
            raise ValueError(f"""Warning columns not in dataset : {col_issues}
            The dataset is made of these columns : {df.columns}""")

    return df[list(columns_to_keep)]
