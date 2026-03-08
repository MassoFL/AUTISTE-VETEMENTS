# Configuration Stripe

## 1. Installer Supabase CLI

```bash
npm install -g supabase
```

## 2. Login Supabase

```bash
supabase login
```

## 3. Link ton projet

```bash
supabase link --project-ref thbudwhxccbkmlibvogm
```

## 4. Configurer la Secret Key

Dans ton dashboard Supabase:
1. Va dans Project Settings → Edge Functions
2. Ajoute une variable d'environnement:
   - Name: `STRIPE_SECRET_KEY`
   - Value: ta secret key Stripe (sk_live_...)

## 5. Déployer la fonction

```bash
supabase functions deploy create-checkout-session
```

## 6. Tester

L'intégration est prête! Quand un utilisateur clique sur "Passer la commande", il sera redirigé vers Stripe Checkout.

## URLs de redirection

- Success: `https://ton-domaine.com/success.html`
- Cancel: `https://ton-domaine.com/`

Ces URLs sont configurées automatiquement dans la fonction Edge.
