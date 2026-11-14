/* =============================================================================
 * XFIVE Community — Kartu Tanda Anggota Digital (E-KTP)
 * -----------------------------------------------------------------------------
 * Self-contained feature for the member detail page. Exposes a single global
 * `window.openEktpCard(member)` used by js/member-detail.js.
 *
 * Highlights:
 *   - Two-sided card (front / back) with a real 3D rotateY flip.
 *   - A thin diagonal glare that sweeps once per flip (synced to the flip).
 *   - A REAL scannable QR (QRious) that encodes the member profile URL.
 *   - "Diterbitkan" is computed live from new Date() with Indonesian months.
 *   - Photo is loaded through the same-origin Netlify Image CDN proxy and turned
 *     into a Base64 data URI so the card is portable and html2canvas-safe.
 *   - Download captures hidden, transform-free 900px clones (never the animated,
 *     rotateY'd element) so exports are never mirrored/reversed. Scale 3x.
 * ========================================================================== */
(function () {
  'use strict';

  // XFIVE logo, embedded as a Base64 data URI (no external asset needed).
  var XFIVE_LOGO = 'data:image/png;base64,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';

  var ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  // --- small local helpers (kept independent of member-detail.js) ----------
  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function slug(str) {
    if (!str) return '';
    return String(str).trim().toLowerCase()
      .replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  // Stable 32-bit hash — used so a member always gets the same registration no.
  function hashStr(s) {
    var h = 2166136261 >>> 0;
    s = String(s || '');
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  // Deterministic registration number, e.g. XF5-2025-0473.
  function regNumber(member) {
    var seed = (member && (member.nickname || member.name)) || 'xfive';
    var n = hashStr(seed) % 10000;
    return 'XF5-2025-' + String(n).padStart(4, '0');
  }

  // Today's date, formatted with Indonesian month names (live, not static).
  function issuedToday() {
    var d = new Date();
    return d.getDate() + ' ' + ID_MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  // Profile URL that the QR encodes — scanning it opens the member profile.
  function profileUrl(member) {
    var s = slug(member && member.nickname) || slug(member && member.name);
    if (s) return window.location.origin + '/member/' + s;
    return window.location.href;
  }

  // Decorative passport/KTP-style machine-readable zone (two lines).
  function mrzLines(member, regNo) {
    function pad(str, len) {
      str = String(str || '').toUpperCase().replace(/[^A-Z0-9]/g, '<');
      if (str.length > len) str = str.slice(0, len);
      while (str.length < len) str += '<';
      return str;
    }
    var nick = (member && member.nickname) || '';
    var name = (member && member.name) || 'MEMBER';
    var line1 = pad('IDXFV' + nick.replace(/[^A-Za-z0-9]/g, ''), 30);
    var line2 = pad(regNo.replace(/-/g, '') + name, 30);
    return [line1, line2];
  }

  // Decorative barcode ("tanda tangan digital") derived from the member seed so
  // it is stable per member. Drawn on a canvas and returned as a PNG data URI so
  // it renders reliably via a plain <img> (html2canvas cannot rasterize a CSS
  // repeating-linear-gradient — that produced the blank white box in exports).
  function barcodeDataUri(seed) {
    var W = 320, H = 64;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    if (!ctx) return '';
    ctx.fillStyle = '#dbeafe';
    ctx.fillRect(0, 0, W, H);
    var h = hashStr(seed);
    var x = 8;
    ctx.fillStyle = '#0a0f18';
    while (x < W - 8) {
      h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0;
      var bw = 1 + (h % 5);            // bar width 1..5
      var gap = 1 + ((h >>> 5) % 4);   // gap width 1..4
      ctx.fillRect(x, 7, bw, H - 14);
      x += bw + gap;
    }
    try { return c.toDataURL('image/png'); } catch (e) { return ''; }
  }

  // --- avatar → Base64 (via same-origin image proxy, canvas-taint-free) -----
  function placeholderDataUri(name) {
    var c = document.createElement('canvas');
    c.width = 480; c.height = 600;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 480, 600);
    g.addColorStop(0, '#0b1220');
    g.addColorStop(1, '#111827');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 480, 600);
    var initials = String(name || '?').trim().charAt(0).toUpperCase() || '?';
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 220px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 240, 310);
    try { return c.toDataURL('image/png'); } catch (e) { return ''; }
  }

  function avatarToDataUri(member) {
    return new Promise(function (resolve) {
      var src = member && (member.avatar || member.face_image_path || member.faceImageUrl || '');
      if (typeof src === 'string') src = src.trim();
      if (!src) {
        resolve(placeholderDataUri(member && (member.name || member.nickname)));
        return;
      }

      // If already a Data URI, return directly
      if (src.indexOf('data:image/') === 0) {
        resolve(src);
        return;
      }

      var img = new Image();
      var isExternal = /^https?:\/\//i.test(src) && src.indexOf(window.location.origin) !== 0;
      if (isExternal) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = function () {
        try {
          var c = document.createElement('canvas');
          c.width = img.naturalWidth || 600;
          c.height = img.naturalHeight || 600;
          var ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(c.toDataURL('image/jpeg', 0.9));
        } catch (e) {
          // If canvas taint error from external domain, return the direct src
          resolve(src);
        }
      };

      img.onerror = function () {
        resolve(placeholderDataUri(member && (member.name || member.nickname)));
      };

      img.src = src;
    });
  }

  // Generate the QR as a data URI so both the visible back and the export clone
  // use a plain <img> (html2canvas-friendly, high contrast, always scannable).
  function qrDataUri(url) {
    if (typeof QRious === 'undefined') return '';
    try {
      var q = new QRious({
        value: url,
        size: 520,
        level: 'M',
        background: '#ffffff',
        foreground: '#04070d',
        padding: 16
      });
      return q.toDataURL('image/png');
    } catch (e) { return ''; }
  }

  // --- markup builders (shared by visible card AND export clones) -----------
  function frontHTML(member, ctx) {
    var name = esc(member.name || 'Anggota');
    var role = (member.title || '').trim();
    var nickname = esc(member.nickname || '-');
    var dob = esc((member.dob || '-').trim() || '-');
    var domisili = esc((member.domisili || '-').trim() || '-');
    var verified = !!member.verified;
    var status = verified ? 'AKTIF / TERVERIFIKASI' : 'AKTIF';
    var quote = (member.quote || '').trim();

    var roleBadge = role
      ? '<span class="ektp-role">' + esc(role) + '</span>' : '';

    var verifChip = verified
      ? '<div class="ektp-verif"><i class="fas fa-shield-halved"></i> TERVERIFIKASI</div>'
      : '<div class="ektp-verif ektp-verif--plain">TERDAFTAR</div>';

    var motto = quote
      ? '<div class="ektp-motto">&ldquo;' + esc(quote) + '&rdquo;</div>'
      : '<div class="ektp-motto ektp-motto--empty">Anggota resmi XFIVE Community</div>';

    return '' +
      '<div class="ektp-sheen"></div>' +
      '<header class="ektp-hd">' +
        '<div class="ektp-hd-left">' +
          '<img class="ektp-logo" src="' + XFIVE_LOGO + '" alt="XFIVE">' +
          '<div class="ektp-hd-title">' +
            '<div class="ektp-hd-brand">XFIVE COMMUNITY</div>' +
            '<div class="ektp-hd-sub">KARTU TANDA ANGGOTA DIGITAL</div>' +
          '</div>' +
        '</div>' +
        '<div class="ektp-hd-right">' +
          '<div class="ektp-reg-label">NO. REGISTRASI</div>' +
          '<div class="ektp-reg-no">' + esc(ctx.regNo) + '</div>' +
        '</div>' +
      '</header>' +

      '<div class="ektp-body">' +
        '<div class="ektp-photo-col">' +
          '<div class="ektp-photo"><img src="' + esc(ctx.avatar) + '" alt="' + name + '"></div>' +
          verifChip +
        '</div>' +
        '<div class="ektp-fields">' +
          '<div class="ektp-field ektp-field--name">' +
            '<span class="ektp-lbl">Nama Lengkap</span>' +
            '<span class="ektp-val ektp-val--name">' + name + '</span>' +
            roleBadge +
          '</div>' +
          '<div class="ektp-field-row">' +
            '<div class="ektp-field">' +
              '<span class="ektp-lbl">ID / Username</span>' +
              '<span class="ektp-val ektp-mono">' + nickname + '</span>' +
            '</div>' +
            '<div class="ektp-field">' +
              '<span class="ektp-lbl">Tanggal Lahir</span>' +
              '<span class="ektp-val">' + dob + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="ektp-field-row">' +
            '<div class="ektp-field">' +
              '<span class="ektp-lbl">Domisili</span>' +
              '<span class="ektp-val">' + domisili + '</span>' +
            '</div>' +
            '<div class="ektp-field">' +
              '<span class="ektp-lbl">Status Keanggotaan</span>' +
              '<span class="ektp-val ektp-val--status">' + esc(status) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<footer class="ektp-ft">' +
        motto +
        '<div class="ektp-sign">' +
          '<div class="ektp-sign-label">Tanda Tangan Digital</div>' +
          '<div class="ektp-barcode">' + (ctx.barcodeUri
            ? '<img class="ektp-barcode-img" src="' + ctx.barcodeUri + '" alt="">'
            : '<span class="ektp-barcode-fallback"></span>') + '</div>' +
        '</div>' +
      '</footer>';
  }

  function backHTML(member, ctx) {
    var terdaftar = '&mdash;';   // no join-date data yet (kept accurate, not faked)
    var mrz = ctx.mrz;
    var qrImg = ctx.qr
      ? '<img src="' + ctx.qr + '" alt="QR profil ' + esc(member.name || '') + '">'
      : '<div class="ektp-qr-fallback">QR tidak tersedia</div>';

    return '' +
      '<div class="ektp-sheen"></div>' +
      '<header class="ektp-hd ektp-hd--back">' +
        '<div class="ektp-hd-left">' +
          '<img class="ektp-logo" src="' + XFIVE_LOGO + '" alt="XFIVE">' +
          '<div class="ektp-hd-title">' +
            '<div class="ektp-hd-brand">XFIVE COMMUNITY</div>' +
            '<div class="ektp-hd-sub">VERIFIKASI KEANGGOTAAN</div>' +
          '</div>' +
        '</div>' +
        '<div class="ektp-hd-right">' +
          '<div class="ektp-reg-label">NO. REGISTRASI</div>' +
          '<div class="ektp-reg-no">' + esc(ctx.regNo) + '</div>' +
        '</div>' +
      '</header>' +

      '<div class="ektp-back-body">' +
        '<div class="ektp-qr-col">' +
          '<div class="ektp-qr">' + qrImg + '</div>' +
          '<div class="ektp-qr-cap">PINDAI UNTUK VERIFIKASI</div>' +
        '</div>' +
        '<div class="ektp-back-info">' +
          '<div class="ektp-terms">' +
            'Kartu ini merupakan identitas digital resmi anggota XFIVE Community. ' +
            'Pindai kode QR untuk memverifikasi keaslian profil pemegang kartu. ' +
            'Kartu bersifat pribadi dan bukan dokumen negara.' +
          '</div>' +
          '<div class="ektp-meta">' +
            '<div class="ektp-meta-item">' +
              '<span class="ektp-lbl">Terdaftar Sejak</span>' +
              '<b class="ektp-mono">' + terdaftar + '</b>' +
            '</div>' +
            '<div class="ektp-meta-item">' +
              '<span class="ektp-lbl">Diterbitkan</span>' +
              '<b class="ektp-mono">' + esc(ctx.issued) + '</b>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="ektp-mrz">' +
        '<div>' + esc(mrz[0]) + '</div>' +
        '<div>' + esc(mrz[1]) + '</div>' +
      '</div>';
  }

  // --- download (capture a transform-free, off-screen clone) ---------------
  function triggerDownload(canvas, filename) {
    var url = canvas.toDataURL('image/png');
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Wait until fonts + every image in the clone are ready, then let the browser
  // lay out and paint once, so html2canvas measures the final metrics (missing
  // this is what caused clipped text and mismatched spacing in exports).
  function waitForReady(root) {
    var fontsReady = (document.fonts && document.fonts.ready)
      ? document.fonts.ready.catch(function () {}) : Promise.resolve();
    var imgs = Array.prototype.slice.call(root.querySelectorAll('img'));
    var imgsReady = Promise.all(imgs.map(function (img) {
      if (img.complete && img.naturalWidth) return Promise.resolve();
      if (img.decode) return img.decode().catch(function () {});
      return new Promise(function (res) { img.onload = img.onerror = res; });
    }));
    return Promise.all([fontsReady, imgsReady]).then(function () {
      return new Promise(function (resolve) {
        requestAnimationFrame(function () { requestAnimationFrame(resolve); });
      });
    });
  }

  function downloadSide(member, ctx, side, btn) {
    if (typeof html2canvas === 'undefined') {
      alert('Gagal menyiapkan gambar (html2canvas tidak termuat).');
      return;
    }
    var original = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Menyiapkan...'; }

    // Build a dedicated, off-screen clone that contains ONLY this side. It is a
    // plain block (position:fixed off-screen) with no rotateY / scale /
    // perspective / backface-visibility and no flipped state — so the capture
    // can never be mirrored or truncated by the animated card. The `is-exporting`
    // class relaxes the on-screen truncation rules (nowrap/ellipsis/clamp/fixed
    // heights) so text renders in full for the export only.
    var holder = document.createElement('div');
    holder.className = 'ektp-capture-holder';
    var face = document.createElement('div');
    face.className = 'ektp-face ektp-capture is-exporting ' + (side === 'back' ? 'ektp-back' : 'ektp-front');
    face.setAttribute('data-export-card', side);
    face.innerHTML = (side === 'back') ? backHTML(member, ctx) : frontHTML(member, ctx);
    holder.appendChild(face);
    document.body.appendChild(holder);

    var done = function () {
      if (holder.parentNode) holder.parentNode.removeChild(holder);
      if (btn) { btn.disabled = false; btn.innerHTML = original; }
    };

    waitForReady(face).then(function () {
      return html2canvas(face, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        width: face.offsetWidth,
        height: face.offsetHeight,
        windowWidth: face.offsetWidth,
        windowHeight: face.offsetHeight,
        // Force the export-only styling inside html2canvas' cloned document too,
        // as a belt-and-suspenders guarantee against any leftover transform.
        onclone: function (clonedDoc) {
          var c = clonedDoc.querySelector('[data-export-card="' + side + '"]');
          if (c) {
            c.classList.add('is-exporting');
            c.style.transform = 'none';
            c.style.overflow = 'visible';
          }
        }
      });
    }).then(function (canvas) {
      var s = slug(member.nickname) || slug(member.name) || 'anggota';
      triggerDownload(canvas, 'XFIVE-EKTP-' + s + '-' + (side === 'back' ? 'belakang' : 'depan') + '.png');
      done();
    }).catch(function () {
      alert('Gagal mengunduh kartu. Silakan coba lagi.');
      done();
    });
  }

  // --- modal / interaction -------------------------------------------------
  function closeModal() {
    var ov = document.getElementById('ektp-overlay');
    if (ov) ov.parentNode.removeChild(ov);
    document.body.classList.remove('ektp-lock');
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') closeModal();
  }

  window.openEktpCard = function (member) {
    if (!member) return;
    closeModal(); // ensure single instance

    var regNo = regNumber(member);
    var ctx = {
      regNo: regNo,
      issued: issuedToday(),
      barcodeUri: barcodeDataUri((member.nickname || member.name || '') + regNo),
      mrz: mrzLines(member, regNo),
      qr: qrDataUri(profileUrl(member)),
      avatar: (member && (member.avatar || member.face_image_path || member.faceImageUrl)) || placeholderDataUri(member.name) // swapped for real photo Base64 once loaded
    };

    var overlay = document.createElement('div');
    overlay.id = 'ektp-overlay';
    overlay.className = 'ektp-overlay';
    overlay.innerHTML =
      '<div class="ektp-modal" role="dialog" aria-modal="true" aria-label="Kartu Tanda Anggota Digital">' +
        '<button class="ektp-close" id="ektp-close" aria-label="Tutup"><i class="fas fa-times"></i></button>' +
        '<div class="ektp-modal-title">' +
          '<i class="fas fa-id-card"></i> Kartu Tanda Anggota Digital' +
        '</div>' +
        '<div class="ektp-stage">' +
          '<div class="ektp-flip" id="ektp-flip" title="Klik untuk memutar kartu">' +
            '<div class="ektp-face ektp-front" id="ektp-front">' + frontHTML(member, ctx) +
              '<div class="ektp-glare"></div>' +
            '</div>' +
            '<div class="ektp-face ektp-back" id="ektp-back">' + backHTML(member, ctx) +
              '<div class="ektp-glare"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ektp-hint"><i class="fas fa-hand-pointer"></i> Klik kartu atau tekan &ldquo;Putar Kartu&rdquo;</div>' +
        '<div class="ektp-controls">' +
          '<button class="action-ghost" id="ektp-flip-btn"><i class="fas fa-rotate"></i> Putar Kartu</button>' +
          '<button class="action-primary" id="ektp-dl-btn"><i class="fas fa-download"></i> Download Sisi Depan</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.classList.add('ektp-lock');
    document.addEventListener('keydown', onKey);

    var flip = overlay.querySelector('#ektp-flip');
    var dlBtn = overlay.querySelector('#ektp-dl-btn');
    var flipBtn = overlay.querySelector('#ektp-flip-btn');
    var glares = overlay.querySelectorAll('.ektp-glare');
    var state = { flipped: false };

    function runGlare() {
      glares.forEach(function (g) {
        g.classList.remove('run');
        // force reflow so the animation can restart every flip
        void g.offsetWidth;
        g.classList.add('run');
      });
    }

    function doFlip() {
      state.flipped = !state.flipped;
      flip.classList.toggle('flipped', state.flipped);
      runGlare();
      dlBtn.innerHTML = state.flipped
        ? '<i class="fas fa-download"></i> Download Sisi Belakang'
        : '<i class="fas fa-download"></i> Download Sisi Depan';
    }

    flip.addEventListener('click', doFlip);
    flipBtn.addEventListener('click', function (e) { e.stopPropagation(); doFlip(); });
    overlay.querySelector('#ektp-close').addEventListener('click', closeModal);
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) closeModal();
    });

    dlBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      downloadSide(member, ctx, state.flipped ? 'back' : 'front', dlBtn);
    });

    // Load the real photo in the background, then swap it into the card + ctx
    // so both the on-screen card and the export use the Base64 photo.
    avatarToDataUri(member).then(function (dataUri) {
      if (!dataUri) return;
      ctx.avatar = dataUri;
      var imgs = overlay.querySelectorAll('.ektp-front .ektp-photo img');
      imgs.forEach(function (im) { im.src = dataUri; });
    });
  };
})();
