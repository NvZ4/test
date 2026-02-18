//=============================================================================
// IBS_NeptuniaBattleUI.js  v1.1
// (Invictus Battle Style - Neptunia-like HUD)
// by Elisebell
// Standalone battle HUD for RPG Maker MV (no deps).
//=============================================================================
/*:
 * @target MV
 * @plugindesc [Invictus] Neptunia-like Battle HUD (portraits + gauges + right command) - standalone (v1.1)
 * @author Elisebell
 *
 * @help
 * Letakkan portrait di img/pictures. Notetag di Actor:
 *   <NEP_Portrait: filename>   // tanpa .png  (contoh: ui_marine)
 *
 * Tips:
 * - Set "Hide Default Status Window" = true untuk menyembunyikan HUD default.
 * - Plugin ini hanya gambar HUD. Tidak mengubah flow aksi / movement.
 *
 * @param ---Layout---
 * @default
 *
 * @param Auto Center
 * @type boolean
 * @default true
 * @desc Jika true, Base X diabaikan dan HUD otomatis ditengah horizontal.
 *
 * @param Base X
 * @type number
 * @min 0
 * @default 170
 * @desc Posisi X awal slot pertama (jika Auto Center = false).
 *
 * @param Base Y
 * @type number
 * @min 0
 * @default 610
 * @desc Posisi Y semua slot (untuk 1280x720 biasanya 600~640).
 *
 * @param Slot Spacing X
 * @type number
 * @min 0
 * @default 360
 * @desc Jarak horizontal antar slot.
 *
 * @param Scale %
 * @type number
 * @min 50
 * @max 150
 * @default 100
 * @desc Skala tiap slot HUD (100 = asli).
 *
 * @param Circle Portrait
 * @type boolean
 * @default true
 * @desc Potret dipotong lingkaran.
 *
 * @param Portrait Size
 * @type number
 * @min 64
 * @default 256
 * @desc Ukuran kotak potret (persegi) sebelum skala diterapkan.
 *
 * @param Draw Name
 * @type boolean
 * @default true
 *
 * @param Name Offset X
 * @type number
 * @default 80
 *
 * @param Name Offset Y
 * @type number
 * @default -70
 *
 * @param ---Gauges---
 * @default
 *
 * @param Gauge Width
 * @type number
 * @default 200
 *
 * @param Gauge Height
 * @type number
 * @default 10
 *
 * @param Gauge Spacing Y
 * @type number
 * @default 16
 *
 * @param HP Color
 * @type string
 * @default #FF6B6B
 *
 * @param MP Color
 * @type string
 * @default #4DB5FF
 *
 * @param TP Color
 * @type string
 * @default #4ED1A1
 *
 * @param Draw TP
 * @type boolean
 * @default true
 *
 * @param Gauge Offset X
 * @type number
 * @default 80
 *
 * @param Gauge Offset Y
 * @type number
 * @default -40
 *
 * @param ---Command---
 * @default
 *
 * @param Command Right X
 * @type number
 * @default 980
 *
 * @param Command Right Y
 * @type number
 * @default 280
 *
 * @param Command Width
 * @type number
 * @default 260
 *
 * @param Command Opacity
 * @type number
 * @min 0
 * @max 255
 * @default 200
 *
 * @param PartyCmd Y
 * @type number
 * @default 560
 * @desc Posisi Y window Party Command (Fight/Escape).
 *
 * @param Hide Default Status Window
 * @type boolean
 * @default true
 *
 * @param Status Window Opacity
 * @type number
 * @min 0
 * @max 255
 * @default 0
 *
 * @param ---Style---
 * @default
 *
 * @param Slot BG Opacity
 * @type number
 * @min 0
 * @max 255
 * @default 80
 * @desc Latar belakang lembut di belakang portrait (rect transparan).
 *
 * @param Active Ring
 * @type boolean
 * @default true
 * @desc Cincin glow untuk actor yang sedang beraksi.
 */
/*~struct~Notes:
 * Actors Notetag:
 *   <NEP_Portrait: filename>
 * File di img/pictures/filename.png
 */
//=============================================================================

(function(){
  "use strict";
  var PN = "IBS_NeptuniaBattleUI";
  var P  = PluginManager.parameters(PN);

  function num(k, d){ return Number(P[k] != null ? P[k] : d); }
  function str(k, d){ return String(P[k] != null ? P[k] : d); }
  function bool(k,d){ return String(P[k] != null ? P[k] : d) === "true"; }

  // Params (Base X finally active!)
  var AUTO_CENTER = bool("Auto Center", true);
  var BASE_X   = num("Base X",170);
  var BASE_Y   = num("Base Y",610);
  var SPACE_X  = num("Slot Spacing X",360);
  var SCALE    = num("Scale %",100)/100;
  var CIRCLE   = bool("Circle Portrait",true);
  var POR_SZ   = num("Portrait Size",256);

  var DRAW_NAME = bool("Draw Name",true);
  var NAME_OX   = num("Name Offset X",80);
  var NAME_OY   = num("Name Offset Y",-70);

  var GW   = num("Gauge Width",200);
  var GH   = num("Gauge Height",10);
  var GSY  = num("Gauge Spacing Y",16);
  var HPc  = str("HP Color","#FF6B6B");
  var MPc  = str("MP Color","#4DB5FF");
  var TPc  = str("TP Color","#4ED1A1");
  var DRAW_TP = bool("Draw TP",true);
  var GOX  = num("Gauge Offset X",80);
  var GOY  = num("Gauge Offset Y",-40);

  var CMD_X  = num("Command Right X",980);
  var CMD_Y  = num("Command Right Y",280);
  var CMD_W  = num("Command Width",260);
  var CMD_O  = num("Command Opacity",200);
  var PCMD_Y = num("PartyCmd Y",560);

  var HIDE_STATUS = bool("Hide Default Status Window",true);
  var STATUS_OP   = num("Status Window Opacity",0);

  var BG_OP   = num("Slot BG Opacity",80);
  var RING_ON = bool("Active Ring",true);

  // --- Notetag portrait ---
  var _DataManager_extract = DataManager.extractMetadata;
  DataManager.extractMetadata = function(obj){
    _DataManager_extract.call(this,obj);
    if (obj && obj.note){
      var m = obj.note.match(/<NEP_Portrait:\s*(.+?)\s*>/i);
      if (m) obj._nepPortrait = m[1].trim();
    }
  };

  // --- Scene hooks ---
  var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
  Scene_Battle.prototype.createAllWindows = function(){
    _Scene_Battle_createAllWindows.call(this);

    if (this._actorCommandWindow){
      this._actorCommandWindow.x = CMD_X;
      this._actorCommandWindow.y = CMD_Y;
      this._actorCommandWindow.width = CMD_W;
      this._actorCommandWindow.opacity = CMD_O;
      this._actorCommandWindow.createContents();
    }
    if (this._partyCommandWindow){
      this._partyCommandWindow.y = PCMD_Y;
      this._partyCommandWindow.opacity = CMD_O;
    }
    if (this._statusWindow){
      this._statusWindow.opacity = STATUS_OP;
      this._statusWindow.visible = !HIDE_STATUS;
    }

    this._nepHudLayer = new Sprite();
    this.addChild(this._nepHudLayer);
    this.buildNepHUD();
  };

  var _Scene_Battle_start = Scene_Battle.prototype.start;
  Scene_Battle.prototype.start = function(){
    _Scene_Battle_start.call(this);
    this.refreshNepHUD();
  };

  Scene_Battle.prototype.buildNepHUD = function(){
    if (this._nepHudSlots){
      this._nepHudSlots.forEach(s => this._nepHudLayer.removeChild(s));
    }
    this._nepHudSlots = [];

    var members = $gameParty.battleMembers();
    var count = members.length;

    // hitung total lebar untuk auto-center
    var slotW = (POR_SZ + Math.max(GW + GOX + 60, POR_SZ)); // kira2 total ruang slot
    var totalW = (count-1)*SPACE_X + slotW;
    var startX = AUTO_CENTER ? Math.floor((Graphics.boxWidth - totalW)/2) : BASE_X;

    for (var i=0;i<count;i++){
      var actor = members[i];
      var slot = new Sprite();
      slot.x = Math.floor(startX + SPACE_X*i);
      slot.y = Math.floor(BASE_Y);
      slot.scale.x = slot.scale.y = SCALE;

      // background lembut
      var bg = new Sprite(new Bitmap(POR_SZ+GW+140, POR_SZ));
      bg.bitmap.paintOpacity = BG_OP;
      bg.bitmap.fillRect(0, POR_SZ-60, bg.bitmap.width, 60, "#000000");
      bg.bitmap.paintOpacity = 255;
      slot.addChild(bg);

      // portrait
      var fname = (actor.actor()._nepPortrait || actor.faceName() || "");
      var por = new Sprite();
      por.bitmap = fname ? ImageManager.loadPicture(fname) : new Bitmap(POR_SZ,POR_SZ);
      por.x = 0; por.y = 0;

      if (CIRCLE){
        var g = new PIXI.Graphics();
        g.beginFill(0xFFFFFF);
        g.drawCircle(POR_SZ/2, POR_SZ/2, POR_SZ/2);
        g.endFill();
        por.mask = g;
        por.addChild(g);
      }
      por._fitCheck = function(){
        if (!this.bitmap || !this.bitmap.isReady()) return false;
        var bw = this.bitmap.width, bh = this.bitmap.height;
        var s = Math.min(POR_SZ/bw, POR_SZ/bh);
        this.scale.x = this.scale.y = s;
        this.x = (POR_SZ - bw*s)/2;
        this.y = (POR_SZ - bh*s)/2;
        return true;
      };
      slot.addChild(por);

      // nama
      if (DRAW_NAME){
        var nm = new Sprite(new Bitmap(260, 32));
        nm.x = POR_SZ + NAME_OX;
        nm.y = (POR_SZ/2) + NAME_OY;
        nm.bitmap.textColor = "#FFFFFF";
        nm.bitmap.outlineColor = "rgba(0,0,0,0.6)";
        nm.bitmap.outlineWidth = 4;
        nm.bitmap.fontSize = 22;
        nm.bitmap.drawText(actor.name(), 0, 0, 260, 32, "left");
        slot.addChild(nm);
      }

      // gauges
      function makeGauge(color){
        var sp = new Sprite(new Bitmap(GW, GH));
        sp._color = color;
        sp._ratio = 0;
        sp.refresh = function(){
          var b = this.bitmap;
          b.clear();
          b.fillRect(0, 0, GW, GH, "rgba(0,0,0,0.35)");
          b.fillRect(0, 0, Math.max(0, Math.floor(GW * this._ratio)), GH, this._color);
        };
        return sp;
      }
      var gy = POR_SZ/2 + GOY;
      var gHP = makeGauge(HPc); gHP.y = gy; gHP.x = POR_SZ + GOX;
      var gMP = makeGauge(MPc); gMP.y = gy + GSY; gMP.x = POR_SZ + GOX;
      slot.addChild(gHP); slot.addChild(gMP);
      var gTP = null;
      if (DRAW_TP){
        gTP = makeGauge(TPc); gTP.y = gy + GSY*2; gTP.x = POR_SZ + GOX;
        slot.addChild(gTP);
      }

      // cincin aktif
      var ring = null;
      if (RING_ON){
        ring = new Sprite(new Bitmap(POR_SZ+8, POR_SZ+8));
        ring.x = -4; ring.y = -4;
        var ctx = ring.bitmap._context;
        ctx.save();
        ctx.strokeStyle = "rgba(90,170,255,0.9)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(POR_SZ/2+4, POR_SZ/2+4, (POR_SZ/2), 0, Math.PI*2);
        ctx.stroke();
        ctx.restore();
        ring.bitmap._setDirty();
        ring.visible = false;
        slot.addChild(ring);
      }

      slot._actor = actor;
      slot._por   = por;
      slot._gHP = gHP; slot._gMP = gMP; slot._gTP = gTP;
      slot._ring = ring;

      this._nepHudLayer.addChild(slot);
      this._nepHudSlots.push(slot);
    }
  };

  Scene_Battle.prototype.refreshNepHUD = function(){
    if (!this._nepHudSlots) return;
    for (var i=0;i<this._nepHudSlots.length;i++){
      var s = this._nepHudSlots[i];
      if (s && s._por && s._por._fitCheck) s._por._fitCheck();
    }
  };

  var _Scene_Battle_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function(){
    _Scene_Battle_update.call(this);
    this.updateNepHUD();
  };

  Scene_Battle.prototype.updateNepHUD = function(){
    if (!this._nepHudSlots) return;
    var subject = BattleManager._subject;

    for (var i=0;i<this._nepHudSlots.length;i++){
      var s = this._nepHudSlots[i];
      var a = s._actor;
      if (!a) continue;

      var hpR = a.mhp ? (a.hp / a.mhp) : 0;
      var mpR = a.mmp ? (a.mp / a.mmp) : 0;
      if (s._gHP && s._gHP._ratio !== hpR){ s._gHP._ratio = hpR; s._gHP.refresh(); }
      if (s._gMP && s._gMP._ratio !== mpR){ s._gMP._ratio = mpR; s._gMP.refresh(); }
      if (s._gTP){
        var tpR = a.maxTp ? (a.tp / a.maxTp()) : (a.tp/100);
        if (s._gTP._ratio !== tpR){ s._gTP._ratio = tpR; s._gTP.refresh(); }
      }

      if (s._ring){
        s._ring.visible = (subject && subject.isActor && subject.isActor() && subject.actorId() === a.actorId());
      }
    }
  };

})();