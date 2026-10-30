import { ref, computed } from "vue";

// Déclaré EN DEHORS de la fonction : un seul panier pour toute l'application
const lignes = ref([]); // chaque ligne : { plat, quantite }

export function usePanier() {
  function ajouter(plat) {
    // TODO : si le plat est déjà dans le panier, quantite + 1,
    const ligne = lignes.value.find((l) => l.plat.id === plat.id);
    if (ligne) {
      ligne.quantite++;
    } else {
      lignes.value.push({ plat, quantite: 1 });
    }
    //        sinon ajouter une ligne { plat, quantite: 1 }
  }

  function changerQuantite(platId, delta) {
    // TODO : ajoute delta (+1 ou -1) à la quantité ;
    //        si la quantité tombe à 0, retirer la ligne
    const ligne = lignes.value.find((l) => l.plat.id === platId);
    if (!ligne) return;

    const prochaineQuantite = ligne.quantite + delta;

    if (prochaineQuantite <= 0) {
      lignes.value = lignes.value.filter((l) => l.plat.id !== platId);
      return;
    }

    ligne.quantite = prochaineQuantite;
  }

  function vider() {
    lignes.value = [];
  }

  /* TODO : somme des quantités */
  const nombreArticles = computed(() =>
    lignes.value.reduce((acc, l) => acc + l.quantite, 0),
  );
  /* TODO : somme des prix × quantités */
  const total = computed(() =>
    lignes.value.reduce((acc, l) => acc + l.plat.prix * l.quantite, 0),
  // const total = computed(() =>
  // lignes.value.reduce((t, l) => t + l.plat.prix, 0),
  );

  return { lignes, ajouter, changerQuantite, vider, nombreArticles, total };

  
}
