<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Panier</ion-title>

        <ion-buttons slot="end" v-if="lignes.length > 0">
          <ion-button @click="vider()">Vider</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="lignes.length === 0" class="ion-text-center ion-padding-top">
        <ion-text color="medium">
          <p>Votre panier est vide.</p>
        </ion-text>

        <ion-button router-link="/tabs/menu" expand="block">
          Voir le menu
        </ion-button>
      </div>

      <div v-else>
        <ion-list>
          <ion-item v-for="ligne in lignes" :key="ligne.plat.id">
            <ion-label>
              <h2>{{ ligne.plat.nom }}</h2>
              <p>{{ formatAriary(ligne.plat.prix) }} × {{ ligne.quantite }}</p>
            </ion-label>

            <div
              slot="end"
              class="ion-align-items-center"
              style="display: flex; gap: 8px"
            >
              <ion-button
                fill="clear"
                @click="changerQuantite(ligne.plat.id, -1)"
              >
                <ion-icon :icon="removeCircleOutline" slot="icon-only" />
              </ion-button>

              <ion-text>{{ ligne.quantite }}</ion-text>

              <ion-button
                fill="clear"
                @click="changerQuantite(ligne.plat.id, 1)"
              >
                <ion-icon :icon="addCircleOutline" slot="icon-only" />
              </ion-button>
            </div>
          </ion-item>
        </ion-list>

        <ion-input
          v-model="table"
          type="number"
          label="Numéro de table"
          label-placement="floating"
          fill="outline"
          class="ion-margin-top"
          :class="{ 'ion-invalid ion-touched': erreurTable }"
          :error-text="erreurTable"
        />

        <ion-button
          expand="block"
          class="ion-margin-top"
          @click="confirmer"
        >
          Envoyer la commande
        </ion-button>

        <ion-item lines="none">
          <ion-label>
            <h2>Total</h2>
          </ion-label>
          <ion-note slot="end"
            ><strong>{{ formatAriary(total) }}</strong></ion-note
          >
        </ion-item>
      </div>
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
  IonNote,
  IonText,
  IonButton,
  IonButtons,
  IonIcon,
  IonInput,
  alertController,
  toastController,
  loadingController,
  useIonRouter,
} from "@ionic/vue";
import { addCircleOutline, removeCircleOutline } from "ionicons/icons";
import { usePanier } from "@/composables/usePanier";
import { formatAriary } from "@/utils/format";
import api from "@/services/api";

const { lignes, changerQuantite, vider, total } = usePanier();
const ionRouter = useIonRouter();

const table = ref("");
const erreurTable = ref("");

async function confirmer() {
  erreurTable.value = "";
  if (!table.value || Number(table.value) <= 0) {
    erreurTable.value = "Veuillez indiquer un numéro de table valide.";
    return;
  }

  const alerte = await alertController.create({
    header: "Confirmer la commande",
    message: `Table ${table.value} : ${formatAriary(total.value)}`,
    buttons: [
      { text: "Annuler", role: "cancel" },
      { text: "Envoyer", role: "confirm" },
    ],
  });

  await alerte.present();
  const { role } = await alerte.onDidDismiss();

  if (role === "confirm") {
    await envoyer();
  }
}

async function envoyer() {
  erreurTable.value = "";

  // 1. Afficher un indicateur de chargement
  const chargement = await loadingController.create({
    message: "Envoi de la commande en cours...",
  });
  await chargement.present();

  try {
    // 2. Construire le corps attendu par l'API à partir de lignes (map)
    const commande = {
      table: Number(table.value),
      lignes: lignes.value.map((l) => ({
        plat_id: l.plat.id, // ✅ nom attendu par l'API (et non platId)
        quantite: l.quantite,
      })),
    };

    // 3. Appeler api.creerCommande(...)
    const reponse = await api.creerCommande(commande);

    // 4. Succès : vider le panier et le champ, toast vert, aller sur Commandes
    vider();
    table.value = "";

    const toast = await toastController.create({
      message: `Commande n°${reponse.id} envoyée`,
      duration: 2000,
      position: "top",
      color: "success",
    });
    await toast.present();

    ionRouter.navigate("/tabs/commandes", "forward", "replace");
  } catch (e) {
    // 5. Erreur 422 sur la table : message sous le champ
    if (e.statut === 422 && e.details && e.details.table) {
      erreurTable.value = e.details.table;
    } else {
      // 6. Toute autre erreur : toast rouge avec e.message
      const toast = await toastController.create({
        message: e.message || "Une erreur est survenue.",
        duration: 2500,
        position: "top",
        color: "danger",
      });
      await toast.present();
    }
  } finally {
    // 7. Dans tous les cas : fermer l'indicateur de chargement
    await chargement.dismiss();
  }
}
</script>