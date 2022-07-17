"use strict";

// https://www.sobyte.net/post/2022-02/js-crypto-randomuuid/
// crypto.UUID() does not work in iOS 15.4 Safari so we have to "ponyfill" it
const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Base class for creating a character.
 */
class Sprite {
  static instances = new Map();

  /**
   * @param canvas (HTMLElement) The HTML element where the Sprite will be rendered. Must have "relative" position.
   */
  constructor(canvas) {
    // If this instance is destroyed, it's easier to locate on the Map.
    this.uuid = crypto.randomUUID?.() || uuidv4();

    this.canvas = canvas;

    // Sprites will be HTML divs.
    this.el = document.createElement("div");

    this.coords = {
      x: 0,
      y: 0,
    };

    this.size = {
      width: 0,
      height: 0,
    };

    this.steps = {
      array: [],
      counter: 0,
    };

    // When this class is instantiated, store this instance in the `instances` Map
    Sprite.instances.set(this.uuid, this);
  }

  /**
   * Set a name for this instance.
   * @param name (string) Name of this instance
   */
  setName(name) {
    this.name = name;
    this.el.className = name;

    return this;
  }

  /**
   * Set the size of this instance in pixels.
   * @param (number) width. The default value is 1px.
   * @param (number) height. The default value is 1px.
   */
  setSize(width = 1, height = 1) {
    this.el.style.width = `${width}px`;
    this.el.style.height = `${height}px`;
    this.size.width = width;
    this.size.height = height;

    return this;
  }

  /**
   * Move this instance in the canvas.
   * Note that this instance will move relative to its current position, not a location in the canvas.
   * @param x (number) x-axis
   * @param y (number) y-axis
   * @param performStep (boolean) Perform a defined step when moving. The default value is `true`.
   * @example Current position is [100, 100]. Calling `move(10, 10)` will move this instance to [110, 110] of
   *   the canvas.
   */
  move(x = 0, y = 0, performStep = true) {
    this.coords.x = this.coords.x + x;
    this.coords.y = this.coords.y + y;
    this.el.style.transform = `translate(${this.coords.x}px, ${this.coords.y}px)`;

    if (performStep) this.performStep();

    return this;
  }

  /**
   * Array of steps this instance will perform when moving.
   * Each `move` call will run a single step and a single step only.
   * Each `move` call will cycle through all the steps and will loop back into the first step after the last step has
   *   been performed.
   * @param stepFnArray (array) An array of steps. A step is a function with this class instance as the parameter.
   * @example
   * const person = new Sprite(document.getElementById("canvas"));
   * person.setSteps([
   *   (thisInstance) => {
   *     console.log("first step");
   *     thisInstance.setName("John");
   *   },
   *   (thisInstance) => {
   *     console.log("second step");
   *     thisInstance.setName("Doe");
   *   },
   * ])
   */
  setSteps(stepFnArray = []) {
    this.steps.array = stepFnArray;

    return this;
  }

  /**
   * Perform a step defined in `setSteps`.
   */
  performStep() {
    if (this.steps.array.length) {
      const counter = this.steps.counter;

      // fn signature: (thisClassInstance) => void
      // Each function in the array will have access to `this`.
      this.steps.array[counter](this);

      // If the last step has been performed, the counter will reset back to 0
      // and the next call will run the first step
      if (counter === this.steps.array.length - 1) {
        this.steps.counter = 0;
      } else {
        this.steps.counter = counter + 1;
      }
    }

    return this;
  }

  /**
   * Render this class instance into the canvas. You can optionally specify with location in the canvas this class
   *   will render in pixels.
   * @param x (number) x-axis. The default value is 0px.
   * @param y (number) y-axis. The default value is 0px.
   * @param performFirstStep (boolean). Should rendering automatically perform the first step. Default is `true`.
   */
  render(x = 0, y = 0, performFirstStep = true) {
    this.el.style.position = "absolute";
    this.move(x, y, performFirstStep);
    this.canvas.appendChild(this.el);

    return this;
  }

  /**
   * Remove this class instance from the canvas.
   */
  destroy() {
    this.canvas.removeChild(this.el);
    Sprite.instances.delete(this.uuid);
  }
}

export { Sprite };
