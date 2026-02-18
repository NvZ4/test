//=============================================================================
// IBS_AllInOne_RearViewHUD.js
// Invictus: Rear-View Actor Movement + Neptunia-like Battle HUD (Standalone)
// by Elisebell
// RPG Maker MV
//=============================================================================
/*:
 * @target MV
 * @plugindesc [Invictus] Rear-view battle move (vertical) + Neptunia-like HUD (portraits+gauges+right command). Standalone.
 * @author Elise
 *
 * @help
 * 1) Rear-view: Aktor MAJU (Y-) saat Attack/Skill, lalu mundur ke posisi semula.
 *    Guard/Item tidak memicu maju-mundur. Flinch tidak diubah.
 *    Tidak ada "maju sendiri" saat battle start.
 *
 * 2) HUD: Portrait bulat + bar HP/MP/TP di bawah, command di kanan.
 *    Pasang portrait di img/pictures/ lalu notetag di Actors:
 *      <NEP_Portrait: filename>     // tanpa .png
 *
 * Kompatibilitas:
 * - Dirancang tidak mengubah flow BEC selain posisi window & gerak aktor.
 * - Letakkan di bawah BEC & ActSeq (jika digunakan). Tidak bergantung plugin lain.
 *
 * @param ---RearView---
 * @default
 *
 * @param RearView Enabled
 * @type boolean
 * @default true
 *
 * @param Step Distance Y
 * @type number
 * @default 48
 * @desc Jarak maju (ke atas layar). Nilai dipakai negatif (Y - distance).
 *
 * @param Step Delay Frames
 * @type number
 * @default 1
 * @desc Delay kecil sebelum maju (mencegah "geser turun" di frame awal).
 *
 * @param Move On Attack
 * @type boolean
 * @default true
 *
 * @param Move On Skill
 * @type boolean
 * @default true
 *
 * @param Move On Item
 * @type boolean
 * @default false
 *
 * @param Move On Guard
 * @type boolean
 * @default false
 *
 * @param Return Speed
 * @type number
 * @default 12
 * @desc Kecepatan kembali (semakin kecil semakin cepat).
 *
 * @param ---HUD Layout---
 * @default
 *
 * @param Base X
 * @type number
 * @default 170
 *
 * @param Base Y
 * @type number
 * @default 610
 *
 * @param Slot Spacing X
 * @type number
 * @default 360
 *
 * @param Scale %
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param Circle Portrait
 * @type boolean
 * @default true
 *
 * @param Portrait Size
 * @type number
 * @default 256
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
 * @param Slot BG Opacity
 * @type number
 * @min 0
 * @max 255
 * @default 80
 *
 * @param Active Ring
 * @type boolean
 * @default true
 *
 * @param ---Command Windows---
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
 */

(function(){
  "use strict";
  var PN = "IBS_AllInOne_RearViewHUD";
  var P = PluginManager.parameters(PN);
  function N(k,d){ return Number(P[k]||d); }
  function S(k,d){ return String(P[k]||d); }
  function B(k,d){ return String(P[k]||String(d))==="true"; }

  // -------- Rear-View Params --------
  var RV_ON   = B("RearView Enabled",true);
  var RV_DIST = Math.max(0, N("Step Distance Y",48));
  var RV_DELAY= Math.max(0, N("Step Delay Frames",1));
  var RV_RSPD = Math.max(1, N("Return Speed",12));
  var RV_M_AT = B("Move On Attack",true);
  var RV_M_SK = B("Move On Skill",true);
  var RV_M_IT = B("Move On Item",false);
  var RV_M_GU = B("Move On Guard",false);

  // -------- HUD Params --------
  var BASE_X = N("Base X",170);
  var BASE_Y = N("Base Y",610);
  var SPX    = N("Slot Spacing X",360);
  var SCALE  = N("Scale %",100)/100;
  var CIRCLE = B("Circle Portrait",true);
  var PSZ    = N("Portrait Size",256);
  var DRAW_NAME = B("Draw Name",true);
  var NAME_OX   = N("Name Offset X",80);
  var NAME_OY   = N("Name Offset Y",-70);

  var GW   = N("Gauge Width",200);
  var GH   = N("Gauge Height",10);
  var GSY  = N("Gauge Spacing Y",16);
  var HPc  = S("HP Color","#FF6B6B");
  var MPc  = S("MP Color","#4DB5FF");
  var TPc  = S("TP Color","#4ED1A1");
  var DRAW_TP = B("Draw TP",true);
  var GOX  = N("Gauge Offset X",80);
  var GOY  = N("Gauge Offset Y",-40);

  var BG_OP = N("Slot BG Opacity",80);
  var RING  = B("Active Ring",true);

  var CMD_X = N("Command Right X",980);
  var CMD_Y = N("Command Right Y",280);
  var CMD_W = N("Command Width",260);
  var CMD_O = N("Command Opacity",200);
  var PCMDY = N("PartyCmd Y",560);
  var HIDE_STATUS = B("Hide Default Status Window",true);
  var STAT_OP     = N("Status Window Opacity",0);

  // ---------- Notetag: portrait ----------
  var _DM_extract = DataManager.extractMetadata;
  DataManager.extractMetadata = function(obj){
    _DM_extract.call(this,obj);
    if (obj && obj.note){
      var m = obj.note.match(/<NEP_Portrait:\s*(.+?)\s*>/i);
      if (m) obj._nepPortrait = m[1].trim();
    }
  };

  // =========================================================
  // =============== REAR-VIEW MOVEMENT (VERTICAL) ===========
  // =========================================================
  function actorSpriteOf(battler){
    const scene = SceneManager._scene;
    const set = scene && scene._spriteset;
    const arr = set && set._actorSprites;
    if (!arr) return null;
    for (var i=0;i<arr.length;i++) if (arr[i] && arr[i]._battler===battler) return arr[i];
    return null;
  }

  // Override ONLY actor's stepForward/back to be vertical.
  const _SpriteActor_stepForward = Sprite_Actor.prototype.stepForward;
  Sprite_Actor.prototype.stepForward = function(){
    if (!RV_ON) return _SpriteActor_stepForward.call(this);
    // Move along Y only (upwards)
    this.startMove(0, -RV_DIST, 12);
  };
  const _SpriteActor_stepBack = Sprite_Actor.prototype.stepBack;
  Sprite_Actor.prototype.stepBack = function(){
    if (!RV_ON) return _SpriteActor_stepBack.call(this);
    // Return to home
    var dx = this._homeX - this.x;
    var dy = this._homeY - this.y;
    var sp = RV_RSPD;
    this.startMove(dx, dy, sp);
  };

  // Flags per sprite
  function clearRvFlags(s){ if(!s)return; s._rv_allowAdvance=false; s._rv_advanced=false; }

  // Hanya maju untuk Attack/Skill (atau sesuai param)
  function shouldAdvance(action){
    if (!RV_ON || !action) return false;
    if (action.isAttack() && RV_M_AT) return true;
    if (action.isSkill()  && RV_M_SK) return true;
    if (action.isItem()   && RV_M_IT) return true;
    if (action.isGuard()  && RV_M_GU) return true;
    return false;
  }

  // Atur maju saat aksi DIMULAI (bukan saat input).
  const _BM_startAction = BattleManager.startAction;
  BattleManager.startAction = function(){
    _BM_startAction.call(this);
    var subj = this._subject;
    if (subj && subj.isActor && subj.isActor()){
      var spr = actorSpriteOf(subj);
      if (spr){
        // reset ring will be handled by HUD; set flags:
        spr._rv_allowAdvance = shouldAdvance(subj.currentAction());
        spr._rv_advanced = false;
        // delay kecil biar tidak "turun" saat frame pertama
        if (spr._rv_allowAdvance){
          var frames = Math.max(0, RV_DELAY);
          if (frames<=0) { spr.stepForward(); spr._rv_advanced=true; }
          else {
            setTimeout(()=>{ if(spr._rv_allowAdvance && !spr._rv_advanced) { spr.stepForward(); spr._rv_advanced=true; } }, frames*16);
          }
        }
      }
    }
  };

  // Kembali ke posisi semula setelah aksi selesai (apapun hasilnya)
  const _BM_endAction = BattleManager.endAction;
  BattleManager.endAction = function(){
    var subj = this._subject;
    if (subj && subj.isActor && subj.isActor()){
      var spr = actorSpriteOf(subj);
      if (spr && spr._rv_advanced){
        spr.stepBack();
      }
      clearRvFlags(spr);
    }
    _BM_endAction.call(this);
  };

  // Reset flags saat masuk fase input & saat buka Item (fix bug target selection)
  const _BM_startActorInput = BattleManager.startActorInput;
  BattleManager.startActorInput = function(){
    _BM_startActorInput.call(this);
    var a = this.actor && this.actor();
    if (a && a.isActor()){
      clearRvFlags(actorSpriteOf(a));
    }
  };
  const _SB_commandItem = Scene_Battle.prototype.commandItem;
  Scene_Battle.prototype.commandItem = function(){
    const arr = this._spriteset && this._spriteset._actorSprites || [];
    arr.forEach(clearRvFlags);
    _SB_commandItem.call(this);
  };

  // =========================================================
  // ===================== HUD NEPTUNIA ======================
  // =========================================================

  // Pindah command windows (kanan) + status window
  const _SB_createAllWindows = Scene_Battle.prototype.createAllWindows;
  Scene_Battle.prototype.createAllWindows = function(){
    _SB_createAllWindows.call(this);

    if (this._actorCommandWindow){
      this._actorCommandWindow.x = CMD_X;
      this._actorCommandWindow.y = CMD_Y;
      this._actorCommandWindow.width = CMD_W;
      this._actorCommandWindow.opacity = CMD_O;
      this._actorCommandWindow.createContents();
    }
    if (this._partyCommandWindow){
      this._partyCommandWindow.y = PCMDY;
      this._partyCommandWindow.opacity = CMD_O;
    }
    if (this._statusWindow){
      this._statusWindow.opacity = STAT_OP;
      this._statusWindow.visible = !HIDE_STATUS;
    }

    // HUD layer
    this._nepHudLayer = new Sprite();
    this.addChild(this._nepHudLayer);
    this.buildNepHUD();
  };

  const _SB_start = Scene_Battle.prototype.start;
  Scene_Battle.prototype.start = function(){
    _SB_start.call(this);
    this.refreshNepHUD();
  };

  Scene_Battle.prototype.buildNepHUD = function(){
    if (this._nepHudSlots){
      this._nepHudSlots.forEach(s => this._nepHudLayer.removeChild(s));
    }
    this._nepHudSlots = [];

    var members = $gameParty.battleMembers();
    for (var i=0;i<members.length;i++){
      var actor = members[i];
      var slot = new Sprite();
      slot.x = Math.floor(BASE_X + SPX*i);
      slot.y = Math.floor(BASE_Y);
      slot.scale.x = slot.scale.y = SCALE;

      // background plate
      var bg = new Sprite(new Bitmap(PSZ+GW+140, PSZ));
      bg.bitmap.paintOpacity = BG_OP;
      bg.bitmap.fillRect(0, PSZ-60, bg.bitmap.width, 60, "#000000");
      bg.bitmap.paintOpacity = 255;
      slot.addChild(bg);

      // portrait
      var fname = actor.actor()._nepPortrait || "";
      var por = new Sprite();
      por.bitmap = fname ? ImageManager.loadPicture(fname) : new Bitmap(PSZ,PSZ);
      por.x=0; por.y=0;

      if (CIRCLE){
        var g = new PIXI.Graphics();
        g.beginFill(0xFFFFFF);
        g.drawCircle(PSZ/2, PSZ/2, PSZ/2);
        g.endFill();
        por.mask = g;
        por.addChild(g);
      }
      por._fitCheck = function(){
        if(!this.bitmap || !this.bitmap.isReady()) return false;
        var bw=this.bitmap.width, bh=this.bitmap.height;
        var s = Math.min(PSZ/bw, PSZ/bh);
        this.scale.x=this.scale.y=s;
        this.x=(PSZ-bw*s)/2; this.y=(PSZ-bh*s)/2;
        return true;
      };
      slot.addChild(por);

      // name
      if (DRAW_NAME){
        var nm = new Sprite(new Bitmap(260, 32));
        nm.x = PSZ + NAME_OX;
        nm.y = (PSZ/2) + NAME_OY;
        nm.bitmap.textColor = "#FFFFFF";
        nm.bitmap.outlineColor = "rgba(0,0,0,0.6)";
        nm.bitmap.outlineWidth = 4;
        nm.bitmap.fontSize = 22;
        nm.bitmap.drawText(actor.name(),0,0,260,32,"left");
        slot.addChild(nm);
      }

      // gauges
      function mkGauge(color){
        var sp = new Sprite(new Bitmap(GW, GH));
        sp._color=color; sp._ratio=0;
        sp.refresh=function(){
          var b=this.bitmap; b.clear();
          b.fillRect(0,0,GW,GH,"rgba(0,0,0,0.35)");
          b.fillRect(0,0,Math.max(0,Math.floor(GW*this._ratio)),GH,this._color);
        };
        return sp;
      }
      var gy = PSZ/2 + GOY;
      var gHP = mkGauge(HPc); gHP.x = PSZ+GOX; gHP.y = gy;
      var gMP = mkGauge(MPc); gMP.x = PSZ+GOX; gMP.y = gy + GSY;
      slot.addChild(gHP); slot.addChild(gMP);
      var gTP = null;
      if (DRAW_TP){
        gTP = mkGauge(TPc); gTP.x = PSZ+GOX; gTP.y = gy + GSY*2;
        slot.addChild(gTP);
      }

      // ring aktif
      var ring=null;
      if (RING){
        ring = new Sprite(new Bitmap(PSZ+8, PSZ+8));
        ring.x=-4; ring.y=-4;
        var ctx=ring.bitmap._context;
        ctx.save();
        ctx.strokeStyle="rgba(90,170,255,0.9)";
        ctx.lineWidth=4;
        ctx.beginPath();
        ctx.arc(PSZ/2+4, PSZ/2+4, (PSZ/2), 0, Math.PI*2);
        ctx.stroke();
        ctx.restore();
        ring.bitmap._setDirty();
        ring.visible=false;
        slot.addChild(ring);
      }

      slot._actor=actor;
      slot._por=por; slot._gHP=gHP; slot._gMP=gMP; slot._gTP=gTP; slot._ring=ring;

      this._nepHudLayer.addChild(slot);
      this._nepHudSlots.push(slot);
    }
  };

  Scene_Battle.prototype.refreshNepHUD = function(){
    if(!this._nepHudSlots) return;
    this._nepHudSlots.forEach(s=>{
      if (s && s._por && s._por._fitCheck) s._por._fitCheck();
    });
  };

  const _SB_update = Scene_Battle.prototype.update;
  Scene_Battle.prototype.update = function(){
    _SB_update.call(this);
    this.updateNepHUD();
  };

  Scene_Battle.prototype.updateNepHUD = function(){
    if(!this._nepHudSlots) return;
    var subject = BattleManager._subject;
    this._nepHudSlots.forEach(s=>{
      var a=s._actor; if(!a) return;
      var hpR = a.mhp? (a.hp/a.mhp):0;
      var mpR = a.mmp? (a.mp/a.mmp):0;
      if (s._gHP && s._gHP._ratio!==hpR){ s._gHP._ratio=hpR; s._gHP.refresh(); }
      if (s._gMP && s._gMP._ratio!==mpR){ s._gMP._ratio=mpR; s._gMP.refresh(); }
      if (s._gTP){
        var tpR = a.maxTp ? (a.tp/a.maxTp()) : (a.tp/100);
        if (s._gTP._ratio!==tpR){ s._gTP._ratio=tpR; s._gTP.refresh(); }
      }
      if (s._ring){
        s._ring.visible = (subject && subject.isActor && subject.isActor() && subject.actorId()===a.actorId());
      }
    });
  };

})();