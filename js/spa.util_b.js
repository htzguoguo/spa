/**
 * Created by Administrator on 2016/10/24.
 */
/**
 * spa.util_b.js
 * JavaScript browser utilities
 *
 * Compiled by Michael S. Mikowski
 * These are routines I have created and updated
 * since 1998, with inspiration from around the web.
 * MIT License
 */
/*jslint browser : true, continue : true,
 devel : true, indent : 2, maxerr : 50,
 newcap : true, nomen : true, plusplus : true,
 regexp : true, sloppy : true, vars : false,
 white : true
 */
/*global $, spa, getComputedStyle */

spa.util_b = ( function () {
    'use strict';
    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN MODULE SCAPE VARIABLES  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - -
    var
        configMap = {
            regex_encode_html : /[&"'><]/g,
            regex_encode_noamp : /["'><]/g,
            html_encode_map : {
                '&' : '&#38;',
                '"' : '&#34;',
                "'" : '&#39;',
                '>' : '&#62;',
                '<' : '&#60;'
            }
        },
        decodeHtml, encodeHtml, getEmSize
        ;
    configMap.encode_nomap_map = $.extend(
        {  } , configMap.html_encode_map
    );
    delete configMap.encode_nomap_map[ '&' ];
    //- - - - - - - - - - - - - -  - - - - - - - -   END MODULE SCAPE VARIABLES  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN UTILITY METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - -
    // Begin decodeHtml
    // Decodes HTML entities in a browser-friendly way
    // See http://stackoverflow.com/questions/1912501/\
    // unescape-html-entities-in-javascript
    //
    decodeHtml = function ( str )  {
        return $( '<div/>' ).html( str || '' ).text();
    };
    // End decodeHtml

    // Begin encodeHtml
    // This is single pass encoder for html entities and handles
    // an arbitrary number of characters
    //
    encodeHtml = function ( input_arg_str, exclude_amp ) {
        var input_str = String( input_arg_str ),
             regex, lookup_map;
        if ( exclude_amp ) {
            lookup_map = configMap.encode_nomap_map;
            regex = configMap.regex_encode_noamp;
        }else{
            lookup_map = configMap.html_encode_map;
            regex = configMap.regex_encode_html;
        }
        return input_str.replace( regex,
            function ( match, name ) {
                return lookup_map[ match ]  || '';
            }
        );
    };
    // End encodeHtml

    // Begin getEmSize
    // returns size of ems in pixels
    //
    getEmSize = function ( elem ) {
        return Number(
            getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0]
        );
    };
    // End getEmSize
    //- - - - - - - - - - - - - -  - - - - - - - -   END UTILITY METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN DOM METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - - -
    // Begin DOM method /setJqueryMap/

    // End DOM method /setJqueryMap/
    //- - - - - - - - - - - - - -  - - - - - - - -   END DOM METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - - - -

    //- - - - - - - - - - - - - -  - - - - - - - -   BEGIN EVENT HANDLERS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - -
    // example: onClickButton = ...
    //- - - - - - - - - - - - - -  - - - - - - - -   END EVENT HANDLERS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - - -

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

    // End public method /configModule/

    // Begin public method /initModule/
    // Purpose : Initializes module
    // Arguments :
    // * $container the jquery element used by this feature
    // Returns : true
    // Throws : nonaccidental
    //

    // End public method /initModule/

    // return public methods
    return {
        decodeHtml : decodeHtml,
        encodeHtml : encodeHtml,
        getEmSize : getEmSize
    };
    //- - - - - - - - - - - - - -  - - - - - - - -   END PUBLIC METHODS  - - - - - - - -  - - - - - - - -  - - - - - - - -  - - - - - - - - - - - - - -
}  () );