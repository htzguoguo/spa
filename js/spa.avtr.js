/*
 * spa.avtr.js
 * Avatar feature module
 */
/*jslint browser : true, continue : true,
 devel : true, indent : 2, maxerr : 50,
 newcap : true, nomen : true, plusplus : true,
 regexp : true, sloppy : true, vars : false,
 white : true
 */
/*global $, spa */
spa.avtr = (function () {
    'use strict';
    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN MODULE SCAPE VARIABLES  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - -
    var
        configMap = {
            chat_model : null,
            people_model : null,
            settable_map : {
                chat_model : true,
                people_model : true
            }
        },
        stateMap = {
            drag_map : null,
            $drag_target : null,
            drag_bg_color : undefined
        },
        jqueryMap = {},
        getRandRgb, updateAvatar, onTapNav, onHeldstartNav,
        onHeldmoveNav, onHeldendNav, onSetchatee, onListchange,
        onLogout,
        setJqueryMap, configModule, initModule;
    //- - - - - - - - - - - - - -  - - - - - - - -   END MODULE SCAPE VARIABLES  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN UTILITY METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - -
    // example : getTrimmedString
    getRandRgb = function (  ) {
        var i, rgb_list = [];
        for ( i = 0; i < 3; i++ ) {
            rgb_list.push( Math.floor( Math.random() * 128 ) + 128 );
        }
        return 'rgb(' + rgb_list.join( ',' ) + ')';
    }
    //- - - - - - - - - - - - - -  - - - - - - - -   END UTILITY METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN PUBLIC DOM METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - - -
    // Begin DOM method /setJqueryMap/
    setJqueryMap = function ( $container ) {
        jqueryMap = {
            $container : $container
        };
    };

    updateAvatar = function ( $target ) {
        var css_map, person_id;
        css_map = {
            top : parseInt( $target.css( 'top' ), 10 ),
            left : parseInt( $target.css( 'left' ), 10 ),
            'background-color' : $target.css( 'background-color' )
        };
        person_id = $target.attr( 'data-id' );
        spa.model.chat.update_avatar( {
            person_id : person_id,
            css_map : css_map
        } );
    };
    // End DOM method /setJqueryMap/
    //- - - - - - - - - - - - - -  - - - - - - - -   END PUBLIC DOM METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN PRIVATE DOM METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - - -
    // Begin DOM method /setJqueryMap/

    // End DOM method /setJqueryMap/
    //- - - - - - - - - - - - - -  - - - - - - - -   END PRIVATE DOM METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN USER EVENT HANDLERS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - -
    // example: onClickButton = ...
    onTapNav = function ( event ) {
        var css_map,
            $target = $( event.elem_target ).closest( '.spa-avtr-box' );
        if ( $target.length === 0 ) {
            return false;
        }
        $target.css( {'background-color': getRandRgb()} );
        updateAvatar( $target );
    };

    onHeldstartNav = function ( event ) {
        var offset_target_map, offset_nav_map,
            $target = $( event.elem_target ).closest( '.spa-avtr-box' );
        if ( $target.length === 0 ) {
            return false;
        }
        stateMap.$drag_target = $target;
        offset_target_map = $target.offset();
        offset_nav_map = jqueryMap.$container.offset();
        offset_target_map.top -= offset_nav_map.top;
        offset_target_map.left -= offset_nav_map.left;
        stateMap.drag_map = offset_target_map;
        stateMap.drag_bg_color = $target.css( 'background-color' );
        $target.addClass( 'spa-x-is-drag' ).css( 'background-color', '' );
    };

    onHeldmoveNav = function ( event ) {
        var drag_map = stateMap.drag_map;
        if ( ! drag_map ) {
            return false;
        }
        drag_map.top += event.px_delta_y;
        drag_map.left += event.px_delta_x;
        stateMap.$drag_target.css(  {
            top : drag_map.top,
            left : drag_map.left
        } );
    };

    onHeldendNav = function ( event ) {
        var $drag_target = stateMap.$drag_target;
        if ( ! $drag_target ) {
            return false;
        }
        $drag_target.removeClass( 'spa-x-is-drag' ).css( 'background-color', stateMap.drag_bg_color );
        stateMap.drag_bg_color = undefined;
        stateMap.$drag_target = null;
        stateMap.css_map = null;
        updateAvatar( $drag_target );
    };

    onSetchatee = function ( event, arg_map ) {
        var
            $nav = $( this ),
            new_chatee = arg_map.new_chatee,
            old_chatee = arg_map.old_chatee;
        if ( old_chatee ) {
            $nav
                .find( '.spa-avtr-box[data-id=' + old_chatee.id + ']' )
                .removeClass( 'spa-x-is-chatee' );
        }
        if ( new_chatee ) {
            $nav
                .find( '.spa-avtr-box[data-id=' + new_chatee.id  + ']')
                .addClass( 'spa-x-is-chatee' );
        }
    };

    onListchange = function ( event ) {
        var
            $nav = $( this ),
            people_db = spa.model.people.get_db(),
            user = spa.model.people.get_user(),
            chatee = spa.model.chat.get_chatee() || {},
            $box;
        $nav.empty();
        if ( user.get_is_anon() ) {
            return false;
        }
        people_db().each( function ( person, inx ) {
            var class_list;
            if ( person.get_is_anon() ) {
                return true;
            }
            class_list = [ 'spa-avtr-box' ];
            if ( person.id === chatee.id ) {
                class_list.push( 'spa-x-is-chatee' );
            }
            if ( person.get_is_user() ) {
                class_list.push( 'spa-x-is-user' );
            }
            $box = $( '<div/>' )
                .addClass( class_list.join( ' ' ) )
                .css( person.css_map )
                .attr( 'data-id', String( person.id ) )
                .prop( 'title', spa.util_b.encodeHtml( person.name ) )
                .text( person.name )
                .appendTo( $nav );

        } );
    };

    onLogout = function () {
      jqueryMap.$container.empty();
    };
    //- - - - - - - - - - - - - -  - - - - - - - -   END USER EVENT HANDLERS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN MODEL EVENT HANDLERS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - -
    // example: onClickButton = ...
    //- - - - - - - - - - - - - -  - - - - - - - -   END MODEL EVENT HANDLERS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN PUBLIC METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - -
    // Begin public method /configModule/
    // Purpose : Adjust configuration of allowed keys
    // Arguments : A map of settable keys and values
    // * color_name - color to use
    // Settings :
    // * configMap.settable_map declares allowed keys
    // Returns : true
    // Throws : none
    //
    configModule = function ( input_map ) {
        spa.util.setConfigMap({
            input_map : input_map,
            settable_map : configMap.settable_map,
            config_map : configMap
        });
        return true;
    };
    // End public method /configModule/

    // Begin public method /initModule/
    // Purpose : Initializes module
    // Arguments :
    // * $container the jquery element used by this feature
    // Returns : true
    // Throws : nonaccidental
    //
    initModule = function ( $container ) {
        // load HTML and map jQuery collections
        setJqueryMap( $container );

        // initialize chat slider and bind click handler

        // configure uriAnchor to use our schema

        // configure and initialize feature modules

        // Handle URI anchor change events.
        // This is done /after/ all feature modules are configured
        // and initialized, otherwise they will not be ready to handle
        // the trigger event, which is used to ensure the anchor
        // is considered on-load

        // bind model global event
        $.gevent.subscribe( $container, 'spa-setchatee', onSetchatee );
        $.gevent.subscribe( $container, 'spa-listchange', onListchange );
        $.gevent.subscribe( $container, 'spa-logout', onLogout );

        // bind user input events
        $container
            .bind( 'utap', onTapNav )
            .bind( 'uheldstart', onHeldstartNav )
            .bind( 'uheldmove', onHeldmoveNav )
            .bind( 'uheldend', onHeldendNav );
        return true;
    };
    // End public method /initModule/

    // return public methods
    return {
        configModule : configModule,
        initModule : initModule
    };
    //- - - - - - - - - - - - - -  - - - - - - - -   END PUBLIC METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - - -

 }());
