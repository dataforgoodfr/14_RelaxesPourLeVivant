"""
    All the columns names by table, and the mapping with the column names in the csv

    Dict :
    - key = column name in the input csv
    - value = column name in the exported csv
"""
AUDIENCES_COLUMNS = {
    "id": "id",
    "Référence procédure": "reference_procedure",
    "Date de l\'audience": "date_de_l_audience",
    "Ville de l\'audience": "ville_de_l_audience",
    "Juridiction": "juridiction",
    "Degré de juridiction": "degre_de_juridiction",
    "Date de décision": "date_de_decision",
    "Détails de la décision pour les infractions principales": "details_de_la_decision_pour_les_infractions_principales",
    "Décision pour les infractions principales": "decision_pour_les_infractions_principales",
    "Numéro de chambre": "numero_de_chambre",
    "Chefs de prévention Catégorie": "chefs_de_prevention_categorie",
    "Chefs de prévention Sous catégorie": "chefs_de_prevention_sous_categorie",
    "Nombre de prévenu·es": "nombre_de_prevenus",
    "Plaidoirie de la défense": "plaidoirie_de_la_defense",
    "Noms des parties civiles": "noms_des_parties_civiles",
    "Demande des parties civiles": "demande_des_parties_civiles",
    "Réquisitions": "requisitions",
    "Fondement de la relaxe": "fondement_de_la_relaxe",
    "Type de peine pour les infractions principales": "type_de_peine_pour_les_infractions_principales",
    "Détails des peines pour les infractions principales": "details_des_peines_pour_les_infractions_principales",
    "Décision et peines pour les infractions subies ou incidentes": "decision_et_peines_pour_les_infractions_subies_ou_incidentes",
    "Score de la gravité": "score_de_la_gravite",
    "Dommages et intérêts": "dommages_et_interets",
    "Détail des dommages et intérêts": "detail_des_dommages_et_interets",
    "Inscription au casier judiciaire": "inscription_au_casier_judiciaire",
    "Appel d\'une des parties": "appel_d_une_des_parties",
    "Partie de l\'appel principal": "partie_de_l_appel_principal",
    "Partie de l\'appel incident": "partie_de_l_appel_incident",
    # "La presse parle du procès",
    # "Récit d\'audience": "recit_d_audience",
    # "Décision (Jugement ou arrêt)*": "jugement_ou_arret",  -> Files will not be filled here
    "Référence de la décision": "reference_de_la_decision",
    "Résumé du jugement ou arrêt": "resume_du_jugement_ou_arret",
    "Résumé de l\'audience": "resume_de_l_audience",
    "Commentaire MSDE": "commentaire_msde",
    "Extrait de la décision": "extrait_de_la_decision",
    "Mots-clés": "mots_cles",
    "publiee": "publiee",
}

PROCEDURES_COLUMNS = {
    "Référence procédure": "reference_procedure",  # this is the unique key
    "Faits très concis": "faits_concis",
    "Titre": "titre",
    "Date des faits": "date_des_faits",
    "faits détaillés": "faits_detailles",
    "Poursuites": "poursuites",
    "Collectif d'action ou lutte": "collectif_d_action_ou_lutte",
    "publiee": "publiee",
}
