/*:
 * @plugindesc Play a vanity MP4/WebM logo video before the title screen. v2.1 (MV)
 * @author Elise
 *
 * @param Video File
 * @type text
 * @desc Movie filename in /movies (WITH extension, e.g. aether_gear_vanity_intro.mp4)
 * @default aether_gear_vanity_intro.mp4
 */

(function() {
    var parameters = PluginManager.parameters('LogoVideoScene');
    var logoVideoFile = String(parameters['Video File'] || 'aether_gear_vanity_intro.mp4');

    //-----------------------------------------------------------------------------
    // Scene_LogoVideo
    //
    // Custom scene to play the vanity intro video.

    function Scene_LogoVideo() {
        this.initialize.apply(this, arguments);
    }

    Scene_LogoVideo.prototype = Object.create(Scene_Base.prototype);
    Scene_LogoVideo.prototype.constructor = Scene_LogoVideo;

    Scene_LogoVideo.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._videoStarted = false;
    };

    Scene_LogoVideo.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackgroundSprite();
    };

    Scene_LogoVideo.prototype.createBackgroundSprite = function() {
        this._bgSprite = new Sprite();
        this._bgSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this._bgSprite.bitmap.fillRect(0, 0, Graphics.width, Graphics.height, 'black');
        this.addChild(this._bgSprite);
    };

    Scene_LogoVideo.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        this.playLogoVideo();
    };

    Scene_LogoVideo.prototype.playLogoVideo = function() {
        this._videoStarted = true;
        // MV-style: play a video from /movies
        Graphics.playVideo('movies/' + logoVideoFile);
    };

    // Hard-stop the HTML5 video and make sure it cannot resume
    Scene_LogoVideo.prototype.stopLogoVideo = function() {
        try {
            if (Graphics._video) {
                Graphics._video.pause();
                // Completely unload the source so it can't resume later
                Graphics._video.removeAttribute('src');
                Graphics._video.load();
            }
        } catch (e) {
            // ignore
        }
        // Reset MV's internal flag too
        Graphics._isVideoPlaying = false;
    };

    Scene_LogoVideo.prototype.update = function() {
        Scene_Base.prototype.update.call(this);

        // Allow skipping the video with OK / Cancel
        if (this._videoStarted &&
            (Input.isTriggered('ok') || Input.isTriggered('cancel'))) {
            this.stopLogoVideo();
            SceneManager.goto(Scene_Title);
            return;
        }

        // When the video finishes (or fails), go to the title screen
        if (this._videoStarted && !Graphics.isVideoPlaying()) {
            this.stopLogoVideo();
            SceneManager.goto(Scene_Title);
        }
    };

    //-----------------------------------------------------------------------------
    // Scene_Boot
    //
    // Hook boot: after setting up a new game, go to Scene_LogoVideo instead of Scene_Title.

    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        SoundManager.preloadImportantSounds();
        if (DataManager.isBattleTest()) {
            DataManager.setupBattleTest();
            SceneManager.goto(Scene_Battle);
        } else if (DataManager.isEventTest()) {
            DataManager.setupEventTest();
            SceneManager.goto(Scene_Map);
        } else {
            this.checkPlayerLocation();
            DataManager.setupNewGame();
            // Go to the vanity video scene first
            SceneManager.goto(Scene_LogoVideo);
            Window_TitleCommand.initCommandPosition();
        }
        this.updateDocumentTitle();
    };

})();
