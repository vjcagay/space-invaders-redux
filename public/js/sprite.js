"use strict";

class Sprite {
  static instances = new Map();

  constructor(canvas) {
    this.uuid = crypto.randomUUID();
    this.canvas = canvas;
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

    Sprite.instances.set(this.uuid, this);
  }

  setName(name) {
    this.name = name;

    return this;
  }

  setSize(width = 1, height = 1) {
    this.el.style.width = `${width}px`;
    this.el.style.height = `${height}px`;
    this.size.width = width;
    this.size.height = height;

    return this;
  }

  move(x = 0, y = 0, performStep = true) {
    this.coords.x = this.coords.x + x;
    this.coords.y = this.coords.y + y;
    this.el.style.transform = `translate(${this.coords.x}px, ${this.coords.y}px)`;

    if (performStep) this.performStep();

    return this;
  }

  // Array of callback functions that gets called for each move() call.
  // fn signature: (thisSpriteInstance) => void
  setSteps(stepFnArray = []) {
    this.steps.array = stepFnArray;

    return this;
  }

  performStep() {
    // Perform a step
    if (this.steps.array.length) {
      const counter = this.steps.counter;

      // fn signature: (thisSpriteInstance) => void
      // Each function in the array will have access to "this".
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

  onCollision(callback) {
    callback?.(this);
    return this;
  }

  render(x = 0, y = 0) {
    this.el.style.position = "absolute";
    this.move(x, y, false);
    this.canvas.appendChild(this.el);

    return this;
  }

  destroy() {
    this.canvas.removeChild(this.el);
    Sprite.instances.delete(this.uuid);
  }
}

export { Sprite };
