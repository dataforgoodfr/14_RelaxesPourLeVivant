import pandas

# Table Audiences
LISTED_VALUES_AUDIENCES = {
    "Partie de l'appel incident": ["Prévenu·e(s)","Parquet","Partie(s) civile(s)"],
    "Partie de l'appel principal": ["Prévenu·e(s)","Parquet","Partie(s) civile(s)"],
    "Juridiction": [
        "Tribunal correctionnel", "Cour d'appel", "Tribunal de police", "Cour de cassation",
        "Cour européenne des droits de l'Homme", "Tribunal maritime"
    ],
    "Décision pour les infractions principales": [
        "Condamnation", "Relaxe", "Relaxe et Condamnation", "Motifs procéduraux"
    ],
    "Degré de juridiction": [
        "1ère instance", "Appel", "Cassation", "Appel n°2", "Cassation n°2",  "CEDH"
    ],
    "Fondement de la relaxe" : [
        "Etat de nécessité",
        "Liberté d'expression",
        "Infraction non caractérisée",
        "Atteinte à la vie privée"
    ],
    "Type de peine pour les infractions principales" : [
        "Prison ferme", "Prison avec sursis", "Amende", "Amende avec sursis", "Jour-amende",
        "Travaux d'intérêt général", "Dispense de peine", "Interdiction de territoire",
        "Interdiction de droits civiques", "Interdiction port d'arme", "Stage de citoyenneté",
        "Retrait de points ou suspension du permis de conduire", "Interdiction d'enceinte sportive",
        "Amende symbolique"
    ],
    "Chefs de prévention Catégorie": [
        "Dégradation",
        "Violence",
        "Vol",
        "Entrave à la circulation",
        "Trouble au fonctionnement des aéronefs",
        "Participation à un groupement en vue de commettre un délit",
        "Entrave à la liberté de travail",
        "Opposition à travaux publics",
        "Port d’arme de catégorie D",
        "Association de malfaiteurs",
        "Outrage à agent",
        "Organisation d'une manifestation non déclarée ou interdite",
        "Refus de fichage (portable/empreintes/ADN)",
        "Intrusion dans une centrale nucléaire",
        "Intrusion",
        "Participation délictueuse à un groupement",
        "Diffamation"
    ],
    "Chefs de prévention Sous catégorie" : [
        "Dégradation légère (Art. R635-1 c. pénal)",
        "Dégradation (Art. 322-1 I c. pénal)",
        "Dégradation par inscriptions signes ou dessins (Art. 322-1 II c. pénal)",
        "Dégradation avec circonstance aggravante : en réunion (Art. 322-3 c. pénal)",
        "Dégradation de bien destiné à l’utilité publique (Art. 322-3 c. pénal)",
        "Dégradation de bien classé (Art. 322-3-1 c. pénal)",
        "Violence sans ITT ou avec ITT inférieure à 8 jours (Art. 222-13 c. pénal)",
        "Violence sans ITT ou avec ITT de moins de 8 jours avec circonstances aggravantes : violence sur personne dépositaire de l’autorité publique (Art. 222-13 4° c. pénal)",
        "Vol (Art. 311-1 c.pénal)",
        "Vol avec circonstances aggravantes : vol en réunion",
        "Entrave à la circulation (Art. L412-1 c. de la route)",
        "Trouble au fonctionnement des installations destinés à assurer le contrôle de la circulation des aéronefs (Art. L6372-4 c. des transports)",
        "Organisation d’une manifestation non déclarée ou interdite (Art. 431-9 c. pénal)",
        "Participation à une manifestation interdite",
        "Refus de dispersion avec sommation",
        "Participation à un groupement en vue de commettre des violences ou des dégradations (art. 222-14-2 c. pénal)",
        "Entrave à la liberté de travail",
        "Opposition à l’exécution de travaux publics ou d’utilité publique par voies de fait ou violences (Art. 433-11 c. pénal)",
        "Mise en danger de la vie d'autrui",
        "Refus de se soumettre à un prélèvement biologique (Art. 706-56 du c. de procédure pénale)",
        "Refus de se soumettre à des prélèvements signalétiques (Art. 55-1 du c. de procédure pénale)",
        "Identité imaginaire (Art. 781 c. de procédure pénale)",
        "Outrage à des personnes dépositaires d’autorité publique (Art. 433-5 c. pénal)",
        "Rébellion (Art. 433-6 c. pénal)",
        "Installation en réunion sur le terrain d’autrui sans autorisation du propriétaire en vue d’y habiter (Art. 322-4-1 c. pénal)",
        "Intrusion ou maintien dans un musée de France (Art. R. 645-13 c. pénal).",
        "Intrusion dans l'enceinte d'une installation civile abritant des matières nucléaires (Art. L1333-13-12 c. de la défense)",
        "Provocation ou incitation suivie d'effet à s'introduire sans autorisation dans l'enceinte d'une installation civile abritant des matieres nucleaires (Art. L1333-12-2 c.de la défense)",
        "Dissimulation du visage (Art. 431-9-1 C. pénal)",
        "Port d’arme de catégorie D (Art. L-311-2 C. sécurité intérieure)"
    ]
}

# Table Procedures
LISTED_VALUES_PROCEDURES = {
    "Collectif d'action ou lutte" : [
        "Dernière Rénovation (DR)",
        "Riposte Alimentaire (RA)",
        "Extinction Rebellion (XR)",
        "Greenpeace",
        "Anv-COP21 (Anv)",
        "Soulèvements de la Terre (SDT)",
        "Action Justice Climat (AJC)",
        "Youth For Climate (YFC)",
        "Scientifiques en Rébellion (SER)",
        "Faucheur.euses volontaires",
        "Résistance à l\'Agression Publicitaire (RAP)",
        "Bretagne contre les fermes-usines",
        "269 Libération Animale",
        "Anti-A69",
        "GNSA",
        "Bure",
        "ATTAC",
        "Bassines Non Merci (BNM)",
        "Confédération Paysanne",
        "Alternatiba",
        "Non au terminal 4",
        "Elzéard - Lure en Résistance",
        "Inter-orga","L214",
        "Les Amis de la Terre",
        "Déboulonneurs",
        "Bizi",
        "Canopée",
        "Ostia",
        "La lutte des sucs",
        "Futuro Vegetal",
        "Sans collectif",
        "Anti-THT Landes",
        "Groupement national de surveillance des arbres (GNSA)",
        "AVA France (Abolissons la Vénerie Aujourd\'hui)",
        "LGV",
        "Faucheurs de chaise",
        "Mega Canal Non Merci",
        "CCLT (Collectif contre le Lyon-Turin)",
        "Gilets Jaunes"
    ],
}


NOT_NULL_COLUMNS_AUDIENCES = ["Référence procédure"]
NOT_NULL_COLUMNS_PROCEDURES = ["Titre", "Référence procédure"]


def check_listed_values(df, listed_values, debug_mode:bool = False):
    """ Check that the values are """
    for column, okay_values in listed_values.items():

        issues_in_values = [
            val for val in okay_values
            if val != val.strip() or "," in val
        ]
        if issues_in_values:
            print(f"\tIssues in listed values for column {column}: {issues_in_values}")

        issues = []
        for i, values in enumerate(df[column]):
            if not pandas.isna(values) and values:
                for value in values.split(","):
                    if value not in okay_values:
                        internal_id = df["Internal ID"].iloc[i]
                        issues.append(f"Issue in row {internal_id}, value : {value}")

        if issues:
            print(f"""Column "{column}" """)
            print("\t" + "\n\t".join(issues))

        if not issues and debug_mode:
            print(f"Everything okay for column '{column}'")


def check_not_null(df, columns_to_check, debug_mode:bool = False):
    for column in columns_to_check:
        issues = []
        for i, values in enumerate(df[column]):
            if pandas.isna(values) or not values:
                internal_id = df["Internal ID"].iloc[i]
                issues.append(internal_id)

        if issues:
            raise ValueError(f"Issue for column '{column}', empty row(s) : {issues}")
        elif debug_mode:
            print(f"Everything okay for column '{column}'")


def check_audiences(df_audiences, debug_mode:bool = False):
    check_listed_values(
        df_audiences,
        listed_values=LISTED_VALUES_AUDIENCES,
        debug_mode=debug_mode
    )
    check_not_null(
        df_audiences,
        columns_to_check=NOT_NULL_COLUMNS_AUDIENCES,
        debug_mode=debug_mode
    )

def check_procedures(df_procedures, debug_mode:bool = False):
    check_listed_values(
        df_procedures,
        listed_values=LISTED_VALUES_PROCEDURES,
        debug_mode=debug_mode
    )
    check_not_null(
        df_procedures,
        columns_to_check=NOT_NULL_COLUMNS_PROCEDURES,
        debug_mode=debug_mode
    )
