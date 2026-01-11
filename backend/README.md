Check PORT
netstat -ano | findstr :"the port"

Kill PORT
taskkill /PID "LISTENING" /F

Add table
npx sequelize-cli migration:generate --name create_users_table