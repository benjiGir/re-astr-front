# LEARNINGS

Journal du chantier XState + Zod (`docs/PLAN.md`). Une entrée par fin de phase : pièges
rencontrés, écarts d'estimation, décisions revues.

## Phase 0 — Préalables (2026-07-24)

**D2 tranché : hors périmètre.** `src/api/http.ts` (`ApiError.tag`) type le discriminant comme
`_tag?: string` (voir `src/types/api.ts:210`), pas une union littérale. Aucun `switch` exhaustif
n'est possible sans durcir le contrat côté back. On garde la gestion d'erreur actuelle ; le
narrowing par `_tag` n'est pas un livrable de ce chantier.

**D1 : recommandation A+B actée**, mise en œuvre en Phase 1.

**`archives.tsx` : gardé tel quel** (décision produit, page prévue pour plus tard). Ce n'est pas
un stub mort — pas de suppression.

**Code mort supprimé :** `src/App.tsx`, `src/types/dashboard.ts`, `src/scss/styles.scss`
(aucune référence, aucun import ; `postcss.config.mjs` reste — il sert le pipeline CSS de
Mantine, sans rapport avec ce `.scss`).

**Vitest installé** (`vitest`, `@testing-library/react`, `@testing-library/dom`,
`@testing-library/jest-dom`, `jsdom`). Config dans `vite.config.ts` (`test.environment: jsdom`,
`globals: true`, setup dans `src/test/setup.ts`).

- Piège : `window.matchMedia` n'existe pas dans jsdom, requis par
  `MantineProvider`/`use-provider-color-scheme` dès le mount → polyfill minimal ajouté dans
  `src/test/setup.ts`.
- Le smoke test monte l'arbre réel de `main.tsx` (providers i18n/query/Mantine + `RouterProvider`)
  mais navigue vers `/login` via `createMemoryHistory`, pas `/`. La route `/` (`index.tsx`)
  déclenche `ensureQueryData(userQueryOptions)` dans `beforeLoad`, donc un vrai `fetch` réseau —
  inadapté à un test sans backend ni mocks. `/login` n'a pas de `beforeLoad` et sert d'ancrage
  stable (`src/test/app.smoke.test.tsx`).

**Sortie de phase non entièrement atteinte :** `pnpm test` passe, mais `oxlint`/`tsc -b` ne sont
**pas** clean — deux erreurs préexistantes, non introduites par ce chantier et vérifiées comme
telles via `git stash` :
- `src/routes/_authenticated/upload.tsx:62` — `loadingCategory` déclaré et jamais lu
  (`no-unused-vars` + `TS6133`). Fichier entièrement réécrit par la Phase 3
  (`uploadMachine`) — corriger maintenant serait du churn sur du code qui va disparaître.
- `src/routes/_authenticated/search.tsx:100` — `<Collapse in={...}>` ne type-check plus
  (`TS2322`), probable dérive de version Mantine. Hors périmètre de ce chantier (page `search`
  est classée ❌ dans la Phase 4/§4.3 du plan), à traiter séparément.

## Phase 1 — Socle Zod + validation formulaires (2026-07-24)

**`domain/dynamic-fields/types.ts` créé en Phase 1, pas en Phase 2.** `Category.baseSchema`
existe dès `category.schema.ts` (Phase 1) et référence `FieldDefinition` — le miroir récursif
(interfaces indépendantes + `z.lazy`, cf. commentaire dans le fichier) devait donc exister avant
Phase 2. Vérifié contre le contrat back réel
(`re-astr-back/src/domain/schema/CategoryFields.ts`, Effect Schema) : structure identique
(8 types, `validation` en sac plat, récursion mutuelle `FieldValidation.properties` ↔
`FieldDefinition.validation`). Phase 2 n'a donc plus qu'à écrire `build-schema.ts`/`defaults.ts`
par-dessus ce miroir, pas à le redéfinir.

**IDs confirmés UUID.** `re-astr-back` génère les PK via `gen_random_uuid()` (Postgres) sur
`projects`/`categories`/`tests`/`users` — `z.uuid()` est donc correct et non un pari, contrairement
à ce que suggérait juste la lecture du contrat front existant (`id: string`).

**`commonData`/`customData`/`metadata` restent `z.any()`, pas `z.unknown()`.** `z.unknown()` est
plus correct mais casse plusieurs call sites existants qui font
`test.metadata?.categoryName || test.categoryId` en comptant sur la propagation d'`any` — les
corriger est un durcissement de contrat hors périmètre Phase 1 (qui ne fait que porter
`types/api.ts` vers Zod, pas le durcir). Revoir en Phase 2/3 si ces champs sont un jour typés
plus précisément côté back.

**`@hookform/resolvers/zod` incompatible avec zod 4.4.x — bug trouvé en vérification navigateur,
pas en lecture de code.** `zodResolver()` échoue à la compilation TS
(`_zod.version.minor: 4` vs `0` attendu) : le sous-module `./zod` de `@hookform/resolvers@5.4.0`
a été construit contre le snapshot v4 embarqué dans `zod@^3.25.0` (marqueur interne figé à
`minor: 0`), pas contre un vrai zod4 publié (dont `version.minor` suit le vrai minor — 4.4.x →
`minor: 4`). Toute release zod4 postérieure à 4.0.x casse ce sous-module. **Fix : utiliser
`standardSchemaResolver` de `@hookform/resolvers/standard-schema`** (zod4 implémente Standard
Schema V1 nativement) — pas de pin de version, comportement runtime identique (vérifié en
navigateur : messages d'erreur Zod bien remontés dans `formState.errors`). Utilisé dans
`login.tsx`, `signup.tsx`, `EntityFormModal.tsx`. À revisiter si `@hookform/resolvers` publie un
fix pour zod4.4+.

**`required` HTML natif bloque silencieusement RHF — trouvé en testant le formulaire vide dans
le navigateur, invisible en lecture de code ou en `tsc`/tests.** Mantine forwarde son prop
`required` vers l'attribut natif `required` de l'`<input>`. Le navigateur bloque alors la
soumission du `<form>` *avant* que React ne voie l'event (validation HTML5 native), donc
`handleSubmit`/le resolver Zod ne s'exécutent jamais pour un champ requis vide — aucune erreur
Zod ne s'affiche, aucune erreur console, juste un submit qui ne fait rien. C'était déjà le cas
avec l'ancien `@mantine/form` (même attribut `required` forwardé), donc pas une régression de ce
chantier, mais un bug préexistant que Zod devait de toute façon corriger (R3 : Zod = seule
source de vérité pour la validation). **Fix : `noValidate` sur le `<form>`** dans `login.tsx`,
`signup.tsx`, `EntityFormModal.tsx` — le prop Mantine `required` ne sert plus qu'à l'astérisque
visuel dans le label, toute la validation passe par Zod.

**Piège de vérification : l'erreur async n'apparaît pas immédiatement après le clic.**
`standardSchemaResolver` est asynchrone (`schema['~standard'].validate` peut retourner une
Promise). Un screenshot pris trop tôt après le clic montre encore un formulaire sans erreurs
alors que la validation tourne toujours — attendre (ou repasser par le DOM après un délai) avant
de conclure à un bug. C'est ce qui a fait perdre du temps en debug ici avant de trouver le vrai
bug (`required` natif) : le premier symptôme observé (aucune erreur visible) avait deux causes
distinctes superposées.

**Vérifié en navigateur (réel, pas mocké) :** `login.tsx` avec formulaire vide → erreurs Zod
affichées (`Invalid email`, `Password must be at least 6 characters`) ; avec identifiants valides
→ requête POST `/auth/sign-in/email` envoyée, erreur API (`InvalidCredentials`, 401) affichée
correctement. `signup.tsx` avec formulaire vide → 4 erreurs Zod affichées correctement (name,
email, password ; confirmPassword n'affiche rien car `"" === ""` ne déclenche pas le `.refine`
de mismatch — comportement correct, pas un bug). `EntityFormModal.tsx` non testé en navigateur
(nécessite une session authentifiée réelle) mais utilise le même pattern déjà prouvé.

## Phase 2 — Schémas dynamiques de catégorie (2026-07-25)

**`z.email()`/`z.url()` ne partagent pas de supertype public avec `.min()`/`.max()`/`.regex()`.**
Trouvé en compilant, pas en écrivant le code : une fonction générique
`buildStringLikeSchema(field, base: z.ZodType<string>)` censée factoriser `text`/`email`/`url`
ne compile pas dès qu'on appelle `base.min(...)` — `z.ZodType<string>` (le type de retour commun
le plus large) n'expose pas ces méthodes, elles vivent sur les classes concrètes (`ZodString`,
`ZodEmail`, `ZodURL`) qui n'ont pas de supertype public commun autre que `ZodType`. Le seul
type qui les porte toutes (`_ZodString`) est préfixé `_` — explicitement interne, donc pas fiable
d'une version zod4 à l'autre. **Fix : `.check(z.minLength(n), z.maxLength(n), z.regex(re))`**,
l'API bas niveau de zod4, disponible sur n'importe quel `z.ZodType<string>` indépendamment de la
classe concrète. Généralise correctement à `text`/`email`/`url` sans dupliquer
`buildStringLikeSchema` trois fois.

**`buildDateSchema` doit valider le format même sans `min`/`max`.** Premier jet : le `refine` de
plage n'était ajouté que si `validation.min`/`max` étaient présents, donc un champ `date` sans
contrainte de plage acceptait n'importe quelle chaîne (`'not-a-date'` passait). Trouvé par le
test `date` du cas de base, pas par un piège du §2.3 — corrigé en validant toujours que
`new Date(value).getTime()` n'est pas `NaN`, la vérification de plage s'ajoutant par-dessus.

**Le guard "vide" (piège #1/#2/#3) est centralisé une seule fois**, dans `buildFieldSchema` via
`z.preprocess(emptyToUndefined, required ? presentSchema : presentSchema.optional())` — pas
dupliqué par type. `emptyToUndefined` s'applique à *tous* les types avant que `.optional()` ne
soit évalué (ordre correct du piège #2), et un champ requis rejette naturellement `undefined`
(erreur de type Zod), donc piège #1 et piège #3 sont résolus par le même mécanisme, sans code
spécifique à `number` ni `text`.

**Choix pour `mergeCategoryFields` (piège #9) : la base gagne sur collision.** Un champ custom
dont la clé collisionne avec un champ base est supprimé (pas l'inverse) — la structure de base
définit la catégorie, les champs custom sont supplémentaires. `allowedTypes` filtre avant la
dédup, `maxCustomFields` tronque après (ordre : filtre type → dédup collision → troncature taille).

**`docs/PLAN.md` §2.1 place `types.ts` en Phase 2, mais il a été livré en Phase 1** — `Category`
(Phase 1) référence déjà `FieldDefinition` dans `baseSchema`/`customFieldsSchema`, donc le miroir
récursif devait exister avant. Documenté comme écart dès la Phase 1 ; la Phase 2 n'a eu qu'à
écrire `build-schema.ts`/`defaults.ts` par-dessus.

**Taille du module : 389 lignes hors tests** (`types.ts` 85 + `build-schema.ts` 243 +
`defaults.ts` 47 + `warn.ts` 14), sous le seuil d'échec de ~400 du §7 du plan, mais proche. Si
Phase 3 ou une extension future doit y ajouter de la logique, envisager de sortir
`buildPrimitiveItemSchema`/`APPLICABLE_VALIDATION_KEYS` dans un fichier séparé plutôt que de
laisser `build-schema.ts` grossir.

## Phase 3 — `uploadMachine` (2026-07-25)

**`loadingCategorySchema` réchauffe le cache React Query plutôt que de dupliquer le fetch —
écart assumé par rapport au §3.2/3.3 du plan.** Le plan montre un acteur
`fromPromise(getCategoryFields)` séparé ET un `useQuery(categoryFieldsQueryOptions(...))` côté
React affichant les mêmes données — deux fetchs pour la même ressource si pris au pied de la
lettre. Implémenté à la place : l'acteur `warmCategoryCache` appelle
`queryClient.ensureQueryData(categoryOptions(id))` (le même singleton `queryClient` que
`main.tsx`) et ne retourne rien ; le composant lit ensuite la même donnée, déjà en cache, via son
propre `useQuery(categoryOptions(selectedCategoryId))`. Un seul fetch, R1 respecté (le contexte
de la machine ne contient que `selectedCategoryId: string`, jamais la `Category`). Documenté ici
plutôt que laissé implicite (critère d'échec §7).

**`pendingInput` remplace `dynamicValues` dans le contexte — même logique.** Le §3.2 liste
`dynamicValues: Record<string, unknown>` dans le contexte, mais R2 dit explicitement que RHF
possède les valeurs de champ. `pendingInput: CreateTestDto | null` est un instantané pris
uniquement à l'événement `SUBMIT` (nécessaire pour que `submitting`/`RETRY` rejouent la même
requête), pas un miroir continu de l'état du formulaire — donc pas de violation de R2. Un
`createdTestId: string | null` a aussi été ajouté (autorisé explicitement par R1 : "IDs
sélectionnés"), pour rediriger vers `/tests/$testId` après création plutôt que vers `/dashboard`
à l'aveugle.

**Deux formulaires RHF séparés, pas un seul.** Les champs statiques (nom, projet, catégorie,
version, etc.) et les champs dynamiques de catégorie (`commonData`) ont des cycles de vie
différents — le second doit se `reset()` à chaque changement de catégorie (piège Phase 2 n°5),
pas le premier. Un seul schéma Zod combiné aurait forcé à reconstruire tout le formulaire à
chaque changement de catégorie. `onSubmit` enchaîne
`metaForm.handleSubmit(async (meta) => { await dynamicForm.handleSubmit(...)() })` pour valider
les deux avant d'envoyer `SUBMIT` à la machine.

**Bug réel trouvé en testant dans le navigateur, pas en écrivant le code : les boutons
secondaires sans `type="button"` déclenchaient une soumission de formulaire.** Le bouton
"Ajouter" un tag, les puces de tags cliquables pour suppression, le bouton de suppression de
fichier, et les boutons Annuler/Réessayer de la zone d'erreur — tous rendus par défaut en
`type="submit"` par Mantine à l'intérieur d'un `<form>`. Sans effet visible tant que
`handleSubmit` ne faisait que des `console.log` (état d'avant Phase 3), mais devenu un vrai bug
maintenant qu'une soumission déclenche un appel réseau réel. Corrigé en ajoutant `type="button"`
partout sauf sur le bouton de soumission final. Même famille de bug que le `noValidate` manquant
trouvé en Phase 1 — les formulaires HTML ont des comportements implicites qui ne se révèlent
qu'à l'usage réel.

**`noValidate` de nouveau nécessaire**, pour la même raison qu'en Phase 1 (`login.tsx`,
`EntityFormModal.tsx`) : les props `required` de Mantine (`TextInput`, `Select`) forwardent
l'attribut HTML natif, qui bloquerait la soumission avant que RHF/Zod ne s'exécutent.

**Limite de vérification, pas bug applicatif : l'outil de navigateur automatisé n'a pas pu piloter
le `Select` de Mantine.** Après connexion réelle (compte seedé `alice@re-astr.com`, voir
`re-astr-back/src/Seed.ts`) et chargement confirmé des projets/catégories réels depuis l'API
(`GET /projects`, `GET /categories` → 200, données réelles inspectées), cliquer sur un champ
`Select` le met au focus (bordure visible) mais `aria-expanded` reste `"false"` — le clic
synthétique de l'outil ne déclenche pas l'ouverture du combobox de Mantine (essayé : clic par
coordonnées, clic par ref, double-clic, navigation clavier après focus, clic+lecture dans le même
batch). L'outil ne propose pas non plus de primitive pour peupler un `<input type="file">`, donc
le drop de fichier n'a pas pu être testé en direct non plus. Ce qui **a** été vérifié en direct :
page rendue correctement avec i18n, connexion réelle fonctionnelle, fetch réel des projets et
catégories, saisie de texte réactive (RHF fonctionne), aucun crash après le premier rendu. Le
premier rendu affichait une erreur transitoire `Invalid hook call` sur `useMachine` (StrictMode +
optimisation à froid des dépendances Vite après l'ajout de `xstate`/`@xstate/react` en cours de
session) qui s'auto-corrige au rendu suivant — sans conséquence, mais si elle réapparaît de façon
persistante après un `rm -rf node_modules/.vite` + redémarrage propre, creuser la piste d'une
double copie de React. La logique dépendant du `Select` (chargement de catégorie, construction du
schéma dynamique, soumission) est couverte par les 36 tests automatisés
(`uploadMachine.test.ts`, `uploadMachine.integration.test.ts` — ce dernier passe par le vrai
`testsService.createTest` et le vrai `apiFetch`, seul `fetch` étant mocké) mais pas par une
vérification visuelle bout-en-bout. À refaire manuellement si possible.

## Phase 4 — `projectsModalMachine` (2026-08-01)

**D3 tranché à oui.** L'utilisateur a relu `uploadMachine.ts` après la Phase 3 et l'a jugé
"très propre" avant de demander explicitement d'enchaîner sur la Phase 4 — exactement le
déclencheur que le plan attendait ("mesurer le coût réel sur l'upload" avant de décider).

**États imbriqués plutôt que 5 états plats + `returnTo` en contexte.** Le plan liste
`closed/creating/editing/confirmingDelete/submitting` comme "modes exclusifs", ce qui suggère
5 états frères — mais `submitting` n'est pas un mode autonome : c'est *creating* ou *editing* ou
*confirmingDelete* pendant qu'une mutation tourne, et l'échec doit revenir exactement à l'état
d'origine. Deux designs envisagés : (a) 5 états plats + un champ `returnTo` en contexte pour
savoir où revenir sur erreur, ou (b) `submitting` en sous-état imbriqué de `creating`/`editing`/
`confirmingDelete`. Choisi (b) : `snapshot.matches('creating')` est vrai que ce soit
`creating.idle` ou `creating.submitting`, donc "la modale est ouverte" ne demande aucune
disjonction manuelle, et revenir à l'état d'origine sur erreur est juste `target: 'idle'` (le
sibling direct), pas un `returnTo` à maintenir à la main. Piège de test découvert en écrivant
les tests, pas en concevant : `snapshot.value` sur un état composé est un **objet**
(`{ creating: 'submitting' }`), pas la chaîne `'creating'` — comparer avec `.toBe('creating')`
échoue toujours ; il faut `snapshot.matches('creating')` pour vérifier l'état parent, ou
`snapshot.value` en `toEqual({ creating: 'submitting' })` pour l'état exact.

**Les mutations restent dans React Query, la machine ne fait qu'écouter.** Contrairement à
`uploadMachine` (qui invoque directement `testsService.createTest`, parce qu'aucune mutation
`useMutation` n'existait déjà pour `tests`), `projects.queries.ts`/`categories.queries.ts`
avaient déjà des mutations avec updates optimistes (`onMutate`/`onError`/`onSettled`) — les
dupliquer dans des acteurs XState aurait perdu ces updates optimistes ou obligé à les
réimplémenter. La machine n'a donc **aucun acteur invoqué** : `useProjectsPage.ts` appelle
`resource.create/update/remove.mutate(...)` directement dans le même handler que le `send()` de
transition (`SUBMIT`/`CONFIRM_DELETE`), et les callbacks `onSuccess`/`onError` de la mutation
renvoient `MUTATION_SUCCESS`/`MUTATION_ERROR` à la machine. Ceci confirme et complète la
convention §5 : "`api/queries/` redevient purement descriptif" — la machine orchestre le flux,
React Query reste seul propriétaire de l'exécution + cache des mutations.

**R1 appliqué à la lettre : la machine ne connaît qu'un `targetEntityId`, jamais l'entité.** Le
titre de la modale, les valeurs pré-remplies du formulaire et le message de confirmation de
suppression nécessitent le nom/description de l'entité — recalculés dans le hook via
`(entityType === 'category' ? categories : projects).query.data.find(id === targetEntityId)`,
jamais stockés dans le contexte de la machine.

**API externe de `useProjectsPage()` préservée à l'identique** (même forme d'objet retourné),
sauf `openForm`/`editingEntity` — vérifié via `grep` qu'aucun consommateur en dehors du hook
lui-même ne les utilisait, donc pas réintroduits plutôt que reconstruits artificiellement pour
coller à l'ancienne forme.

**Vérifié en direct dans le navigateur (compte seedé réel) : cycle complet create → edit →
delete pour projets ET catégories**, aucune erreur console, updates optimistes visibles
immédiatement dans la liste. Contrairement à `upload.tsx` (Phase 3), cette page n'a pas de
`Select` Mantine dans le flux CRUD (juste des `TextInput`/`Textarea`), donc aucune limite d'outil
rencontrée ici — vérification bout-en-bout complète, pas seulement partielle.

## Bug post-Phase 3 — champs spécifiques de catégorie absents (2026-11-07)

**Signalé par l'utilisateur en usage réel** : sélectionner une catégorie dans `upload.tsx`
n'affichait pas ses champs spécifiques — exactement le genre de défaut que la vérification
navigateur de la Phase 3 n'avait pas pu couvrir (`Select` Mantine non pilotable par l'outil à
l'époque, cf. entrée Phase 3 ci-dessus).

**Cause racine confirmée en inspectant le snapshot XState en direct** (fiber React → hook state,
cf. technique dans la session) : `CATEGORY_SELECTED`/`PROJECT_SELECTED`/`FILES_SELECTED` étaient
dupliqués dans `collectingMetadata` et `fillingDynamicFields`, mais **absents de `idle`**. Choisir
une catégorie (ou un projet) avant de déposer un fichier — un ordre de remplissage parfaitement
normal, rien dans l'UI ne force "fichier d'abord" — envoyait `CATEGORY_SELECTED` pendant que la
machine était encore en `idle`, qui ignore silencieusement tout événement non géré. Aucune erreur,
aucun indice : `selectedCategoryId` restait `null` pour toujours, donc
`useQuery(categoryOptions(...))` restait désactivée et `categoryFields` restait `[]`.

**Fix : remonté les 3 événements sur un état parent partagé plutôt que corriger seulement
`idle`.** Patcher `idle` en recopiant le même bloc une 4ᵉ fois aurait corrigé ce bug précis sans
traiter sa cause — la duplication elle-même, qui garantit qu'un futur état oubliera à son tour. À
la place, `idle`/`validatingFiles`/`collectingMetadata`/`loadingCategorySchema`/
`fillingDynamicFields` sont maintenant des enfants d'un état composé `collecting`, et les 3
événements vivent une seule fois dans le `on` de ce parent (leur comportement était déjà identique
dans tous ces états). `submitting`/`submitFailed`/`success` restent en dehors de `collecting`,
donc ces événements ne peuvent pas interrompre une soumission en cours — un root-level `on` global
aurait eu cet effet de bord indésirable, d'où le choix du parent imbriqué plutôt que du machine-level
`on`. Bénéfice gratuit : re-sélectionner une catégorie PENDANT que la précédente charge encore
(`loadingCategorySchema`) annule proprement l'ancien chargement et relance avec la nouvelle — avant
ce correctif, cette interaction n'était gérée nulle part.

**Conséquence mécanique** : `snapshot.value`/`.matches()` doivent désormais qualifier le parent
pour ces 5 états (`{ collecting: 'fillingDynamicFields' }` plutôt que `'fillingDynamicFields'`) —
`submitting`/`submitFailed`/`success` restent de simples chaînes. Mis à jour dans `upload.tsx` et
les deux fichiers de tests. 2 tests de régression ajoutés (`PROJECT_SELECTED`/`CATEGORY_SELECTED`
depuis `idle`) pour verrouiller ce cas précis.

**Piège de vérification retrouvé** : en testant dans le navigateur juste après avoir édité
`uploadMachine.ts`, un onglet resté ouvert depuis avant l'édition a affiché une erreur HMR
(`State 'collectingMetadata' does not exist on 'upload'`) — `@xstate/react` tente de migrer le
snapshot persisté de l'ancien acteur vers la nouvelle forme de machine quand l'identité du config
change à chaud, et échoue puisque la forme a changé (plat → imbriqué). Confirmé bénin : un onglet
frais (ou un vrai rechargement en prod, sans HMR) ne présente aucune erreur. Même famille que le
faux-positif déjà noté en Phase 3 (double rendu StrictMode) — toujours vérifier avec un onglet
neuf avant de conclure à un bug suite à une édition de code pendant que le dev server tourne.
