/*
Auteur : Jérémy Mouzin (www.javascriptdezero.com)
Twitter : https://twitter.com/jeremymouzin

Ce script est à 90% composé du code de base de la documentation "démarrage rapide" de l'API YouTube pour NodeJS.
Voir https://developers.google.com/youtube/v3/quickstart/nodejs.

J'ai simplement placé ce script dans son propre fichier pour séparer son contenu du script de génération des données.
J'appelle son contenu via les modules NodeJS (utilisation de la variable exports).

J'ai également modifié la façon dont on charge la clé secrète permettant d'accéder à l'API YouTube. En effet il ne faut JAMAIS publier sa clé secrète sur GitHub sinon quelqu'un de malintentionné pourrait l'utiliser ! J'utilise une variable d'environnement pour charger la clé secrète lorsque je suis en production, ainsi personne ne peut la voir.

J'ai traduit en Français les commentaires déjà présents dans la documentation.
*/

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

exports.service = google.youtube('v3');

// Si vous modifiez ces valeurs, supprimez vos certificats d'identification sauvegardés précédemment dans ~/.credentials/youtube-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = `${process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE}/.credentials/`;
const TOKEN_PATH = `${TOKEN_DIR}youtube-nodejs-quickstart.json`;
const FICHIER_CLE_SECRETE_API = 'client_secret.json';
const VAR_ENV_CLE_SECRETE_API = "CLE_SECRETE_API";

exports.lancerAuthentification = function lancerAuthentification(callback) {
  /*
  Charge la clé secrète depuis un fichier local (quand on développe) ou depuis la
  variable d'environnement lorsqu'on déploie le site en production. Ceci pour éviter de
  publier notre clé secrète sur le dépôt GitHub !
  */
  // On cherche déjà si le fichier contenant la clé secrète est présent...
  fs.readFile(FICHIER_CLE_SECRETE_API, (err, content) => {
    if (err) {
      // Si on ne trouve pas le fichier, on utilise la variable d'environnement
      if (process.env[VAR_ENV_CLE_SECRETE_API]) {
        console.log(`Clé d'authentification trouvée dans la variable d'environnement '${VAR_ENV_CLE_SECRETE_API}'.`);
        content = process.env[VAR_ENV_CLE_SECRETE_API];
      } else {
        console.log(`Clé d'authentification introuvable pour se connecter à l'API YouTube. Il n'y a pas de fichier ${FICHIER_CLE_SECRETE_API}) ni de variable d'environnement '${VAR_ENV_CLE_SECRETE_API}'.`);
        return;
      }
    } else {
      console.log(`Clé d'authentification trouvée depuis le fichier '${FICHIER_CLE_SECRETE_API}'.`)
    }
    // Autorise un client avec les certificats d'authentification chargés d'appeler l'API YouTube
    authorize(JSON.parse(content), callback);
  });
};

/**
 * Crée un client OAuth2 avec les certificats d'authentification donnés, puis exécute la fonction callback
 *
 * @param {Object} credentials Les certificats d'authentification du client
 * @param {function} callback Le callback à appeler avec le client autorisé
 */
function authorize(credentials, callback) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Vérifie si un jeton d'accès (token) avait déjà été stocké précédemment, si oui on l'utilise pour s'authentifier, sinon on en crée un nouveau
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Récupère et stocke un nouveau jeton après avoir demandé l'autorisation utilisateur, puis exécute le callback indiqué 
 * avec le client OAuth2 authentifié
 *
 * @param {google.auth.OAuth2} oauth2Client Le client OAuth2 pour lequel on récupère un jeton
 * @param {getEventsCallback} callback Le callback à appeler avec le client authentifié
 */
function getNewToken(oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Autorisez cette application en visitant cet URL :', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Entrez le code de cette page ici : ', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log("Erreur pendant la tentative de récupération du jeton d'accès", err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Stocke le jeton sur le disque pour les prochaines exécutions
 *
 * @param {Object} token Le jeton à stocker sur le disque
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log(`Jeton stocké dans ${TOKEN_PATH}`);
  });
  console.log(`Jeton stocké dans ${TOKEN_PATH}`);
}
