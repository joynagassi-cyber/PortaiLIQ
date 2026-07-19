#!/bin/bash

# Script de déploiement PortaiLIQ
# Ce script prépare et déploie l'application PortaiLIQ

set -e

echo "🚀 Début du déploiement PortaiLIQ..."

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Construction du projet
echo "🔨 Construction du projet..."
npm run build

# Tests
echo "🧪 Exécution des tests..."
npm test

# Déploiement Cloudflare
echo "☁️ Déploiement sur Cloudflare..."
npx wrangler deploy

# Déploiement Supabase
echo "🗄️ Application des migrations Supabase..."
npx supabase db push

echo "✅ Déploiement terminé avec succès !"
echo "🌐 Votre application est maintenant en ligne"
