/**
 * Created by Administrator on 2016/9/7.
 */

spa.shell = ( function () {
    'use strict';
    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN MODULE SCAPE VARIABLES  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - -
    var
        configMap = {
            anchor_schema_map : {
                chat : {
                    opened : true,
                    closed : true
                }
            },
            main_html : new String()
            + '<div class="spa-shell-head">'
                + '<div class="spa-shell-head-logo">'
                    + '<h1>SPA</h1>'
                    + '<p>Javascript end to end</p>'
                + '</div>'
                + '<div class="spa-shell-head-acct"></div>'
            + '</div>'
            + '<div class="spa-shell-main">'
            + '<div class="spa-shell-main-nav"></div>'
            + '<div class="spa-shell-main-content"></div>'
            + '</div>'
            + '<div class="spa-shell-foot"></div>'
            + '<div class="spa-shell-chat"></div>',
            chat_extend_time : 1000,
            chat_retract_time : 300,
            chat_extend_height : 450,
            chat_retract_height : 15,
            chat_extended_title : 'Click to retract',
            chat_retracted_title : 'Click to extend',
            resize_interval : 200
        },
        stateMap = {
            $container : null,
            anchor_map : {},
            is_chat_retracted : true,
            resize_idto : undefined
        },
        jqueryMap = {},
        setJqueryMap, initModule,
        onClickChat,
        copyAnchorMap,
        changeAnchorPart,
        onHashChange,
        onTapAcct,
        onLogin,
        onLogout,
        onResize,
        setChatAnchor
     ;
    //- - - - - - - - - - - - - -  - - - - - - - -   END MODULE SCAPE VARIABLES  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN UTILITY METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - -
    copyAnchorMap = function () {
        return $.extend( true, {}, stateMap.anchor_map );
    }

    //- - - - - - - - - - - - - -  - - - - - - - -   END UTILITY METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN DOM METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - -

    changeAnchorPart = function ( arg_map ) {
        var
            anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;

        KEYVAL:
        for ( key_name in arg_map ){
            if ( arg_map.hasOwnProperty( key_name ) ) {
                if ( key_name.indexOf( '_' ) === 0 ) {
                    continue KEYVAL;
                }
                anchor_map_revise[ key_name ] = arg_map[ key_name ];
                key_name_dep = '_' + key_name;
                if ( arg_map[ key_name_dep ] ) {
                    anchor_map_revise[ key_name_dep ] = arg_map[ key_name_dep ];
                }else {
                    delete anchor_map_revise[ key_name_dep ];
                    delete anchor_map_revise[ '_s' + key_name_dep ];
                }
            }
        }
        try {
            $.uriAnchor.setAnchor( anchor_map_revise );
        }
        catch ( error ) {
            $.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
            bool_return = false;
        }
        return bool_return;
    }

    // Begin DOM method /setJqueryMap/
    setJqueryMap = function (  ) {
        var $container = stateMap.$container;
        jqueryMap = {
            $container : $container,
            $acct : $container.find( '.spa-shell-head-acct' ),
            $nav : $container.find( '.spa-shell-main-nav' )
        };
    }
    // End DOM method /setJqueryMap/

    //- - - - - - - - - - - - - -  - - - - - - - -   END DOM METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN EVENT HANDLERS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - -

    // Begin Event handler /onResize/
    onResize = function () {
        if ( stateMap.resize_idto ) {
            return true;
        }
        spa.chat.handleResize();
        stateMap.resize_idto = setTimeout( function () {
            stateMap.resize_idto = undefined;
        }, configMap.resize_interval );
        return true;
    }
    // End Event handler /onResize/

    /**
     *
     * @param event
     */
    onHashChange = function ( event ) {
        var anchor_map_previous = copyAnchorMap(),
            is_ok = true,
            anchor_map_proposed,
            _s_chat_previous, _s_chat_proposed,
            s_chat_proposed;
        try {
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
        }catch ( error ) {
            $.uriAnchor.setAnchor( anchor_map_previous,null, true );
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;
        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;
       if ( !anchor_map_previous || _s_chat_previous !== _s_chat_proposed ) {
           s_chat_proposed = anchor_map_proposed.chat;
           switch ( s_chat_proposed ) {
               case 'opened':
                   is_ok = spa.chat.setSliderPosition( 'opened' );
                   break;
               case 'closed':
                   is_ok = spa.chat.setSliderPosition( 'closed' );
                   break;
               default:
                   spa.chat.setSliderPosition( 'closed' );
                   delete anchor_map_proposed.chat;
                   $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
           }
       }

       if ( ! is_ok ) {
           if ( anchor_map_previous ) {
               $.uriAnchor.setAnchor( anchor_map_previous, null, true );
               stateMap.anchor_map = anchor_map_previous;
           }else {
               delete anchor_map_proposed.chat;
               $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
           }
       }
        return false;
    }

    onClickChat = function ( event ) {

      /*if  (toggleChat( stateMap.is_chat_retracted )) {
          $.uriAnchor.setAnchor( {
              chat : ( stateMap.is_chat_retracted ? 'open' : 'closed' )
          });
      };*/

        changeAnchorPart( {
            chat : ( stateMap.is_chat_retracted ? 'open' : 'closed' )
        } );
        return false;
    }

    onTapAcct = function (  ) {
        var user = spa.model.people.get_user(),
             user_name;
        if ( user.get_is_anon() ) {
            user_name = prompt( 'Please sign-in' );
            spa.model.people.login( user_name );
            jqueryMap.$acct.text( '...process...' );
        }else {
            spa.model.people.logout();
        }
        return false;
    }

    onLogin = function ( event, login_user ) {
        jqueryMap.$acct.text( login_user.name );
    }

    onLogout = function (  ) {
        jqueryMap.$acct.text( 'Please sign-in' );
    }

    //- - - - - - - - - - - - - -  - - - - - - - -   END EVENT HANDLERS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN CALLBACK  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - -
    setChatAnchor = function ( position_type ) {
        return changeAnchorPart( { chat : position_type } );
    }

    //- - - - - - - - - - - - - -  - - - - - - - -   END CALLBACK  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN PUBLIC METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - -
    // Begin Public method /initModule/
    initModule = function ( $container ) {
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        $container.html( configMap.main_html );
        setJqueryMap();

        // initialize chat slider and bind click handler


        //configure uriAnchor to use our schema
        $.uriAnchor.configModule( {
            schema_map : configMap.anchor_schema_map
        } );

        //configure and initialize feature modules
        spa.chat.configModule({
            set_chat_anchor : setChatAnchor,
            chat_model      : spa.model.chat,
            people_model    : spa.model.people
        });
        spa.chat.initModule( jqueryMap.$container );

        spa.avtr.configModule( {
            chat_model : spa.model.chat,
            people_model : spa.model.people
        } );
        spa.avtr.initModule( jqueryMap.$nav );

        //Handle URI anchor change events
        $( window )
            .bind( 'resize', onResize )
            .bind( 'hashchange', onHashChange )
            .trigger( 'hashchange' );

        $.gevent.subscribe( $container, 'spa-login', onLogin );
        $.gevent.subscribe( $container, 'spa-logout', onLogout );
        jqueryMap.$acct.text( 'Please sign-in' ).on( 'utap', onTapAcct );

    }
    // End Public method /initModule/

    return {
      initModule : initModule
    };
    //- - - - - - - - - - - - - -  - - - - - - - -   END PUBLIC METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - -


} () );
