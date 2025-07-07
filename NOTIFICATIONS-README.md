# Système de Notifications en Temps Réel

## Vue d'ensemble

Le système de notifications permet d'informer les utilisateurs en temps réel des événements importants dans l'application hospitalière. Il comprend plusieurs composants et fonctionnalités.

## Fonctionnalités

### 🔔 Types de Notifications

- **Demandes d'admission** : Nouvelles demandes à traiter
- **Admissions validées/rejetées** : Confirmations des décisions
- **Patients admis/sortis** : Mouvements des patients
- **Lits disponibles** : Changements de disponibilité
- **Demandes urgentes** : Situations critiques
- **Notifications système** : Maintenances, mises à jour
- **Rappels** : Échéances importantes

### 📱 Canaux de Notification

1. **Notifications Push** : Popup dans le navigateur
2. **Toasts** : Messages temporaires en overlay
3. **Badge** : Compteur sur l'icône de notifications
4. **Panneau** : Interface dédiée pour consulter l'historique
5. **Sons** : Alertes audio personnalisées
6. **Email** : (pour le futur) Notifications importantes

### ⚡ Temps Réel

- **WebSocket simulé** : Connexion temps réel
- **Auto-refresh** : Mise à jour automatique
- **Queue système** : Gestion des notifications multiples
- **Persistance** : Sauvegarde des notifications

## Architecture

### Composants Principaux

```
src/
├── types/notifications.ts          # Types TypeScript
├── services/notificationService.ts # API et WebSocket
├── store/notificationStore.ts      # État global Zustand
├── hooks/useNotificationToast.tsx  # Hook pour toasts
└── components/notifications/
    ├── NotificationPanel.tsx       # Interface principale
    ├── NotificationToast.tsx       # Messages temporaires
    ├── NotificationSettings.tsx    # Paramètres utilisateur
    └── GlobalNotificationHandler.tsx # Gestionnaire global
```

### Store (Zustand)

Le store centralise l'état des notifications :

```typescript
const { 
  notifications,        // Liste des notifications
  stats,               // Statistiques (total, non lues, etc.)
  loading,             // État de chargement
  connected,           // Statut WebSocket
  fetchNotifications,  // Charger les notifications
  markAsRead,          // Marquer comme lues
  connectRealTime      // Se connecter au temps réel
} = useNotificationStore();
```

### Service

Fonctions principales :

```typescript
// Récupération
getNotifications(filters?)
getNotificationStats()

// Actions
markNotificationsAsRead(ids)
markAllAsRead()
deleteNotification(id)
sendNotification(data)

// Temps réel
connectNotifications()
onNotification(callback)
```

## Utilisation

### 1. Interface Utilisateur

#### Navbar
- Badge avec compteur de notifications non lues
- Clic pour ouvrir le panneau

#### Panneau de Notifications
- **Onglets** : Toutes / Non lues / Lues
- **Filtres** : Par priorité et type
- **Actions** : Marquer comme lu, supprimer
- **Temps réel** : Indicateur de connexion
- **Paramètres** : Configuration personnalisée

### 2. Toasts Automatiques

Les toasts apparaissent automatiquement pour :
- Nouvelles notifications non système
- Selon les préférences utilisateur
- Avec action rapide si URL fournie
- Fermeture automatique (sauf urgentes)

### 3. Sons de Notification

Sons différenciés par priorité :
- **Urgent** : Son d'alerte forte
- **Élevée** : Son d'attention
- **Moyenne** : Son standard
- **Basse** : Son discret

### 4. Paramètres Utilisateur

Configuration personnalisable :
- **Activation/désactivation** par type
- **Niveaux de priorité** par type
- **Sons, push, email** globaux
- **Sauvegarde** automatique

## Intégration

### Ajouter des Notifications

Dans vos services, importez et utilisez :

```typescript
import { sendNotification } from '../services/notificationService';

// Exemple : Nouvelle admission
await sendNotification({
  type: 'admission_request',
  title: 'Nouvelle demande d\'admission',
  message: 'Demande urgente pour Marie Dubois',
  priority: 'high',
  targetRoles: ['MAJOR_ADMINISTRATIF'],
  actionUrl: '/admin/major?tab=admissions',
  metadata: {
    patientId: 'patient-001',
    admissionId: 'admission-001'
  }
});
```

### Écouter les Notifications

```typescript
import { useNotificationStore } from '../store/notificationStore';

const { connectRealTime, onNotification } = useNotificationStore();

useEffect(() => {
  connectRealTime();
  
  // Écouter les nouvelles notifications
  onNotification((notification) => {
    console.log('Nouvelle notification:', notification);
    // Traitement personnalisé
  });
}, []);
```

## Permissions

### Rôles et Visibilité

Les notifications peuvent cibler :
- **Rôles spécifiques** : ADMIN, MAJOR_ADMINISTRATIF, DOCTEUR
- **Utilisateurs spécifiques** : Par ID utilisateur
- **Tous** : Notifications générales

### Filtrage Automatique

Le système filtre automatiquement selon :
- Le rôle de l'utilisateur connecté
- Les préférences personnelles
- Les types activés/désactivés

## Données Simulées

### WebSocket Simulation

- Génère automatiquement des notifications
- Fréquence : ~15% de chance toutes les 30s
- Types aléatoires avec métadonnées

### Exemples de Notifications

```typescript
// Demande admission
{
  type: 'admission_request',
  title: 'Nouvelle demande d\'admission',
  message: 'Demande urgente pour Marie Dubois - Service Cardiologie',
  priority: 'high',
  userRoles: ['MAJOR_ADMINISTRATIF'],
  actionUrl: '/admin/major?tab=admissions'
}

// Lit disponible
{
  type: 'bed_available',
  title: 'Lit disponible',
  message: 'Le lit 205A est maintenant disponible',
  priority: 'medium',
  actionUrl: '/lits'
}
```

## Performance

### Optimisations

- **Pagination** : Limite par défaut de 50 notifications
- **Filtres côté client** : Performance optimisée
- **Debounce** : Évite les appels répétitifs
- **Cache** : Mise en cache intelligente

### Nettoyage

- **Auto-expiration** : Notifications avec date d'expiration
- **Limitation** : Suppression automatique des anciennes
- **Queue management** : Gestion des files d'attente

## Évolutions Futures

### Fonctionnalités Prévues

1. **Notifications Email** : Intégration SMTP
2. **Push natives** : Service Worker pour PWA
3. **Templates** : Modèles de notifications
4. **Analytics** : Statistiques d'engagement
5. **API REST** : Endpoints complets
6. **WebSocket réel** : Remplacement de la simulation

### Améliorations

- **Groupement** : Notifications similaires
- **Actions directes** : Boutons d'action dans les toasts
- **Priorisation intelligente** : IA pour ajuster les priorités
- **Intégration calendrier** : Synchronisation avec les plannings

## Développement

### Ajout de Nouveaux Types

1. Ajouter le type dans `types/notifications.ts`
2. Mettre à jour le service pour les icônes/couleurs
3. Ajouter les libellés dans les composants
4. Tester avec les différents rôles

### Debug

- Console logs détaillés
- Store DevTools (Zustand)
- React Query DevTools
- Network tab pour WebSocket

## Support

Pour toute question ou problème :
- Vérifier les permissions navigateur
- Contrôler les filtres utilisateur
- Examiner les logs console
- Tester avec différents rôles
