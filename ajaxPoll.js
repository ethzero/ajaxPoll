/*
    Origins:
        Name:   ajaxPoll.js
        Author: Nick Riggs
        Source: http://69.89.31.214/~nickrigg/wp-content/uploads/2009/08/ajaxPoll.js
        Documentation: http://www.nickriggs.com/posts/simple-ajax-polling-plugin-for-jquery/

    GitHub:
        Uploaded-by: ethzero
        Source: https://github.com/ethzero/ajaxPoll

*/

(function($) {

    jQuery.ajaxPoll = function(s) {

        var options = jQuery.extend({}, jQuery.ajaxPollSettings, jQuery.extend({}, jQuery.ajaxPoll.defaults, s));
        var start = (new Date()).getTime();
        var complete = false;
        var attempts = 0;

        options.successCallback = options.success;
        options.complateCallback = options.complete;
        options.errorCallback = options.error;

        var expire = function() {
            if (options.expired)
                options.expired();

            complete = true;
        };

        options.success = function(data, textStatus) {

            if (options.successCondition(data)) {
                complete = true;

                if (options.successCallback)
                    options.successCallback(data, textStatus);

                return;
            }

            var wait = null;

            if (options.pollingType == "interval") {
                attempts++;

                if (options.expireAfter && attempts >= options.expireAfter) {
                    expire();
                    return;
                }

                wait = options.interval;
            }
            else {
                var sinceStart = (new Date()).getTime() - start;

                if (options.expireAfter && sinceStart >= options.expireAfter) {
                    expire();
                    return;
                }

                if (sinceStart > options.durationUntilMaxInterval)
                    sinceStart = options.durationUntilMaxInterval;

                wait = ((1 - ((options.durationUntilMaxInterval - sinceStart) / options.durationUntilMaxInterval)) * options.maxInterval) + options.interval;
            }

            setTimeout(function() { jQuery.ajax(options) }, wait);
        };

        options.error = function(XMLHttpRequest, textStatus, errorThrown) {
            complete = true;

            if (options.errorCallback)
                options.errorCallback(XMLHttpRequest, textStatus, errorThrown);
        };

        options.complete = function(XMLHttpRequest, textStatus) {
            if (complete && options.complateCallback)
                options.complateCallback(XMLHttpRequest, textStatus);
        };

        jQuery.ajax(options);
    };

    jQuery.postPoll = function(url, data, callback, type) {
        return jQuery.ajaxPoll({
            type: "POST",
            url: url,
            data: data,
            success: callback,
            dataType: type
        });
    };

    jQuery.getPoll = function(url, data, callback, type) {
        return jQuery.ajaxPoll({
            type: "GET",
            url: url,
            data: data,
            success: callback,
            dataType: type
        });
    };

    jQuery.ajaxPollSettings = {
        pollingType: "interval",
        interval: 500,
        maxInterval: 30,
        durationUntilMaxInterval: 30000,
        expireAfter: null,
        successCondition: function(result) {
            if (result != null) {
                try {
                    return eval(result)["complete"];
                }
                catch (ex) {
                    return false;
                }
            }

            return false;
        }
    };

    jQuery.ajaxPollSetup = function(settings) {
        jQuery.extend(jQuery.ajaxPollSettings, settings);
    };

    jQuery.ajaxPoll.defaults = {        
        expired: null
    };

})(jQuery);