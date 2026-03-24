# Development Setup - @ossinsight/background

This guide helps you set up a local development environment for testing the Background service.

## Option 1: Local MySQL + Redis (Recommended for Development)

### Prerequisites

```bash
# macOS
brew install mysql redis

# Start services
brew services start mysql
brew services start redis

# Linux (Ubuntu/Debian)
sudo apt-get install mysql-server redis-server
sudo systemctl start mysql redis
```

### Setup Database

```bash
# Create database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS ossinsight;"

# Run setup script
export BACKGROUND_DATABASE_URL="mysql://root@localhost:3306/ossinsight"
export BACKGROUND_REDIS_URL="redis://localhost:6379"

pnpm setup:db
```

### Verify

```bash
# Check MySQL
mysql -u root ossinsight -e "SHOW TABLES;"

# Check Redis
redis-cli ping
```

---

## Option 2: TiDB Cloud (Production-like)

### Get Credentials

1. Go to [TiDB Cloud Console](https://tidbcloud.com/)
2. Select your cluster
3. Connect → General → Copy connection string
4. Replace password in connection string

### Setup

```bash
# Set environment
export BACKGROUND_DATABASE_URL="mysql://user:password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/ossinsight?ssl={\"rejectUnauthorized\":true}"
export BACKGROUND_REDIS_URL="redis://localhost:6379"

# Run setup
pnpm setup:db
```

### Note on TiDB Cloud Permissions

- **Serverless tier**: Read-only by default for shared databases
- **Dedicated tier**: Full permissions
- For development, use a dedicated database or local MySQL

---

## Option 3: Docker (Isolated Environment)

### Start Services with Docker

```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: test123
      MYSQL_DATABASE: ossinsight
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  mysql-data:
  redis-data:
EOF

# Start services
docker-compose up -d

# Wait for MySQL to be ready
sleep 10

# Setup database
export BACKGROUND_DATABASE_URL="mysql://root:test123@localhost:3306/ossinsight"
export BACKGROUND_REDIS_URL="redis://localhost:6379"

pnpm setup:db
```

### Cleanup

```bash
docker-compose down -v
```

---

## Testing

### Start Scheduler

```bash
# Terminal 1
pnpm start
```

### Start Worker

```bash
# Terminal 2
pnpm worker
```

### Enqueue Test Task

```bash
# Terminal 3
node -e "
const { getBackgroundService } = require('./dist/index.js');
const service = getBackgroundService();
service.enqueue('github.sync.user', { 
  userId: 1, 
  username: 'test' 
}).then(id => console.log('Task created:', id));
"
```

### Check Logs

Both scheduler and worker will output logs:

```
[2026-03-24 06:25:00.123] INFO: Background service started
[2026-03-24 06:25:01.456] INFO: Processing task: github.sync.user
[2026-03-24 06:25:02.789] INFO: Task completed: github.sync.user
```

---

## Environment File

Create `.env` in the package root:

```bash
# .env
BACKGROUND_DATABASE_URL=mysql://root@localhost:3306/ossinsight
BACKGROUND_REDIS_URL=redis://localhost:6379
BACKGROUND_WORKER_CONCURRENCY=5
BACKGROUND_LOG_LEVEL=debug
```

Then just run:

```bash
pnpm start
```

---

## Common Issues

### MySQL Connection Refused

```bash
# Check if MySQL is running
brew services list

# Restart MySQL
brew services restart mysql
```

### Redis Connection Refused

```bash
# Check if Redis is running
brew services list

# Restart Redis
brew services restart redis
```

### TiDB Cloud SSL Error

Ensure your connection string includes SSL:

```bash
# Correct format
mysql://user:pass@host:4000/db?ssl={"rejectUnauthorized":true}
```

### Permission Denied on TiDB Cloud

You need write permissions to create tables. Options:

1. Use local MySQL for development
2. Create a dedicated database on TiDB Cloud
3. Request admin to create tables for you

---

## Performance Tips

### For Large Datasets

```bash
# Increase worker concurrency
BACKGROUND_WORKER_CONCURRENCY=20

# Use connection pooling (handled by mysql2)
# Add to connection string:
# ?connectionLimit=10&queueLimit=0
```

### For Testing

```bash
# Reduce timeouts for faster feedback
# Add to your test code:
service.scheduler.setDefaultTimeout(5000); // 5 seconds
```

---

## Next Steps

1. ✅ Setup database and Redis
2. ✅ Run `pnpm setup:db`
3. ✅ Start scheduler: `pnpm start`
4. ✅ Start worker: `pnpm worker`
5. ✅ Enqueue test tasks
6. 🚀 Start building your tasks!
