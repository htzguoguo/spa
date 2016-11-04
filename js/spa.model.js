/**
 * Created by Administrator on 2016/9/27.
 */
/*
 * spa.model.js
 * Model module
 */
/*jslint browser : true, continue : true,
 devel : true, indent : 2, maxerr : 50,
 newcap : true, nomen : true, plusplus : true,
 regexp : true, sloppy : true, vars : false,
 white : true
 */
/*global $, spa */

spa.model = ( function () {
    'use strict';
    var
        configMap = {
            anon_id : 'a0'
        },
        stateMap = {
            anon_user : null,
            cid_serial : 0,
            people_cid_map : { },
            people_db : TAFFY(),
            user : null,
            is_connected : false
        },
        isFakeData = true,
        personProto, makeCid, clearPeopleDb, completeLogin,
        makePerson, removePerson, people, chat, initModule;

    personProto = {
        get_is_user : function () {
            return this.cid === stateMap.user.cid;
        },
        get_is_anon : function () {
            return this.cid === stateMap.anon_user.cid;
        }
    };

    makeCid = function (  )  {
        return 'c' + String( stateMap.cid_serial++ );
    }

    clearPeopleDb = function (  )  {
        var user = stateMap.user;
        stateMap.people_db = TAFFY();
        stateMap.people_cid_map = {  };
        if ( user ) {
            stateMap.people_db.insert( user );
            stateMap.people_cid_map[ user.cid ] = user;
        }
    }

    completeLogin = function ( user_list )  {
        var user_map = user_list[ 0 ];
        delete stateMap.people_cid_map[ user_map.cid ];
        stateMap.user.cid = user_map._id;
        stateMap.user.id = user_map._id;
        stateMap.css_map = user_map.css_map;
        stateMap.people_cid_map[ user_map._id ] = stateMap.user;
        chat.join();
        $.gevent.publish( 'spa-login', [ stateMap.user ] );
    }

    makePerson = function ( person_map ) {
        var
            cid = person_map.cid,
            css_map = person_map.css_map,
            id = person_map.id,
            name = person_map.name,
            person;
        if ( cid === undefined || ! name ) {
            throw 'client cid and name required';
        }
        person = Object.create( personProto );
        person.cid = cid;
        person.name = name;
        person.css_map = css_map;
        if ( id ) {
            person.id = id;
        }
        stateMap.people_cid_map[ cid ] = person;
        stateMap.people_db.insert( person );
        return person;
    }

    removePerson = function ( person ) {
        if ( ! person ){
            return false;
        }
        if ( person.id === configMap.anon_id ) {
            return false;
        }
        stateMap.people_db( { cid : person.cid } ).remove();
        if ( person.cid ) {
            delete stateMap.people_cid_map[ person.cid ];
        }
        return true;
    }

    people = ( function () {
        var get_by_cid, get_db, get_user, login, logout;

        get_by_cid = function ( cid ) {
            return stateMap.people_cid_map[ cid ];
        }

        get_db = function (  ) {
            return stateMap.people_db;
        }

        get_user = function () {
            return stateMap.user;
        }

        login = function ( name ) {
            var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
            stateMap.user = makePerson( {
                cid : makeCid(),
                css_map : { top : 25, left : 25, 'background-color' : '#8f8' },
                name : name
            } );
            sio.on( 'userupdate', completeLogin );
            sio.emit( 'adduser', {
                cid : stateMap.user.cid,
                css_map : stateMap.user.css_map,
                name : stateMap.user.name
            } );
        }

        logout = function (  )  {
            var user = stateMap.user;
            chat._leave();
            stateMap.user = stateMap.anon_user;
            clearPeopleDb(  );
            $.gevent.publish( 'spa-logout', [ user ] );
        }

        return {
            get_by_cid : get_by_cid,
            get_db : get_db,
            get_user : get_user,
            login : login,
            logout : logout
        };

    } () );

    // The chat object API
    // -------------------
    // The chat object is available at spa.model.chat.
    // The chat object provides methods and events to manage
    // chat messaging. Its public methods include:
    // * join() - joins the chat room. This routine sets up
    // the chat protocol with the backend including publishers
    // for 'spa-listchange' and 'spa-updatechat' global
    // custom events. If the current user is anonymous,
    // join() aborts and returns false.
    // ...
    //
    // jQuery global custom events published by the object include:
    // ...
    // * spa-listchange - This is published when the list of
    // online people changes in length (i.e. when a person
    // joins or leaves a chat) or when their contents change
    // (i.e. when a person's avatar details change).
    // A subscriber to this event should get the people_db
    // from the people model for the updated data.
    // ...
    //
    chat = ( function () {
        var
            _publish_listchange, _publish_updatechat,
            _update_list, _leave_chat,
            get_chatee, send_msg, set_chatee,
            update_avatar,
            join_chat, chatee = null;

        // Begin internal methods
        _update_list = function ( arg_list ) {
            var i, person_map, make_person_map, person,
                people_list = arg_list[ 0 ],
                is_chatee_online = false;
            clearPeopleDb();
            PERSON:
            for ( i = 0; i < people_list.length; i++ ) {
                person_map = people_list[ i ];
                if ( ! person_map.name ) {
                    continue PERSON;
                }
                //  if user defined, update css_map and skip reminder
                if ( stateMap.user && stateMap.user.id === person_map._id ) {
                    stateMap.user.css_map = person_map.css_map;
                    continue PERSON;
                }
                make_person_map = {
                    cid : person_map._id,
                    css_map : person_map.css_map,
                    id : person_map._id,
                    name : person_map.name
                };
                person = makePerson( make_person_map );
                if ( chatee && chatee.id === make_person_map.id ) {
                    is_chatee_online = true;
                    chatee = person;
                }
            }
            stateMap.people_db.sort( 'name' );
            if ( chatee && ! is_chatee_online ) {
                set_chatee( '' );
            }
        }

        _publish_listchange = function ( arg_list ) {
            _update_list( arg_list );
            $.gevent.publish( 'spa-listchange', [ arg_list ] );
        }

        _publish_updatechat = function ( arg_list ) {
            var msg_map = arg_list[ 0 ];
            if ( ! chatee ) {
                set_chatee( msg_map.sender_id );
            }else if ( msg_map.sender_id !== stateMap.user.id && msg_map.sender_id !== chatee.id ){
                set_chatee( msg_map.sender_id );
            }
            $.gevent.publish( 'spa-updatechat', [ msg_map ] );
        }
        //  End internal methods

        _leave_chat = function (  )  {
            var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
            stateMap.is_connected = false;
            chatee = null;
            if ( sio ) {
                sio.emit( 'leavechat' );
            }
        };

        get_chatee = function (  )  {
            return chatee;
        };

        join_chat = function (  ) {
            var sio;
            if ( stateMap.is_connected ) {
                return false;
            }
            if ( stateMap.user.get_is_anon() ) {
                console.log( 'User must be defined before joining chat.' );
                return false;
            }
            sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
            sio.on( 'listchange', _publish_listchange );
            sio.on( 'updatechat', _publish_updatechat );
            stateMap.is_connected = true;
            return true;
        };

        send_msg = function ( msg_text ) {
            var msg_map,
                sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
            if ( ! sio  ) {
                return false;
            }
            if ( ! ( stateMap.user && chatee ) ) {
                return false;
            }
            msg_map = {
                dest_id : chatee.id,
                dest_name : chatee.name,
                sender_id : stateMap.user.id,
                msg_text : msg_text
            };
            _publish_updatechat( [ msg_map ] );
            sio.emit( 'updatechat', msg_map  );
            return true;
        };

        set_chatee = function ( person_id ) {
            var new_chatee;
            new_chatee = stateMap.people_cid_map[ person_id ];
            if ( new_chatee ){
                if ( chatee &&  new_chatee.id === chatee.id ) {
                    return false;
                }
            }else {
                new_chatee = null;
            }
            $.gevent.publish( 'spa-setchatee', {
                old_chatee : chatee,
                new_chatee : new_chatee
            } );
            chatee = new_chatee;
            return true;
        };

        // avatar_update_map should have the form:
        // { person_id : <string>, css_map : {
        // top : <int>, left : <int>,
        // 'background-color' : <string>
        // }};
        //
        update_avatar = function ( avatar_update_map ) {
            var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
            if ( sio ) {
                sio.emit( 'updateavater', avatar_update_map );
            }
        }

        return {
            _leave : _leave_chat,
            set_chatee : set_chatee,
            join : join_chat,
            send_msg : send_msg,
            get_chatee : get_chatee,
            update_avatar : update_avatar
        };

    } () );

  

    initModule = function (  ) {
        var i, people_list, people_map;

        // initialize anonymous person
        stateMap.anon_user = makePerson(
            {
                cid : configMap.anon_id,
                id : configMap.anon_id,
                name : 'anonymous'
            }
        );
        stateMap.user = stateMap.anon_user;
       /* if ( isFakeData ) {
            people_list = spa.fake.getPeopleList();
            for ( i = 0; i < people_list.length; i++ ) {
                people_map = people_list[ i ];
                makePerson( {
                    cid : people_map._id,
                    css_map : people_map.css_map,
                    id : people_map._id,
                    name : people_map.name
                } );
            }
        }*/
    }
    return {
        initModule : initModule,
        chat : chat,
        people : people
    };
} () );
