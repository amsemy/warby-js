(function(ns) {

    'use strict';

    var unit = ns.unit('com.github.amsemy.warby.Service', implementation);

    unit.require('com.github.amsemy.warby.response.FailureResponse');
    unit.require('com.github.amsemy.warby.response.InvalidResponse');
    unit.require('com.github.amsemy.warby.response.SuccessResponse');
    unit.require('com.github.amsemy.warby.template');
    unit.require('lib.*');

    function implementation(units) {
        var Backbone = units.lib.Backbone,
            _ = units.lib._;
        var FailureResponse = units.com.github.amsemy.warby.response.FailureResponse,
            InvalidResponse = units.com.github.amsemy.warby.response.InvalidResponse,
            SuccessResponse = units.com.github.amsemy.warby.response.SuccessResponse,
            template = units.com.github.amsemy.warby.template;

        var Service = function() {};

        _.extend(Service.prototype, {

            // URL сервиса.
            url: null,

            // Хэш-коллекция методов сервиса.
            api: {},

            // Вызывает функцию сервиса.
            apply: function(name, args) {
                var apiFunc = getApiFunc(this, name);
                if (apiFunc) {
                    return apiFunc.func.apply(this, args);
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

            // Вызывает функцию сервиса.
            call: function(name) {
                var apiFunc = getApiFunc(this, name);
                if (apiFunc) {
                    if (arguments.length > 1) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        return apiFunc.func.apply(this, args);
                    } else {
                        return apiFunc.func.call(this);
                    }
                }
            }

        });

        // Создаёт потомка сервиса.
        Service.extend = Backbone.Model.extend;

        // Синхронизирует модель/коллекцию.
        Service.sync = function(method, model, options) {
            options || (options = {});

            // Атрибуты модели. Для коллекции массив будет использован как
            // объект.
            var attrs = _.extend(model.toJSON(options), options.attrs);

            // Если при синхронизации модели нужно использывать другую функцию
            // сервиса, то её можно указать через `options.func`.
            var name = options.func;

            // Backbone при синхронизации передаёт параметр `method`. По нему
            // находим в `model.apiMapping` имя функции сервиса.
            if (!options.func) {
                name = getApiFuncName(model, method);
                if (!name) {
                    throw new Error("Unsupported sync method '" + method + "'");
                }
            }
            var apiFunc = getApiFunc(model.service, name);
            if (!apiFunc) {
                throw new Error("Unsupported API function '" + name + "'");
            }

            var type = apiFunc.type;

            // Получить URL с подстановкой аттрибутов модели в шаблон адреса
            // запроса.
            var url = getSyncUrl(model.service, attrs, apiFunc);

            // Добавить параметры запроса в URL.
            if (apiFunc.params) {
                url = template.url({
                    adr: url,
                    base: "",
                    params: getParamsObj(attrs, apiFunc.params)
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

            // Извлечь результат запроса из контейнера.
            var success = options.success;
            options.success = function(resp) {
                var r = parseResponse(resp);
                if (r instanceof SuccessResponse) {
                    if (success) {
                        success(r.data);
                    }
                } else {
                    if (options.error) {
                        options.error(r);
                    }
                }
            };

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

        function getApiFunc(service, name) {
            if (service.api) {
                var apiFunc = service.api[name];
                if (!apiFunc) {
                    apiFunc = getApiFunc(service.constructor.__super__, name);
                }
                return apiFunc;
            }
        }

        function getApiFuncName(model, method) {
            if (model.apiMapping) {
                var name = model.apiMapping[method];
                if (!name) {
                    name = getApiFuncName(model.constructor.__super__, method);
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

        function getSyncUrl(service, attrs, apiFunc) {
            var syncUrl = service.url,
                path = apiFunc.path;
            if (path.length > 0) {
                if (syncUrl.charAt(syncUrl.length - 1) === "/") {
                    syncUrl = syncUrl.substring(0, syncUrl.length - 1);
                }
                var paths = path.split("/");
                for (var i = 0, il = paths.length; i < il; i++) {
                    var p = paths[i];
                    if (p.charAt(0) === "{"
                            && p.charAt(p.length - 1) === "}") {
                        var q = getObjectValue(attrs,
                                p.substring(1, p.length - 1));
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

        function parseResponse(resp) {
            switch (resp.status) {
                case "INVALID":
                    return new InvalidResponse(resp);
                    break;
                case "SUCCESS":
                    return new SuccessResponse(resp);
                    break;
                default:
                    return new FailureResponse();
            }
        }

        return Service;
    }

})(gumup);
