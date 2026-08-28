#!/usr/bin/env bash
set -e

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")
BACKUP_DIR="/tmp/server_backup_${TIMESTAMP}"
LOG_FILE="/var/log/server_backup.log"
WINDOWS_IP="50.184.90.91"
WINDOWS_USER="Administrator"
WINDOWS_PASS="Moses2754"
WINDOWS_SHARE="G$"
REMOTE_TARGET_DIR="Linux_Server_Backups"

echo "=========================================================" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Full Server Backup..." >> "$LOG_FILE"

mkdir -p "$BACKUP_DIR"

# 1. MongoDB - Full Cluster Dump (Compressed)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 1. Exporting all MongoDB databases..." >> "$LOG_FILE"
mongodump --gzip --archive="${BACKUP_DIR}/mongodb_all_databases.gz" >> "$LOG_FILE" 2>&1

# 2. Web & App Source Codes + Uploads (Excluding node_modules & build caches)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 2. Archiving /var/www apps (stayntour, drevo, cmercial, cms, webashore, zexton)..." >> "$LOG_FILE"
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='.cache' \
    --exclude='.git' \
    -czf "${BACKUP_DIR}/apps_source_code_and_uploads.tar.gz" \
    -C /var/www . >> "$LOG_FILE" 2>&1

# 3. Nginx Configurations & SSL Certificates
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 3. Archiving Nginx configs and SSL certificates..." >> "$LOG_FILE"
tar -czf "${BACKUP_DIR}/nginx_and_ssl_certs.tar.gz" \
    -C / etc/nginx etc/letsencrypt >> "$LOG_FILE" 2>&1

# 4. PM2 Process List & Crontabs
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 4. Archiving PM2 process configuration and Crontabs..." >> "$LOG_FILE"
sudo -u administrator pm2 save || true
cp -f /home/administrator/.pm2/dump.pm2 "${BACKUP_DIR}/pm2_dump.json" 2>/dev/null || true
crontab -l > "${BACKUP_DIR}/root_crontab.txt" 2>/dev/null || true
sudo -u administrator crontab -l > "${BACKUP_DIR}/administrator_crontab.txt" 2>/dev/null || true

# 5. Create Master Archive
MASTER_ARCHIVE="/tmp/full_server_backup_${TIMESTAMP}.tar.gz"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 5. Packaging into master backup archive: ${MASTER_ARCHIVE}..." >> "$LOG_FILE"
tar -czf "$MASTER_ARCHIVE" -C /tmp "server_backup_${TIMESTAMP}" >> "$LOG_FILE" 2>&1

# 6. Transfer Master Archive to Windows Server G: Drive via SMB
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 6. Transferring backup to Windows Server (${WINDOWS_IP}\\${WINDOWS_SHARE}\\${REMOTE_TARGET_DIR})..." >> "$LOG_FILE"
smbclient "//${WINDOWS_IP}/${WINDOWS_SHARE}" -U "${WINDOWS_USER}%${WINDOWS_PASS}" << SMB_EOF >> "$LOG_FILE" 2>&1
mkdir ${REMOTE_TARGET_DIR}
cd ${REMOTE_TARGET_DIR}
put ${MASTER_ARCHIVE} full_server_backup_${TIMESTAMP}.tar.gz
ls
SMB_EOF

# 7. Cleanup Local Temp Files
rm -rf "$BACKUP_DIR" "$MASTER_ARCHIVE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🎉 Full Server Backup completed and saved to Windows Server successfully!" >> "$LOG_FILE"
echo "=========================================================" >> "$LOG_FILE"
