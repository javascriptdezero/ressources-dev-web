/*
Auteur : Jérémy Mouzin (www.javascriptdezero.com)
Twitter : https://twitter.com/jeremymouzin

J'ai créé ce script (qui ne va me servir qu'une seule fois) pour convertir le contenu de mon fichier devweb.json automatiquement plutôt que de le faire à la main !

Le but est de prendre tous les tags et de les répartir dans de nouvelles catégories "langages", "frameworks", "outils" et "autre" pour les afficher séparément sur le site et faciliter la lecture du contenu proposé par les chaînes.
*/
const fs = require('fs');

// Les fichiers en entrée et en sortie
const listeChainesJson = './json/devweb.json';
const listeChainesAvecCategoriesJson = './json/devweb2.json';

// On lit le fichier d'entrée et on le récupère comme un objet JS
const listeChaines = JSON.parse(fs.readFileSync(listeChainesJson));

// Liste des catégories contenant chacune plusieurs tags uniques
const categories = {
  // "langages" est une catégorie
  langages: [
    "javascript", // "javascript" est un tag
    "php",
    "html",
    "css",
    "less",
    "sass",
    "ruby",
  ],
  frameworks: [
    "symfony",
    "react",
    "pwa",
    "phaser.js",
    "jquery",
    "gatsby",
    "cakephp",
    "vue",
    "bootstrap",
    "angular",
    "laravel",
    "ruby on rails",
    "react native",
    "bulma",
    "meteor",
    "express",
    "ionic",
    "meanjs",
  ],
  outils: [
    "vscode",
    "twig",
    "emmet",
    "sublime",
    "nodejs",
    "wordpress",
    "git",
    "gulp",
    "phpstorm",
    "webpack",
  ],
  autre: [
    "formation",
    "reconversion professionnelle",
    "bonnes pratiques",
    "conseils & astuces",
    "algorithmique",
    "battledev",
    "interviews",
    "vlog",
    "humour",
    "inspiration",
    "duel de devs",
    "freelance",
    "école 42",
    "conférences",
    "laracon",
  ]
}
const tousLesTags = [].concat(...Object.values(categories));

// Pour créer la liste ci-dessous, j'ai listé les tags uniques avec cette fonction
function listerTagsUniques(chaines) {
  // L'unicité est obtenu grâce à l'utilisation d'un Set au lieu d'un tableau (Array)
  const tagsUnique = new Set();
  
  chaines.forEach((chaine) => {
    chaine.tags.forEach(tag => {
      tagsUnique.add(tag);
    });
  });

  // J'affiche '"tag",' pour tous les tags pour faciliter la création de l'objet categories tout en haut de ce fichier via un simple copier-coller !
  tagsUnique.forEach(tag => console.log(`"${tag}",`));
}

// Ici je voulais m'assurer que je n'avais pas oublié de catégoriser un tag
function chercherTagsSansCategorie(chaines) {
  const orphelins = [];

  chaines.forEach(chaine => {
    const tags = chaine.tags;
    
    tags.forEach(tag => {
      if (!tousLesTags.includes(tag)) {
        orphelins.push(tag);
      }
    });
  });

  return orphelins;
}

// On veut classer un tag dans une seule et unique catégorie, je vérifie donc qu'il n'y a pas de doublons dans ma liste
function tagsEnDoublonsDansCategories(listeChaines) {
  const doublons = [];
  const tagsUniques = [];

  tousLesTags.forEach(tag => {
    if (tagsUniques.includes(tag)) {
      doublons.push(tag);
    } else {
      tagsUniques.push(tag);
    }
  });
  
  return doublons;
}

// listerTagsUniques(listeChaines);
const doublons = tagsEnDoublonsDansCategories(listeChaines);
if (doublons.length > 0) {
  console.log(`Doublons trouvés dans les catégories : ${doublons.join(",")}`);
}

const tagsSansCategorie = chercherTagsSansCategorie(listeChaines);
if (tagsSansCategorie.length > 0) {
  console.log(`Tags sans catégorie : ${tagsSansCategorie.join(",")}`);
}

console.log("Classement en cours...");
listeChaines.forEach(chaine => {
  // On crée les nouvelles propriétés au nom des catégories pour chaque chaîne
  Object.keys(categories).forEach(categorie => {
    chaine[categorie] = [];
  });
  
  
  const tags = chaine.tags;
  tags.forEach(tag => {
    Object.keys(categories).forEach(nomCategorie => {
      if (categories[nomCategorie].includes(tag)) {
        chaine[nomCategorie].push(tag);
      }
    })
  });

  // On supprime la propriété tags devenue inutile
  delete chaine.tags;
});

// On écrit dans le fichier de sortie en JSON
fs.writeFileSync(listeChainesAvecCategoriesJson, JSON.stringify(listeChaines));
console.log(`Terminé, consultez le fichier ${listeChainesAvecCategoriesJson}`);