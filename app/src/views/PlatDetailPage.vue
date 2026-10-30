<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/menu" text="Menu" />
        </ion-buttons>
        <ion-title>Détail du plat</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="chargement" class="ion-text-center ion-padding">
        <ion-spinner />
      </div>

      <div v-else-if="platInexistant" class="ion-text-center ion-padding">
        <ion-text color="medium">
          <p>Ce plat n'existe pas.</p>
        </ion-text>
      </div>

      <ion-card v-else-if="plat">
        <ion-card-header>
          <ion-card-subtitle>{{
            plat.categorie?.nom || "Catégorie"
          }}</ion-card-subtitle>
          <ion-card-title>{{ plat.nom }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <p>{{ plat.description }}</p>
          <p>
            <strong>{{ formatAriary(plat.prix) }}</strong>
          </p>
          <p>{{ plat.disponible ? "Disponible" : "Épuisé" }}</p>
        </ion-card-content>
      </ion-card>

      <ion-button
        v-if="plat"
        expand="block"
        :disabled="!plat.disponible"
        @click="ajouterEtRetour()"
      >
        <ion-icon slot="start" :icon="addCircleOutline" />
        Ajouter au panier
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonText,
  useIonRouter,
} from "@ionic/vue";
import api from "@/services/api";
import { formatAriary } from "@/utils/format";
import { addCircleOutline } from "ionicons/icons";
import { usePanier } from "@/composables/usePanier";

const route = useRoute();
const ionRouter = useIonRouter();
const { ajouter } = usePanier();
const plat = ref(null);
const chargement = ref(true);
const platInexistant = ref(false);

async function chargerPlat() {
  chargement.value = true;
  platInexistant.value = false;

  try {
    plat.value = await api.getPlat(route.params.id);
  } catch (e) {
    plat.value = null;
    if (e?.statut === 404) {
      platInexistant.value = true;
    } else {
      console.error(e);
    }
  } finally {
    chargement.value = false;
  }
}

function ajouterEtRetour() {
  if (!plat.value || !plat.value.disponible) return;
  ajouter(plat.value);
  ionRouter.back();
}

onMounted(chargerPlat);
</script>
