#!/usr/bin/env bash
set -e

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")
BACKUP_TMP="/tmp/fast_server_backup"
LOG_FILE="/var/log/server_backup.log"
WINDOWS_IP="50.184.90.91"
WINDOWS_USER="Administrator"
WINDOWS_PASS="Moses2754"
WINDOWS_SHARE="G$"
TARGET_ROOT="Linux_Server_Backups"

echo "=========================================================" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Optimized Full Server Backup to Windows ($WINDOWS_IP)..." >> "$LOG_FILE"

rm -rf "$BACKUP_TMP"
mkdir -p "$BACKUP_TMP"

# Function to upload file to specific folder on Windows
upload_to_windows() {
    local LOCAL_FILE="$1"
    local REMOTE_SUBDIR="$2"
    local REMOTE_FILENAME="$3"

    if [ -f "$LOCAL_FILE" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Uploading $REMOTE_FILENAME to $TARGET_ROOT\\$REMOTE_SUBDIR..." >> "$LOG_FILE"
        smbclient "//${WINDOWS_IP}/${WINDOWS_SHARE}" -U "${WINDOWS_USER}%${WINDOWS_PASS}" << EOF >> "$LOG_FILE" 2>&1
mkdir ${TARGET_ROOT}
cd ${TARGET_ROOT}
mkdir ${REMOTE_SUBDIR}
cd ${REMOTE_SUBDIR}
put ${LOCAL_FILE} ${REMOTE_FILENAME}
EOF
    fi
}

# 1. MongoDB - Full Cluster Dump (All DBs: StayNTour, Drevo, CMercial, CMS, WebAshore, etc.)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 1. Exporting all MongoDB databases..." >> "$LOG_FILE"
mongodump --gzip --archive="${BACKUP_TMP}/mongodb_all_databases_${TIMESTAMP}.gz" >> "$LOG_FILE" 2>&1
upload_to_windows "${BACKUP_TMP}/mongodb_all_databases_${TIMESTAMP}.gz" "databases" "mongodb_all_databases_${TIMESTAMP}.gz"
upload_to_windows "${BACKUP_TMP}/mongodb_all_databases_${TIMESTAMP}.gz" "databases" "mongodb_all_databases_latest.gz"

# 2. Nginx & SSL Certificates
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 2. Archiving Nginx configurations & SSL certificates..." >> "$LOG_FILE"
tar -czf "${BACKUP_TMP}/nginx_configs_${TIMESTAMP}.tar.gz" -C / etc/nginx >> "$LOG_FILE" 2>&1
upload_to_windows "${BACKUP_TMP}/nginx_configs_${TIMESTAMP}.tar.gz" "nginx_configs" "nginx_configs_${TIMESTAMP}.tar.gz"

tar -czf "${BACKUP_TMP}/ssl_certificates_${TIMESTAMP}.tar.gz" -C / etc/letsencrypt >> "$LOG_FILE" 2>&1
upload_to_windows "${BACKUP_TMP}/ssl_certificates_${TIMESTAMP}.tar.gz" "ssl_certificates" "ssl_certificates_${TIMESTAMP}.tar.gz"

# 3. PM2 Process List & Crontabs
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 3. Archiving PM2 process configurations and Crontabs..." >> "$LOG_FILE"
sudo -u administrator pm2 save 2>/dev/null || true
cp -f /home/administrator/.pm2/dump.pm2 "${BACKUP_TMP}/pm2_processes_${TIMESTAMP}.json" 2>/dev/null || true
upload_to_windows "${BACKUP_TMP}/pm2_processes_${TIMESTAMP}.json" "pm2_and_crons" "pm2_processes_${TIMESTAMP}.json"

crontab -l > "${BACKUP_TMP}/root_crontab_${TIMESTAMP}.txt" 2>/dev/null || true
upload_to_windows "${BACKUP_TMP}/root_crontab_${TIMESTAMP}.txt" "pm2_and_crons" "root_crontab_${TIMESTAMP}.txt"

# 4. Each Web Application Source Code & Uploads (Includes all images, gifs, videos, audio, uploads)
APPS=("stayntour" "drevo" "cmercial.com" "cms-platform" "oncorg" "webashore" "zexton")

for APP in "${APPS[@]}"; do
    if [ -d "/var/www/$APP" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 4. Archiving app (code + all uploads/images/media): $APP..." >> "$LOG_FILE"
        APP_ARCHIVE="${BACKUP_TMP}/${APP}_source_${TIMESTAMP}.tar.gz"
        tar --exclude='node_modules' \
            --exclude='.next' \
            --exclude='dist' \
            --exclude='build' \
            --exclude='.turbo' \
            --exclude='.cache' \
            --exclude='.git' \
            --exclude='apks' \
            --exclude='scratch' \
            --exclude='*.apk' \
            --exclude='*.iso' \
            -czf "$APP_ARCHIVE" \
            -C /var/www "$APP" >> "$LOG_FILE" 2>&1

        upload_to_windows "$APP_ARCHIVE" "apps" "${APP}_source_${TIMESTAMP}.tar.gz"
        upload_to_windows "$APP_ARCHIVE" "apps" "${APP}_source_latest.tar.gz"
        rm -f "$APP_ARCHIVE"
    fi
done

# 5. Cleanup temp files
rm -rf "$BACKUP_TMP"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🎉 Full Production Server Backup saved directly to Windows G:\\${TARGET_ROOT} successfully!" >> "$LOG_FILE"
echo "=========================================================" >> "$LOG_FILE"
