# RelaxePourLeVivant

Plateforme de jurisprudences et de ressources juridiques à destination des professionel·les ou des citoyen·nes.

  - Recherche de décisions de justices
  - Accès à fiches détaillées de chaque audience
  - Visulation temporelle des procédures

## Stack techniques

- [AdonisJS](https://docs.adonisjs.com/guides/preface/introduction)
- [NocoDB](https://nocodb.com/docs/product-docs)
- [Postgres](https://www.postgresql.org/docs/)

## Prérequis

- NodeJS
- Docker ou Podman

### Installation

- clonez le dépots
- installez les dépendances `npm install`
- copier `.env.example` vers `.env` et renseignez les variables manquante
- démarrez les services externes `docker compose up -d` ou `podman compose up -d`
- démarrez l'application en mode dev `npm run dev`

### Préparer la base de données

- jouez les migrations `node ace migration:run`
- ajoutez de la donnée factis `node ace db:seed`

Si besoin vous pouvez remettre à zéro votre dase de données avec les commandes `node ace db:wipe` ou `node ace migration:reset`
et relancer les commande du donnée ci-dessus.

### Configurer NocoDB

Après votre premier installation de NocoDB vous aurez besoin de configurer une connexion vers la base données de l'application.

- Allez dans integrations, puis ajouter une integration pour Postgres :

  - Host address : db
  - Port number : 5432
  - Username : la valeur de POSTGRES_USER dans `.env`
  - Password : la valeur de POSTGRES_PASSWORD dans `.env`
  - Database : le nom de la database dans `database/postgres-init/create-database.sql`
  - Schema name : public

### Strucutre du projet

Le projet suit le plus possible la structure d'un projet [AdonisJS](https://docs.adonisjs.com/guides/preface/introduction).
Le framework offre un ensemble de commande pour créer de nouveaux composants via la commande `node ace`

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

Le projet est construit sur un architecture MVC

- des models via l'ORM [Lucid](https://lucid.adonisjs.com/docs/introduction) 
- des vues via le moteur de template [Edge](https://edgejs.dev/docs/introduction)
- des [controlleurs](https://docs.adonisjs.com/guides/basics/controllers)

AdonisJs fournis une configuration par défaut pour ESlint et Prettier.

![schema d'architecture de l'application](https://github.com/dataforgoodfr/14_RelaxesPourLeVivant/blob/main/docs/architecture.svg?raw=true)

![configuration de NocoDB](https://github.com/dataforgoodfr/14_RelaxesPourLeVivant/blob/main/docs/nocodb_config.svg?raw=true)
