

## Sorun

`MainPanel.tsx` her viewState'de farklı içerik render ediyor. "Devam Et" / "Başlat" butonuna basıldığında:
- `viewState` instructions/practice-passed/intervention'dan → practice/phase1/phase2'ye değişiyor
- TestEngine **anında mount** oluyor ve fixation cross (`+`) **hemen** görünmeye başlıyor
- Aynı anda MainPanel'in `flex items-center justify-center` layout'u devreye giriyor (isTestPhase true oluyor) ve içerik dikey olarak yeniden konumlanıyor
- Practice-passed / intervention ekranlarındaki `animate-fade-in` halen görünür durumdayken yeni içerik geliyor
- Sonuç: Fixation cross, layout shift / animasyon kalıntıları arasında beliriyor ve **500ms sayacı bu görsel kararsızlık sırasında işliyor** → psikometrik standardizasyon bozuluyor

## Çözüm: Test Başlatma için "Hazırlık Tamponu" (Preparation Buffer)

Buton basışı ile fixation cross'un başlaması arasına **kısa, sabit süreli, tamamen boş bir beyaz ekran (preparation blank)** ekleyelim. Bu, hem layout'un oturmasını hem de tüm geçiş animasyonlarının bitmesini garantiler. Sonra fixation **temiz, statik bir ekranda** belirir ve 500ms sayacı doğru çalışır.

### Detaylı Plan

**1. `TestEngine.tsx` — Yeni `"prep"` fazı ekle**
- `TestPhase` tipine `"prep"` ekle
- İlk faz `"prep"` olsun (mevcut `"fixation"` yerine başlangıç değeri)
- Prep süresi: **400ms tamamen boş ekran** (background ile aynı, hiçbir içerik yok)
- Prep boyunca `animate-slide-in-right` / `animate-fade-in` gibi kalıntı animasyonlar bitmiş olur
- Prep biter → `"fixation"` başlar (500ms minimum + decode bekleme — mevcut mantık)
- Tüm geçişler aynı `<main>` mount'u içinde gerçekleştiği için ek layout shift yok

**2. `MainPanel.tsx` — Test fazları için animasyonu kaldır**
- `<main>`'in `animate-slide-in-right` class'ı, `viewState` test fazına geçtiğinde uygulanmasın (initial mount sonrası kullanıcı zaten görüyor; ek slide animasyonu psikometrik temizliği bozar)
- `isTestPhase` true olduğunda animate-slide-in-right hiç eklenmesin → sadece içerik anında değişsin
- Test fazına geçen wrapper `<div>`lerden `animate-fade-in` (eğer varsa) kaldır — TestEngine'in prep ekranı zaten tampon görevi görüyor

**3. `MainPanel.tsx` — Layout pozisyonunu sabitle**
- `isTestPhase` için `flex items-center justify-center` toggle'ı, test başlamadan **bir frame önce** uygulanmalı veya layout sürekli aynı kalmalı
- Alternatif: practice-passed / intervention ekranlarını da `flex items-center justify-center` ile aynı dikey konumda göster → test başladığında layout shift olmaz

### Akış Karşılaştırması

```text
ÖNCE:
[Başlat tıkla] → [layout shift + slide-in-right] → [fixation +] (500ms sayaç)
                  ↑ standardizasyonu bozan kısım

SONRA:
[Başlat tıkla] → [400ms boş hazırlık] → [fixation +] (500ms temiz sayaç)
                  ↑ tüm geçişler tamamlanır    ↑ standart başlangıç
```

### Neden 400ms?

- 60fps'te ~24 frame: layout shift, animation residue, browser paint için fazlasıyla yeterli
- Kullanıcının "ekran hazırlanıyor" hissini yakalaması için yeterince kısa
- Mevcut decode sistemi sayesinde görseller zaten warm; ek beklemeye gerek yok

### Düzenlenecek Dosyalar

- `src/components/TestEngine.tsx` — `"prep"` fazı ekle, başlangıç state'i değiştir, render bloğu ekle
- `src/components/MainPanel.tsx` — `<main>` className'inden test fazlarında `animate-slide-in-right` çıkar; test fazı wrapper'larından kalıntı animasyonları temizle

