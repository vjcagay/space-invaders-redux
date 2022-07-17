"use strict";

import { Sprite } from "../components/sprite.js";

/**
 * Create a Turret character.
 */
class Turret extends Sprite {
  constructor(canvas) {
    super(canvas);

    const name = "turret";
    const size = 30;

    this.setSize(size, size).setName(name);
    this.el.style.backgroundPositionY = `-${size * 21}px`;
  }
  explode() {
    this.el.style.backgroundPositionY = `-${this.size.height * 22}px`;
  }
}

export { Turret };
