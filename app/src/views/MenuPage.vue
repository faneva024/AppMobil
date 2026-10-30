<template>
  <!-- ion-page : l'enveloppe obligatoire de chaque page -->
  <ion-page>
    <!-- En-tête fixe en haut de l'écran -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Menu du jour</ion-title>
      </ion-toolbar>

      <!-- 4.3 Barre de recherche -->
      <ion-toolbar>
        <ion-searchbar
          v-model="recherche"
          placeholder="Rechercher un plat"
          :debounce="250"
        />
      </ion-toolbar>

      <!-- 4.4 Filtre par catégorie (segment) -->
      <ion-toolbar>
        <ion-segment
          v-model="categorieChoisie"
          scrollable
          @ion-change="charger"
        >
          <ion-segment-button value="toutes">
            <ion-label>Tout</ion-label>
          </ion-segment-button>
          <ion-segment-button
            v-for="c in categories"
            :key="c.id"
            :value="String(c.id)"
          >
            <ion-label>{{ c.nom }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <!-- Zone qui défile -->
    <ion-content>
      <!-- 4.5 Tirer pour rafraîchir -->
      <ion-refresher slot="fixed" @ion-refresh="rafraichir">
        <ion-refresher-content />
      </ion-refresher>

      <!-- 1. Chargement en cours -->
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

      <!-- 3. La liste des plats filtrés -->
      <div v-else-if="platsFiltres.length > 0">
        <ion-list>
          <ion-item
            v-for="plat in platsFiltres"
            :key="plat.id"
            :router-link="`/tabs/menu/${plat.id}`"
          >
            <ion-label>
              <h2>{{ plat.nom }}</h2>
              <p>{{ plat.categorie?.nom }}</p>
              <ion-text color="primary">{{ plat.description }}</ion-text>
            </ion-label>
            <ion-note slot="end">{{ formatAriary(plat.prix) }}</ion-note>
            <ion-badge v-if="!plat.disponible" color="medium">Épuisé</ion-badge>

            <ion-button
              slot="end"
              fill="clear"
              :disabled="!plat.disponible"
              @click.stop.prevent="ajouterAuPanier(plat)"
            >
              <ion-icon slot="icon-only" :icon="addCircleOutline" />
            </ion-button>
          </ion-item>
        </ion-list>
      </div>

      <!-- Message si aucun plat ne correspond à la recherche ou au filtre -->
      <div v-else class="ion-text-center ion-padding">
        <ion-text color="medium">
          <p>Aucun plat ne correspond.</p>
        </ion-text>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonRefresher,
  IonRefresherContent,
  IonBadge,
  toastController,
} from "@ionic/vue";
import api from "@/services/api";
import { formatAriary } from "@/utils/format";
import { addCircleOutline } from "ionicons/icons";
import { usePanier } from "@/composables/usePanier";

const plats = ref([]);
const categories = ref([]);
const chargement = ref(true);
const erreur = ref(null);

// États pour la recherche et le filtre par catégorie
const recherche = ref("");
const categorieChoisie = ref("toutes");

// 4.3 Propriété calculée pour filtrer les plats selon la recherche (insensible à la casse)
const platsFiltres = computed(() => {
  const terme = recherche.value.toLowerCase().trim();

  return plats.value.filter((plat) => {
    const correspondRecherche =
      !terme || plat.nom.toLowerCase().includes(terme);

    const correspondCategorie =
      categorieChoisie.value === "toutes" ||
      String(plat.categorie?.id) === String(categorieChoisie.value);

    return correspondRecherche && correspondCategorie;
  });
});

// Chargement des plats (en prenant en compte la catégorie sélectionnée)
async function charger() {
  chargement.value = true;
  erreur.value = null;
  try {
    // Si "toutes" est sélectionné, on passe undefined, sinon on passe l'ID de la catégorie
    const catId =
      categorieChoisie.value === "toutes" ? undefined : categorieChoisie.value;

    // Chargement simultané ou séquentiel des données de l'API
    plats.value = await api.getPlats(catId);
    categories.value = await api.getCategories();
  } catch (e) {
    erreur.value = "Impossible de joindre l'API. Est-elle lancée ?";
    console.error(e);
  } finally {
    chargement.value = false;
  }
}

// 4.4 Fonction pour récupérer les plats depuis l'API
async function getPlats(categorieId) {
  let url = "/plats";
  if (categorieId) {
    url += `?categorie=${categorieId}`;
  }
  const response = await fetch(url);
  return response.json();
}

// 4.5 Fonction pour tirer et rafraîchir
async function rafraichir(event) {
  await charger();
  event.target.complete(); // Arrête l'animation de rafraîchissement
}

const { ajouter } = usePanier();

async function ajouterAuPanier(plat) {
  ajouter(plat);

  const toast = await toastController.create({
    message: `${plat.nom} ajouté au panier`,
    duration: 1500,
    position: "top",
    color: "secondary",
  });

  await toast.present();
}

onMounted(charger);
</script>
