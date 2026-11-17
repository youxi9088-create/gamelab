!(function () {
  "use strict";
  function t(e) {
    return (t =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (t) {
            return typeof t;
          }
        : function (t) {
            return t &&
              "function" == typeof Symbol &&
              t.constructor === Symbol &&
              t !== Symbol.prototype
              ? "symbol"
              : typeof t;
          })(e);
  }
  function e(i) {
    return (e =
      "function" == typeof Symbol && "symbol" == t(Symbol.iterator)
        ? function (e) {
            return t(e);
          }
        : function (e) {
            return e &&
              "function" == typeof Symbol &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? "symbol"
              : t(e);
          })(i);
  }
  function i(t, e, o) {
    return (i =
      "undefined" != typeof Reflect && Reflect.get
        ? Reflect.get
        : function (t, e, i) {
            var o = (function (t, e) {
              for (
                ;
                !Object.prototype.hasOwnProperty.call(t, e) &&
                null !== (t = r(t));
              );
              return t;
            })(t, e);
            if (o) {
              var n = Object.getOwnPropertyDescriptor(o, e);
              return n.get ? n.get.call(i) : n.value;
            }
          })(t, e, o || t);
  }
  function o(t, e) {
    for (var i = 0; i < e.length; i++) {
      var o = e[i];
      ((o.enumerable = o.enumerable || !1),
        (o.configurable = !0),
        "value" in o && (o.writable = !0),
        Object.defineProperty(t, o.key, o));
    }
  }
  function n(t, e, i) {
    return (e && o(t.prototype, e), i && o(t, i), t);
  }
  function s(t, i) {
    return !i || ("object" !== e(i) && "function" != typeof i)
      ? (function (t) {
          if (void 0 === t)
            throw new ReferenceError(
              "this hasn't been initialised - super() hasn't been called",
            );
          return t;
        })(t)
      : i;
  }
  function r(t) {
    return (r = Object.setPrototypeOf
      ? Object.getPrototypeOf
      : function (t) {
          return t.__proto__ || Object.getPrototypeOf(t);
        })(t);
  }
  function a(t, e) {
    if ("function" != typeof e && null !== e)
      throw new TypeError("Super expression must either be null or a function");
    ((t.prototype = Object.create(e && e.prototype, {
      constructor: { value: t, writable: !0, configurable: !0 },
    })),
      e &&
        (function (t, e) {
          (
            Object.setPrototypeOf ||
            function (t, e) {
              return ((t.__proto__ = e), t);
            }
          )(t, e);
        })(t, e));
  }
  function h(t, e) {
    if (!(t instanceof e))
      throw new TypeError("Cannot call a class as a function");
  }
  !(function (t, e) {
    var o = function t() {
      h(this, t);
    };
    ((o.RigidBody = null), (o.Physics = null));
    var l = (function (t) {
      function i() {
        var t;
        return (
          h(this, i),
          ((t = s(this, r(i).apply(this, arguments)))._isSensor = !1),
          (t._density = 10),
          (t._friction = 0.2),
          (t._restitution = 0),
          t
        );
      }
      return (
        a(i, t),
        n(i, [
          {
            key: "getDef",
            value: function () {
              if (!this._def) {
                var t = new window.box2d.b2FixtureDef();
                ((t.density = this.density),
                  (t.friction = this.friction),
                  (t.isSensor = this.isSensor),
                  (t.restitution = this.restitution),
                  (t.shape = this._shape),
                  (this._def = t));
              }
              return this._def;
            },
          },
          {
            key: "_onEnable",
            value: function () {
              this.rigidBody
                ? this.refresh()
                : e.Laya.systemTimer.callLater(this, this._checkRigidBody);
            },
          },
          {
            key: "_checkRigidBody",
            value: function () {
              if (!this.rigidBody) {
                var t = this.owner.getComponent(o.RigidBody);
                t && ((this.rigidBody = t), this.refresh());
              }
            },
          },
          {
            key: "_onDestroy",
            value: function () {
              this.rigidBody &&
                (this.fixture &&
                  (this.fixture.GetBody() == this.rigidBody._getOriBody() &&
                    this.rigidBody.body.DestroyFixture(this.fixture),
                  (this.fixture = null)),
                (this.rigidBody = null),
                (this._shape = null),
                (this._def = null));
            },
          },
          {
            key: "refresh",
            value: function () {
              if (this.enabled && this.rigidBody) {
                var t = this.rigidBody.body;
                this.fixture &&
                  (this.fixture.GetBody() == this.rigidBody.body &&
                    this.rigidBody.body.DestroyFixture(this.fixture),
                  this.fixture.Destroy(),
                  (this.fixture = null));
                var e = this.getDef();
                ((e.filter.groupIndex = this.rigidBody.group),
                  (e.filter.categoryBits = this.rigidBody.category),
                  (e.filter.maskBits = this.rigidBody.mask),
                  (this.fixture = t.CreateFixture(e)),
                  (this.fixture.collider = this));
              }
            },
          },
          { key: "resetShape", value: function () {} },
          {
            key: "isSensor",
            get: function () {
              return this._isSensor;
            },
            set: function (t) {
              ((this._isSensor = t),
                this._def && ((this._def.isSensor = t), this.refresh()));
            },
          },
          {
            key: "density",
            get: function () {
              return this._density;
            },
            set: function (t) {
              ((this._density = t),
                this._def && ((this._def.density = t), this.refresh()));
            },
          },
          {
            key: "friction",
            get: function () {
              return this._friction;
            },
            set: function (t) {
              ((this._friction = t),
                this._def && ((this._def.friction = t), this.refresh()));
            },
          },
          {
            key: "restitution",
            get: function () {
              return this._restitution;
            },
            set: function (t) {
              ((this._restitution = t),
                this._def && ((this._def.restitution = t), this.refresh()));
            },
          },
          {
            key: "isSingleton",
            get: function () {
              return !1;
            },
          },
        ]),
        i
      );
    })(e.Component);
    (e.ClassUtils.regClass("laya.physics.ColliderBase", l),
      e.ClassUtils.regClass("Laya.ColliderBase", l));
    var c = (function (t) {
      function i() {
        var t;
        return (
          h(this, i),
          ((t = s(this, r(i).apply(this, arguments)))._type = "dynamic"),
          (t._allowSleep = !0),
          (t._angularVelocity = 0),
          (t._angularDamping = 0),
          (t._linearVelocity = { x: 0, y: 0 }),
          (t._linearDamping = 0),
          (t._bullet = !1),
          (t._allowRotation = !0),
          (t._gravityScale = 1),
          (t.group = 0),
          (t.category = 1),
          (t.mask = -1),
          (t.label = "RigidBody"),
          t
        );
      }
      return (
        a(i, t),
        n(i, [
          {
            key: "_createBody",
            value: function () {
              if (!this._body && this.owner) {
                var t = this.owner,
                  i = window.box2d,
                  n = new i.b2BodyDef(),
                  s = t.localToGlobal(
                    e.Point.TEMP.setTo(0, 0),
                    !1,
                    o.Physics.I.worldRoot,
                  );
                (n.position.Set(
                  s.x / o.Physics.PIXEL_RATIO,
                  s.y / o.Physics.PIXEL_RATIO,
                ),
                  (n.angle = e.Utils.toRadian(t.rotation)),
                  (n.allowSleep = this._allowSleep),
                  (n.angularDamping = this._angularDamping),
                  (n.angularVelocity = this._angularVelocity),
                  (n.bullet = this._bullet),
                  (n.fixedRotation = !this._allowRotation),
                  (n.gravityScale = this._gravityScale),
                  (n.linearDamping = this._linearDamping));
                var r = this._linearVelocity;
                (((r && 0 != r.x) || 0 != r.y) &&
                  (n.linearVelocity = new i.b2Vec2(r.x, r.y)),
                  (n.type = i.b2BodyType["b2_" + this._type + "Body"]),
                  (this._body = o.Physics.I._createBody(n)),
                  this.resetCollider(!1));
              }
            },
          },
          {
            key: "_onAwake",
            value: function () {
              this._createBody();
            },
          },
          {
            key: "_onEnable",
            value: function () {
              var t = this;
              (this._createBody(),
                e.Laya.physicsTimer.frameLoop(1, this, this._sysPhysicToNode));
              var i = this.owner;
              this.accessGetSetFunc(i, "x", "set") &&
                !i._changeByRigidBody &&
                ((i._changeByRigidBody = !0),
                this._overSet(i, "x", function (e) {
                  (t.accessGetSetFunc(i, "x", "set")(e), t._sysPosToPhysic());
                }),
                this._overSet(i, "y", function (e) {
                  (t.accessGetSetFunc(i, "y", "set")(e), t._sysPosToPhysic());
                }),
                this._overSet(i, "rotation", function (e) {
                  (t.accessGetSetFunc(i, "rotation", "set")(e),
                    t._sysNodeToPhysic());
                }),
                this._overSet(i, "scaleX", function (e) {
                  (t.accessGetSetFunc(i, "scaleX", "set")(e),
                    t.resetCollider(!0));
                }),
                this._overSet(i, "scaleY", function (e) {
                  (t.accessGetSetFunc(i, "scaleY", "set")(e),
                    t.resetCollider(!0));
                }));
            },
          },
          {
            key: "accessGetSetFunc",
            value: function (t, e, i) {
              if (-1 !== ["get", "set"].indexOf(i)) {
                var o = "_$".concat(i, "_").concat(e);
                if (t[o]) return t[o];
                for (var n, s = t.constructor; s;) {
                  if (
                    (n = Object.getOwnPropertyDescriptor(s.prototype, e)) &&
                    n[i]
                  ) {
                    t[o] = n[i].bind(t);
                    break;
                  }
                  s = Object.getPrototypeOf(s);
                }
                return t[o];
              }
            },
          },
          {
            key: "resetCollider",
            value: function (t) {
              var e = this.owner.getComponents(l);
              if (e)
                for (var i = 0, o = e.length; i < o; i++) {
                  var n = e[i];
                  ((n.rigidBody = this), t ? n.resetShape() : n.refresh());
                }
            },
          },
          {
            key: "_sysPhysicToNode",
            value: function () {
              if ("static" != this.type && this._body.IsAwake()) {
                var t = this._body.GetPosition(),
                  i = this._body.GetAngle(),
                  n = this.owner;
                this.accessGetSetFunc(
                  n,
                  "rotation",
                  "set",
                )(e.Utils.toAngle(i) - n.parent.globalRotation);
                var s = n.globalToLocal(
                  e.Point.TEMP.setTo(
                    t.x * o.Physics.PIXEL_RATIO,
                    t.y * o.Physics.PIXEL_RATIO,
                  ),
                  !1,
                  o.Physics.I.worldRoot,
                );
                ((s.x += n.pivotX),
                  (s.y += n.pivotY),
                  (s = n.toParentPoint(s)),
                  this.accessGetSetFunc(n, "x", "set")(s.x),
                  this.accessGetSetFunc(n, "y", "set")(s.y));
              }
            },
          },
          {
            key: "_sysNodeToPhysic",
            value: function () {
              var t = this.owner;
              this._body.SetAngle(e.Utils.toRadian(t.rotation));
              var i = t.localToGlobal(
                e.Point.TEMP.setTo(0, 0),
                !1,
                o.Physics.I.worldRoot,
              );
              this._body.SetPositionXY(
                i.x / o.Physics.PIXEL_RATIO,
                i.y / o.Physics.PIXEL_RATIO,
              );
            },
          },
          {
            key: "_sysPosToPhysic",
            value: function () {
              var t = this.owner.localToGlobal(
                e.Point.TEMP.setTo(0, 0),
                !1,
                o.Physics.I.worldRoot,
              );
              this._body.SetPositionXY(
                t.x / o.Physics.PIXEL_RATIO,
                t.y / o.Physics.PIXEL_RATIO,
              );
            },
          },
          {
            key: "_overSet",
            value: function (t, e, i) {
              Object.defineProperty(t, e, {
                get: this.accessGetSetFunc(t, e, "get"),
                set: i,
                enumerable: !1,
                configurable: !0,
              });
            },
          },
          {
            key: "_onDisable",
            value: function () {
              (e.Laya.physicsTimer.clear(this, this._sysPhysicToNode),
                this._body && o.Physics.I._removeBody(this._body),
                (this._body = null));
              var t = this.owner;
              t._changeByRigidBody &&
                (this._overSet(t, "x", this.accessGetSetFunc(t, "x", "set")),
                this._overSet(t, "y", this.accessGetSetFunc(t, "y", "set")),
                this._overSet(
                  t,
                  "rotation",
                  this.accessGetSetFunc(t, "rotation", "set"),
                ),
                this._overSet(
                  t,
                  "scaleX",
                  this.accessGetSetFunc(t, "scaleX", "set"),
                ),
                this._overSet(
                  t,
                  "scaleY",
                  this.accessGetSetFunc(t, "scaleY", "set"),
                ),
                (t._changeByRigidBody = !1));
            },
          },
          {
            key: "getBody",
            value: function () {
              return (this._body || this._onAwake(), this._body);
            },
          },
          {
            key: "_getOriBody",
            value: function () {
              return this._body;
            },
          },
          {
            key: "applyForce",
            value: function (t, e) {
              (this._body || this._onAwake(), this._body.ApplyForce(e, t));
            },
          },
          {
            key: "applyForceToCenter",
            value: function (t) {
              (this._body || this._onAwake(), this._body.ApplyForceToCenter(t));
            },
          },
          {
            key: "applyLinearImpulse",
            value: function (t, e) {
              (this._body || this._onAwake(),
                this._body.ApplyLinearImpulse(e, t));
            },
          },
          {
            key: "applyLinearImpulseToCenter",
            value: function (t) {
              (this._body || this._onAwake(),
                this._body.ApplyLinearImpulseToCenter(t));
            },
          },
          {
            key: "applyTorque",
            value: function (t) {
              (this._body || this._onAwake(), this._body.ApplyTorque(t));
            },
          },
          {
            key: "setVelocity",
            value: function (t) {
              (this._body || this._onAwake(), this._body.SetLinearVelocity(t));
            },
          },
          {
            key: "setAngle",
            value: function (t) {
              (this._body || this._onAwake(),
                this._body.SetAngle(t),
                this._body.SetAwake(!0));
            },
          },
          {
            key: "getMass",
            value: function () {
              return this._body ? this._body.GetMass() : 0;
            },
          },
          {
            key: "getCenter",
            value: function () {
              this._body || this._onAwake();
              var t = this._body.GetLocalCenter();
              return (
                (t.x = t.x * o.Physics.PIXEL_RATIO),
                (t.y = t.y * o.Physics.PIXEL_RATIO),
                t
              );
            },
          },
          {
            key: "getWorldCenter",
            value: function () {
              this._body || this._onAwake();
              var t = this._body.GetWorldCenter();
              return (
                (t.x = t.x * o.Physics.PIXEL_RATIO),
                (t.y = t.y * o.Physics.PIXEL_RATIO),
                t
              );
            },
          },
          {
            key: "body",
            get: function () {
              return (this._body || this._onAwake(), this._body);
            },
          },
          {
            key: "type",
            get: function () {
              return this._type;
            },
            set: function (t) {
              ((this._type = t),
                this._body &&
                  this._body.SetType(
                    window.box2d.b2BodyType["b2_" + this._type + "Body"],
                  ));
            },
          },
          {
            key: "gravityScale",
            get: function () {
              return this._gravityScale;
            },
            set: function (t) {
              ((this._gravityScale = t),
                this._body && this._body.SetGravityScale(t));
            },
          },
          {
            key: "allowRotation",
            get: function () {
              return this._allowRotation;
            },
            set: function (t) {
              ((this._allowRotation = t),
                this._body && this._body.SetFixedRotation(!t));
            },
          },
          {
            key: "allowSleep",
            get: function () {
              return this._allowSleep;
            },
            set: function (t) {
              ((this._allowSleep = t),
                this._body && this._body.SetSleepingAllowed(t));
            },
          },
          {
            key: "angularDamping",
            get: function () {
              return this._angularDamping;
            },
            set: function (t) {
              ((this._angularDamping = t),
                this._body && this._body.SetAngularDamping(t));
            },
          },
          {
            key: "angularVelocity",
            get: function () {
              return this._body
                ? this._body.GetAngularVelocity()
                : this._angularVelocity;
            },
            set: function (t) {
              ((this._angularVelocity = t),
                this._body && this._body.SetAngularVelocity(t));
            },
          },
          {
            key: "linearDamping",
            get: function () {
              return this._linearDamping;
            },
            set: function (t) {
              ((this._linearDamping = t),
                this._body && this._body.SetLinearDamping(t));
            },
          },
          {
            key: "linearVelocity",
            get: function () {
              if (this._body) {
                var t = this._body.GetLinearVelocity();
                return { x: t.x, y: t.y };
              }
              return this._linearVelocity;
            },
            set: function (t) {
              t &&
                (t instanceof Array && (t = { x: t[0], y: t[1] }),
                (this._linearVelocity = t),
                this._body &&
                  this._body.SetLinearVelocity(
                    new window.box2d.b2Vec2(t.x, t.y),
                  ));
            },
          },
          {
            key: "bullet",
            get: function () {
              return this._bullet;
            },
            set: function (t) {
              ((this._bullet = t), this._body && this._body.SetBullet(t));
            },
          },
        ]),
        i
      );
    })(e.Component);
    (e.ClassUtils.regClass("laya.physics.RigidBody", c),
      e.ClassUtils.regClass("Laya.RigidBody", c));
    var u = (function () {
        function t() {
          h(this, t);
        }
        return (
          n(t, [
            {
              key: "SayGoodbyeJoint",
              value: function (t) {
                t.m_userData && (t.m_userData.isDestroy = !0);
              },
            },
            { key: "SayGoodbyeFixture", value: function (t) {} },
            { key: "SayGoodbyeParticleGroup", value: function (t) {} },
            { key: "SayGoodbyeParticle", value: function (t) {} },
          ]),
          t
        );
      })(),
      y = (function (t) {
        function i() {
          var t;
          return (
            h(this, i),
            ((t = s(this, r(i).call(this))).box2d = window.box2d),
            (t.velocityIterations = 8),
            (t.positionIterations = 3),
            (t._eventList = []),
            t
          );
        }
        return (
          a(i, t),
          n(
            i,
            [
              {
                key: "start",
                value: function () {
                  var t =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : null;
                  if (!this._enabled) {
                    ((this._enabled = !0), t || (t = {}));
                    var o = window.box2d;
                    if (null == o)
                      return void console.error(
                        "Can not find box2d libs, you should request box2d.js first.",
                      );
                    var n = new o.b2Vec2(0, t.gravity || 500 / i.PIXEL_RATIO);
                    ((this.world = new o.b2World(n)),
                      this.world.SetDestructionListener(new u()),
                      this.world.SetContactListener(new _()),
                      (this.allowSleeping =
                        null == t.allowSleeping || t.allowSleeping),
                      t.customUpdate ||
                        e.Laya.physicsTimer.frameLoop(1, this, this._update),
                      (this._emptyBody = this._createBody(
                        new window.box2d.b2BodyDef(),
                      )));
                  }
                },
              },
              {
                key: "_update",
                value: function () {
                  var t = e.Laya.timer.delta / 1e3;
                  (t > 0.033 && (t = 0.033),
                    this.world.Step(
                      t,
                      this.velocityIterations,
                      this.positionIterations,
                      3,
                    ));
                  var i = this._eventList.length;
                  if (i > 0) {
                    for (var o = 0; o < i; o += 2)
                      this._sendEvent(
                        this._eventList[o],
                        this._eventList[o + 1],
                      );
                    this._eventList.length = 0;
                  }
                },
              },
              {
                key: "_sendEvent",
                value: function (t, o) {
                  var n = o.GetFixtureA().collider,
                    s = o.GetFixtureB().collider,
                    r = n.owner,
                    a = s.owner;
                  if (
                    ((o.getHitInfo = function () {
                      var t = new this.box2d.b2WorldManifold();
                      this.GetWorldManifold(t);
                      var e = t.points[0];
                      return (
                        (e.x *= i.PIXEL_RATIO),
                        (e.y *= i.PIXEL_RATIO),
                        t
                      );
                    }),
                    r)
                  ) {
                    var h = [s, n, o];
                    0 === t
                      ? (r.event(e.Event.TRIGGER_ENTER, h),
                        r._triggered
                          ? r.event(e.Event.TRIGGER_STAY, h)
                          : (r._triggered = !0))
                      : ((r._triggered = !1), r.event(e.Event.TRIGGER_EXIT, h));
                  }
                  a &&
                    ((h = [n, s, o]),
                    0 === t
                      ? (a.event(e.Event.TRIGGER_ENTER, h),
                        a._triggered
                          ? a.event(e.Event.TRIGGER_STAY, h)
                          : (a._triggered = !0))
                      : ((a._triggered = !1),
                        a.event(e.Event.TRIGGER_EXIT, h)));
                },
              },
              {
                key: "_createBody",
                value: function (t) {
                  return this.world
                    ? this.world.CreateBody(t)
                    : (console.error(
                        'The physical engine should be initialized first.use "Physics.enable()"',
                      ),
                      null);
                },
              },
              {
                key: "_removeBody",
                value: function (t) {
                  this.world
                    ? this.world.DestroyBody(t)
                    : console.error(
                        'The physical engine should be initialized first.use "Physics.enable()"',
                      );
                },
              },
              {
                key: "_createJoint",
                value: function (t) {
                  if (this.world) {
                    var e = this.world.CreateJoint(t);
                    return (
                      (e.m_userData = {}),
                      (e.m_userData.isDestroy = !1),
                      e
                    );
                  }
                  return (
                    console.error(
                      'The physical engine should be initialized first.use "Physics.enable()"',
                    ),
                    null
                  );
                },
              },
              {
                key: "_removeJoint",
                value: function (t) {
                  this.world
                    ? this.world.DestroyJoint(t)
                    : console.error(
                        'The physical engine should be initialized first.use "Physics.enable()"',
                      );
                },
              },
              {
                key: "stop",
                value: function () {
                  e.Laya.physicsTimer.clear(this, this._update);
                },
              },
              {
                key: "getBodyCount",
                value: function () {
                  return this.world.GetBodyCount();
                },
              },
              {
                key: "getContactCount",
                value: function () {
                  return this.world.GetContactCount();
                },
              },
              {
                key: "getJointCount",
                value: function () {
                  return this.world.GetJointCount();
                },
              },
              {
                key: "updatePhysicsByWorldRoot",
                value: function () {
                  if (this.worldRoot) {
                    var t = this.worldRoot.localToGlobal(
                      e.Point.TEMP.setTo(0, 0),
                    );
                    this.world.ShiftOrigin({
                      x: -t.x / i.PIXEL_RATIO,
                      y: -t.y / i.PIXEL_RATIO,
                    });
                  }
                },
              },
              {
                key: "allowSleeping",
                get: function () {
                  return this.world.GetAllowSleeping();
                },
                set: function (t) {
                  this.world.SetAllowSleeping(t);
                },
              },
              {
                key: "gravity",
                get: function () {
                  return this.world.GetGravity();
                },
                set: function (t) {
                  this.world.SetGravity(t);
                },
              },
              {
                key: "worldRoot",
                get: function () {
                  return this._worldRoot || e.Laya.stage;
                },
                set: function (t) {
                  if (((this._worldRoot = t), t)) {
                    var o = t.localToGlobal(e.Point.TEMP.setTo(0, 0));
                    this.world.ShiftOrigin({
                      x: -o.x / i.PIXEL_RATIO,
                      y: -o.y / i.PIXEL_RATIO,
                    });
                  }
                },
              },
            ],
            [
              {
                key: "enable",
                value: function () {
                  var t =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : null;
                  (i.I.start(t), (o.RigidBody = c), (o.Physics = this));
                },
              },
              {
                key: "I",
                get: function () {
                  return i._I || (i._I = new i());
                },
              },
            ],
          ),
          i
        );
      })(e.EventDispatcher);
    ((y.PIXEL_RATIO = 50),
      e.ClassUtils.regClass("laya.physics.Physics", y),
      e.ClassUtils.regClass("Laya.Physics", y));
    var _ = (function () {
        function t() {
          h(this, t);
        }
        return (
          n(t, [
            {
              key: "BeginContact",
              value: function (t) {
                y.I._eventList.push(0, t);
              },
            },
            {
              key: "EndContact",
              value: function (t) {
                y.I._eventList.push(1, t);
              },
            },
            { key: "PreSolve", value: function (t, e) {} },
            { key: "PostSolve", value: function (t, e) {} },
          ]),
          t
        );
      })(),
      d = (function (t) {
        function e() {
          var t;
          return (
            h(this, e),
            ((t = s(this, r(e).apply(this, arguments)))._x = 0),
            (t._y = 0),
            (t._width = 100),
            (t._height = 100),
            t
          );
        }
        return (
          a(e, t),
          n(e, [
            {
              key: "getDef",
              value: function () {
                return (
                  this._shape ||
                    ((this._shape = new window.box2d.b2PolygonShape()),
                    this._setShape(!1)),
                  (this.label = this.label || "BoxCollider"),
                  i(r(e.prototype), "getDef", this).call(this)
                );
              },
            },
            {
              key: "_setShape",
              value: function () {
                var t =
                    !(arguments.length > 0 && void 0 !== arguments[0]) ||
                    arguments[0],
                  e = this.owner.scaleX || 1,
                  i = this.owner.scaleY || 1;
                (this._shape.SetAsBox(
                  (this._width / 2 / y.PIXEL_RATIO) * e,
                  (this._height / 2 / y.PIXEL_RATIO) * i,
                  new window.box2d.b2Vec2(
                    ((this._width / 2 + this._x) / y.PIXEL_RATIO) * e,
                    ((this._height / 2 + this._y) / y.PIXEL_RATIO) * i,
                  ),
                ),
                  t && this.refresh());
              },
            },
            {
              key: "resetShape",
              value: function () {
                this._setShape();
              },
            },
            {
              key: "x",
              get: function () {
                return this._x;
              },
              set: function (t) {
                ((this._x = t), this._shape && this._setShape());
              },
            },
            {
              key: "y",
              get: function () {
                return this._y;
              },
              set: function (t) {
                ((this._y = t), this._shape && this._setShape());
              },
            },
            {
              key: "width",
              get: function () {
                return this._width;
              },
              set: function (t) {
                if (t <= 0) throw "BoxCollider size cannot be less than 0";
                ((this._width = t), this._shape && this._setShape());
              },
            },
            {
              key: "height",
              get: function () {
                return this._height;
              },
              set: function (t) {
                if (t <= 0) throw "BoxCollider size cannot be less than 0";
                ((this._height = t), this._shape && this._setShape());
              },
            },
          ]),
          e
        );
      })(l);
    (e.ClassUtils.regClass("laya.physics.BoxCollider", d),
      e.ClassUtils.regClass("Laya.BoxCollider", d));
    var f = (function (t) {
      function e() {
        var t;
        return (
          h(this, e),
          ((t = s(this, r(e).apply(this, arguments)))._x = 0),
          (t._y = 0),
          (t._points = "0,0,100,0"),
          (t._loop = !1),
          t
        );
      }
      return (
        a(e, t),
        n(e, [
          {
            key: "getDef",
            value: function () {
              return (
                this._shape ||
                  ((this._shape = new window.box2d.b2ChainShape()),
                  this._setShape(!1)),
                (this.label = this.label || "ChainCollider"),
                i(r(e.prototype), "getDef", this).call(this)
              );
            },
          },
          {
            key: "_setShape",
            value: function () {
              var t =
                  !(arguments.length > 0 && void 0 !== arguments[0]) ||
                  arguments[0],
                e = this._points.split(","),
                i = e.length;
              if (i % 2 == 1)
                throw "ChainCollider points lenth must a multiplier of 2";
              for (var o = [], n = 0, s = i; n < s; n += 2)
                o.push(
                  new window.box2d.b2Vec2(
                    (this._x + parseInt(e[n])) / y.PIXEL_RATIO,
                    (this._y + parseInt(e[n + 1])) / y.PIXEL_RATIO,
                  ),
                );
              (this._loop
                ? this._shape.CreateLoop(o, i / 2)
                : this._shape.CreateChain(o, i / 2),
                t && this.refresh());
            },
          },
          {
            key: "x",
            get: function () {
              return this._x;
            },
            set: function (t) {
              ((this._x = t), this._shape && this._setShape());
            },
          },
          {
            key: "y",
            get: function () {
              return this._y;
            },
            set: function (t) {
              ((this._y = t), this._shape && this._setShape());
            },
          },
          {
            key: "points",
            get: function () {
              return this._points;
            },
            set: function (t) {
              if (!t) throw "ChainCollider points cannot be empty";
              ((this._points = t), this._shape && this._setShape());
            },
          },
          {
            key: "loop",
            get: function () {
              return this._loop;
            },
            set: function (t) {
              ((this._loop = t), this._shape && this._setShape());
            },
          },
        ]),
        e
      );
    })(l);
    (e.ClassUtils.regClass("laya.physics.ChainCollider", f),
      e.ClassUtils.regClass("Laya.ChainCollider", f));
    var p = (function (t) {
      function e() {
        var t;
        return (
          h(this, e),
          ((t = s(this, r(e).apply(this, arguments)))._x = 0),
          (t._y = 0),
          (t._radius = 50),
          t
        );
      }
      return (
        a(e, t),
        n(e, [
          {
            key: "getDef",
            value: function () {
              return (
                this._shape ||
                  ((this._shape = new window.box2d.b2CircleShape()),
                  this._setShape(!1)),
                (this.label = this.label || "CircleCollider"),
                i(r(e.prototype), "getDef", this).call(this)
              );
            },
          },
          {
            key: "_setShape",
            value: function () {
              var t =
                  !(arguments.length > 0 && void 0 !== arguments[0]) ||
                  arguments[0],
                e = this.owner.scaleX || 1;
              ((this._shape.m_radius = (this._radius / y.PIXEL_RATIO) * e),
                this._shape.m_p.Set(
                  ((this._radius + this._x) / y.PIXEL_RATIO) * e,
                  ((this._radius + this._y) / y.PIXEL_RATIO) * e,
                ),
                t && this.refresh());
            },
          },
          {
            key: "resetShape",
            value: function () {
              this._setShape();
            },
          },
          {
            key: "x",
            get: function () {
              return this._x;
            },
            set: function (t) {
              ((this._x = t), this._shape && this._setShape());
            },
          },
          {
            key: "y",
            get: function () {
              return this._y;
            },
            set: function (t) {
              ((this._y = t), this._shape && this._setShape());
            },
          },
          {
            key: "radius",
            get: function () {
              return this._radius;
            },
            set: function (t) {
              if (t <= 0) throw "CircleCollider radius cannot be less than 0";
              ((this._radius = t), this._shape && this._setShape());
            },
          },
        ]),
        e
      );
    })(l);
    (e.ClassUtils.regClass("laya.physics.CircleCollider", p),
      e.ClassUtils.regClass("Laya.CircleCollider", p));
    var g = (function (t) {
      function o() {
        var t;
        return (
          h(this, o),
          ((t = s(this, r(o).call(this))).m_drawFlags = 99),
          o._inited || ((o._inited = !0), o.init()),
          (t._camera = {}),
          (t._camera.m_center = new o.box2d.b2Vec2(0, 0)),
          (t._camera.m_extent = 25),
          (t._camera.m_zoom = 1),
          (t._camera.m_width = 1280),
          (t._camera.m_height = 800),
          (t._mG = new e.Graphics()),
          (t.graphics = t._mG),
          (t._textSp = new e.Sprite()),
          (t._textG = t._textSp.graphics),
          t.addChild(t._textSp),
          t
        );
      }
      return (
        a(o, t),
        n(
          o,
          [
            {
              key: "render",
              value: function (t, e, n) {
                (this._renderToGraphic(),
                  i(r(o.prototype), "render", this).call(this, t, e, n));
              },
            },
            {
              key: "_renderToGraphic",
              value: function () {
                this.world &&
                  (this._textG.clear(),
                  this._mG.clear(),
                  this._mG.save(),
                  this._mG.scale(y.PIXEL_RATIO, y.PIXEL_RATIO),
                  (this.lineWidth = 1 / y.PIXEL_RATIO),
                  this.world.DrawDebugData(),
                  this._mG.restore());
              },
            },
            {
              key: "SetFlags",
              value: function (t) {
                this.m_drawFlags = t;
              },
            },
            {
              key: "GetFlags",
              value: function () {
                return this.m_drawFlags;
              },
            },
            {
              key: "AppendFlags",
              value: function (t) {
                this.m_drawFlags |= t;
              },
            },
            {
              key: "ClearFlags",
              value: function (t) {
                this.m_drawFlags &= ~t;
              },
            },
            {
              key: "PushTransform",
              value: function (t) {
                (this._mG.save(),
                  this._mG.translate(t.p.x, t.p.y),
                  this._mG.rotate(t.q.GetAngle()));
              },
            },
            {
              key: "PopTransform",
              value: function (t) {
                this._mG.restore();
              },
            },
            {
              key: "DrawPolygon",
              value: function (t, e, i) {
                var o, n;
                for (t.length, n = [], o = 0; o < e; o++)
                  n.push(t[o].x, t[o].y);
                this._mG.drawPoly(
                  0,
                  0,
                  n,
                  null,
                  i.MakeStyleString(1),
                  this.lineWidth,
                );
              },
            },
            {
              key: "DrawSolidPolygon",
              value: function (t, e, i) {
                var o, n;
                for (t.length, n = [], o = 0; o < e; o++)
                  n.push(t[o].x, t[o].y);
                this._mG.drawPoly(
                  0,
                  0,
                  n,
                  i.MakeStyleString(0.5),
                  i.MakeStyleString(1),
                  this.lineWidth,
                );
              },
            },
            {
              key: "DrawCircle",
              value: function (t, e, i) {
                this._mG.drawCircle(
                  t.x,
                  t.y,
                  e,
                  null,
                  i.MakeStyleString(1),
                  this.lineWidth,
                );
              },
            },
            {
              key: "DrawSolidCircle",
              value: function (t, e, i, o) {
                var n = t.x,
                  s = t.y;
                (this._mG.drawCircle(
                  n,
                  s,
                  e,
                  o.MakeStyleString(0.5),
                  o.MakeStyleString(1),
                  this.lineWidth,
                ),
                  this._mG.drawLine(
                    n,
                    s,
                    n + i.x * e,
                    s + i.y * e,
                    o.MakeStyleString(1),
                    this.lineWidth,
                  ));
              },
            },
            {
              key: "DrawParticles",
              value: function (t, e, i, o) {
                if (null !== i)
                  for (var n = 0; n < o; ++n) {
                    var s = t[n],
                      r = i[n];
                    this._mG.drawCircle(
                      s.x,
                      s.y,
                      e,
                      r.MakeStyleString(),
                      null,
                      this.lineWidth,
                    );
                  }
                else
                  for (n = 0; n < o; ++n)
                    ((s = t[n]),
                      this._mG.drawCircle(
                        s.x,
                        s.y,
                        e,
                        "#ffff00",
                        null,
                        this.lineWidth,
                      ));
              },
            },
            {
              key: "DrawSegment",
              value: function (t, e, i) {
                this._mG.drawLine(
                  t.x,
                  t.y,
                  e.x,
                  e.y,
                  i.MakeStyleString(1),
                  this.lineWidth,
                );
              },
            },
            {
              key: "DrawTransform",
              value: function (t) {
                (this.PushTransform(t),
                  this._mG.drawLine(
                    0,
                    0,
                    1,
                    0,
                    o.box2d.b2Color.RED.MakeStyleString(1),
                    this.lineWidth,
                  ),
                  this._mG.drawLine(
                    0,
                    0,
                    0,
                    1,
                    o.box2d.b2Color.GREEN.MakeStyleString(1),
                    this.lineWidth,
                  ),
                  this.PopTransform(t));
              },
            },
            {
              key: "DrawPoint",
              value: function (t, e, i) {
                e *= this._camera.m_zoom;
                var o = (e /= this._camera.m_extent) / 2;
                this._mG.drawRect(
                  t.x - o,
                  t.y - o,
                  e,
                  e,
                  i.MakeStyleString(),
                  null,
                );
              },
            },
            {
              key: "DrawString",
              value: function (t, e, i) {
                this._textG.fillText(
                  i,
                  t,
                  e,
                  "15px DroidSans",
                  o.DrawString_s_color.MakeStyleString(),
                  "left",
                );
              },
            },
            {
              key: "DrawStringWorld",
              value: function (t, e, i) {
                this.DrawString(t, e, i);
              },
            },
            {
              key: "DrawAABB",
              value: function (t, e) {
                var i = t.lowerBound.x,
                  o = t.lowerBound.y,
                  n = t.upperBound.x - t.lowerBound.x,
                  s = t.upperBound.y - t.lowerBound.y;
                this._mG.drawRect(
                  i,
                  o,
                  n,
                  s,
                  null,
                  e.MakeStyleString(),
                  this.lineWidth,
                );
              },
            },
          ],
          [
            {
              key: "init",
              value: function () {
                ((o.box2d = e.Browser.window.box2d),
                  (o.DrawString_s_color = new o.box2d.b2Color(0.9, 0.6, 0.6)),
                  (o.DrawStringWorld_s_p = new o.box2d.b2Vec2()),
                  (o.DrawStringWorld_s_cc = new o.box2d.b2Vec2()),
                  (o.DrawStringWorld_s_color = new o.box2d.b2Color(
                    0.5,
                    0.9,
                    0.5,
                  )));
              },
            },
            {
              key: "enable",
              value: function () {
                var t =
                  arguments.length > 0 && void 0 !== arguments[0]
                    ? arguments[0]
                    : 99;
                if (!o.I) {
                  var i = new o();
                  ((i.world = y.I.world),
                    i.world.SetDebugDraw(i),
                    (i.zOrder = 1e3),
                    (i.m_drawFlags = t),
                    e.Laya.stage.addChild(i),
                    (o.I = i));
                }
                return i;
              },
            },
          ],
        ),
        o
      );
    })(e.Sprite);
    ((g._inited = !1),
      e.ClassUtils.regClass("laya.physics.PhysicsDebugDraw", g),
      e.ClassUtils.regClass("Laya.PhysicsDebugDraw", g));
    var w = (function (t) {
      function e() {
        var t;
        return (
          h(this, e),
          ((t = s(this, r(e).apply(this, arguments)))._x = 0),
          (t._y = 0),
          (t._points = "50,0,100,100,0,100"),
          t
        );
      }
      return (
        a(e, t),
        n(e, [
          {
            key: "getDef",
            value: function () {
              return (
                this._shape ||
                  ((this._shape = new window.box2d.b2PolygonShape()),
                  this._setShape(!1)),
                (this.label = this.label || "PolygonCollider"),
                i(r(e.prototype), "getDef", this).call(this)
              );
            },
          },
          {
            key: "_setShape",
            value: function () {
              var t =
                  !(arguments.length > 0 && void 0 !== arguments[0]) ||
                  arguments[0],
                e = this._points.split(","),
                i = e.length;
              if (i < 6) throw "PolygonCollider points must be greater than 3";
              if (i % 2 == 1)
                throw "PolygonCollider points lenth must a multiplier of 2";
              for (var o = [], n = 0, s = i; n < s; n += 2)
                o.push(
                  new window.box2d.b2Vec2(
                    (this._x + parseInt(e[n])) / y.PIXEL_RATIO,
                    (this._y + parseInt(e[n + 1])) / y.PIXEL_RATIO,
                  ),
                );
              (this._shape.Set(o, i / 2), t && this.refresh());
            },
          },
          {
            key: "x",
            get: function () {
              return this._x;
            },
            set: function (t) {
              ((this._x = t), this._shape && this._setShape());
            },
          },
          {
            key: "y",
            get: function () {
              return this._y;
            },
            set: function (t) {
              ((this._y = t), this._shape && this._setShape());
            },
          },
          {
            key: "points",
            get: function () {
              return this._points;
            },
            set: function (t) {
              if (!t) throw "PolygonCollider points cannot be empty";
              ((this._points = t), this._shape && this._setShape());
            },
          },
        ]),
        e
      );
    })(l);
    (e.ClassUtils.regClass("laya.physics.PolygonCollider", w),
      e.ClassUtils.regClass("Laya.PolygonCollider", w));
    var b = (function (t) {
      function e() {
        return (h(this, e), s(this, r(e).apply(this, arguments)));
      }
      return (
        a(e, t),
        n(e, [
          {
            key: "_onEnable",
            value: function () {
              this._createJoint();
            },
          },
          {
            key: "_onAwake",
            value: function () {
              this._createJoint();
            },
          },
          { key: "_createJoint", value: function () {} },
          {
            key: "_onDisable",
            value: function () {
              (this._joint &&
                this._joint.m_userData &&
                !this._joint.m_userData.isDestroy &&
                y.I._removeJoint(this._joint),
                (this._joint = null));
            },
          },
          {
            key: "joint",
            get: function () {
              return (this._joint || this._createJoint(), this._joint);
            },
          },
          {
            key: "isSingleton",
            get: function () {
              return !1;
            },
          },
        ]),
        e
      );
    })(e.Component);
    (e.ClassUtils.regClass("laya.physics.joint.JointBase", b),
      e.ClassUtils.regClass("Laya.JointBase", b));
    var m = (function (t) {
      function e() {
        var t;
        return (
          h(this, e),
          ((t = s(this, r(e).apply(this, arguments))).selfAnchor = [0, 0]),
          (t.otherAnchor = [0, 0]),
          (t.collideConnected = !1),
          (t._length = 0),
          (t._frequency = 0),
          (t._damping = 0),
          t
        );
      }
      return (
        a(e, t),
        n(e, [
          {
            key: "_createJoint",
            value: function () {
              if (!this._joint) {
                if (
                  ((this.selfBody =
                    this.selfBody || this.owner.getComponent(c)),
                  !this.selfBody)
                )
                  throw "selfBody can not be empty";
                var t = window.box2d,
                  i = e._temp || (e._temp = new t.b2DistanceJointDef());
                ((i.bodyA = this.otherBody
                  ? this.otherBody.getBody()
                  : y.I._emptyBody),
                  (i.bodyB = this.selfBody.getBody()),
                  i.localAnchorA.Set(
                    this.otherAnchor[0] / y.PIXEL_RATIO,
                    this.otherAnchor[1] / y.PIXEL_RATIO,
                  ),
                  i.localAnchorB.Set(
                    this.selfAnchor[0] / y.PIXEL_RATIO,
                    this.selfAnchor[1] / y.PIXEL_RATIO,
                  ),
                  (i.frequencyHz = this._frequency),
                  (i.dampingRatio = this._damping),
                  (i.collideConnected = this.collideConnected));
                var o = i.bodyA.GetWorldPoint(i.localAnchorA, new t.b2Vec2()),
                  n = i.bodyB.GetWorldPoint(i.localAnchorB, new t.b2Vec2());
                ((i.length =
                  this._length / y.PIXEL_RATIO ||
                  t.b2Vec2.SubVV(n, o, new t.b2Vec2()).Length()),
                  (this._joint = y.I._createJoint(i)));
              }
            },
          },
          {
            key: "length",
            get: function () {
              return this._length;
            },
            set: function (t) {
              ((this._length = t),
                this._joint && this._joint.SetLength(t / y.PIXEL_RATIO));
            },
          },
          {
            key: "frequency",
            get: function () {
              return this._frequency;
            },
            set: function (t) {
              ((this._frequency = t),
                this._joint && this._joint.SetFrequency(t));
            },
          },
          {
            key: "damping",
            get: function () {
              return this._damping;
            },
            set: function (t) {
              ((this._damping = t),
                this._joint && this._joint.SetDampingRatio(t));
            },
          },
        ]),
        e
      );
    })(b);
    (e.ClassUtils.regClass("laya.physics.joint.DistanceJoint", m),
      e.ClassUtils.regClass("Laya.DistanceJoint", m));
    var v = (function (t) {
      function e() {
        var t;
        return (
          h(this, e),
          ((t = s(this, r(e).apply(this, arguments))).collideConnected = !1),
          (t._ratio = 1),
          t
        );
      }
      return (
        a(e, t),
        n(e, [
          {
            key: "_createJoint",
            value: function () {
              if (!this._joint) {
                if (!this.joint1) throw "Joint1 can not be empty";
                if (!this.joint2) throw "Joint2 can not be empty";
                var t = window.box2d,
                  i = e._temp || (e._temp = new t.b2GearJointDef());
                ((i.bodyA = this.joint1.owner.getComponent(c).getBody()),
                  (i.bodyB = this.joint2.owner.getComponent(c).getBody()),
                  (i.joint1 = this.joint1.joint),
                  (i.joint2 = this.joint2.joint),
                  (i.ratio = this._ratio),
                  (i.collideConnected = this.collideConnected),
                  (this._joint = y.I._createJoint(i)));
              }
            },
          },
          {
            key: "ratio",
            get: function () {
              return this._ratio;
            },
            set: function (t) {
              ((this._ratio = t), this._joint && this._joint.SetRatio(t));
            },
          },
        ]),
        e
      );
    })(b);
    (e.ClassUtils.regClass("laya.physics.joint.GearJoint", v),
      e.ClassUtils.regClass("Laya.GearJoint", v));
    var S = (function (t) {
      function e() {
        var t;
        return (
          h(this, e),
          ((t = s(this, r(e).apply(this, arguments))).collideConnected = !1),
          (t._linearOffset = [0, 0]),
          (t._angularOffset = 0),
          (t._maxForce = 1e3),
          (t._maxTorque = 1e3),
          (t._correctionFactor = 0.3),
          t
        );
      }
      return (
        a(e, t),
        n(e, [
          {
            key: "_createJoint",
            value: function () {
              if (!this._joint) {
                if (!this.otherBody) throw "otherBody can not be empty";
                if (
                  ((this.selfBody =
                    this.selfBody || this.owner.getComponent(c)),
                  !this.selfBody)
                )
                  throw "selfBody can not be empty";
                var t = window.box2d,
                  i = e._temp || (e._temp = new t.b2MotorJointDef());
                (i.Initialize(
                  this.otherBody.getBody(),
                  this.selfBody.getBody(),
                ),
                  (i.linearOffset = new t.b2Vec2(
                    this._linearOffset[0] / y.PIXEL_RATIO,
                    this._linearOffset[1] / y.PIXEL_RATIO,
                  )),
                  (i.angularOffset = this._angularOffset),
                  (i.maxForce = this._maxForce),
                  (i.maxTorque = this._maxTorque),
                  (i.correctionFactor = this._correctionFactor),
                  (i.collideConnected = this.collideConnected),
                  (this._joint = y.I._createJoint(i)));
              }
            },
          },
          {
            key: "linearOffset",
            get: function () {
              return this._linearOffset;
            },
            set: function (t) {
              ((this._linearOffset = t),
                this._joint &&
                  this._joint.SetLinearOffset(
                    new window.box2d.b2Vec2(
                      t[0] / y.PIXEL_RATIO,
                      t[1] / y.PIXEL_RATIO,
                    ),
                  ));
            },
          },
          {
            key: "angularOffset",
            get: function () {
              return this._angularOffset;
            },
            set: function (t) {
              ((this._angularOffset = t),
                this._joint && this._joint.SetAngularOffset(t));
            },
          },
          {
            key: "maxForce",
            get: function () {
              return this._maxForce;
            },
            set: function (t) {
              ((this._maxForce = t), this._joint && this._joint.SetMaxForce(t));
            },
          },
          {
            key: "maxTorque",
            get: function () {
              return this._maxTorque;
            },
            set: function (t) {
              ((this._maxTorque = t),
                this._joint && this._joint.SetMaxTorque(t));
            },
          },
          {
            key: "correctionFactor",
            get: function () {
              return this._correctionFactor;
            },
            set: function (t) {
              ((this._correctionFactor = t),
                this._joint && this._joint.SetCorrectionFactor(t));
            },
          },
        ]),
        e
      );
    })(b);
    (e.ClassUtils.regClass("laya.physics.joint.MotorJoint", S),
      e.ClassUtils.regClass("Laya.MotorJoint", S));
    var I = (function (t) {
      function o() {
        var t;
        return (
          h(this, o),
          ((t = s(this, r(o).apply(this, arguments)))._maxForce = 1e4),
          (t._frequency = 5),
          (t._damping = 0.7),
          t
        );
      }
      return (
        a(o, t),
        n(o, [
          {
            key: "_onEnable",
            value: function () {
              this.owner.on(e.Event.MOUSE_DOWN, this, this.onMouseDown);
            },
          },
          { key: "_onAwake", value: function () {} },
          {
            key: "onMouseDown",
            value: function () {
              (this._createJoint(),
                e.Laya.stage.on(e.Event.MOUSE_MOVE, this, this.onMouseMove),
                e.Laya.stage.once(e.Event.MOUSE_UP, this, this.onStageMouseUp),
                e.Laya.stage.once(
                  e.Event.MOUSE_OUT,
                  this,
                  this.onStageMouseUp,
                ));
            },
          },
          {
            key: "_createJoint",
            value: function () {
              if (!this._joint) {
                if (
                  ((this.selfBody =
                    this.selfBody || this.owner.getComponent(c)),
                  !this.selfBody)
                )
                  throw "selfBody can not be empty";
                var t = window.box2d,
                  i = o._temp || (o._temp = new t.b2MouseJointDef());
                if (this.anchor)
                  var n = this.selfBody.owner.localToGlobal(
                    e.Point.TEMP.setTo(this.anchor[0], this.anchor[1]),
                    !1,
                    y.I.worldRoot,
                  );
                else
                  n = y.I.worldRoot.globalToLocal(
                    e.Point.TEMP.setTo(
                      e.Laya.stage.mouseX,
                      e.Laya.stage.mouseY,
                    ),
                  );
                var s = new t.b2Vec2(n.x / y.PIXEL_RATIO, n.y / y.PIXEL_RATIO);
                ((i.bodyA = y.I._emptyBody),
                  (i.bodyB = this.selfBody.getBody()),
                  (i.target = s),
                  (i.frequencyHz = this._frequency),
                  (i.damping = this._damping),
                  (i.maxForce = this._maxForce),
                  (this._joint = y.I._createJoint(i)));
              }
            },
          },
          {
            key: "onStageMouseUp",
            value: function () {
              (e.Laya.stage.off(e.Event.MOUSE_MOVE, this, this.onMouseMove),
                e.Laya.stage.off(e.Event.MOUSE_UP, this, this.onStageMouseUp),
                e.Laya.stage.off(e.Event.MOUSE_OUT, this, this.onStageMouseUp),
                i(r(o.prototype), "_onDisable", this).call(this));
            },
          },
          {
            key: "onMouseMove",
            value: function () {
              this._joint.SetTarget(
                new window.box2d.b2Vec2(
                  y.I.worldRoot.mouseX / y.PIXEL_RATIO,
                  y.I.worldRoot.mouseY / y.PIXEL_RATIO,
                ),
              );
            },
          },
          {
            key: "_onDisable",
            value: function () {
              (this.owner.off(e.Event.MOUSE_DOWN, this, this.onMouseDown),
                i(r(o.prototype), "_onDisable", this).call(this));
            },
          },
          {
            key: "maxForce",
            get: function () {
              return this._maxForce;
            },
            set: function (t) {
              ((this._maxForce = t), this._joint && this._joint.SetMaxForce(t));
            },
          },
          {
            key: "frequency",
            get: function () {
              return this._frequency;
            },
            set: function (t) {
              ((this._frequency = t),
                this._joint && this._joint.SetFrequency(t));
            },
          },
          {
            key: "damping",
            get: function () {
              return this._damping;
            },
            set: function (t) {
              ((this._damping = t),
                this._joint && this._joint.SetDampingRatio(t));
            },
          },
        ]),
        o
      );
    })(b);
    (e.ClassUtils.regClass("laya.physics.joint.MouseJoint", I),
      e.ClassUtils.regClass("Laya.MouseJoint", I));
    var T = (function (t) {
      function i() {
        var t;
        return (
          h(this, i),
          ((t = s(this, r(i).apply(this, arguments))).anchor = [0, 0]),
          (t.axis = [1, 0]),
          (t.collideConnected = !1),
          (t._enableMotor = !1),
          (t._motorSpeed = 0),
          (t._maxMotorForce = 1e4),
          (t._enableLimit = !1),
          (t._lowerTranslation = 0),
          (t._upperTranslation = 0),
          t
        );
      }
      return (
        a(i, t),
        n(i, [
          {
            key: "_createJoint",
            value: function () {
              if (!this._joint) {
                if (
                  ((this.selfBody =
                    this.selfBody || this.owner.getComponent(c)),
                  !this.selfBody)
                )
                  throw "selfBody can not be empty";
                var t = window.box2d,
                  o = i._temp || (i._temp = new t.b2PrismaticJointDef()),
                  n = this.selfBody.owner.localToGlobal(
                    e.Point.TEMP.setTo(this.anchor[0], this.anchor[1]),
                    !1,
                    y.I.worldRoot,
                  ),
                  s = new t.b2Vec2(n.x / y.PIXEL_RATIO, n.y / y.PIXEL_RATIO);
                (o.Initialize(
                  this.otherBody ? this.otherBody.getBody() : y.I._emptyBody,
                  this.selfBody.getBody(),
                  s,
                  new t.b2Vec2(this.axis[0], this.axis[1]),
                ),
                  (o.enableMotor = this._enableMotor),
                  (o.motorSpeed = this._motorSpeed),
                  (o.maxMotorForce = this._maxMotorForce),
                  (o.enableLimit = this._enableLimit),
                  (o.lowerTranslation = this._lowerTranslation / y.PIXEL_RATIO),
                  (o.upperTranslation = this._upperTranslation / y.PIXEL_RATIO),
                  (o.collideConnected = this.collideConnected),
                  (this._joint = y.I._createJoint(o)));
              }
            },
          },
          {
            key: "enableMotor",
            get: function () {
              return this._enableMotor;
            },
            set: function (t) {
              ((this._enableMotor = t),
                this._joint && this._joint.EnableMotor(t));
            },
          },
          {
            key: "motorSpeed",
            get: function () {
              return this._motorSpeed;
            },
            set: function (t) {
              ((this._motorSpeed = t),
                this._joint && this._joint.SetMotorSpeed(t));
            },
          },
          {
            key: "maxMotorForce",
            get: function () {
              return this._maxMotorForce;
            },
            set: function (t) {
              ((this._maxMotorForce = t),
                this._joint && this._joint.SetMaxMotorForce(t));
            },
          },
          {
            key: "enableLimit",
            get: function () {
              return this._enableLimit;
            },
            set: function (t) {
              ((this._enableLimit = t),
                this._joint && this._joint.EnableLimit(t));
            },
          },
          {
            key: "lowerTranslation",
            get: function () {
              return this._lowerTranslation;
            },
            set: function (t) {
              ((this._lowerTranslation = t),
                this._joint &&
                  this._joint.SetLimits(t, this._upperTranslation));
            },
          },
          {
            key: "upperTranslation",
            get: function () {
              return this._upperTranslation;
            },
            set: function (t) {
              ((this._upperTranslation = t),
                this._joint &&
                  this._joint.SetLimits(this._lowerTranslation, t));
            },
          },
        ]),
        i
      );
    })(b);
    (e.ClassUtils.regClass("laya.physics.joint.PrismaticJoint", T),
      e.ClassUtils.regClass("Laya.PrismaticJoint", T));
    var x = (function (t) {
      function i() {
        var t;
        return (
          h(this, i),
          ((t = s(this, r(i).apply(this, arguments))).selfAnchor = [0, 0]),
          (t.otherAnchor = [0, 0]),
          (t.selfGroundPoint = [0, 0]),
          (t.otherGroundPoint = [0, 0]),
          (t.ratio = 1.5),
          (t.collideConnected = !1),
          t
        );
      }
      return (
        a(i, t),
        n(i, [
          {
            key: "_createJoint",
            value: function () {
              if (!this._joint) {
                if (!this.otherBody) throw "otherBody can not be empty";
                if (
                  ((this.selfBody =
                    this.selfBody || this.owner.getComponent(c)),
                  !this.selfBody)
                )
                  throw "selfBody can not be empty";
                var t = window.box2d,
                  o = i._temp || (i._temp = new t.b2PulleyJointDef()),
                  n = this.otherBody.owner.localToGlobal(
                    e.Point.TEMP.setTo(
                      this.otherAnchor[0],
                      this.otherAnchor[1],
                    ),
                    !1,
                    y.I.worldRoot,
                  ),
                  s = new t.b2Vec2(n.x / y.PIXEL_RATIO, n.y / y.PIXEL_RATIO),
                  r = this.selfBody.owner.localToGlobal(
                    e.Point.TEMP.setTo(this.selfAnchor[0], this.selfAnchor[1]),
                    !1,
                    y.I.worldRoot,
                  ),
                  a = new t.b2Vec2(r.x / y.PIXEL_RATIO, r.y / y.PIXEL_RATIO),
                  h = this.otherBody.owner.localToGlobal(
                    e.Point.TEMP.setTo(
                      this.otherGroundPoint[0],
                      this.otherGroundPoint[1],
                    ),
                    !1,
                    y.I.worldRoot,
                  ),
                  l = new t.b2Vec2(h.x / y.PIXEL_RATIO, h.y / y.PIXEL_RATIO),
                  u = this.selfBody.owner.localToGlobal(
                    e.Point.TEMP.setTo(
                      this.selfGroundPoint[0],
                      this.selfGroundPoint[1],
                    ),
                    !1,
                    y.I.worldRoot,
                  ),
                  _ = new t.b2Vec2(u.x / y.PIXEL_RATIO, u.y / y.PIXEL_RATIO);
                (o.Initialize(
                  this.otherBody.getBody(),
                  this.selfBody.getBody(),
                  l,
                  _,
                  s,
                  a,
                  this.ratio,
                ),
                  (o.collideConnected = this.collideConnected),
                  (this._joint = y.I._createJoint(o)));
              }
            },
          },
        ]),
        i
      );
    })(b);
    (e.ClassUtils.regClass("laya.physics.joint.PulleyJoint", x),
      e.ClassUtils.regClass("Laya.PulleyJoint", x));
    var k = (function (t) {
      function i() {
        var t;
        return (
          h(this, i),
          ((t = s(this, r(i).apply(this, arguments))).anchor = [0, 0]),
          (t.collideConnected = !1),
          (t._enableMotor = !1),
          (t._motorSpeed = 0),
          (t._maxMotorTorque = 1e4),
          (t._enableLimit = !1),
          (t._lowerAngle = 0),
          (t._upperAngle = 0),
          t
        );
      }
      return (
        a(i, t),
        n(i, [
          {
            key: "_createJoint",
            value: function () {
              if (!this._joint) {
                if (
                  ((this.selfBody =
                    this.selfBody || this.owner.getComponent(c)),
                  !this.selfBody)
                )
                  throw "selfBody can not be empty";
                var t = window.box2d,
                  o = i._temp || (i._temp = new t.b2RevoluteJointDef()),
                  n = this.selfBody.owner.localToGlobal(
                    e.Point.TEMP.setTo(this.anchor[0], this.anchor[1]),
                    !1,
                    y.I.worldRoot,
                  ),
                  s = new t.b2Vec2(n.x / y.PIXEL_RATIO, n.y / y.PIXEL_RATIO);
                (o.Initialize(
                  this.otherBody ? this.otherBody.getBody() : y.I._emptyBody,
                  this.selfBody.getBody(),
                  s,
                ),
                  (o.enableMotor = this._enableMotor),
                  (o.motorSpeed = this._motorSpeed),
                  (o.maxMotorTorque = this._maxMotorTorque),
                  (o.enableLimit = this._enableLimit),
                  (o.lowerAngle = this._lowerAngle),
                  (o.upperAngle = this._upperAngle),
                  (o.collideConnected = this.collideConnected),
                  (this._joint = y.I._createJoint(o)));
              }
            },
          },
          {
            key: "enableMotor",
            get: function () {
              return this._enableMotor;
            },
            set: function (t) {
              ((this._enableMotor = t),
                this._joint && this._joint.EnableMotor(t));
            },
          },
          {
            key: "motorSpeed",
            get: function () {
              return this._motorSpeed;
            },
            set: function (t) {
              ((this._motorSpeed = t),
                this._joint && this._joint.SetMotorSpeed(t));
            },
          },
          {
            key: "maxMotorTorque",
            get: function () {
              return this._maxMotorTorque;
            },
            set: function (t) {
              ((this._maxMotorTorque = t),
                this._joint && this._joint.SetMaxMotorTorque(t));
            },
          },
          {
            key: "enableLimit",
            get: function () {
              return this._enableLimit;
            },
            set: function (t) {
              ((this._enableLimit = t),
                this._joint && this._joint.EnableLimit(t));
            },
          },
          {
            key: "lowerAngle",
            get: function () {
              return this._lowerAngle;
            },
            set: function (t) {
              ((this._lowerAngle = t),
                this._joint && this._joint.SetLimits(t, this._upperAngle));
            },
          },
          {
            key: "upperAngle",
            get: function () {
              return this._upperAngle;
            },
            set: function (t) {
              ((this._upperAngle = t),
                this._joint && this._joint.SetLimits(this._lowerAngle, t));
            },
          },
        ]),
        i
      );
    })(b);
    (e.ClassUtils.regClass("laya.physics.joint.RevoluteJoint", k),
      e.ClassUtils.regClass("Laya.RevoluteJoint", k));
    var C = (function (t) {
      function e() {
        var t;
        return (
          h(this, e),
          ((t = s(this, r(e).apply(this, arguments))).selfAnchor = [0, 0]),
          (t.otherAnchor = [0, 0]),
          (t.collideConnected = !1),
          (t._maxLength = 1),
          t
        );
      }
      return (
        a(e, t),
        n(e, [
          {
            key: "_createJoint",
            value: function () {
              if (!this._joint) {
                if (
                  ((this.selfBody =
                    this.selfBody || this.owner.getComponent(c)),
                  !this.selfBody)
                )
                  throw "selfBody can not be empty";
                var t = window.box2d,
                  i = e._temp || (e._temp = new t.b2RopeJointDef());
                ((i.bodyA = this.otherBody
                  ? this.otherBody.getBody()
                  : y.I._emptyBody),
                  (i.bodyB = this.selfBody.getBody()),
                  i.localAnchorA.Set(
                    this.otherAnchor[0] / y.PIXEL_RATIO,
                    this.otherAnchor[1] / y.PIXEL_RATIO,
                  ),
                  i.localAnchorB.Set(
                    this.selfAnchor[0] / y.PIXEL_RATIO,
                    this.selfAnchor[1] / y.PIXEL_RATIO,
                  ),
                  (i.maxLength = this._maxLength / y.PIXEL_RATIO),
                  (i.collideConnected = this.collideConnected),
                  (this._joint = y.I._createJoint(i)));
              }
            },
          },
          {
            key: "maxLength",
            get: function () {
              return this._maxLength;
            },
            set: function (t) {
              ((this._maxLength = t),
                this._joint && this._joint.SetMaxLength(t / y.PIXEL_RATIO));
            },
          },
        ]),
        e
      );
    })(b);
    (e.ClassUtils.regClass("laya.physics.joint.RopeJoint", C),
      e.ClassUtils.regClass("Laya.RopeJoint", C));
    var P = (function (t) {
      function i() {
        var t;
        return (
          h(this, i),
          ((t = s(this, r(i).apply(this, arguments))).anchor = [0, 0]),
          (t.collideConnected = !1),
          (t._frequency = 5),
          (t._damping = 0.7),
          t
        );
      }
      return (
        a(i, t),
        n(i, [
          {
            key: "_createJoint",
            value: function () {
              if (!this._joint) {
                if (!this.otherBody) throw "otherBody can not be empty";
                if (
                  ((this.selfBody =
                    this.selfBody || this.owner.getComponent(c)),
                  !this.selfBody)
                )
                  throw "selfBody can not be empty";
                var t = window.box2d,
                  o = i._temp || (i._temp = new t.b2WeldJointDef()),
                  n = this.selfBody.owner.localToGlobal(
                    e.Point.TEMP.setTo(this.anchor[0], this.anchor[1]),
                    !1,
                    y.I.worldRoot,
                  ),
                  s = new t.b2Vec2(n.x / y.PIXEL_RATIO, n.y / y.PIXEL_RATIO);
                (o.Initialize(
                  this.otherBody.getBody(),
                  this.selfBody.getBody(),
                  s,
                ),
                  (o.frequencyHz = this._frequency),
                  (o.dampingRatio = this._damping),
                  (o.collideConnected = this.collideConnected),
                  (this._joint = y.I._createJoint(o)));
              }
            },
          },
          {
            key: "frequency",
            get: function () {
              return this._frequency;
            },
            set: function (t) {
              ((this._frequency = t),
                this._joint && this._joint.SetFrequency(t));
            },
          },
          {
            key: "damping",
            get: function () {
              return this._damping;
            },
            set: function (t) {
              ((this._damping = t),
                this._joint && this._joint.SetDampingRatio(t));
            },
          },
        ]),
        i
      );
    })(b);
    (e.ClassUtils.regClass("laya.physics.joint.WeldJoint", P),
      e.ClassUtils.regClass("Laya.WeldJoint", P));
    var B = (function (t) {
      function i() {
        var t;
        return (
          h(this, i),
          ((t = s(this, r(i).apply(this, arguments))).anchor = [0, 0]),
          (t.collideConnected = !1),
          (t.axis = [1, 0]),
          (t._frequency = 5),
          (t._damping = 0.7),
          (t._enableMotor = !1),
          (t._motorSpeed = 0),
          (t._maxMotorTorque = 1e4),
          t
        );
      }
      return (
        a(i, t),
        n(i, [
          {
            key: "_createJoint",
            value: function () {
              if (!this._joint) {
                if (!this.otherBody) throw "otherBody can not be empty";
                if (
                  ((this.selfBody =
                    this.selfBody || this.owner.getComponent(c)),
                  !this.selfBody)
                )
                  throw "selfBody can not be empty";
                var t = window.box2d,
                  o = i._temp || (i._temp = new t.b2WheelJointDef()),
                  n = this.selfBody.owner.localToGlobal(
                    e.Point.TEMP.setTo(this.anchor[0], this.anchor[1]),
                    !1,
                    y.I.worldRoot,
                  ),
                  s = new t.b2Vec2(n.x / y.PIXEL_RATIO, n.y / y.PIXEL_RATIO);
                (o.Initialize(
                  this.otherBody.getBody(),
                  this.selfBody.getBody(),
                  s,
                  new t.b2Vec2(this.axis[0], this.axis[1]),
                ),
                  (o.enableMotor = this._enableMotor),
                  (o.motorSpeed = this._motorSpeed),
                  (o.maxMotorTorque = this._maxMotorTorque),
                  (o.frequencyHz = this._frequency),
                  (o.dampingRatio = this._damping),
                  (o.collideConnected = this.collideConnected),
                  (this._joint = y.I._createJoint(o)));
              }
            },
          },
          {
            key: "frequency",
            get: function () {
              return this._frequency;
            },
            set: function (t) {
              ((this._frequency = t),
                this._joint && this._joint.SetSpringFrequencyHz(t));
            },
          },
          {
            key: "damping",
            get: function () {
              return this._damping;
            },
            set: function (t) {
              ((this._damping = t),
                this._joint && this._joint.SetSpringDampingRatio(t));
            },
          },
          {
            key: "enableMotor",
            get: function () {
              return this._enableMotor;
            },
            set: function (t) {
              ((this._enableMotor = t),
                this._joint && this._joint.EnableMotor(t));
            },
          },
          {
            key: "motorSpeed",
            get: function () {
              return this._motorSpeed;
            },
            set: function (t) {
              ((this._motorSpeed = t),
                this._joint && this._joint.SetMotorSpeed(t));
            },
          },
          {
            key: "maxMotorTorque",
            get: function () {
              return this._maxMotorTorque;
            },
            set: function (t) {
              ((this._maxMotorTorque = t),
                this._joint && this._joint.SetMaxMotorTorque(t));
            },
          },
        ]),
        i
      );
    })(b);
    (e.ClassUtils.regClass("laya.physics.joint.WheelJoint", B),
      e.ClassUtils.regClass("Laya.WheelJoint", B),
      (t.BoxCollider = d),
      (t.ChainCollider = f),
      (t.CircleCollider = p),
      (t.ColliderBase = l),
      (t.DestructionListener = u),
      (t.DistanceJoint = m),
      (t.GearJoint = v),
      (t.IPhysics = o),
      (t.JointBase = b),
      (t.MotorJoint = S),
      (t.MouseJoint = I),
      (t.Physics = y),
      (t.PhysicsDebugDraw = g),
      (t.PolygonCollider = w),
      (t.PrismaticJoint = T),
      (t.PulleyJoint = x),
      (t.RevoluteJoint = k),
      (t.RigidBody = c),
      (t.RopeJoint = C),
      (t.WeldJoint = P),
      (t.WheelJoint = B));
  })((window.Laya = window.Laya || {}), Laya);
})();
