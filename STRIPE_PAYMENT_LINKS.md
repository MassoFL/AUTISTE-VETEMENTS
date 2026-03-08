# Configuration Stripe Payment Links

## Étape 1: Créer un produit dans Stripe

1. Va sur https://dashboard.stripe.com/products
2. Clique "Add product"
3. Remplis:
   - Name: Nom du produit (ex: "Hoodie Minimaliste")
   - Description: Description du produit
   - Price: Prix en EUR
   - Upload une image

## Étape 2: Créer un Payment Link

1. Une fois le produit créé, clique sur "Create payment link"
2. Configure:
   - Quantity: Fixed (1)
   - Collect shipping address: Yes
   - Allowed countries: France, Belgium, Switzerland, etc.
3. Clique "Create link"
4. Copie le lien (ex: `https://buy.stripe.com/test_xxxxx`)

## Étape 3: Ajouter le lien dans l'admin

1. Va sur `admin.html`
2. Crée ou modifie un post
3. Colle le Payment Link dans le champ "Lien de paiement Stripe"
4. Sauvegarde

## Comment ça marche

- Si l'utilisateur ajoute **1 seul article** au panier → Redirection directe vers Stripe
- Si l'utilisateur ajoute **plusieurs articles** → Message pour contacter le support

## Amélioration future

Pour gérer plusieurs articles, il faudra:
- Créer une Edge Function Supabase
- Ou utiliser Stripe Checkout Sessions avec un backend
