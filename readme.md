# Spécifications Techniques : Application de Suivi de Caféine

## 1. Contexte
Développer une **application web simple** (HTML/CSS/JavaScript) pour surveiller les consommations de caféine sur une journée.
L'objectif est d'aider l'utilisateur à estimer l'impact de sa consommation de caféine sur son sommeil, en fonction de l'heure et de la quantité ingérée.

---

## 2. Fonctionnalités Clés

### 2.1. Saisie des consommations
- Permettre à l'utilisateur d'ajouter une consommation de caféine :
  - **Quantité** (en mg, ex: 80 mg pour un café).
  - **Heure** de consommation (format HH:MM).
- Bouton "Ajouter" pour enregistrer la consommation.

### 2.2. Historique des consommations
- Afficher la liste des consommations de la journée sous forme de :
  - Heure + quantité (ex: "10:30 : 80 mg").
- **Total journalier** : Somme des quantités consommées.

### 2.3. Estimation de l'impact sur le sommeil
- Calculer la **caféine active** dans le sang en fonction :
  - De la demi-vie de la caféine (~5 heures).
  - De l'heure actuelle.
- Afficher un avertissement si la caféine active dépasse un seuil (ex: > 50 mg) :
  - Message du type : "⚠️ Attention : ~X mg de caféine active. Risque de perturbation du sommeil."

### 2.4. Stockage local
- Sauvegarder les données dans `localStorage` :
  - Clé : `cafeine_aujourdhui`.
  - Valeur : Tableau d'objets `{ quantite: Number, heure: String }`.
- **Réinitialisation automatique** à minuit pour une nouvelle journée.

### 2.5. Réinitialisation manuelle
- Bouton "Réinitialiser la journée" pour effacer l'historique.

---

## 3. Exemple de Données
```json
// Exemple de données stockées dans localStorage
[
  { "quantite": 80, "heure": "10:30" },
  { "quantite": 40, "heure": "14:00" },
  { "quantite": 60, "heure": "16:30" }
]
```

---

## 4. Formules et Logique Métier

### 4.1. Calcul de la caféine active
Pour chaque consommation :
- Temps écoulé depuis la consommation (en heures).
- Caféine restante = `quantité * (0.5^(temps_écoulé / 5))`.
- **Total caféine active** = Somme des caféines restantes pour toutes les consommations.

### 4.2. Seuil d'avertissement
- Si **caféine active > 50 mg** : Afficher un avertissement rouge.
- Sinon : Message "OK".

---

## 5. Interface Utilisateur (UI)
### 5.1. Maquette
```
+-------------------------------------+
|          Suivi Caféine              |
+-------------------------------------+
| Ajouter une consommation :         |
| [ Quantité (mg) : ___ ]             |
| [ Heure : ___ ]                     |
| [ Bouton : Ajouter ]                |
+-------------------------------------+
| Historique aujourd'hui :            |
| 10:30 : 80 mg                       |
| 14:00 : 40 mg                       |
| 16:30 : 60 mg                       |
+-------------------------------------+
| Total : 180 mg                      |
| ⚠️ Attention : ~120 mg de caféine   |
|     active. Risque de perturbation.  |
+-------------------------------------+
| [ Bouton : Réinitialiser la journée ]|
+-------------------------------------+
```

### 5.2. Styles CSS
- Police : `Arial, sans-serif`.
- Couleurs :
  - Fond : `#f9f9f9`.
  - Avertissement : `#d32f2f` (rouge).
  - Boutons : Style basique avec padding.
- Bordures arrondies et ombres légères pour les conteneurs.

---

## 6. Exemple de Code de Base
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Suivi Caféine</title>
  <style>
    /* Styles CSS ici (voir section 5.2) */
  </style>
</head>
<body>
  <div class="container">
    <h1>Suivi Caféine</h1>
    <!-- Formulaire d'ajout -->
    <!-- Historique -->
    <!-- Total et avertissement -->
    <!-- Bouton de réinitialisation -->
  </div>
  <script>
    // Logique JavaScript ici (voir sections 2 et 4)
  </script>
</body>
</html>
```

---

## 7. Hébergement
- **GitHub Pages** :
  - Créer un dépôt GitHub.
  - Ajouter le fichier `index.html`.
  - Activer GitHub Pages dans les paramètres du dépôt.

---

## 8. Améliorations Futures (Optionnel)
- Ajouter un **graphique** (Chart.js) pour visualiser l'évolution de la caféine active.
- Permettre de **sauvegarder l'historique sur plusieurs jours**.
- Ajouter des **seuils personnalisables** par l'utilisateur.

---

## 9. Livrables Attendus
1. Fichier `index.html` complet (HTML/CSS/JS).
2. Application fonctionnelle testée sur les navigateurs modernes (Chrome, Firefox).
3. Code commenté pour expliquer la logique métier.

---
