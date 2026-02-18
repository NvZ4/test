/*:
 * @plugindesc [v2.6] Looping video sebagai background di Title Screen (di belakang UI). 
 * @author Elise
 *
 * @param Video File
 * @type text
 * @desc Nama file video di folder /movies (dengan extension, contoh: main_menu.mp4)
 * @default main_menu.mp4
 */

(function() {
    var params = PluginManager.parameters('TitleVideoBackground');
    var tvbVideoFile = String(params['Video File'] || 'video1muklis.mp4');

    // ---------------------------------------------------------
    // helper: buat elemen <video> DOM di belakang canvas
    // ---------------------------------------------------------
    Scene_Title.prototype.createVideoBackground = function() {
        // kalau sudah ada, hapus dulu
        if (this._titleVideoElement) {
            try { this._titleVideoElement.pause(); } catch (e) {}
            if (this._titleVideoElement.parentNode) {
                this._titleVideoElement.parentNode.removeChild(this._titleVideoElement);
            }
            this._titleVideoElement = null;
        }

        var url = 'movies/' + tvbVideoFile;
        console.log('TitleVideoBackground: using DOM video ' + url);

        var video = document.createElement('video');
        video.src = url;
        video.loop = true;
        video.autoplay = true;
        video.muted = false;
        video.playsInline = true;

        // styling: full screen, di belakang canvas
        video.style.position = 'absolute';
        video.style.left = '0px';
        video.style.top = '0px';
        video.style.margin = '0';
        video.style.padding = '0';
        video.style.width = Graphics.width + 'px';
        video.style.height = Graphics.height + 'px';
        video.style.zIndex = '0';
        video.style.pointerEvents = 'none';
        video.style.objectFit = 'cover';

        // pastikan canvas di depan
        if (Graphics._canvas) {
            Graphics._canvas.style.position = 'relative';
            Graphics._canvas.style.zIndex = '10';
        }

        var parent = Graphics._canvas ? Graphics._canvas.parentNode : document.body;
        parent.insertBefore(video, Graphics._canvas || null);

        this._titleVideoElement = video;
    };

    // ---------------------------------------------------------
    // Override createBackground:
    // 1) panggil versi asli biar _backSprite1/_backSprite2 tetap ada
    // 2) bikin video DOM
    // 3) set Title1/Title2 invisible (opacity 0)
    // ---------------------------------------------------------
    var _Scene_Title_createBackground = Scene_Title.prototype.createBackground;
    Scene_Title.prototype.createBackground = function() {
        _Scene_Title_createBackground.call(this);   // bikin _backSprite1/_backSprite2

        this.createVideoBackground();               // video di belakang

        // sembunyikan gambar Title bawaan
        if (this._backSprite1) this._backSprite1.opacity = 0;
        if (this._backSprite2) this._backSprite2.opacity = 0;
    };

    // ---------------------------------------------------------
    // Bersihkan saat keluar dari title
    // ---------------------------------------------------------
    var _Scene_Title_terminate = Scene_Title.prototype.terminate;
    Scene_Title.prototype.terminate = function() {
        _Scene_Title_terminate.call(this);

        if (this._titleVideoElement) {
            try { this._titleVideoElement.pause(); } catch (e) {}
            if (this._titleVideoElement.parentNode) {
                this._titleVideoElement.parentNode.removeChild(this._titleVideoElement);
            }
            this._titleVideoElement = null;
        }
    };

})();
