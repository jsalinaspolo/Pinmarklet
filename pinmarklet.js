/* author: javiers
Usage:
 use the pinterestButton.tag
   OR
 in the html include a pin button
 <a id="pinterest" href="#"><img src="/ps/images/pinterest/PinExt.png"/></a>

 attach a click event handler to the button, and use this as the handler logic:
 $("#pinterest").click(function (){
    UTIL.pinterest.addPinMarklet({images : imgArray});
    return false;
 })
 
     OR giving a function onPin (for example events for GA
 $("#pinterest").click(function (){
    UTIL.pinterest.addPinMarklet({
    images : imgArray,
    onPin : function(){
            console.log("onPin event you can execute whatever you need");
        }
    });
    return false;
 })

Example:
  index.html
 */
var UTIL = UTIL || {};
(function ($) {
    "use strict";
    UTIL.pinterest = (function () {
        var pinmarkletConfig = {
            idroot : "PIN",
            pin : "http://pinterest.com/pin/create/button/",
            minImgSize : 80,
            thumbCellSize : 200,
            altRegex : {
                defaultString : /^picture\.*/
            },
            msg : {
                cancelTitle : "Cancel",
                defaultAlt : "I found this on yoursite"
            },
            pop : "status=no,resizable=no,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,width=632,height=270,left=0,top=0",
            rules : [
                "#_bg {position:fixed;z-index:8675309; top:0; right:0; bottom:0; left:0; background-color:#f2f2f2; opacity:.95; }",
                "#_bd {position: absolute; text-align: center; padding-top: 36px; top: 0; left: 0; right: 0; z-index:8675320; font:16px hevetica neue,arial,san-serif; }",
                "#_hd { z-index:2147483643; -moz-box-shadow: 0 1px 2px #aaa; -webkit-box-shadow: 0 1px 2px #aaa; box-shadow: 0 1px 2px #aaa; position: fixed; *position:absolute; width:100%; top: 0; left: 0; right: 0; height: 45px; line-height: 45px; font-size: 14px; font-weight: bold; display: block; margin: 0; background: #fbf7f7; border-bottom: 1px solid #aaa; }",
                "#_hd #_logo {height: 43px; width: 100px; display: inline-block; margin-right: -100px; background: transparent url(images/LogoRed.png) 50% 50% no-repeat; border: none;}",
                "#_hd a#_x { display: inline-block; cursor: pointer; color: #524D4D; line-height: 45px; text-shadow: 0 1px #fff; float: right; text-align: center; width: 100px; border-left: 1px solid #aaa; }",
                "#_hd a#_x:hover { color: #524D4D; background: #e1dfdf; text-decoration: none; }",
                "#_hd a#_x:active { color: #fff; background: #cb2027; text-decoration: none; text-shadow:none;}",
                "#_bd span { zoom:1; display: inline-block; background: #fff; height:200px; width:200px; border: 1px solid #ddd; border-top: none; border-left:none; text-decoration: none;  text-shadow: 0 1px #fff; position: relative; cursor: pointer; vertical-align:middle;  }",
                "#_bd a img {max-height:100%; max-width:100%; top: 50%; left: 50%; position: absolute; }",
                "#_bd span._pinContainer cite, #_bd span._pinContainer cite span { z-index: 1; position: absolute; bottom: 0; left: 0; right: 0; width: 200px; color: #000; height: 22px; line-height: 24px; font-size: 10px; font-style: normal; text-align: center; overflow: hidden; }",
                "#_bd span._pinContainer {z-index: 1; height: 200px; width: 200px; background: #fff; }",
                "#_bd span._pinButton {z-index: 2; height: 200px; width: 200px; background: transparent url(images/button.png) 50% 50% no-repeat; position:absolute; top:0; left:0; display:none; }",
                "#_bd span._pinButton:hover {background-color: rgba(0, 0, 0, 0.5);}" ]
        }, pinmarkletPrep = function (win, doc, nav, config) {
            var global = win[config.idroot] = {
                win : win,
                doc : doc,
                nav : nav,
                config : config,
                structure : {},
                onPin : undefined,
                fns : {
                    callback : [],
                    make : function (elements) {
                        var newElement = false, element, child;
                        for (element in elements) {
                            if (elements[element].hasOwnProperty) {
                                newElement = global.doc.createElement(element);
                                for (child in elements[element]) {
                                    if (elements[element][child].hasOwnProperty && typeof elements[element][child] === "string") {
                                        newElement[child] = elements[element][child];
                                    }
                                }
                                break;
                            }
                        }
                        return newElement;
                    },
                    listen : function (tag, event, handle) {
                        if (global.win.addEventListener !== undefined) {
                            tag.addEventListener(event, handle, false);
                        } else if (global.win.attachEvent !== undefined) {
                            tag.attachEvent("on" + event, handle);
                        }
                    },
                    pin : function (link) {
                        var img = link.getElementsByTagName("IMG")[0],
                            params = global.config.pin + "?";
                        params = params + "media=" + encodeURIComponent(img.src);
                        params = params + "&url=" + encodeURIComponent(img.getAttribute("url") || global.doc.URL);
                        params = params + "&title=" + encodeURIComponent(global.doc.title);
                        params = params + "&description=" + encodeURIComponent(img.title || img.alt);
                        if ($.isFunction(global.onPin)) {
                            global.onPin.call();
                        }
                        global.win.open(params, "pin", global.config.pop);
                    },
                    close : function (msg) {
                        if (global.structure.bg) {
                            // remove elements from page
                            $(global.structure.bg).remove();
                            $(global.structure.bd).remove();
                        }
                        win.hasPinningNow = false;
                        if (msg) {
                            global.win.alert(msg);
                        }
                        // scroll to the position Y that was before
                        global.win.scroll(0, global.values.saveScrollTop);
                    },
                    click : function (b) {
                        b = b || global.win.event;
                        var clicked = b.target ? b.target.nodeType === 3 ? b.target.parentNode : b.target : b.srcElement;
                        if (clicked) {
                            // if press the button cancel or in the background close
                            if (clicked === global.structure.x) {
                                global.fns.close();
                            } else if (clicked.parentNode.className === global.config.idroot + "_pinContainer" || clicked.className === global.config.idroot + "_pinButton") {
                                global.fns.pin(clicked.parentNode.getElementsByTagName("A")[0]);
                                global.win.setTimeout(function () {
                                    global.fns.close();
                                }, 10);
                            } else if ((clicked === global.structure.bd && clicked !== global.structure.hd) || clicked === global.structure.bg) {
                                global.fns.close();
                            }
                        }
                    },
                    behavior : function () {
                        global.fns.listen(global.structure.bd, "click", global.fns.click);
                        global.fns.listen(global.structure.bg, "click", global.fns.click);
                    },
                    presentation : function () {
                        var cssTag = global.fns.make({
                            STYLE : {
                                type : "text/css"
                            }
                        }), css = global.config.rules.join("\n").replace(/#_/g, "#" + config.idroot + "_").replace(/\._/g, "." + config.idroot + "_");
                        if (cssTag.styleSheet) {
                            cssTag.styleSheet.cssText = css;
                        } else {
                            $(cssTag).append(global.doc.createTextNode(css));
                        }
                        $('head').append(cssTag);
                    },
                    thumb : function (src, height, width, alt, url) {
                        var container, cite, citeText, link, image;
                        container = global.fns.make({
                            SPAN : {
                                className : global.config.idroot + "_pinContainer"
                            }
                        });
                        link = global.fns.make({
                            A : {
                                rel : "image"
                            }
                        });
                        image = new Image();
                        image.style.visibility = "hidden";
                        if (alt) {
                            image.title = alt;
                        }
                        if (url) {
                            image.setAttribute("url", url);
                        }
                        image.onload = function () {
                            global.fns.resizeImages(this);
                        };
                        image.src = src;
                        $(link).append(image);
                        cite = global.fns.make({
                            CITE : {}
                        });
                        $(cite).append(global.fns.make({
                            span : {
                                className : global.config.idroot + "_mask"
                            }
                        }));
                        citeText = height + " x " + width;
                        citeText = global.fns.make({
                            span : {
                                innerHTML : citeText
                            }
                        });
                        $(cite).append(citeText);
                        $(link).append(cite);
                        $(container).append(link);
                        $(container).append(global.fns.make({
                            SPAN : {
                                className : global.config.idroot + "_pinButton"
                            }
                        }));
                        // add event on pictures for display button on IE
                        $("span[class$='_pinContainer']").live("mouseover", function () {
                            $(this).find("span[class$='_pinButton']").show();
                        });
                        $("span[class$='_pinContainer']").live("mouseout", function () {
                            $(this).find("span[class$='_pinButton']").hide();
                        });
                        $(global.structure.bd).append(container);
                    },
                    resizeImages : function (img) {
                        var maxWidth = global.config.thumbCellSize, // Max width for the image
                            maxHeight = global.config.thumbCellSize, // Max height for the image
                            width = img.width, // Current image width
                            height = img.height, // Current image height
                            ratio;
                        if (width >= height) {
                            // Check if the current width is larger than the max
                            if (width > maxWidth) {
                                ratio = maxWidth / width; // get ratio for scaling image
                                img.style.width = maxWidth; // Set new width
                                img.style.height = height * ratio; // Scale height based on ratio
                                height = height * ratio; // Reset height to match scaled image
                                width = maxWidth;
                            }
                        } else {
                            // Check if current height is larger than max
                            if (height > maxHeight) {
                                ratio = maxHeight / height; // get ratio for scaling image
                                img.style.height = maxHeight; // Set new height
                                img.style.width = width * ratio; // Scale width based on ratio
                                width = width * ratio; // Reset width to match scaled image
                                height = maxHeight;
                            }
                        }
                        img.style.marginTop = height < global.config.thumbCellSize
                            ? -height / 2 + "px"
                            : "-" + global.config.thumbCellSize / 2 + "px";
                        img.style.marginLeft = width < global.config.thumbCellSize
                            ? -width / 2 + "px"
                            : "-" + global.config.thumbCellSize / 2 + "px";
                        img.removeAttribute('width');
                        img.removeAttribute('height');
                        img.style.visibility = "";
                    },
                    structure : function () {
                        // create DIV opacity
                        global.structure.bg = global.fns.make({
                            DIV : {
                                id : global.config.idroot + "_bg"
                            }
                        });
                        $(global.doc.body).append(global.structure.bg);
                        // create container
                        global.structure.bd = global.fns.make({
                            DIV : {
                                id : global.config.idroot + "_bd"
                            }
                        });
                        // create header
                        global.structure.hd = global.fns.make({
                            DIV : {
                                id : global.config.idroot + "_hd"
                            }
                        });
                        global.structure.x = global.fns.make({
                            A : {
                                id : global.config.idroot + "_x",
                                innerHTML : global.config.msg.cancelTitle
                            }
                        });
                        global.structure.hd.appendChild(global.fns.make({
                            SPAN : {
                                id : global.config.idroot + "_logo"
                            }
                        }));
                        $(global.structure.hd).append(global.structure.x);
                        $(global.structure.bd).append(global.structure.hd);
                        $(global.doc.body).append(global.structure.bd);
                        global.win.scroll(0, 0);
                    },
                    checkParamImages : function (img, callback) {
                        var imgChecksComplete = 0, imgChecksRequested = 0, oneImageCheckComplete = function () {
                            imgChecksComplete += 1;
                            if (imgChecksComplete === imgChecksRequested) {
                                callback();
                            }
                        }, max, i;
                        // load images
                        for (i = 0, max = img.length; i < max; i += 1) {
                            imgChecksRequested += 1;
                            global.fns.loadParamImage(img[i], oneImageCheckComplete);
                        }
                        // edge case: nothing to check, so exhibit synchronous behavior
                        if (imgChecksRequested === 0) {
                            callback();
                        }
                    },
                    loadParamImage : function (img, callback) {
                        var imgPin = new Image();
                        imgPin.onload = function () {
                            // validate size image
                            if (imgPin.height > global.config.minImgSize && imgPin.width > global.config.minImgSize) {
                                global.fns.thumb(imgPin.src, imgPin.height, imgPin.width, imgPin.alt);
                            }
                            callback();
                        };
                        imgPin.src = img.src;
                        // assign the alt information for the description on pinterest
                        if (img.alt.toLowerCase().match(global.config.altRegex.defaultString)) {
                            imgPin.alt = global.config.msg.defaultAlt;
                        } else {
                            imgPin.alt = img.alt;
                        }
                    },
                    init : function (params) {
                        if (!win.hasPinningNow) {
                            global.values = {
                                // save the Y scroll position
                                saveScrollTop : global.win.pageYOffset
                            };
                            global.fns.structure();
                            global.fns.presentation();
                            if (params) {
                                global.onPin = params.onPin;
                                global.fns.behavior();
                                global.fns.checkParamImages(params.images,
                                    function () {
                                        win.hasPinningNow = true;
                                    });
                            }
                        }
                    }
                }
            };
            return {
                initPinMarklet : global.fns.init
            };
        };
        return {
            addPinMarklet : pinmarkletPrep(window, document, navigator, pinmarkletConfig).initPinMarklet
        };
    }());
}(jQuery));
