# Guide de Test - Système de Notifications

## Tests à Effectuer

### 1. **Test de Base** ✅

1. **Démarrer l'application**
   ```bash
   npm run dev
   ```

2. **Se connecter** (page de login)
   - Utilisateur : admin@hopital.sn
   - Mot de passe : admin123

3. **Vérifier l'icône de notifications**
   - Badge avec nombre de notifications non lues
   - Clic sur l'icône ouvre le panneau

### 2. **Test du Panneau de Notifications** 🔔

1. **Ouverture du panneau**
   - Cliquer sur l'icône de notification dans la navbar
   - Le panneau s'ouvre sur la droite

2. **Navigation dans les onglets**
   - "Toutes" : Affiche toutes les notifications
   - "Non lues" : Seulement les non lues  
   - "Lues" : Seulement les notifications lues

3. **Filtres**
   - Filtrer par priorité (Toutes, Urgent, Élevée, Moyenne, Basse)
   - Filtrer par type (Admissions, Lits, Urgences, Système)

4. **Actions sur les notifications**
   - Clic sur notification avec URL → Ouvre l'URL
   - Bouton "Marquer comme lu" → Change le statut
   - Bouton "Supprimer" → Supprime la notification

### 3. **Test du Temps Réel** ⚡

1. **Connexion automatique**
   - Indicateur "Temps réel activé" visible
   - Badge vert dans l'en-tête du panneau

2. **Notifications simulées**
   - Attendre ~30 secondes
   - Nouvelles notifications apparaissent automatiquement
   - Badge se met à jour en temps réel

3. **Sons de notification**
   - Vérifier que le son est activé
   - Nouvelles notifications émettent un son
   - Bouton volume pour désactiver/activer

### 4. **Test des Toasts** 🍞

1. **Apparition automatique**
   - Nouvelles notifications déclenchent des toasts
   - Apparaissent en haut à droite
   - Couleur selon la priorité

2. **Interaction avec les toasts**
   - Clic sur toast avec URL → Ouvre l'action
   - Bouton fermer fonctionne
   - Auto-fermeture après 6 secondes (sauf urgent)

### 5. **Test des Paramètres** ⚙️

1. **Ouverture des paramètres**
   - Clic sur l'icône ⚙️ dans le panneau
   - Dialog de paramètres s'ouvre

2. **Paramètres généraux**
   - Toggle "Notifications push"
   - Toggle "Son des notifications"
   - Toggle "Notifications par email"

3. **Paramètres par type**
   - Activer/désactiver chaque type
   - Modifier la priorité de chaque type
   - Vérifier l'affichage des chips de priorité

4. **Sauvegarde**
   - Cliquer "Sauvegarder"
   - Vérifier que les changements sont pris en compte

### 6. **Test des Rôles** 👥

1. **Admin**
   - Voir toutes les notifications
   - Accès à tous les types

2. **Major Administratif**
   - Notifications d'admissions
   - Notifications de lits
   - Notifications urgentes

3. **Docteur**
   - Notifications de patients
   - Notifications de lits
   - Pas d'accès aux validations

### 7. **Test de l'Intégration** 🔗

1. **Depuis les Admissions**
   - Aller sur `/admin/major`
   - Valider/rejeter une demande
   - Vérifier qu'une notification est créée

2. **Navigation par notifications**
   - Clic sur notification → Redirige vers la bonne page
   - URL contient les bons paramètres (onglets, etc.)

### 8. **Tests de Performance** 🚀

1. **Chargement initial**
   - Le panneau se charge rapidement
   - Pas de blocage de l'interface

2. **Mise à jour temps réel**
   - Pas de lag lors des nouvelles notifications
   - Animations fluides

3. **Gestion mémoire**
   - Fermer/rouvrir le panneau plusieurs fois
   - Vérifier absence de fuites mémoire

### 9. **Tests d'Erreur** ❌

1. **Connexion perdue**
   - Simuler une déconnexion réseau
   - Vérifier les messages d'erreur
   - Reconnexion automatique

2. **Notifications malformées**
   - Le système gère les erreurs gracieusement
   - Affichage de messages d'erreur appropriés

### 10. **Tests Mobile** 📱

1. **Interface responsive**
   - Panneau s'adapte à la largeur d'écran
   - Toasts bien positionnés
   - Boutons accessibles

2. **Interactions tactiles**
   - Swipe pour fermer les toasts
   - Tap sur notifications fonctionne

## Checklist de Validation ✅

- [ ] Badge de notifications affiché
- [ ] Panneau s'ouvre/ferme correctement
- [ ] Onglets fonctionnent
- [ ] Filtres fonctionnent
- [ ] Actions sur notifications (lire, supprimer)
- [ ] Temps réel fonctionne
- [ ] Toasts apparaissent
- [ ] Sons de notification
- [ ] Paramètres s'ouvrent
- [ ] Sauvegarde des paramètres
- [ ] Navigation par URL
- [ ] Intégration avec admissions
- [ ] Responsive design
- [ ] Gestion d'erreurs

## Bugs Connus et Solutions 🐛

### Badge ne se met pas à jour
**Solution :** Vérifier que le store est connecté et que fetchStats() est appelé

### Sons ne fonctionnent pas
**Solution :** 
- Vérifier les permissions navigateur
- Ajouter les fichiers audio dans `/public/sounds/`
- Interaction utilisateur requise avant le premier son

### Notifications ne s'affichent pas
**Solution :**
- Vérifier les filtres de rôle
- Contrôler les préférences utilisateur
- Examiner la console pour erreurs

### Toasts multiples
**Solution :** Le système de queue gère automatiquement l'affichage séquentiel

## Notes de Développement 📝

### Ajout de nouveaux types
1. Modifier `types/notifications.ts`
2. Ajouter icône dans les mappings
3. Tester avec tous les rôles

### Modification des couleurs
- Priorités dans `getPriorityColor()`
- Types dans les composants individuels

### Debugging
- Console logs détaillés activés
- Store visible via React DevTools
- WebSocket simulé avec logs

### Performance
- Limite de 50 notifications par défaut
- Pagination côté client
- Nettoyage automatique des anciennes notifications
