// TODO
// OPTIMIZE MULTIPLIER FACTOR ON DESKTOP NAVIGATOR
// SCROLL BAR


var Scr9ller = (function() {
  'use strict';
  //============================================================================
  // Helper Method
  //============================================================================

  var _getElement = function(object) {

    if (typeof object === 'string') {

      if (object.indexOf('.') === 0) {

        return document.getElementsByClassName(object.split('.')[1])[0];

      } else if (object.indexOf('#') === 0) {

        return document.getElementById(object.split('#')[1]);

      }

    } else if (typeof object === 'object') {

      return object;

    } else {

      throw 'Object is not a type of NodeList or undefined.'

    }

  };

  Number.prototype.round = function(p) {
    p = p || 10;
    return parseFloat( this.toFixed(p) );
  };

  //============================================================================
  // Event Value Multiplier
  //============================================================================

  var _multiplier = {
    // Mutiply the touch action by two making the scroll a bit faster than finger movement
    touchMult: 2,
    // Firefox on Windows needs a boost, since scrolling is very slow
    firefoxMult: 15,
    // How many pixels to move with each key press
    keyStep: 120,
    // General multiplier for all mousehweel including FF
    mouseMult: 1
  };

  var touchStartX, touchStartY;

  //============================================================================
  // Event Variables Tester
  //============================================================================

  var _hasWheelEvent = 'onwheel' in document;
  var _hasMouseWheelEvent = 'onmousewheel' in document;
  var _hasTouch = 'ontouchstart' in document;
  var _hasTouchWin = navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1;
  var _hasPointer = !!window.navigator.msPointerEnabled;
  var _hasKeyDown = 'onkeydown' in document;

  //============================================================================
  // User Agent Tester
  //============================================================================

  var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

  //============================================================================
  // Contextual Variable
  //============================================================================

  // ---- MS ---- //

  var bodyTouchAction = null;

  //============================================================================
  // Notify Function
  //============================================================================

  var _notify = function(e) {
    this.event.x += this.event.deltaX;
    this.event.y += this.event.deltaY;
    this.event.originalEvent = e;

    for (var i = 0; i < this.numListeners; i++) {
      this.listeners[i](this.event);
    }

  };


  //============================================================================
  // Event Callback Handler
  //============================================================================

  var _onWheel = function(event) {
    var _evt = this.event;
    var _opt = this.options;
    // In Chrome and in Firefox (at least the new one)
    _evt.deltaX = event.wheelDeltaX || event.deltaX * -1;
    _evt.deltaY = event.wheelDeltaY || event.deltaY * -1;

    // for our purpose deltamode = 1 means user is on a wheel mouse, not touch pad
    // real meaning: https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent#Delta_modes
    if (isFirefox && event.deltaMode == 1) {
      _evt.deltaX *= _opt.firefoxMult;
      _evt.deltaY *= _opt.firefoxMult;
    }

    _evt.deltaX *= _opt.mouseMult;
    _evt.deltaY *= _opt.mouseMult;

    _notify.call(this, event);

  };

  var _onMouseWheel = function(event) {
    var _evt = this.event;
    // In Safari, IE and in Chrome if 'wheel' isn't defined
    _evt.deltaX = (event.wheelDeltaX) ? event.wheelDeltaX : 0;
    _evt.deltaY = (event.wheelDeltaY) ? event.wheelDeltaY : event.wheelDelta;

    _notify.call(this, e);

  };

  var _onTouchStart = function(event) {

    var t = (event.targetTouches) ? event.targetTouches[0] : event;
    touchStartX = t.pageX;
    touchStartY = t.pageY;

    _notify.call(this, event);

  }

  var _onTouchMove = function(event) {
    var _evt = this.event;
    var _opt = this.options;
    var t = (event.targetTouches) ? event.targetTouches[0] : e;

    _evt.deltaX = (t.pageX - touchStartX) * _opt.touchMult;
    _evt.deltaY = (t.pageY - touchStartY) * _opt.touchMult;

    touchStartX = t.pageX;
    touchStartY = t.pageY;

    _notify.call(this, event);

  };

  var _onKeyDown = function(event) {
    var _evt = this.event;
    var _opt = this.options;

    _evt.deltaX = _evt.deltaY = 0;
    switch (event.keyCode) {
      case 37:
        _evt.deltaX = -_opt.keyStep;
        break;
      case 39:
        _evt.deltaX = _opt.keyStep;
        break;
      case 38:
        _evt.deltaY = _opt.keyStep;
        break;
      case 40:
        _evt.deltaY = -_opt.keyStep;
        break;
    }

    _notify.call(this, event);

  };

  //============================================================================
  // Bind listener on selected element
  //============================================================================

  var _bind = function(element) {
    var _this = this;
    if (_hasWheelEvent) {
      element.addEventListener('wheel', _onWheel.bind(_this));
    }

    if (_hasMouseWheelEvent) {
      element.addEventListener('mousewheel', _onWheel.bind(_this));
    }

    if (_hasTouch) {

      // TO DO //
      document.ontouchmove = function(event){
        event.preventDefault();
      }
      // TO DO //

      element.addEventListener('touchstart', _onTouchStart.bind(_this));
      element.addEventListener('touchmove', _onTouchMove.bind(_this));
    }

    if (_hasPointer && _hasTouchWin) {
      bodyTouchAction = element.style.msTouchAction;
      element.style.msTouchAction = 'none';
      element.addEventListener('MSPointerDown', _onTouchStart.bind(_this));
      element.addEventListener('MSPointerMove', _onTouchMove.bind(_this));
    }

    if (_hasKeyDown) {
      element.addEventListener('keydown', _onKeyDown.bind(_this));
    }

    this.initialized = true;
  };

  //============================================================================
  // Bind listener on selected element
  //============================================================================

  var _unbind = function(element) {
    var _this = this;
    if (_hasWheelEvent) {
      element.removeEventListener('wheel', _onWheel.bind(_this));
    }

    if (_hasMouseWheelEvent) {
      element.removeEventListener('mousewheel', _onWheel.bind(_this));
    }

    if (_hasTouch) {
      element.removeEventListener('touchstart', _onTouchStart.bind(_this));
      element.removeEventListener('touchmove', _onTouchMove.bind(_this));
    }

    if (_hasPointer && _hasTouchWin) {
      element.style.msTouchAction = bodyTouchAction;
      element.removeEventListener('MSPointerDown', _onTouchStart.bind(_this));
      element.removeEventListener('MSPointerMove', _onTouchMove.bind(_this));
    }

    if (_hasKeyDown) {
      element.removeEventListener('keydown', _onKeyDown, false);
    }

    this.initialized = false;
  };

  //============================================================================
  // Destroy Instance
  //============================================================================

  return {

    // Create distinct instances w/ Cust9mScroll.create();
    create: function(element, options) {
      var el = _getElement(element);
      // var opt = options;
      var obj = Object.create(this);

      // Obj Parameters --------------------------------------------------------
      obj.initialized = false;
      obj.event = {
        target: el,
        y: 0,
        x: 0,
        deltaX: 0,
        deltaY: 0,
        originalEvent: null
      };

      obj.options = {};

      // Obj Parameters --------------------------------------------------------

      obj.options.keyStep = (options) ? options.keyStep || 120 : 120;
      obj.options.firefoxMult = (options) ? options.firefoxMult || 20 : 20;
      obj.options.touchMult = (options) ? options.touchMult || 2 : 2;
      obj.options.mouseMult = (options) ? options.mouseMult || 0.5: 0.5;

      // Obj Listener Callback -------------------------------------------------

      obj.listeners = [];
      obj.numListeners = 0;

      // Obj Methods -----------------------------------------------------------

      obj.unbind = _unbind.bind(obj, obj.event.target);

      obj.bind = _bind.bind(obj, obj.event.target);

      obj.on = function(f) {
        if (!this.initialized) {
          this.bind.call(this, this.event.target);
        }
        this.listeners.push(f);
        this.numListeners = this.listeners.length;
      };

      obj.off = function(f) {
        this.listeners.splice(f, 1);
        this.numListeners = this.listeners.length;
        if (this.numListeners <= 0) {
          this.unbind();
        }
      };

      obj.resize = function(){
        var target = this.event.target;

        if(this.scroll){
          var inner = this.event.target.children[0];
          this.scroll.containerHeight = target.clientHeight;
          this.scroll.innerHeight = inner.clientHeight;
        }

      };
      // Smooth Scroll Methods -------------------------------------------------


      obj.initScroll = function(){
        var _t = this;
        var target = _t.event.target;
        var inner = _t.event.target.children[0];
        var currentY = 0;
        var ease = 0.15;

        _t.scroll = {};

        _t.scroll.requestId = undefined;
        _t.scroll.containerHeight = target.clientHeight;
        _t.scroll.innerHeight = inner.clientHeight;
        _t.scroll.targetY = 0;
        _t.scroll.relativeY = 0;
        _t.scroll.maxY = ( _t.scroll.innerHeight - _t.scroll.containerHeight ) * -1;

        _t.scroll.loop = function(){

          currentY += (this.targetY - currentY) * ease;
          this.relativeY = (currentY / this.maxY).round(2);

          var t = 'translateY(' + currentY + 'px) translateZ(0)';
          var s = inner.style;

          s["transform"] = t;
          s["webkitTransform"] = t;
          s["mozTransform"] = t;
          s["msTransform"] = t;

          this.requestId = window.requestAnimationFrame(this.loop.bind(this));
        };

        _t.scroll.start = function(){
          if (!this.requestId) {
            this.loop();
          }
        };

        _t.scroll.stop = function(){
          if (this.requestId) {
             window.cancelAnimationFrame(this.requestId);
             this.requestId = undefined;
          }
        };

        _t.on(function(event){

          var p = _t.scroll;
          p.targetY += event.deltaY;

          p.targetY = Math.max(p.targetY, p.maxY);
          p.targetY = Math.min(p.targetY,  0 );

        });

        _t.scroll.start();

      };

      // Obj Initialization ----------------------------------------------------
      _bind.call(obj, el);

      return obj;
    },
  };

})();

module.exports = Scr9ller;
