
// On récupère le contenu du fichier donnees.json qui contient toutes les infos des chaînes qu'on veut afficher
const fichierDonneesChaines = 'donnees.json';

const request = new XMLHttpRequest();
request.open('GET', fichierDonneesChaines);
request.responseType = 'json';
request.send();

request.onload = function() {
  const donneesChaines = request.response;
  console.log(donneesChaines);
  const liste = document.getElementById('liste');
  donneesChaines.forEach((chaine) => {
    const li = document.createElement('li');
    li.textContent = chaine.titre;
    liste.appendChild(li);
  });
};
