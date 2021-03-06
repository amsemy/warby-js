(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("backbone"), require("jquery"), require("underscore"));
	else if(typeof define === 'function' && define.amd)
		define(["backbone", "jquery", "underscore"], factory);
	else if(typeof exports === 'object')
		exports["Warby"] = factory(require("backbone"), require("jquery"), require("underscore"));
	else
		root["Warby"] = factory(root["Backbone"], root["jQuery"], root["_"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _ = __webpack_require__(5),
    Backbone = __webpack_require__(0);

// Статус валидации
// ----------------
var ValidityStatus = function() {

    // Упрощённая модель статуса валидации формы для связывания с
    // представлением при помощи Rivets.
    this.model = new Backbone.Model({
        $invalid: false,
        $valid: true
    });

    // Статус валидации полей.
    //
    //  status: {
    //      __self__: [
    //          hasErrA: true,
    //          hasErrB: false,
    //          invalid: true,
    //          valid: false
    //      ],
    //      foo: {
    //          __self__: [
    //              hasErrС: false,
    //              invalid: false,
    //              valid: true
    //          ],
    //          bar: {
    //              __self__: [
    //                  hasErrD: true,
    //                  invalid: true,
    //                  valid: false
    //              ]
    //          }
    //      }
    //  }
    this.status = {
        __self__: {
            invalid: false,
            valid: true
        }
    };
};

// Для полей, перечисленных в ошибках `errors`, выставляет флаг
// невалидности с именем `flag`. Если указан путь `base`, то он будет
// добавлен к названию полей ошибок.
ValidityStatus.prototype.loadErrors = function(flag, errors, base) {
    var path = [],
        stack = [this.status];
    if (base != null) {
        var keys = base.split(".");
        for (var i = 0, il = keys.length; i < il; i++) {
            var key = keys[i];
            if (key === "") {
                throw new Error("Invalid base '" + base + "'");
            } else if (key === "__self__") {
                throw new Error("Mustn't use '__self__' in base '"
                        + base + "'");
            }
            var val = stack[i];
            val[key] = val[key] || {};
            stack.push(val[key]);
            path.push(key);
        }
    }
    loadErrors(this, flag, stack.pop(), errors,
            path.length ? path.join("_") + "_" : "");
    for (i = path.length - 1; i >= 0; i--) {
        updateValidity(this, stack[i],
                i ? path.slice(0, i).join("_") + "_" : "");
    }
};

// Убирает у всех полей флаги невалидности `flags`. Если указан путь
// `base`, то обработаны будут только те поля, которые расположены по
// этому пути.
ValidityStatus.prototype.removeErrors = function(flags, base) {
    var path = [],
        stack = [this.status];
    if (!_.isArray(flags)) {
        flags = [flags];
    }
    if (base != null) {
        var keys = base.split(".");
        for (var i = 0, il = keys.length; i < il; i++) {
            var key = keys[i];
            if (key === "") {
                throw new Error("Invalid base '" + base + "'");
            } else if (key === "__self__") {
                throw new Error("Mustn't use '__self__' in base '"
                        + base + "'");
            }
            var val = stack[i];
            val[key] = val[key] || {};
            stack.push(val[key]);
            path.push(key);
        }
    }
    removeErrors(this, flags, stack.pop(),
            path.length ? path.join("_") + "_" : "");
    for (i = path.length - 1; i >= 0; i--) {
        updateValidity(this, stack[i],
                i ? path.slice(0, i).join("_") + "_" : "");
    }
};

// Устанавливает значение флага проверки валидности поля и рекурсивно
// обновляет статус валидации родительских полей.
ValidityStatus.prototype.set = function(keypath, status) {
    var keys = keypath.split("."),
        path = [],
        stack = [this.status];
    for (var i = 0, il = keys.length; i < il; i++) {
        var key = keys[i];
        if (key === "") {
            throw new Error("Invalid keypath '" + keypath + "'");
        } else if (key === "__self__") {
            throw new Error("Mustn't use '__self__' in keypath '"
                    + keypath + "'");
        }
        var val = stack[i];
        if (i + 1 === il) {
            val.__self__ = val.__self__ || {};
            val.__self__[key] = status;
            this.model.set(
                    (i ? path.join("_") + "_$" : "$") + key,
                    status);
            break;
        } else {
            val[key] = val[key] || {};
        }
        stack.push(val[key]);
        path.push(key);
    }
    for (i = stack.length - 1; i >= 0; i--) {
        updateValidity(this, stack[i],
                i ? path.slice(0, i).join("_") + "_" : "");
    }
};

function loadErrors(vs, flag, val, err, attrpref) {
    for (var key in err) {
        if (key === "__self__") {
            if (err.__self__.length) {
                val.__self__ = val.__self__ || {};
                val.__self__[flag] = true;
                vs.model.set(attrpref + "$" + flag, true);
            }
        } else {
            val[key] = val[key] || {};
            loadErrors(vs, flag, val[key], err[key],
                    attrpref + key + "_");
        }
    }
    updateValidity(vs, val, attrpref);
}

function removeErrors(vs, flags, val, attrpref) {
    for (var key in val) {
        if (key === "__self__") {
            for (var i = flags.length - 1; i >= 0; i--) {
                var flag = flags[i];
                delete val.__self__[flag];
                vs.model.unset(attrpref + "$" + flag);
            }
        } else if (_.isObject(val[key])) {
            removeErrors(vs, flags, val[key], attrpref + key + "_");
        }
    }
    updateValidity(vs, val, attrpref);
}

function updateValidity(vs, val, attrpref) {
    var key,
        valid = true;
    val.__self__ = val.__self__ || {};
    for (key in val.__self__) {
        if (key !== "invalid" && key !== "valid"
                && val.__self__[key]) {
            valid = false;
        }
    }
    if (valid) {
        for (key in val) {
            if (key !== "__self__"
                    && val[key].__self__.invalid) {
                valid = false;
            }
        }
    }
    val.__self__.invalid = !valid;
    val.__self__.valid = valid;
    vs.model.set(attrpref + "$invalid", !valid);
    vs.model.set(attrpref + "$valid", valid);
}

module.exports = ValidityStatus;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $ = __webpack_require__(4);

/**
 * Параметры виджета.
 *
 * @namespace  Widget~Settings
 * @property  {String} name
 *            Имя виджета (id тега виджета).
 * @property  {String} constructor
 *            Функция-конструктор виджета.
 */

/**
 * Создаёт виджет.
 *
 * @constructor
 * @param  {Widget~Settings} settings
 *         Параметры виджета.
 */
var Widget = function(settings) {
    settings = (settings == null ? {} : settings);
    if (settings.name == null || settings.name === "") {
        throw new Error("Undefined 'settings.name' param");
    }
    this.name = settings.name;
};

/**
 * Возвращает элемент, который содержит тело виджета.
 *
 * @returns  {jQuery}
 *           Объект jQuery.
 */
Widget.prototype.getWidgetObj = function() {
    return $("#" + this.name);
};

module.exports = Widget;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $ = __webpack_require__(4);

/**
 * Шаблонная страница.
 *
 * @namespace
 */
var template = {
    __config: null,
    __widgets: {}
};

/**
 * Создаёт виджет.
 *
 * @static
 * @param  {Widget~Settings} settings
 *         Параметры виджета.
 * @returns  Виджет.
 */
template.createWidget = function(settings) {
    var name = settings.constructor;
    if (name in this.__widgets) {
        return new (template.__widgets[name])(settings);
    } else {
        throw new Error("Can't find widget '" + name + "'");
    }
};

/**
 * Возвращает адрес корня сайта. Если адрес не пустой, то проверяется,
 * чтобы он оканчивался на `/`.
 *
 * @static
 * @returns  {String}
 *           Корень адреса сайта.
 */
template.getBaseUrl = function() {
    var base = $("base").attr("href") || "";
    return (base && base.charAt(base.length - 1) !== "/"
            ? base + "/" : base);
};

/**
 * Возвращает конфигурацию страницы.
 *
 * @returns  {Object}
 *           Объект конфигурации страницы.
 */
template.getConfig = function() {
    if (this.__config == null) {
        this.__config = JSON.parse($(".template-config").html());
    }
    return this.__config;
};

/**
 * Возвращает язык страницы.
 *
 * @returns  {String}
 *           Код языка.
 */
template.getLang = function() {
    var lang = this.getConfig().lang;
    return (lang == null ? "en" : lang);
};

/**
 * Отправляет на другую страницу.
 *
 * @static
 * @param  {Object} settings
 *         Параметры запроса:
 *           - {String} method
 *             Метод отправки формы - get или post.
 *           - {Object} params
 *             Объект, который содержит параметры запроса.
 *           - {String} url
 *             URL запроса. Параметр по умолчанию.
 */
template.directTo = function(settings) {
    var method, params, url;
    settings = (settings == null ? {} : settings);
    if (settings instanceof Object) {
        method = (settings.method == null ? "get" : settings.method);
        params = (settings.params == null ? {} : settings.params);
        url = (settings.url == null ? "" : settings.url);
    } else {
        method = "get";
        params = {};
        url = (settings == null ? "" : settings);
    }
    var formObj = $('<form class="hidden" method="' + method
            + '" action="' + url + '"></form>')
        .appendTo($("body"));
    if (params instanceof Array) {
        for (var p = 0, plen = params.length; p < plen; p++) {
            formObj.append('<input name="' + params[p].name
                    + '" value="' + params[p].value + '">');
        }
    } else {
        for (var pname in params) {
            if (params[pname] instanceof Array) {
                for (var i = 0, len = params[pname].length; i < len; i++) {
                    formObj.append('<input name="' + pname
                            + '" value="' + params[pname][i] + '">');
                }
            } else {
                formObj.append('<input name="' + pname
                        + '" value="' + params[pname] + '">');
            }
        }
    }
    formObj.submit();
};

/**
 * Регистрирует виджет в шаблоне.
 *
 * @param  {String} name
 *         Имя виджета.
 * @param  {Widget} constr
 *         Конструктор виджета.
 */
template.registerWidget = function(name, constr) {
    if (name in this.__widgets) {
        throw new Error("Widget '" + name + "' has  already been registered");
    }
    this.__widgets[name] = constr;
};

/**
 * Возвращает полный URL, добавляя в начало адрес корня сайта.
 *
 * @static
 * @param  {Object} settings
 *           - {String} adr
 *             Адрес запроса. Параметр по умолчанию. Если начинается
 *             со `/`, то URL будет рассчитан как `base` + `adr`.
 *           - {String} base
 *             Корень адреса сайта. Если не указан, то считывается из
 *             тэга `base`.
 *           - {Object} params
 *             Объект, который содержит параметры запроса.
 */
template.url = function(settings) {
    var adr, base, params, url;
    settings = (settings == null ? {} : settings);
    if (settings instanceof Object) {
        adr = (settings.adr == null ? "" : settings.adr);
        base = (settings.base == null
                ? template.getBaseUrl() : settings.base);
        params = (settings.params == null
                ? "" : $.param(settings.params));
    } else {
        adr = settings;
        base = template.getBaseUrl();
        params = "";
    }
    // Если `adr` начинается на `/`, то присоединить `base`, иначе
    // использывать только `adr`
    if (base != null && base !== "" && base !== "/"
            && adr.charAt(0) === "/") {
        // Избежать `//` при присоединении
        if (base.charAt(base.length - 1) === "/") {
            adr = adr.substring(1);
        }
        url = base + adr;
    } else {
        url = adr;
    }
    // Если URL уже содержит `?`, то параметры подставлять начиная с `&`
    if (params) {
        params = (url.indexOf("?") >= 0 ? "&" : "?") + params;
    }
    return url + params;
};

module.exports = template;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Backbone = __webpack_require__(0);
var ValidityStatus = __webpack_require__(1);

var email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Валидируемая форма
// ------------------
module.exports = Backbone.Model.extend({

    // Инициализация модели.
    constructor: function() {
        Backbone.Model.apply(this, arguments);
        var self = this;

        // Обрабатывать изменение каждого поля формы отдельно.
        for (var key in this.attributes) {
            this.on("change:" + key, getChangeHandler(key));
        }

        // Ошибки валидации из ответа сервиса.
        this.errors = {};

        // Обработчики событий синхронизации модели с сервером.
        this.handlers = {
            error: function(resp) {
                if (resp && resp.errors) {
                    self.errors = resp.errors;
                    self.validityStatus.loadErrors(
                            "serviceValidity", resp.errors);
                } else {
                    self.errors = {};
                    self.validityStatus.set("serviceError", true);
                }
            }
        };

        // Статус валидации формы.
        this.validityStatus = new ValidityStatus();
    },

    // Убеждается, что значение является корректным email-адресом.
    assertEmail: function(keypath, value) {
        return this.makeValidation(keypath, email.test(value));
    },

    // Убеждается, что условие истинно и обновляет статус проверки
    // валидности поля.
    makeValidation: function(keypath, condition) {
        this.validityStatus.set(keypath, !condition);
        return condition;
    },

    // Валидирует форму.
    // см. Backbone.Model.prototype.validate
    validate: function() {
        this.validityStatus.removeErrors(
                ["serviceError", "serviceValidity"]);
        this.errors = {};
        if (this.validityStatus.status.__self__.invalid) {
            return "Form is invalid";
        }
    }

});

function getChangeHandler(key) {
    return function(model, value, options) {
        var attrs = {};
        attrs[key] = value;
        model.validate(attrs, options);
    };
}


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _ = __webpack_require__(5),
    Backbone = __webpack_require__(0);
var template = __webpack_require__(3);

var Service = function() {};

_.extend(Service.prototype, {

    // URL сервиса.
    url: null,

    // Хэш-коллекция методов сервиса.
    api: {},

    // Вызывает метод сервиса.
    apply: function(name, args) {
        var apiMethod = getApiMethod(this, name);
        if (apiMethod) {
            return apiMethod.func.apply(this, args);
        }
    },

    // Связывает модель/коллекцию с сервисом.
    bind: function(model) {
        if (model) {
            model.service = this;
            model.sync = function() {
                return Service.sync.apply(this, arguments);
            };
        }
    },

    // Вызывает метод сервиса.
    call: function(name) {
        var apiMethod = getApiMethod(this, name);
        if (apiMethod) {
            if (arguments.length > 1) {
                var args = Array.prototype.slice.call(arguments, 1);
                return apiMethod.func.apply(this, args);
            } else {
                return apiMethod.func.call(this);
            }
        }
    },

    // Callback `Service.provider(model, options)`, настраивает методы
    // сервиса в процессе синхронизации.
    provider: null

});

// Создаёт потомка сервиса.
Service.extend = Backbone.Model.extend;

// Синхронизирует модель/коллекцию.
Service.sync = function(method, model, options) {
    options || (options = {});

    // Backbone при синхронизации передаёт параметр `method`. По нему
    // находим в `model.apiMapping` имя метода сервиса. Если при
    // синхронизации модели нужно использывать другой метод сервиса, то
    // его можно указать через `options.apiMethod`.
    if (options.apiMethod) {
        method = options.apiMethod;
    } else {
        method = getApiMethodName(model, method);
        if (!method) {
            throw new Error("Unsupported sync method '" + method + "'");
        }
    }
    var apiMethod = getApiMethod(model.service, method);
    if (!apiMethod) {
        throw new Error("Unsupported API method '" + method + "'");
    }

    // Выполнить специфичные для метода сервиса настройки.
    var provider = (apiMethod.provider !== undefined
            ? apiMethod.provider : model.service.provider);
    if (provider) {
        provider(model, options);
    }

    // Атрибуты модели. Для коллекции массив будет использован как
    // объект.
    var attrs = _.extend(model.toJSON(options), options.attrs);

    var type = apiMethod.type;

    // Получить URL с подстановкой аттрибутов модели в шаблон адреса
    // запроса.
    var url = getSyncUrl(model.service, attrs, apiMethod);

    // Добавить параметры запроса в URL.
    if (apiMethod.params) {
        url = template.url({
            adr: url,
            base: "",
            params: getParamsObj(attrs, apiMethod.params)
        });
    }

    var defaults = {
        dataType: "json",
        type: type,
        url: url
    };

    // Ensure that we have the appropriate request data.
    if (options.data === undefined && model && (
            type === "POST" || type === "PUT" || type === "PATCH")) {
        defaults.contentType = "application/json";
        defaults.data = JSON.stringify(
                options.attrs || model.toJSON(options));
        defaults.processData = false;
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(defaults, options));
    model.trigger("request", model, xhr, options);
    return xhr;
};

function copyObjectValue(src, dest, keypath) {
    var keys = keypath.split(".");
    for (var i = 0, il = keys.length; i < il; i++) {
        var key = keys[i];
        if (i === il - 1) {
            dest[key] = src[key];
        } else {
            dest[key] = dest[key] || {};
            src = src[key];
            dest = dest[key];
        }
    }
}

function getApiMethod(service, name) {
    if (service.api) {
        var apiMethod = service.api[name];
        if (!apiMethod) {
            apiMethod = getApiMethod(
                    service.constructor.__super__, name);
        }
        return apiMethod;
    }
}

function getApiMethodName(model, method) {
    if (model.apiMapping) {
        var name = model.apiMapping[method];
        if (!name) {
            name = getApiMethodName(
                    model.constructor.__super__, method);
        }
        return name;
    }
}

function getObjectValue(obj, keypath) {
    var keys = keypath.split(".");
    var val = obj;
    for (var i = 0, il = keys.length; i < il; i++) {
        val = val[keys[i]];
    }
    return val;
}

function getParamsObj(attrs, params) {
    var result = {};
    if (_.isArray(params)) {
        for (var i = 0, il = params.length; i < il; i++) {
            copyObjectValue(attrs, result, params[i]);
        }
    } else {
        for (var key in params) {
            result[params[key]] = getObjectValue(attrs, key);
        }
    }
    return result;
}

function getSyncUrl(service, attrs, apiMethod) {
    var syncUrl = service.url,
        path = apiMethod.path;
    if (path.length > 0) {
        if (syncUrl.charAt(syncUrl.length - 1) === "/") {
            syncUrl = syncUrl.substring(0, syncUrl.length - 1);
        }
        var paths = path.split("/");
        for (var i = 0, il = paths.length; i < il; i++) {
            var p = paths[i], q;
            if (p.charAt(0) === "{"
                    && p.charAt(p.length - 1) === "}") {
                q = getObjectValue(attrs, p.substring(1, p.length - 1));
            } else {
                q = p;
            }
            if (q.toString() !== "") {
                syncUrl += "/" + encodeURIComponent(q);
            }
        }
        if (path.charAt(path.length - 1) === "/") {
            syncUrl += "/";
        }
    }
    return syncUrl;
}

module.exports = Service;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Widget = __webpack_require__(2);

/**
 * Параметры представления.
 *
 * @namespace  View~Settings
 * @augments  Widget~Settings
 * @property  {String} [name="config-widget"]
 *            Имя виджета (id тега виджета).
 */

/**
 * Создаёт представление.
 *
 * @constructor
 * @augments  Widget
 * @param  {View~Settings} settings
 *         Параметры представления.
 */
var View = function(settings) {
    settings = (settings == null ? {} : settings);
    settings.name = (settings.name == null
        ? "content-widget" : settings.name);
    Widget.call(this, settings);
};

View.prototype = Object.create(Widget.prototype);
View.prototype.constructor = View;

module.exports = View;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function(model, options) {
    var success = options.success;
    options.success = function(resp) {
        switch (resp.status) {
            case "INVALID":
                if (options.error) {
                    options.error(resp.errors);
                }
                break;
            case "SUCCESS":
                if (success) {
                    success(resp.data);
                }
                break;
            default:
                if (options.error) {
                    options.error();
                }
        }
    };
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

exports.Form = __webpack_require__(6);
exports.Service = __webpack_require__(7);
exports.ValidityStatus = __webpack_require__(1);
exports.View = __webpack_require__(8);
exports.Widget = __webpack_require__(2);
exports.restyProvider = __webpack_require__(9);
exports.template = __webpack_require__(3);

/***/ })
/******/ ]);
});
//# sourceMappingURL=warby.js.map