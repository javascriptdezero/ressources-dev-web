const fs = require('fs');
const youtube = require('./youtube-api');

const listeChainesJson = './json/devweb.json';
const listeChainesEnrichiesJson = './json/donnees.json';

function ajouterEspacesDansNombre(number) {
  return number.replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
}

function demarrer(auth) {
  // Charge la liste des chaînes de développeurs web
  const listeChaines = JSON.parse(fs.readFileSync(listeChainesJson));
  
  // Crée une liste des chaînes qui sera enrichie des données récupérées via l'API YouTube
  const listeChainesEnrichies = {};
  const chainesIds = [];
  listeChaines.forEach((chaine) => {
    const id = chaine.url.split('/').pop();
    listeChainesEnrichies[id] = chaine;
    chainesIds.push(id);
  });

  youtube.service.channels.list(
    {
      auth,
      part: 'snippet,statistics',
      // On demande toutes les chaînes dans une seule requête
      id: chainesIds.join(','),
    },
    (erreur, reponse) => {
      if (erreur) {
        console.log(`L'API a retourné une erreur : ${erreur}`);
        return;
      }
      // Il est important de comprendre ici que l'ordre des réponses du service n'est PAS garanti
      const chaines = reponse.data.items;
      if (chaines.length === 0) {
        console.log('Aucune chaîne trouvée.');
      } else {
        // On ajoute les informations de la chaîne
        const donneesJson = [];
        chaines.forEach((donneesChaine) => {
          const chaine = listeChainesEnrichies[donneesChaine.id];
          chaine.titre = donneesChaine.snippet.title;
          chaine.description = donneesChaine.snippet.description;
          chaine.urlIcone = donneesChaine.snippet.thumbnails.medium.url;

          // Stats de la chaîne
          chaine.nombreVues = ajouterEspacesDansNombre(donneesChaine.statistics.viewCount);
          chaine.nombreAbonnes = ajouterEspacesDansNombre(donneesChaine.statistics.subscriberCount);
          chaine.nombreVideos = ajouterEspacesDansNombre(donneesChaine.statistics.videoCount);
          
          // On ajoute la chaîne enrichie des données récupérées via l'API YouTube
          donneesJson.push(chaine);
        });

        // On génère le fichier JSON de données enrichies
        fs.writeFileSync(listeChainesEnrichiesJson, JSON.stringify(donneesJson));

        /*
        console.log(`## <img align="left" alt="${chaineTitre}" src="${chaineUrlIcone}" height="45">${chaineTitre}

> ${tags}

<img align="left" alt="icône youtube" src="images/youtube.png" height="23">[YouTube](TODO: remplacer par l'URL directe!)https://www.youtube.com/channel/${chaineId}) | ${chaineNombreAbonnes} abonnés | ${chaineNombreVideos} vidéos | ${chaineNombreVues} vues
--- | --- | --- | ---

${chaineDescription}

`);
        */
      }
    },
  );
  //});

  // On génère le fichier donnees.json
  //console.log(JSON.stringify(donneesJson));
}

youtube.lancerAuthentification(demarrer);