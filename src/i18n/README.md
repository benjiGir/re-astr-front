# Internationalisation (i18n)

## Setup

L'application utilise **react-i18next** pour la gestion des traductions.

### Structure des fichiers

```
src/i18n/
├── config.ts                    # Configuration i18next
├── types.ts                     # Types TypeScript pour l'autocomplétion
├── locales/
│   └── fr/
│       ├── translation.json     # Traductions principales
│       └── common.json          # Traductions communes (actions, erreurs, etc.)
```

## Utilisation

### Dans un composant

```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.recentArchives.description')}</p>
    </div>
  )
}
```

### Avec interpolation

```tsx
const { t } = useTranslation()

// Dans translation.json: "welcome": "Bienvenue {{name}}"
<p>{t('welcome', { name: 'John' })}</p>
```

### Avec namespace

```tsx
const { t } = useTranslation(['translation', 'common'])

<button>{t('common:actions.save')}</button>
```

### Avec pluralisation

```tsx
// Dans translation.json:
// "items": "{{count}} élément"
// "items_plural": "{{count}} éléments"

<p>{t('items', { count: 1 })}</p>  // "1 élément"
<p>{t('items', { count: 5 })}</p>  // "5 éléments"
```

## Bonnes pratiques

### 1. Organisation des clés

Utiliser une structure hiérarchique claire :

```json
{
  "page": {
    "section": {
      "field": "Valeur"
    }
  }
}
```

### 2. Namespaces

- **translation**: Traductions spécifiques à l'application (pages, features)
- **common**: Traductions réutilisables (boutons, messages d'erreur, validations)

### 3. Nommage des clés

- Utiliser **camelCase** pour les clés
- Nommer selon le **contexte et la fonction**, pas le contenu
- Exemple :
  - ❌ `"createButton": "Créer"`
  - ✅ `"actions.create": "Créer"`

### 4. TypeScript

Les types sont automatiquement générés depuis `translation.json` et `common.json`.
L'autocomplétion fonctionne dans VS Code pour toutes les clés de traduction.

### 5. Ajout de nouvelles traductions

1. Ajouter la clé dans `locales/fr/translation.json` ou `common.json`
2. TypeScript vérifiera automatiquement l'utilisation
3. L'autocomplétion suggérera les nouvelles clés

## Ajout d'une nouvelle langue

1. Créer `src/i18n/locales/en/` avec `translation.json` et `common.json`
2. Mettre à jour `src/i18n/config.ts` :

```typescript
import translationEN from './locales/en/translation.json'
import commonEN from './locales/en/common.json'

i18n.init({
  resources: {
    fr: { translation: translationFR, common: commonFR },
    en: { translation: translationEN, common: commonEN },
  },
  // ...
})
```

3. Ajouter un sélecteur de langue dans l'UI :

```tsx
const { i18n } = useTranslation()

<button onClick={() => i18n.changeLanguage('en')}>English</button>
<button onClick={() => i18n.changeLanguage('fr')}>Français</button>
```

## Debugging

Activer le mode debug dans `config.ts` :

```typescript
i18n.init({
  debug: true,  // Affiche les clés manquantes dans la console
  // ...
})
```