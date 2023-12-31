var qsProxy = {};

function FrameBuilder(formId, appendTo, initialHeight, iframeCode, title, embedStyleJSON) {
    this.formId = formId;
    this.initialHeight = initialHeight;
    this.iframeCode = iframeCode;
    this.frame = null;
    this.timeInterval = 200;
    this.appendTo = appendTo || false;
    this.formSubmitted = 0;
    this.frameMinWidth = '100%';
    this.defaultHeight = '';
    this.init = function () {
        this.embedURLHash = this.getMD5(window.location.href);
        if (embedStyleJSON && (embedStyleJSON[this.embedURLHash] && embedStyleJSON[this.embedURLHash]['inlineStyle']['embedWidth'])) {
            this.frameMinWidth = embedStyleJSON[this.embedURLHash]['inlineStyle']['embedWidth'] + 'px';
        }
        if (embedStyleJSON && (embedStyleJSON[this.embedURLHash])) {
            if (embedStyleJSON[this.embedURLHash]['inlineStyle'] && embedStyleJSON[this.embedURLHash]['inlineStyle']['embedHeight']) {
                this.defaultHeight = 'data-frameHeight="' + embedStyleJSON[this.embedURLHash]['inlineStyle']['embedHeight'] + '"';
            }
        }
        this.createFrame();
        this.addFrameContent(this.iframeCode);
    };
    this.createFrame = function () {
        var tmp_is_ie = !!window.ActiveXObject;
        this.iframeDomId = document.getElementById(this.formId) ? this.formId + '_' + new Date().getTime() : this.formId;
        var parent = document.getElementById('231767650122051_parent');
        if (parent) {
            this.iframeDomId = 'lightbox-' + this.iframeDomId;
        }
        var htmlCode = "<" + "iframe title=\"" + title.replace(/[\\"']/g, '\\$&').replace(/&amp;/g, '&') + "\" src=\"\" allowtransparency=\"true\" allow=\"geolocation; microphone; camera\" allowfullscreen=\"true\" name=\"" + this.formId + "\" id=\"" + this.iframeDomId + "\" style=\"width: 10px; min-width:" + this.frameMinWidth + "; display: block; overflow: hidden; height:" + this.initialHeight + "px; border: none;\" scrolling=\"no\"" + this.defaultHeight + "></if" + "rame>";
        if (this.appendTo === false) {
            document.write(htmlCode);
        } else {
            var tmp = document.createElement('div');
            tmp.innerHTML = htmlCode;
            var a = this.appendTo;
            document.getElementById(a).appendChild(tmp.firstChild);
        }
        this.frame = document.getElementById(this.iframeDomId);
        if (tmp_is_ie === true) {
            try {
                var iframe = this.frame;
                var doc = iframe.contentDocument ? iframe.contentDocument : (iframe.contentWindow.document || iframe.document);
                doc.open();
                doc.write("");
            } catch (err) {
                this.frame.src = "javascript:void((function(){document.open();document.domain=\'" + this.getBaseDomain() + "\';document.close();})())";
            }
        }
        this.addEvent(this.frame, 'load', this.bindMethod(this.setTimer, this));
        var self = this;
        if (window.chrome !== undefined) {
            this.frame.onload = function () {
                try {
                    var doc = this.contentWindow.document;
                    var _jotform = this.contentWindow.JotForm;
                    if (doc !== undefined) {
                        var form = doc.getElementById("" + self.iframeDomId);
                        self.addEvent(form, "submit", function () {
                            if (_jotform.validateAll()) {
                                self.formSubmitted = 1;
                            }
                        });
                    }
                } catch (e) {
                }
            }
        }
    };
    this.addEvent = function (obj, type, fn) {
        if (obj.attachEvent) {
            obj["e" + type + fn] = fn;
            obj[type + fn] = function () {
                obj["e" + type + fn](window.event);
            };
            obj.attachEvent("on" + type, obj[type + fn]);
        } else {
            obj.addEventListener(type, fn, false);
        }
    };
    this.addFrameContent = function (string) {
        if (window.location.search && window.location.search.indexOf('disableSmartEmbed') > -1) {
            string = string.replace(new RegExp('smartEmbed=1(?:&amp;|&)'), '');
            string = string.replace(new RegExp('isSmartEmbed'), '');
        } else {
            var cssLink = 'stylebuilder/' + this.formId + '.css';
            var cssPlace = string.indexOf(cssLink);
            var prepend = string[cssPlace + cssLink.length] === '?' ? '&amp;' : '?';
            var embedUrl = prepend + 'embedUrl=' + window.location.href;
            if (cssPlace > -1) {
                var positionLastRequestElement = string.indexOf('\"/>', cssPlace);
                if (positionLastRequestElement > -1) {
                    string = string.substr(0, positionLastRequestElement) + embedUrl + string.substr(positionLastRequestElement);
                    string = string.replace(cssLink, 'stylebuilder/' + this.formId + '/' + this.embedURLHash + '.css');
                }
            }
        }
        string = string.replace(new RegExp('src\\=\\"[^"]*captcha.php\"><\/scr' + 'ipt>', 'gim'), 'src="http://api.recaptcha.net/js/recaptcha_ajax.js"></scr' + 'ipt><' + 'div id="recaptcha_div"><' + '/div>' + '<' + 'style>#recaptcha_logo{ display:none;} #recaptcha_tagline{display:none;} #recaptcha_table{border:none !important;} .recaptchatable .recaptcha_image_cell, #recaptcha_table{ background-color:transparent !important; } <' + '/style>' + '<' + 'script defer="defer"> window.onload = function(){ Recaptcha.create("6Ld9UAgAAAAAAMon8zjt30tEZiGQZ4IIuWXLt1ky", "recaptcha_div", {theme: "clean",tabindex: 0,callback: function (){' + 'if (document.getElementById("uword")) { document.getElementById("uword").parentNode.removeChild(document.getElementById("uword")); } if (window["validate"] !== undefined) { if (document.getElementById("recaptcha_response_field")){ document.getElementById("recaptcha_response_field").onblur = function(){ validate(document.getElementById("recaptcha_response_field"), "Required"); } } } if (document.getElementById("recaptcha_response_field")){ document.getElementsByName("recaptcha_challenge_field")[0].setAttribute("name", "anum"); } if (document.getElementById("recaptcha_response_field")){ document.getElementsByName("recaptcha_response_field")[0].setAttribute("name", "qCap"); }}})' + ' }<' + '/script>');
        string = string.replace(/(type="text\/javascript">)\s+(validate\(\"[^"]*"\);)/, '$1 jTime = setInterval(function(){if("validate" in window){$2clearTimeout(jTime);}}, 1000);');
        if (string.match('#sublabel_litemode')) {
            string = string.replace('class="form-all"', 'class="form-all" style="margin-top:0;"');
        }
        var iframe = this.frame;
        var doc = iframe.contentDocument ? iframe.contentDocument : (iframe.contentWindow.document || iframe.document);
        doc.open();
        doc.write(string);
        setTimeout(function () {
            doc.close();
            try {
                if ('JotFormFrameLoaded' in window) {
                    JotFormFrameLoaded();
                }
            } catch (e) {
            }
        }, 200);
    };
    this.setTimer = function () {
        var self = this;
        this.interval = setTimeout(this.changeHeight.bind(this), this.timeInterval);
    };
    this.getBaseDomain = function () {
        var thn = window.location.hostname;
        var cc = 0;
        var buff = "";
        for (var i = 0; i < thn.length; i++) {
            var chr = thn.charAt(i);
            if (chr == ".") {
                cc++;
            }
            if (cc == 0) {
                buff += chr;
            }
        }
        if (cc == 2) {
            thn = thn.replace(buff + ".", "");
        }
        return thn;
    }
    this.changeHeight = function () {
        var actualHeight = this.getBodyHeight();
        var currentHeight = this.getViewPortHeight();
        var skipAutoHeight = (this.frame.contentWindow) ? this.frame.contentWindow.document.querySelector('[data-welcome-view="true"]') : null;
        if (actualHeight === undefined) {
            this.frame.style.height = this.frameHeight;
            if (!this.frame.style.minHeight) {
                this.frame.style.minHeight = "100vh";
                if (!('nojump' in this.frame.contentWindow.document.get)) {
                    window.parent.scrollTo(0, 0);
                }
            } else if (!this.frame.dataset.parentScrolled) {
                this.frame.dataset.parentScrolled = true;
                var container = window.parent.document && window.parent.document.querySelector('.jt-content');
                if (container && !('nojump' in window.parent.document.get)) {
                    container.scrollTo(0, 0);
                }
            }
        } else if (Math.abs(actualHeight - currentHeight) > 18 && !skipAutoHeight) {
            this.frame.style.height = (actualHeight) + "px";
        }
        this.setTimer();
    };
    this.bindMethod = function (method, scope) {
        return function () {
            method.apply(scope, arguments);
        };
    };
    this.frameHeight = 0;
    this.getBodyHeight = function () {
        if (this.formSubmitted === 1) {
            return;
        }
        var height;
        var scrollHeight;
        var offsetHeight;
        try {
            if (this.frame.contentWindow.document.height) {
                height = this.frame.contentWindow.document.height;
                if (this.frame.contentWindow.document.body.scrollHeight) {
                    height = scrollHeight = this.frame.contentWindow.document.body.scrollHeight;
                }
                if (this.frame.contentWindow.document.body.offsetHeight) {
                    height = offsetHeight = this.frame.contentWindow.document.body.offsetHeight;
                }
            } else if (this.frame.contentWindow.document.body) {
                if (this.frame.contentWindow.document.body.offsetHeight) {
                    height = offsetHeight = this.frame.contentWindow.document.body.offsetHeight;
                }
                var formWrapper = this.frame.contentWindow.document.querySelector('.form-all');
                var margin = parseInt(getComputedStyle(formWrapper).marginTop, 10);
                if (!isNaN(margin)) {
                    height += margin;
                }
            }
        } catch (e) {
        }
        this.frameHeight = height;
        return height;
    };
    this.getViewPortHeight = function () {
        if (this.formSubmitted === 1) {
            return;
        }
        var height = 0;
        try {
            if (this.frame.contentWindow.window.innerHeight) {
                height = this.frame.contentWindow.window.innerHeight - 18;
            } else if ((this.frame.contentWindow.document.documentElement) && (this.frame.contentWindow.document.documentElement.clientHeight)) {
                height = this.frame.contentWindow.document.documentElement.clientHeight;
            } else if ((this.frame.contentWindow.document.body) && (this.frame.contentWindow.document.body.clientHeight)) {
                height = this.frame.contentWindow.document.body.clientHeight;
            }
        } catch (e) {
        }
        return height;
    };
    this.getMD5 = function (s) {
        function L(k, d) {
            return (k << d) | (k >>> (32 - d))
        }

        function K(G, k) {
            var I, d, F, H, x;
            F = (G & 2147483648);
            H = (k & 2147483648);
            I = (G & 1073741824);
            d = (k & 1073741824);
            x = (G & 1073741823) + (k & 1073741823);
            if (I & d) {
                return (x ^ 2147483648 ^ F ^ H)
            }
            if (I | d) {
                if (x & 1073741824) {
                    return (x ^ 3221225472 ^ F ^ H)
                } else {
                    return (x ^ 1073741824 ^ F ^ H)
                }
            } else {
                return (x ^ F ^ H)
            }
        }

        function r(d, F, k) {
            return (d & F) | ((~d) & k)
        }

        function q(d, F, k) {
            return (d & k) | (F & (~k))
        }

        function p(d, F, k) {
            return (d ^ F ^ k)
        }

        function n(d, F, k) {
            return (F ^ (d | (~k)))
        }

        function u(G, F, aa, Z, k, H, I) {
            G = K(G, K(K(r(F, aa, Z), k), I));
            return K(L(G, H), F)
        }

        function f(G, F, aa, Z, k, H, I) {
            G = K(G, K(K(q(F, aa, Z), k), I));
            return K(L(G, H), F)
        }

        function D(G, F, aa, Z, k, H, I) {
            G = K(G, K(K(p(F, aa, Z), k), I));
            return K(L(G, H), F)
        }

        function t(G, F, aa, Z, k, H, I) {
            G = K(G, K(K(n(F, aa, Z), k), I));
            return K(L(G, H), F)
        }

        function e(G) {
            var Z;
            var F = G.length;
            var x = F + 8;
            var k = (x - (x % 64)) / 64;
            var I = (k + 1) * 16;
            var aa = Array(I - 1);
            var d = 0;
            var H = 0;
            while (H < F) {
                Z = (H - (H % 4)) / 4;
                d = (H % 4) * 8;
                aa[Z] = (aa[Z] | (G.charCodeAt(H) << d));
                H++
            }
            Z = (H - (H % 4)) / 4;
            d = (H % 4) * 8;
            aa[Z] = aa[Z] | (128 << d);
            aa[I - 2] = F << 3;
            aa[I - 1] = F >>> 29;
            return aa
        }

        function B(x) {
            var k = "", F = "", G, d;
            for (d = 0; d <= 3; d++) {
                G = (x >>> (d * 8)) & 255;
                F = "0" + G.toString(16);
                k = k + F.substr(F.length - 2, 2)
            }
            return k
        }

        function J(k) {
            k = k.replace(/rn/g, "n");
            var d = "";
            for (var F = 0; F < k.length; F++) {
                var x = k.charCodeAt(F);
                if (x < 128) {
                    d += String.fromCharCode(x)
                } else {
                    if ((x > 127) && (x < 2048)) {
                        d += String.fromCharCode((x >> 6) | 192);
                        d += String.fromCharCode((x & 63) | 128)
                    } else {
                        d += String.fromCharCode((x >> 12) | 224);
                        d += String.fromCharCode(((x >> 6) & 63) | 128);
                        d += String.fromCharCode((x & 63) | 128)
                    }
                }
            }
            return d
        }

        var C = Array();
        var P, h, E, v, g, Y, X, W, V;
        var S = 7, Q = 12, N = 17, M = 22;
        var A = 5, z = 9, y = 14, w = 20;
        var o = 4, m = 11, l = 16, j = 23;
        var U = 6, T = 10, R = 15, O = 21;
        s = J(s);
        C = e(s);
        Y = 1732584193;
        X = 4023233417;
        W = 2562383102;
        V = 271733878;
        for (P = 0; P < C.length; P += 16) {
            h = Y;
            E = X;
            v = W;
            g = V;
            Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
            V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
            W = u(W, V, Y, X, C[P + 2], N, 606105819);
            X = u(X, W, V, Y, C[P + 3], M, 3250441966);
            Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
            V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
            W = u(W, V, Y, X, C[P + 6], N, 2821735955);
            X = u(X, W, V, Y, C[P + 7], M, 4249261313);
            Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
            V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
            W = u(W, V, Y, X, C[P + 10], N, 4294925233);
            X = u(X, W, V, Y, C[P + 11], M, 2304563134);
            Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
            V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
            W = u(W, V, Y, X, C[P + 14], N, 2792965006);
            X = u(X, W, V, Y, C[P + 15], M, 1236535329);
            Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
            V = f(V, Y, X, W, C[P + 6], z, 3225465664);
            W = f(W, V, Y, X, C[P + 11], y, 643717713);
            X = f(X, W, V, Y, C[P + 0], w, 3921069994);
            Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
            V = f(V, Y, X, W, C[P + 10], z, 38016083);
            W = f(W, V, Y, X, C[P + 15], y, 3634488961);
            X = f(X, W, V, Y, C[P + 4], w, 3889429448);
            Y = f(Y, X, W, V, C[P + 9], A, 568446438);
            V = f(V, Y, X, W, C[P + 14], z, 3275163606);
            W = f(W, V, Y, X, C[P + 3], y, 4107603335);
            X = f(X, W, V, Y, C[P + 8], w, 1163531501);
            Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
            V = f(V, Y, X, W, C[P + 2], z, 4243563512);
            W = f(W, V, Y, X, C[P + 7], y, 1735328473);
            X = f(X, W, V, Y, C[P + 12], w, 2368359562);
            Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
            V = D(V, Y, X, W, C[P + 8], m, 2272392833);
            W = D(W, V, Y, X, C[P + 11], l, 1839030562);
            X = D(X, W, V, Y, C[P + 14], j, 4259657740);
            Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
            V = D(V, Y, X, W, C[P + 4], m, 1272893353);
            W = D(W, V, Y, X, C[P + 7], l, 4139469664);
            X = D(X, W, V, Y, C[P + 10], j, 3200236656);
            Y = D(Y, X, W, V, C[P + 13], o, 681279174);
            V = D(V, Y, X, W, C[P + 0], m, 3936430074);
            W = D(W, V, Y, X, C[P + 3], l, 3572445317);
            X = D(X, W, V, Y, C[P + 6], j, 76029189);
            Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
            V = D(V, Y, X, W, C[P + 12], m, 3873151461);
            W = D(W, V, Y, X, C[P + 15], l, 530742520);
            X = D(X, W, V, Y, C[P + 2], j, 3299628645);
            Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
            V = t(V, Y, X, W, C[P + 7], T, 1126891415);
            W = t(W, V, Y, X, C[P + 14], R, 2878612391);
            X = t(X, W, V, Y, C[P + 5], O, 4237533241);
            Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
            V = t(V, Y, X, W, C[P + 3], T, 2399980690);
            W = t(W, V, Y, X, C[P + 10], R, 4293915773);
            X = t(X, W, V, Y, C[P + 1], O, 2240044497);
            Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
            V = t(V, Y, X, W, C[P + 15], T, 4264355552);
            W = t(W, V, Y, X, C[P + 6], R, 2734768916);
            X = t(X, W, V, Y, C[P + 13], O, 1309151649);
            Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
            V = t(V, Y, X, W, C[P + 11], T, 3174756917);
            W = t(W, V, Y, X, C[P + 2], R, 718787259);
            X = t(X, W, V, Y, C[P + 9], O, 3951481745);
            Y = K(Y, h);
            X = K(X, E);
            W = K(W, v);
            V = K(V, g)
        }
        var i = B(Y) + B(X) + B(W) + B(V);
        return i.toLowerCase()
    };
    this.init();
}

FrameBuilder.get = qsProxy || [];
var i231767650122051 = new FrameBuilder("231767650122051", '231767650122051_parent', "", `<!DOCTYPE html>
<html lang="en">

<head>
  <!-- Required meta tags -->
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="">
  <meta name="author" content="">
  <link rel="icon" href="#">

  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/css/custom-extended.css">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/css/slick.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/css/slick-theme.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/css/fancybox.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/css/nouislider.min.css">

  <title>Kairos Payment</title>
</head>

<body>


<section class="range-slider">
  <div class="container-fluid px-5">
    <div class="row g-5">
      <div class="col-lg-6">
        <div class="potentila">
          <div class="annual-process">
            <div class="anual-hed">
              <h2>See how much <br>you can save with us</h2>
              <p>Use the calculator below to determine your potential <br>
                savings on an annual basis</p>
              <h5>Annual Credit Card Processing Volume</h5>
              <h3 id="spanValue">$50000</h3>
            </div>
            <div id="slider"></div>
          </div>
        </div>
      </div>


      <div class="col-lg-6 mt-5 mt-lg-0 pt-lg-0">
        <div class="position-relative ms-lg-5 mt-5">
          <div class="st-second">
          </div>
          <div class="saving-box">
          </div>

          <div class="potential-saving flip-card">
            <div class="flip-card-inner">
              <div class="flip-card-front">
                <div class="pot-hed">
                  <h2 id="saveValue"><sup>$</sup> 14100 <sub>/yr.</sub></h2>
                  <h4>Potential Annual Savings <br> with Kairos</h4>
                </div>
                <div class="pot-cont">
                  <p>Start saving towards your company success with credit card processing fees off your list</p>
                  <button onclick="{{redirect()}}">GET STARTED</button>
                </div>
              </div>
              <div class="flip-card-back ">
                <form>
                  <label>Name</label>
                  <input type="text" name="name">

                  <label>Email</label>
                  <input type="text" name="email">

                  <label>Message</label>
                  <textarea></textarea>
                  <button type="submit">Submit</Button>
                </form>
              </div>
            </div>


          </div>
        </div>


      </div>


    </div>
  </div>

</section>


<script>
    var rangeInput = document.getElementById("rangeInput");
    var spanValue = document.getElementById("spanValue");
    var saveValue = document.getElementById("saveValue");

    rangeInput.addEventListener("input", function () {
        var value = parseInt(rangeInput.value);
        var updatedValue = Math.round(value * 0.03);
        spanValue.textContent = "$" + value.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
        saveValue.innerHTML = "<sup>$</sup>" + updatedValue.toString() + " <sub>/yr.</sub>";
    });

    function redirect() {
        window.open('https://www.kairospayments.com/application', '_blank');
    }
</script>


<script src="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/js/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/js/bootstrap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
        crossorigin="anonymous"></script>

<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js"
        integrity="sha384-7+zCNj/IqJ95wo16oMtfsKbZ9ccEh31eOz1HGyDuCQ6wgnyJNSYdrPa03rtR1zdB"
        crossorigin="anonymous"></script>

<!-- <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js" integrity="sha384-QJHtvGhmr9XOIpI6YVutG+2QOK9T+ZnN4kzFN1RtK3zEFEIsxhlmWl5/YESvpZ13" crossorigin="anonymous"></script> -->

<script src="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/js/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/js/slick.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/js/fontawesome.js"></script>
<script src="https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/js/wNumb.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/js/nouislider.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/RayVelez27/sliderforkairos@master/js/custom.js"></script>
<script>
    var slider = document.getElementById('slider');
    var range = {
        'min': 50000,
        '20%': 250000,
        '40%': 500000,
        '60%': 1000000,
        'max': 5000000
    }
    noUiSlider.create(slider, {
        range: range,
        start: 50000,
        connect: [!0, !1],
        pips: {
            mode: 'range',
            density: 3,
            format: wNumb({
                decimals: 0,
                thousand: ',',
                prefix: '$'
            })
        },
    });
    slider.noUiSlider.on('update', function (e, n) {
        var value = parseInt(e[n]);
        // console.log(e, n)
        var updatedValue = Math.round(value * 0.03);
        spanValue.textContent = "$" + value.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
        saveValue.innerHTML = "<sup>$</sup>" + updatedValue.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",") + " <sub>/yr.</sub>";
    });
</script>
</body>

</html>`, "KAIROS Payments Quick Apps", Array);
(function () {
    window.handleIFrameMessage = function (e) {
        if (!e.data || !e.data.split) return;
        var args = e.data.split(":");
        if (args[2] != "231767650122051") {
            return;
        }
        var iframe = document.getElementById("231767650122051");
        if (!iframe) {
            return
        }
        ;
        switch (args[0]) {
            case"scrollIntoView":
                if (!("nojump" in FrameBuilder.get)) {
                    iframe.scrollIntoView();
                }
                break;
            case"setHeight":
                var height = args[1] + "px";
                if (window.jfDeviceType === 'mobile' && typeof $jot !== 'undefined') {
                    var parent = $jot(iframe).closest('#231767650122051_parent');
                    if (parent) {
                        height = '100%';
                    }
                }
                iframe.style.height = height
                break;
            case"setMinHeight":
                iframe.style.minHeight = args[1] + "px";
                break;
            case"collapseErrorPage":
                if (iframe.clientHeight > window.innerHeight) {
                    iframe.style.height = window.innerHeight + "px";
                }
                break;
            case"reloadPage":
                if (iframe) {
                    location.reload();
                }
                break;
            case"removeIframeOnloadAttr":
                iframe.removeAttribute("onload");
                break;
            case"loadScript":
                if (!window.isPermitted(e.origin, ['jotform.com', 'jotform.pro'])) {
                    break;
                }
                var src = args[1];
                if (args.length > 3) {
                    src = args[1] + ':' + args[2];
                }
                var script = document.createElement('script');
                script.src = src;
                script.type = 'text/javascript';
                document.body.appendChild(script);
                break;
            case"exitFullscreen":
                if (window.document.exitFullscreen) window.document.exitFullscreen(); else if (window.document.mozCancelFullScreen) window.document.mozCancelFullScreen(); else if (window.document.mozCancelFullscreen) window.document.mozCancelFullScreen(); else if (window.document.webkitExitFullscreen) window.document.webkitExitFullscreen(); else if (window.document.msExitFullscreen) window.document.msExitFullscreen();
                break;
            case'setDeviceType':
                window.jfDeviceType = args[1];
                break;
            case"backgroundStyles":
                const backgroundStyles = new URLSearchParams(args[1]);
                backgroundStyles.forEach(function (value, key) {
                    iframe.style[key] = value;
                });
                var doc = iframe.contentDocument ? iframe.contentDocument : (iframe.contentWindow.document || iframe.document);
                doc.documentElement.style.background = 'none';
                break;
        }
    };
    window.isPermitted = function (originUrl, whitelisted_domains) {
        var url = document.createElement('a');
        url.href = originUrl;
        var hostname = url.hostname;
        var result = false;
        if (typeof hostname !== 'undefined') {
            whitelisted_domains.forEach(function (element) {
                if (hostname.slice((-1 * element.length - 1)) === '.'.concat(element) || hostname === element) {
                    result = true;
                }
            });
            return result;
        }
    };
    if (window.addEventListener) {
        window.addEventListener("message", handleIFrameMessage, false);
    } else if (window.attachEvent) {
        window.attachEvent("onmessage", handleIFrameMessage);
    }
})();