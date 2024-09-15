/**
 * jquery-match-height master by @liabru
 * http://brm.io/jquery-match-height/
 * License: MIT
 */

;(function (factory) { // eslint-disable-line no-extra-semi
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Global
        factory(jQuery);
    }
})(function ($) {

    var matchHeight = $.fn.matchHeight = function (options) {
        var opts = $.extend({}, $.fn.matchHeight._defaults, options);

        if (opts.remove) {
            $.each($.fn.matchHeight._groups, function () {
                var group = this;
                group.elements = group.elements.not(this.elements);
            });
            return this;
        }

        if (this.length <= 1 && !opts.target) {
            return this;
        }

        var group = {elements: this, options: opts};
        $.fn.matchHeight._groups.push(group);
        $.fn.matchHeight._apply(this, opts);

        return this;
    };

    matchHeight._apply = function (elements, options) {
        var opts = $.extend({}, $.fn.matchHeight._defaults, options);

        var rows = [$(elements)];

        if (opts.byRow) {
            var targetHeight = 0;

            if (!opts.target) {
                rows = $.fn.matchHeight._rows(elements);
                $.each(rows, function () {
                    var row = this;
                    var maxHeight = 0;
                    row.each(function () {
                        var $this = $(this);
                        var verticalPadding = 0;
                        if ($this.css('box-sizing') !== 'border-box') {
                            verticalPadding += _parse($this.css('border-top-width')) + _parse($this.css('border-bottom-width'));
                            verticalPadding += _parse($this.css('padding-top')) + _parse($this.css('padding-bottom'));
                        }
                        maxHeight = Math.max(maxHeight, $this.outerHeight(false) + verticalPadding);
                    });
                    targetHeight = Math.max(targetHeight, maxHeight);
                });
            } else {
                targetHeight = $(opts.target).outerHeight(false);
            }

            $.each(rows, function () {
                var row = this;
                row.each(function () {
                    var $this = $(this);
                    var verticalPadding = 0;
                    if ($this.css('box-sizing') !== 'border-box') {
                        verticalPadding += _parse($this.css('border-top-width')) + _parse($this.css('border-bottom-width'));
                        verticalPadding += _parse($this.css('padding-top')) + _parse($this.css('padding-bottom'));
                    }
                    $this.css('min-height', (targetHeight - verticalPadding) + 'px');
                });
            });
        }
    };

    $.fn.matchHeight._rows = function (elements) {
        var tolerance = 1;
        var $elements = $(elements);
        var lastTop = null;
        var rows = [];

        $elements.each(function () {
            var $that = $(this),
                top = $that.offset().top - _parse($that.css('margin-top')),
                lastRow = rows.length > 0 ? rows[rows.length - 1] : null;

            if (lastRow === null) {
                rows.push($that);
            } else {
                if (Math.floor(Math.abs(lastTop - top)) <= tolerance) {
                    rows[rows.length - 1] = lastRow.add($that);
                } else {
                    rows.push($that);
                }
            }

            lastTop = top;
        });

        return rows;
    };

    $.fn.matchHeight._applyDataApi = function () {
        $('[data-match-height], [data-mh]').each(function () {
            var group = $(this).attr('data-mh') || $(this).attr('data-match-height');
            $(this).matchHeight({
                byRow: true,
                property: 'min-height',
                target: null,
                remove: false
            });
        });
    };

    $.fn.matchHeight._update = function (event) {
        $.each($.fn.matchHeight._groups, function () {
            $.fn.matchHeight._apply(this.elements, this.options);
        });
    };

    $($.fn.matchHeight._applyDataApi);

    $(window).on('load', function() {
        $(window).trigger('resize');
        var $body = $('body');
        $body.css('width', '100%');
        $body.css('max-width', '100%');
        $body.css('margin', '0 auto');
    });
    $(window).on('resize orientationchange', function (event) {
        clearTimeout($.fn.matchHeight._updateTimeout);
        $.fn.matchHeight._updateTimeout = setTimeout($.fn.matchHeight._update, $.fn.matchHeight._throttle);
    });

});


