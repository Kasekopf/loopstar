"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function(target, all) {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = function(to, from, except, desc) {
  if (from && typeof from === "object" || typeof from === "function")
    for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
      key = keys[i];
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: function(k) {
          return from[k];
        }.bind(null, key), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
  return to;
};
var __toCommonJS = function(mod) {
  return __copyProps(__defProp({}, "__esModule", { value: true }), mod);
};

// src/standalone/loopstar_choice.ts
var loopstar_choice_exports = {};
__export(loopstar_choice_exports, {
  main: function() {
    return main;
  }
});
module.exports = __toCommonJS(loopstar_choice_exports);
var import_kolmafia3 = require("kolmafia");

// node_modules/libram/dist/lib.js
var import_kolmafia2 = require("kolmafia");

// node_modules/libram/dist/template-string.js
var import_kolmafia = require("kolmafia");

// node_modules/libram/dist/utils.js
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      var F = function F2() {
      };
      return { s: F, n: function n() {
        if (i >= o.length) return { done: true };
        return { done: false, value: o[i++] };
      }, e: function e(_e) {
        throw _e;
      }, f: F };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true, didErr = false, err;
  return { s: function s() {
    it = it.call(o);
  }, n: function n() {
    var step = it.next();
    normalCompletion = step.done;
    return step;
  }, e: function e(_e2) {
    didErr = true;
    err = _e2;
  }, f: function f() {
    try {
      if (!normalCompletion && it.return != null) it.return();
    } finally {
      if (didErr) throw err;
    }
  } };
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function splitByCommasWithEscapes(str) {
  var returnValue = [];
  var ignoreNext = false;
  var currentString = "";
  var _iterator2 = _createForOfIteratorHelper(str.split("")), _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
      var char = _step2.value;
      if (char === "\\") {
        ignoreNext = true;
      } else {
        if (char == "," && !ignoreNext) {
          returnValue.push(currentString.trim());
          currentString = "";
        } else {
          currentString += char;
        }
        ignoreNext = false;
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  returnValue.push(currentString.trim());
  return returnValue;
}
function undelay(delayedObject) {
  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }
  return typeof delayedObject === "function" ? delayedObject.apply(void 0, args) : delayedObject;
}
function makeByXFunction(source) {
  return function(options, alternateSource) {
    var _options$val;
    var val = undelay(alternateSource !== null && alternateSource !== void 0 ? alternateSource : source);
    if ("default" in options) return (_options$val = options[val]) !== null && _options$val !== void 0 ? _options$val : options.default;
    return options[val];
  };
}

// node_modules/libram/dist/template-string.js
var concatTemplateString = function concatTemplateString2(literals) {
  for (var _len = arguments.length, placeholders = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    placeholders[_key - 1] = arguments[_key];
  }
  return literals.raw.reduce(function(acc, literal, i) {
    var _placeholders$i;
    return acc + literal + ((_placeholders$i = placeholders[i]) !== null && _placeholders$i !== void 0 ? _placeholders$i : "");
  }, "");
};
var handleTypeGetError = function(Type, error) {
  var message = "".concat(error);
  var match = message.match(RegExp("Bad ".concat(Type.name.toLowerCase(), " value: .*")));
  if (match) {
    (0, import_kolmafia.print)("".concat(match[0], "; if you're certain that this ").concat(Type.name, " exists and is spelled correctly, please update KoLMafia"), "red");
  } else {
    (0, import_kolmafia.print)(message);
  }
};
var createSingleConstant = function(Type, converter) {
  var tagFunction = function tagFunction2(literals) {
    for (var _len2 = arguments.length, placeholders = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      placeholders[_key2 - 1] = arguments[_key2];
    }
    var input = concatTemplateString.apply(void 0, [literals].concat(placeholders));
    try {
      return Type.get(input);
    } catch (error) {
      handleTypeGetError(Type, error);
    }
    (0, import_kolmafia.abort)();
  };
  tagFunction.cls = Type;
  tagFunction.none = Type.none;
  tagFunction.get = function(name) {
    var value = converter(name);
    return value === Type.none ? null : value;
  };
  return tagFunction;
};
var createPluralConstant = function(Type) {
  var tagFunction = function tagFunction2(literals) {
    for (var _len3 = arguments.length, placeholders = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      placeholders[_key3 - 1] = arguments[_key3];
    }
    var input = concatTemplateString.apply(void 0, [literals].concat(placeholders));
    if (input === "") {
      return Type.all();
    }
    try {
      return Type.get(splitByCommasWithEscapes(input));
    } catch (error) {
      handleTypeGetError(Type, error);
    }
    (0, import_kolmafia.abort)();
  };
  tagFunction.all = function() {
    return Type.all();
  };
  return tagFunction;
};
var $bounty = createSingleConstant(import_kolmafia.Bounty, import_kolmafia.toBounty);
var $bounties = createPluralConstant(import_kolmafia.Bounty);
var $class = createSingleConstant(import_kolmafia.Class, import_kolmafia.toClass);
var $classes = createPluralConstant(import_kolmafia.Class);
var $coinmaster = createSingleConstant(import_kolmafia.Coinmaster, import_kolmafia.toCoinmaster);
var $coinmasters = createPluralConstant(import_kolmafia.Coinmaster);
var $effect = createSingleConstant(import_kolmafia.Effect, import_kolmafia.toEffect);
var $effects = createPluralConstant(import_kolmafia.Effect);
var $element = createSingleConstant(import_kolmafia.Element, import_kolmafia.toElement);
var $elements = createPluralConstant(import_kolmafia.Element);
var $familiar = createSingleConstant(import_kolmafia.Familiar, import_kolmafia.toFamiliar);
var $familiars = createPluralConstant(import_kolmafia.Familiar);
var $item = createSingleConstant(import_kolmafia.Item, import_kolmafia.toItem);
var $items = createPluralConstant(import_kolmafia.Item);
var $location = createSingleConstant(import_kolmafia.Location, import_kolmafia.toLocation);
var $locations = createPluralConstant(import_kolmafia.Location);
var $modifier = createSingleConstant(import_kolmafia.Modifier, import_kolmafia.toModifier);
var $modifiers = createPluralConstant(import_kolmafia.Modifier);
var $monster = createSingleConstant(import_kolmafia.Monster, import_kolmafia.toMonster);
var $monsters = createPluralConstant(import_kolmafia.Monster);
var $path = createSingleConstant(import_kolmafia.Path, import_kolmafia.toPath);
var $paths = createPluralConstant(import_kolmafia.Path);
var $phylum = createSingleConstant(import_kolmafia.Phylum, import_kolmafia.toPhylum);
var $phyla = createPluralConstant(import_kolmafia.Phylum);
var $servant = createSingleConstant(import_kolmafia.Servant, import_kolmafia.toServant);
var $servants = createPluralConstant(import_kolmafia.Servant);
var $skill = createSingleConstant(import_kolmafia.Skill, import_kolmafia.toSkill);
var $skills = createPluralConstant(import_kolmafia.Skill);
var $slot = createSingleConstant(import_kolmafia.Slot, import_kolmafia.toSlot);
var $slots = createPluralConstant(import_kolmafia.Slot);
var $stat = createSingleConstant(import_kolmafia.Stat, import_kolmafia.toStat);
var $stats = createPluralConstant(import_kolmafia.Stat);
var $thrall = createSingleConstant(import_kolmafia.Thrall, import_kolmafia.toThrall);
var $thralls = createPluralConstant(import_kolmafia.Thrall);

// node_modules/libram/dist/lib.js
var _templateObject11;
var _templateObject12;
var _templateObject13;
var _templateObject14;
var _templateObject15;
var _templateObject16;
var _templateObject17;
var _templateObject18;
var _templateObject19;
var _templateObject20;
var _templateObject21;
var _templateObject22;
var _templateObject23;
var _templateObject24;
var _templateObject25;
var _templateObject26;
var _templateObject27;
var _templateObject28;
var _templateObject29;
var _templateObject30;
var _templateObject31;
var _templateObject32;
var _templateObject33;
var _templateObject34;
var _templateObject35;
var _templateObject36;
var _templateObject49;
var _templateObject50;
var _templateObject51;
var _templateObject52;
var _templateObject53;
var _templateObject54;
function _createForOfIteratorHelper2(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray2(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      var F = function F2() {
      };
      return { s: F, n: function n() {
        if (i >= o.length) return { done: true };
        return { done: false, value: o[i++] };
      }, e: function e(_e) {
        throw _e;
      }, f: F };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var normalCompletion = true, didErr = false, err;
  return { s: function s() {
    it = it.call(o);
  }, n: function n() {
    var step = it.next();
    normalCompletion = step.done;
    return step;
  }, e: function e(_e2) {
    didErr = true;
    err = _e2;
  }, f: function f() {
    try {
      if (!normalCompletion && it.return != null) it.return();
    } finally {
      if (didErr) throw err;
    }
  } };
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray2(arr, i) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray2(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray2(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray2(o, minLen);
}
function _arrayLikeToArray2(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = false;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _taggedTemplateLiteral(strings, raw) {
  if (!raw) {
    raw = strings.slice(0);
  }
  return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } }));
}
function have(thing) {
  var quantity = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
  if (thing instanceof import_kolmafia2.Effect) {
    return (0, import_kolmafia2.haveEffect)(thing) >= quantity;
  }
  if (thing instanceof import_kolmafia2.Familiar) {
    return (0, import_kolmafia2.haveFamiliar)(thing);
  }
  if (thing instanceof import_kolmafia2.Item) {
    return (0, import_kolmafia2.availableAmount)(thing) >= quantity;
  }
  if (thing instanceof import_kolmafia2.Servant) {
    return (0, import_kolmafia2.haveServant)(thing);
  }
  if (thing instanceof import_kolmafia2.Skill) {
    return (0, import_kolmafia2.haveSkill)(thing);
  }
  if (thing instanceof import_kolmafia2.Thrall) {
    var thrall = (0, import_kolmafia2.myThrall)();
    return thrall.id === thing.id && thrall.level >= quantity;
  }
  return false;
}
var Wanderer;
(function(Wanderer2) {
  Wanderer2["Digitize"] = "Digitize Monster";
  Wanderer2["Enamorang"] = "Enamorang Monster";
  Wanderer2["Familiar"] = "Familiar";
  Wanderer2["Holiday"] = "Holiday Monster";
  Wanderer2["Kramco"] = "Kramco";
  Wanderer2["Nemesis"] = "Nemesis Assassin";
  Wanderer2["Portscan"] = "portscan.edu";
  Wanderer2["Romantic"] = "Romantic Monster";
  Wanderer2["Vote"] = "Vote Monster";
})(Wanderer || (Wanderer = {}));
var deterministicWanderers = [Wanderer.Digitize, Wanderer.Portscan];
var holidayWanderers = /* @__PURE__ */ new Map([["El Dia De Los Muertos Borrachos", $monsters(_templateObject11 || (_templateObject11 = _taggedTemplateLiteral(["Novia Cad\xE1ver, Novio Cad\xE1ver, Padre Cad\xE1ver, Persona Inocente Cad\xE1ver"])))], ["Feast of Boris", $monsters(_templateObject12 || (_templateObject12 = _taggedTemplateLiteral(["Candied Yam Golem, Malevolent Tofurkey, Possessed Can of Cranberry Sauce, Stuffing Golem"])))], ["Talk Like a Pirate Day", $monsters(_templateObject13 || (_templateObject13 = _taggedTemplateLiteral(["ambulatory pirate, migratory pirate, peripatetic pirate"])))]]);
var telescopeStats = /* @__PURE__ */ new Map([["standing around flexing their muscles and using grip exercisers", $stat(_templateObject14 || (_templateObject14 = _taggedTemplateLiteral(["Muscle"])))], ["sitting around playing chess and solving complicated-looking logic puzzles", $stat(_templateObject15 || (_templateObject15 = _taggedTemplateLiteral(["Mysticality"])))], ["all wearing sunglasses and dancing", $stat(_templateObject16 || (_templateObject16 = _taggedTemplateLiteral(["Moxie"])))]]);
var telescopeElements = /* @__PURE__ */ new Map([["people, all of whom appear to be on fire", $element(_templateObject17 || (_templateObject17 = _taggedTemplateLiteral(["hot"])))], ["people, surrounded by a cloud of eldritch mist", $element(_templateObject18 || (_templateObject18 = _taggedTemplateLiteral(["spooky"])))], ["greasy-looking people furtively skulking around", $element(_templateObject19 || (_templateObject19 = _taggedTemplateLiteral(["sleaze"])))], ["people, surrounded by garbage and clouds of flies", $element(_templateObject20 || (_templateObject20 = _taggedTemplateLiteral(["stench"])))], ["people, clustered around a group of igloos", $element(_templateObject21 || (_templateObject21 = _taggedTemplateLiteral(["cold"])))]]);
var hedgeTrap1 = /* @__PURE__ */ new Map([["smoldering bushes on the outskirts of a hedge maze", $element(_templateObject22 || (_templateObject22 = _taggedTemplateLiteral(["hot"])))], ["creepy-looking black bushes on the outskirts of a hedge maze", $element(_templateObject23 || (_templateObject23 = _taggedTemplateLiteral(["spooky"])))], ["purplish, greasy-looking hedges", $element(_templateObject24 || (_templateObject24 = _taggedTemplateLiteral(["sleaze"])))], ["nasty-looking, dripping green bushes on the outskirts of a hedge maze", $element(_templateObject25 || (_templateObject25 = _taggedTemplateLiteral(["stench"])))], ["frost-rimed bushes on the outskirts of a hedge maze", $element(_templateObject26 || (_templateObject26 = _taggedTemplateLiteral(["cold"])))]]);
var hedgeTrap2 = /* @__PURE__ */ new Map([["smoke rising from deeper within the maze", $element(_templateObject27 || (_templateObject27 = _taggedTemplateLiteral(["hot"])))], ["a miasma of eldritch vapors rising from deeper within the maze", $element(_templateObject28 || (_templateObject28 = _taggedTemplateLiteral(["spooky"])))], ["a greasy purple cloud hanging over the center of the maze", $element(_templateObject29 || (_templateObject29 = _taggedTemplateLiteral(["sleaze"])))], ["a cloud of green gas hovering over the maze", $element(_templateObject30 || (_templateObject30 = _taggedTemplateLiteral(["stench"])))], ["wintry mists rising from deeper within the maze", $element(_templateObject31 || (_templateObject31 = _taggedTemplateLiteral(["cold"])))]]);
var hedgeTrap3 = /* @__PURE__ */ new Map([["with lava slowly oozing out of it", $element(_templateObject32 || (_templateObject32 = _taggedTemplateLiteral(["hot"])))], ["surrounded by creepy black mist", $element(_templateObject33 || (_templateObject33 = _taggedTemplateLiteral(["spooky"])))], ["that occasionally vomits out a greasy ball of hair", $element(_templateObject34 || (_templateObject34 = _taggedTemplateLiteral(["sleaze"])))], ["disgorging a really surprising amount of sewage", $element(_templateObject35 || (_templateObject35 = _taggedTemplateLiteral(["stench"])))], ["occasionally disgorging a bunch of ice cubes", $element(_templateObject36 || (_templateObject36 = _taggedTemplateLiteral(["cold"])))]]);
var byStat = makeByXFunction(function() {
  return (0, import_kolmafia2.myPrimestat)().toString();
});
var byClass = makeByXFunction(function() {
  return (0, import_kolmafia2.myClass)().toString();
});
function makeScalerCalcFunction(cache, pattern) {
  return function(monster) {
    var _find, _pattern$exec$slice, _pattern$exec;
    var current = cache.get(monster);
    if (current !== void 0) return (0, import_kolmafia2.monsterEval)(current);
    var result = (_find = ((_pattern$exec$slice = (_pattern$exec = pattern.exec(monster.attributes)) === null || _pattern$exec === void 0 ? void 0 : _pattern$exec.slice(1)) !== null && _pattern$exec$slice !== void 0 ? _pattern$exec$slice : []).find(function(m) {
      return m !== void 0;
    })) !== null && _find !== void 0 ? _find : "0";
    cache.set(monster, result);
    return (0, import_kolmafia2.monsterEval)(result);
  };
}
var scalerRates = /* @__PURE__ */ new Map();
var scalerCaps = /* @__PURE__ */ new Map();
var SCALE_RATE_PATTERN = /Scale: (?:\[([^\]]*)\]|(\d*))/;
var SCALE_CAP_PATTERN = /Cap: (?:\[([^\]]*)\]|(\d*))/;
var getScalingRate = makeScalerCalcFunction(scalerRates, SCALE_RATE_PATTERN);
var getScalingCap = makeScalerCalcFunction(scalerCaps, SCALE_CAP_PATTERN);
var makeBulkFunction = function(action) {
  return function(items) {
    (0, import_kolmafia2.batchOpen)();
    var _iterator2 = _createForOfIteratorHelper2(items.entries()), _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
        var _step2$value = _slicedToArray(_step2.value, 2), item = _step2$value[0], quantity = _step2$value[1];
        action(quantity, item);
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    return (0, import_kolmafia2.batchClose)();
  };
};
var bulkAutosell = makeBulkFunction(import_kolmafia2.autosell);
var bulkPutCloset = makeBulkFunction(import_kolmafia2.putCloset);
var bulkPutDisplay = makeBulkFunction(import_kolmafia2.putDisplay);
var bulkPutStash = makeBulkFunction(import_kolmafia2.putStash);
var bulkTakeCloset = makeBulkFunction(import_kolmafia2.takeCloset);
var bulkTakeDisplay = makeBulkFunction(import_kolmafia2.takeDisplay);
var bulkTakeShop = makeBulkFunction(import_kolmafia2.takeShop);
var bulkTakeStash = makeBulkFunction(import_kolmafia2.takeStash);
var bulkTakeStorage = makeBulkFunction(import_kolmafia2.takeStorage);
var regularFamiliarTags = Object.freeze(["animal", "insect", "haseyes", "haswings", "fast", "bite", "flies", "hashands", "wearsclothes", "organic", "vegetable", "hovers", "edible", "food", "sentient", "cute", "mineral", "polygonal", "object", "undead", "cantalk", "evil", "orb", "spooky", "sleaze", "aquatic", "swims", "isclothes", "phallic", "stench", "hot", "hasbeak", "haslegs", "robot", "technological", "hard", "cold", "hasbones", "hasclaws", "reallyevil", "good", "person", "humanoid", "animatedart", "software", "hasshell", "hasstinger"]);
var regularFamiliarTagSet = new Set(regularFamiliarTags);
var pokefamUltTags = Object.freeze(["ult_bearhug", "ult_sticktreats", "ult_owlstare", "ult_bloodbath", "ult_pepperscorn", "ult_rainbowstorm"]);
var SPECIAL_ULTS = /* @__PURE__ */ new Map([[$familiar(_templateObject49 || (_templateObject49 = _taggedTemplateLiteral(["Nursine"]))), ["ult_bearhug"]], [$familiar(_templateObject50 || (_templateObject50 = _taggedTemplateLiteral(["Caramel"]))), ["ult_sticktreats"]], [$familiar(_templateObject51 || (_templateObject51 = _taggedTemplateLiteral(["Smashmoth"]))), ["ult_owlstare"]], [$familiar(_templateObject52 || (_templateObject52 = _taggedTemplateLiteral(["Slotter"]))), ["ult_bloodbath"]], [$familiar(_templateObject53 || (_templateObject53 = _taggedTemplateLiteral(["Cornbeefadon"]))), ["ult_pepperscorn"]], [$familiar(_templateObject54 || (_templateObject54 = _taggedTemplateLiteral(["Mu"]))), ["ult_rainbowstorm"]]]);

// src/standalone/loopstar_choice.ts
var _templateObject;
function _slicedToArray2(arr, i) {
  return _arrayWithHoles2(arr) || _iterableToArrayLimit2(arr, i) || _unsupportedIterableToArray3(arr, i) || _nonIterableRest2();
}
function _nonIterableRest2() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray3(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray3(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray3(o, minLen);
}
function _arrayLikeToArray3(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _iterableToArrayLimit2(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = false;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles2(arr) {
  if (Array.isArray(arr)) return arr;
}
function _taggedTemplateLiteral2(strings, raw) {
  if (!raw) {
    raw = strings.slice(0);
  }
  return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } }));
}
function main(choice, page) {
  var options = (0, import_kolmafia3.availableChoiceOptions)();
  if (choice === 923 && options[5]) {
    (0, import_kolmafia3.runChoice)(5);
  } else if (choice === 780 && options[4]) {
    (0, import_kolmafia3.runChoice)(4);
  } else if (choice === 785 && options[4]) {
    (0, import_kolmafia3.runChoice)(4);
  } else if (choice === 788 && options[2]) {
    (0, import_kolmafia3.runChoice)(2);
  } else if (choice === 691 && options[4]) {
    (0, import_kolmafia3.runChoice)(4);
  } else if (choice === 1322) {
    if ((0, import_kolmafia3.getProperty)("_questPartyFairQuest") === "food" || (0, import_kolmafia3.getProperty)("_questPartyFairQuest") === "booze") {
      (0, import_kolmafia3.runChoice)(1);
    } else {
      (0, import_kolmafia3.runChoice)(2);
    }
  } else if (choice === 182) {
    if (options[4] && !have($item(_templateObject || (_templateObject = _taggedTemplateLiteral2(["Mohawk wig"]))))) {
      (0, import_kolmafia3.runChoice)(4);
    } else if (options[6]) {
      (0, import_kolmafia3.runChoice)(6);
    }
  } else if (choice === 1525) {
    var priority = {
      "Throw a second dart quickly": 60,
      "Deal 25-50% more damage": 800,
      "You are less impressed by bullseyes": 10,
      "25% Better bullseye targeting": 20,
      "Extra stats from stats targets": 40,
      "Butt awareness": 30,
      "Add Hot Damage": 1e3,
      "Add Cold Damage": 31,
      "Add Sleaze Damage": 1e3,
      "Add Spooky Damage": 1e3,
      "Add Stench Damage": 1e3,
      "Expand your dart capacity by 1": 50,
      "Bullseyes do not impress you much": 9,
      "25% More Accurate bullseye targeting": 19,
      "Deal 25-50% extra damage": 1e4,
      "Increase Dart Deleveling from deleveling targets": 100,
      "Deal 25-50% greater damage": 1e4,
      "25% better chance to hit bullseyes": 18
    };
    var currentScore = 999999999;
    var choiceToRun = 1;
    for (var _i = 0, _Object$entries = Object.entries(options); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray2(_Object$entries[_i], 2), option = _Object$entries$_i[0], optionText = _Object$entries$_i[1];
      if (!priority[optionText]) {
        (0, import_kolmafia3.print)('dart perk "'.concat(optionText, '" not in priority list'), "red");
        continue;
      }
      if (priority[optionText] >= currentScore) {
        continue;
      }
      currentScore = priority[optionText];
      choiceToRun = parseInt(option);
    }
    (0, import_kolmafia3.runChoice)(choiceToRun);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
