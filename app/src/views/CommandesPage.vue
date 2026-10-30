<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Commandes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Tirer pour rafraîchir -->
      <ion-refresher slot="fixed" @ion-refresh="rafraichir">
        <ion-refresher-content />
      </ion-refresher>

      <!-- 1. Chargement en cours (premier chargement seulement) -->
      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <!-- 2. Erreur -->
      <div v-else-if="erreur" class="ion-padding">
        <ion-text color="danger">
          <p>{{ erreur }}</p>
        </ion-text>
        <ion-button expand="block" @click="charger">Réessayer</ion-button>
      </div>

      <!-- 3. Aucune commande -->
      <div v-else-if="commandes.length === 0" class="ion-text-center ion-padding">
        <ion-text color="medium">
          <p>Aucune commande pour le moment.</p>
        </ion-text>
      </div>

      <!-- 4. Liste des commandes -->
      <ion-list v-else>
        <ion-item v-for="c in commandes" :key="c.id">
          <ion-label class="ion-text-wrap">
            <h2>Commande n°{{ c.id }} · Table {{ c.table }}</h2>
            <p>{{ formatDate(c.date) }}</p>
            <p>{{ detailLignes(c) }}</p>
            <h3>{{ formatAriary(c.total) }}</h3>
          </ion-label>

          <ion-badge slot="end" :color="couleurStatut(c.statut)">
            {{ libelleStatut(c.statut) }}
          </ion-badge>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonText,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  onIonViewWillEnter,
} from "@ionic/vue";
import api from "@/services/api";
import { formatAriary, formatDate } from "@/utils/format";

const commandes = ref([]);
const chargement = ref(true);
const erreur = ref(null);

async function charger() {
  erreur.value = null;
  try {
    commandes.value = await api.getCommandes();
  } catch (e) {
    erreur.value = "Impossible de charger les commandes. L'API est-elle lancée ?";
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

// Tirer pour rafraîchir
async function rafraichir(event) {
  await charger();
  event.target.complete(); // arrête l'animation du refresher
}

// Construit le texte « 2 × Romazava, 1 × Vary fotsy »
function detailLignes(commande) {
  const morceaux = commande.lignes.map((l) => l.quantite + " × " + l.nom);
  return morceaux.join(", ");
}

// « en_attente » -> « en attente »
function libelleStatut(statut) {
  return statut.replace("_", " ");
}

// Couleur du badge selon le statut
function couleurStatut(statut) {
  if (statut === "en_attente") return "warning";
  if (statut === "en_preparation") return "primary";
  if (statut === "prete") return "success";
  if (statut === "servie") return "medium";
  return "medium";
}

// S'exécute à CHAQUE fois que l'onglet devient visible
onIonViewWillEnter(charger);
</script>