/*
Auteur : Jérémy Mouzin (www.javascriptdezero.com)
Twitter : https://twitter.com/jeremymouzin

Il n'existe pas "une seule" manière de faire un programme. Je vous présente ma façon de générer le HTML mais il peut en exister beaucoup d'autres !

Ce script est appelé depuis la page web du site via la balise classique <script src="script.js">. Il va lire le fichier donnees.json et générer du contenu HTML qui sera ajouté dynamiquement au moment du chargement de la page.
*/

/*
La liste est affichée de façon aléatoire à chaque chargement pour permettre aux chaînes peu connues de se faire connaître. Voici la fonction qui mélange le tableau des chaînes.
Voir https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
*/
function melanger(tableau) {
  let nombreElementsRestantsAMelanger = tableau.length;
  let positionAleatoire;

  // Tant qu'il y a des éléments à mélanger...
  while(nombreElementsRestantsAMelanger) {

    // Choisi un élément au hasard
    positionAleatoire = Math.floor(Math.random() * nombreElementsRestantsAMelanger);
    nombreElementsRestantsAMelanger = nombreElementsRestantsAMelanger - 1;

    /*
    Laissez-moi faire une petite parenthèse :).
    
    Sur le code d'origine (ci-après) pour échanger les valeurs de deux éléments du tableau, l'auteur utilisait une variable temporaire t comme ceci :
    t = tableau[m];
    tableau[m] = tableau[i];
    tableau[i] = t;

    Je l'ai modifié car ce n'est plus utile d'utiliser une variable temporaire grâce au destructuring dans ES6 :) !
    Voir https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Op%C3%A9rateurs/Affecter_par_d%C3%A9composition#%C3%89change_de_variables
    
    On échange l'élément aléatoire avec l'élément courant :
    */
    [tableau[nombreElementsRestantsAMelanger], tableau[positionAleatoire]] = [tableau[positionAleatoire], tableau[nombreElementsRestantsAMelanger]];
  }

  return tableau;
}

// On récupère le contenu du fichier donnees.json via une requête GET (Ajax) qui contient toutes les infos des chaînes qu'on veut afficher
const fichierDonneesChaines = './json/donnees.json';
const request = new XMLHttpRequest();
request.open('GET', fichierDonneesChaines);
request.responseType = 'json';
request.send();

// Lorsque la requête GET est résolue, on exécute le code ci-dessous
request.onload = function() {
  // On mélange les chaînes pour ne favoriser personne
  const donneesChaines = melanger(request.response);
  const liste = document.getElementById('liste');

  // Mise à jour du compteur de chaînes YouTube
  const compteur = document.getElementById('compteur');
  compteur.textContent = `${donneesChaines.length} ${compteur.textContent}`;

  donneesChaines.forEach((chaine) => {
    const li = document.createElement('li');
    const div = document.createElement('div');
    
    // Titre de la chaîne
    const nomChaine = document.createElement('span');
    nomChaine.classList.add('nom-chaine');
    nomChaine.textContent = chaine.titre;
    
    // On ajoute le titre de la chaîne à la div principale
    div.appendChild(nomChaine);

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
    // Si la description n'est pas renseignée, on l'indique
    if (chaine.description.length === 0) {
      chaine.description = "Aucune description disponible.";
    }
    // Il faut remplacer les retours à la ligne (\n) avec la balise <br/> pour ne pas tout avoir sur une seule ligne
    descriptionChaine.innerHTML = chaine.description.replace(/\n/g, '<br/>');

    // On ajoute le bloc de presentation à la div principale
    div.appendChild(presentationChaine);
    presentationChaine.appendChild(iconeChaine);
    presentationChaine.appendChild(statistiquesChaine);
    presentationChaine.appendChild(descriptionChaine);

    // Affichage des catégories, on n'affiche les catégories que si elles contiennent des tags
    const categories = ["langages", "frameworks", "outils", "autre"];
    categories.forEach(categorie => {
      if (chaine[categorie].length > 0) {
        // On crée le titre correspondant à la catégorie
        const titreCategorie = document.createElement('span');
        titreCategorie.classList.add('mini-titre');
        titreCategorie.textContent = categorie;

        // On ajoute le titre de la catégorie à la div principale
        div.appendChild(titreCategorie);

        // On crée la liste des tags contenus dans cette catégorie
        const listeTags = document.createElement('ul');
        chaine[categorie].forEach(tag => {
          const li = document.createElement('li');
          li.classList.add('tag');
          li.textContent = tag;
          listeTags.appendChild(li);
        })

        // On ajoute la liste des tags de la catégorie à la div principale
        div.appendChild(listeTags);
      }
    });

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

    // On ajoute le bouton à la div principale
    div.appendChild(bouton);

    // On ajoute ce développeur à la liste globale
    li.appendChild(div);
    liste.appendChild(li);
  });
};
