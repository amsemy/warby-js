(function(ns) {

    'use strict';

    var unit = ns.unit('com.github.amsemy.warby.unit.View', implementation);

    unit.require('com.github.amsemy.warby.unit.Widget');

    function implementation(units) {
        var Widget = units.com.github.amsemy.warby.unit.Widget;

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

        return View;

    }

})(gumup);
