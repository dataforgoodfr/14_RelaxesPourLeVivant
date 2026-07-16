import re
import pandas
from datetime import datetime


def clean_basic(value):
    """ Basic cleaning of the textual values, applied on all cells
        - Remove '?'
        - replace NA, N/A, ., néant by None
    """
    if pandas.isna(value) or value is None:
        return None
    if type(value) == str:
        # Remove "?", unless it is surrounded by 2 characters (like in url)
        val = re.sub(r'(?<![a-zA-Z])\?|\?(?![a-zA-Z])', '', value)
        val = val.strip()
        if val.lower() in ("na", "n.a", ".", "néant", ""):
            return None
        if "msde ne dispose pas de cette information" in val.lower():
            return None
        return val
    return value

def extract_date(value) -> str | None:
    """ Extract first date found in the text
        Return to text format : YYYY-MM-DD
    """
    try:
        patterns = [
            # YYYY-MM-DD / YYYY/MM/DD / YYYY.MM.DD
            (r'\b(\d{4})[/\-\.](\d{2})[/\-\.](\d{1,2})\b', 'ymd'),
            # DD/MM/YYYY or D/MM/YYYY
            (r'\b(\d{1,2})[/\-\.](\d{2})[/\-\.](\d{4})\b', 'dmy'),
            # xx/MM/YYYY  no day
            (r'\bx{1,2}[/\-\.](\d{2})[/\-\.](\d{4})\b', 'xmy'),
        ]

        if type(value) == str:
            for pattern, fmt in patterns:
                match = re.search(pattern, value, re.I)
                if not match:
                    continue

                if fmt == 'ymd':
                    year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))

                elif fmt == 'dmy':
                    day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))

                elif fmt == 'xmy':
                    day, month, year = 1, int(match.group(1)), int(match.group(2))

                date = datetime(year, month, day)
                return date.strftime('%Y-%m-%d')
        return None
    except Exception as e:
        raise ValueError(f"Error on extract_date on {value} : {e}")

def extract_number(value):
    """ Get the first number found in the text, if it is a text """
    try:
        if pandas.isna(value) or value is None:
            return None
        if type(value) == float or type(value) == int:
            return value
        match = re.search(r"[-+]?\d+(?:[.,]\d+)?", str(value))
        if match:
            normalized = match.group(0).replace(",", ".")
            return float(normalized)
        return None
    except Exception as e:
        print(f"Error on extract_number on {value} : {e}")

def uppercase(value):
    try:
        if pandas.isna(value) or value is None:
            return None
        return str(value).upper()
    except Exception as e:
        print(f"Error on uppercase on {value} : {e}")

def clean_multi_select(value):
    """ Make sure multi select columns are using "," and not ";" """
    try:
        if pandas.isna(value) or value is None:
            return None
        if type(value) != str:
            print(f"Warning, trying to make a multi select from a {type(value)}, value = {value}")
            return value
        else:
            value = value.replace(";", ",")
            value = ",".join([x.strip() for x in value.split(",") if x and x.strip()])
            return value
    except Exception as e:
        print(f"Error on multi select on {value} : {e}")

def txt_to_boolean(value) -> str | None:
    """ Transform a text to a boolean, in the typescript format : "true" or "false"
        If the text contains "oui" -> true, "non" -> False
    """
    if pandas.isna(value) or value is None:
        return None
    if type(value) == bool:
        return str(value).lower()
    if re.search("oui", value, re.I):
        return "true"
    elif re.search("non", value, re.I):
        return "false"
    return None

def txt_to_boolean_not_null(value) -> str:
    """ Transform a text to a boolean not null, replace not filled values by False"""
    clean_value = txt_to_boolean(value)
    if clean_value:
       return clean_value
    return "false"

def extract_urls(input) -> list[str]:
    """ Extract the list of urls from a text """
    pattern = r"""
        (?:
            (?:https?|ftp)://          # schéma explicite
            |
            (?<!\w)www\.               # ou www. non précédé d'un mot
        )
        (?:[a-zA-Z0-9\-]+\.)+          # domaine(s)
        [a-zA-Z]{2,}                   # TLD
        (?::\d+)?                      # port optionnel
        (?:/[^\s<>"')\]]*)?            # chemin / query / fragment optionnels
    """
    try :
        if type(input) == str:
            urls = re.findall(pattern, input, flags=re.VERBOSE)
            return urls
        return []
    except Exception as e:
        raise ValueError(f"Error on extract_urls on {input} : {e}")

def clean_data_by_columns(df, mapping_cleaning_by_columns):
    for column, cleaning_function in mapping_cleaning_by_columns.items():
        df[column] = df[column].apply(cleaning_function)

    return df


def replace_value(value, dict_to_replace):
    if value in dict_to_replace:
        return dict_to_replace[value]
    return value


def fill_empty_titles(df):
    empty_titles = df['Titre'].isna() | (df['Titre'].str.strip() == '')

    not_empty_collectif = df["Collectif d'action ou lutte"].notna() & (df["Collectif d'action ou lutte"].str.strip() != '')

    new_value = (
            'Action '
            + df["Collectif d'action ou lutte"].where(not_empty_collectif, '')
    )

    df.loc[empty_titles, 'Titre'] = new_value[empty_titles]
    return df
