"use strict";

import { Sprite } from "../components/sprite.js";

/**
 * Creates an Alien character.
 */
class Alien extends Sprite {
  /**
   * @param canvas (HTMLElement) The HTML element where Alien will be rendered. Must have "relative" position.
   * @param size (number) Aliens are rendered as squares, with all sides equal.
   */
  constructor(canvas, size = 1) {
    super(canvas);

    // There are 10 alien types.
    // The sprites are arranged in a single row, so we only need to worry about
    //   the y-axis when using the correct background position.
    const type = Math.floor(Math.random() * 10);
    const name = "alien";

    this.setSize(size, size)
      .setName(name)
      .setSteps([
        () => {
          this.el.style.backgroundPositionY = `-${type * (size * 2)}px`;
        },
        () => {
          this.el.style.backgroundPositionY = `-${type * (size * 2) + size}px`;
        },
      ]);

    this.dead = false;

    this.pressListener = () => {};
  }

  /**
   * Function to execute when an Alien is pressed (mouse click or screen tap)
   * @param callbackFn The callback function. The function will have the Alien instance as the parameter.
   * @example
   * const alien = new Alien(canvas, 10)
   * alien.onPress((thisAlienInstance) => {
   *   alien.explode();
   * });
   */
  onPress(callbackFn) {
    // Store it so it can be removed later when this instance is destroyed
    this.pressListener = callbackFn;
    this.el.addEventListener("click", () => {
      this.pressListener(this);
    });

    return this;
  }

  /**
   * Changes the Alien to an explosion icon.
   * Also clean-ups any event listeners to this Alien, to prepare for the cleanup.
   * Run before `.destroy`.
   */
  explode() {
    this.el.style.backgroundPositionY = `-${12 * (this.size.height * 2)}px`;
    this.el.removeEventListener("click", () => {
      this.pressListener(this);
    });
    this.pressListener = () => {};
    this.dead = true;
  }
}

export { Alien };
