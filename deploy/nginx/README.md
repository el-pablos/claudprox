# Nginx Server Blocks — TamsHub ClaudProx

Empat server block untuk empat domain produksi.

## Berkas

- `claudprox.tams.codes.conf` → port 4016 (web-landing)
- `dashboard.claudprox.tams.codes.conf` → port 4017 (dashboard user)
- `admin.claudprox.tams.codes.conf` → port 4018 (dashboard admin)
- `api.claudprox.tams.codes.conf` → port 4015 (gateway, SSE-friendly)

## Cara pasang di server

```bash
# Copy ke sites-available, jangan timpa default Nginx
sudo cp deploy/nginx/*.conf /etc/nginx/sites-available/

# Aktifkan
sudo ln -s /etc/nginx/sites-available/claudprox.tams.codes.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/dashboard.claudprox.tams.codes.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.claudprox.tams.codes.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.claudprox.tams.codes.conf /etc/nginx/sites-enabled/

# Terbitkan SSL
sudo certbot --nginx \
  -d claudprox.tams.codes \
  -d dashboard.claudprox.tams.codes \
  -d admin.claudprox.tams.codes \
  -d api.claudprox.tams.codes

# Validasi konfigurasi
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

## Catatan SSE

Server block `api.claudprox.tams.codes.conf` mematikan `proxy_buffering` dan `proxy_cache`, set `proxy_read_timeout 300s`. Penting untuk endpoint streaming Server-Sent Events di gateway. Jangan ubah tanpa testing stream.

## Header keamanan

Semua server block tambah HSTS, X-Content-Type-Options, X-Frame-Options. Domain api hanya HSTS karena bukan untuk render HTML.

## JANGAN

- Jangan jadikan server block ini `default_server`. Default Nginx milik server harus tetap utuh.
- Jangan ubah `listen` lain (mis. port 8080) milik aplikasi tetangga.
- Jangan reload sebelum `nginx -t` lulus.
