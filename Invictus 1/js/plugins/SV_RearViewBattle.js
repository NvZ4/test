/*:
 * @target MV
 * @plugindesc Side-View rear-view: ubah langkah maju/mundur aktor ke sumbu Y (naik/turun). v1.0
 * @author Elise
 * @help Taruh DI BAWAH YEP_BattleEngineCore.
 * Param gerak bisa diubah di bawah.
 */
(function(){
  'use strict';

  // Besar langkah & kecepatan (px & frame divisor)
  var STEP_FORWARD_X = 0;    // default 0 (jangan geser ke samping)
  var STEP_FORWARD_Y = -24;  // maju = naik ke atas
  var STEP_SPEED_DIV  = 12;  // makin kecil makin cepat

  // Maju saat dipilih/menyerang
  Sprite_Actor.prototype.stepForward = function() {
    this.startMove(STEP_FORWARD_X, STEP_FORWARD_Y, STEP_SPEED_DIV);
  };

  // Mundur balik ke home
  const _Sprite_Actor_stepBack = Sprite_Actor.prototype.stepBack;
  Sprite_Actor.prototype.stepBack = function() {
    // pastikan balik tepat ke home (tanpa sisa offset X)
    this.setHome(this._homeX, this._homeY);
    _Sprite_Actor_stepBack.call(this);
  };

  // (Opsional) kecilkan “goyang idle” MV: bekukan pattern saat wait/guard
  const _updateMotionCount = Sprite_Actor.prototype.updateMotionCount;
  Sprite_Actor.prototype.updateMotionCount = function() {
    if (this._motion && (this._motion.name === 'wait' || this._motion.name === 'guard')) {
      this._pattern = 1; // frame tengah
      return;
    }
    _updateMotionCount.call(this);
  };
})();