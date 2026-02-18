    /*:
    * @plugindesc Pans the title background upward from the bottom, like a camera pan. v1.1
    * @author Elise
    *
    * @param Reveal Frames
    * @type number
    * @min 1
    * @desc How many frames the pan animation takes (60 = 1 second at 60fps).
    * @default 90
    */

    (function() {
        var parameters = PluginManager.parameters('TitleRevealFromBottom');
        var revealFrames = Number(parameters['Reveal Frames'] || 2000000);

        // Init flags
        Scene_Title.prototype._initRevealFlags = function() {
            this._titlePanInitialized  = false;
            this._titlePanReady        = false;
            this._titlePanCount        = 0;
            this._titleCommandsOpened  = false;
        };

        // ---------------------------------------------------------
        // Start: cancel default fade-in & init flags
        // ---------------------------------------------------------
        var _Scene_Title_start = Scene_Title.prototype.start;
        Scene_Title.prototype.start = function() {
            _Scene_Title_start.call(this);

            // No normal fade-in; our pan acts as the transition
            this._fadeDuration = 0;
            this._fadeSign = 0;

            this._initRevealFlags();
        };

        // ---------------------------------------------------------
        // Update: PAN the image instead of revealing a black curtain
        // ---------------------------------------------------------
        var _Scene_Title_update = Scene_Title.prototype.update;
        Scene_Title.prototype.update = function() {
            _Scene_Title_update.call(this);

            // 1) Set up once when Title1 bitmap is loaded
            if (!this._titlePanInitialized &&
                this._backSprite1 &&
                this._backSprite1.bitmap &&
                this._backSprite1.bitmap.isReady()) {

                this._titlePanInitialized = true;
                this._titlePanReady = true;

                var bw = this._backSprite1.bitmap.width;
                var bh = this._backSprite1.bitmap.height;

                // Visible height: usually your game resolution's height
                var viewH = Graphics.height;
                if (viewH > bh) viewH = bh; // safety

                // Anchor center so sprite fills the screen nicely
                this._backSprite1.anchor.x = 0.5;
                this._backSprite1.anchor.y = 0.5;
                this._backSprite1.x = Graphics.width  / 2;
                this._backSprite1.y = Graphics.height / 2;

                // Camera pan:
                //   - startY: near the bottom of the image (showing "dirt")
                //   - endY: higher up (show more of the tree)
                this._panViewH = viewH;
                this._panStartY = bh - viewH; // bottom-most crop
                this._panEndY   = 160;          // top-most crop (you can tweak this)

                // Start at bottom
                this._backSprite1.setFrame(0, this._panStartY, bw, viewH);
            }

            // 2) Pan animation over time
            if (this._titlePanReady && this._titlePanCount < revealFrames) {
                this._titlePanCount++;
                var t  = this._titlePanCount / revealFrames; // 0 → 1
                var bw = this._backSprite1.bitmap.width;
                var bh = this._backSprite1.bitmap.height;

                var viewH = this._panViewH;
                var startY = this._panStartY;
                var endY   = this._panEndY;

                // Linear interpolate Y along the bitmap
                var currentY = startY + (endY - startY) * t;

                // Keep within bounds
                currentY = Math.max(0, Math.min(currentY, bh - viewH));

                // Show a fixed-height slice that moves upward over the image
                this._backSprite1.setFrame(0, currentY, bw, viewH);

            } else if (this._titlePanReady && !this._titleCommandsOpened) {
                // 3) After pan finished, open the title command window
                this._commandWindow.open();
                this._titleCommandsOpened = true;
            }
        };

        // ---------------------------------------------------------
        // isBusy: treat the pan animation as "busy"
        // ---------------------------------------------------------
        var _Scene_Title_isBusy = Scene_Title.prototype.isBusy;
        Scene_Title.prototype.isBusy = function() {
            if (this._titlePanReady && this._titlePanCount < revealFrames) {
                return true;
            }
            return _Scene_Title_isBusy.call(this);
        };

    })();
