# Database Backup Automation

This directory contains scripts for automated database backup and restore.

## Prerequisites

- PostgreSQL client tools (`pg_dump`, `psql`) must be installed
- `gzip` for compression (usually pre-installed on Linux/Mac)
- Database credentials in `.env` file

## Backup Scripts

### Manual Backup

Create a one-time backup:

```bash
npm run db:backup
```

This creates a compressed backup file in `backups/` directory with timestamp.

### Backup with Rotation

Create backups with daily/weekly/monthly rotation:

```bash
npm run db:backup rotation
```

This creates:

- **Daily backups**: Kept for 7 days in `backups/daily/`
- **Weekly backups**: Every Sunday, kept for 4 weeks in `backups/weekly/`
- **Monthly backups**: Every 1st, kept for 12 months in `backups/monthly/`

### List Backups

View all available backup files:

```bash
npm run db:backup list
```

### Cleanup Old Backups

Remove backups older than specified days (default: 7):

```bash
npm run db:backup cleanup
npm run db:backup cleanup 30  # Keep last 30 days
```

## Restore Scripts

### List Available Backups

```bash
npm run db:restore list
```

### Restore from Backup

```bash
npm run db:restore backups/backup-2024-01-15T10-30-00.sql.gz
```

⚠️ **WARNING**: This will drop the existing database and restore from backup!

### Force Restore (Skip Confirmation)

```bash
npm run db:restore backups/backup-file.sql.gz --force
```

## Automated Backups with Cron

### Linux/Mac

Add to crontab (`crontab -e`):

```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/cms_BE && npm run db:backup rotation >> logs/backup.log 2>&1

# Weekly cleanup on Sunday at 3 AM
0 3 * * 0 cd /path/to/cms_BE && npm run db:backup cleanup 30 >> logs/backup.log 2>&1
```

### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 2:00 AM)
4. Action: Start a program
   - Program: `cmd.exe`
   - Arguments: `/c cd E:\JOB\cms\cms_BE && npm run db:backup rotation >> logs\backup.log 2>&1`

## Backup Storage Best Practices

### Local Storage

- Store backups in `backups/` directory
- Implement rotation to save disk space
- Monitor disk usage regularly

### Remote Storage

For production, also upload backups to remote storage:

```bash
# After backup, upload to S3/Storage
aws s3 cp backups/backup-latest.sql.gz s3://your-bucket/backups/

# Or to another server via SCP
scp backups/backup-latest.sql.gz user@remote-server:/backups/
```

### Verification

Periodically verify backups can be restored:

```bash
# Create test database
createdb cms_test

# Restore to test database
DATABASE_URL=postgresql://user:pass@localhost:5432/cms_test npm run db:restore backups/backup-file.sql.gz --force

# Verify data integrity
psql -d cms_test -c "SELECT COUNT(*) FROM users;"

# Drop test database
dropdb cms_test
```

## Backup File Naming

Format: `backup-YYYY-MM-DDTHH-mm-ss.sql.gz`

Example: `backup-2024-01-15T14-30-25.sql.gz`

## Environment Variables

Required in `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
BACKUP_DIR=./backups  # Optional, defaults to ./backups
```

## Troubleshooting

### Permission Denied

```bash
# Make scripts executable
chmod +x scripts/*.ts
```

### pg_dump not found

Install PostgreSQL client tools:

```bash
# Ubuntu/Debian
sudo apt install postgresql-client

# Mac
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### Out of Disk Space

```bash
# Check disk usage
du -sh backups/

# Cleanup old backups
npm run db:backup cleanup 7
```

### Connection Error

Verify database credentials:

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

## Security Notes

- Backup files contain sensitive data - protect them!
- Store backups in encrypted volumes
- Restrict file permissions: `chmod 600 backups/*.sql.gz`
- Use secure transfer methods (SCP, SFTP) for remote backups
- Implement backup encryption for sensitive data
- Regularly audit backup access logs

## Recovery Plan

1. **Minor Data Loss**: Restore from latest daily backup
2. **Major Corruption**: Restore from weekly backup
3. **Long-term Recovery**: Use monthly backup

Always test restore procedure before actual disaster recovery!
