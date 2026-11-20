/*
 * 04 — GÉNÉRIQUES
 */

// A. premier : renvoie le premier élément d'un tableau, ou undefined s'il est vide.
//    Elle doit marcher pour un tableau de Plat, de nombres, de textes...
//    premier([3, 4]) a le type  number | undefined
//    premier(plats)  a le type  Plat | undefined

// TODO : remplacez les any par un paramètre de type <T>
export function premier<T>(liste: T[]): T | undefined {

// export function premier(liste: any[]): any{
  return liste[0];
}

// B. Depot<T> : stocke des éléments qui ont TOUS un id numérique.
//    - ajouter(element)  : ajoute l'élément
//    - trouver(id)       : renvoie l'élément ou undefined
//    - tous()            : renvoie une COPIE du tableau (modifier la copie ne change pas le dépôt)
//    Contrainte : new Depot<number>() doit provoquer une erreur de compilation.
//    Indice : <T extends { id: number }>
export class Depot<T extends { id: number }> {
  // TODO
  private elements: T[] = [];

  ajouter(element: T): void {
    this.elements.push(element);
  }

  trouver(id: number): T | undefined {
    return this.elements.find((el) => el.id === id);
  }

  tous(): T[] {
    return [...this.elements];
  }

}
// 1. Survolez "resGenerique" : TypeScript affiche -> const resGenerique: number | undefined
const resGenerique = premier([3, 4]);

// Décommentez la ligne suivante : TypeScript signale une erreur car resGenerique peut être undefined
// resGenerique.toFixed(2);

// Décommentez la ligne suivante : TypeScript signale une erreur car toUpperCase n'existe pas sur number
// resGenerique?.toUpperCase();

// 2. Test de la contrainte sur Depot :
// Décommentez la ligne suivante : TypeScript refuse car number n'a pas de propriété { id: number }
// const depotInvalide = new Depot<number>();