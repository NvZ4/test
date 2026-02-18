/*:
 * @plugindesc Adds a pure "Press Any Key" text to the title screen and hides the menu until pressed. v2.0
 * @author Elise
 *
 * @param Press Text
 * @type text
 * @desc Text shown on the title screen.
 * @default Press Any Key
 *
 * @param Y Offset
 * @type number
 * @min 0
 * @desc Jarak teks dari bawah layar (pixel).
 * @default 80
 *
 * @param Blink Speed
 * @type number
 * @min 1
 * @desc Kecepatan kedip teks (besar = lebih pelan).
 * @default 30
 */

(function() {
    var params     = PluginManager.parameters('PressStartTitle');
    var pressText  = String(params['Press Text']  || 'Press Any Key');
    var yOffset    = Number(params['Y Offset']    || 80);
    var blinkSpeed = Number(params['Blink Speed'] || 30);

    // Geser menu dari tengah (kalau mau nanti diubah)
    var MENU_Y_OFFSET = 0;

    // ---------- Posisikan menu di tengah layar ----------
    Window_TitleCommand.prototype.updatePlacement = function() {
        this.x = (Graphics.boxWidth  - this.width)  / 2;
        this.y = (Graphics.boxHeight - this.height) / 2 + MENU_Y_OFFSET;
    };

    // ---------- Bikin sprite teks ----------
    var _Scene_Title_create = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function() {
        _Scene_Title_create.call(this);
        this.createPressStartSprite();
    };

    Scene_Title.prototype.createPressStartSprite = function() {
        this._pressStartSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        var bmp = this._pressStartSprite.bitmap;
        bmp.fontSize      = 32;
        bmp.outlineWidth  = 4;
        bmp.outlineColor  = 'black';
        bmp.textColor     = 'white';

        this.refreshPressStartText();

        this._pressStartSprite.visible = false;
        this._pressStartSprite.opacity = 0;

        this.addChild(this._pressStartSprite); // di atas background + video
    };

    Scene_Title.prototype.refreshPressStartText = function() {
        if (!this._pressStartSprite) return;
        var bmp = this._pressStartSprite.bitmap;
        bmp.clear();

        var w = Graphics.width;
        var h = Graphics.height;
        var y = h - yOffset; // dari bawah

        bmp.drawText(pressText, 0, y - 24, w, 48, 'center');
    };

    // ---------- Start: sembunyikan menu, tunggu press ----------
    var _Scene_Title_start = Scene_Title.prototype.start;
    Scene_Title.prototype.start = function() {
        _Scene_Title_start.call(this);

        this._waitingForPressStart = true;

        this._commandWindow.close();
        this._commandWindow.deactivate();
        this._commandWindow.visible = false;
    };

    // ---------- Update: kedip teks + cek input ----------
    var _Scene_Title_update = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function() {
        _Scene_Title_update.call(this);

        if (this._waitingForPressStart) {
            if (this._pressStartSprite) {
                this._pressStartSprite.visible = true;

                var alpha = 0.5 + 0.5 * Math.sin(Graphics.frameCount / blinkSpeed);
                this._pressStartSprite.opacity = 255 * alpha;
            }

            if (this.isStartTriggered()) {
                this.onPressStart();
            }
        }
    };

    Scene_Title.prototype.isStartTriggered = function() {
        return Input.isTriggered('ok') ||
               Input.isTriggered('cancel') ||
               Input.isTriggered('menu') ||
               TouchInput.isTriggered();
    };

    Scene_Title.prototype.onPressStart = function() {
        this._waitingForPressStart = false;

        if (this._pressStartSprite) {
            this._pressStartSprite.visible = false;
        }

        SoundManager.playOk();

        this._commandWindow.visible = true;
        this._commandWindow.open();
        this._commandWindow.activate();
    };

})();
