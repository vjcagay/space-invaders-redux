import { Missile } from "../characters/missile.js";
import { store } from "../store.js";

const fireMissile = (canvas, turret) => {
  // Let's load the missile
  const missile = new Missile(canvas);

  // We want the missile to show in the middle of the turret
  const missileXAxis =
    turret.coords.x + (turret.size.width / 2 - missile.size.width / 2);

  // Let's add some 10px so that the missile will render above the turret
  const missileYAxis = store.canvasHeight - turret.size.height - 10;

  // Fire away
  missile.render(missileXAxis, missileYAxis);

  return missile;
};

export { fireMissile };
