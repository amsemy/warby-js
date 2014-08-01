(function(ns) {

    'use strict';

    var unit = ns.unit('com.github.amsemy.warby.template', implementation);

    unit.require('lib.*');

    function implementation(units) {
        var $ = units.lib.$;

        /**
         * Шаблонная страница.
         *
         * @namespace
         */
        var template = {
            __config: null
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
            return new (getModule(settings.constructor))(settings);
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

        var getModule = function(name) {
            var parts = name.split(".");
            if (parts.length === 0) {
                throw new Error("Invalid module name '" + name + "'");
            } else {
                var parent = units;
                var current, part;
                for (var i = 0, len = parts.length; i < len; i++) {
                    part = parts[i];
                    current = parent[part];
                    if (current === undefined) {
                        throw new Error("Can't find the specified module '"
                                + name + "'");
                    }
                    parent = current;
                }
                return current;
            }
        };

        return template;

    }

})(gumup);
