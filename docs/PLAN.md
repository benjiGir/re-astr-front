# PLAN — XState + Zod dans `re-astr-front`
> Cible : flux explicites et testables (XState), validation unifiée et typée (Zod),
> upload fonctionnel. **Effect abandonné côté front.**
> Base : `ARCHITECTURE.md` du 2026-07-24.
> Versions : `xstate` 5.x, `@xstate/react` 5.x, `zod` 4.x, `react-hook-form` 7.x,
> `@hookform/resolvers` (zodResolver).
---
## 1. Périmètre
### Dans le périmètre
- XState sur `upload` (flux multi-étapes) et, en option, sur les modales CRUD de `projects`.
- Zod comme source unique de vérité des formes de données : types (`z.infer`) + validation.
- Migration `@mantine/form` → `react-hook-form` sur les 2 fichiers restants (`upload`, `login`).
- Construction dynamique de schémas depuis la définition de champs des catégories.
- Introduction de Vitest.
### Hors périmètre (explicite)
| Hors scope | Conséquence assumée |
|---|---|
| `src/api/http.ts`, `api/services/*` | Le transport ne bouge pas. Pas de Ky, pas de refonte fetch. |
| `api/queries/*` | `queryOptions`, key factories, updates optimistes : inchangés. On ne touche qu'au **typage** du `TError`/`TData` si D2 le permet. |
| Effect (toutes formes) | Abandonné. Pas de `Schema`, pas de `HttpClient`. |
| Thème Mantine / couleurs en dur | Lot séparé. |
| Storybook | Lot séparé. |
**Ce que ce chantier ne livre PAS**, à acter avant de commencer : le narrowing exhaustif des
erreurs API par `_tag` dans les composants, sauf si D2 tourne favorablement. La gestion d'erreur
reste globalement celle d'aujourd'hui.
---
## 2. Décisions à trancher (bloquantes)
### D1 — Zod : types seuls, ou validation runtime ?
Trois niveaux, coût et bénéfice croissants :
| Niveau | Effet sur `api/` | Détecte la dérive ? | Reco |
|---|---|---|---|
| **A** — Zod pour les types uniquement (`z.infer`), aucun `parse` sur les réponses | Aucun | ❌ Non | insuffisant seul |
| **B** — `safeParse` **en DEV uniquement**, log console, donnée laissée passer | ~15 lignes, aucun changement de comportement | ✅ Oui, en dev | ✅ **recommandé** |
| **C** — `parse` en prod, throw sur écart | Change le comportement runtime | ✅ Oui | hors périmètre (touche l'API) |
**Recommandation : A + B.** Les schémas Zod remplacent `types/api.ts` comme source de types, et
une sonde DEV révèle les écarts sans rien casser.
```ts
// src/api/schemas/_dev.ts
export const devCheck = <T extends z.ZodType>(schema: T, data: unknown, label: string) => {
  if (import.meta.env.DEV) {
    const r = schema.safeParse(data)
    if (!r.success) console.warn(`[contract drift] ${label}`, z.treeifyError(r.error))
  }
  return data as z.infer<T>   // la donnée passe telle quelle, prod inchangée
}
```
### D2 — Que renvoie réellement `api/http.ts` aujourd'hui ?
**À vérifier en premier (5 min).** Le doc dit que les erreurs sont déjà discriminées par `_tag`.
- Si `http.ts` renvoie déjà une union discriminée typée → il suffit de renseigner le `TError` des
  `queryOptions` et le `switch` exhaustif marche **sans toucher à l'API**. Gain gratuit.
- S'il renvoie `ApiError` avec un `_tag: string` non contraint → hors périmètre, on garde la
  gestion d'erreur actuelle.
### D3 — XState sur `projects` : oui ou non ?
`upload` est acquis. Pour `EntityFormModal` + `useProjectsPage`, à trancher après la Phase 3,
une fois le coût réel de XState mesuré sur l'upload. Ne pas décider maintenant.
---
## 3. Frontières
```
Composants React — rendu uniquement
   │
   ├─ useMachine / useSelector  →  état de FLUX (étapes, brouillon, retry, progression)
   ├─ useQuery / useMutation    →  SERVER STATE (cache, invalidation)  [inchangé]
   └─ useForm + zodResolver     →  état de CHAMP (valeurs, erreurs, dirty)
```
**R1 — Une machine ne stocke jamais de données serveur dans son `context`.**
Elle détient : `File[]`, IDs sélectionnés, valeurs de champs dynamiques, étape, `retries`.
Jamais un `Project[]` ni un `Category`. Ces objets viennent de `useQuery`.
**R2 — RHF possède le champ, la machine possède le flux.** Pas de duplication : les valeurs de
formulaire vivent dans RHF, la machine reçoit un événement `SUBMIT` avec les valeurs validées.
**R3 — Un seul schéma Zod par forme de donnée**, servant à la fois `z.infer` (type) et le
`zodResolver` (validation formulaire). Pas de type TS écrit à la main à côté d'un schéma.
---
## 4. Phasage
### Phase 0 — Préalables — ~1 j
- [x] Trancher D1 et D2. → D2 : hors périmètre (`_tag` non contraint dans `types/api.ts`).
      D1 : A+B retenu, implémenté en Phase 1. Détails dans `LEARNINGS.md`.
- [x] Supprimer `src/App.tsx`, `src/types/dashboard.ts` (morts).
- [x] Trancher `archives.tsx` → gardé tel quel (décision produit).
- [x] Supprimer `scss/styles.scss` (config PostCSS conservée — sert Mantine, sans rapport).
- [x] Installer `vitest`, `@testing-library/react`, `jsdom`. Un test smoke qui monte l'app.
- [x] `LEARNINGS.md` créé.
**Sortie :** `pnpm test` passe. `oxlint`/`tsc -b` **pas** clean — 2 erreurs préexistantes
(non introduites par ce chantier, vérifiées via `git stash`) : `upload.tsx` (réécrit en
Phase 3) et `search.tsx` (dérive Mantine, hors périmètre). Voir `LEARNINGS.md`.
---
### Phase 1 — Socle Zod + validation formulaires — ~2 à 3 j — ✅ fait (2026-07-24)
**1.1 — Schémas**
```
src/api/schemas/
├── auth.schema.ts       # non prévu au cadrage initial, nécessaire (User/Session/DTOs)
├── error.schema.ts       # idem (ApiErrorBody/ValidationFailedError, utilisés par http.ts)
├── project.schema.ts
├── category.schema.ts
└── test.schema.ts
src/domain/dynamic-fields/
└── types.ts              # miroir FieldDefinition/FieldValidation, tiré en avant de la Phase 2
                           # (Category en dépend dès Phase 1) — voir LEARNINGS.md
```
Pas de `index.ts` barrel (règle globale de l'utilisateur : CLAUDE.md). Les imports pointent
directement vers le fichier `*.schema.ts` concerné.
`src/types/api.ts` est **supprimé**, tous les imports migrés (21 fichiers).
D1 = B : `devCheck` branché dans les `queryFn` de `api/queries/*.queries.ts` (une ligne par
query), pas dans les `services/*.service.ts`.
**1.2 — `login.tsx` : `@mantine/form` → RHF + zodResolver**
Fait. **`signup.tsx` migré aussi** (non listé dans le cadrage §1 — "2 fichiers restants" — mais
utilise `@mantine/form` avec le même pattern ; laissé de côté aurait cassé la cohérence "gabarit
de référence" de `login.tsx`). Voir `LEARNINGS.md` pour le détail des deux bugs trouvés en
vérification navigateur (`zodResolver` incompatible avec zod 4.4.x, `required` HTML natif qui
empêche RHF de tourner).
**1.3 — `EntityFormModal.tsx` : déjà en RHF, brancher le resolver Zod**
Fait, avec un schéma local (`z.object({ name, description })`) plutôt que
`ProjectSchema.pick({ name: true })` — le message d'erreur du champ `name` doit passer par
`t()`, donc le schéma est construit dans le composant (`useMemo`) et non importé statique.
**Sortie :** `types/api.ts` supprimé. `@mantine/form` **pas** désinstallé — `upload.tsx`
(Phase 3) en dépend encore ; c'était déjà l'état réel du code (`upload.tsx` utilise
`@mantine/form`, pas seulement `login`+`signup` comme annoncé au §1).
---
### Phase 2 — Schémas dynamiques de catégorie — ~3 à 4 j — ✅ fait (2026-07-25)
**C'est le morceau technique du chantier.** Les catégories portent un schéma de champs
dynamique ; il faut le traduire en schéma Zod au runtime, utilisable comme resolver RHF.
#### 2.0 — Le contrat réel (`FieldDefinition`, Effect Schema côté back)
Plus lourd que prévu au cadrage initial. Trois différences structurantes :
- **8 types** : `text`, `number`, `boolean`, `date`, `email`, `url`, `array`, `object`.
- **`validation` est un sac plat optionnel**, pas des props inline sur le champ :
  `{ min, max, minLength, maxLength, pattern, enum, minItems, maxItems, itemType, properties }`.
- **Le contrat est mutuellement récursif** : `FieldValidation.properties` est un
  `Record<string, FieldDefinition>`, et `FieldDefinition.validation` est un `FieldValidation`.
  Un champ `object` porte donc ses sous-champs dans sa `validation`.
Côté front, le miroir Zod devra reproduire la même contorsion que le back : déclarer les
**interfaces indépendamment** (`interface FieldDefinition { ... }`) puis annoter les schémas
(`const FieldDefinition: z.ZodType<FieldDefinition> = z.lazy(...)`), sinon la dérivation
circulaire des types ne compile pas. Le commentaire du back explique exactement pourquoi.
Deux formes de conteneur à gérer : `BaseSchema { fields }` et
`CustomFieldsSchema { allowCustomFields, maxCustomFields, allowedTypes, fields }` →
prévoir un `mergeCategoryFields(base, custom)`.
#### 2.1 — Modules à produire
```
src/domain/dynamic-fields/
├── types.ts           # miroir Zod du contrat (récursif)
├── build-schema.ts    # buildFieldSchema, buildCategorySchema, mergeCategoryFields
├── defaults.ts        # buildDefaultValues (pour useForm({ defaultValues }))
└── *.test.ts
```
Principe directeur : **on ne durcit pas le contrat, on l'interprète.** `validation` étant un sac
plat applicable à n'importe quel type, on maintient une table `type → validations applicables`,
on ignore le reste et on le signale via `console.warn` en DEV (cohérent avec D1/B).
#### 2.2 — Ambiguïtés du contrat → à remonter au back
Non résolubles côté front. Un choix par défaut est fait dans le code, mais la question reste
ouverte :
| # | Ambiguïté | Choix par défaut retenu |
|---|---|---|
| Q1 | `validation` n'est pas contraint par le type : `{ type: 'boolean', validation: { minLength: 5 } }` est valide structurellement | Ignorer les validations non applicables + warn DEV |
| Q2 | `itemType` est un `FieldType`, pas un `FieldDefinition` → un `array` d'`object` ne peut pas décrire la forme de ses items | `z.record(z.string(), z.unknown())`. **Vraie limite du contrat** |
| Q3 | `validation.min`/`max` sur un `date` sont des `Number` — timestamps ? jours ? | Supposé timestamp ms |
| Q4 | `properties` est un `Record<string, FieldDefinition>` et chaque `FieldDefinition` a aussi son propre `key` — lequel fait foi ? | La clé du `Record` + warn si divergence |
| Q5 | `defaultValue: Unknown` n'est jamais validé contre le type du champ | Valider avant usage, retomber sur une valeur vide sinon |
| Q6 | Champ ajouté à une catégorie existante : que deviennent les tests déjà uploadés ? | Question produit, pas technique |
> Note : la syntaxe du contrat (`Schema.Literals([...])`, `.check(Schema.isMinLength(1))`,
> `.annotate({})`) est celle d'**Effect v4**, qui est en beta. À confirmer avec l'équipe back —
> sans impact direct sur le front, mais c'est une information à avoir.
#### 2.3 — Pièges à traiter explicitement
Ils coûteront des heures sinon.
1. **`Number("") === 0`.** `z.coerce.number()` sur une chaîne vide donne **`0`**, pas `NaN`.
   Un champ numérique optionnel non rempli part donc silencieusement à zéro en base. C'est le
   piège le plus dangereux du lot : il ne casse rien, il corrompt.
2. **Ordre `preprocess` / `optional`.** `z.preprocess(fn, s).optional()` court-circuite sur
   `undefined` **avant** d'exécuter `fn` — la chaîne vide atteint donc le schéma interne.
   Il faut `z.preprocess(fn, s.optional())`. Inverser les deux annule le piège n°1.
3. **Chaîne vide sur un champ requis.** `z.string()` accepte `""` : un `text` requis non rempli
   passerait la validation. Le guard de vide doit s'appliquer aussi aux champs requis, pas
   seulement aux optionnels.
4. **Identité du schéma.** Reconstruit à chaque render → le resolver RHF change d'identité →
   revalidations en boucle. `useMemo(() => buildCategorySchema(fields), [categoryId])`.
5. **Changement de catégorie.** Les valeurs de l'ancienne catégorie restent dans RHF. Appeler
   `form.reset(buildDefaultValues(fields))`, pas seulement changer le resolver.
6. **`z.enum` exige un tuple non vide.** `validation.enum: []` fait planter la construction.
7. **Récursion non bornée.** `properties` imbriqué sans limite → prévoir un `MAX_DEPTH` (5) qui
   retombe sur `z.unknown()`, sinon stack overflow sur une donnée malformée.
8. **`pattern` est une regex fournie par le serveur.** `new RegExp()` peut throw sur une regex
   invalide → try/catch obligatoire. Surface ReDoS théorique, acceptable ici (back interne),
   à revoir si les catégories deviennent éditables par des tiers.
9. **Collision de clés** entre `BaseSchema.fields` et `CustomFieldsSchema.fields`, et clés
   dupliquées dans une même liste.
#### 2.4 — Tests
Module de pur TypeScript, testable sans React ni réseau — **meilleur ratio effort/couverture du
chantier**. Couverture minimale : un cas par type, requis/optionnel, chaîne vide sur `number`
(piège n°1), enum vide, regex invalide, `object` imbriqué, dépassement de `MAX_DEPTH`, clés
dupliquées, `defaultValue` incompatible, `mergeCategoryFields` (collision + `allowedTypes`).
**Sortie :** `src/domain/dynamic-fields/{build-schema,defaults}.ts` + tests (24 tests, tous
passent). `types.ts` était déjà livré en Phase 1 (dépendance de `Category`). 389 lignes hors
tests (243+47+85+14), sous le seuil d'échec de ~400. `tsc`/`oxlint` : aucune régression, les 2
erreurs préexistantes (Phase 3, `search.tsx`) sont les seules restantes. Toutes les ambiguïtés
Q1–Q6 et pièges #1–#9 du §2.2/§2.3 sont couverts par du code + un test ; détail des choix et de
la découverte `.check()` (piège de typage zod4 non documenté au cadrage) dans `LEARNINGS.md`.
---
### Phase 3 — `uploadMachine` — ~3 à 4 j — ✅ fait (2026-07-25)
**Pourquoi ici :** seul flux réellement multi-étapes, ~350 lignes inline, et surtout
`handleSubmit` ne fait aujourd'hui que des `console.log`. On ne migre pas du code qui marche,
on construit la feature manquante. Coût d'opportunité nul.
**3.1 — États**
```
idle
 └─ FILES_SELECTED → validatingFiles
validatingFiles                       # taille, type MIME, nombre
 ├─ ok    → collectingMetadata
 └─ error → idle (issues)
collectingMetadata                    # projet + catégorie
 └─ CATEGORY_SELECTED → loadingCategorySchema
loadingCategorySchema                 # invoke fromPromise(getCategoryFields)
 ├─ done  → fillingDynamicFields      # buildCategorySchema(fields) → resolver RHF
 └─ error → collectingMetadata
fillingDynamicFields
 └─ SUBMIT [guard: formIsValid] → submitting
submitting                            # invoke fromPromise(createTest)
 ├─ done  → success (final)
 └─ error → submitFailed
submitFailed
 ├─ RETRY [guard: retries < 3] → submitting
 └─ CANCEL → fillingDynamicFields
```
**3.2 — Context (application stricte de R1)**
```ts
type UploadContext = {
  files: File[]
  selectedProjectId: string | null      // un ID, pas l'objet Project
  selectedCategoryId: string | null
  dynamicValues: Record<string, unknown>
  issues: ReadonlyArray<{ path: string; message: string }>
  retries: number
}
```
Les `Project[]` et la définition de champs de la catégorie viennent de `useQuery`, **pas** du
context.
**3.3 — Acteurs**
```ts
const uploadMachine = setup({
  types: {} as { context: UploadContext; events: UploadEvent },
  actors: {
    createTest: fromPromise<Test, CreateTestInput>(
      ({ input, signal }) => testsService.create(input, signal),
    ),
  },
  guards: {
    canRetry: ({ context }) => context.retries < 3,
  },
}).createMachine({ /* ... */ })
```
Les services existants de `api/services/*` sont appelés tels quels — c'est ce qui permet de ne
pas toucher à la couche API.
**3.4 — Intégration React**
```tsx
const [snapshot, send] = useMachine(uploadMachine)
const { data: projects } = useQuery(projectsQueryOptions())
const { data: fields } = useQuery(categoryFieldsQueryOptions(snapshot.context.selectedCategoryId))
const schema = useMemo(() => buildCategorySchema(fields ?? []), [fields])
const form = useForm({ resolver: zodResolver(schema) })
useEffect(() => { form.reset() }, [snapshot.context.selectedCategoryId])   // piège n°3
const queryClient = useQueryClient()
useEffect(() => {
  if (snapshot.matches("success")) {
    queryClient.invalidateQueries({ queryKey: testKeys.all })
  }
}, [snapshot, queryClient])
```
**3.5 — Au passage** : remplacer les chaînes françaises en dur par `t(...)`. Les clés existent
déjà dans `locales/fr/translation.json` (`upload.filesSection.title`, etc.).
**3.6 — Tests**
- Transitions et guards, sans React ni réseau : `idle --FILES_SELECTED--> validatingFiles`,
  `submitFailed --RETRY--> submitting`, blocage au 3ᵉ retry.
- Acteurs mockés : `uploadMachine.provide({ actors: { createTest: mockActor } })`.
- **Test d'intégration : un `Test` est réellement créé.** C'est le critère de sortie du chantier.

**Sortie :** `src/machines/uploadMachine.ts` (192 lignes), `uploadMachine.test.ts` (11 tests,
acteurs mockés), `uploadMachine.integration.test.ts` (1 test, machine réelle + `testsService`
réel + `apiFetch` réel, seul `fetch` mocké — critère de sortie satisfait : un `Test` est
réellement créé via une requête `POST /tests` vérifiée). `upload.tsx` entièrement réécrit
(RHF × 2 — métadonnées statiques + champs dynamiques — noValidate, i18n complet, `createTest`
réellement appelé). `tests.service.ts` a gagné `createTest`. 36 tests au total, `tsc`/`oxlint`
sans régression (l'ancien `loadingCategory` inutilisé de Phase 0 est maintenant réellement
utilisé). Écarts par rapport au tracé initial et limites de vérification documentés dans
`LEARNINGS.md` — notamment : `dynamicValues`/`invoke fromPromise(getCategoryFields)` du §3.2/3.3
remplacés par `pendingInput`/`warmCategoryCache` (réchauffe le cache React Query au lieu de
dupliquer le fetch, cf. R1), et l'interaction Select de Mantine n'a pas pu être pilotée par
l'outil de navigateur automatisé (limite d'outil, pas bug applicatif constaté).
---
### Phase 4 — Extension (conditionnelle à D3) — ~2 j — ✅ fait (2026-08-01)
D3 tranché à **oui** après revue par l'utilisateur de `uploadMachine.ts` ("très propre").
| Cible | Verdict |
|---|---|
| `EntityFormModal` + `useProjectsPage` | ✅ Candidat — `closed/creating/editing/confirmingDelete/submitting` sont des modes exclusifs, représentés aujourd'hui par des booléens indépendants → états impossibles représentables |
| `dashboard`, `tests.$testId` | ❌ Lecture seule |
| `search` | ❌ Les filtres sont de l'état d'URL → `search params` de TanStack Router |
| auth / session | ❌ `beforeLoad` + `ensureQueryData` fait déjà le travail |

**Réalisé :** `src/machines/projectsModalMachine.ts` (états imbriqués `creating.{idle,submitting}`,
`editing.{idle,submitting}`, `confirmingDelete.{idle,submitting}`, plus `closed` — le sous-état
`submitting` garde le parent "ouvert" pendant la mutation sans booléen `isSubmitting` séparé).
`useProjectsPage.ts` réécrit pour piloter la machine ; **API externe du hook inchangée** (mêmes
props consommées par `projects.tsx`, sauf `openForm`/`editingEntity` — jamais utilisés hors du
hook, supprimés). Les mutations restent dans `useProjectsResource`/`useCategoriesResource`
(`api/queries/*`, updates optimistes préservés) — la machine ne les réimplémente pas, elle les
déclenche et écoute `MUTATION_SUCCESS`/`MUTATION_ERROR`. 13 nouveaux tests de machine. Vérifié
en direct dans le navigateur (compte seedé réel) : cycle complet create → edit → delete pour
projets ET catégories, aucune erreur console — cette page n'a pas de `Select` Mantine dans le
flux CRUD, donc pas de limite d'outil rencontrée ici (contrairement à Phase 3).
---
## 5. Convention issue de ce chantier (clôt la question §4.3 du doc)
| La page a-t-elle des étapes / modes exclusifs ? | Où vit la logique |
|---|---|
| Non — `dashboard`, `search`, `tests.$testId` | Hook colocalisé à la route + `queryOptions`. `useDashboardData` / `useArchiveSearchData` quittent `api/queries/`. |
| Oui — `upload`, (`projects`) | Machine XState |
`api/queries/` redevient purement descriptif : key factory, `queryOptions`, mutations. Plus
d'agrégation ni de jointure client.
---
## 6. Charge
| Phase | Charge |
|---|---|
| 0 — Préalables | 1 j |
| 1 — Socle Zod + formulaires | 2–3 j |
| 2 — Schémas dynamiques | 3–4 j *(révisé après lecture du contrat réel : récursion + 8 types + merge base/custom)* |
| 3 — `uploadMachine` | 3–4 j |
| 4 — Extension (conditionnelle) | 2 j |
| **Total** | **9–14 j** |
---
## 7. Critères d'échec
| Signal | Action |
|---|---|
| Server state trouvé dans un `context` de machine | Violation R1 — corriger immédiatement, c'est le mode d'échec classique |
| Une machine dépasse ~120 lignes | La découper en acteurs, ou constater que ce n'est pas un cas machine |
| RHF et la machine détiennent les mêmes valeurs | Violation R2 — la machine ne garde que l'étape |
| Une ambiguïté Q1–Q6 doit être tranchée dans le code sans réponse du back | Documenter le choix par défaut dans `LEARNINGS.md`, ne pas le laisser implicite |
| Le module `dynamic-fields` dépasse ~400 lignes hors tests | Le contrat est trop permissif pour être interprété côté front → demander un durcissement (union discriminée par type plutôt que sac plat) |
| Phase 3 > 6 j | Arrêter l'extension Phase 4, consolider |
---
## 8. Journal
Alimenter `LEARNINGS.md` à chaque fin de phase : pièges d'API rencontrés, écarts d'estimation,
décisions revues. Livrable qui servira à décider si le pattern XState est généralisable aux
autres projets KOMITY.
