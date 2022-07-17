"use strict";

const moveTurretToTarget = (turret, target) => {
  const targetXAxis = target.coords.x;
  const targetWidth = target.size.width;

  const turretXAxis = turret.coords.x;
  const turretWidth = turret.size.width;

  /**
   *    _______
   *  @| ALIEN |@
   *   |_______|
   *
   *       *
   *      _|_  <-- Turret must move to the alien's center
   */
  const xAxisValueToMoveInto = targetWidth / 2 - turretWidth / 2 + targetXAxis;

  // Turret move sideways
  turret.move(xAxisValueToMoveInto - turretXAxis, 0);
};

export { moveTurretToTarget };
