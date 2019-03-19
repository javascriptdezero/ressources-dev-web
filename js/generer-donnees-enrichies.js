/*
Auteur : Jérémy Mouzin (www.javascriptdezero.com)
Twitter : https://twitter.com/jeremymouzin

Voici le script qui est appelé de façon périodique par un job cron (voir https://fr.wikipedia.org/wiki/Cron) sur le serveur qui héberge le site ledevweb.fr.

Ce script lit le fichier devweb.json qui contient les infos des chaînes qu'on souhaite inclure dans la liste.
Il en extrait l'ID de la chaîne puis fait une requête sur l'API YouTube pour récupérer plus d'infos sur celle-ci comme l'icône de la chaîne, sa description, le nombre de vues, de vidéos, d'abonnés etc.

Ensuite il ajoute ces nouvelles données dans un objet et génère un nouveau fichier donnees.json contenant toutes les informations de toutes les chaînes. C'est ce fichier qui sera exploité par le site web via le fichier script.js.

Quelques documentations de référence utilisées pour rédiger ce script :
La doc de démarrage rapide de l'API YouTube pour NodeJS : https://developers.google.com/youtube/v3/quickstart/nodejs
La doc de référence de l'API YouTube : https://developers.google.com/youtube/v3/docs/
*/

const fs = require('fs');
const youtube = require('./youtube-api');

const listeChainesJson = './json/devweb.json';
const listeChainesEnrichiesJson = './json/donnees.json';

// On formate les grands nombres par blocs de 3 chiffres donc 13178 devient 13 178 pour une meilleure lisibilité
function ajouterEspacesDansNombre(number) {
  return number.replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
}

function demarrer(auth) {
  // Charge la liste des chaînes de développeurs web depuis le fichier JSON
  const listeChaines = JSON.parse(fs.readFileSync(listeChainesJson));
  
  // Crée une liste des chaînes qui sera enrichie des données récupérées via l'API YouTube
  const listeChainesEnrichies = {};
  const chainesIds = [];

  /*
  On extrait l'ID de la chaîne YouTube depuis son URL, par exemple :
  https://www.youtube.com/channel/UCMzJVrWeaKUotLPWTdx6HuQ => UCMzJVrWeaKUotLPWTdx6HuQ
  */
  listeChaines.forEach((chaine) => {
    const id = chaine.url.split('/').pop();
    listeChainesEnrichies[id] = chaine; // listeChainesEnrichies est le "dictionnaire" dont je parle plus loin...
    chainesIds.push(id);
  });

  /*
  On appelle l'API YouTube pour lister les infos sur les chaînes.

  Petite optimisation d'accès réseau : on demande toutes les chaînes dans une seule requête !

  Pour ça il suffit par exemple de passer comme argument id: "id1,id2,id3".
  Voir https://developers.google.com/youtube/v3/docs/captions/list
  */
  youtube.service.channels.list(
    {
      auth,
      part: 'snippet,statistics',
      id: chainesIds.join(','), // On passe la chaîne de caractère "id1,id2,id3" comme argument
    },
    (erreur, reponse) => {
      if (erreur) {
        console.log(`L'API a retourné une erreur : ${erreur}`);
        return;
      }
      /*
      Il est important de comprendre ici que *l'ordre* des réponses de l'API YouTube n'est PAS garanti.
      C'est normal : les requêtes sont faites de façon asynchrones au niveau de l'API ! Pourquoi ? Tout simplement pour gagner du temps en parallélisant les requêtes. Au lieu de les envoyer les unes à la suite des autres, on envoie tout d'un coup !
      
      Ici, je n'envoie qu'une seule requête avec "id1,id2,id3" comme valeur de l'argument id. Celle-ci sera reçue par les serveurs de l'API YouTube, puis de leur côté, ils vont forger 3 nouvelles requêtes avec chacune id=id1 puis id=id2 puis id=id3. Elles seront envoyées simultanément de façon asynchrone vers les bases de données de YouTube.
      
      Les bases de données vont mettre plus ou moins de temps pour répondre en fonction de chaque requête. La première réponse qui sera reçue ne sera donc pas nécessairement celle avec l'id1, ça peut être celle avec l'id3 par exemple.

      Je vous explique avec un petit schéma au format texte...
      
      ETAPE 1: J'envoie ma requête pour avoir plus d'infos sur 3 chaînes YouTube dont les ids sont id1,id2,id3
      Moi -------requete("id1,id2,id3")-------> Serveurs API YouTube

      ETAPE 2: YouTube forge 3 nouvelles requêtes envoyées de façon asynchrone et simultanée
                                                                     -------requete(id1)-------> Base de données YouTube
                                                Serveurs API YouTube -------requete(id2)-------> Base de données YouTube
                                                                     -------requete(id3)-------> Base de données YouTube

      ETAPE 3: Dès qu'une réponse est prête, elle est envoyée => donc l'ordre n'est plus respecté !
                                                Serveurs API YouTube <-------reponse(id3)------- Base de données YouTube
                                                                     <-------reponse(id1)------- Base de données YouTube
                                                                     <-------reponse(id2)------- Base de données YouTube

      ETAPE 4: Le serveur nous renvoie un objet JSON *dans l'ordre où il a reçu ses réponses* (donc dans le désordre pour nous !)
      Moi <-------reponse(id3,id1,id2)------- Serveurs API YouTube

      Ça veut dire quoi pour nous ?
      
      Ça veut dire que même si vous passez id1,id2,id3 comme valeur de l'argument id à la méthode youtube.service.channels.list(), le contenu des réponses ne sera pas forcément dans l'ordre id1,id2,id3 mais pourra être par exemple dans l'ordre id3,id1,id2 !

      Ce qui fait qu'on ne peut pas utiliser une simple boucle qui viendrait collecter les données retournées par l'API dans l'ordre id1,id2,id3 sinon on risquerait de mettre des données provenant de la chaîne id3 dans celle id1 etc.

      C'est pourquoi j'emploie une astuce qui consiste à utiliser une structure de données appelée dictionaire qui est simplement un tableau associatif d'une clé avec une valeur. En JavaScript, on peut faire un dictionnaire avec un objet et ses propriétés. La clé doit être un élément unique représentant notre valeur, ici on utilise l'ID de la chaîne YouTube qui est un identifiant unique pour chaque chaîne.

      Le dictionnaire est nommé listeChainesEnrichies et possède comme clé l'ID de la chaîne YouTube.
      La valeur associée à cette clé est un objet qui contient l'ensemble des informations de la chaîne.

      Ainsi, lorsque je reçois mes données de la chaîne id1 et bien je peux mettre à jour ma valeur en utilisant listeChaineEnrichies[id1].
      */
      const chaines = reponse.data.items;
      if (chaines.length === 0) {
        console.log('Aucune chaîne trouvée.');
      } else {
        const donneesJson = [];

        /*
        Ici on va enrichir l'objet chaîne avec toutes les nouvelles informations retournées par l'API YouTube.

        Pour continuer sur mon exemple avec id1,id2,id3 qui serait retourné dans l'ordre id3,id1,id2, ici lors de la boucle forEach donneesChaine.id aurait la valeur id3, puis à la prochaine itération id1, puis enfin id2.

        Comme ça je m'assure de toujours modifier la bonne chaîne avec la bonne réponse reçue de l'API YouTube en utilisant comme "lien" l'ID de la chaîne (qui est unique à chaque chaîne).
        */
        chaines.forEach((donneesChaine) => {
          const chaine = listeChainesEnrichies[donneesChaine.id];
          chaine.titre = donneesChaine.snippet.title;
          chaine.description = donneesChaine.snippet.description;
          chaine.urlIcone = donneesChaine.snippet.thumbnails.medium.url;

          // Stats de la chaîne
          chaine.nombreVues = ajouterEspacesDansNombre(donneesChaine.statistics.viewCount);
          chaine.nombreAbonnes = ajouterEspacesDansNombre(donneesChaine.statistics.subscriberCount);
          chaine.nombreVideos = ajouterEspacesDansNombre(donneesChaine.statistics.videoCount);
          
          // On ajoute la chaîne enrichie à l'objet donneesJson qui permettra de générer le fichier final
          donneesJson.push(chaine);
        });

        // On génère le fichier JSON avec les données enrichies
        fs.writeFileSync(listeChainesEnrichiesJson, JSON.stringify(donneesJson));
      }
    },
  );
}

// On appellera la fonction demarrer() une fois l'authentification à l'API YouTube effectuée
youtube.lancerAuthentification(demarrer);