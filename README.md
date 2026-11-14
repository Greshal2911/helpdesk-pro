git clone --branch vedant --single-branch https://github.com/Greshal2911/helpdesk-pro.git

cd helpdesk-pro
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev

.env 
DATABASE_URL="file:./dev.db"
AUTH_SECRET="local-development-secret"
