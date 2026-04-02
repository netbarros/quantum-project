# PWA Report — Paula PWA

## Lighthouse PWA Checklist

### Installable
- [x] manifest.json válido com name, short_name, start_url, display
- [x] Icons SVG 192+512 com purpose "any"
- [x] Icons PNG 192+512 reais (15KB + 51KB, não placeholders)
- [x] PNG icons com purpose "any maskable"
- [x] description field added
- [x] categories field added

### Optimized
- [x] theme_color no manifest (#7C3AED)
- [x] background_color no manifest (#080810)
- [x] meta theme-color no layout.tsx via viewport export (#0D0D1A)
- [x] apple-touch-icon configurado via metadata.icons.apple
- [x] orientation: portrait

### Reliable
- [x] Service worker registrado (PWARegistration component)
- [x] Offline fallback (offline.html)
- [x] Cache strategy (network-first nav, cache-first static)
- [x] Push notification handler

### Fixes Aplicados
1. ✅ Gerados icon-192x192.png (15,736 bytes) e icon-512x512.png (51,772 bytes) reais com gradient orb
2. ✅ manifest.json expandido com description, categories, PNG icons
3. ✅ layout.tsx: apple-touch-icon + icon metadata configurados
4. ✅ SVG icons mantidos como fallback (type: image/svg+xml)
