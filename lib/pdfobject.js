/*
    PDFObject v2.1.1
    https://github.com/pipwerks/PDFObject
    Copyright (c) 2008-2018 Philip Hutchison
    MIT-style license: http://pipwerks.mit-license.org/

    Bundled locally to comply with Chrome Extension Manifest V3 requirements.
    No remotely hosted code is allowed in MV3 extensions.
*/

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory();
  } else {
    // Browser global
    root.PDFObject = factory();
  }
}(this, function () {
  "use strict";

  // Return false if not in browser environment
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  var pdfobjectversion = "2.1.1";
  var ua = window.navigator.userAgent;

  // Detects browser support for PDFs
  var supportsPdfMimeType = (typeof navigator.mimeTypes['application/pdf'] !== "undefined");

  var isModernBrowser = (function () {
    return (typeof window.Promise !== "undefined");
  })();

  var isFirefox = (function () {
    return (ua.indexOf("irefox") !== -1);
  })();

  var isFirefoxWithPDFJS = (function () {
    if (!isFirefox) { return false; }
    return (parseInt(ua.split("rv:")[1].split(".")[0], 10) > 18);
  })();

  var isIOS = (function () {
    return (/iphone|ipad|ipod/i.test(ua.toLowerCase()));
  })();

  var isIE = function () {
    return !!(window.ActiveXObject || "ActiveXObject" in window);
  };

  var createAXO = function (type) {
    var ax;
    try {
      ax = new ActiveXObject(type);
    } catch (e) {
      ax = null;
    }
    return ax;
  };

  var supportsPdfActiveX = function () {
    return !!(createAXO("AcroPDF.PDF") || createAXO("PDF.PdfCtrl"));
  };

  var supportsPDFs = (!isIOS && (isFirefoxWithPDFJS || supportsPdfMimeType || (isIE() && supportsPdfActiveX())));

  // Creates URL fragment for PDF open parameters
  var buildFragmentString = function (pdfParams) {
    var string = "";
    var prop;

    if (pdfParams) {
      for (prop in pdfParams) {
        if (pdfParams.hasOwnProperty(prop)) {
          string += encodeURIComponent(prop) + "=" + encodeURIComponent(pdfParams[prop]) + "&";
        }
      }
      if (string) {
        string = "#" + string;
        string = string.slice(0, string.length - 1);
      }
    }

    return string;
  };

  var log = function (msg) {
    if (typeof console !== "undefined" && console.log) {
      console.log("[PDFObject] " + msg);
    }
  };

  var embedError = function (msg) {
    log(msg);
    return false;
  };

  var getTargetElement = function (targetSelector) {
    var targetNode = document.body;

    if (typeof targetSelector === "string") {
      targetNode = document.querySelector(targetSelector);
    } else if (typeof jQuery !== "undefined" && targetSelector instanceof jQuery && targetSelector.length) {
      targetNode = targetSelector.get(0);
    } else if (typeof targetSelector.nodeType !== "undefined" && targetSelector.nodeType === 1) {
      targetNode = targetSelector;
    }

    return targetNode;
  };

  var generatePDFJSiframe = function (targetNode, url, pdfOpenFragment, PDFJS_URL, id) {
    var fullURL = PDFJS_URL + "?file=" + encodeURIComponent(url) + pdfOpenFragment;
    var scrollfix = (isIOS) ? "-webkit-overflow-scrolling: touch; overflow-y: scroll; " : "overflow: hidden; ";
    var iframe = "<div style='" + scrollfix + "position: absolute; top: 0; right: 0; bottom: 0; left: 0;'><iframe  " + id + " src='" + fullURL + "' style='border: none; width: 100%; height: 100%;' frameborder='0'></iframe></div>";

    targetNode.className += " pdfobject-container";
    targetNode.style.position = "relative";
    targetNode.style.overflow = "auto";
    targetNode.innerHTML = iframe;

    return targetNode.getElementsByTagName("iframe")[0];
  };

  var generateEmbedElement = function (targetNode, targetSelector, url, pdfOpenFragment, width, height, id) {
    var style = "";

    if (targetSelector && targetSelector !== document.body) {
      style = "width: " + width + "; height: " + height + ";";
    } else {
      style = "position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%;";
    }

    targetNode.className += " pdfobject-container";
    targetNode.innerHTML = "<embed " + id + " class='pdfobject' src='" + url + pdfOpenFragment + "' type='application/pdf' style='overflow: auto; " + style + "'/>";

    return targetNode.getElementsByTagName("embed")[0];
  };

  var embed = function (url, targetSelector, options) {
    // Validate URL
    if (typeof url !== "string") {
      return embedError("URL is not valid");
    }

    targetSelector = (typeof targetSelector !== "undefined") ? targetSelector : false;
    options = (typeof options !== "undefined") ? options : {};

    var id = (options.id && typeof options.id === "string") ? "id='" + options.id + "'" : "";
    var page = (options.page) ? options.page : false;
    var pdfOpenParams = (options.pdfOpenParams) ? options.pdfOpenParams : {};
    var fallbackLink = (typeof options.fallbackLink !== "undefined") ? options.fallbackLink : true;
    var width = (options.width) ? options.width : "100%";
    var height = (options.height) ? options.height : "100%";
    var assumptionMode = (typeof options.assumptionMode === "boolean") ? options.assumptionMode : true;
    var forcePDFJS = (typeof options.forcePDFJS === "boolean") ? options.forcePDFJS : false;
    var PDFJS_URL = (options.PDFJS_URL) ? options.PDFJS_URL : false;
    var targetNode = getTargetElement(targetSelector);
    var fallbackHTML = "";
    var pdfOpenFragment = "";
    var fallbackHTML_default = "<p>This browser does not support inline PDFs. Please download the PDF to view it: <a href='[url]'>Download PDF</a></p>";

    if (!targetNode) {
      return embedError("Target element cannot be determined");
    }

    if (page) {
      pdfOpenParams.page = page;
    }

    pdfOpenFragment = buildFragmentString(pdfOpenParams);

    // If forcing PDF.js, use it
    if (forcePDFJS && PDFJS_URL) {
      return generatePDFJSiframe(targetNode, url, pdfOpenFragment, PDFJS_URL, id);
    }
    // If browser supports PDFs natively or we assume it does
    else if (supportsPDFs || (assumptionMode && isModernBrowser && !isIOS)) {
      return generateEmbedElement(targetNode, targetSelector, url, pdfOpenFragment, width, height, id);
    }
    // Fallback to PDF.js if available
    else if (PDFJS_URL) {
      return generatePDFJSiframe(targetNode, url, pdfOpenFragment, PDFJS_URL, id);
    }
    // No PDF support, show fallback link
    else {
      if (fallbackLink) {
        fallbackHTML = (typeof fallbackLink === "string") ? fallbackLink : fallbackHTML_default;
        targetNode.innerHTML = fallbackHTML.replace(/\[url\]/g, url);
      }
      return embedError("This browser does not support embedded PDFs");
    }
  };

  // Public API
  return {
    embed: function (a, b, c) {
      return embed(a, b, c);
    },
    pdfobjectversion: (function () {
      return pdfobjectversion;
    })(),
    supportsPDFs: (function () {
      return supportsPDFs;
    })()
  };
}));
