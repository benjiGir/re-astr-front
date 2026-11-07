# re-astr-front — Vue d'ensemble du code

> Document généré pour servir de base à une discussion de restructuration avec un agent IA.
> Reflète l'état du repo au 2026-07-24, branche `experimental/effect`.

## 1. Ce que fait l'app

Un backoffice de gestion d'archives de tests : les utilisateurs créent des **projets** et des
**catégories** (chaque catégorie porte un schéma de champs dynamique), puis uploadent des
**tests** (documents/résultats de tests) rattachés à un projet + une catégorie. L'app expose
un dashboard, un formulaire d'upload, une page de recherche/filtrage, une page de détail de
test, et une page de gestion projets/catégories (CRUD).

Le backend est un service séparé (repo `re-astr`, non présent ici) écrit avec **Effect**
(TypeScript). Les erreurs API sont discriminées par un champ `_tag` (`ProjectNotFound`,
`ValidationFailed`, `Forbidden`, ...) plutôt que par un format d'erreur générique — voir
[src/api/http.ts](../src/api/http.ts). Les types de `src/types/api.ts` sont **recopiés à la
main** depuis un doc de contrats externe (`../re-astr/docs/API_CONTRACTS.md`), il n'y a pas
de génération de types partagée entre front et back.

## 2. Stack technique

| Domaine | Choix | Remarque |
|---|---|---|
| Build | Vite 8 | |
| Langage | TypeScript 5.9, `strict` + `noUnusedLocals/Parameters` | |
| UI kit | Mantine v9 (`core`, `hooks`, `form`, `dropzone`) | `MantineProvider` sans thème custom (voir §4.4) |
| Routing | TanStack Router (file-based, code-splitting auto) | |
| Data fetching | TanStack Query v5 | |
| Formulaires | **`@mantine/form` ET `react-hook-form`** cohabitent | voir §4.5 |
| i18n | i18next + react-i18next | Une seule langue active : `fr` |
| Icônes | `@tabler/icons-react` | |
| Lint/format | `oxlint` + `oxfmt` | migré depuis Biome (commit `fff4e1f`) |
| Doc composants | Storybook 10 | ajouté très récemment, peu de stories |
| Tests | Aucun | pas de vitest/jest, aucun fichier `*.test.ts` |

## 3. Arborescence

```
src/
├── api/
│   ├── http.ts                 # fetch wrapper unique (credentials, parsing erreurs ApiError)
│   ├── services/                # 1 fichier par domaine : appels REST bruts (fetch → DTO)
│   │   ├── projects.service.ts
│   │   ├── categories.service.ts
│   │   ├── tests.service.ts
│   │   └── dashboard.service.ts
│   └── queries/                 # 1 fichier par domaine : queryOptions + resource hooks
│       ├── projects.queries.ts
│       ├── categories.queries.ts
│       ├── tests.queries.ts
│       └── dashboard.queries.ts
├── auth/                        # même pattern service+queries que api/, mais hors de api/
│   ├── auth.service.ts
│   └── auth.queries.ts
├── routes/                       # file-based routing TanStack Router
│   ├── __root.tsx                # PublicLayout (racine)
│   ├── index.tsx                  # redirige vers /dashboard ou /login
│   ├── login.tsx / signup.tsx
│   └── _authenticated.tsx         # layout pathless + guard (beforeLoad)
│       └── _authenticated/
│           ├── dashboard.tsx
│           ├── upload.tsx
│           ├── projects.tsx
│           ├── search.tsx
│           ├── archives.tsx        # stub, TODO
│           └── tests.$testId.tsx
├── layouts/
│   ├── PublicLayout.tsx
│   └── AuthenticatedLayout.tsx     # AppShell + nav (liens en dur, style dupliqué x4)
├── components/                    # groupés par feature/page
│   ├── Dashboard/
│   ├── ProjectsCategories/
│   ├── Search/
│   ├── TestDetail/
│   ├── Upload/
│   ├── RouterErrorBoundary.tsx     # à la racine de components/, pas dans un sous-dossier
│   └── RouterNotFound.tsx
├── hooks/
│   └── useProjectsPage.ts          # seul hook "page logic" extrait (voir §4.3)
├── types/
│   ├── api.ts                      # types API recopiés à la main
│   └── dashboard.ts                # semble mort (voir §5)
├── constants/test-metadata.ts
├── utils/testFormatting.ts, testStatus.ts
├── i18n/                           # config + locales/fr + types générés pour l'autocomplete
├── scss/styles.scss                # vide (0 ligne)
├── services/queryClient.ts         # singleton QueryClient
├── App.tsx                         # composant vide, non importé nulle part (mort)
└── main.tsx                        # bootstrap réel : providers + router
```

## 4. Patterns en place

### 4.1 Couche data : service → queries → resource hook
Pour chaque domaine (`projects`, `categories`, `tests`, `dashboard`), le pattern est cohérent :
- `*.service.ts` : fonctions async brutes (`getAllX`, `createX`, ...) qui appellent `apiFetch`.
- `*.queries.ts` : `queryOptions()` + `mutationOptions()` avec key factory (`xKeys.all/detail`),
  updates optimistes (`onMutate`/rollback `onError`/`invalidate onSettled`), et un hook combiné
  `useXResource()` qui expose `{ query, create, update, remove }`.

C'est le pattern le plus mature du repo (introduit par les commits `6975e03`,
`74b7761`). `dashboard` et `tests` s'en écartent légèrement : ils exposent des hooks
d'agrégation (`useDashboardData`, `useArchiveSearchData`) qui combinent plusieurs queries et
enrichissent les données (jointures manuelles projectId→name, categoryId→name) côté client.

### 4.2 Routing / auth guard
Toutes les routes protégées passent par `routes/_authenticated.tsx`
([_authenticated.tsx](../src/routes/_authenticated.tsx)) : `beforeLoad` appelle
`queryClient.ensureQueryData(userQueryOptions)` et redirige vers `/login` si pas de session.
Chaque route charge ses données via `loader` + `queryClient.ensureQueryData(...)`, pattern
répété identiquement dans dashboard/projects/search/tests.$testId.

### 4.3 Logique de page : 3 emplacements différents pour le même besoin
- `projects.tsx` → extrait tout dans [hooks/useProjectsPage.ts](../src/hooks/useProjectsPage.ts)
  (état, handlers CRUD, filtrage) — la page ne fait que du rendu.
- `dashboard.tsx` / `search.tsx` → logique dans `api/queries/*.queries.ts`
  (`useDashboardData`, `useArchiveSearchData`).
- `upload.tsx` → tout inline dans le composant route (state, effects, handlers, ~350 lignes),
  aucune extraction.

Trois conventions différentes pour "où vit la logique de page" — un point à trancher pour la
restructuration.

### 4.4 Styling
Pas de thème Mantine configuré (`<MantineProvider>` sans prop `theme` dans
[main.tsx](../src/main.tsx)). En conséquence, les couleurs de la charte (`#030213` = accent
foncé, `#717182` = texte secondaire, `#eceef2` = fond neutre, `rgba(0,0,0,0.1)` = bordure) sont
**répétées en dur** dans une dizaine de fichiers (layouts, routes, `TestDataSection`,
`FileUploadZone`, `RouterErrorBoundary`, `RouterNotFound`, `testStatus.ts`, ...). `scss/styles.scss`
est vide alors que `postcss-preset-mantine`/`postcss-simple-vars` sont installés — setup non
utilisé.

### 4.5 Deux librairies de formulaire
- `@mantine/form` : `login.tsx`, `upload.tsx`.
- `react-hook-form` : `EntityFormModal.tsx` (migré volontairement, commit `7210217`).

Migration en cours mais pas terminée sur tout le repo.

### 4.6 i18n partiellement adopté
`i18n/locales/fr/translation.json` contient déjà les clés pour la page upload
(`upload.filesSection.title`, `upload.basicInfoSection.*`, ...), mais
[upload.tsx](../src/routes/_authenticated/upload.tsx) affiche des chaînes françaises **en
dur** ("Fichiers de Tests", "Informations de Base", "Cliquez pour sélectionner...") au lieu
d'appeler `t(...)`. Le reste de l'app (dashboard, projects, search, testDetail) utilise `t()`
correctement.

## 5. Code mort / suspect à vérifier avec l'équipe

- [src/App.tsx](../src/App.tsx) : composant vide, jamais importé (le bootstrap réel est dans
  `main.tsx`).
- [src/types/dashboard.ts](../src/types/dashboard.ts) : définit `Archive`/`DashboardStats`,
  non utilisés — `dashboard.service.ts` a sa propre interface `DashboardStats` locale et le
  dashboard réel travaille sur `Test[]`.
- [src/routes/_authenticated/archives.tsx](../src/routes/_authenticated/archives.tsx) : page
  stub avec juste un TODO, chevauche potentiellement `search.tsx`.
- [src/routes/_authenticated/upload.tsx](../src/routes/_authenticated/upload.tsx) : `handleSubmit`
  ne fait que des `console.log`, la mutation de création de test (`CreateTestDto`) est
  commentée en TODO — aucune requête n'est réellement envoyée à la soumission du formulaire.
- `src/scss/styles.scss` vide + config PostCSS Mantine associée, à garder ou supprimer.
- `routeTree.gen.ts` est committé (pas dans `.gitignore`) — à confirmer si voulu.

## 6. Questions à poser lors de la restructuration

1. Où doit vivre la logique de page (hook dédié vs. query hook d'agrégation vs. inline) —
   choisir une convention unique ?
2. Faut-il introduire un vrai thème Mantine (`theme={{ colors, ... }}`) pour éliminer les
   couleurs en dur, ou gérer le style autrement (CSS modules, Tailwind, etc.) ?
3. Faut-il finir la migration vers `react-hook-form` partout, ou revenir à `@mantine/form`
   partout ?
4. `src/auth` doit-il rejoindre `src/api/{services,queries}` pour uniformiser la structure par
   domaine, ou rester séparé intentionnellement (auth ≠ ressource métier) ?
5. Les types API recopiés à la main (`types/api.ts`) — cible-t-on un partage de schéma avec le
   backend Effect (ex. `@effect/schema` partagé, OpenAPI codegen) pour éviter la dérive ?
6. Quelle stratégie de tests introduire (aucune actuellement) — unit (Vitest), composants
   (Testing Library + Storybook interactions), e2e ?
