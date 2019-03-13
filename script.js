/*
Il n'existe pas "une seule" manière de faire un programme. Je vous présente ma façon
de générer le HTML mais il peut en exister beaucoup d'autres !
*/

// La liste est affichée de façon aléatoire à chaque chargement pour permettre aux chaînes
// peu connues de se faire connaître. Voici la fonction qui mélange le tableau des chaînes.
// Voir https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function melanger(tableau) {
  var nombreElementsDansTableau = tableau.length, positionAleatoire;

  // Tant qu'il y a des éléments à mélanger...
  while(nombreElementsDansTableau) {

    // Choisi un élément au hasard
    positionAleatoire = Math.floor(Math.random() * nombreElementsDansTableau--);

    // Echange-le avec l'élément courant
    // Code d'origine (utilise une variable temporaire t):
    // t = tableau[m];
    // tableau[m] = tableau[i];
    // tableau[i] = t;
    
    // Mais ce n'est plus utile grâce au destructuring dans ES6 :) !
    // Voir https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Op%C3%A9rateurs/Affecter_par_d%C3%A9composition#%C3%89change_de_variables
    [tableau[nombreElementsDansTableau], tableau[positionAleatoire]] = [tableau[positionAleatoire], tableau[nombreElementsDansTableau]];
  }

  return tableau;
}

// On récupère le contenu du fichier donnees.json qui contient toutes les infos des chaînes qu'on veut afficher
const fichierDonneesChaines = 'donnees.json';

const request = new XMLHttpRequest();
request.open('GET', fichierDonneesChaines);
request.responseType = 'json';
request.send();

request.onload = function() {
  // On mélange les chaînes pour ne favoriser personne
  const donneesChaines = melanger(request.response);
  const liste = document.getElementById('liste');

  donneesChaines.forEach((chaine) => {
    const li = document.createElement('li');
    const div = document.createElement('div');
    
    // Titre de la chaîne
    const nomChaine = document.createElement('span');
    nomChaine.classList.add('nom-chaine');
    nomChaine.textContent = chaine.titre;

    // Bloc de présentation
    const presentationChaine = document.createElement('div');
    presentationChaine.classList.add('presentation-chaine');
    
    // Icône de la chaîne
    const iconeChaine = document.createElement('img');
    iconeChaine.src = chaine.urlIcone;
    iconeChaine.alt = chaine.titre;

    // Liste des statistiques de la chaîne
    const statistiquesChaine = document.createElement('ul');
    statistiquesChaine.classList.add('statistiques-chaine');
    
    // Données des stats avec les icônes correspondantes
    const donneesStats = [
      {
        classesIcones: ["fab", "fa-youtube"],
        valeur: chaine.nombreAbonnes,
        texte: "abonnés",
      },
      {
        classesIcones: ["fas", "fa-video"],
        valeur: chaine.nombreVideos,
        texte: "vidéos",
      },
      {
        classesIcones: ["fas", "fa-eye"],
        valeur: chaine.nombreVues,
        texte: "vues",
      },
    ];
    
    let stats, icone, valeur;
    donneesStats.forEach(valeurs => {
      stats = document.createElement('li');

      // Icône accompagnant la statistique
      icone = document.createElement('i');
      icone.classList.add(...valeurs.classesIcones);

      // Valeur de la statistique
      valeur = document.createElement('span');
      valeur.classList.add('nombre');
      valeur.textContent = valeurs.valeur;

      stats.appendChild(icone);
      stats.appendChild(valeur);
      stats.appendChild(document.createTextNode(" " + valeurs.texte));
      statistiquesChaine.appendChild(stats);
    });
    
    // Description de la chaîne
    const descriptionChaine = document.createElement('p');
    descriptionChaine.innerHTML = chaine.description.replace(/\n/g, '<br/>');

    // On ajoute le titre tags
    const titreTags = document.createElement('span');
    titreTags.classList.add('mini-titre');
    titreTags.textContent = "tags";

    // Liste des tags
    const listeTags = document.createElement('ul');
    chaine.tags.forEach(tag => {
      const li = document.createElement('li');
      li.classList.add('tag');
      li.textContent = tag;
      listeTags.appendChild(li);
    })

    // Bouton
    const bouton = document.createElement('div');
    bouton.classList.add('bouton');
    
    // Lien vers la chaîne
    const lienChaine = document.createElement('a');
    lienChaine.href = chaine.url;
    lienChaine.target = "_blank";
    
    // Icône YouTube du bouton
    const iconeBouton = document.createElement('i');
    iconeBouton.classList.add('fab', 'fa-youtube');

    // Ajout des éléments dans la div du bouton
    bouton.appendChild(lienChaine);
    lienChaine.appendChild(iconeBouton);
    lienChaine.appendChild(document.createTextNode("Voir cette chaîne"));

    // On ajoute tous les éléments à la div principale
    div.appendChild(nomChaine);
    div.appendChild(presentationChaine);
    presentationChaine.appendChild(iconeChaine);
    presentationChaine.appendChild(statistiquesChaine);
    presentationChaine.appendChild(descriptionChaine);
    div.appendChild(titreTags);
    div.appendChild(listeTags);
    div.appendChild(bouton);

    // On ajoute ce développeur à la liste globale
    li.appendChild(div);
    liste.appendChild(li);
  });
};
