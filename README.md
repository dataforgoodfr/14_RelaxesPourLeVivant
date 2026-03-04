# RelaxePourLeVivant

Plateforme de jurisprudences et de ressources juridiques à destination des professionel·les ou des citoyen·nes.

- Recherche de décisions de justice
- Accès à des fiches détaillées de chaque audience
- Visualisation temporelle des procédures

## Stack technique

- [AdonisJS](https://docs.adonisjs.com/guides/preface/introduction)
- [NocoDB](https://nocodb.com/docs/product-docs)
- [Postgres](https://www.postgresql.org/docs/)
- [Metabase](https://www.metabase.com/)

## Prérequis

- NodeJS
- Docker ou Podman

## Installation

- clonez le dépôts
- installez les dépendances `npm install`
- copiez `.env.example` vers `.env` et renseignez les variables manquantes
- démarrez les services externes `docker compose up -d` ou `podman compose up -d`
- démarrez l'application en mode dev `npm run dev`

### Préparer la base de données

- jouez les migrations `node ace migration:run`
- ajoutez de la donnée factice `node ace db:seed`

Si besoin vous pouvez remettre à zéro votre dase de données avec les commandes `node ace db:wipe` ou `node ace migration:reset`
et relancer les commandes de données ci-dessus.

### Configurer NocoDB

Après votre première installation de NocoDB vous aurez besoin de configurer une connexion vers la base données de l'application.  
Par défaut NocoDB est accessible via http://localhost:4444 (cf. compose.yaml)

- Allez dans integrations, puis ajoutez une integration pour Postgres :
  - Host address : db
  - Port number : 5432
  - Username : la valeur de POSTGRES_USER dans `.env`
  - Password : la valeur de POSTGRES_PASSWORD dans `.env`
  - Database : le nom de la database dans `database/postgres-init/create-database.sql`
  - Schema name : public

Pour faire les appels à l'API, il faudra également récupérer un API_TOKEN lié au compte utilisé pour administrer NocoDB.

1. Sur l'interface d'administration, ouvrir le menu "API Tokens" en cliquant sur le compte (en bas à gauche)
2. Ajouter un nouveau token pour l'appli AdonisJS
3. Copier le token généré et le renseigner pour la valeur NC_API_TOKEN dans `.env`

### Configurer Metabase

Si vous lancez Metabase pour la première fois vous aurez besoin de le configurer manuellement, un peu comme NocoDB.  
Par défaut Metabase est accessible via le http://localhost:3000 (cf. compose.yaml)

Suivez les instructions pour créer un premier compte, puis allez dans _Ajoutez vos données_, choisissez _PostgreSQL_.

Pour gagner du temps vous pouvez renseigner la _Connection string_

- Connection string : jdbc:postgresql://db:5423/le_nom_de_votre_base_de_donnee (cf. .env ou database/postgres-init/create-database.sql)
- Nom d'utilisateur : la valeur de POSTGRES_USER dans `.env`
- Mot de passe : la valeur de POSTGRES_PASSWORD dans `.env`

### Mailpit (serveur de mail dev)

Le service `mailpit` du Docker Compose File est un serveur mail de développement, qui gère:

- les envois d'e-mail sur le port `1025`
- la réception des e-mail, à travers un webmail accessible à l'adresse [http://localhost:8025/](http://localhost:8025/)

## Tester

Étant donné que le projet suit une architecture MVC, les tests reposent actuellement sur une stratégie e2e avec [PlayWright](https://docs.adonisjs.com/guides/testing/browser-tests)

Initialiser PlayWright en installant les binaires des navigateurs headless:

```bash
npx playwright install
```

Lancer les tests

```bash
npm run test
``

Si vous utiliser **Podman** vous aurez besoin de configurer [testcontainer](https://node.testcontainers.org/) pour fonctionner avec

- Excuter `podman info --format '{{.Host.RemoteSocket.Path}}'` en ligne de commande
- Ajouter ceci à votre `.env`

```
# TESTCONTAINERS PODMAN CONFIG
DOCKER_HOST={resultat_de_la_commande_podman}
TESTCONTAINERS_RYUK_DISABLED=true
TESTCONTAINERS_RYUK_PRIVILEGED=true
```

## Structure du projet

Le projet suit le plus possible la structure d'un projet [AdonisJS](https://docs.adonisjs.com/guides/preface/introduction).
Le framework offre un ensemble de commandes pour créer de nouveaux composants via la commande `node ace`

```txt
make
  make:command        Create a new ace command class
  make:controller     Create a new HTTP controller class
  make:event          Create a new event class
  make:exception      Create a new custom exception class
  make:factory        Make a new factory
  make:listener       Create a new event listener class
  make:middleware     Create a new middleware class for HTTP requests
  make:migration      Make a new migration file
  make:model          Make a new Lucid model
  make:preload        Create a new preload file inside the start directory
  make:provider       Create a new service provider class
  make:seeder         Make a new Seeder file
  make:service        Create a new service class
  make:test           Create a new Japa test file
  make:validator      Create a new file to define VineJS validators
  make:view           Create a new Edge.js template file
```

Le projet est construit sur une architecture MVC

- des models via l'ORM [Lucid](https://lucid.adonisjs.com/docs/introduction)
- des vues via le moteur de template [Edge](https://edgejs.dev/docs/introduction)
- des [controlleurs](https://docs.adonisjs.com/guides/basics/controllers)

AdonisJs fournit une configuration par défaut pour ESlint et Prettier.

![schema d'architecture de l'application](https://github.com/dataforgoodfr/14_RelaxesPourLeVivant/blob/main/docs/architecture.svg?raw=true)

![configuration de NocoDB](https://github.com/dataforgoodfr/14_RelaxesPourLeVivant/blob/main/docs/nocodb_config.svg?raw=true)
