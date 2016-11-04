/**
 * Created by Administrator on 2016/9/7.
 */

var spa = ( function () {
    'use strict';
    var initModule = function ( $container ) {
        spa.model.initModule();
        spa.shell.initModule( $container );
    };

    return {
        initModule : initModule
    };
} () );