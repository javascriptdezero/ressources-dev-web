/*
Il n'existe pas "une seule" manière de faire un programme. Je vous présente ma façon
de générer le HTML mais il peut en exister beaucoup d'autres !


*/

// On récupère le contenu du fichier donnees.json qui contient toutes les infos des chaînes qu'on veut afficher
const fichierDonneesChaines = 'donnees.json';

const request = new XMLHttpRequest();
request.open('GET', fichierDonneesChaines);
request.responseType = 'json';
request.send();

request.onload = function() {
  const donneesChaines = request.response;
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
    console.log(chaine.description);

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
