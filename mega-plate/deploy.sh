echo "🚀 Deploy do CogniFlow..."

APP_DIR="/var/www/cogniflow"

cd $APP_DIR
git pull origin main
npm ci
npm run build

sudo chown -R www-data:www-data $APP_DIR/dist
sudo systemctl reload nginx

echo "✅ Deploy concluído!"