'use strict';

var $ = require("jquery");

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
