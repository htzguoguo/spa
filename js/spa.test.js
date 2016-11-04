/**
 * Created by Administrator on 2016/11/2.
 */

  var $t = $( '<div/>' );

 $.gevent.subscribe( $t, 'spa-login', function ( event, user ) { console.log( 'Hello', user.name ); } );

 $.gevent.subscribe( $t, 'spa-updatechat', function ( event, chat_map ) { console.log( 'Chat message:', chat_map ); } );

 $.gevent.subscribe( $t, 'spa-setchatee', function ( event, chatee_map ) { console.log( 'Chatee change:', chatee_map ); } );

 $.gevent.subscribe( $t, 'spa-listchange', function ( event, changed_list ) { console.log( '*Listchange:', changed_list ); } );

 spa.model.people.login( 'Fanny' );

spa.model.chat.send_msg( 'Hi Pebbles' );
