// This file is part of http://dyndiv.markusbordihn.de/example/moveable-resizeable/.
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author(current)  Suman Bogati <http://www.vidyamantra.com>
 * @author(previous)  http://dyndiv.markusbordihn.de/example/moveable-resizeable
  */
(
    function(window) {
        var ByRei_dynDiv = {
            api: {
                drag: null,
                drop: null,
                elem: null,
                alter: null,
                obj: null
            },
            dropArea: [],
            config: {
                prefix: "dynDiv_",
                cookie: {
                    expire: "2678400" // 31 * 24 * 60 * 60 = 31 days
                },
                regExp: {
                    px: /(\d+)px/,
                    minmax: /dynDiv_minmaxDiv|dynDiv_moveParentDiv/
                }
            },
            cache: {
                obj: null,
                elem: null,
                modus: null,
                zIndex: null,
                width: null,
                height: null,
                pos: {
                    left: null,
                    top: null
                },
                init: {
                    width: null,
                    height: null,
                    pos: {
                        left: null,
                        top: null
                    },
                    offset: null
                },
                last: {
                    obj: null,
                    elem: null,
                    mouse: {
                        left: null,
                        top: null
                    }
                },
                browser: {
                    support: {
                        page: false,
                        client: false
                    }
                },
                unloadHandler: null,
                ie: (window.detachEvent) ? true : false
            },
            limit: {
                min: {
                    left: null,
                    top: null,
                    width: null,
                    height: null
                },
                max: {
                    left: null,
                    top: null,
                    width: null,
                    height: null
                }
            },
            divList: [],
            /*
             divList Struction
             ================================================================================
             0.  Object:[Object]        - Movable Object
             1.  Limiter:[Object]       - Object to which the dynDIV is limited
             2.  Status:[Boolean]       - Active or Inactive
             3.  zIndex:[Number]        - Init. zIndex for the dynDIV
             4.  left:[Number]          - Init. Position left
             5.  top:[Number]           - Init. Position top
             6.  dropLimit:[Text]       - Contain the dropArea which the dynDIV is limited
             7.  dropMode:[Text]        - Set up the dropMode for the dropArea (default,center,fit)
             8.  dropLog:[Boolean]      - Is true when the dynDIV was dropped into the dropArea
             9.  hideAction:[Text]      - Hide other DIVs for move or resize
             10. showResize:[Text]      - Show resize DIVs only on active or double click
             11. keepAspect:[Number]    - Keep the Aspect Ration of the DIV
             12. saveSettings:[Text]    - Save the Position and/or the Dimension of the Element in a Cookie
             13. width:[Number]         - Init Width in px
             14. height:[Number]        - Init Height in px
             ================================================================================
             */

            /*
             This include all get Methodes
             */
            get: {/* Warper for prefix request */
                prefix: {
                    value: function(obj, value, ncs) {
                        return ByRei_dynDiv.get.value(obj, ByRei_dynDiv.config.prefix + value, ncs);
                    }
                },
                /* Check an Array for certain values and return the result */
                value: function(obj, value, ncs) {
                    var
                            i, result = '',
                            il = obj.length;
                    if (obj && value) {
                        for (i = 0; i < il; i++) {
                            if (ncs && obj[i].indexOf(value) >= 0) {
                                result = obj[i].split(value)[1];
                                break;
                            } else if (obj[i] === value) {
                                result = obj[i];
                                break;
                            }
                        }
                    }
                    return result;
                },
                /* Set the standart variables for the selected Object */
                pos: function(obj) {
                    if (obj) {
                        ByRei_dynDiv.cache.init = {
                            width: obj.clientWidth,
                            height: obj.clientHeight,
                            pos: {
                                left: ByRei_dynDiv.cache.pos.left,
                                top: ByRei_dynDiv.cache.pos.top
                            },
                            offset: ByRei_dynDiv.get.offset.absolute(obj)
                        };

                        ByRei_dynDiv.db(2, true);
                        ByRei_dynDiv.db(4, ByRei_dynDiv.get.offset.relative(obj).left);
                        ByRei_dynDiv.db(5, ByRei_dynDiv.get.offset.relative(obj).top);
                    }
                },
                px: function(obj) {
                    var result = "";
                    if (obj) {
                        if (obj.match(ByRei_dynDiv.config.regExp.px)) {
                            if (typeof obj.match(ByRei_dynDiv.config.regExp.px)[1] !== 'undefined') {
                                result = obj.match(ByRei_dynDiv.config.regExp.px)[1];
                            }
                        }
                    }
                    return result;
                },
                /* Try to find the current mouse Position */
                mouse: function(evt) {
                    if (evt) {
                        if (!ByRei_dynDiv.cache.browser.support.page && !ByRei_dynDiv.cache.browser.support.client) {
                            ByRei_dynDiv.cache.browser.support.page = (evt.pageX || evt.pageY) ? true : false;
                            ByRei_dynDiv.cache.browser.support.client = (evt.clientX || evt.clientY) ? true : false;
                        }
                        if (ByRei_dynDiv.cache.browser.support.page) {
                            ByRei_dynDiv.cache.pos.left = evt.pageX;
                            ByRei_dynDiv.cache.pos.top = evt.pageY;
                        } else if (ByRei_dynDiv.cache.browser.support.client) {
                            ByRei_dynDiv.cache.pos.left = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                            ByRei_dynDiv.cache.pos.top = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                        }
                    }
                },
                /* Offset Calcucation */
                offset: {/* Calculate the absolute offset for a object */
                    absolute: function(obj) {
                        var
                                left = 0,
                                top = 0;
                        if (obj) {
                            left = ByRei_dynDiv.get.offset.relative(obj).left;
                            top = ByRei_dynDiv.get.offset.relative(obj).top;
                            while (obj.offsetParent) {
                                left += ByRei_dynDiv.get.offset.relative(obj.offsetParent).left;
                                top += ByRei_dynDiv.get.offset.relative(obj.offsetParent).top;
                                obj = obj.offsetParent;
                            }
                        }

                        return {
                            left: left,
                            top: top
                        };
                    },
                    /* Calculate the relative offset for a object (with browser bug checking) */
                    relative: function(obj) {
                        var result = false;
                        if (obj) {
                            var
                                    borderLeft = 0,
                                    borderTop = 0,
                                    marginLeft = ByRei_dynDiv.get.px(ByRei_dynDiv._style(obj, 'marginLeft')),
                                    marginTop = ByRei_dynDiv.get.px(ByRei_dynDiv._style(obj, 'marginTop')),
                                    left = ByRei_dynDiv.get.px(ByRei_dynDiv._style(obj, 'left')),
                                    top = ByRei_dynDiv.get.px(ByRei_dynDiv._style(obj, 'top')),
                                    offsetLeft = obj.offsetLeft,
                                    offsetTop = obj.offsetTop;

                            if (left !== "" && top !== "" && (offsetLeft > left + marginLeft || offsetTop > top + marginTop)) {
                                borderLeft = ByRei_dynDiv.get.px(ByRei_dynDiv._style(obj.parentNode, 'borderLeft'));
                                borderTop = ByRei_dynDiv.get.px(ByRei_dynDiv._style(obj.parentNode, 'borderTop'));
                            }

                            result = {
                                left: (borderLeft > 0) ? offsetLeft - borderLeft : offsetLeft,
                                top: (borderTop > 0) ? offsetTop - borderTop : offsetTop
                            };
                        }
                        return result;
                    }
                },
                /* Try to found the real parent of an object with the help of RegExp */
                parent: function(obj, value, mode) {
                    if (obj) {
                        for (var i = 0; i < 5; i++) {
                            if (value.test(obj.className)) {
                                if (mode) {
                                    obj = obj.parentNode;
                                } else {
                                    break;
                                }
                            } else {
                                if (mode) {
                                    break;
                                } else {
                                    obj = obj.parentNode;
                                }
                            }
                        }
                        return obj;
                    }
                },
                /* Search for things in the db */
                db: {
                    id: function(obj) {
                        var
                                i, result = {
                                    found: false,
                                    data: ""
                                },
                        il = ByRei_dynDiv.divList.length;

                        if (obj) {
                            for (i = 0; i < il; i++) {
                                if (obj === 'zIndex') {
                                    if (ByRei_dynDiv.divList[i][3] !== 'auto') {
                                        if (ByRei_dynDiv.divList[i][3] > result.data) {
                                            result.found = true;
                                            result.data = ByRei_dynDiv.divList[i][3];
                                        }
                                    }
                                } else if (ByRei_dynDiv.divList[i][0] === obj) {
                                    result.found = true;
                                    result.data = i;
                                    break;
                                }
                            }
                        }
                        return result;
                    }
                },
                /* Check Hit from between two Objects */
                hit: function(elem1, elem2, modus) {
                    var result = false;
                    if (elem1 && elem2) {
                        var
                                obj1 = {
                                    offset: ByRei_dynDiv.get.offset.absolute(elem1),
                                    width: elem1.clientWidth,
                                    height: elem1.clientHeight
                                },
                        obj2 = {
                            offset: ByRei_dynDiv.get.offset.absolute(elem2),
                            width: elem2.clientWidth,
                            height: elem2.clientHeight
                        },
                        cache = {
                            o1t_o1h: obj1.offset.top + obj1.height,
                            o2t_o2h: obj2.offset.top + obj2.height,
                            o1l_o1w: obj1.offset.left + obj1.width,
                            o2l_o2w: obj2.offset.left + obj2.width
                        };

                        // Check Hit
                        switch (modus) {
                            case "fit":
                            case "center":
                                if (((obj1.offset.left > obj2.offset.left && obj1.offset.left < cache.o2l_o2w) && ((obj1.offset.top > obj2.offset.top && obj1.offset.top < cache.o2t_o2h) || (cache.o1t_o1h > obj2.offset.top && cache.o1t_o1h < cache.o2t_o2h))) || ((cache.o1l_o1w > obj2.offset.left && cache.o1l_o1w < cache.o2l_o2w) && ((obj1.offset.top > obj2.offset.top && obj1.offset.top < cache.o2t_o2h) || (cache.o1t_o1h > obj2.offset.top && cache.o1t_o1h < cache.o2t_o2h)))) {
                                    result = true;
                                }
                                break;
                            default:
                                if ((obj1.offset.left > obj2.offset.left && obj1.offset.left < cache.o2l_o2w && cache.o1l_o1w < cache.o2l_o2w) && (obj1.offset.top > obj2.offset.top && obj1.offset.top < cache.o2t_o2h && cache.o1t_o1h < cache.o2t_o2h)) {
                                    result = true;
                                }
                                break;
                        }
                    }
                    return result;
                }
            },
            /*
             This include all on(action) Methodes.
             */
            on: {/* Mouse Move Events */
                move: function(evt) {
                    if (ByRei_dynDiv.cache.obj) {
                        ByRei_dynDiv.get.mouse(evt); // Get Mouse Position
                        if (ByRei_dynDiv.get.db.id('zIndex').found) {
                            ByRei_dynDiv._style(ByRei_dynDiv.cache.obj, 'zIndex', ByRei_dynDiv.get.db.id('zIndex').data + 1);
                        }

                        if (ByRei_dynDiv.cache.modus) {
                            if (ByRei_dynDiv.api.alter) {
                                ByRei_dynDiv.api.alter();
                            } // API move Event
                            switch (ByRei_dynDiv.cache.modus) {
                                case "br":
                                case "tr":
                                case "tl":
                                case "bl":
                                    ByRei_dynDiv.resize();
                                    break;
                                case "move":
                                case "moveparent":
                                    ByRei_dynDiv.move();
                                    break;
                                default:
                                    break;
                            }
                        }

                        if (ByRei_dynDiv.cache.ie) {
                            evt.returnValue = false;
                        }
                    }
                },
                /* Set Event Handler only when an Object is active */
                action: function() {
                    if (!ByRei_dynDiv.cache.obj) {
                        ByRei_dynDiv.set_eventListener(document, 'mousemove', ByRei_dynDiv.on.move); // Add Event for MouseMove (scale, move, hide, show)
                        ByRei_dynDiv.set_eventListener(document, 'mouseup', ByRei_dynDiv.on.stop); // Stop all Events on MouseUP
                    }
                },
                /* Events when noAction will performance (mouse_down)*/
                stop: function() {
                    if (ByRei_dynDiv.db(0)) { // DB Functions
                        if (ByRei_dynDiv.db(6)) { // Drop Area Support
                            var
                                    i, dropArea = {
                                        obj: false
                                    },
                            il = ByRei_dynDiv.dropArea.length;

                            for (i = 0; i < il; i++) {
                                if (ByRei_dynDiv.dropArea[i][1] === ByRei_dynDiv.db(6)) {
                                    if (ByRei_dynDiv.get.hit(ByRei_dynDiv.cache.obj, ByRei_dynDiv.dropArea[i][0], ByRei_dynDiv.db(7))) {
                                        dropArea.obj = ByRei_dynDiv.dropArea[i][0];
                                    }
                                }
                            }

                            if (!dropArea.obj) {
                                ByRei_dynDiv.set.left(ByRei_dynDiv.cache.obj, ByRei_dynDiv.db(4));
                                ByRei_dynDiv.set.top(ByRei_dynDiv.cache.obj, ByRei_dynDiv.db(5));
                            } else {
                                dropArea.offset = ByRei_dynDiv.get.offset.absolute(dropArea.obj);
                                switch (ByRei_dynDiv.db(7)) {
                                    case "fit":
                                        ByRei_dynDiv.set.left(ByRei_dynDiv.cache.obj, ByRei_dynDiv.db(4) + (dropArea.offset.left - ByRei_dynDiv.cache.init.offset.left));
                                        ByRei_dynDiv.set.top(ByRei_dynDiv.cache.obj, ByRei_dynDiv.db(5) + (dropArea.offset.top - ByRei_dynDiv.cache.init.offset.top));
                                        break;
                                    case "center":
                                        ByRei_dynDiv.set.left(ByRei_dynDiv.cache.obj, ByRei_dynDiv.db(4) + (dropArea.offset.left - ByRei_dynDiv.cache.init.offset.left) + ((dropArea.obj.clientWidth / 2) - (ByRei_dynDiv.cache.obj.clientWidth / 2)));
                                        ByRei_dynDiv.set.top(ByRei_dynDiv.cache.obj, ByRei_dynDiv.db(5) + (dropArea.offset.top - ByRei_dynDiv.cache.init.offset.top) + ((dropArea.obj.clientHeight / 2) - (ByRei_dynDiv.cache.obj.clientHeight / 2)));
                                        break;
                                }
                                ByRei_dynDiv.db(8, true);
                            }
                        }
                    }

                    // 	Normal Event Handling
                    ByRei_dynDiv.db(2, false); // Active to Inactive
                    ByRei_dynDiv.del_eventListener(document, 'mousemove', ByRei_dynDiv.on.move); // Remove Event Listener Mouse Move
                    ByRei_dynDiv.del_eventListener(document, 'mouseup', ByRei_dynDiv.on.stop); // Remove Event Listener Mouse Up
                    ByRei_dynDiv._style(ByRei_dynDiv.cache.obj, 'zIndex', ByRei_dynDiv.cache.zIndex); // Reset zIndex to initial value
                    if (ByRei_dynDiv.cache.last.obj !== ByRei_dynDiv.cache.obj) {
                        ByRei_dynDiv.cache.last.obj = ByRei_dynDiv.cache.obj;
                    } // Set Cache last Object
                    if (ByRei_dynDiv.cache.last.elem !== ByRei_dynDiv.cache.elem) {
                        ByRei_dynDiv.cache.last.elem = ByRei_dynDiv.cache.elem;
                    } // Set Cache last Element
                    if (ByRei_dynDiv.db(9)) {
                        ByRei_dynDiv.set.visible(true);
                    } // Show hiden dynDIVs
                    if (ByRei_dynDiv.db(10) === 'focus') {
                        ByRei_dynDiv.set_eventListener(document, 'mousedown', ByRei_dynDiv.on.focus);
                    } // Hide Resize on click on other Elements
                    // Save Position and Size in DB
                    ByRei_dynDiv.db(4, ByRei_dynDiv.get.offset.relative(ByRei_dynDiv.cache.obj).left);
                    ByRei_dynDiv.db(5, ByRei_dynDiv.get.offset.relative(ByRei_dynDiv.cache.obj).top);
                    ByRei_dynDiv.db(13, ByRei_dynDiv.cache.obj.clientWidth);
                    ByRei_dynDiv.db(14, ByRei_dynDiv.cache.obj.clientHeight);

                    if (ByRei_dynDiv.api.drop) {
                        ByRei_dynDiv.api.drop();
                    } // API drop Event
                    // Reset to default Values
                    ByRei_dynDiv.limit.min.left = ByRei_dynDiv.limit.min.top = ByRei_dynDiv.limit.min.width = ByRei_dynDiv.limit.min.height = ByRei_dynDiv.limit.min.left = ByRei_dynDiv.limit.min.top = ByRei_dynDiv.limit.min.width = ByRei_dynDiv.limit.min.height = ByRei_dynDiv.cache.obj = ByRei_dynDiv.cache.modus = ByRei_dynDiv.cache.zIndex = ByRei_dynDiv.cache.elem = false;
                },
                /* Focus Handler for the webpage */
                focus: function() {
                    if (typeof ByRei_dynDiv.divList[ByRei_dynDiv.cache.last.elem] !== 'undefined') {
                        if (ByRei_dynDiv.divList[ByRei_dynDiv.cache.last.elem][10] === 'focus') {
                            ByRei_dynDiv.on.resize(ByRei_dynDiv.cache.last.obj, false);
                        }
                        ByRei_dynDiv.del_eventListener(document, 'mousedown', ByRei_dynDiv.on.focus); // Remove Event
                    }
                },
                /* Unload Handler for the webpage */
                unload: function() {
                    if (ByRei_dynDiv.divList) {
                        ByRei_dynDiv.settings.save(); // Save Position and Height of all marked DIVs
                    }
                },
                /* Init min max Div function */
                minmax: function(evt) {
                    if (evt) {
                        var
                                evt_src = (evt.target) ? evt.target : evt.srcElement,
                                minmax_src = ByRei_dynDiv.get.parent(evt_src, ByRei_dynDiv.config.regExp.minmax, 0),
                                minmaxHeight = (ByRei_dynDiv.get.prefix.value(minmax_src.className.split(' '), "minmax_Height-", 1) || 20);
                        evt_src = ByRei_dynDiv.get.parent(evt_src, ByRei_dynDiv.config.regExp.minmax, 1);
                        ByRei_dynDiv._style(evt_src, 'clip', (new RegExp(minmaxHeight + "\\w+,?\\s?auto", "i").test(ByRei_dynDiv._style(evt_src, 'clip'))) ? 'rect(auto auto auto auto)' : 'rect(auto auto ' + (minmaxHeight) + 'px auto)');
                    }
                },
                /* Resize Handler */
                resize: function(evt, value) {
                    var
                            i, evt_src = (evt.target || evt.srcElement) ? (evt.target ? evt.target : evt.srcElement) : (evt),
                            classNames = evt_src.className.split(' '),
                            resize_list = (ByRei_dynDiv.get.prefix.value(classNames, "moveParentDiv") && evt_src.parentNode) ? evt_src.parentNode.getElementsByTagName('div') : evt_src.getElementsByTagName('div'),
                            il = resize_list.length;

                    for (i = 0; i < il; i++) {
                        if (ByRei_dynDiv.get.prefix.value(resize_list[i].className.split(' '), "resizeDiv_", 1)) {
                            ByRei_dynDiv._style(resize_list[i], 'visibility', (value) ? 'visible' : 'hidden');
                        }
                    }
                }
            },
            /*
             This include all init functions.
             */
            init: {/* Init Events for all div with dynDiv_ as className */
                main: function() {
                    var
                            i = 0,
                            div_list = document.getElementsByTagName('div'),
                            il = div_list.length;
                    for (var obj = 0; obj < il; obj++) {
                        if (ByRei_dynDiv.get.prefix.value(div_list[obj].className.split(' '), "", 1)) {
                            if (ByRei_dynDiv.get.prefix.value(div_list[obj].className.split(' '), "resizeDiv_", 1) && ByRei_dynDiv.get.prefix.value(div_list[obj].parentNode.className.split(' '), "move", 1) === '') {
                                ByRei_dynDiv.add(div_list[obj].parentNode, i++, 1);
                            }
                            ByRei_dynDiv.add(div_list[obj], i++);
                        }
                    }
                },
                /* Init Action on MouseMove */
                action: function(evt, m_modus) {
                    if (evt) {
                        if (evt.preventDefault) {
                            evt.preventDefault();
                        }
                        if (ByRei_dynDiv.cache.ie) {
                            evt.cancelBubble = true;
                        }
                        if (evt.stopPropagation) {
                            evt.stopPropagation();
                        }
                        var evt_src = evt.target ? evt.target : evt.srcElement;

                        // Avoid Issues with minmax
                        if (evt_src.className.indexOf('dynDiv_minmaxDiv') === -1) {
                            ByRei_dynDiv.get.mouse(evt);
                            ByRei_dynDiv.on.action();
                            switch (m_modus) {
                                case "move":
                                    ByRei_dynDiv.cache.obj = ByRei_dynDiv.api.obj = ByRei_dynDiv.get.parent(evt_src, /dynDiv_moveDiv/);
                                    break;
                                case "moveparent":
                                    ByRei_dynDiv.cache.obj = ByRei_dynDiv.api.obj = ByRei_dynDiv.get.parent(evt_src, /dynDiv_moveParentDiv/).parentNode;
                                    break;
                                case "tl":
                                case "tr":
                                case "bl":
                                case "br":
                                    ByRei_dynDiv.cache.obj = ByRei_dynDiv.api.obj = evt_src.parentNode;
                                    break;
                                default:
                                    ByRei_dynDiv.cache.obj = ByRei_dynDiv.api.obj = evt_src;
                                    break;
                            }

                            ByRei_dynDiv.cache.elem = ByRei_dynDiv.api.elem = ByRei_dynDiv.get.db.id(ByRei_dynDiv.cache.obj).data; // Cache Element
                            ByRei_dynDiv.cache.zIndex = ByRei_dynDiv._style(ByRei_dynDiv.cache.obj, 'zIndex'); // Cache zIndex
                            ByRei_dynDiv.get.pos(ByRei_dynDiv.cache.obj); // Get Position of Element
                            ByRei_dynDiv.cache.modus = m_modus; // Cache Modus
                            if (ByRei_dynDiv.db(1) && ByRei_dynDiv.cache.obj) {
                                var
                                        obj = {
                                            offset: ByRei_dynDiv.get.offset.absolute(ByRei_dynDiv.cache.obj)
                                        },
                                limit = {
                                    offset: ByRei_dynDiv.get.offset.absolute(ByRei_dynDiv.db(1))
                                };

                                ByRei_dynDiv.limit.min.left = limit.offset.left - obj.offset.left;
                                ByRei_dynDiv.limit.max.left = (ByRei_dynDiv.db(1).clientWidth + limit.offset.left) - (ByRei_dynDiv.cache.obj.offsetWidth + obj.offset.left);
                                ByRei_dynDiv.limit.min.top = limit.offset.top - obj.offset.top;
                                ByRei_dynDiv.limit.max.top = (ByRei_dynDiv.db(1).clientHeight + limit.offset.top) - (ByRei_dynDiv.cache.obj.offsetHeight + obj.offset.top);
                            }
                            if (ByRei_dynDiv.api.drag) {
                                ByRei_dynDiv.api.drag();
                            } // API drag Event
                            switch (m_modus) {
                                case "move":
                                case "moveparent":
                                    if (ByRei_dynDiv.db(9) === 'move' || ByRei_dynDiv.db(9) === 'move_resize') {
                                        ByRei_dynDiv.set.visible(false);
                                    }
                                    break;
                                case "tl":
                                case "tr":
                                case "bl":
                                case "br":
                                    if (ByRei_dynDiv.db(9) === 'resize' || ByRei_dynDiv.db(9) === 'move_resize') {
                                        ByRei_dynDiv.set.visible(false);
                                    }
                                    break;
                            }

                            if (ByRei_dynDiv.cache.elem !== ByRei_dynDiv.cache.last.elem && (ByRei_dynDiv.cache.last.elem || ByRei_dynDiv.cache.last.elem === 0)) {
                                if (ByRei_dynDiv.divList[ByRei_dynDiv.cache.last.elem][10]) {
                                    ByRei_dynDiv.on.resize(ByRei_dynDiv.cache.last.obj, false);
                                }
                            }
                            if (ByRei_dynDiv.db(10) === 'active' || ByRei_dynDiv.db(10) === 'focus') {
                                ByRei_dynDiv.on.resize(ByRei_dynDiv.cache.obj, true);
                            }
                        }
                    }
                }
            },
            /*
             This include the Settings possibilitys
             */
            settings: {/* Save Settings */
                save: function() {
                    if (ByRei_dynDiv.divList) {
                        var
                                i, il = ByRei_dynDiv.divList.length;
                        for (i = 0; i < il; i++) {
                            if (ByRei_dynDiv.divList[i][12] !== false && ByRei_dynDiv.divList[i][0].id) {
                                var
                                        left = '',
                                        top = '',
                                        width = '',
                                        height = '';

                                switch (ByRei_dynDiv.divList[i][12]) {
                                    case "position":
                                        left = ByRei_dynDiv.divList[i][4];
                                        top = ByRei_dynDiv.divList[i][5];
                                        break;
                                    case "size":
                                        width = ByRei_dynDiv.divList[i][13];
                                        height = ByRei_dynDiv.divList[i][14];
                                        break;
                                    case "position_size":
                                        left = ByRei_dynDiv.divList[i][4];
                                        top = ByRei_dynDiv.divList[i][5];
                                        width = ByRei_dynDiv.divList[i][13];
                                        height = ByRei_dynDiv.divList[i][14];
                                        break;
                                }

                                if ((Number(left) !== 'NaN' && Number(top) !== 'NaN') || (width > 0 && height > 0)) {
                                    if (navigator.cookieEnabled) {
                                        var expireTime = new Date();
                                        expireTime.setSeconds((new Date()).setTime(expireTime.getSeconds()) + Number(ByRei_dynDiv.config.cookie.expire));
                                        document.cookie = "ByRei_dynDiv_" + ByRei_dynDiv.divList[i][0].id + "=" + left + '_' + top + '_' + width + '_' + height + "; expires=" + expireTime.toGMTString();
                                    }
                                }
                            }
                        }
                    }
                },
                /* Load Settings */
                load: function(id) {
                    var result = false;
                    if (navigator.cookieEnabled && id) {
                        var savedata = document.cookie;
                        if (/; /.test(savedata)) {
                            savedata = savedata.split("; ");
                        } else if (/, /.test(savedata)) {
                            savedata = savedata.split(", ");
                        }
                        if (savedata) {
                            var i, il = savedata.length;
                            for (i = 0; i < il; i++) {
                                if (savedata[i]) {
                                    if ((/ByRei_dynDiv/).test(savedata[i])) {
                                        var data = (/ByRei_dynDiv_(\w+)=(\d*)\_(\d*)\_(\d*)\_(\d*)/).exec(savedata[i]);
                                        if (typeof data !== 'undefined' && data !== null) {
                                            if (typeof data[1] !== 'undefined') {
                                                if (data[1] === id) {
                                                    result = {
                                                        left: data[2],
                                                        top: data[3],
                                                        width: data[4],
                                                        height: data[5]
                                                    };
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return result;
                }
            },
            /*
             All set Functions
             */
            set: {/* Set visible / invisible */
                visible: function(value) {
                    var
                            i, il = ByRei_dynDiv.divList.length;
                    for (i = 0; i < il; i++) {
                        if (ByRei_dynDiv.divList[i] !== ByRei_dynDiv.divList[ByRei_dynDiv.cache.elem]) {
                            ByRei_dynDiv._style(ByRei_dynDiv.divList[i][0], 'visibility', (value) ? 'visible' : 'hidden');
                        }
                    }
                },
                /* Simple Warper to avoid to include "px" on every value */
                /* More warper for left, top, width, height */
                left: function(obj, value) {
                    ByRei_dynDiv._style(obj, 'left', value + "px");
                },
                top: function(obj, value) {
                    ByRei_dynDiv._style(obj, 'top', value + "px");
                },
                width: function(obj, value) {
                    ByRei_dynDiv._style(obj, 'width', value + "px");
                },
                height: function(obj, value) {
                    ByRei_dynDiv._style(obj, 'height', value + "px");
                }
            },
            /*
             Resize DIV.
             */
            resize: function() {
                if (ByRei_dynDiv.cache.obj && ByRei_dynDiv.cache.modus) {
                    var
                            default_padding = 20,
                            new_size_x = 0,
                            new_size_y = 0,
                            new_left = ByRei_dynDiv.db(4),
                            new_top = ByRei_dynDiv.db(5),
                            keepAspect = ByRei_dynDiv.db(11),
                            reachLimit = false,
                            mouse_diff_left = (ByRei_dynDiv.cache.pos.left - ByRei_dynDiv.cache.init.pos.left || 0),
                            mouse_diff_top = (ByRei_dynDiv.cache.pos.top - ByRei_dynDiv.cache.init.pos.top || 0);

                    // Try to keep Aspect Ratio.
                    /* Maus so abfragen das Mouse nicht gr��ers als Offset von Object sein kann ! */
                    if (keepAspect) {
                        switch (ByRei_dynDiv.cache.modus) {
                            case "br":
                            case "tl":
                                mouse_diff_left = mouse_diff_top * keepAspect;
                                break;
                            case "bl":
                            case "tr":
                                mouse_diff_left = mouse_diff_top * keepAspect * -1;
                                break;
                        }
                        if (ByRei_dynDiv.cache.last.mouse.left === ByRei_dynDiv.cache.pos.left || ByRei_dynDiv.cache.last.mouse.top === ByRei_dynDiv.cache.pos.top) {
                            reachLimit = true;
                        }
                        ByRei_dynDiv.cache.last.mouse.left = ByRei_dynDiv.cache.pos.left;
                        ByRei_dynDiv.cache.last.mouse.top = ByRei_dynDiv.cache.pos.top;
                    }

                    // Scaling DIV depend on the Modus.
                    switch (ByRei_dynDiv.cache.modus) {
                        case "br":
                        case "tr":
                            new_size_x = ByRei_dynDiv.cache.init.width + mouse_diff_left;
                            break;
                        case "tl":
                        case "bl":
                            new_size_x = ByRei_dynDiv.cache.init.width - mouse_diff_left;
                            break;
                    }

                    switch (ByRei_dynDiv.cache.modus) {
                        case "br":
                        case "bl":
                            new_size_y = ByRei_dynDiv.cache.init.height + mouse_diff_top;
                            break;
                        case "tr":
                        case "tl":
                            new_size_y = ByRei_dynDiv.cache.init.height - mouse_diff_top;
                            break;
                    }

                    switch (ByRei_dynDiv.cache.modus) {
                        case "tl":
                            new_top = ByRei_dynDiv.db(5) + mouse_diff_top;
                            new_left = ByRei_dynDiv.db(4) + mouse_diff_left;
                            break;
                        case "tr":
                            new_top = ByRei_dynDiv.db(5) + mouse_diff_top;
                            break;
                        case "bl":
                            new_left = ByRei_dynDiv.db(4) + mouse_diff_left;
                            break;
                    }

                    /* Check if Limit is reached (normal, keep aspect) */
                    if (ByRei_dynDiv.db(1)) {
                        var
                                pos_left = ByRei_dynDiv.cache.pos.left - ByRei_dynDiv.cache.init.pos.left,
                                pos_top = ByRei_dynDiv.cache.pos.top - ByRei_dynDiv.cache.init.pos.top;

                        switch (ByRei_dynDiv.cache.modus) {
                            case "tl":
                            case "bl":
                                if (pos_left < ByRei_dynDiv.limit.min.left) {
                                    if (!keepAspect) {
                                        new_size_x = ByRei_dynDiv.cache.init.width - ByRei_dynDiv.limit.min.left;
                                        new_left = ByRei_dynDiv.db(4) + ByRei_dynDiv.limit.min.left;
                                    }
                                    reachLimit = true;
                                }
                                break;
                            case "tr":
                            case "br":
                                if (pos_left > ByRei_dynDiv.limit.max.left) {
                                    if (!keepAspect) {
                                        new_size_x = ByRei_dynDiv.cache.init.width + ByRei_dynDiv.limit.max.left;
                                    }
                                    reachLimit = true;
                                }
                                break;
                        }

                        switch (ByRei_dynDiv.cache.modus) {
                            case "tl":
                            case "tr":
                                if (pos_top < ByRei_dynDiv.limit.min.top) {
                                    if (!keepAspect) {
                                        new_size_y = ByRei_dynDiv.cache.init.height - ByRei_dynDiv.limit.min.top;
                                        new_top = ByRei_dynDiv.db(5) + ByRei_dynDiv.limit.min.top;
                                    }
                                    reachLimit = true;
                                }
                                break;
                            case "bl":
                            case "br":
                                if (pos_top > ByRei_dynDiv.limit.max.top) {
                                    if (!keepAspect) {
                                        new_size_y = ByRei_dynDiv.cache.init.height + ByRei_dynDiv.limit.max.top;
                                    }
                                    reachLimit = true;
                                }
                                break;
                        }
                    }

                    // Check for min. Size (20x20)
                    if (keepAspect) {
                        if (!reachLimit && new_size_x > default_padding && new_size_y > default_padding) {
                            ByRei_dynDiv.set.width(ByRei_dynDiv.cache.obj, new_size_x);
                            ByRei_dynDiv.set.height(ByRei_dynDiv.cache.obj, new_size_y);
                            ByRei_dynDiv.set.left(ByRei_dynDiv.cache.obj, new_left);
                            ByRei_dynDiv.set.top(ByRei_dynDiv.cache.obj, new_top);
                        }
                    } else {
                        if (new_size_x > default_padding) {
                            ByRei_dynDiv.set.width(ByRei_dynDiv.cache.obj, new_size_x);
                            ByRei_dynDiv.set.left(ByRei_dynDiv.cache.obj, new_left);
                        }
                        if (new_size_y > default_padding) {
                            ByRei_dynDiv.set.height(ByRei_dynDiv.cache.obj, new_size_y);
                            ByRei_dynDiv.set.top(ByRei_dynDiv.cache.obj, new_top);
                        }
                    }
                }
            },
            /*
             Move DIV.
             */
            move: function() {
                if (ByRei_dynDiv.cache.obj) {
                    var
                            new_left = ByRei_dynDiv.cache.pos.left - (ByRei_dynDiv.cache.init.pos.left - ByRei_dynDiv.db(4)),
                            new_top = ByRei_dynDiv.cache.pos.top - (ByRei_dynDiv.cache.init.pos.top - ByRei_dynDiv.db(5));

                    // Check for Div Limit
                    if (ByRei_dynDiv.db(1)) {
                        var
                                pos_x = ByRei_dynDiv.cache.pos.left - ByRei_dynDiv.cache.init.pos.left,
                                pos_y = ByRei_dynDiv.cache.pos.top - ByRei_dynDiv.cache.init.pos.top;

                        if (pos_x < ByRei_dynDiv.limit.min.left) {
                            new_left = ByRei_dynDiv.db(4) + ByRei_dynDiv.limit.min.left;
                        } else if (pos_x > ByRei_dynDiv.limit.max.left) {
                            new_left = ByRei_dynDiv.db(4) + ByRei_dynDiv.limit.max.left;
                        }

                        if (pos_y < ByRei_dynDiv.limit.min.top) {
                            new_top = ByRei_dynDiv.db(5) + ByRei_dynDiv.limit.min.top;
                        } else if (pos_y > ByRei_dynDiv.limit.max.top) {
                            new_top = ByRei_dynDiv.db(5) + ByRei_dynDiv.limit.max.top;
                        }
                    }

                    if (!isNaN(new_left)) {
                        ByRei_dynDiv.set.left(ByRei_dynDiv.cache.obj, new_left);
                    }
                    if (!isNaN(new_top)) {
                        ByRei_dynDiv.set.top(ByRei_dynDiv.cache.obj, new_top);
                    }
                }
            },
            /*
             Small DB System
             */
            db: function(i, value) { // db(1) return value / db(1,1) set value
                var result = false;
                if (ByRei_dynDiv.cache.elem >= 0) {
                    if (ByRei_dynDiv.divList[ByRei_dynDiv.cache.elem]) {
                        if (typeof ByRei_dynDiv.divList[ByRei_dynDiv.cache.elem][i] !== 'undefined') {
                            if (typeof value !== 'undefined') {
                                ByRei_dynDiv.divList[ByRei_dynDiv.cache.elem][i] = value;
                                result = true;
                            } else {
                                result = ByRei_dynDiv.divList[ByRei_dynDiv.cache.elem][i];
                            }
                        }
                    }
                }
                return result;
            },
            /*
             Add Object to dynDiv and add dynDiv Events and Effects.
             */
            add: function(elem, i, mode) {
                if (elem) {
                    var
                            zIndex = 'auto',
                            classNames = elem.className.split(' '),
                            func_z_index = function(obj, i) {
                                return (ByRei_dynDiv._style(obj, 'zIndex') || ByRei_dynDiv._style(obj, 'zIndex', i));
                            };

                    if (ByRei_dynDiv.get.prefix.value(classNames, "", 1) || mode) {
                        var
                                limiter = null,
                                droplimiter = false,
                                dropmode = false,
                                hideaction = false,
                                showresize = false,
                                keepAspect = false,
                                saveSettings = false,
                                parent = elem,
                                modus = ByRei_dynDiv.get.prefix.value(classNames, "", 1),
                                l_parent = parent.parentNode;

                        // Set Event Handler for Moveing and Resizing and other handlers
                        if (modus) {
                            switch (modus) {
                                case "moveDiv":
                                    ByRei_dynDiv._style(parent, 'cursor', 'move');
                                    ByRei_dynDiv.set_eventListener(parent, 'mousedown', function(e) {
                                        ByRei_dynDiv.init.action(e, 'move');
                                    });
                                    zIndex = func_z_index(parent, i);
                                    break;
                                case "moveParentDiv":
                                    ByRei_dynDiv._style(parent, 'cursor', 'move');
                                    ByRei_dynDiv.set_eventListener(parent, 'mousedown', function(e) {
                                        ByRei_dynDiv.init.action(e, 'moveparent');
                                    });
                                    parent = parent.parentNode;
                                    zIndex = func_z_index(parent, i);
                                    break;
                                case "resizeDiv_tl":
                                    ByRei_dynDiv._style(parent, 'cursor', 'nw-resize');
                                    ByRei_dynDiv.set_eventListener(parent, 'mousedown', function(e) {
                                        ByRei_dynDiv.init.action(e, 'tl');
                                    });
                                    break;
                                case "resizeDiv_tr":
                                    ByRei_dynDiv._style(parent, 'cursor', 'ne-resize');
                                    ByRei_dynDiv.set_eventListener(parent, 'mousedown', function(e) {
                                        ByRei_dynDiv.init.action(e, 'tr');
                                    });
                                    break;
                                case "resizeDiv_bl":
                                    ByRei_dynDiv._style(parent, 'cursor', 'sw-resize');
                                    ByRei_dynDiv.set_eventListener(parent, 'mousedown', function(e) {
                                        ByRei_dynDiv.init.action(e, 'bl');
                                    });
                                    break;
                                case "resizeDiv_br":
                                    ByRei_dynDiv._style(parent, 'cursor', 'se-resize');
                                    ByRei_dynDiv.set_eventListener(parent, 'mousedown', function(e) {
                                        ByRei_dynDiv.init.action(e, 'br');
                                    });
                                    break;
                                case "minmaxDiv":
                                    ByRei_dynDiv._style(parent, 'cursor', 'pointer');
                                    ByRei_dynDiv.set_eventListener(parent, 'mousedown', function(e) {
                                        ByRei_dynDiv.on.minmax(e);
                                    });
                                    break;
                                case "dropArea":
                                    ByRei_dynDiv.dropArea.push([parent, 'global']);
                                    break;
                            }
                        }

                        // Drop Areas specific with name (dynDiv_dropArea-[name])
                        if (ByRei_dynDiv.get.prefix.value(classNames, "dropArea-", 1)) {
                            ByRei_dynDiv.dropArea.push([parent, ByRei_dynDiv.get.prefix.value(classNames, "dropArea-", 1)]);
                        }

                        // Limit Movements
                        while (l_parent) {
                            if (l_parent.className) {
                                if (ByRei_dynDiv.get.prefix.value(l_parent.className.split(' '), "setLimit")) {
                                    if (parent !== l_parent) {
                                        limiter = l_parent;
                                    }
                                    break;
                                }
                            }
                            l_parent = l_parent.parentNode;
                        }

                        // Body Limit
                        if (!limiter) {
                            if (ByRei_dynDiv.get.prefix.value(classNames, "bodyLimit") || ByRei_dynDiv.get.prefix.value(parent.parentNode.className.split(' '), "bodyLimit")) {
                                limiter = document.body;
                            }
                        }

                        // Drop Limit
                        if (ByRei_dynDiv.get.prefix.value(classNames, "dropLimit")) {
                            droplimiter = 'global';
                        } else if (ByRei_dynDiv.get.prefix.value(classNames, "dropLimit-", 1)) {
                            droplimiter = ByRei_dynDiv.get.prefix.value(classNames, "dropLimit-", 1);
                        }

                        // Drop Mode (fit, center)
                        if (ByRei_dynDiv.get.prefix.value(classNames, "dropMode-", 1)) {
                            dropmode = ByRei_dynDiv.get.prefix.value(classNames, "dropMode-", 1);
                        }

                        // Hide Action (false, move, resize)
                        if (ByRei_dynDiv.get.prefix.value(classNames, "hideMove") && ByRei_dynDiv.get.prefix.value(classNames, "hideResize")) {
                            hideaction = 'move_resize';
                        } else {
                            if (ByRei_dynDiv.get.prefix.value(classNames, "hideMove")) {
                                hideaction = 'move';
                            } else if (ByRei_dynDiv.get.prefix.value(classNames, "hideResize")) {
                                hideaction = 'resize';
                            }
                        }

                        // Keep Aspect Ration (true,false)
                        if (ByRei_dynDiv.get.prefix.value(classNames, "keepAspect")) {
                            if (parent.clientWidth && parent.clientHeight) {
                                keepAspect = Math.abs(parent.clientWidth / parent.clientHeight);
                            }
                        }

                        // Show Resize (active, focus, doubleclick).
                        if (ByRei_dynDiv.get.prefix.value(classNames, "showResize-", 1)) {
                            showresize = ByRei_dynDiv.get.prefix.value(classNames, "showResize-", 1);
                            ByRei_dynDiv.on.resize(parent, false);
                            if (showresize === 'dbclick') {
                                ByRei_dynDiv.set_eventListener(parent, 'dblclick', function(e) {
                                    ByRei_dynDiv.on.resize(e, true);
                                });
                            }
                        }

                        // Save Position and/or Size
                        switch (ByRei_dynDiv.get.prefix.value(classNames, "saveSettings-", 1)) {
                            case "position":
                                saveSettings = "position";
                                break;
                            case "size":
                                saveSettings = "size";
                                break;
                            case "position_size":
                                saveSettings = "position_size";
                                break;
                        }
                        if (saveSettings && !ByRei_dynDiv.cache.unloadHandler) {
                            ByRei_dynDiv.cache.unloadHandler = ByRei_dynDiv.set_eventListener(window, 'unload', ByRei_dynDiv.on.unload);
                        }

                        // Load Position and/or Size
                        if (ByRei_dynDiv.get.prefix.value(classNames, "loadSettings")) {
                            var data = ByRei_dynDiv.settings.load(parent.id);
                            if (data) {
                                if (Number(data.left) !== 'NaN' && Number(data.top) !== 'NaN') {
                                    ByRei_dynDiv.set.left(parent, data.left);
                                    ByRei_dynDiv.set.top(parent, data.top);
                                }
                                if (data.width > 0 && data.height > 0) {
                                    ByRei_dynDiv.set.width(parent, data.width);
                                    ByRei_dynDiv.set.height(parent, data.height);
                                }
                            }
                        }

                        // Write main DIVs in the DIV List
                        if (ByRei_dynDiv.get.prefix.value(classNames, "moveParentDiv") || ByRei_dynDiv.get.prefix.value(classNames, "moveDiv") || mode) {
                            if (!ByRei_dynDiv.get.db.id(parent).found) {
                                ByRei_dynDiv.divList.push([parent, limiter, false, zIndex, ByRei_dynDiv.get.offset.relative(parent).left, ByRei_dynDiv.get.offset.relative(parent).top, droplimiter, dropmode, false, hideaction, showresize, keepAspect, saveSettings, parent.clientWidth, parent.clientHeight]);
                            }
                        }
                    }
                }
            },
            /* Small alternative Style Selector to avoid JS Errors and make things easier */
            _style: function(obj, o_style, value) {
                if (obj && o_style) {
                    if (obj.style) {
                        if (typeof obj.style[o_style] !== 'undefined') {
                            if (value) {
                                try {
                                    return (obj.style[o_style] = value);
                                } catch (e) {
                                    return false;
                                }
                            } else {
                                return (obj.style[o_style] === '') ? ((obj.currentStyle) ? obj.currentStyle[o_style] : ((window.getComputedStyle) ? window.getComputedStyle(obj, '').getPropertyValue(o_style) : false)) : obj.style[o_style];
                            }
                        }
                    }
                }
            },
            /* Remove Event Listener */
            del_eventListener: function(obj, event, func) {
                if (obj && event && func) {
                    if (ByRei_dynDiv.cache.ie) {
                        obj.detachEvent("on" + event, func);
                    } else {
                        obj.removeEventListener(event, func, false);
                    }
                }
            },
            /* Add Event Listener */
            set_eventListener: function(obj, event, func) {
                if (obj && event && func) {
                    if (ByRei_dynDiv.cache.ie) {
                        return obj.attachEvent("on" + event, func);
                    } else {
                        return obj.addEventListener(event, func, false);
                    }
                }
            }

        };

        ByRei_dynDiv.set_eventListener(window, 'load', ByRei_dynDiv.init.main); // Add all Action after the page was loaded complet
})(window);