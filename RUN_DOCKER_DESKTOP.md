# VidOps — Docker Desktop ile çalıştırma (CMD kullanmadan)

Bu repo **docker-compose.yml** ile (Postgres x2 + Kafka + 4 Spring Boot servisi) tek seferde ayağa kalkacak şekilde hazırlanmıştır.

## 0) Ön koşullar

- Docker Desktop **çalışıyor** olmalı.
- Windows’ta proje klasörü paylaşıma açık olmalı.
  - Docker Desktop → **Settings** → **Resources** → **File sharing**
  - `D:\VidOps` (veya projen nerede ise) ekli değilse ekle.

## 1) `.env` dosyasını oluştur

Docker Compose, değişkenleri otomatik olarak **repo kök dizinindeki** `.env` dosyasından okur.

1. Repo kökünde (docker-compose.yml ile aynı klasörde) bulunan **.env.example** dosyasını kopyala.
2. Kopyanın adını **.env** yap.
3. İçindeki değerleri doldur (örnek):

```
AUTH_DB_PASSWORD=CHANGE_ME
USER_DB_PASSWORD=CHANGE_ME
JWT_SECRET_BASE64=CHANGE_ME
```

> Not: `.env` git’e commit edilmemeli (bu repo `.gitignore` içine ekliyor).

## 2) Docker Desktop’tan Compose’u başlat

Docker Desktop sürümüne göre menü isimleri küçük fark gösterebilir. Genel akış:

1. Docker Desktop → sol menüden **Containers** (veya **Containers / Apps**) ekranına gir.
2. Sağ üstten **Create** / **+** / **Add** benzeri butonu seç.
3. Açılan seçeneklerden **Run / Start a Compose file** veya **Create from compose** benzeri seçeneği seç.
4. `docker-compose.yml` dosyasını göster (repo kökü).
5. Projeyi başlat.

Başladıktan sonra “Containers/Apps” listesinde şu servisleri görmelisin:

- `postgres-auth` (5433→5432)
- `postgres-user` (5434→5432)
- `zookeeper`
- `kafka`
- `auth-service` (8081)
- `user-service` (8082)
- `webapp` (8090)
- `api-gateway` (8080)

## 3) Uygulamayı aç

- Gateway: `http://localhost:8080`
- Webapp (direkt): `http://localhost:8090`

## Sık görülen hatalar

### “The \"AUTH_DB_PASSWORD\" variable is not set …”

`.env` dosyası okunmuyor demektir.

- `.env` dosyası **docker-compose.yml ile aynı klasörde** olmalı.
- Dosya adı **tam olarak** `.env` olmalı (örn: `.env.txt` değil).

### IntelliJ’de “client version 1.24 is too old …”

Bu genelde IntelliJ’in Docker bağlantısında **API version override** veya eski eklenti/IDE sürümü yüzündendir.

- IntelliJ → **Settings** → **Build, Execution, Deployment** → **Docker**
  - Docker Desktop bağlantısını yeniden ekle.
  - “API version” gibi bir alan varsa **boş** bırak.
- Windows’ta Environment Variables içinde `DOCKER_API_VERSION` tanımlıysa kaldır.
